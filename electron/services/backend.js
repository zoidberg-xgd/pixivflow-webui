/**
 * 后端服务管理模块
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { logger } = require('../utils/logger');
const { timers } = require('../utils/timers');
const { paths } = require('../utils/paths');
const { port } = require('../utils/port');

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
      logger.safeLog('⚠️  后端正在启动中，跳过重复启动');
      return;
    }

    // 如果后端进程已存在，先停止它
    if (this.backendProcess) {
      logger.safeLog('⚠️  后端进程已存在，先停止现有进程...');
      await this.stopBackend();
      await new Promise((resolve) => timers.safeSetTimeout(resolve, 1000));
    }

    // 检查重启次数限制
    if (this.backendRestartCount >= MAX_BACKEND_RESTARTS) {
      logger.safeError(`❌ 后端重启次数已达上限 (${MAX_BACKEND_RESTARTS})，停止自动重启`);
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

    logger.safeLog(`🔧 准备启动后端服务器 (尝试 ${this.backendRestartCount}/${MAX_BACKEND_RESTARTS})...`);

    // 检查并清理端口
    const portInUse = await new Promise((resolve) => {
      port.checkPortInUse(BACKEND_PORT, (inUse) => {
        resolve(inUse);
      });
    });

    if (portInUse) {
      logger.safeLog(`⚠️  端口 ${BACKEND_PORT} 被占用，开始清理...`);
      const portCleaned = await port.cleanupPort(BACKEND_PORT);
      if (portCleaned) {
        logger.safeLog('✅ 端口清理成功');
        await new Promise((resolve) => timers.safeSetTimeout(resolve, 1000));
      }
    }

    // 启动后端进程
    const isDev = process.env.NODE_ENV === 'development' || !require('electron').app.isPackaged;
    
    if (isDev) {
      await this.startBackendDev();
    } else {
      await this.startBackendProd();
    }
  }

  async startBackendDev() {
    const projectRoot = paths.getProjectRoot();
    const backendPath = path.join(projectRoot, 'PixivFlow', 'dist', 'webui', 'index.js');

    if (!fs.existsSync(backendPath)) {
      logger.safeError('❌ 后端文件不存在:', backendPath);
      return;
    }

    logger.safeLog('🚀 启动后端服务器（开发模式）...');

    this.backendProcess = spawn('node', [backendPath], {
      cwd: path.join(projectRoot, 'PixivFlow'),
      env: {
        ...process.env,
        PORT: BACKEND_PORT.toString(),
        NODE_ENV: 'production',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.setupBackendProcessHandlers();
  }

  async startBackendProd() {
    const resourcesPath = process.resourcesPath || __dirname;
    const backendPath = path.join(resourcesPath, 'dist', 'webui', 'index.js');

    if (!fs.existsSync(backendPath)) {
      logger.safeError('❌ 后端文件不存在:', backendPath);
      return;
    }

    logger.safeLog('🚀 启动后端服务器（生产模式）...');

    this.backendProcess = spawn('node', [backendPath], {
      cwd: resourcesPath,
      env: {
        ...process.env,
        PORT: BACKEND_PORT.toString(),
        NODE_ENV: 'production',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.setupBackendProcessHandlers();
  }

  setupBackendProcessHandlers() {
    if (!this.backendProcess) return;

    this.backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      logger.safeLog(`[后端] ${output.trim()}`);
    });

    this.backendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      logger.safeError(`[后端错误] ${output.trim()}`);
    });

    this.backendProcess.on('exit', (code, signal) => {
      logger.safeLog(`后端进程退出: code=${code}, signal=${signal}`);
      this.backendProcess = null;
      this.isBackendStarting = false;

      if (code !== 0 && code !== null && !this.isAppClosing) {
        logger.safeError('后端进程异常退出，尝试重启...');
        timers.safeSetTimeout(() => {
          this.startBackend();
        }, 3000);
      }
    });

    this.isBackendStarting = false;
  }

  async stopBackend() {
    if (!this.backendProcess) {
      return;
    }

    logger.safeLog('🛑 停止后端服务器...');

    return new Promise((resolve) => {
      if (this.backendProcess.killed) {
        resolve();
        return;
      }

      const timeout = timers.safeSetTimeout(() => {
        if (this.backendProcess && !this.backendProcess.killed) {
          logger.safeLog('⚠️  强制终止后端进程...');
          this.backendProcess.kill('SIGKILL');
        }
        resolve();
      }, 5000);

      this.backendProcess.once('exit', () => {
        if (timeout) clearTimeout(timeout);
        this.backendProcess = null;
        resolve();
      });

      this.backendProcess.kill('SIGTERM');
    });
  }

  checkBackendReady(callback) {
    const req = http.get(`http://localhost:${this.actualBackendPort}/api/health`, { timeout: 3000 }, (res) => {
      if (res.statusCode === 200) {
        callback(true);
      } else {
        callback(false);
      }
    });

    req.on('error', () => {
      callback(false);
    });

    req.on('timeout', () => {
      req.destroy();
      callback(false);
    });
  }

  setAppClosing(value) {
    this.isAppClosing = value;
  }
}

module.exports = new BackendService();

