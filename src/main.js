import fs from 'fs';
import path from 'path';
import CleanCSS from 'clean-css';

// 确保dist目录存在
const ensureDistDir = () => {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
};

// 处理单个CSS文件
const processCssFile = (srcPath, distPath) => {
  const css = fs.readFileSync(srcPath, 'utf8');
  const cleanCss = new CleanCSS();
  const minified = cleanCss.minify(css);

  // 写入未压缩版本
  fs.writeFileSync(distPath, css);

  // 写入压缩版本
  fs.writeFileSync(distPath.replace('.css', '.min.css'), minified.styles);
};

// 主处理函数
const processStyles = () => {
  ensureDistDir();
  const stylesDir = 'src/styles';

  if (!fs.existsSync(stylesDir)) {
    console.error('src/styles directory not found');
    return;
  }

  const dirs = fs.readdirSync(stylesDir).filter(file => {
    const filePath = path.join(stylesDir, file);
    return fs.statSync(filePath).isDirectory();
  });

  dirs.forEach(dir => {
    const srcPath = path.join(stylesDir, dir, 'index.css');
    if (fs.existsSync(srcPath)) {
      const distPath = path.join('dist', `${dir}.css`);
      processCssFile(srcPath, distPath);
      console.log(`Processed ${dir}/index.css`);
    }
  });

  // 合并所有CSS文件
  const allCss = dirs
    .map(dir => {
      const srcPath = path.join(stylesDir, dir, 'index.css');
      return fs.existsSync(srcPath) ? fs.readFileSync(srcPath, 'utf8') : '';
    })
    .join('\n');

  // 写入合并后的文件
  fs.writeFileSync('dist/all.css', allCss);

  // 写入合并后的压缩文件
  const cleanCss = new CleanCSS();
  const minified = cleanCss.minify(allCss);
  fs.writeFileSync('dist/all.min.css', minified.styles);
};

// 执行处理
processStyles();
