import { createApp, h, defineComponent, ref, computed } from 'vue';
import cssIndex from '@x-ac/css-loading/style/index.json';
import '@x-ac/css-loading';

// 暗/亮切换
const theme = ref(localStorage.getItem('theme') ?? 'light');
document.documentElement.dataset.theme = theme.value;
document.getElementById('theme-toggle')!.onclick = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme.value;
  localStorage.setItem('theme', theme.value);
  document.getElementById('theme-toggle')!.textContent = theme.value === 'light' ? '🌙' : '☀️';
};

// 搜索
const keyword = ref('');

const kinds = Object.keys(cssIndex as Record<string, string[]>);

// 渲染导航
const navEl = document.getElementById('nav')!;
navEl.innerHTML = kinds.map((k) => `<a href="#${k}">${k}</a>`).join('');

const App = defineComponent({
  setup() {
    const filtered = computed(() => {
      const kw = keyword.value.trim().toLowerCase();
      if (!kw) return cssIndex;
      const out: Record<string, string[]> = {};
      for (const k of kinds) {
        const matched = cssIndex[k].filter((cls: string) => cls.toLowerCase().includes(kw));
        if (matched.length) out[k] = matched;
      }
      return out;
    });
    return () =>
      h('div', [
        ...Object.entries(filtered.value as Record<string, string[]>).flatMap(([kind, classes]) => [
          h('h2', { key: `h-${kind}`, id: kind }, [kind, h('span', { class: 'count' }, `(${classes.length})`)]),
          h(
            'div',
            { key: `g-${kind}`, class: 'grid' },
            classes.map((cls: string) =>
              h('div', { key: cls, class: 'cell' }, [
                h('div', { class: cls }),
                h('div', { class: 'name' }, cls.replace('__loading-', '')),
              ]),
            ),
          ),
        ]),
      ]);
  },
});

createApp(App).mount('#app');

document.getElementById('search')!.addEventListener('input', (e) => {
  keyword.value = (e.target as HTMLInputElement).value;
});
