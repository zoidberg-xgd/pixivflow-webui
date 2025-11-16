/**
 * 端口管理工具模块
 */

const net = require('net');
const { spawn } = require('child_process');
const os = require('os');

/**
 * 检查端口是否被占用（同时检查 IPv4 和 IPv6）
 */
function checkPortInUse(port, callback) {
  let checkedCount = 0;
  let isInUse = false;
  const totalChecks = 2; // IPv4 和 IPv6
  
  const checkComplete = () => {
    checkedCount++;
    if (checkedCount >= totalChecks) {
      callback(isInUse);
    }
  };
  
  // 检查 IPv4
  const server4 = net.createServer();
  server4.listen(port, '127.0.0.1', () => {
    server4.close(() => {
      checkComplete();
    });
  });
  server4.on('error', () => {
    isInUse = true;
    checkComplete();
  });
  
  // 检查 IPv6
  const server6 = net.createServer();
  server6.listen(port, '::1', () => {
    server6.close(() => {
      checkComplete();
    });
  });
  server6.on('error', () => {
    isInUse = true;
    checkComplete();
  });
}

/**
 * 查找占用指定端口的进程（跨平台）
 */
function findProcessUsingPort(port, callback) {
  const platform = os.platform();
  let command;
  let args;
  
  if (platform === 'win32') {
    command = 'netstat';
    args = ['-ano'];
  } else if (platform === 'darwin') {
    command = 'lsof';
    args = ['-i', `:${port}`];
  } else {
    command = 'lsof';
    args = ['-i', `:${port}`];
  }
  
  const process = spawn(command, args);
  let output = '';
  
  process.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  process.stderr.on('data', (data) => {
    // 忽略错误输出
  });
  
  process.on('close', (code) => {
    if (code === 0 && output) {
      const lines = output.split('\n');
      const pids = [];
      
      for (const line of lines) {
        if (platform === 'win32') {
          const match = line.match(/\s+(\d+)\s*$/);
          if (match) {
            const pid = parseInt(match[1], 10);
            if (pid && !isNaN(pid)) {
              pids.push(pid);
            }
          }
        } else {
          const match = line.match(/\s+(\d+)\s+/);
          if (match) {
            const pid = parseInt(match[1], 10);
            if (pid && !isNaN(pid)) {
              pids.push(pid);
            }
          }
        }
      }
      
      callback(pids.length > 0 ? pids[0] : null);
    } else {
      callback(null);
    }
  });
}

/**
 * 杀死指定PID的进程
 */
function killProcess(pid, callback) {
  const platform = os.platform();
  let command;
  let args;
  
  if (platform === 'win32') {
    command = 'taskkill';
    args = ['/F', '/PID', pid.toString()];
  } else {
    command = 'kill';
    args = ['-9', pid.toString()];
  }
  
  const process = spawn(command, args);
  
  process.on('close', (code) => {
    callback(code === 0);
  });
  
  process.on('error', () => {
    callback(false);
  });
}

/**
 * 清理占用端口的进程
 */
async function cleanupPort(port) {
  return new Promise((resolve) => {
    findProcessUsingPort(port, (pid) => {
      if (pid) {
        console.log(`发现进程 ${pid} 占用端口 ${port}，尝试终止...`);
        killProcess(pid, (success) => {
          if (success) {
            console.log(`✅ 成功终止进程 ${pid}`);
            // 等待进程完全退出
            setTimeout(() => resolve(true), 1000);
          } else {
            console.warn(`⚠️  无法终止进程 ${pid}`);
            resolve(false);
          }
        });
      } else {
        resolve(true);
      }
    });
  });
}

module.exports = {
  checkPortInUse,
  findProcessUsingPort,
  killProcess,
  cleanupPort,
};

