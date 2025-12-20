import { useEffect, useRef } from 'react';
import 'autoimg-webcomponent';

export interface AutoImgProps {
  // Core properties
  src?: string;
  width?: string;
  height?: string;

  // Image properties
  imgAlt?: string;
  imgLoading?: 'lazy' | 'eager';
  imgTitle?: string;
  imgDraggable?: boolean;
  imgCrossOrigin?: 'anonymous' | 'use-credentials' | '';
  imgDecoding?: 'async' | 'sync' | 'auto';
  imgFetchPriority?: 'high' | 'low' | 'auto';

  // Model properties
  focus?: string;
  focusCenter?: string;
  focusTl?: string;
  focusTlX?: string;
  focusTlY?: string;
  focusBr?: string;
  focusBrX?: string;
  focusBrY?: string;
  defer?: boolean;
  allowDistortion?: boolean;
  padding?: string;
  placeholder?: string;

  // Standard event handlers (work automatically)
  onClick?: React.MouseEventHandler<HTMLElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;

  // Standard HTML props
  className?: string;
  style?: React.CSSProperties;
}

export const AutoImg: React.FC<AutoImgProps> = (props) => {
  const {
    src,
    width,
    height,
    imgAlt,
    imgLoading,
    imgTitle,
    imgDraggable,
    imgCrossOrigin,
    imgDecoding,
    imgFetchPriority,
    focus,
    focusCenter,
    focusTl,
    focusTlX,
    focusTlY,
    focusBr,
    focusBrX,
    focusBrY,
    defer,
    allowDistortion,
    padding,
    placeholder,
    onClick,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
  } = props;

  const elementRef = useRef<HTMLElement>(null);

  // Set properties that can't be set via JSX attributes
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Boolean properties
    if (defer !== undefined) {
      element.setAttribute('defer', String(defer));
    }
    if (allowDistortion !== undefined) {
      element.setAttribute('allowDistortion', String(allowDistortion));
    }
    if (imgDraggable !== undefined) {
      element.setAttribute('img-draggable', String(imgDraggable));
    }

    // Dotted properties (can't be set via JSX)
    if (focusTl !== undefined) {
      element.setAttribute('focus.tl', focusTl);
    }
    if (focusTlX !== undefined) {
      element.setAttribute('focus.tl.x', focusTlX);
    }
    if (focusTlY !== undefined) {
      element.setAttribute('focus.tl.y', focusTlY);
    }
    if (focusBr !== undefined) {
      element.setAttribute('focus.br', focusBr);
    }
    if (focusBrX !== undefined) {
      element.setAttribute('focus.br.x', focusBrX);
    }
    if (focusBrY !== undefined) {
      element.setAttribute('focus.br.y', focusBrY);
    }
  }, [defer, allowDistortion, imgDraggable, focusTl, focusTlX, focusTlY, focusBr, focusBrX, focusBrY]);

  return (
    <auto-img
      ref={elementRef as any}
      src={src}
      width={width}
      height={height}
      img-alt={imgAlt}
      img-loading={imgLoading}
      img-title={imgTitle}
      img-crossOrigin={imgCrossOrigin}
      img-decoding={imgDecoding}
      img-fetchPriority={imgFetchPriority}
      focus={focus}
      focus-center={focusCenter}

      padding={padding}
      placeholder={placeholder}
      className={className}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
