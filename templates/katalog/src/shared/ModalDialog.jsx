import React, { useEffect, useRef, useState } from 'react';

let supportsDisplayTransition;
function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false;
  }
  const probe = document.createElement('div');
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = 'none';
  supportsDisplayTransition = getComputedStyle(probe).display === 'block';
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay();
}

async function closeTopLayer(element, returnValue) {
  if (!element.open) return;
  if (!supportsTopLayerExit()) {
    element.setAttribute('data-closing', '');
    const animations = element.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((r) => setTimeout(r, 420))
      ]);
    }
    if (!element.hasAttribute('data-closing')) return;
    element.removeAttribute('data-closing');
  }
  element.close(returnValue);
}

/**
 * Accessible native <dialog> wrapper following modern-web-guidance
 * `dialog`, `light-dismiss-a-dialog`, and `animate-to-from-top-layer`.
 * Keeps children mounted through the CSS exit transition so closing never snaps blank.
 */
export function ModalDialog({
  open,
  onClose,
  ariaLabelledBy,
  ariaLabel,
  lightDismiss = true,
  className = '',
  children
}) {
  const dialogRef = useRef(null);
  const unmountTimerRef = useRef(null);
  const [rendered, setRendered] = useState(open);

  useEffect(() => {
    return () => {
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
      dialog.removeAttribute('data-closing');
      setRendered(true);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      closeTopLayer(dialog, '');
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      const value = dialog.returnValue;
      dialog.returnValue = '';
      dialog.removeAttribute('data-closing');
      if (onClose) onClose(value);

      // Delay unmounting children until after the CSS top-layer exit transition finishes
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      unmountTimerRef.current = setTimeout(() => {
        if (!dialog.open) setRendered(false);
      }, reduced ? 120 : 360);
    };

    const handleCancel = (event) => {
      if (!supportsTopLayerExit()) {
        event.preventDefault();
        closeTopLayer(dialog, '');
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);

    let cleanupFallback = null;
    if (lightDismiss && !('closedBy' in HTMLDialogElement.prototype)) {
      const isOutside = (e) => {
        const rect = dialog.getBoundingClientRect();
        return (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        );
      };
      let pressedOutside = false;
      const onPointerDown = (e) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e) => {
        if (pressedOutside && isOutside(e)) {
          closeTopLayer(dialog, '');
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
      if (cleanupFallback) cleanupFallback();
    };
  }, [onClose, lightDismiss]);

  const closedByProp = { closedby: lightDismiss ? 'any' : 'closerequest' };

  return (
    <dialog
      ref={dialogRef}
      className={className}
      aria-labelledby={ariaLabelledBy}
      aria-label={!ariaLabelledBy ? ariaLabel : undefined}
      {...closedByProp}
    >
      {rendered ? children : null}
    </dialog>
  );
}
