# Chrome插件 背景脚本（Service Worker）开发规范

## 1. 架构概述

Service Worker 是 Chrome 扩展的后台脚本，特点：
- 事件驱动，不保持常驻状态
- 无法访问DOM
- 可以访问所有Chrome APIs
- 负责协调各组件通信

## 2. 目录结构

```
src/background/
├── service-worker.js       # 主入口文件
├── handlers/
│   ├── message-handler.js  # 消息处理
│   ├── download-handler.js # 下载处理
│   └── tab-handler.js      # 标签页处理
├── utils/
│   ├── storage.js          # 存储管理
│   └── logger.js           # 日志工具
└── config.js               # 配置常量
```

## 3. 基础架构

### 3.1 主入口文件
```javascript
/**
 * @fileoverview Service Worker 主入口
 * @description Bing Tools 扩展的后台服务
 */

import { MessageHandler } from './handlers/message-handler.js';
import { DownloadHandler } from './handlers/download-handler.js';
import { CONFIG } from './config.js';

// 初始化处理器
const messageHandler = new MessageHandler();
const downloadHandler = new DownloadHandler();

// 安装/更新事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[BingTools] Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    initializeExtension();
  } else if (details.reason === 'update') {
    handleUpdate(details.previousVersion);
  }
});

// 启动事件
chrome.runtime.onStartup.addListener(() => {
  console.log('[BingTools] Browser started');
});

// 消息监听
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  return messageHandler.handle(request, sender, sendResponse);
});

// 初始化函数
async function initializeExtension() {
  // 设置默认配置
  await chrome.storage.local.set({
    settings: CONFIG.DEFAULT_SETTINGS,
    installDate: Date.now()
  });
  
  // 创建右键菜单（如果需要）
  createContextMenus();
}

function handleUpdate(previousVersion) {
  console.log(`[BingTools] Updated from ${previousVersion} to ${chrome.runtime.getManifest().version}`);
  // 迁移数据等操作
}
```

### 3.2 配置常量
```javascript
/**
 * @fileoverview 背景脚本配置
 */

export const CONFIG = {
  // 默认设置
  DEFAULT_SETTINGS: {
    fullscreen: {
      enabled: false,
      autoFullscreen: false
    },
    download: {
      resolution: 'UHD',
      namingRules: {
        baseName: true,
        dateInfo: true,
        description: true
      }
    }
  },
  
  // 存储键名
  STORAGE_KEYS: {
    SETTINGS: 'bingTools_settings',
    HISTORY: 'bingTools_history'
  },
  
  // 消息动作类型
  ACTIONS: {
    DOWNLOAD: 'download',
    GET_SETTINGS: 'getSettings',
    SET_SETTINGS: 'setSettings',
    GET_STATE: 'getState'
  }
};
```

## 4. 消息处理规范

### 4.1 消息处理器类
```javascript
/**
 * @fileoverview 消息处理器
 */

import { CONFIG } from '../config.js';
import { StorageManager } from '../utils/storage.js';

export class MessageHandler {
  constructor() {
    this.storage = new StorageManager();
    this.handlers = new Map();
    this.registerHandlers();
  }

  registerHandlers() {
    this.handlers.set(CONFIG.ACTIONS.DOWNLOAD, this.handleDownload.bind(this));
    this.handlers.set(CONFIG.ACTIONS.GET_SETTINGS, this.handleGetSettings.bind(this));
    this.handlers.set(CONFIG.ACTIONS.SET_SETTINGS, this.handleSetSettings.bind(this));
    this.handlers.set(CONFIG.ACTIONS.GET_STATE, this.handleGetState.bind(this));
  }

  handle(request, sender, sendResponse) {
    const handler = this.handlers.get(request.action);
    
    if (!handler) {
      sendResponse({ error: `Unknown action: ${request.action}` });
      return false;
    }

    try {
      const result = handler(request.data, sender);
      
      // 处理异步结果
      if (result instanceof Promise) {
        result
          .then(data => sendResponse({ success: true, data }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // 保持通道开放
      }
      
      sendResponse({ success: true, data: result });
      return false;
    } catch (error) {
      sendResponse({ success: false, error: error.message });
      return false;
    }
  }

  async handleDownload(data, sender) {
    // 下载处理逻辑
    const { url, filename } = data;
    const downloadId = await chrome.downloads.download({
      url,
      filename,
      saveAs: false
    });
    return { downloadId };
  }

  async handleGetSettings() {
    return await this.storage.getSettings();
  }

  async handleSetSettings(data) {
    await this.storage.setSettings(data);
    return { saved: true };
  }

  handleGetState() {
    return {
      version: chrome.runtime.getManifest().version,
      timestamp: Date.now()
    };
  }
}
```

### 4.2 消息格式规范
```javascript
// 请求格式
const request = {
  from: 'popup' | 'content' | 'options',
  action: 'actionName',
  data: { /* 具体数据 */ }
};

// 响应格式
const response = {
  success: true | false,
  data: { /* 成功时的数据 */ },
  error: '错误信息' // 失败时
};
```

## 5. 存储管理规范

