## css-loaders

感谢 [@Afif13](https://github.com/Afif13/) 在 `https://css-loaders.com/` 提供的css样式

### 使用方法：

导入 `pnpm/npm/yarm i/add @xyj2156/css-loading`
1. 全量导入

   在项目入口导入css `import '@xyj2156/css-loading';`

   在使用时: `<div class="__loading-line-1"></div>`

   `__loading-line-1` 有三个部分 `__loading` `line` `1`

   `line` 是样式类型，`1` 是样式编号

   `__loading-x-y` 是样式名，具体样式名请查看 `dist/x.css` 文件中的`y`编号样式

2. 按需导入

   在项目入口导入css `import '@xyj2156/css-loading/x.min.css'`
   在使用时: `<div class="__loading-x-y"></div>`

### 目录结构

```text
├── dist 整合打包后的目录
├── public
│   └── index.html  预览HTML
├── src 源码目录
│   ├── styles 样式文件夹
│   │   └── 各个类型样式原始css
│   ├── collector.js 从 https://css-loaders.com/ 收集 css样式的工具
│   ├── main.js 打包器
│   ├── preview.js 预览
│   └── styles 采集后放置样式的目录

```
