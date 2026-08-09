(function initAstraAuth(global) {
  const state = { token: '', email: '', expiresAt: 0, clientId: '', waiter: null, modal: null };

  function decodeToken(token) {
    try {
      const payload = JSON.parse(atob(String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return { email: String(payload.email || '').trim().toLowerCase(), expiresAt: Number(payload.exp || 0) * 1000 };
    } catch (error) {
      return { email: '', expiresAt: 0 };
    }
  }

  function validToken() {
    return Boolean(state.token && state.email && state.expiresAt > Date.now() + 60000);
  }

  function emitChange() {
    global.dispatchEvent(new CustomEvent('astra-auth-changed', { detail: { email: state.email } }));
  }

  function removeModal() {
    if (state.modal) state.modal.remove();
    state.modal = null;
  }

  function acceptCredential(response) {
    const parsed = decodeToken(response && response.credential);
    if (!parsed.email || !parsed.expiresAt) return;
    state.token = response.credential;
    state.email = parsed.email;
    state.expiresAt = parsed.expiresAt;
    sessionStorage.setItem('astraGoogleIdToken_v1', state.token);
    removeModal();
    if (state.waiter) state.waiter.resolve(state.token);
    state.waiter = null;
    emitChange();
  }

  function ensureGoogleScript() {
    if (global.google && global.google.accounts && global.google.accounts.id) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-astra-google-identity]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.astraGoogleIdentity = 'true';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function initialize() {
    const stored = sessionStorage.getItem('astraGoogleIdToken_v1') || '';
    const parsed = decodeToken(stored);
    if (parsed.expiresAt > Date.now() + 60000) {
      state.token = stored;
      state.email = parsed.email;
      state.expiresAt = parsed.expiresAt;
    }
    const response = await fetch('/api/v1/config', { cache: 'no-store', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Astra authentication configuration is unavailable.');
    const config = await response.json();
    state.clientId = String(config.googleOAuthClientId || '').trim();
    if (!state.clientId) throw new Error('Google sign-in is not configured.');
    await ensureGoogleScript();
    global.google.accounts.id.initialize({ client_id: state.clientId, callback: acceptCredential, auto_select: true });
    if (validToken()) emitChange();
  }

  const initialized = initialize().catch((error) => {
    state.initializationError = error;
  });

  async function requireSignIn(reason = '') {
    await initialized;
    if (validToken()) return state.token;
    if (state.initializationError) throw state.initializationError;
    if (state.waiter) return state.waiter.promise;

    let resolveWaiter;
    let rejectWaiter;
    const promise = new Promise((resolve, reject) => { resolveWaiter = resolve; rejectWaiter = reject; });
    state.waiter = { promise, resolve: resolveWaiter, reject: rejectWaiter };

    const modal = document.createElement('section');
    modal.className = 'astra-auth-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="astra-auth-card"><h2>Sign in to Astra Notes</h2><p></p><div class="astra-google-signin"></div></div>';
    modal.querySelector('p').textContent = reason || 'Use your approved Astra Google Workspace account. No email entry is required.';
    document.body.appendChild(modal);
    state.modal = modal;
    global.google.accounts.id.renderButton(modal.querySelector('.astra-google-signin'), {
      theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill',
    });
    return promise;
  }

  function signOut() {
    if (state.email && global.google && global.google.accounts) global.google.accounts.id.disableAutoSelect();
    state.token = '';
    state.email = '';
    state.expiresAt = 0;
    sessionStorage.removeItem('astraGoogleIdToken_v1');
    emitChange();
  }

  global.astraAuth = {
    ready: () => initialized,
    getIdToken: () => requireSignIn(),
    getUserEmail: () => state.email,
    requireSignIn,
    signOut,
  };
}(window));
