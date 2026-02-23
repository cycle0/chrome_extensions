# Chrome插件 代码结构和可维护性规范

## 1. 项目目录结构

### 1.1 标准目录结构
```
chromePlugin/
├── manifest.json              # 扩展配置文件
├── src/
│   ├── background/            # Service Worker
│   │   ├── service-worker.js  # 主入口
│   │   ├── handlers/          # 消息处理器
│   │   │   ├── message-handler.js
│   │   │   └── download-handler.js
│   │   └── utils/             # 工具函数
│   │       └── storage.js
│   ├── content/               # 内容脚本
│   │   ├── bing-fullscreen.js
│   │   ├── bing-fullscreen.css
│   │   ├── bing-download.js
│   │   ├── bing-download.css
│   │   └── utils/             # 内容脚本工具
│   │       └── dom-helpers.js
│   ├── popup/                 # 弹窗界面
│   │   ├── popup.html
│   │   ├── popup.css
│   │   ├── popup.js
│   │   └── components/        # UI组件
│   │       └── toggle-switch.js
│   ├── options/               # 选项页面
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   └── shared/                # 共享代码
│       ├── constants.js       # 常量定义
│       ├── utils.js           # 通用工具
│       └── i18n.js            # 国际化
├── assets/                    # 静态资源
│   ├── icons/                 # 图标文件
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── images/                # 图片资源
├── _locales/                  # 国际化文件
│   ├── en/
│   │   └── messages.json
│   ├── zh_CN/
│   │   └── messages.json
│   └── ja/
│       └── messages.json
├── rules/                     # 开发规范文档
│   ├── 01-manifest-rules.md
│   ├── 02-content-script-rules.md
│   ├── 03-background-script-rules.md
│   ├── 04-popup-rules.md
│   ├── 05-security-rules.md
│   └── 06-code-style-rules.md
└── docs/                      # 项目文档
    ├── README.md
    ├── CHANGELOG.md
    └── DEVELOPMENT.md
```

### 1.2 目录职责说明
| 目录 | 职责 |
|------|------|
| `src/background/` | Service Worker代码，处理后台逻辑 |
| `src/content/` | 内容脚本，操作网页DOM |
| `src/popup/` | 弹窗界面代码 |
| `src/options/` | 选项页面代码 |
| `src/shared/` | 各组件共享的代码 |
| `assets/` | 静态资源文件 |
| `_locales/` | 国际化翻译文件 |
| `rules/` | 开发规范和最佳实践 |

## 2. 命名规范

### 2.1 文件命名
| 类型 | 规范 | 示例 |
|------|------|------|
| JavaScript | kebab-case | `message-handler.js` |
| CSS | kebab-case | `popup-style.css` |
| HTML | kebab-case | `options-page.html` |
| 图片 | kebab-case | `icon-16.png` |
| 类文件 | PascalCase | `MessageHandler.js` |

### 2.2 变量命名
```javascript
// 常量 - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const STORAGE_KEY_SETTINGS = 'bingTools_settings';

// 变量 - camelCase
let isFullscreenMode = false;
let currentImageUrl = '';

// 布尔变量 - 使用is/has/should前缀
let isEnabled = true;
let hasPermission = false;
let shouldRefresh = false;

// 数组 - 使用复数名词
const imageUrls = [];
const settingsList = [];

// 函数 - 动词开头
function toggleFullscreen() { }
function getImageUrl() { }
function setSettings() { }
function handleClick() { }

// 类 - PascalCase
class StorageManager { }
class MessageHandler { }
class DownloadManager { }

// 私有成员 - 下划线前缀（约定）
class MyClass {
  constructor() {
    this._privateVar = 0;
  }
  
  _privateMethod() { }
}
```

