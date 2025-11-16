/**
 * 安全的日志工具模块
 * 防止 EPIPE 错误和应用关闭时的日志问题
 */

let isAppClosing = false;

function setAppClosing(value) {
  isAppClosing = value;
}

function safeLog(...args) {
  if (isAppClosing) return;
  try {
    console.log(...args);
  } catch (err) {
    // 忽略 EPIPE 错误（流已关闭）
    if (err.code !== 'EPIPE') {
      // 其他错误可以尝试输出到 stderr
      try {
        console.error('Log error:', err.message);
      } catch (e) {
        // 如果连 stderr 也关闭了，就忽略
      }
    }
  }
}

function safeError(...args) {
  if (isAppClosing) return;
  try {
    console.error(...args);
  } catch (err) {
    // 忽略 EPIPE 错误（流已关闭）
    if (err.code !== 'EPIPE') {
      // 其他错误可以尝试输出到 stdout
      try {
        console.log('Error log error:', err.message);
      } catch (e) {
        // 如果连 stdout 也关闭了，就忽略
      }
    }
  }
}

module.exports = {
  setAppClosing,
  safeLog,
  safeError,
};

