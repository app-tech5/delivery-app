import { Alert, Platform } from 'react-native';

/**
 * RN-web Alert.alert is often a no-op in mobile Chrome.
 * Polyfill with window.alert / window.confirm so Logout and other dialogs work.
 */
export function installWebAlertPolyfill() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  if (window.__GF_WEB_ALERT_POLYFILL__) return;
  window.__GF_WEB_ALERT_POLYFILL__ = true;

  const showToast = (text) => {
    try {
      const existing = document.getElementById('gf-web-alert-toast');
      if (existing) existing.remove();
      const el = document.createElement('div');
      el.id = 'gf-web-alert-toast';
      el.setAttribute('role', 'status');
      el.textContent = text;
      Object.assign(el.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        maxWidth: '90vw',
        background: 'rgba(17,24,39,.92)',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '10px',
        zIndex: '2147483647',
        font: '600 14px/1.35 system-ui,-apple-system,sans-serif',
        boxShadow: '0 8px 24px rgba(0,0,0,.25)',
        pointerEvents: 'none',
      });
      document.body.appendChild(el);
      setTimeout(() => {
        try {
          el.remove();
        } catch (_) {
          /* ignore */
        }
      }, 2200);
    } catch (_) {
      /* ignore */
    }
  };

  Alert.alert = (title, message, buttons) => {
    const list =
      Array.isArray(buttons) && buttons.length > 0
        ? buttons
        : [{ text: 'OK' }];

    const text = [title, message].filter(Boolean).join('\n\n');

    // Never use blocking window.alert — it freezes login/navigation on web demos.
    if (list.length === 1) {
      showToast(text);
      try {
        list[0]?.onPress?.();
      } catch (_) {
        /* ignore */
      }
      return;
    }

    const cancelBtn = list.find((b) => b?.style === 'cancel');
    const actionBtn =
      list.find((b) => b?.style === 'destructive') ||
      list.find((b) => b !== cancelBtn) ||
      list[list.length - 1];

    const ok = window.confirm(text);
    try {
      if (ok) actionBtn?.onPress?.();
      else cancelBtn?.onPress?.();
    } catch (_) {
      /* ignore */
    }
  };
}
