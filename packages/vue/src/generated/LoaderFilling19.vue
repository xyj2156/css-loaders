<template>
  <div :class="'__loading-filling-19'" :style="cssVars" />
</template>

<script setup lang="ts">
import '@x-ac/css-loading/style/filling/l19.css';
import { computed } from 'vue';

/** __loading-filling-19 */
const props = defineProps<{
  /** 尺寸，透传为 CSS 变量 --size */
  size?: string;
  /** 主色，透传为 CSS 变量 --color-1 */
  color?: string;
  /** 动画时长，透传为 CSS 变量 --duration */
  duration?: string;
}>();

const cssVars = computed(() => {
  const s: Record<string, string> = {};
  if (props.size) s['--size'] = props.size;
  if (props.color) s['--color-1'] = props.color;
  if (props.duration) s['--duration'] = props.duration;
  return s;
});
</script>
