/**
 * 路径管理工具模块
 */

const path = require('path');
const fs = require('fs');
const { app } = require('electron');

/**
 * 获取项目根目录
 */
function getProjectRoot() {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    // 开发模式：从 electron 目录向上两级到项目根目录
    return path.resolve(__dirname, '../../..');
  }
  // 生产模式：使用 resourcesPath
  return process.resourcesPath || __dirname;
}

/**
 * 初始化应用的用户数据目录和配置文件
 */
function initializeAppData() {
  try {
    const userDataPath = app.getPath('userData');
    const appDataDir = path.join(userDataPath, 'PixivFlow');
    
    // 创建必要的目录
    const dirs = [
      appDataDir,
      path.join(appDataDir, 'config'),
      path.join(appDataDir, 'data'),
      path.join(appDataDir, 'downloads'),
      path.join(appDataDir, 'logs'),
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    return {
      appDataDir,
      configPath: path.join(appDataDir, 'config', 'standalone.config.json'),
      dataDir: path.join(appDataDir, 'data'),
      downloadsDir: path.join(appDataDir, 'downloads'),
      logsDir: path.join(appDataDir, 'logs'),
    };
  } catch (error) {
    console.error('初始化应用数据目录失败:', error);
    return null;
  }
}

/**
 * 验证路径是否存在
 */
function validatePath(dirPath, description) {
  if (!dirPath) {
    console.warn(`⚠️  ${description} 路径未设置`);
    return false;
  }
  
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  ${description} 路径不存在: ${dirPath}`);
    return false;
  }
  
  return true;
}

module.exports = {
  getProjectRoot,
  initializeAppData,
  validatePath,
};

