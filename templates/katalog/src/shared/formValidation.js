import { useEffect } from 'react';

let sharedAnnouncer = null;

function getAnnouncer() {
  if (sharedAnnouncer && document.body.contains(sharedAnnouncer)) {
    return sharedAnnouncer;
  }
  const el = document.createElement('div');
  el.setAttribute('aria-live', 'polite');
  el.className = 'sr-only';
  document.body.append(el);
  sharedAnnouncer = el;
  return el;
}

function linkError(el, shown) {
  const errorId = el.dataset.error;
  if (!errorId) return;
  const ids = (el.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter((id) => id && id !== errorId);
  if (shown) ids.push(errorId);
  if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
  else el.removeAttribute('aria-describedby');
}

/**
 * Synchronizes aria-invalid and aria-describedby with CSS :user-invalid across forms,
 * following modern-web-guidance `validate-input-after-interaction`.
 */
export function useUserInvalidSync(containerRef) {
  useEffect(() => {
    const root = containerRef?.current || document;
    const flagged = new WeakSet();
    const announced = new WeakSet();
    const announcer = getAnnouncer();
    let announceTimer = null;
    let announcedField = null;

    const announceError = (el) => {
      const errorEl = el.dataset.error ? document.getElementById(el.dataset.error) : null;
      if (!errorEl) return;
      const labelText = el.labels?.[0]?.textContent?.trim();
      const prefix = labelText ? `${labelText}: ` : '';
      clearTimeout(announceTimer);
      announcer.textContent = '';
      announcedField = el;
      announceTimer = setTimeout(() => {
        announcer.textContent = prefix + errorEl.textContent.replace(/\s+/g, ' ').trim();
      }, 500);
    };

    const syncAria = (el, shouldAnnounce = false) => {
      if (!el?.matches?.('input, select, textarea')) return;
      let isInvalid = false;
      try {
        isInvalid = el.matches(':user-invalid');
      } catch {
        isInvalid = !el.validity.valid;
      }

      if (isInvalid) {
        if (shouldAnnounce && !announced.has(el)) {
          announceError(el);
          announced.add(el);
        }
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        flagged.delete(el);
        announced.delete(el);
        if (announcedField === el) {
          clearTimeout(announceTimer);
          announcer.textContent = '';
        }
      }
    };

    root.querySelectorAll('input, select, textarea').forEach((el) => syncAria(el));

    const onBlur = (e) => syncAria(e.target, true);
    const onInput = (e) => {
      if (e.target?.hasAttribute?.('aria-invalid')) syncAria(e.target);
    };
    const onChange = (e) => syncAria(e.target, true);
    const onInvalid = (e) => {
      announced.add(e.target);
      syncAria(e.target);
    };
    const onReset = (e) => {
      const form = e.target;
      if (form?.elements) {
        setTimeout(() => [...form.elements].forEach((el) => syncAria(el)));
      }
    };

    root.addEventListener('blur', onBlur, true);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange, true);
    root.addEventListener('invalid', onInvalid, true);
    root.addEventListener('reset', onReset, true);

    return () => {
      clearTimeout(announceTimer);
      root.removeEventListener('blur', onBlur, true);
      root.removeEventListener('input', onInput);
      root.removeEventListener('change', onChange, true);
      root.removeEventListener('invalid', onInvalid, true);
      root.removeEventListener('reset', onReset, true);
    };
  }, [containerRef]);
}
