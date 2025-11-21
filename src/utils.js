import { dirname } from 'path';
import fs from 'node:fs';

/**
 * 依次循环数组中的元素
 * @param {array} arr 循环用的数组
 * @param {function|undefined} callback 回调函数，可以是异步的，等待执行完毕后才会执行下一个元素
 */
export function asyncEach(arr, callback) {
  if (!Array.isArray(arr)) {
    throw new TypeError('First argument must be an array');
  }
  if (typeof callback !== 'function') {
    throw new TypeError('Second argument must be a function');
  }

  return new Promise(async (resolve, reject) => {
    try {
      for (let i = 0; i < arr.length; i++) {
        const result = callback(arr[i], i, arr);
        if (result && typeof result.then === 'function') {
          await result;
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 转换样式字符串为作用域样式
 * @param {string} scope - 作用域选择器
 * @param {string} origin - 原始样式选择器
 * @param {string} content - 原始样式字符串
 * @returns {string} 转换后的作用域样式字符串
 * @throws {TypeError} 当参数类型不正确时
 */
export function transStyle(scope, origin, content) {
  if (
    typeof scope !== 'string' ||
    typeof origin !== 'string' ||
    typeof content !== 'string'
  ) {
    throw new TypeError('All arguments must be strings');
  }

  return content
    .replaceAll(`#${origin}`, `.${scope}`)
    .replaceAll(origin, `${scope}-${origin}`);
}

/**
 * 写入文件
 * @param {string} filename - 文件路径
 * @param {string|NonSharedBuffer} content - 文件内容
 * @returns {void}
 * @throws {Error} 当写入文件时出错
 */
export function writeFile(filename, content) {
  const dir = dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filename, content);
}
