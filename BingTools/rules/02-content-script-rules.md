# Chrome插件 内容脚本（Content Scripts）开发规范

## 1. 架构概述

内容脚本是在网页上下文中运行的JavaScript/CSS，可以：
- 读取和修改网页DOM
- 与页面JavaScript隔离（隔离世界）
- 通过消息传递与Service Worker通信

## 2. 目录结构

```
src/content/
├── bing-fullscreen.js      # 全屏功能内容脚本
├── bing-fullscreen.css     # 全屏功能样式
├── bing-download.js        # 下载功能内容脚本
├── bing-download.css       # 下载功能样式
└── utils/
    ├── dom-helpers.js      # DOM操作工具
    └── message-client.js   # 消息通信客户端
```

## 3. 文件命名规范

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 主脚本 | `[功能]-[action].js` | `bing-fullscreen.js` |
| 样式文件 | `[功能]-[action].css` | `bing-fullscreen.css` |
| 工具模块 | `[category]-[type].js` | `dom-helpers.js` |

## 4. 代码结构模板

### 4.1 基础模板
```javascript
/**
 * @fileoverview Bing全屏功能内容脚本
 * @description 使Bing页面背景图片全屏显示
 */

(function() {
  'use strict';

  // 命名空间前缀，避免冲突
  const NAMESPACE = 'bt-fs'; // bt = Bing Tools, fs = FullScreen
  
  // 状态管理
  const state = {
    isFullscreen: false,
    isBrowserFullscreen: false,
    originalState: null
  };

  // 配置常量
  const CONFIG = {
    SELECTORS: {
      backgroundImage: ['.img_cont', '#bgDiv', '#b_sydBgCont'],
      toggleButton: `#${NAMESPACE}-toggle`
    },
    STORAGE_KEY: 'bingFullscreenEnabled',
    Z_INDEX: {
      background: 9998,
      button: 10000
    }
  };

  // 初始化
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  function onReady() {
    createToggleButton();
    bindEvents();
    restoreState();
  }

  // 功能实现...

  // 启动
  init();
})();
```

### 4.2 ES模块模板（推荐）
```javascript
/**
 * @fileoverview Bing下载功能内容脚本
 */

import { createElement, addStyles } from '../utils/dom-helpers.js';
import { sendMessage } from '../utils/message-client.js';

const NAMESPACE = 'bt-dl';

class BingDownloadManager {
  constructor() {
    this.config = {
      // 配置项
    };
    this.state = {
      // 状态项
    };
  }

  async init() {
    await this.loadSettings();
    this.createUI();
    this.bindEvents();
  }

  // 类方法...
}

// 初始化
const manager = new BingDownloadManager();
manager.init();
```

## 5. DOM操作规范

### 5.1 元素选择
```javascript
// 推荐：使用特定选择器
const element = document.querySelector('.img_cont');

// 推荐：多选择器备选
function findElement(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

// 使用
const bgElement = findElement(CONFIG.SELECTORS.backgroundImage);
```

### 5.2 元素创建
```javascript
/**
 * 创建带命名空间的元素
 * @param {string} tag - 标签名
 * @param {Object} options - 配置选项
 * @returns {HTMLElement}
 */
function createNamespacedElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  if (options.id) {
    element.id = `${NAMESPACE}-${options.id}`;
  }
  
  if (options.className) {
    element.className = options.className
      .split(' ')
      .map(c => `${NAMESPACE}-${c}`)
      .join(' ');
  }
  
  if (options.text) {
    element.textContent = options.text;
  }
  
  return element;
}

// 使用示例
const button = createNamespacedElement('button', {
  id: 'toggle',
  className: 'btn primary',
  text: chrome.i18n.getMessage('toggleFullscreen')
});
```

### 5.3 样式隔离
```css
/* 使用命名空间前缀 */
.bt-fs-container {
  /* 样式规则 */
}

.bt-fs-toggle {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 10000;
  /* ... */
}

/* 使用 !important 避免被页面覆盖 */
.bt-fs-fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}
```

## 6. 状态管理规范

### 6.1 本地状态
```javascript
const state = {
  isActive: false,
  currentImage: null,
  settings: {}
};

// 状态更新函数
function setState(key, value) {
  state[key] = value;
  // 可选：触发状态变更事件
  onStateChange(key, value);
}
```

### 6.2 持久化状态
```javascript
// 保存设置
async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEY]: settings
    });
  } catch (error) {
    console.error('[BingTools] 保存设置失败:', error);
  }
}

