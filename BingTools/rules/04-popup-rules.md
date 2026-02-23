# Chrome插件 弹窗界面（Popup）开发规范

## 1. 架构概述

Popup 是用户点击扩展图标时显示的界面，特点：
- 临时窗口，失去焦点即关闭
- 尺寸受限（推荐 400x300 至 600x400）
- 可以访问所有Chrome APIs
- 每次打开都是全新的HTML文档

## 2. 目录结构

```
src/popup/
├── popup.html          # HTML结构
├── popup.css           # 样式文件
├── popup.js            # 主脚本
├── components/
│   ├── toggle-switch.js  # 开关组件
│   └── setting-item.js   # 设置项组件
└── utils/
    └── i18n.js         # 国际化工具
```

## 3. HTML结构规范

### 3.1 基础模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bing Tools</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <!-- 头部 -->
    <header class="popup-header">
      <img src="../../assets/icons/icon32.png" alt="Logo" class="logo">
      <h1 data-i18n="extName">Bing Tools</h1>
      <span class="version">v1.0.0</span>
    </header>

    <!-- 主内容区 -->
    <main class="popup-content">
      <!-- 功能开关区 -->
      <section class="section">
        <h2 data-i18n="features">功能开关</h2>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name" data-i18n="fullscreenMode">全屏模式</span>
            <span class="setting-desc" data-i18n="fullscreenDesc">在页面显示背景全屏按钮</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="fullscreen-toggle">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-name" data-i18n="downloadBtn">下载按钮</span>
            <span class="setting-desc" data-i18n="downloadDesc">在页面显示图片下载按钮</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="download-toggle">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </section>

      <!-- 快捷操作区 -->
      <section class="section">
        <h2 data-i18n="quickActions">快捷操作</h2>
        <div class="action-buttons">
          <button id="open-options" class="btn btn-secondary" data-i18n="openOptions">
            打开设置
          </button>
          <button id="refresh-page" class="btn btn-primary" data-i18n="refreshPage">
            刷新页面
          </button>
        </div>
      </section>
    </main>

    <!-- 底部 -->
    <footer class="popup-footer">
      <a href="#" id="feedback-link" data-i18n="feedback">反馈问题</a>
      <a href="#" id="github-link" target="_blank">GitHub</a>
    </footer>
  </div>

  <script type="module" src="popup.js"></script>
</body>
</html>
```

### 3.2 HTML规范
- 使用语义化标签（header, main, section, footer）
- 所有文本使用 `data-i18n` 属性标记
- 避免使用内联样式
- 图片必须设置 alt 属性

## 4. CSS样式规范

### 4.1 基础样式
```css
/* 重置样式 - 避免使用 * 选择器 */
html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 容器尺寸 */
.popup-container {
  width: 360px;
  min-height: 300px;
  max-height: 600px;
  background: #ffffff;
  color: #333333;
}

