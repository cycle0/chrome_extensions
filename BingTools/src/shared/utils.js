/**
 * @fileoverview 通用工具函数
 * @description 提供共享的工具函数
 */

const BTUtils = {
  /**
   * 日志输出
   * @param {...any} args - 日志参数
   */
  log(...args) {
    console.log('[BingTools]', ...args);
  },
  
  /**
   * 错误日志
   * @param {...any} args - 错误参数
   */
  error(...args) {
    console.error('[BingTools]', ...args);
  },
  
  /**
   * 警告日志
   * @param {...any} args - 警告参数
   */
  warn(...args) {
    console.warn('[BingTools]', ...args);
  },
  
  /**
   * 防抖函数
   * @param {Function} fn - 要执行的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function}
   */
  debounce(fn, delay) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        fn(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
    };
  },
  
  /**
   * 节流函数
   * @param {Function} fn - 要执行的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function}
   */
  throttle(fn, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * 创建带命名空间的元素ID
   * @param {string} namespace - 命名空间
   * @param {string} id - 元素ID
   * @returns {string}
   */
  namespacedId(namespace, id) {
    return `${namespace}-${id}`;
  },
  
  /**
   * 创建带命名空间的类名
   * @param {string} namespace - 命名空间
   * @param {string} className - 类名
   * @returns {string}
   */
  namespacedClass(namespace, className) {
    return `${namespace}-${className}`;
  },
  
  /**
   * 查找元素（支持多个选择器）
   * @param {Array<string>} selectors - 选择器数组
   * @returns {Element|null}
   */
  findElement(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  },
  
  /**
   * 等待元素出现
   * @param {string} selector - 选择器
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Element|null>}
   */
  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  },
  
  /**
   * 转义HTML特殊字符
   * @param {string} text - 原始文本
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  /**
   * 清理文件名中的非法字符
   * @param {string} filename - 原始文件名
   * @returns {string}
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^(con|prn|aux|nul|com\d|lpt\d)$/i, '_$1')
      .substring(0, 255);
  },
  
  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {string} separator - 分隔符
   * @returns {string}
   */
  formatDate(date, separator = '-') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${separator}${month}${separator}${day}`;
  },
  
  /**
   * 从URL中提取日期
   * @param {string} url - URL字符串
   * @returns {string|null}
   */
  extractDateFromUrl(url) {
    try {
      const match = url.match(/Date:%\d+_/);
      if (match) {
        return match[0].slice(-9, -1);
      }
    } catch (e) {
      this.error('提取日期失败:', e);
    }
    return null;
  },
  
  /**
   * 获取存储数据
   * @param {string} key - 存储键
   * @returns {Promise<any>}
   */
  async getStorage(key) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      this.error('获取存储失败:', error);
      return null;
    }
  },
  
  /**
   * 设置存储数据
   * @param {string} key - 存储键
   * @param {*} value - 存储值
   * @returns {Promise<void>}
   */
  async setStorage(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      this.error('设置存储失败:', error);
    }
  },
  
  /**
   * 发送消息到background
   * @param {string} action - 动作类型
   * @param {Object} data - 数据
   * @returns {Promise<any>}
   */
  async sendMessage(action, data = {}) {
    try {
      const response = await chrome.runtime.sendMessage({
        from: 'content',
        action,
        data,
        timestamp: Date.now()
      });
      return response;
    } catch (error) {
      this.error('发送消息失败:', error);
      throw error;
    }
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BTUtils;
}
