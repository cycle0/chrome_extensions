# 图标生成说明

## 图标文件列表

扩展需要以下尺寸的PNG图标：
- `icon16.png` - 16x16 像素（工具栏图标）
- `icon32.png` - 32x32 像素（工具栏图标高分屏）
- `icon48.png` - 48x48 像素（扩展管理页面）
- `icon128.png` - 128x128 像素（Chrome Web Store）

## 生成方法

### 方法一：使用在线转换工具（推荐）

1. 打开 `icon.svg` 文件，复制SVG代码
2. 访问在线SVG转PNG工具，如：
   - https://convertio.co/zh/svg-png/
   - https://cloudconvert.com/svg-to-png
3. 上传或粘贴SVG代码
4. 分别生成 16x16, 32x32, 48x48, 128x128 四个尺寸
5. 下载并保存到本目录

### 方法二：使用Node.js脚本

```bash
# 安装依赖
npm install -g sharp

# 创建转换脚本 convert.js
```

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [16, 32, 48, 128];
const svgBuffer = fs.readFileSync('icon.svg');

sizes.forEach(size => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`icon${size}.png`)
    .then(() => console.log(`Created icon${size}.png`))
    .catch(err => console.error(err));
});
```

```bash
# 运行脚本
node convert.js
```

### 方法三：使用Figma

1. 导入 `icon.svg` 到 Figma
2. 创建 16x16, 32x32, 48x48, 128x128 四个画板
3. 将图标复制到各画板
4. 导出为PNG格式

## 图标设计说明

- **主色调**: 紫色渐变 (#667eea → #764ba2)
- **元素**: 山脉剪影 + 太阳/月亮 + 下载箭头
- **风格**: 扁平化设计，简洁现代
- **透明度**: 使用白色半透明叠加层增加层次感

## 注意事项

1. 所有图标必须是PNG格式
2. 图标应清晰可见，避免过于复杂的细节
3. 确保小尺寸（16x16）图标仍然可识别
4. 保持图标风格与Bing品牌协调
