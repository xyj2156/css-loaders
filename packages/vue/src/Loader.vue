<template>
  <div class="loader-host" :class="hostClass" :style="hostStyle">
    <div :class="loaderClass" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * 统一 Loader 组件
 * - kind:    loader 类别，对应 css-loaders.com 的分类名（line / dots / spinner ...）
 * - variant: 该类别下的编号（从 1 开始）
 * - size / color / duration: 透传为 CSS 变量 --size / --color-1 / --duration
 */
export interface LoaderProps {
  kind: string;
  variant: number | string;
  size?: string;
  color?: string;
  duration?: string;
  className?: string;
}

const props = withDefaults(defineProps<LoaderProps>(), {});

const loaderClass = computed(() => `__loading-${props.kind}-${props.variant}`);

const hostClass = computed(() => props.className ?? '');

const hostStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.size) s['--size'] = props.size;
  if (props.color) s['--color-1'] = props.color;
  if (props.duration) s['--duration'] = props.duration;
  return s;
});
</script>
