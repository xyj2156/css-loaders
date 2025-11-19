import { createServer } from 'node:http';
import fs from 'node:fs';
import { extname, join } from 'node:path';

const __dirname = process.cwd();

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
};

const server = createServer((req, res) => {
  // 规范化URL，移除查询字符串
  const url = req.url.split('?')[0];

  // 构建文件路径
  let filePath =
    transPublicPath(url) ||
    transDistPath(url) ||
    transOptimizesPath(url) ||
    transStylesPath(url);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>', 'utf-8');
    return;
  }

  // 获取文件扩展名
  const ext = String(extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';

  // 读取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件不存在
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        console.log('Server Error:', error);
        // 服务器错误
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      // 成功响应
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function trans() {
  const path = join(__dirname, ...arguments);
  if (fs.existsSync(path)) {
    const stat = fs.lstatSync(path);
    if (stat.isFile()) {
      return path;
    } else if (stat.isDirectory()) {
      const index = path + '/index.html';
      if (fs.existsSync(index)) {
        return index;
      }
    }
  }
  return null;
}

function transPublicPath(url) {
  return trans('public', url);
}

function transDistPath(url) {
  return trans('dist', url);
}

function transStylesPath(url) {
  return trans('src', 'styles', url);
}

function transOptimizesPath(url) {
  return trans('src', 'optimizes', url);
}
