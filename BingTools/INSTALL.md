# Bing Tools 安装指南

## 快速安装步骤

### 1. 验证文件完整性

确保以下所有文件都已正确创建：

```
BingTools/
├── manifest.json                    ✓
├── src/
│   ├── background/
│   │   ├── service-worker.js       ✓
│   │   └── config.js               ✓
│   ├── content/
│   │   ├── bing-fullscreen.js      ✓
│   │   ├── bing-fullscreen.css     ✓
│   │   ├── bing-download.js        ✓
│   │   └── bing-download.css       ✓
│   ├── popup/
│   │   ├── popup.html              ✓
│   │   ├── popup.css               ✓
│   │   └── popup.js                ✓
│   └── shared/
│       ├── constants.js            ✓
│       ├── i18n.js                 ✓
│       └── utils.js                ✓
├── assets/
│   └── icons/
│       ├── icon.svg                ✓
│       ├── icon16.png              ✓
│       ├── icon32.png              ✓
│       ├── icon48.png              ✓
│       ├── icon128.png             ✓
│       ├── generate_icons.py       ✓
│       └── README.md               ✓
├── _locales/
│   ├── en/messages.json            ✓
│   ├── zh_CN/messages.json         ✓
│   ├── ko/messages.json            ✓
│   ├── ja/messages.json            ✓
│   └── fr/messages.json            ✓
├── rules/                          ✓
│   ├── README.md
│   ├── 01-manifest-rules.md
│   ├── 02-content-script-rules.md
│   ├── 03-background-script-rules.md
│   ├── 04-popup-rules.md
│   ├── 05-security-rules.md
│   └── 06-code-style-rules.md
├── docs/                           ✓
│   └── BingTools-安装使用说明.md
├── original_code/                  ✓
│   ├── bingFullScreenImg.js        # 原始油猴脚本-全屏功能
│   └── bingImgDownload.js          # 原始油猴脚本-下载功能
└── dist/                           # 构建输出目录（可选）
    └── ...
```

**说明**：
- `original_code/` 目录包含原始油猴(Tampermonkey)脚本代码，当前项目基于这些功能进行了 Chrome Extensions API v3 架构重构
- `dist/` 目录为构建输出目录，如使用构建工具则会在该目录生成最终扩展包

### 2. Chrome浏览器安装

#### 步骤一：打开扩展管理页面
1. 打开Chrome浏览器
2. 在地址栏输入 `chrome://extensions/`
3. 按回车键进入扩展管理页面

#### 步骤二：开启开发者模式
1. 在扩展管理页面右上角，找到"开发者模式"开关
2. 点击开启开发者模式

#### 步骤三：加载扩展
1. 点击左上角的"加载已解压的扩展程序"按钮
2. 在弹出的文件选择对话框中，导航到 `d:\QoderProjects\BingTools` 文件夹
3. 选择该文件夹并点击"选择文件夹"
4. 扩展将被加载，Bing Tools图标将出现在工具栏

#### 步骤四：验证安装
1. 检查扩展列表中是否出现 "Bing Tools"
2. 确认扩展版本显示为 "1.0.0"
3. 确认扩展状态为"已启用"

### 3. 功能测试

#### 测试全屏功能
1. 访问 https://www.bing.com
2. 等待页面完全加载
3. 查看页面左下角是否出现"开启背景全屏"按钮
4. 点击按钮，验证：
   - Bing背景图片是否全屏显示
   - 浏览器是否进入全屏模式
   - 按钮文字是否变为"退出全部全屏"
5. 再次点击按钮或按ESC键，验证是否能正常退出全屏

#### 测试下载功能
1. 在Bing首页，查看页面右上角是否出现"下载今日必应图片"按钮
2. 鼠标悬停在按钮上，验证图片信息是否更新
3. 点击按钮，验证图片是否开始下载
4. 右键点击下载按钮，验证设置菜单是否弹出
5. 在设置菜单中：
   - 尝试切换分辨率选项
   - 尝试修改命名规则
   - 点击保存，验证设置是否生效

#### 测试Popup界面
1. 点击Chrome工具栏的Bing Tools图标
2. 验证Popup界面是否正常显示
3. 测试功能开关：
   - 切换全屏功能开关
   - 切换下载功能开关
4. 点击"刷新页面"按钮，验证当前页面是否刷新

#### 测试多语言支持
1. 在Chrome设置中切换浏览器语言
2. 重新加载Bing页面
3. 验证按钮文字是否随语言变化

### 4. 常见问题排查

#### 问题一：扩展无法加载
**症状**：加载时提示"清单文件缺失或无效"

**解决方案**：
1. 确认 `manifest.json` 文件存在且格式正确
2. 检查文件编码是否为UTF-8
3. 验证JSON格式是否有效（可使用在线JSON验证工具）

#### 问题二：功能按钮不显示
**症状**：在Bing页面看不到功能按钮

**解决方案**：
1. 确认访问的是 https://www.bing.com 或 https://cn.bing.com
2. 检查扩展是否已启用
3. 尝试刷新页面
4. 查看浏览器控制台是否有错误信息

#### 问题三：下载功能无法使用
**症状**：点击下载无反应

**解决方案**：
1. 检查是否授予了下载权限
2. 查看浏览器下载设置
3. 检查控制台是否有权限错误

#### 问题四：图标显示异常
**症状**：工具栏图标显示为默认图标或空白

**解决方案**：
1. 确认 `assets/icons/` 目录下有正确的PNG图标文件
2. 检查图标尺寸是否符合要求（16x16, 32x32, 48x48, 128x128）
3. 尝试重新加载扩展

### 5. 卸载扩展

1. 打开 `chrome://extensions/`
2. 找到 "Bing Tools" 扩展
3. 点击"删除"按钮
4. 在确认对话框中点击"删除"

## 开发者信息

- **版本**：1.0.0
- **Manifest版本**：V3
- **技术栈**：Chrome Extensions API v3, ES2020+, CSS3
- **许可证**：MIT

## 更新日志

### v1.0.0 (2026-02-23)
- 初始版本发布
- 集成全屏显示和图片下载功能
- 支持多语言（中/英/韩/日/法）
- 符合Chrome Extensions API v3规范