// 加载设置
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(CONFIG.STORAGE_KEY);
    return result[CONFIG.STORAGE_KEY] || {};
  } catch (error) {
    console.error('[BingTools] 加载设置失败:', error);
    return {};
  }
}
```

## 7. 事件处理规范

### 7.1 事件绑定
```javascript
function bindEvents() {
  // 按钮点击
  const toggleBtn = document.getElementById(`${NAMESPACE}-toggle`);
  if (toggleBtn) {
    toggleBtn.addEventListener('click', handleToggle);
  }

  // 键盘事件
  document.addEventListener('keydown', handleKeydown);

  // 浏览器全屏变化
  document.addEventListener('fullscreenchange', handleFullscreenChange);

  // 页面卸载清理
  window.addEventListener('beforeunload', cleanup);
}

function handleToggle(event) {
  event.preventDefault();
  toggleFullscreen();
}

function handleKeydown(event) {
  if (event.key === 'Escape' && state.isFullscreen) {
    exitFullscreen();
  }
}
```

### 7.2 事件委托
```javascript
// 对于动态生成的元素，使用事件委托
document.body.addEventListener('click', (event) => {
  if (event.target.matches(`.${NAMESPACE}-btn`)) {
    handleButtonClick(event);
  }
});
```

## 8. 与Service Worker通信

### 8.1 发送消息
```javascript
/**
 * 向Service Worker发送消息
 * @param {string} action - 动作类型
 * @param {Object} data - 数据
 * @returns {Promise}
 */
async function sendToBackground(action, data = {}) {
  try {
    const response = await chrome.runtime.sendMessage({
      from: 'content',
      action,
      data
    });
    return response;
  } catch (error) {
    console.error('[BingTools] 通信失败:', error);
    throw error;
  }
}

// 使用示例
async function downloadImage(url, filename) {
  const result = await sendToBackground('download', { url, filename });
  return result;
}
```

### 8.2 接收消息
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.to !== 'content') return;

  switch (request.action) {
    case 'toggleFullscreen':
      handleToggleFullscreen();
      sendResponse({ success: true });
      break;
    case 'getState':
      sendResponse({ state: getCurrentState() });
      break;
    default:
      sendResponse({ error: 'Unknown action' });
  }

  // 异步响应需返回true
  return true;
});
```

## 9. 错误处理规范

### 9.1 基础错误处理
```javascript
try {
  const element = document.querySelector('.img_cont');
  if (!element) {
    throw new Error('Background element not found');
  }
  processElement(element);
} catch (error) {
  console.error('[BingTools] 操作失败:', error.message);
  // 可选：向用户显示错误提示
  showErrorNotification(error.message);
}
```

### 9.2 异步错误处理
```javascript
async function initialize() {
  try {
    await loadSettings();
    await createUI();
    console.log('[BingTools] 初始化完成');
  } catch (error) {
    console.error('[BingTools] 初始化失败:', error);
    // 降级处理
    runInFallbackMode();
  }
}
```

## 10. 日志规范

### 10.1 日志前缀
```javascript
const LOG_PREFIX = '[BingTools]';

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

function warn(...args) {
  console.warn(LOG_PREFIX, ...args);
}

function error(...args) {
  console.error(LOG_PREFIX, ...args);
}
```

### 10.2 调试模式
```javascript
const DEBUG = false;

function debug(...args) {
  if (DEBUG) {
    console.log(`${LOG_PREFIX}[DEBUG]`, ...args);
  }
}
```

## 11. 清理与恢复

### 11.1 页面卸载清理
```javascript
function cleanup() {
  // 移除添加的元素
  const elements = document.querySelectorAll(`[id^="${NAMESPACE}-"]`);
  elements.forEach(el => el.remove());

  // 移除添加的样式
  const styles = document.querySelectorAll(`style[data-ns="${NAMESPACE}"]`);
  styles.forEach(style => style.remove());

  // 解绑事件
  document.removeEventListener('keydown', handleKeydown);
}

window.addEventListener('beforeunload', cleanup);
```

### 11.2 状态恢复
```javascript
async function restoreState() {
  const settings = await loadSettings();
  if (settings.enabled) {
    enableFeature();
  }
}
```

## 12. 性能优化

### 12.1 防抖与节流
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 使用
const debouncedResize = debounce(handleResize, 250);
window.addEventListener('resize', debouncedResize);
```

### 12.2 避免强制同步布局
```javascript
// 不推荐：交错读写
const height = element.offsetHeight; // 读
element.style.height = (height * 2) + 'px'; // 写
const newHeight = element.offsetHeight; // 读（强制同步布局）

// 推荐：批量读写
const height = element.offsetHeight;
const newHeight = height * 2;
requestAnimationFrame(() => {
  element.style.height = newHeight + 'px';
});
```

## 13. 安全检查清单

- [ ] 所有DOM元素ID使用命名空间前缀
- [ ] 所有CSS类名使用命名空间前缀
- [ ] 使用 `textContent` 而非 `innerHTML` 插入文本
- [ ] 用户输入经过验证和转义
- [ ] 事件监听器在页面卸载时移除
- [ ] 异步操作有错误处理
- [ ] 使用 `chrome.storage` 而非 `localStorage`
