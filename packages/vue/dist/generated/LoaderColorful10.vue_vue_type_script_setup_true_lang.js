import { computed as e, createElementBlock as t, defineComponent as n, normalizeClass as r, normalizeStyle as i, openBlock as a } from "vue";
import "@x-ac/css-loading/style/colorful/l10.css";
//#region src/generated/LoaderColorful10.vue?vue&type=script&setup=true&lang.ts
var o = /*@__PURE__*/ n({
	__name: "LoaderColorful10",
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
			class: r("__loading-colorful-10"),
			style: i(s.value)
		}, null, 4));
	}
});
//#endregion
export { o as default };
