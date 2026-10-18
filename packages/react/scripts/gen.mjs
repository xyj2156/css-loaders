// 从 @xyj2156/css-loading 的 index.json 生成所有命名 Loader 组件（React 版）
// 用法: node scripts/gen.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const cssIndexPath = path.resolve(pkgRoot, '../css/src/optimizes/index.json');
const outDir = path.resolve(pkgRoot, 'src/generated');

const index = JSON.parse(fs.readFileSync(cssIndexPath, 'utf8'));

function pascal(kind) {
  return kind
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const kinds = Object.keys(index);
const kindLiterals = kinds.map((k) => `  '${k}'`).join(' |\n');

// kinds.ts
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

// 每个 loader 一个 tsx 组件
const lines = [];
for (const kind of kinds) {
  for (const cls of index[kind]) {
    const variant = Number(cls.match(/(\d+)$/)[1]);
    const cssFile = path.resolve(pkgRoot, `../css/src/optimizes/${kind}/l${variant}.css`);
    if (!fs.existsSync(cssFile)) {
      console.warn(`跳过 ${cls}: ${kind}/l${variant}.css 不存在`);
      continue;
    }
    const compName = `Loader${pascal(kind)}${variant}`;
    const tsx = `import '@x-ac/css-loading/style/${kind}/l${variant}.css';
import type { CSSProperties } from 'react';

/** 自动生成：${cls} */
export function ${compName}(props: {
  className?: string;
  style?: CSSProperties;
  /** 尺寸，透传为 CSS 变量 --size */
  size?: string;
  /** 主色，透传为 CSS 变量 --color-1 */
  color?: string;
  /** 动画时长，透传为 CSS 变量 --duration */
  duration?: string;
}) {
  const cssVars: CSSProperties = {};
  if (props.size) (cssVars as Record<string, string>)['--size'] = props.size;
  if (props.color) (cssVars as Record<string, string>)['--color-1'] = props.color;
  if (props.duration) (cssVars as Record<string, string>)['--duration'] = props.duration;
  return <div className={props.className} style={{ ...cssVars, ...props.style }}><div className="${cls}" /></div>;
}

export default ${compName};
`;
    fs.writeFileSync(path.join(outDir, `${compName}.tsx`), tsx);
    lines.push(`export { ${compName} } from './${compName}';`);
  }
}

const indexTs = `// 自动生成，请勿手动编辑
import 'react';
export * from './kinds';
${lines.join('\n')}
`;
fs.writeFileSync(path.join(outDir, 'index.ts'), indexTs);

console.log(`生成完成: ${kinds.length} 个类别, ${lines.length} 个组件 -> src/generated/`);