### 2.3 CSS命名
```css
/* BEM命名法：Block__Element--Modifier */

/* Block */
.popup-container { }
.setting-item { }
.toggle-switch { }

/* Element */
.popup-container__header { }
.setting-item__label { }
.toggle-switch__slider { }

/* Modifier */
.setting-item--active { }
.toggle-switch--disabled { }
.btn--primary { }
.btn--secondary { }

/* 状态类 */
.is-hidden { display: none !important; }
.is-visible { display: block !important; }
.is-active { }
.is-disabled { }
```

## 3. 代码组织

### 3.1 文件结构
```javascript
/**
 * @fileoverview 文件功能描述
 * @description 详细说明
 * @author Author Name
 */

// 1. 导入部分
import { helper } from './utils.js';
import { CONFIG } from './constants.js';

// 2. 常量定义
const LOCAL_CONSTANT = 'value';

// 3. 类/函数定义
class MyClass {
  // 构造函数
  constructor() { }
  
  // 公共方法
  publicMethod() { }
  
  // 私有方法
  _privateMethod() { }
}

// 4. 函数定义
function helperFunction() { }

// 5. 事件监听
chrome.runtime.onMessage.addListener(handleMessage);

// 6. 初始化
document.addEventListener('DOMContentLoaded', init);
```

### 3.2 模块化组织
```javascript
// constants.js - 常量定义
export const CONFIG = {
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    SETTINGS: 'bingTools_settings'
  }
};

export const ACTIONS = {
  DOWNLOAD: 'download',
  GET_SETTINGS: 'getSettings',
  SET_SETTINGS: 'setSettings'
};

// utils.js - 工具函数
export function debounce(fn, delay) { }
export function throttle(fn, limit) { }
export function formatDate(date) { }

// storage.js - 存储管理
import { CONFIG } from '../shared/constants.js';

export class StorageManager {
  async get(key) { }
  async set(key, value) { }
  async remove(key) { }
}

// 主文件
import { CONFIG, ACTIONS } from './shared/constants.js';
import { StorageManager } from './utils/storage.js';
```

## 4. 注释规范

### 4.1 文件头注释
```javascript
/**
 * @fileoverview 下载管理器
 * @description 处理图片下载相关功能，包括权限申请、
 *              文件名生成、下载状态跟踪
 * @author Bing Tools Team
 * @version 1.0.0
 */
```

### 4.2 函数注释（JSDoc）
```javascript
/**
 * 下载图片到本地
 * @param {string} url - 图片URL
 * @param {string} filename - 保存的文件名
 * @param {Object} options - 下载选项
 * @param {boolean} options.saveAs - 是否显示保存对话框
 * @returns {Promise<number>} 下载任务ID
 * @throws {Error} 当URL无效或权限不足时抛出
 * @example
 * const id = await downloadImage('https://example.com/img.jpg', 'image.jpg');
 */
async function downloadImage(url, filename, options = {}) {
  // 实现...
}
```

### 4.3 行内注释
```javascript
// 好的注释：解释"为什么"
// 由于Chrome限制，必须使用chrome.downloads API
const downloadId = await chrome.downloads.download({ url, filename });

// 不好的注释：重复代码
// 设置变量x为5
let x = 5;

// 好的注释：复杂逻辑说明
// 优先从URL参数获取日期，失败则使用系统时间
const date = extractDateFromUrl(url) || new Date();
```

## 5. 错误处理

### 5.1 错误处理模式
```javascript
// 同步错误处理
try {
  const result = riskyOperation();
  processResult(result);
} catch (error) {
  console.error('[BingTools] 操作失败:', error.message);
  showErrorToUser(error.message);
}

// 异步错误处理
try {
  const result = await asyncOperation();
  processResult(result);
} catch (error) {
  console.error('[BingTools] 异步操作失败:', error);
  // 根据错误类型处理
  if (error.name === 'PermissionError') {
    await requestPermission();
  } else {
    showErrorToUser('操作失败，请重试');
  }
}

// Promise错误处理
fetchData()
  .then(processData)
  .then(saveData)
  .catch(error => {
    console.error('[BingTools] 数据处理失败:', error);
    rollbackChanges();
  });
```

