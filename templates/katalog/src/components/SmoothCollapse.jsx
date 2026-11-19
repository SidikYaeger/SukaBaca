import React, { useEffect, useRef } from 'react';

/**
 * Seamless CSS-grid collapse/expand wrapper.
 * Animates both open and close smoothly (height + opacity + micro-translate)
 * while setting native `inert` when closed so hidden controls stay unreachable.
 */
export function SmoothCollapse({ open, className = '', innerClassName = '', children }) {
  const innerRef = useRef(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (open) {
      el.removeAttribute('inert');
    } else {
      el.setAttribute('inert', '');
    }
  }, [open]);

  return (
    <div
      className={`smooth-collapse${open ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden={!open}
    >
      <div
        ref={innerRef}
        className={`smooth-collapse-inner${innerClassName ? ` ${innerClassName}` : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
