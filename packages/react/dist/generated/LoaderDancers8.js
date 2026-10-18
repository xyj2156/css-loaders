import { require_jsx_runtime as e } from "../node_modules/.pnpm/react@19.3.1/node_modules/react/jsx-runtime.js";
import "@x-ac/css-loading/style/dancers/l8.css";
//#region src/generated/LoaderDancers8.tsx
var t = e();
function n(e) {
	let n = {};
	return e.size && (n["--size"] = e.size), e.color && (n["--color-1"] = e.color), e.duration && (n["--duration"] = e.duration), /* @__PURE__ */ (0, t.jsx)("div", {
		className: e.className,
		style: {
			...n,
			...e.style
		},
		children: /* @__PURE__ */ (0, t.jsx)("div", { className: "__loading-dancers-8" })
	});
}
//#endregion
export { n as LoaderDancers8, n as default };
