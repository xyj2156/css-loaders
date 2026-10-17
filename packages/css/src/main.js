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
  const stylesDir = fs.existsSync('src/optimizes')
    ? 'src/optimizes'
    : 'src/styles';

  if (!fs.existsSync(stylesDir)) {
    console.error('src/styles directory not found');
    return;
  }

  const dirs = fs.readdirSync(stylesDir).filter(file => {
    const filePath = path.join(stylesDir, file);
    return fs.statSync(filePath).isDirectory();
  });

  // 遍历目录中的每个子目录，合并内容到 index.css 文件
  const allCss = dirs
    .map(function (dir) {
      dir = path.join(stylesDir, dir);

      const d = fs
        .readdirSync(dir)
        .filter(file => file !== 'index.json' && file !== 'index.css');

      const content = d
        .map(function (file) {
          return fs.readFileSync(path.join(dir, file), 'utf8');
        })
        .join('\n');

      fs.writeFileSync(path.join(dir, 'index.css'), content);
      console.log('合并目录', dir);
      return content;
    })
    .join('\n');

  dirs.forEach(dir => {
    const srcPath = path.join(stylesDir, dir, 'index.css');
    if (fs.existsSync(srcPath)) {
      const distPath = path.join('dist', `${dir}.css`);
      processCssFile(srcPath, distPath);
      console.log(`Processed ${dir}/index.css`);
    }
  });

  // 写入合并后的文件
  fs.writeFileSync('dist/all.css', allCss);

  // 写入合并后的压缩文件
  const cleanCss = new CleanCSS();
  const minified = cleanCss.minify(allCss);
  fs.writeFileSync('dist/all.min.css', minified.styles);
};

// 执行处理
processStyles();

/**
 * 读取指定目录下的所有文件，并返回包含完整路径的文件列表
 * @param {string} dir - 要读取的目录路径
 * @returns {Promise<Array<string>>} - 返回一个Promise对象，解析为包含文件完整路径的数组
 */
function readDir(dir) {
  return new Promise(function (resolve, reject) {
    // 创建一个Promise对象，用于异步处理目录读取操作
    fs.readdir(dir, function (err, files) {
      // 调用fs.readdir方法读取目录内容
      if (err) {
        // 如果发生错误
        reject(err); // 将错误传递给Promise的reject处理函数
        return; // 提前终止函数执行
      }

      // 将文件名与目录路径合并，形成完整路径
      resolve(files.map(item => path.join(dir, item))); // 将处理后的文件路径数组传递给Promise的resolve处理函数
    });
  });
}

/**
 * 读取文件内容并返回Promise
 * @param {string} file - 要读取的文件路径
 * @returns {Promise<string>} - 返回一个Promise对象，解析为文件内容的字符串形式
 */
function readFile(file) {
  return new Promise(function (resolve, reject) {
    // 使用fs模块的readFile方法异步读取文件
    fs.readFile(file, function (err, data) {
      // 如果读取文件时发生错误
      if (err) {
        // 拒绝Promise并传递错误对象
        reject(err);
        return;
      }
      // 读取成功，将Buffer类型的数据转换为字符串并解决Promise
      resolve(data.toString());
    });
  });
}
