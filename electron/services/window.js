/**
 * 窗口管理服务模块
 * 处理主窗口的创建、状态保存和恢复
 */

const { BrowserWindow, shell, dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');
const { safeLog, safeError } = require('../utils/logger');
const { safeSetTimeout } = require('../utils/timers');
const backendService = require('./backend');

class WindowService {
  constructor() {
    this.mainWindow = null;
    this.isDev = null;
    this.actualBackendPort = null;
  }

  /**
   * 获取窗口状态
   */
  getWindowState() {
    const userDataPath = app.getPath('userData');
    const statePath = path.join(userDataPath, 'window-state.json');
    try {
      if (fs.existsSync(statePath)) {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        return state;
      }
    } catch (err) {
      safeLog('无法读取窗口状态:', err.message);
    }
    return {};
  }

  /**
   * 保存窗口状态
   */
  saveWindowState() {
    if (!this.mainWindow) return;
    const userDataPath = app.getPath('userData');
    const statePath = path.join(userDataPath, 'window-state.json');
    try {
      const bounds = this.mainWindow.getBounds();
      const state = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
      };
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    } catch (err) {
      safeLog('无法保存窗口状态:', err.message);
    }
  }

  /**
   * 创建主窗口
   * 从 main.cjs 中提取的完整实现
   */
  createWindow(isDev, actualBackendPort) {
    // 保存参数以便后续使用
    this.isDev = isDev;
    this.actualBackendPort = actualBackendPort;
    
    // 恢复窗口状态（如果之前保存过）
    const windowState = this.getWindowState();
    
    this.mainWindow = new BrowserWindow({
      width: windowState.width || 1200,
      height: windowState.height || 800,
      x: windowState.x,
      y: windowState.y,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, '../preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
      },
      show: true, // 立即显示窗口，避免白屏
    });

    // 保存窗口状态
    this.mainWindow.on('moved', () => this.saveWindowState());
    this.mainWindow.on('resized', () => this.saveWindowState());

    // 加载应用 - 使用智能加载页面，自动检测和连接
    const loadingHTML = this.getLoadingHTML(isDev, actualBackendPort);
    
    if (isDev) {
      // 开发模式：先显示加载页面，然后尝试连接
      this.mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);
      // 打开开发者工具
      this.mainWindow.webContents.openDevTools();
    } else {
      // 生产模式：显示加载页面，自动连接后端
      this.mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);
    }

    // 处理外部链接
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // 窗口崩溃处理
    this.mainWindow.webContents.on('render-process-gone', (event, details) => {
      this.handleRendererCrash(details, isDev);
    });

    // 未捕获的异常处理（渲染进程）
    this.mainWindow.webContents.on('unresponsive', () => {
      this.handleUnresponsive(isDev);
    });

    this.mainWindow.webContents.on('responsive', () => {
      safeLog('✅ 窗口已恢复响应');
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
    
    // 监听窗口加载完成事件，检查是否有待发送的后端就绪通知
    this.mainWindow.webContents.once('did-finish-load', () => {
      safeLog('📄 窗口加载完成，检查后端状态');
      safeSetTimeout(() => {
        backendService.checkAndSendPendingReadyNotification();
        backendService.checkBackendReady((ready) => {
          if (ready) {
            backendService.notifyBackendReady();
          }
        });
      }, 300);
    });
    
    // 监听 DOM 准备完成（更早的事件）
    this.mainWindow.webContents.once('dom-ready', () => {
      safeLog('📄 DOM 准备完成');
      safeSetTimeout(() => {
        backendService.checkAndSendPendingReadyNotification();
      }, 200);
    });
    
    // 设置 backendService 的 mainWindow 引用
    backendService.setMainWindow(this.mainWindow);

    return this.mainWindow;
  }

  /**
   * 获取加载页面 HTML
   */
  getLoadingHTML(isDev, actualBackendPort) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PixivFlow - 启动中...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: white;
    }
    .container {
      text-align: center;
      max-width: 500px;
      padding: 40px;
    }
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 { margin: 0 0 10px 0; font-size: 24px; font-weight: 600; }
    .status { margin: 10px 0; opacity: 0.9; font-size: 14px; min-height: 20px; }
    .error { color: #ffcccb; margin-top: 20px; padding: 15px; background: rgba(255,0,0,0.2); border-radius: 8px; display: none; }
    .error.show { display: block; }
    .retry-btn { 
      margin-top: 15px; 
      padding: 10px 20px; 
      background: white; 
      color: #667eea; 
      border: none; 
      border-radius: 6px; 
      cursor: pointer; 
      font-size: 14px;
      font-weight: 600;
      display: none;
    }
    .retry-btn.show { display: inline-block; }
    .retry-btn:hover { background: #f0f0f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>PixivFlow</h1>
    <div class="status" id="status">正在启动...</div>
    <div class="error" id="error"></div>
    <button class="retry-btn" id="retryBtn" onclick="retryConnection()">重试连接</button>
  </div>
  <script>
    const isDev = ${isDev};
    const viteUrl = 'http://localhost:5173';
    const backendUrl = 'http://localhost:' + ${actualBackendPort};
    let currentUrl = null;
    
    function updateStatus(text) {
      document.getElementById('status').textContent = text;
    }
    
    function showError(text) {
      const errorEl = document.getElementById('error');
      errorEl.textContent = text;
      errorEl.classList.add('show');
      document.getElementById('retryBtn').classList.add('show');
    }
    
    function checkServer(url, callback) {
      fetch(url + '/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      })
      .then(res => res.ok ? callback(true) : callback(false))
      .catch(() => callback(false));
    }
    
    function tryConnect() {
      if (isDev) {
        updateStatus('正在连接 Vite 开发服务器...');
        checkServer(viteUrl, (available) => {
          if (available) {
            updateStatus('连接成功，正在加载...');
            currentUrl = viteUrl;
            window.location.href = viteUrl;
          } else {
            updateStatus('Vite 不可用，尝试后端服务器...');
            tryBackend();
          }
        });
      } else {
        tryBackend();
      }
    }
    
    let checkInterval = null;
    let isConnecting = false;
    
    function stopConnecting() {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      isConnecting = false;
    }
    
    function tryBackend() {
      if (isConnecting) return;
      isConnecting = true;
      updateStatus('正在连接后端服务器...');
      let attempts = 0;
      const maxAttempts = 120;
      
      checkInterval = setInterval(() => {
        attempts++;
        checkServer(backendUrl, (available) => {
          if (available) {
            stopConnecting();
            updateStatus('连接成功，正在加载...');
            currentUrl = backendUrl;
            window.location.href = backendUrl;
          } else if (attempts >= maxAttempts) {
            stopConnecting();
            showError('无法连接到后端服务器。请检查后端是否正常启动。');
          }
        });
      }, 500);
    }
    
    function retryConnection() {
      stopConnecting();
      document.getElementById('error').classList.remove('show');
      document.getElementById('retryBtn').classList.remove('show');
      tryConnect();
    }
    
    let ipcListenerSetup = false;
    function setupIpcListener() {
      if (ipcListenerSetup) return;
      if (window.electron && window.electron.onBackendReady && window.electron.onBackendError) {
        ipcListenerSetup = true;
        window.electron.onBackendReady(() => {
          stopConnecting();
          updateStatus('后端已就绪，正在加载...');
          checkServer(backendUrl, (available) => {
            if (available) {
              currentUrl = backendUrl;
              window.location.href = backendUrl;
            } else {
              setTimeout(() => {
                checkServer(backendUrl, (available) => {
                  if (available) {
                    currentUrl = backendUrl;
                    window.location.href = backendUrl;
                  } else {
                    isConnecting = false;
                    tryBackend();
                  }
                });
              }, 500);
            }
          });
        });
        window.electron.onBackendError((error) => {
          stopConnecting();
          showError(error || '后端服务器启动失败');
        });
      } else {
        let retryCount = 0;
        const maxRetries = 20;
        const retryInterval = setInterval(() => {
          retryCount++;
          if (window.electron && window.electron.onBackendReady && window.electron.onBackendError) {
            clearInterval(retryInterval);
            setupIpcListener();
          } else if (retryCount >= maxRetries) {
            clearInterval(retryInterval);
          }
        }, 100);
      }
    }
    
    setupIpcListener();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(setupIpcListener, 50);
      });
    } else {
      setTimeout(setupIpcListener, 50);
    }
    
    tryConnect();
  </script>
