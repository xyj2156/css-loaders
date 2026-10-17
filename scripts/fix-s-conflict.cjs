/**
 * 批量修复 --s 变量冲突：
 * 原始文件里 :before/:after 用 --s 做方向标志（-1/1/60deg/90deg），
 * transform.js 把主尺寸也命名为 --s，导致 :after 的 --s:-1 覆盖了主尺寸。
 * 修复：
 *   1. 选择器块内（非主类）的 --s: <非尺寸值> 重命名为 --__s
 *   2. @keyframes 块内的 var(--s, X) 和 var(--s) 重命名为 var(--__s, X)
 *   3. :before/:after 里的 width: var(--s) 保持不变（引用主尺寸）
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'optimizes');

function processFile(filePath) {
  let css = fs.readFileSync(filePath, 'utf8');
  const original = css;

  // 第一步：找到所有选择器块内的 --s: <非尺寸值> 赋值行
  // 非尺寸值 = 不是 var(--size 开头，不是 calc( 开头
  const lines = css.split('\n');
  const renameIdx = new Set();

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s+)--s:\s*(.+);\s*$/);
    if (m) {
      const val = m[2].trim();
      if (!val.startsWith('var(--size') && !val.startsWith('calc(')) {
        renameIdx.add(i);
      }
    }
  }

  if (renameIdx.size === 0) return false;

  // 重命名这些行
  for (const idx of renameIdx) {
    lines[idx] = lines[idx].replace('--s:', '--__s:');
  }

  // 第二步：在 @keyframes 块内替换 var(--s, X) 和 var(--s)
  let inKeyframes = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('@keyframes')) {
      inKeyframes = true;
      continue;
    }
    if (inKeyframes) {
      if (lines[i].trim() === '}') {
        inKeyframes = false;
        continue;
      }
      // 替换 var(--s, default) → var(--__s, default)
      // 替换 var(--s) → var(--__s)
      // 但不要碰 var(--__s)
      lines[i] = lines[i].replace(/var\(--s,/g, 'var(--__s,');
      lines[i] = lines[i].replace(/var\(--s\)/g, 'var(--__s)');
    }
  }

  css = lines.join('\n');

  if (css !== original) {
    fs.writeFileSync(filePath, css, 'utf8');
    return true;
  }
  return false;
}

let fixed = 0;
function walk(dirPath) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.css')) {
      if (processFile(full)) {
        console.log('Fixed:', path.relative(dir, full));
        fixed++;
      }
    }
  }
}

walk(dir);
console.log(`\nTotal fixed: ${fixed}`);
