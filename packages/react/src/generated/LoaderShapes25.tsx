import '@x-ac/css-loading/style/shapes/l25.css';
import type { CSSProperties } from 'react';

/** 自动生成：__loading-shapes-25 */
export function LoaderShapes25(props: {
  className?: string;
  style?: CSSProperties;
  /** 尺寸，透传为 CSS 变量 --size */
  size?: string;
  /** 主色，透传为 CSS 变量 --color-1 */
  color?: string;
  /** 动画时长，透传为 CSS 变量 --duration */
  duration?: string;
}) {
  const cssVars: CSSProperties = {};
  if (props.size) (cssVars as Record<string, string>)['--size'] = props.size;
  if (props.color) (cssVars as Record<string, string>)['--color-1'] = props.color;
  if (props.duration) (cssVars as Record<string, string>)['--duration'] = props.duration;
  return <div className={props.className} style={{ ...cssVars, ...props.style }}><div className="__loading-shapes-25" /></div>;
}

export default LoaderShapes25;