### 5.2 自定义错误类
```javascript
class BingToolsError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'BingToolsError';
    this.code = code;
  }
}

class PermissionError extends BingToolsError {
  constructor(message) {
    super(message, 'PERMISSION_DENIED');
    this.name = 'PermissionError';
  }
}

// 使用
throw new PermissionError('需要下载权限');
```

## 6. 日志规范

### 6.1 日志级别
```javascript
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const currentLevel = LOG_LEVELS.DEBUG;

function log(level, ...args) {
  if (level >= currentLevel) {
    const prefix = '[BingTools]';
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(prefix, ...args);
        break;
      case LOG_LEVELS.INFO:
        console.log(prefix, ...args);
        break;
      case LOG_LEVELS.WARN:
        console.warn(prefix, ...args);
        break;
      case LOG_LEVELS.ERROR:
        console.error(prefix, ...args);
        break;
    }
  }
}

// 使用
log(LOG_LEVELS.INFO, '初始化完成');
log(LOG_LEVELS.ERROR, '下载失败:', error);
```

### 6.2 结构化日志
```javascript
function logEvent(event, data = {}) {
  console.log('[BingTools]', {
    event,
    timestamp: new Date().toISOString(),
    version: chrome.runtime.getManifest().version,
    ...data
  });
}

// 使用
logEvent('download_start', { url: imageUrl });
logEvent('download_complete', { id: downloadId, filename });
```

## 7. 配置管理

### 7.1 配置分层
```javascript
// 默认配置
const DEFAULT_CONFIG = {
  fullscreen: {
    enabled: false,
    autoFullscreen: false,
    zIndex: 9998
  },
  download: {
    resolution: 'UHD',
    namingRules: {
      baseName: true,
      dateInfo: true
    }
  }
};

// 用户配置（从存储加载）
let userConfig = {};

// 运行时配置（临时修改）
const runtimeConfig = {};

// 获取配置（带默认值）
function getConfig(path) {
  const keys = path.split('.');
  let value = userConfig;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }
  
  // 回退到默认配置
  if (value === undefined) {
    value = DEFAULT_CONFIG;
    for (const key of keys) {
      value = value?.[key];
    }
  }
  
  return value;
}
```

## 8. 版本管理

### 8.1 版本号规范
遵循语义化版本（SemVer）：`MAJOR.MINOR.PATCH`

```javascript
const VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  toString() {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
};
```

### 8.2 更新检查
```javascript
async function checkForUpdates() {
  const manifest = chrome.runtime.getManifest();
  const currentVersion = manifest.version;
  
  try {
    const response = await fetch('https://api.example.com/version');
    const { latestVersion } = await response.json();
    
    if (compareVersions(latestVersion, currentVersion) > 0) {
      showUpdateNotification(latestVersion);
    }
  } catch (error) {
    console.error('[BingTools] 检查更新失败:', error);
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}
```

## 9. 测试规范

### 9.1 单元测试结构
```javascript
// __tests__/storage.test.js
describe('StorageManager', () => {
  let storage;
  
  beforeEach(() => {
    storage = new StorageManager();
    // 清理存储
    chrome.storage.local.clear();
  });
  
  describe('get', () => {
    it('should return stored value', async () => {
      await chrome.storage.local.set({ key: 'value' });
      const result = await storage.get('key');
      expect(result).toBe('value');
    });
    
    it('should return undefined for non-existent key', async () => {
      const result = await storage.get('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
```

## 10. 代码审查清单

### 10.1 提交前检查
- [ ] 代码符合命名规范
- [ ] 所有函数有适当的注释
- [ ] 错误处理完善
- [ ] 无console.log调试代码
- [ ] 无未使用的变量/导入
- [ ] 代码格式化一致

### 10.2 代码审查要点
- [ ] 功能实现是否正确
- [ ] 是否有潜在的安全问题
- [ ] 性能是否可优化
- [ ] 是否遵循单一职责原则
- [ ] 测试是否覆盖主要场景
- [ ] 文档是否同步更新
