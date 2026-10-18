// 从 @xyj2156/css-loading 的 index.json 生成所有命名 Loader 组件
// 用法: node scripts/gen.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const cssIndexPath = path.resolve(pkgRoot, '../css/src/optimizes/index.json');
const outDir = path.resolve(pkgRoot, 'src/generated');

const index = JSON.parse(fs.readFileSync(cssIndexPath, 'utf8'));

// line -> Line, dots-vs-bars -> DotsVsBars, 3d -> 3d
function pascal(kind) {
  return kind
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// 清理输出目录
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const kinds = Object.keys(index);
const kindLiterals = kinds.map((k) => `  '${k}'`).join(' |\n');

// 1. 生成 kinds.ts：所有 kind 字面量联合 + 每类的 variant 范围
const kindsTs = `// 自动生成，请勿手动编辑
export type LoaderKind =
${kindLiterals};

export type LoaderVariants = {
${kinds
  .map((k) => `  '${k}': ${index[k].map((c) => Number(c.match(/(\d+)$/)[1])).join(' | ')};`)
  .join('\n')}
};
`;
fs.writeFileSync(path.join(outDir, 'kinds.ts'), kindsTs);

// 2. 为每个 loader 生成一个 .vue 组件
const componentIndexLines = [];

for (const kind of kinds) {
  for (const cls of index[kind]) {
    // cls 形如 __loading-line-1
    const variant = Number(cls.match(/(\d+)$/)[1]);
    // 检查对应 css 文件是否存在，index.json 可能和实际文件不同步
    const cssFile = path.resolve(pkgRoot, `../css/src/optimizes/${kind}/l${variant}.css`);
    if (!fs.existsSync(cssFile)) {
      console.warn(`跳过 ${cls}: ${kind}/l${variant}.css 不存在`);
      continue;
    }
    const compName = `Loader${pascal(kind)}${variant}`;
    const vueSrc = `<template>
  <div :class="'${cls}'" />
</template>

<script setup lang="ts">
import '@x-ac/css-loading/style/${kind}/l${variant}.css';
</script>
`;
    fs.writeFileSync(path.join(outDir, `${compName}.vue`), vueSrc);
    componentIndexLines.push(`export { default as ${compName} } from './${compName}.vue';`);
  }
}

// 3. 生成聚合 index.ts
const indexTs = `// 自动生成，请勿手动编辑
export * from './kinds';
${componentIndexLines.join('\n')}
`;
fs.writeFileSync(path.join(outDir, 'index.ts'), indexTs);

console.log(`生成完成: ${kinds.length} 个类别, ${componentIndexLines.length} 个组件 -> src/generated/`);
