import axios from 'axios';
import { parse } from 'node-html-parser';
import { asyncEach, transStyle } from './utils.js';
import {
  closeSync,
  existsSync,
  mkdirSync,
  open,
  rmSync,
  statSync,
  write,
} from 'node:fs';
import { resolve } from 'node:path';

const api = axios.create({
  baseURL: 'https://css-loaders.com/',
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  },
});

api.interceptors.response.use(function (response) {
  return response.data;
});

api
  .get('/')
  .then(function (html) {
    const root = parse(html);

    // 获取菜单用于进一步抓取
    const list = root.querySelectorAll('#menu ul li a');

    asyncEach(list, function (item) {
      const count = item.querySelector('small').innerText;
      const href = item.getAttribute('href');
      const name = item.firstChild.innerText
        .trim()
        .split(' ')
        .pop()
        .toLowerCase();

      const path = style(name);
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      } else if (!statSync(path).isDirectory()) {
        rmSync(path);
        mkdirSync(path, { recursive: true });
      } else {
        console.log('目录已存在,当做已经采集过', path);
        return Promise.resolve();
      }

      return api.get(href).then(function (html) {
        const root = parse(html);
        const articles = root.querySelectorAll('.load-container article');
        const index = [];
        articles.forEach(function (article, i) {
          const id = article.querySelector('div').id;
          const style = article.querySelector('style').innerText;
          const file = `${path}/${id}.css`;
          const content = transStyle(
            `.__loading-${name}-${i + 1}`,
            `#${id}`,
            style,
          );
          index.push(content);
          open(file, 'w', function (err, fd) {
            if (err) throw err;
            write(fd, content, 'utf-8', function (err) {
              if (err) throw err;
              console.log('写入成功', file);
            });
          });
        });

        if (Number(count) === articles.length) {
          console.log(name, '采集完成');
          open(`${path}/index.css`, 'w', function (err, fd) {
            if (err) throw err;
            write(fd, index.join('\n'), 'utf-8', function (err) {
              if (err) throw err;
              console.log('写入成功', `${path}/index.css`);
              closeSync(fd);
            });
          });
        } else {
          console.log(name, '采集失败', count, articles.length);
        }
      });
    })
      .then(function () {
        console.log('分类 菜单成功');
      })
      .catch(function () {
        console.log('分类 采集每个菜单错误', ...arguments);
      });
  })
  .catch(function () {
    console.log('采集数据错误：', ...arguments);
  });

function style(...args) {
  return resolve(process.cwd(), 'src', 'styles', ...args);
}
