/**
 * 安全的定时器管理模块
 */

let isAppClosing = false;
const activeTimers = new Set();

function setAppClosing(value) {
  isAppClosing = value;
}

function safeSetTimeout(callback, delay) {
  if (isAppClosing) return null;
  const timerId = setTimeout(() => {
    activeTimers.delete(timerId);
    if (!isAppClosing) {
      callback();
    }
  }, delay);
  activeTimers.add(timerId);
  return timerId;
}

function safeSetInterval(callback, delay) {
  if (isAppClosing) return null;
  const timerId = setInterval(() => {
    if (!isAppClosing) {
      callback();
    } else {
      clearInterval(timerId);
      activeTimers.delete(timerId);
    }
  }, delay);
  activeTimers.add(timerId);
  return timerId;
}

function clearAllTimers() {
  isAppClosing = true;
  activeTimers.forEach((timerId) => {
    clearTimeout(timerId);
    clearInterval(timerId);
  });
  activeTimers.clear();
}

module.exports = {
  setAppClosing,
  safeSetTimeout,
  safeSetInterval,
  clearAllTimers,
};

