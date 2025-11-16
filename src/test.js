import { transStyle } from "./utils.js";
import { readFileSync } from "node:fs";

const content = readFileSync('./src/styles/3D/l2.css').toString('utf8');

const result = transStyle('3d-2', '#l2', content);

console.log(result);

export default {}