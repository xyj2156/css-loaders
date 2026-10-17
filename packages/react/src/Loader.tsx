import type { CSSProperties, HTMLAttributes } from 'react';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** loader 类别，如 line / dots / spinner */
  kind: string;
  /** 类别下的编号，从 1 开始 */
  variant: number | string;
  /** 尺寸，透传为 CSS 变量 --size */
  size?: string;
  /** 主色，透传为 CSS 变量 --color-1 */
  color?: string;
  /** 动画时长，透传为 CSS 变量 --duration */
  duration?: string;
}

/**
 * 统一 Loader 组件（React）
 * - 不自带 css 副作用，由用户按需引入对应类别 css
 */
export function Loader({ kind, variant, size, color, duration, style, className, ...rest }: LoaderProps) {
  const cssVars: CSSProperties = {};
  if (size) (cssVars as Record<string, string>)['--size'] = size;
  if (color) (cssVars as Record<string, string>)['--color-1'] = color;
  if (duration) (cssVars as Record<string, string>)['--duration'] = duration;

  const mergedStyle = { ...cssVars, ...style };

  return (
    <div className={className} style={mergedStyle} {...rest}>
      <div className={`__loading-${kind}-${variant}`} />
    </div>
  );
}

export default Loader;
