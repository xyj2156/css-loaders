/**
 * 一次性脚本：把 src/styles/ 下未处理的 CSS 文件转换成变量化版本，
 * 输出到 src/optimizes/ 对应目录。
 *
 * 规则（与 rename.js 最终命名一致）：
 *   --s: var(--size, <width或height或font-size的px值>)
 *   --d: var(--duration, <第一个animation时长>)
 *   --dN: var(--duration-N, <第N个不同的animation时长>)
 *   --cN: var(--color-N, <不透明hex颜色>)
 *   --_a/--_b/...: calc(var(--s) * 原始px / --s默认值)
 *   --__a/--__b/...: 原CSS文件自带变量（如 --c）重命名
 *
 * 用法：
 *   node src/transform.js              # 干跑
 *   node src/transform.js --write      # 实际写入
 *   node src/transform.js --file=src/styles/spinner/l1.css  # 单文件调试
 */

import fs from 'node:fs';
import path from 'node:path';

const STYLES_DIR = path.resolve(process.cwd(), 'src', 'styles');
const OUT_DIR = path.resolve(process.cwd(), 'src', 'optimizes');
const WRITE = process.argv.includes('--write');
const ONLY_FILE = process.argv.find(a => a.startsWith('--file='));

const CATEGORIES = [
  'polygons', 'progress', 'pulsing', 'rolling', 'shapes',
  'shuriken', 'spinner', 'square', 'square-vs-circle', 'thin',
  'time', 'wavy', 'wobbling', 'zig-zag',
];

