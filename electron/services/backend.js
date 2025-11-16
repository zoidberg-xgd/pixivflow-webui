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
    const backendPath = path.join(resourcesPath, 'dist', 'webui', 'index.js');

    if (!fs.existsSync(backendPath)) {
      safeError('❌ 后端文件不存在:', backendPath);
      return;
    }

    // 初始化应用数据目录
    let appData = initializeAppData();
    if (!appData) {
      safeError('❌ 应用数据目录未初始化');
      return;
    }

    const frontendDistPath = path.join(resourcesPath, '..', 'app.asar.unpacked', 'dist');
    const staticPath = fs.existsSync(frontendDistPath) ? frontendDistPath : undefined;

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
    };

    this.backendProcess = spawn('node', [backendPath], {
      cwd: resourcesPath,
      env: env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.setupBackendProcessHandlers();
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