/* 头部样式 */
.popup-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popup-header .logo {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.popup-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.popup-header .version {
  font-size: 12px;
  opacity: 0.8;
}
```

### 4.2 设置项样式
```css
/* 分区样式 */
.section {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.section h2 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.setting-info {
  flex: 1;
}

.setting-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.setting-desc {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
```

### 4.3 开关组件样式
```css
/* 切换开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: background-color 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #667eea;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(20px);
}
```

### 4.4 按钮样式
```css
/* 按钮基础 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd6;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

/* 按钮组 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons .btn {
  flex: 1;
}
```

## 5. JavaScript规范

### 5.1 主脚本结构
```javascript
/**
 * @fileoverview Popup主脚本
 */

import { I18n } from './utils/i18n.js';

class PopupManager {
  constructor() {
    this.elements = {};
    this.state = {
      settings: {},
      currentTab: null
    };
  }

  async init() {
    // 缓存DOM元素
    this.cacheElements();
    
    // 加载国际化
    I18n.localize();
    
    // 加载设置
    await this.loadSettings();
    
    // 绑定事件
    this.bindEvents();
    
    // 获取当前标签页
    await this.getCurrentTab();
  }

  cacheElements() {
    this.elements = {
      fullscreenToggle: document.getElementById('fullscreen-toggle'),
      downloadToggle: document.getElementById('download-toggle'),
      openOptionsBtn: document.getElementById('open-options'),
      refreshPageBtn: document.getElementById('refresh-page'),
      feedbackLink: document.getElementById('feedback-link'),
      githubLink: document.getElementById('github-link')
    };
  }

  bindEvents() {
    // 开关事件
    this.elements.fullscreenToggle?.addEventListener('change', (e) => {
      this.handleToggle('fullscreen', e.target.checked);
    });

    this.elements.downloadToggle?.addEventListener('change', (e) => {
      this.handleToggle('download', e.target.checked);
    });

    // 按钮事件
    this.elements.openOptionsBtn?.addEventListener('click', () => {
      this.openOptionsPage();
    });

    this.elements.refreshPageBtn?.addEventListener('click', () => {
      this.refreshCurrentPage();
    });

    // 链接事件
    this.elements.githubLink?.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/your-repo' });
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get('settings');
      this.state.settings = result.settings || {};
      this.updateUI();
    } catch (error) {
      console.error('[BingTools] 加载设置失败:', error);
    }
  }

  updateUI() {
    const { fullscreen, download } = this.state.settings;
    
    if (this.elements.fullscreenToggle) {
      this.elements.fullscreenToggle.checked = fullscreen?.enabled || false;
    }
    
    if (this.elements.downloadToggle) {
      this.elements.downloadToggle.checked = download?.enabled !== false;
    }
  }

  async handleToggle(feature, enabled) {
    try {
      // 更新设置
      this.state.settings[feature] = {
        ...this.state.settings[feature],
        enabled
      };
      
      await chrome.storage.local.set({ settings: this.state.settings });
      
      // 通知内容脚本
      if (this.state.currentTab?.id) {
        await chrome.tabs.sendMessage(this.state.currentTab.id, {
          to: 'content',
          action: 'toggleFeature',
          data: { feature, enabled }
        });
      }
    } catch (error) {
      console.error('[BingTools] 切换功能失败:', error);
    }
  }

  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.state.currentTab = tabs[0];
  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  async refreshCurrentPage() {
    if (this.state.currentTab?.id) {
      await chrome.tabs.reload(this.state.currentTab.id);
    }
    window.close();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupManager();
  popup.init();
});
```

### 5.2 国际化工具
```javascript
/**
 * @fileoverview 国际化工具
 */

export class I18n {
  static localize() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const message = chrome.i18n.getMessage(key);
      
      if (message) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.placeholder = message;
        } else {
          element.textContent = message;
        }
      }
    });
  }
}
```

## 6. 设计规范

### 6.1 尺寸规范
| 元素 | 尺寸 |
|------|------|
| Popup宽度 | 360px（推荐）至 400px |
| Popup最小高度 | 200px |
| Popup最大高度 | 600px |
| 头部高度 | 64px |
| 设置项内边距 | 12px 16px |
| 按钮高度 | 36px |
| 开关尺寸 | 44px x 24px |

### 6.2 颜色规范
```css
:root {
  /* 主色调 */
  --primary: #667eea;
  --primary-dark: #5a6fd6;
  
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-hover: #e8e8e8;
  
  /* 文字色 */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  
  /* 边框色 */
  --border: #e0e0e0;
  
  /* 状态色 */
  --success: #52c41a;
  --warning: #faad14;
  --error: #f5222d;
}
```

### 6.3 字体规范
| 元素 | 大小 | 字重 |
|------|------|------|
| 标题 | 18px | 600 |
| 分区标题 | 14px | 600 |
| 设置名称 | 14px | 500 |
| 设置描述 | 12px | 400 |
| 按钮文字 | 14px | 500 |
| 版本号 | 12px | 400 |

## 7. 交互规范

### 7.1 加载状态
```javascript
// 显示加载状态
function showLoading(element) {
  element.disabled = true;
  element.dataset.originalText = element.textContent;
  element.textContent = chrome.i18n.getMessage('loading');
}

// 恢复状态
function hideLoading(element) {
  element.disabled = false;
  element.textContent = element.dataset.originalText;
}
```

### 7.2 错误提示
```javascript
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}
```

### 7.3 动画效果
```css
/* 淡入动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.popup-container {
  animation: fadeIn 0.2s ease-out;
}

/* 开关过渡 */
.toggle-slider {
  transition: background-color 0.3s ease;
}

.toggle-slider::before {
  transition: transform 0.3s ease;
}
```

## 8. 性能优化

### 8.1 减少重绘
- 使用 `transform` 和 `opacity` 进行动画
- 避免在滚动时进行复杂计算
- 批量DOM操作

### 8.2 资源优化
- 图片使用适当尺寸
- CSS和JS压缩
- 使用 `defer` 或 `type="module"` 加载脚本

## 9. 可访问性

### 9.1 ARIA属性
```html
<button 
  id="toggle-btn"
  role="switch"
  aria-checked="false"
  aria-label="启用全屏模式">
  <span class="toggle-slider"></span>
</button>
```

### 9.2 键盘导航
- 确保所有交互元素可通过Tab键访问
- 提供可见的焦点样式
- 支持Enter和Space键激活按钮

## 10. 检查清单

- [ ] HTML使用语义化标签
- [ ] 所有文本支持国际化
- [ ] 样式使用CSS变量便于主题切换
- [ ] 交互元素有适当的反馈
- [ ] 错误有用户友好的提示
- [ ] 支持键盘导航
- [ ] 尺寸符合规范
- [ ] 颜色对比度符合WCAG标准
