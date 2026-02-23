# Chrome插件 Manifest.json 配置规范

## 1. 基础要求

### 1.1 必需字段
| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `manifest_version` | integer | 固定为3 | `3` |
| `name` | string | 扩展名称，使用国际化键 | `"__MSG_extName__"` |
| `version` | string | 语义化版本号 | `"1.0.0"` |
| `description` | string | 功能描述，使用国际化键 | `"__MSG_extDescription__"` |

### 1.2 推荐字段
| 字段 | 类型 | 说明 |
|------|------|------|
| `default_locale` | string | 默认语言，如 `"zh_CN"` |
| `icons` | object | 多尺寸图标配置 |
| `permissions` | array | 必需权限列表 |
| `optional_permissions` | array | 可选权限列表 |
| `host_permissions` | array | 主机权限（匹配模式） |
| `content_scripts` | array | 内容脚本配置 |
| `background` | object | Service Worker配置 |
| `action` | object | 工具栏按钮配置 |
| `options_page` | string | 选项页面路径 |
| `web_accessible_resources` | array | 网页可访问资源 |

## 2. 标准配置模板

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "version": "1.0.0",
  "description": "__MSG_extDescription__",
  "default_locale": "zh_CN",
  
  "icons": {
    "16": "assets/icons/icon16.png",
    "32": "assets/icons/icon32.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "optional_permissions": [
    "downloads"
  ],
  
  "host_permissions": [
    "*://*.bing.com/*"
  ],
  
  "content_scripts": [
    {
      "matches": ["*://*.bing.com/*"],
      "js": ["src/content/bing-fullscreen.js"],
      "css": ["src/content/bing-fullscreen.css"],
      "run_at": "document_end",
      "all_frames": false
    },
    {
      "matches": ["*://*.bing.com/*"],
      "js": ["src/content/bing-download.js"],
      "css": ["src/content/bing-download.css"],
      "run_at": "document_end",
      "all_frames": false
    }
  ],
  
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"
  },
  
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png"
    },
    "default_title": "__MSG_extName__"
  },
  
  "options_page": "src/options/options.html",
  
  "web_accessible_resources": [
    {
      "resources": ["assets/images/*"],
      "matches": ["*://*.bing.com/*"]
    }
  ],
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

## 3. 权限配置规范

### 3.1 权限最小化原则
- 只申请必需的权限
- 使用 `optional_permissions` 延迟申请敏感权限
- 定期审查权限使用情况

### 3.2 常用权限说明
| 权限 | 用途 | 是否必需 |
|------|------|----------|
| `storage` | 本地数据存储 | 是 |
| `activeTab` | 临时访问当前标签页 | 是 |
| `scripting` | 动态注入脚本 | 可选 |
| `downloads` | 文件下载 | 可选 |
| `contextMenus` | 右键菜单 | 可选 |

### 3.3 主机权限规范
```json
{
  "host_permissions": [
    "*://*.bing.com/*"
  ]
}
```
- 使用具体域名，避免 `*://*/*`
- 仅包含实际需要访问的域名

## 4. 内容脚本配置规范

### 4.1 配置项说明
| 字段 | 类型 | 说明 |
|------|------|------|
| `matches` | array | URL匹配模式数组 |
| `js` | array | 注入的JS文件路径 |
| `css` | array | 注入的CSS文件路径 |
| `run_at` | string | 注入时机：`document_start`/`document_end`/`document_idle` |
| `all_frames` | boolean | 是否注入所有iframe |
| `match_about_blank` | boolean | 是否匹配about:blank |

### 4.2 注入时机选择
- `document_start`: DOM构建前注入，用于拦截或修改页面加载
- `document_end`: DOM构建完成后注入，推荐用于大多数场景
- `document_idle`: 浏览器空闲时注入，用于非紧急任务

## 5. Service Worker 配置规范

### 5.1 基础配置
```json
{
  "background": {
    "service_worker": "src/background/service-worker.js",
    "type": "module"
  }
}
```

### 5.2 关键约束
- 必须使用 `"type": "module"` 启用ES模块
- Service Worker 是事件驱动的，不保持常驻状态
- 避免在全局作用域执行长时间运行代码

## 6. 国际化配置规范

### 6.1 目录结构
```
_locales/
├── en/
│   └── messages.json
├── zh_CN/
│   └── messages.json
└── ja/
    └── messages.json
```

### 6.2 messages.json 格式
```json
{
  "extName": {
    "message": "Bing Tools",
    "description": "Extension name"
  },
  "extDescription": {
    "message": "Bing图片下载与全屏工具",
    "description": "Extension description"
  }
}
```

### 6.3 使用方式
- manifest.json: `"__MSG_extName__"`
- JavaScript: `chrome.i18n.getMessage("extName")`
- HTML: 通过JS动态设置

## 7. 图标规范

### 7.1 必需尺寸
| 尺寸 | 用途 |
|------|------|
| 16x16 | 工具栏图标 |
| 32x32 | 工具栏图标（高分屏） |
| 48x48 | 扩展管理页面 |
| 128x128 | Chrome Web Store |

### 7.2 格式要求
- 格式：PNG（推荐）或 SVG
- 背景：透明
- 风格：简洁扁平化设计

## 8. 内容安全策略（CSP）

### 8.1 默认配置
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### 8.2 安全约束
- 禁止内联脚本（`unsafe-inline`）
- 禁止 `eval()` 和 `new Function()`
- 禁止远程脚本加载

## 9. 验证清单

创建或修改 manifest.json 后，请检查：

- [ ] `manifest_version` 为 3
- [ ] `name` 和 `description` 使用国际化键
- [ ] `version` 符合语义化版本规范
- [ ] 所有路径正确且文件存在
- [ ] 权限申请遵循最小化原则
- [ ] `content_security_policy` 配置正确
- [ ] 图标文件包含所有必需尺寸
- [ ] `_locales` 目录包含默认语言文件

## 10. 版本更新规范

### 10.1 版本号规则
遵循语义化版本（SemVer）：`MAJOR.MINOR.PATCH`
- MAJOR：不兼容的API更改
- MINOR：向后兼容的功能添加
- PATCH：向后兼容的问题修复

### 10.2 更新日志
每次版本更新需在 `CHANGELOG.md` 中记录：
- 版本号
- 更新日期
- 更新内容（新增/修复/优化）
- 兼容性说明
