/**
 * 批量修复：原文件的 --g2 变量被 transform.js 遗漏
 * 补上 --__b 定义，并把 var(--g2) 替换成 var(--__b)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = 'F:/web/css-loaders/src/optimizes';

const files = [
  'square/l6.css', 'square/l7.css', 'square/l8.css', 'square/l9.css',
  'square/l10.css', 'square/l11.css',
  'square-vs-circle/l9.css',
];

for (const f of files) {
  const p = path.join(root, f);
  let css = fs.readFileSync(p, 'utf8');
  
  // 从原始 styles/ 文件读取 --g2 的定义
  const origPath = p.replace('/optimizes/', '/styles/');
  const orig = fs.readFileSync(origPath, 'utf8');
  
  // 提取 --g2: ...;
  const g2Match = orig.match(/--g2\s*:\s*([^;]+);/);
  if (!g2Match) {
    console.log(`SKIP ${f}: no --g2 in original`);
    continue;
  }
  const g2Value = g2Match[1].trim();
  // 把 #fff 替换成 var(--c1)
  const g2ValueVar = g2Value.replace(/#fff/gi, 'var(--c1)');
  
  // 在 --__a 行后面加 --__b
  if (css.includes('--__a:') && !css.includes('--__b:')) {
    css = css.replace(
      /(--__a:[^\n]+\n)/,
      `$1  --__b: ${g2ValueVar};\n`
    );
  }
  
  // 把 var(--g2) 替换成 var(--__b)
  css = css.replace(/var\(--g2\)/g, 'var(--__b)');
  
  fs.writeFileSync(p, css, 'utf8');
  console.log(`Fixed ${f}`);
}
