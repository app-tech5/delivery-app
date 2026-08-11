import { Platform } from 'react-native';

/**
 * Web scroll fix: unlock clipped ScrollViews without breaking the drawer.
 * Aligned with customer-app — do not force body/root overflow or sticky pointer-events:none.
 */
export function installWebScrollFix() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  if (typeof window !== 'undefined' && window.__GF_WEB_SCROLL_FIX__) return;
  if (typeof window !== 'undefined') window.__GF_WEB_SCROLL_FIX__ = true;

  const isDrawerLike = (el) => {
    const st = window.getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (r.width >= 200 && r.width <= 320 && r.height >= vh * 0.55) return true;
    if (
      (st.position === 'absolute' || st.position === 'fixed') &&
      r.width >= 200 &&
      r.width <= 340
    ) {
      return true;
    }
    return false;
  };

  const shouldSkip = (el) => {
    if (!el || el.nodeType !== 1) return true;
    if (el.dataset?.gfScrollOk === '1') return true;
    if (el.querySelector?.('iframe, canvas, .leaflet-container, .maplibregl-map')) return true;
    if (el.matches?.('iframe, canvas, .leaflet-container, .maplibregl-map')) return true;
    if (isDrawerLike(el)) return true;
    const st = window.getComputedStyle(el);
    if (st.overflowX === 'auto' || st.overflowX === 'scroll') return true;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.width < 340 && r.left < 8 && r.height > (window.innerHeight || 0) * 0.5) {
      return true;
    }
    return false;
  };

  const unlockClipper = (el) => {
    el.style.setProperty('overflow-y', 'auto', 'important');
    el.style.setProperty('touch-action', 'pan-y', 'important');
    el.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');
    el.style.setProperty('min-height', '0', 'important');
    el.dataset.gfScrollOk = '1';
  };

  const fixDrawerPointerEvents = () => {
    const vh = window.innerHeight || 0;
    const vw = window.innerWidth || 0;

    for (const el of document.querySelectorAll('div')) {
      const st = window.getComputedStyle(el);
      if (st.position !== 'absolute' && st.position !== 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 200 || r.width > 320 || r.height < vh * 0.55) continue;

      const fullyOff =
        r.right <= -8 || r.left >= vw + 8 || (r.right <= 0 && r.left < 0);

      if (fullyOff) {
        // Off-screen drawer must not steal touches from the main screen
        el.style.setProperty('pointer-events', 'none', 'important');
        el.dataset.gfDrawerPe = '1';
        continue;
      }

      // Visible / opening drawer — always clickable (undo previous PE none)
      el.style.setProperty('pointer-events', 'auto', 'important');
      el.style.setProperty('z-index', '10000', 'important');
      delete el.dataset.gfDrawerPe;

      // Ensure interactive children can receive clicks
      el.querySelectorAll('a,button,[role="button"],div').forEach((child) => {
        const pe = window.getComputedStyle(child).pointerEvents;
        if (pe === 'none') {
          child.style.setProperty('pointer-events', 'auto', 'important');
        }
      });
    }
  };

  const fix = () => {
    const vh = window.innerHeight || 0;

    for (const el of document.querySelectorAll('div')) {
      if (shouldSkip(el)) continue;
      const st = window.getComputedStyle(el);
      const taller = el.scrollHeight > el.clientHeight + 40;
      const viewportish = el.clientHeight > 180 && el.clientHeight <= vh + 40;
      if (!taller || !viewportish) continue;
      if (st.overflowY === 'hidden' || st.overflow === 'hidden') {
        unlockClipper(el);
      }
    }

    fixDrawerPointerEvents();
  };

  const schedule = () => {
    clearTimeout(installWebScrollFix._timer);
    installWebScrollFix._timer = setTimeout(fix, 80);
  };

  const start = () => {
    fix();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
}
