## css-loaders

感谢 [@Afif13](https://github.com/Afif13/) 在 `https://css-loaders.com/` 提供的 css 样式。

pnpm monorepo，包含三个包：

| 包 | 说明 |
|---|---|
| `@x-ac/css-loading` | 核心 CSS 库，纯 class，无框架绑定 |
| `@x-ac/vue-loading` | Vue 3 适配组件 |
| `@x-ac/react-loading` | React 18+ 适配组件 |

### 目录结构

```text
├── packages/
│   ├── css/      # @x-ac/css-loading 核心 css 包
│   ├── vue/      # @x-ac/vue-loading
│   └── react/   # @x-ac/react-loading
└── apps/
    └── playground/  # Vite 预览站，同页对比三种用法
```

---

## 1. 核心 CSS 包

```bash
pnpm add @x-ac/css-loading
```

### 全量导入

```ts
import '@x-ac/css-loading';
```

```html
<div class="__loading-line-1"></div>
```

类名规则：`__loading-{类别}-{编号}`，如 `__loading-line-1`。

### 按类别导入

```ts
import '@x-ac/css-loading/line.min.css';
```

### 变量化定制

所有 loader 已参数化为 CSS 变量，常用三个：

```css
.my-loader {
  --size: 48px;
  --color-1: #046d8b;
  --duration: 1.2s;
}
```

---

## 2. Vue 包

```bash
pnpm add @x-ac/vue-loading @x-ac/css-loading
```

### 统一组件

```vue
<script setup>
import { Loader } from '@x-ac/vue-loading';
</script>

<template>
  <Loader kind="line" :variant="1" size="48px" color="#046d8b" />
</template>
```

统一组件不自动加载 css，需自行引入对应类别 css。

### 命名组件（按需 tree-shaking）

每个 loader 一个独立组件文件，只 import 用到的那个，css 自动跟随：

```vue
<script setup>
import { LoaderLine1 } from '@x-ac/vue-loading';
</script>

<template>
  <LoaderLine1 />
</template>
```

`LoaderLine1` 内部已 `import '@x-ac/css-loading/style/line/l1.css'`，打包器只会带上这一条 css。

---

## 3. React 包

```bash
pnpm add @x-ac/react-loading @x-ac/css-loading
```

### 统一组件

```tsx
import { Loader } from '@x-ac/react-loading';

<Loader kind="line" variant={1} size="48px" color="#046d8b" />
```

### 命名组件

```tsx
import { LoaderLine1 } from '@x-ac/react-loading';

<LoaderLine1 />
```

---

## 本地开发

```bash
pnpm install

# 构建 css 包
pnpm build:css

# 重新生成 vue/react 命名组件
pnpm gen

# 构建所有包
pnpm build

# 启动预览站
pnpm dev:playground
```
