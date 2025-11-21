import OpenAI from 'openai';
import fs from 'fs';
import { join } from 'node:path';
import { asyncEach, writeFile } from './utils.js';

const __dirname = process.cwd();

const openai = new OpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  apiKey: process.env.API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const styles = src('styles');
const optimizes = src('ai-optimizes');

const allFiles = [];
fs.readdirSync(styles)
  .map(function (item) {
    if (item === 'index.json') {
      writeFile(join(optimizes, item), fs.readFileSync(join(styles, item)));
      return null;
    }
    return item;
  })
  .filter(item => item)
  .forEach(function (item) {
    const path = join(styles, item);
    const files = fs
      .readdirSync(path)
      .map(function (file) {
        if (file === 'index.css') {
          return;
        }
        const filePath = join(path, file);
        if (file === 'index.json') {
          writeFile(join(optimizes, item, file), fs.readFileSync(filePath));
          return;
        }
        const target = join(optimizes, item, file);
        if (fs.existsSync(target)) {
          return null;
        }
        return [filePath, join(optimizes, item, file)];
      })
      .filter(item => item);
    allFiles.push(...files);
  });

asyncEach(allFiles, function ([file, target]) {
  const content = fs.readFileSync(file, 'utf-8');
  const answer = (function () {
    if (content.includes('Loading')) {
      return `
伪类content为Loading 则提取伪类内容Loading 为css变量--c, 如果文件中相同变量则重命名为--_c
--c值为 --content 或默认值 Loading

提取宽度为css变量 --s;文件中其他也根据宽度计算：
--s值为 --size 或者默认值

提取颜色为css变量，按照 --cx 格式提取
--cx值为 --color-x，或默认值 x为数字

提取动画时长为 --dx x为数字,
--dx(x为数字)值为 --duration-x 或默认值 负数的时长也提取

--cx 格式如下 --c1:var(--color-1,默认值),--c2:var(--color-2,默认值)
--dx 格式如下 --d1:var(--duration-1,默认值),--d2:var(--duration-2,默认值)


--c，--s,--cx,--dx 放到类样式顶部，不要在伪类放css变量
变量顺序 --c --s --cx --dx
变量与其他样式用空行隔开`.trim();
    }
    return `
提取宽度为css变量 --s;文件中其他也根据宽度计算：
--s值为 --size 或者默认值

提取颜色为css变量，按照 --cx 格式提取
--cx值为 --color-x，或默认值 x为数字

提取动画时长为 --dx x为数字,
--dx(x为数字)值为 --duration-x 或默认值 负数的时长也提取

--cx 格式如下 --c1:var(--color-1,默认值),--c2:var(--color-2,默认值)
--dx 格式如下 --d1:var(--duration-1,默认值),--d2:var(--duration-2,默认值)


--c，--s,--cx,--dx 放到类样式顶部，不要在伪类放css变量
变量顺序 --s --cx --dx
变量与其他样式用空行隔开
`.trim();
  })();
  return trans(content, answer)
    .then(function (content) {
      let message = content.choices[0].message.content;
      if (message.startsWith('```css')) {
        message = message.replace('```css', '').replace('```', '');
      }
      writeFile(target, message);
      console.log('写入成功', target);
    })
    .catch(function () {
      console.log('error:', ...arguments);
    });
})
  .then(function () {
    console.log('完成');
  })
  .catch(function () {
    console.log('error:', ...arguments);
  });

function src(...args) {
  return join(__dirname, 'src', ...args);
}

function trans(code, answer) {
  return openai.chat.completions.create({
    model: 'qwen3-coder-plus', //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    messages: [
      { role: 'system', content: '你是一个高级前端开发工程师' },
      {
        role: 'user',
        content: `css内容为：${code}\n\n转换要求如下：${answer}\n\n只返回css内容，不包含其他内容`,
      },
    ],
  });
}
