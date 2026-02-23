# Bing Tools - Chrome浏览器插件

Bing图片下载与全屏工具 - 一键下载必应每日美图，支持背景全屏显示

## 功能特性

### 1. 全屏显示功能
- 一键切换Bing背景图片全屏显示
- 支持浏览器全屏模式同步切换
- ESC键快速退出全屏
- 自动保存上次状态

### 2. 图片下载功能
- 在Bing首页添加下载按钮
- 支持多种分辨率选择（UHD/1920x1080/1366x768/1280x720）
- 自定义图片命名规则
- 支持多语言界面

### 3. 国际化支持
- 简体中文 (zh_CN)
- 英语 (en)
- 韩语 (ko)
- 日语 (ja)
- 法语 (fr)

## 项目结构

```
BingTools/
├── manifest.json              # 扩展配置文件
├── src/
│   ├── background/            # Service Worker
│   │   ├── service-worker.js  # 主入口
│   │   └── config.js          # 配置常量
│   ├── content/               # 内容脚本
│   │   ├── bing-fullscreen.js # 全屏功能
│   │   ├── bing-fullscreen.css
│   │   ├── bing-download.js   # 下载功能
│   │   └── bing-download.css
│   ├── popup/                 # 弹窗界面
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── shared/                # 共享模块
│       ├── constants.js       # 常量定义
│       ├── i18n.js            # 国际化工具
│       └── utils.js           # 工具函数
├── assets/
│   └── icons/                 # 图标文件
│       ├── icon.svg           # SVG源文件
│       ├── icon16.png         # 16x16 像素
│       ├── icon32.png         # 32x32 像素
│       ├── icon48.png         # 48x48 像素
│       ├── icon128.png        # 128x128 像素
│       ├── generate_icons.py  # 图标生成脚本
│       └── README.md          # 图标生成说明
├── _locales/                  # 国际化文件
│   ├── en/messages.json
│   ├── zh_CN/messages.json
│   ├── ko/messages.json
│   ├── ja/messages.json
│   └── fr/messages.json
├── rules/                     # 开发规范
│   ├── README.md
│   ├── 01-manifest-rules.md
│   ├── 02-content-script-rules.md
│   ├── 03-background-script-rules.md
│   ├── 04-popup-rules.md
│   ├── 05-security-rules.md
│   └── 06-code-style-rules.md
├── docs/                      # 项目文档
│   └── BingTools-安装使用说明.md
├── original_code/             # 原始油猴脚本代码
│   ├── bingFullScreenImg.js   # 全屏功能原始脚本
│   └── bingImgDownload.js     # 下载功能原始脚本
└── dist/                      # 构建输出目录（构建后生成）
    └── ...                    # 可直接加载的扩展包文件
```

### 目录说明

- **`original_code/`** - 存放原始油猴(Tampermonkey)插件代码，包含 `bingFullScreenImg.js`（全屏功能）和 `bingImgDownload.js`（下载功能）。当前 Chrome 扩展项目基于这些原始功能进行架构重构和功能增强，按照 Chrome Extensions API v3 规范重新实现。这些代码作为项目演进的历史参考和功能对照。

- **`dist/`** - 项目构建打包后生成的输出目录，包含可直接加载到 Chrome 浏览器的扩展包文件。该目录在运行构建命令后自动生成。

## 安装说明

### 开发者模式安装

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目文件夹 `BingTools`
5. 扩展安装成功，工具栏会出现Bing Tools图标

### 图标生成

扩展需要PNG格式的图标文件，请按以下步骤生成：

1. 打开 `assets/icons/icon.svg`
2. 使用在线转换工具（如 https://convertio.co/zh/svg-png/）
3. 生成以下尺寸的PNG文件：
   - icon16.png (16x16)
   - icon32.png (32x32)
   - icon48.png (48x48)
   - icon128.png (128x128)
4. 将生成的文件保存到 `assets/icons/` 目录

或者使用提供的Python脚本生成：

```bash
cd assets/icons
python generate_icons.py
```

## 使用方法

### 全屏功能
1. 访问 Bing 首页 (https://www.bing.com)
2. 点击左下角的"开启背景全屏"按钮
3. 页面背景将全屏显示，同时进入浏览器全屏模式
4. 再次点击按钮或按ESC键退出全屏

### 下载功能
1. 访问 Bing 首页
2. 点击右上角的"下载今日必应图片"按钮
3. 图片将自动下载到默认下载文件夹
4. 右键点击下载按钮可打开设置菜单，自定义：
   - 图片分辨率
   - 文件命名规则
   - 文件名连接符

### Popup界面
1. 点击Chrome工具栏的Bing Tools图标
2. 可以开关各项功能
3. 点击"刷新页面"按钮刷新当前Bing页面

## 技术规范

本项目遵循Chrome Extensions API v3规范：

- **Manifest版本**: V3
- **Service Worker**: 替代Background Pages
- **CSP策略**: 强制启用，禁用eval及内联脚本
- **模块化**: 严格隔离popup/content/background目录
- **通信**: 各组件通过chrome.runtime message passing通信

详细规范请查看 `rules/` 目录下的文档。

## 开发规范

### 命名空间约定
- 全屏功能: `bt-fs-*`
- 下载功能: `bt-dl-*`

### 代码风格
- JavaScript: ES2020+，使用ES Modules
- CSS: 原生CSS，使用`!important`确保样式优先级
- HTML: 语义化标签

## 浏览器兼容性

- Chrome 88+
- Edge 88+
- 其他基于Chromium的浏览器

## 许可证

MIT License

## 更新日志

### v1.0.0 (2026-02-23)
- 初始版本发布
- 基于原始油猴脚本功能重构
- 集成全屏显示功能
- 集成图片下载功能
- 支持多语言
- 符合Chrome Extensions API v3规范
