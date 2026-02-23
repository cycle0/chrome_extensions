# Chrome插件 安全性和权限管理规范

## 1. 安全原则

### 1.1 核心原则
- **最小权限原则**：只申请必需的权限
- **防御性编程**：不信任任何外部输入
- **数据隔离**：内容脚本与页面脚本隔离
- **安全通信**：所有消息传递需验证来源

### 1.2 安全目标
| 目标 | 说明 |
|------|------|
| 用户数据保护 | 不收集、不泄露用户隐私数据 |
| 代码完整性 | 防止恶意代码注入 |
| 通信安全 | 确保组件间通信可信 |
| 资源安全 | 安全处理外部资源 |

## 2. 权限管理

### 2.1 权限分类

#### 必需权限（permissions）
```json
{
  "permissions": [
    "storage",        // 本地数据存储
    "activeTab"       // 临时访问当前标签页
  ]
}
```

#### 可选权限（optional_permissions）
```json
{
  "optional_permissions": [
    "downloads",      // 文件下载
    "contextMenus",   // 右键菜单
    "scripting"       // 动态脚本注入
  ]
}
```

#### 主机权限（host_permissions）
```json
{
  "host_permissions": [
    "*://*.bing.com/*"  // 仅Bing域名
  ]
}
```

### 2.2 权限申请规范

#### 最小化原则
```javascript
// 不推荐：申请过多权限
"permissions": [
  "tabs",           // 不需要所有标签页信息
  "webNavigation",  // 不需要导航事件
  "*://*/*"         // 不需要所有网站
]

// 推荐：精确申请
"permissions": [
  "storage",
  "activeTab"
],
"host_permissions": [
  "*://*.bing.com/*"
]
```

#### 延迟申请可选权限
```javascript
/**
 * 按需申请下载权限
 */
async function requestDownloadPermission() {
  try {
    const granted = await chrome.permissions.request({
      permissions: ['downloads']
    });
    return granted;
  } catch (error) {
    console.error('[BingTools] 权限申请失败:', error);
    return false;
  }
}

// 使用
async function downloadImage(url, filename) {
  // 检查权限
  const hasPermission = await chrome.permissions.contains({
    permissions: ['downloads']
  });
  
  if (!hasPermission) {
    const granted = await requestDownloadPermission();
    if (!granted) {
      throw new Error('需要下载权限才能保存图片');
    }
  }
  
  // 执行下载
  return await chrome.downloads.download({ url, filename });
}
```

### 2.3 权限检查
```javascript
/**
 * 检查是否拥有指定权限
 * @param {Array} permissions - 权限列表
 * @returns {Promise<boolean>}
 */
async function checkPermissions(permissions) {
  try {
    return await chrome.permissions.contains({ permissions });
  } catch (error) {
    console.error('[BingTools] 权限检查失败:', error);
    return false;
  }
}

/**
 * 验证主机权限
 * @param {string} url - 要检查的URL
 * @returns {Promise<boolean>}
 */
async function checkHostPermission(url) {
  try {
    return await chrome.permissions.contains({
      origins: [url]
    });
  } catch (error) {
    return false;
  }
}
```

## 3. 内容安全策略（CSP）

### 3.1 默认CSP配置
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 3.2 CSP指令说明
| 指令 | 说明 | 推荐值 |
|------|------|--------|
| `script-src` | JavaScript来源 | `'self'` |
| `object-src` | 插件来源 | `'self'` |
| `style-src` | CSS来源 | `'self'` `'unsafe-inline'`（仅必要时） |
| `img-src` | 图片来源 | `'self'` `data:` `https:` |
| `connect-src` | 连接目标 | `'self'` `https://api.example.com` |

### 3.3 禁止的危险操作
```javascript
// 禁止：使用eval
eval('console.log("危险")');

// 禁止：new Function
const fn = new Function('a', 'b', 'return a + b');

// 禁止：内联事件处理器
// <button onclick="handleClick()">点击</button>

// 禁止：setTimeout/setInterval字符串
setTimeout('console.log("危险")', 1000);
```