function transformCss(css) {
  // 1. 找到主类块范围（支持组合选择器 .a, .b:before, .c:after）
  const mainMatch = css.match(/^(\.__loading-[\w-]+(?:\s*,\s*\.__loading-[\w-]+(?:::?[\w-]+)*)*)\s*\{/m);
  if (!mainMatch) return { skip: true, reason: 'no main selector' };

  const bodyStart = mainMatch.index + mainMatch[0].length - 1; // 指向 {
  let depth = 0, bodyEnd = -1;
  for (let i = bodyStart; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) { bodyEnd = i; break; } }
  }
  if (bodyEnd < 0) return { skip: true, reason: 'unbalanced braces' };

  const head = css.slice(0, bodyStart + 1);
  const mainBody = css.slice(bodyStart + 1, bodyEnd);
  const tail = css.slice(bodyEnd);

  // 2. 提取 --s 默认值：优先主类块的 width，其次 height，其次 font-size；
  //    如果主类块没有，在整个文件里找第一个 width/height/font-size px
  let sDefault = null;
  let sProp = null;
  const tryFind = (text) => {
    const w = text.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)px/);
    const h = text.match(/(?:^|;)\s*height\s*:\s*(\d+(?:\.\d+)?)px/);
    const f = text.match(/(?:^|;)\s*font-size\s*:\s*(\d+(?:\.\d+)?)px/);
    if (w) return { prop: 'width', val: parseFloat(w[1]) };
    if (h) return { prop: 'height', val: parseFloat(h[1]) };
    if (f) return { prop: 'font-size', val: parseFloat(f[1]) };
    return null;
  };
  const found = tryFind(mainBody) || tryFind(css);
  if (found) { sDefault = found.val; sProp = found.prop; }

  if (sDefault === null) return { skip: true, reason: 'no width/height/font-size px' };

  // 3. 全文件扫描：所有动画时长
  const durations = [];
  const animRegex = /animation\s*:[^;}]*?(\d+(?:\.\d+)?(?:ms|s))/g;
  let am;
  while ((am = animRegex.exec(css)) !== null) {
    if (!durations.includes(am[1])) durations.push(am[1]);
  }
  // 也提取 animation-duration
  const durPropRegex = /animation-duration\s*:\s*(\d+(?:\.\d+)?(?:ms|s))/g;
  while ((am = durPropRegex.exec(css)) !== null) {
    if (!durations.includes(am[1])) durations.push(am[1]);
  }

  // 4. 全文件扫描：所有不透明 hex 颜色（支持 3/4/6/8 位）
  const colors = [];
  const colorRegex = /#([0-9a-fA-F]{3})(?![0-9a-fA-F#])|#([0-9a-fA-F]{4})(?![0-9a-fA-F#])|#([0-9a-fA-F]{6})(?![0-9a-fA-F#])|#([0-9a-fA-F]{8})(?![0-9a-fA-F#])/g;
  let cm;
  while ((cm = colorRegex.exec(css)) !== null) {
    let hex = cm[1] || cm[2] || cm[3] || cm[4];
    // 4 位 hex 且最后一位是 0 → 透明色，跳过；8 位最后两位是 00 → 透明，跳过
    if (hex.length === 4 && hex[3] === '0') continue;
    if (hex.length === 8 && hex.slice(6) === '00') continue;
    const fullHex = '#' + hex;
    if (!colors.includes(fullHex)) colors.push(fullHex);
  }

  // 5. 全文件扫描：所有 px 值（排除 --s 本身）
  const pxValues = new Set();
  const pxRegex = /(\d+(?:\.\d+)?)px/g;
  let pm;
  while ((pm = pxRegex.exec(css)) !== null) {
    const v = parseFloat(pm[1]);
    if (v === sDefault) continue;
    if (v === 0) continue;
    pxValues.add(v);
  }

  // 6. 收集原文件自带的 CSS 变量声明（在主类块里）
  const origVars = [];
  const origVarRegex = /(?:^|;)\s*(--[\w-]+)\s*:\s*([^;]+);/g;
  let om;
  while ((om = origVarRegex.exec(mainBody)) !== null) {
    origVars.push({ name: om[1], value: om[2].trim() });
  }

  // 7. 构建映射表
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  // 时长映射
  const dMap = {}; // oldDuration -> var(--dN)
  if (durations.length > 0) {
    dMap[durations[0]] = 'var(--d)';
    for (let i = 1; i < durations.length; i++) {
      dMap[durations[i]] = `var(--d${i})`;
    }
  }

  // 颜色映射
  const cMap = {}; // oldColor -> var(--cN)
  colors.forEach((color, i) => {
    cMap[color] = `var(--c${i + 1})`;
  });

  // px 映射
  const pxMap = {}; // oldPxValue -> var(--_x)
  const sortedPx = [...pxValues].sort((a, b) => a - b);
  sortedPx.forEach((v, i) => {
    pxMap[v] = `var(--_${letters[i]})`;
  });

  // 原变量映射
  const origMap = {}; // oldName -> --__x
  origVars.forEach((ov, i) => {
    origMap[ov.name] = `--__${letters[i]}`;
  });

  // 8. 构建变量声明块
  const varLines = [];
  varLines.push(`  --s: var(--size, ${sDefault}px);`);

  if (durations.length > 0) {
    varLines.push(`  --d: var(--duration, ${durations[0]});`);
    for (let i = 1; i < durations.length; i++) {
      const dMs = toMs(durations[0]);
      const dnMs = toMs(durations[i]);
      const ratio = dnMs / dMs;
      const ratioStr = Number.isInteger(ratio) ? `${ratio}` : ratio.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
      varLines.push(`  --d${i}: var(--duration-${i}, calc(var(--d) * ${ratioStr}));`);
    }
  }

  colors.forEach((color, i) => {
    varLines.push(`  --c${i + 1}: var(--color-${i + 1}, ${color});`);
  });

  sortedPx.forEach((v, i) => {
    const numerator = Number.isInteger(v) ? `${v}` : v.toString();
    varLines.push(`  --_${letters[i]}: calc(var(--s) * ${numerator} / ${sDefault});`);
  });

  // 原文件变量声明（值里的颜色也要替换成 var(--cN)）
  origVars.forEach((ov, i) => {
    let v = ov.value;
    for (const [oldColor, newName] of Object.entries(cMap)) {
      const regex = new RegExp(oldColor.replace('#', '\\#') + '(?![0-9a-fA-F])', 'g');
      v = v.replace(regex, newName);
    }
    varLines.push(`  --__${letters[i]}: ${v};`);
  });

  // 9. 在整个文件范围做替换（顺序很重要！）
  let result = css;

  // 9.0 先替换原文件变量名引用和声明（必须最先做，避免 pxMap 生成的 var(--_x) 与原文件变量冲突）
  for (const [oldName, newName] of Object.entries(origMap)) {
    // var(--oldName) → var(--newName)
    const refRegex = new RegExp(`var\\(\\s*${oldName.replace(/[-]/g, '\\-')}\\s*\\)`, 'g');
    result = result.replace(refRegex, `var(${newName})`);
    // 声明 --oldName: → --newName:
    const declRegex = new RegExp(`(;\\s*)${oldName.replace(/[-]/g, '\\-')}\\s*:`, 'g');
    result = result.replace(declRegex, `$1${newName}:`);
  }

  // 9.1 替换主尺寸：width/height: Npx → var(--s)（仅当 N === sDefault）
  result = result.replace(
    new RegExp(`((?:width|height)\\s*:\\s*)${sDefault}(?:\\.\\d+)?px`, 'g'),
    `$1var(--s)`,
  );

  // 9.2 替换 px 值（从大到小）
  // 注意：负号不能直接跟 var()，必须用 calc(-1 * var(--_x)) 包裹
  const sortedPxDesc = [...pxValues].sort((a, b) => b - a);
  for (const v of sortedPxDesc) {
    const numStr = Number.isInteger(v) ? `${v}` : v.toString();
    const regex = new RegExp(`(-?)(?<![\\d.])${numStr.replace('.', '\\.')}px`, 'g');
    result = result.replace(regex, (match, neg) =>
      neg ? `calc(-1 * ${pxMap[v]})` : pxMap[v],
    );
  }

  // 9.3 替换颜色（负向前瞻避免 #000 误伤 #0000）
  for (const [oldColor, newName] of Object.entries(cMap)) {
    const regex = new RegExp(oldColor.replace('#', '\\#') + '(?![0-9a-fA-F])', 'g');
    result = result.replace(regex, newName);
  }

  // 9.4 替换动画时长（长到短，避免 1s 误伤 1.5s）
  const sortedDurs = Object.keys(dMap).sort((a, b) => toMs(b) - toMs(a));
  for (const d of sortedDurs) {
    const newName = dMap[d];
    const regex = new RegExp(d.replace('.', '\\.'), 'g');
    result = result.replace(regex, newName);
  }

  // 10. 把主类块里原有的变量声明行删掉（因为我们重建了）
  // 重新切分 result（替换后），找到主类块，删掉变量声明行
  const newMainMatch = result.match(/^(\.__loading-[\w-]+)\s*\{/m);
  if (newMainMatch) {
    const newBodyStart = newMainMatch.index + newMainMatch[0].length - 1;
    let d = 0, newBodyEnd = -1;
    for (let i = newBodyStart; i < result.length; i++) {
      if (result[i] === '{') d++;
      else if (result[i] === '}') { d--; if (d === 0) { newBodyEnd = i; break; } }
    }
    if (newBodyEnd > 0) {
      const newHead = result.slice(0, newBodyStart + 1);
      let newMainBody = result.slice(newBodyStart + 1, newBodyEnd);
      const newTail = result.slice(newBodyEnd);

      // 删掉变量声明行
      const lines = newMainBody.split('\n');
      const kept = lines.filter(line => !/^\s*--[\w-]+\s*:/.test(line));
      newMainBody = kept.join('\n').replace(/^\s*\n/, '');

      // 插入变量块
      result = newHead + '\n' + varLines.join('\n') + '\n\n' + newMainBody + newTail;
    }
  }

  return { css: result, skip: false };
}

