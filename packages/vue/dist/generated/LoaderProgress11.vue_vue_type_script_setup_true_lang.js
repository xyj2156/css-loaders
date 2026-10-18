import { computed as e, createElementBlock as t, defineComponent as n, normalizeClass as r, normalizeStyle as i, openBlock as a } from "vue";
import "@x-ac/css-loading/style/progress/l11.css";
//#region src/generated/LoaderProgress11.vue?vue&type=script&setup=true&lang.ts
var o = /*@__PURE__*/ n({
	__name: "LoaderProgress11",
	props: {
		size: {},
		color: {},
		duration: {}
	},
	setup(n) {
		let o = n, s = e(() => {
			let e = {};
			return o.size && (e["--size"] = o.size), o.color && (e["--color-1"] = o.color), o.duration && (e["--duration"] = o.duration), e;
		});
		return (e, n) => (a(), t("div", {
			class: r("__loading-progress-11"),
			style: i(s.value)
		}, null, 4));
	}
});
//#endregion
export { o as default };
