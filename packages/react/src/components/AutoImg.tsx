import { useEffect, useRef } from 'react';
import '@shironeko1052/autoimg';

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

  // Set dotted properties that can't be set via JSX attributes
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

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
  }, [focusTl, focusTlX, focusTlY, focusBr, focusBrX, focusBrY]);

  // Build props object to pass all attributes before element is connected
  const elementProps: any = {
    ref: elementRef,
    src,
    width,
    height,
    'img-alt': imgAlt,
    'img-loading': imgLoading,
    'img-title': imgTitle,
    'img-crossOrigin': imgCrossOrigin,
    'img-decoding': imgDecoding,
    'img-fetchPriority': imgFetchPriority,
    focus,
    'focus-center': focusCenter,
    padding,
    placeholder,
    className,
    style,
    onClick,
    onMouseEnter,
    onMouseLeave,
  };

  // Set boolean attributes as strings so they're available before connectedCallback
  if (defer !== undefined) {
    elementProps.defer = String(defer);
  }
  if (allowDistortion !== undefined) {
    elementProps.allowDistortion = String(allowDistortion);
  }
  if (imgDraggable !== undefined) {
    elementProps['img-draggable'] = String(imgDraggable);
  }

  return <auto-img {...elementProps} />;
};