function toMs(dur) {
  if (dur.endsWith('ms')) return parseFloat(dur);
  return parseFloat(dur) * 1000;
}

// 遍历
let processed = 0;
let skipped = 0;
const problems = [];

for (const cat of CATEGORIES) {
  const srcDir = path.join(STYLES_DIR, cat);
  const outDir = path.join(OUT_DIR, cat);
  if (!fs.existsSync(srcDir)) {
    problems.push(`${cat}: src dir missing`);
    continue;
  }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.css') && f !== 'index.css');
  for (const f of files) {
    const srcPath = path.join(srcDir, f);
    const outPath = path.join(outDir, f);

    if (ONLY_FILE) {
      const target = path.resolve(process.cwd(), ONLY_FILE.slice('--file='.length));
      if (path.resolve(srcPath) !== target) continue;
    }

    const css = fs.readFileSync(srcPath, 'utf8');
    const result = transformCss(css);

    if (result.skip) {
      skipped++;
      problems.push(`${cat}/${f}: ${result.reason}`);
      continue;
    }

    processed++;
    if (ONLY_FILE) {
      console.log(`\n===== ${srcPath} =====`);
      console.log(result.css);
    }
    if (WRITE && !ONLY_FILE) {
      fs.writeFileSync(outPath, result.css, 'utf8');
    }
  }
}

console.log(`\nProcessed: ${processed}, Skipped: ${skipped}`);
if (problems.length) {
  console.log('\n=== Problems (first 20) ===');
  problems.slice(0, 20).forEach(p => console.log(p));
}
if (!WRITE) console.log('\n(dry run, use --write to actually write)');
