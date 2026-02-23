# Chrome浏览器插件开发规范

## 规范概述

本规范定义了Chrome浏览器插件（Chrome Extension）开发的技术标准和最佳实践，适用于Bing Tools项目的开发工作。

## 规范文件列表

| 序号 | 文件名 | 内容概要 |
|------|--------|----------|
| 1 | [01-manifest-rules.md](./01-manifest-rules.md) | manifest.json配置规范，包括必需字段、权限配置、CSP设置等 |
| 2 | [02-content-script-rules.md](./02-content-script-rules.md) | 内容脚本开发规范，包括DOM操作、消息通信、状态管理等 |
| 3 | [03-background-script-rules.md](./03-background-script-rules.md) | Service Worker开发规范，包括生命周期、消息处理、存储管理等 |
| 4 | [04-popup-rules.md](./04-popup-rules.md) | 弹窗界面开发规范，包括HTML/CSS/JS规范、设计规范、交互规范等 |
| 5 | [05-security-rules.md](./05-security-rules.md) | 安全性和权限管理规范，包括CSP、输入验证、消息安全等 |
| 6 | [06-code-style-rules.md](./06-code-style-rules.md) | 代码结构和可维护性规范，包括目录结构、命名规范、注释规范等 |

## 快速开始

### 1. 阅读顺序
建议按以下顺序阅读规范：
1. **01-manifest-rules.md** - 了解扩展配置
2. **06-code-style-rules.md** - 了解项目结构
3. **05-security-rules.md** - 了解安全要求
4. **02-content-script-rules.md** - 了解内容脚本开发
5. **03-background-script-rules.md** - 了解Service Worker开发
6. **04-popup-rules.md** - 了解弹窗界面开发

### 2. 项目初始化
根据规范创建项目结构：
```bash
# 创建目录结构
mkdir -p src/{background,content,popup,options,shared}
mkdir -p assets/icons
mkdir -p _locales/{en,zh_CN,ja}
```

### 3. 开发流程
1. 配置 `manifest.json`
2. 开发内容脚本（如果需要操作页面）
3. 开发Service Worker（后台逻辑）
4. 开发Popup界面（用户交互）
5. 添加国际化支持
6. 安全审查

## 技术栈

- **Manifest版本**: V3
- **JavaScript**: ES2020+，使用ES Modules
- **CSS**: 原生CSS，使用CSS变量
- **HTML**: 语义化HTML5

## 关键约束

1. **Service Worker替代Background Pages**
   - 事件驱动，不保持常驻状态
   - 使用 `chrome.alarms` 替代 `setInterval`

2. **禁用eval及内联脚本**
   - 禁止 `eval()` 和 `new Function()`
   - 禁止内联事件处理器

3. **强制启用CSP策略**
   - `script-src 'self'`
   - `object-src 'self'`

4. **模块化分层结构**
   - 严格隔离 `popup/`、`content/`、`background/` 目录
   - 各组件仅通过 `chrome.runtime` message passing 通信
   - 禁止跨域直接访问DOM或共享全局变量

## 命名空间约定

为避免与页面代码冲突，使用以下命名空间前缀：

| 组件 | 前缀 | 示例 |
|------|------|------|
| 全屏功能 | `bt-fs-*` | `bt-fs-toggle` |
| 下载功能 | `bt-dl-*` | `bt-dl-btn` |
| 弹窗界面 | `bt-popup-*` | `bt-popup-header` |
| 选项页面 | `bt-options-*` | `bt-options-form` |

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-02-23 | 初始版本，包含6个规范文档 |

## 参考资源

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Overview](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