</body>
</html>`;
  }

  /**
   * 处理渲染进程崩溃
   */
  handleRendererCrash(details, isDev) {
    safeError('❌ 渲染进程崩溃:', details);
    safeError('崩溃原因:', details.reason);
    safeError('退出码:', details.exitCode);
    
    try {
      const userDataPath = app.getPath('userData');
      const logDir = path.join(userDataPath, 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `renderer-crash-${Date.now()}.log`);
      fs.writeFileSync(logFile, `渲染进程崩溃\n原因: ${details.reason}\n退出码: ${details.exitCode}\n`, 'utf8');
      safeError(`崩溃日志已保存到: ${logFile}`);
    } catch (logError) {
      safeError('无法写入崩溃日志:', logError);
    }
    
    if (!isDev) {
      dialog.showErrorBox('窗口崩溃', `渲染进程崩溃:\n\n原因: ${details.reason}\n\n应用将尝试重新加载窗口。`);
    }
    
    if (details.reason === 'crashed') {
      safeSetTimeout(() => {
        if (this.mainWindow && !require('electron').app.isPackaged || process.env.NODE_ENV !== 'production') {
          const isAppClosing = require('../main.cjs').isAppClosing || false;
          if (!isAppClosing) {
            safeLog('🔄 尝试重新加载窗口...');
            this.mainWindow.reload();
          }
        }
      }, 1000);
    } else if (details.reason === 'killed') {
      safeSetTimeout(() => {
        const isAppClosing = require('../main.cjs').isAppClosing || false;
        if (!isAppClosing && this.isDev !== null && this.actualBackendPort !== null) {
          safeLog('🔄 重新创建窗口...');
          if (this.mainWindow) {
            this.mainWindow.destroy();
            this.mainWindow = null;
          }
          // 重新创建窗口
          this.createWindow(this.isDev, this.actualBackendPort);
          // 更新 main.cjs 中的 mainWindow 引用（通过 backendService）
          backendService.setMainWindow(this.mainWindow);
        }
      }, 1000);
    }
  }

  /**
   * 处理窗口无响应
   */
  handleUnresponsive(isDev) {
    safeLog('⚠️  窗口无响应');
    if (!isDev && this.mainWindow) {
      const { dialog } = require('electron');
      const response = dialog.showMessageBoxSync(this.mainWindow, {
        type: 'warning',
        title: '窗口无响应',
        message: '窗口似乎无响应。是否等待或重新加载？',
        buttons: ['等待', '重新加载', '关闭'],
        defaultId: 0,
      });
      
      if (response === 1) {
        this.mainWindow.reload();
      } else if (response === 2) {
        this.mainWindow.close();
      }
    }
  }

  /**
   * 获取主窗口
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * 设置主窗口
   */
  setMainWindow(window) {
    this.mainWindow = window;
  }
}

module.exports = new WindowService();