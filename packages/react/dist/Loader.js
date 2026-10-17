import { require_jsx_runtime as e } from "./node_modules/.pnpm/react@19.3.1/node_modules/react/jsx-runtime.js";
//#region src/Loader.tsx
var t = e();
function n({ kind: e, variant: n, size: r, color: i, duration: a, style: o, className: s, ...c }) {
	let l = {};
	r && (l["--size"] = r), i && (l["--color-1"] = i), a && (l["--duration"] = a);
	let u = {
		...l,
		...o
	};
	return /* @__PURE__ */ (0, t.jsx)("div", {
		className: s,
		style: u,
		...c,
		children: /* @__PURE__ */ (0, t.jsx)("div", { className: `__loading-${e}-${n}` })
	});
}
//#endregion
export { n as Loader, n as default };
