/**
 * 一次性脚本：把 src/optimizes 下所有 CSS 文件的内部变量命名统一成字母体系。
 *
 * 规则：
 *   对外变量（按值识别，保留原名）：
 *     var(--size, ...)            -> --s
 *     var(--duration, ...)        -> --d
 *     var(--duration-N, ...)       -> --dN（N 按出现顺序 1,2,3...）
 *     var(--color-N, ...)          -> --cN（N 按出现顺序 1,2,3...）
 *
 *   内部变量（按声明顺序分配字母）：
 *     值里包含 var(--s)            -> --_a, --_b, --_c...（派生尺寸）
 *     值里不包含 var(--s)          -> --__a, --__b, ...（原文件自带变量）
 *
 *   重排顺序：--s -> --d -> --dN -> --cN -> --_x -> --__x
 *   变量块与后续样式空一行分隔。
 *
 * 用法：
 *   node src/rename.js            # 干跑，只输出将要改的文件数和样本 diff
 *   node src/rename.js --write    # 实际写入
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src', 'optimizes');
const WRITE = process.argv.includes('--write');
const ONLY_FILE = process.argv.find(a => a.startsWith('--file=')); // --file=src/optimizes/bars/l29.css

// 解析单个文件，返回 { renamed, changed, mapping }
function processCss(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let css = original;

  // 找到主类选择器块：.__loading-xxx { ... }（第一个块，深度 0）
  // 简单做法：按 { 配对找第一个顶层块
  const mainMatch = css.match(/^(\.__loading-[\w-]+)\s*\{/);
  if (!mainMatch) {
    return { css, changed: false, reason: 'no main selector' };
  }
  const mainStart = mainMatch.index;
  const bodyStart = mainMatch.index + mainMatch[0].length - 1; // 指向 {
  // 配对 }
  let depth = 0;
  let bodyEnd = -1;
  for (let i = bodyStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) { bodyEnd = i; break; }
    }
  }
  if (bodyEnd < 0) return { css, changed: false, reason: 'unbalanced braces' };

  const head = css.slice(0, bodyStart + 1); // 包含 {
  const body = css.slice(bodyStart + 1, bodyEnd);
  const tail = css.slice(bodyEnd);

  // 在 body 里按行提取 CSS 变量声明 --name: value;
  // 一行一个声明，跳过空行和非变量行
  const lines = body.split('\n');
  const decls = []; // { lineIdx, name, value }
  const otherLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^\s*(--[\w-]+)\s*:\s*(.+);\s*$/);
    if (m) {
      decls.push({ lineIdx: i, name: m[1], value: m[2].trim() });
    } else if (line.trim() !== '') {
      otherLines.push({ lineIdx: i, text: line });
    }
  }

  if (decls.length === 0) return { css, changed: false, reason: 'no css vars' };

  // 分类
  const mapping = {}; // oldName -> newName
  let dCounter = 0;
  let cCounter = 0;
  let usCounter = 0; // --_a, --_b...
  let dblCounter = 0; // --__a, --__b...
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  for (const d of decls) {
    const v = d.value;
    // 已经是规范命名空间的，直接保留，不参与计数分配
    if (/^--s$/.test(d.name) && /var\(\s*--size\s*,/.test(v)) {
      mapping[d.name] = '--s';
    } else if (/^--d$/.test(d.name) && /var\(\s*--duration\s*,/.test(v)) {
      mapping[d.name] = '--d';
    } else if (/^--d\d+$/.test(d.name)) {
      mapping[d.name] = d.name; // 保留原 --dN 命名
    } else if (/^--c\d+$/.test(d.name)) {
      mapping[d.name] = d.name; // 保留原 --cN 命名
    } else if (/var\(\s*--size\s*,/.test(v)) {
      mapping[d.name] = '--s';
    } else if (/var\(\s*--duration\s*,/.test(v)) {
      mapping[d.name] = '--d';
    } else if (/var\(\s*--duration-\d+\s*,/.test(v)) {
      dCounter++;
      mapping[d.name] = `--d${dCounter}`;
    } else if (/var\(\s*--color-\d+\s*,/.test(v)) {
      cCounter++;
      mapping[d.name] = `--c${cCounter}`;
    } else if (/var\(\s*--s\s*\)/.test(v) || /calc\([^)]*var\(\s*--s\s*\)/.test(v)) {
      mapping[d.name] = `--_${letters[usCounter++]}`;
    } else {
      mapping[d.name] = `--__${letters[dblCounter++]}`;
    }
  }

  // 检查是否有重名冲突（两个不同 old 映射到同一个 new）
  const seen = {};
  for (const [oldName, newName] of Object.entries(mapping)) {
    if (!seen[newName]) seen[newName] = [];
    seen[newName].push(oldName);
  }
  const conflicts = Object.entries(seen).filter(([, arr]) => arr.length > 1);
  if (conflicts.length > 0) {
    return { css, changed: false, reason: `naming conflict: ${JSON.stringify(conflicts)}`, mapping };
  }

  // 用 otherLines 重建 body（变量声明已被剔除）
  const newBody = otherLines.map(l => l.text).join('\n').replace(/^\s*\n/, '');

  // 构建新的变量声明块
  const groups = { s: null, d: null, dn: [], cn: [], us: [], dbl: [] };
  for (const d of decls) {
    const newName = mapping[d.name];
    const line = `  ${newName}: ${d.value};`;
    if (newName === '--s') groups.s = line;
    else if (newName === '--d') groups.d = line;
    else if (/^--d\d+$/.test(newName)) groups.dn.push(line);
    else if (/^--c\d+$/.test(newName)) groups.cn.push(line);
    else if (/^--_[a-z]$/.test(newName)) groups.us.push(line);
    else if (/^--__[a-z]$/.test(newName)) groups.dbl.push(line);
  }
  const varLines = [];
  if (groups.s) varLines.push(groups.s);
  if (groups.d) varLines.push(groups.d);
  groups.dn.forEach(l => varLines.push(l));
  groups.cn.forEach(l => varLines.push(l));
  const internal = [...groups.us, ...groups.dbl];
  if (internal.length) {
    varLines.push('');
    internal.forEach(l => varLines.push(l));
  }

  const newHead = head + '\n' + varLines.join('\n');
  let newCss = newHead + '\n\n' + newBody + tail;

  // 全局替换所有 var(--oldName) -> var(--newName)
  // 注意要按 oldName 长度降序替换，避免 --_1 误匹配 --_10
  const oldNames = Object.keys(mapping).sort((a, b) => b.length - a.length);
  for (const oldName of oldNames) {
    const newName = mapping[oldName];
    if (oldName === newName) continue;
    // 替换 var(--oldName) 引用（声明已经重建过，不会重复）
    const refRegex = new RegExp(
      `var\\(\\s*${oldName.replace(/[-]/g, '\\-')}\\s*\\)`,
      'g',
    );
    newCss = newCss.replace(refRegex, `var(${newName})`);
  }

  // 清理多余空行（变量块与后续样式之间空一行，最多一个空行）
  newCss = newCss.replace(/\n{3,}/g, '\n\n');

  const changed = newCss !== original;
  return { css: newCss, changed, mapping };
}

// 遍历目录
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.css') && entry.name !== 'index.css') out.push(full);
  }
  return out;
}

const files = ONLY_FILE
  ? [path.resolve(process.cwd(), ONLY_FILE.slice('--file='.length))]
  : walk(ROOT);
console.log(`Found ${files.length} css files`);

let changedCount = 0;
let unchangedCount = 0;
const problems = [];

for (const f of files) {
  const result = processCss(f);
  if (ONLY_FILE) {
    console.log(`\n===== ${f} =====`);
    console.log('mapping:', JSON.stringify(result.mapping, null, 2));
    console.log('--- result css ---');
    console.log(result.css);
    continue;
  }
  if (!result.changed) {
    unchangedCount++;
    if (result.reason && !['no css vars', 'no main selector'].includes(result.reason)) {
      problems.push(`${path.relative(process.cwd(), f)}: ${result.reason}`);
    }
    continue;
  }
  changedCount++;
  if (WRITE) {
    fs.writeFileSync(f, result.css, 'utf8');
  }
}

console.log(`Changed: ${changedCount}`);
console.log(`Unchanged: ${unchangedCount}`);
if (problems.length) {
  console.log('\n=== Problems ===');
  problems.slice(0, 20).forEach(p => console.log(p));
}
if (!WRITE) {
  console.log('\n(dry run, use --write to actually modify)');
}