### 5.1 存储管理类
```javascript
/**
 * @fileoverview 存储管理器
 */

import { CONFIG } from '../config.js';

export class StorageManager {
  constructor() {
    this.cache = new Map();
    this.setupChangeListener();
  }

  setupChangeListener() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        for (const [key, { newValue }] of Object.entries(changes)) {
          this.cache.set(key, newValue);
        }
      }
    });
  }

  async get(key) {
    // 先查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = await chrome.storage.local.get(key);
    const value = result[key];
    this.cache.set(key, value);
    return value;
  }

  async set(key, value) {
    await chrome.storage.local.set({ [key]: value });
    this.cache.set(key, value);
  }

  async getSettings() {
    return await this.get(CONFIG.STORAGE_KEYS.SETTINGS) || CONFIG.DEFAULT_SETTINGS;
  }

  async setSettings(settings) {
    await this.set(CONFIG.STORAGE_KEYS.SETTINGS, settings);
  }

  async remove(key) {
    await chrome.storage.local.remove(key);
    this.cache.delete(key);
  }
}
```

## 6. 生命周期管理

### 6.1 保持活跃（必要时）
```javascript
// 对于需要长时间运行的任务，使用 alarms API
chrome.alarms.create('keepAlive', { periodInMinutes: 4.9 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('[BingTools] Keep alive');
  }
});
```

### 6.2 状态持久化
```javascript
// 在Service Worker终止前保存状态
self.addEventListener('beforeunload', () => {
  chrome.storage.local.set({
    lastState: getCurrentState(),
    lastActive: Date.now()
  });
});
```

## 7. 标签页管理

### 7.1 向内容脚本发送消息
```javascript
/**
 * 向指定标签页的内容脚本发送消息
 * @param {number} tabId - 标签页ID
 * @param {Object} message - 消息对象
 */
async function sendToContent(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      to: 'content',
      ...message
    });
    return response;
  } catch (error) {
    console.error('[BingTools] 发送消息失败:', error);
    throw error;
  }
}

/**
 * 向所有Bing标签页广播消息
 * @param {Object} message - 消息对象
 */
async function broadcastToBingTabs(message) {
  const tabs = await chrome.tabs.query({
    url: '*://*.bing.com/*'
  });
  
  for (const tab of tabs) {
    try {
      await sendToContent(tab.id, message);
    } catch (error) {
      // 忽略未注入内容脚本的标签页
    }
  }
}
```

### 7.2 标签页事件监听
```javascript
// 标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('bing.com')) {
    console.log('[BingTools] Bing page loaded:', tabId);
  }
});

// 标签页激活
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  console.log('[BingTools] Tab activated:', tab.url);
});
```

## 8. 下载管理

### 8.1 下载处理器
```javascript
/**
 * @fileoverview 下载处理器
 */

export class DownloadHandler {
  constructor() {
    this.setupDownloadListeners();
  }

  setupDownloadListeners() {
    chrome.downloads.onCreated.addListener((downloadItem) => {
      console.log('[BingTools] Download created:', downloadItem.id);
    });

    chrome.downloads.onChanged.addListener((delta) => {
      if (delta.state?.current === 'complete') {
        console.log('[BingTools] Download completed:', delta.id);
      }
    });
  }

  async download(url, filename) {
    const downloadOptions = {
      url,
      filename: this.sanitizeFilename(filename),
      saveAs: false
    };

    const downloadId = await chrome.downloads.download(downloadOptions);
    return { downloadId };
  }

  sanitizeFilename(filename) {
    // 移除非法字符
    return filename.replace(/[<>:"/\\|?*]/g, '_');
  }
}
```

## 9. 上下文菜单

### 9.1 菜单创建
```javascript
function createContextMenus() {
  chrome.contextMenus.create({
    id: 'bingTools-download',
    title: chrome.i18n.getMessage('contextMenuDownload'),
    contexts: ['image'],
    documentUrlPatterns: ['*://*.bing.com/*']
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'bingTools-download') {
    handleImageDownload(info.srcUrl, tab);
  }
});
```

## 10. 错误处理与日志

### 10.1 全局错误处理
```javascript
self.addEventListener('error', (event) => {
  console.error('[BingTools] Global error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[BingTools] Unhandled rejection:', event.reason);
});
```

### 10.2 日志工具
```javascript
export class Logger {
  static prefix = '[BingTools]';

  static log(...args) {
    console.log(this.prefix, ...args);
  }

  static warn(...args) {
    console.warn(this.prefix, ...args);
  }

  static error(...args) {
    console.error(this.prefix, ...args);
  }
}
```

## 11. 安全检查清单

- [ ] 所有消息处理都有错误边界
- [ ] 敏感操作（如下载）有权限检查
- [ ] 外部URL经过验证
- [ ] 使用 `chrome.storage` 而非全局变量存储状态
- [ ] 长时间运行任务使用 alarms API
- [ ] 消息响应通道正确关闭（返回false）或保持开放（返回true）
- [ ] 异步操作有超时处理

## 12. 性能优化

### 12.1 延迟加载
```javascript
// 按需加载处理器
async function loadHandler(name) {
  const module = await import(`./handlers/${name}.js`);
  return new module.default();
}
```

### 12.2 缓存策略
```javascript
// 使用内存缓存减少存储访问
const cache = new Map();

async function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await chrome.storage.local.get(key);
  cache.set(key, data[key]);
  return data[key];
}
```
