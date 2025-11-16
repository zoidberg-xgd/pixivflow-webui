/**
 * 后端服务管理模块
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { safeLog, safeError, setAppClosing: setLoggerAppClosing } = require('../utils/logger');
const { safeSetTimeout, setAppClosing: setTimersAppClosing } = require('../utils/timers');
const { getProjectRoot, initializeAppData, validatePath } = require('../utils/paths');
const { checkPortInUse, cleanupPort } = require('../utils/port');
const { app } = require('electron');

const BACKEND_PORT = 3000;
const MAX_BACKEND_RESTARTS = 5;

class BackendService {
  constructor() {
    this.backendProcess = null;
    this.actualBackendPort = BACKEND_PORT;
    this.isBackendStarting = false;
    this.backendRestartCount = 0;
    this.backendReadyState = false;
    this.mainWindow = null;
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  async startBackend() {
    // 如果正在启动中，跳过
    if (this.isBackendStarting) {
      safeLog('⚠️  后端正在启动中，跳过重复启动');
      return;
    }

    // 如果后端进程已存在，先停止它
    if (this.backendProcess) {
      safeLog('⚠️  后端进程已存在，先停止现有进程...');
      await this.stopBackend();
      await new Promise((resolve) => safeSetTimeout(resolve, 1000));
    }

    // 检查重启次数限制
    if (this.backendRestartCount >= MAX_BACKEND_RESTARTS) {
      safeError(`❌ 后端重启次数已达上限 (${MAX_BACKEND_RESTARTS})，停止自动重启`);
      if (this.mainWindow) {
        this.mainWindow.webContents.send(
          'backend-error',
          `后端服务器启动失败，已尝试 ${MAX_BACKEND_RESTARTS} 次。请检查日志并手动重启应用。`
        );
      }
      return;
    }

    this.isBackendStarting = true;
    this.backendRestartCount++;

    safeLog(`🔧 准备启动后端服务器 (尝试 ${this.backendRestartCount}/${MAX_BACKEND_RESTARTS})...`);

    // 检查并清理端口
    const portInUse = await new Promise((resolve) => {
      checkPortInUse(BACKEND_PORT, (inUse) => {
        resolve(inUse);
      });
    });

    if (portInUse) {
      safeLog(`⚠️  端口 ${BACKEND_PORT} 被占用，开始清理...`);
      const portCleaned = await cleanupPort(BACKEND_PORT);
      if (portCleaned) {
        safeLog('✅ 端口清理成功');
        await new Promise((resolve) => safeSetTimeout(resolve, 1000));
      }
    }

    // 启动后端进程
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    
    if (isDev) {
      await this.startBackendDev();
    } else {
      await this.startBackendProd();
    }
  }

  async startBackendDev() {
    // __dirname = electron/services
    // ../.. = pixivflow-webui
    const webuiRoot = path.resolve(__dirname, '../..'); // pixivflow-webui
    const pixivRoot = path.resolve(webuiRoot, '..'); // pixiv
    const projectRoot = path.join(pixivRoot, 'PixivFlow'); // PixivFlow
    
    if (!fs.existsSync(projectRoot)) {
      safeError(`❌ 项目根目录不存在: ${projectRoot}`);
      return;
    }

    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      safeError(`❌ package.json 不存在: ${packageJsonPath}`);
      return;
    }

    // 初始化应用数据目录
    let appData = initializeAppData();
    if (!appData) {
      safeError('❌ 应用数据目录未初始化');
      return;
    }

    const frontendDistPath = path.join(webuiRoot, 'dist');
    const staticPath = fs.existsSync(frontendDistPath) ? frontendDistPath : undefined;

    const backendDistPath = path.join(projectRoot, 'dist', 'webui', 'index.js');
    const needsBuild = !fs.existsSync(backendDistPath);

    safeLog(`🔧 开发模式：启动后端服务器`);
    safeLog(`📁 项目根目录: ${projectRoot}`);
    safeLog(`📁 配置文件路径: ${appData.configPath}`);
    if (staticPath) {
      safeLog(`📁 静态文件路径: ${staticPath}`);
    }

    const env = {
      ...process.env,
      STATIC_PATH: staticPath,
      PIXIV_DOWNLOADER_CONFIG: appData.configPath,
    };

    try {
      if (!needsBuild) {
        safeLog(`🚀 启动后端: node ${backendDistPath}`);
        this.backendProcess = spawn('node', [backendDistPath], {
          cwd: projectRoot,
          shell: false,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: env,
        });
      } else {
        safeLog(`🚀 启动后端: npm run webui`);
        this.backendProcess = spawn('npm', ['run', 'webui'], {
          cwd: projectRoot,
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: env,
        });
      }

      this.setupBackendProcessHandlers();
    } catch (error) {
      this.isBackendStarting = false;
      safeError('❌ 无法启动后端进程:', error);
      if (this.mainWindow) {
        this.mainWindow.webContents.send('backend-error', `无法启动后端进程: ${error.message}`);
      }
    }
  }

  async startBackendProd() {
    const resourcesPath = process.resourcesPath || __dirname;
    
    // 查找 pixivflow 后端
    // 优先查找通过 extraResources 复制的 pixivflow（新方式，更快）
    const pixivflowModulePath = path.join(resourcesPath, 'pixivflow');
    
    safeLog('🔍 查找 pixivflow 后端...');
    safeLog(`   查找路径: ${pixivflowModulePath}`);
    
    let backendPath = null;
    let backendCwd = null;
    
    if (fs.existsSync(pixivflowModulePath)) {
      // 找到了通过 extraResources 复制的 pixivflow（推荐方式）
      safeLog('✅ 找到 pixivflow 模块（extraResources）');
      
      // 读取 pixivflow 的 package.json 以确定入口文件
      const pixivflowPackageJson = path.join(pixivflowModulePath, 'package.json');
      if (fs.existsSync(pixivflowPackageJson)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pixivflowPackageJson, 'utf8'));
          safeLog(`   版本: ${pkg.version}`);
          
          // 检查是否有 bin 命令
          if (pkg.bin && pkg.bin.pixivflow) {
            backendPath = path.join(pixivflowModulePath, pkg.bin.pixivflow);
            safeLog(`   使用 bin 命令: ${pkg.bin.pixivflow}`);
          } else if (pkg.bin && typeof pkg.bin === 'string') {
            backendPath = path.join(pixivflowModulePath, pkg.bin);
            safeLog(`   使用 bin 命令: ${pkg.bin}`);
          } else {
            // 使用 main 入口
            const mainEntry = pkg.main || 'index.js';
            backendPath = path.join(pixivflowModulePath, mainEntry);
            safeLog(`   使用 main 入口: ${mainEntry}`);
          }
          
          backendCwd = pixivflowModulePath;
        } catch (error) {
          safeError('❌ 读取 pixivflow package.json 失败:', error);
          return;
        }
      } else {
        safeError('❌ pixivflow package.json 不存在');
        return;
      }
    } else {
      // 回退：查找通过旧的 afterPack 方式安装的 pixivflow
      const legacyPixivflowPath = path.join(resourcesPath, 'backend', 'node_modules', 'pixivflow');
      safeLog(`⚠️  未找到 extraResources 中的 pixivflow，尝试旧路径: ${legacyPixivflowPath}`);
      
      if (fs.existsSync(legacyPixivflowPath)) {
        safeLog('✅ 找到 pixivflow 模块（旧方式）');
        const pixivflowPackageJson = path.join(legacyPixivflowPath, 'package.json');
        if (fs.existsSync(pixivflowPackageJson)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pixivflowPackageJson, 'utf8'));
            safeLog(`   版本: ${pkg.version}`);
            
            if (pkg.bin && pkg.bin.pixivflow) {
              backendPath = path.join(legacyPixivflowPath, pkg.bin.pixivflow);
            } else if (pkg.bin && typeof pkg.bin === 'string') {
              backendPath = path.join(legacyPixivflowPath, pkg.bin);
            } else {
              const mainEntry = pkg.main || 'index.js';
              backendPath = path.join(legacyPixivflowPath, mainEntry);
            }
            backendCwd = legacyPixivflowPath;
          } catch (error) {
            safeError('❌ 读取 pixivflow package.json 失败:', error);
            return;
          }
        }
      } else {
        // 最后回退到旧的方式（从 resources/dist 加载）
        safeLog('⚠️  未找到 pixivflow 模块，尝试使用旧的后端路径');
        backendPath = path.join(resourcesPath, 'dist', 'webui', 'index.js');
        backendCwd = resourcesPath;
        
        if (!fs.existsSync(backendPath)) {
          safeError('❌ 后端文件不存在:', backendPath);
          safeError('提示: 请确保构建时正确安装了 pixivflow');
          return;
        }
      }
    }
    
    safeLog(`🚀 后端路径: ${backendPath}`);
    safeLog(`📁 工作目录: ${backendCwd}`);

    // 初始化应用数据目录
    let appData = initializeAppData();
    if (!appData) {
      safeError('❌ 应用数据目录未初始化');
      return;
    }

    // 前端静态文件路径
    // 尝试多个可能的位置
    let staticPath = null;
    const possibleStaticPaths = [
      path.join(resourcesPath, 'webui-dist'),
      path.join(resourcesPath, '..', 'app.asar.unpacked', 'dist'),
      path.join(resourcesPath, 'dist'),
    ];
    
    for (const possiblePath of possibleStaticPaths) {
      if (fs.existsSync(possiblePath)) {
        staticPath = possiblePath;
        safeLog(`✅ 找到静态文件目录: ${staticPath}`);
        break;
      }
    }
    
    if (!staticPath) {
      safeLog('⚠️  未找到静态文件目录，后端将只提供 API 服务');
    }

    safeLog('🚀 启动后端服务器（生产模式）...');
    safeLog(`📁 配置文件路径: ${appData.configPath}`);
    if (staticPath) {
      safeLog(`📁 静态文件路径: ${staticPath}`);
    }

    const env = {
      ...process.env,
      STATIC_PATH: staticPath,
      PIXIV_DOWNLOADER_CONFIG: appData.configPath,
      NODE_ENV: 'production',
      PORT: BACKEND_PORT.toString(),
      HOST: 'localhost',
    };

    try {
      this.backendProcess = spawn(process.execPath, [backendPath], {
        cwd: backendCwd,
        env: env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      this.setupBackendProcessHandlers();
    } catch (error) {
      this.isBackendStarting = false;
      safeError('❌ 无法启动后端进程:', error);
      if (this.mainWindow) {
        this.mainWindow.webContents.send('backend-error', `无法启动后端进程: ${error.message}`);
      }
    }
  }

  setupBackendProcessHandlers() {
    if (!this.backendProcess) return;

    this.backendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      safeLog(`[Backend] ${msg.trim()}`);
      if (msg.includes('WebUI server started on http://localhost:')) {
        const match = msg.match(/http:\/\/localhost:(\d+)/);
        if (match && match[1]) {
          this.actualBackendPort = parseInt(match[1], 10);
          safeLog(`✅ 后端服务器启动成功，端口: ${this.actualBackendPort}`);
          this.checkBackendReady(() => {});
        }
      }
    });

    this.backendProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      safeError(`[Backend Error] ${msg.trim()}`);
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('backend-error', msg);
      }
    });

    this.backendProcess.on('close', (code) => {
      safeLog(`🛑 后端进程已关闭，退出码: ${code}`);
      this.backendProcess = null;
      this.backendReadyState = false;
      this.isBackendStarting = false;
      
      if (code !== 0 && code !== null && !this.isAppClosing) {
        safeError('⚠️  后端进程意外关闭，尝试重启...');
        safeSetTimeout(() => this.startBackend(), 3000);
      }
    });

    this.backendProcess.on('error', (err) => {
      safeError('❌ 后端进程启动失败:', err);
      this.backendProcess = null;
      this.backendReadyState = false;
      this.isBackendStarting = false;
      if (this.mainWindow) {
        this.mainWindow.webContents.send('backend-error', `无法启动后端进程: ${err.message}`);
      }
      if (!this.isAppClosing) {
        safeError('⚠️  后端进程启动出错，尝试重启...');
        safeSetTimeout(() => this.startBackend(), 5000);
      }
    });

    this.isBackendStarting = false;
  }

  async stopBackend() {
    return new Promise((resolve) => {
      if (!this.backendProcess) {
        resolve();
        return;
      }

      safeLog('🛑 正在停止后端服务器...');
      this.isBackendStarting = false;

      const proc = this.backendProcess;
      this.backendProcess = null;

      let exited = false;
      const onExit = () => {
        if (!exited) {
          exited = true;
          safeLog('✅ 后端进程已停止');
          cleanupPort(BACKEND_PORT).then(() => resolve());
        }
      };

      proc.once('exit', onExit);

      try {
        if (process.platform === 'win32') {
          proc.kill();
        } else {
          proc.kill('SIGTERM');
        }

        safeSetTimeout(() => {
          if (!exited && proc && !proc.killed) {
            safeLog('⚠️  后端进程未响应，强制终止...');
            try {
              proc.kill('SIGKILL');
            } catch (err) {
              safeError('强制终止进程失败:', err);
            }
          }
          safeSetTimeout(() => {
            if (!exited) {
              safeError('❌ 后端进程未能完全停止，可能需要手动清理');
            }
            resolve();
          }, 5000);
        }, 5000);
      } catch (err) {
        safeError('❌ 停止后端进程失败:', err);
        resolve();
      }
    });
  }

  checkBackendReady(callback) {
    if (this.backendReadyState) {
      callback(true);
      return;
    }

    const req = http.get(`http://localhost:${this.actualBackendPort}/api/health`, { timeout: 3000 }, (res) => {
      if (res.statusCode === 200) {
        safeLog('✅ 后端服务器健康检查通过');
        this.backendReadyState = true;
        this.notifyBackendReady();
        callback(true);
      } else {
        safeLog(`⚠️  后端服务器健康检查失败，状态码: ${res.statusCode}`);
        callback(false);
      }
    });

    req.on('error', (err) => {
      safeLog(`❌ 后端服务器健康检查出错: ${err.message}`);
      callback(false);
    });

    req.on('timeout', () => {
      req.destroy();
      callback(false);
    });

    req.end();
  }

  notifyBackendReady() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      safeLog('📤 通知主窗口后端已就绪');
      this.mainWindow.webContents.send('backend-ready');
      this.backendReadyNotificationPending = false;
    } else {
      safeLog('⚠️  主窗口不可用，将待处理的后端就绪通知');
      this.backendReadyNotificationPending = true;
    }
  }

  checkAndSendPendingReadyNotification() {
    if (this.backendReadyNotificationPending) {
      const webContents = this.mainWindow?.webContents;
      if (webContents && !webContents.isDestroyed()) {
        safeLog('📤 发送待处理的后端就绪通知');
        this.notifyBackendReady();
      }
    }
  }

  setAppClosing(value) {
    this.isAppClosing = value;
    setLoggerAppClosing(value);
    setTimersAppClosing(value);
  }
}

module.exports = new BackendService();