### 3.4 安全的替代方案
```javascript
// 替代eval：使用JSON.parse解析JSON
const data = JSON.parse(jsonString);

// 替代new Function：使用箭头函数
const add = (a, b) => a + b;

// 替代内联事件：使用addEventListener
button.addEventListener('click', handleClick);

// 替代字符串setTimeout：使用函数
setTimeout(() => console.log('安全'), 1000);
```

## 4. 输入验证与转义

### 4.1 URL验证
```javascript
/**
 * 验证URL是否安全
 * @param {string} url - 要验证的URL
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    
    // 只允许http和https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // 检查是否为Bing域名
    if (!parsed.hostname.endsWith('bing.com')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// 使用
function processImageUrl(url) {
  if (!isValidUrl(url)) {
    throw new Error('无效的URL');
  }
  // 处理URL...
}
```

### 4.2 HTML转义
```javascript
/**
 * 转义HTML特殊字符
 * @param {string} text - 原始文本
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 使用
const userInput = '<script>alert("xss")</script>';
element.innerHTML = `<p>${escapeHtml(userInput)}</p>`;
```

### 4.3 文件名清理
```javascript
/**
 * 清理文件名中的非法字符
 * @param {string} filename - 原始文件名
 * @returns {string}
 */
function sanitizeFilename(filename) {
  // 移除路径分隔符和非法字符
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^(con|prn|aux|nul|com\d|lpt\d)$/i, '_$1')
    .substring(0, 255);
}
```

## 5. 消息传递安全

### 5.1 消息来源验证
```javascript
// Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 验证发送者
  if (!sender.id || sender.id !== chrome.runtime.id) {
    console.warn('[BingTools] 拒绝未知来源的消息');
    return false;
  }
  
  // 验证消息格式
  if (!request.action || typeof request.action !== 'string') {
    sendResponse({ error: 'Invalid message format' });
    return false;
  }
  
  // 处理消息...
});
```

### 5.2 消息格式规范
```javascript
// 标准消息格式
const message = {
  from: 'popup' | 'content' | 'options' | 'background',
  to: 'popup' | 'content' | 'options' | 'background',
  action: 'actionName',
  data: { /* 验证后的数据 */ },
  timestamp: Date.now()
};

// 响应格式
const response = {
  success: true | false,
  data: { /* 响应数据 */ },
  error: '错误信息'
};
```

### 5.3 敏感操作验证
```javascript
/**
 * 执行敏感操作前的验证
 * @param {Object} request - 请求对象
 * @param {Object} sender - 发送者信息
 */
function verifySensitiveOperation(request, sender) {
  // 验证发送者身份
  if (sender.origin && !sender.origin.includes('chrome-extension://')) {
    throw new Error('非法发送者');
  }
  
  // 验证操作类型
  const allowedActions = ['download', 'getSettings', 'setSettings'];
  if (!allowedActions.includes(request.action)) {
    throw new Error('不允许的操作');
  }
  
  // 验证数据格式
  if (request.data && typeof request.data !== 'object') {
    throw new Error('无效的数据格式');
  }
}
```

## 6. 数据存储安全

### 6.1 存储使用规范
```javascript
// 推荐：使用chrome.storage
await chrome.storage.local.set({ key: value });

// 不推荐：使用localStorage
localStorage.setItem('key', value);

// 不推荐：使用全局变量
window.extensionData = { key: value };
```

### 6.2 敏感数据处理
```javascript
/**
 * 安全存储敏感数据
 * @param {string} key - 存储键
 * @param {*} data - 要存储的数据
 */
async function secureStore(key, data) {
  // 对敏感数据进行加密（如果需要）
  const encrypted = await encryptIfSensitive(data);
  
  await chrome.storage.local.set({ [key]: encrypted });
}

/**
 * 安全读取敏感数据
 * @param {string} key - 存储键
 */
async function secureRetrieve(key) {
  const result = await chrome.storage.local.get(key);
  const data = result[key];
  
  // 解密（如果需要）
  return await decryptIfSensitive(data);
}
```

### 6.3 数据清理
```javascript
/**
 * 清理扩展数据
 */
async function clearExtensionData() {
  // 清理存储
  await chrome.storage.local.clear();
  
  // 清理缓存
  await chrome.storage.session?.clear();
  
  console.log('[BingTools] 扩展数据已清理');
}

// 卸载时清理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'chrome_update') {
    // Chrome更新时保留数据
    return;
  }
  
  if (details.reason === 'install') {
    // 首次安装，确保干净状态
    clearExtensionData();
  }
});
```

## 7. 外部资源安全

### 7.1 资源加载规范
```javascript
// 禁止：加载远程脚本
// manifest.json
{
  "content_scripts": [{
    "js": ["https://example.com/external.js"]  // 禁止！
  }]
}

// 推荐：所有资源打包在扩展内
{
  "web_accessible_resources": [{
    "resources": ["assets/images/*"],
    "matches": ["*://*.bing.com/*"]
  }]
}
```

### 7.2 API请求安全
```javascript
/**
 * 安全的API请求
 * @param {string} url - API地址
 * @param {Object} options - 请求选项
 */
async function secureFetch(url, options = {}) {
  // 验证URL
  if (!isValidApiUrl(url)) {
    throw new Error('无效的API地址');
  }
  
  // 设置安全头部
  const secureOptions = {
    ...options,
    headers: {
      ...options.headers,
      'X-Extension-Version': chrome.runtime.getManifest().version
    }
  };
  
  try {
    const response = await fetch(url, secureOptions);
    
    // 验证响应
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[BingTools] API请求失败:', error);
    throw error;
  }
}
```

## 8. 安全审计清单

### 8.1 开发阶段检查
- [ ] 权限申请遵循最小化原则
- [ ] CSP配置正确，无 `unsafe-eval` 或 `unsafe-inline`
- [ ] 所有用户输入经过验证
- [ ] 不使用 `eval()` 或 `new Function()`
- [ ] 消息传递验证来源
- [ ] 敏感数据使用 `chrome.storage`
- [ ] 不使用全局变量存储敏感信息

### 8.2 发布前检查
- [ ] 移除所有调试代码和console.log
- [ ] 验证所有外部资源已打包
- [ ] 检查manifest.json权限列表
- [ ] 测试权限申请流程
- [ ] 验证错误处理机制
- [ ] 检查隐私政策链接（如需要）

### 8.3 运行时安全
- [ ] 监控异常行为
- [ ] 定期审查权限使用
- [ ] 及时更新依赖
- [ ] 响应安全漏洞报告

## 9. 常见安全漏洞防护

### 9.1 XSS防护
```javascript
// 使用textContent而非innerHTML
element.textContent = userInput;

// 必须使用innerHTML时先转义
element.innerHTML = escapeHtml(userInput);

// 避免使用危险的DOM API
// 不推荐：element.insertAdjacentHTML('beforeend', html);
// 推荐：element.appendChild(document.createTextNode(text));
```

### 9.2 点击劫持防护
```javascript
// 验证操作来源
function handleImportantAction(event) {
  // 确保是用户真实点击
  if (!event.isTrusted) {
    return;
  }
  
  // 执行操作...
}
```

### 9.3 原型污染防护
```javascript
// 使用Object.create(null)创建无原型对象
const safeObj = Object.create(null);

// 或使用Map代替对象
const safeMap = new Map();

// 验证属性名
function safeSetProperty(obj, key, value) {
  if (key === '__proto__' || key === 'constructor') {
    throw new Error('非法属性名');
  }
  obj[key] = value;
}
```
