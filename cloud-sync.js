// Telegram-authenticated cloud profile sync. Server validates initData; never use initDataUnsafe for auth.
(() => {
  const tg = window.Telegram?.WebApp;
  const endpoint = '/.netlify/functions/profile';
  let initData = tg?.initData || '';
  let timer = null;
  let enabled = Boolean(initData);
  let syncing = false;
  let queuedState = null;
  let lastErrorAt = 0;

  async function request(method, body) {
    if (!enabled || !initData) throw new Error('Открой игру через Telegram');
    const response = await fetch(endpoint, {
      method,
      headers: { 'X-Telegram-Init-Data': initData, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Ошибка сервера: ${response.status}`);
    return data;
  }

  async function restore(localState) {
    if (!enabled) return { state: localState, cloud: false };
    try {
      const result = await request('GET');
      if (result.profile?.game_state && typeof result.profile.game_state === 'object') {
        return { state: result.profile.game_state, cloud: true, user: result.user };
      }
      await request('PUT', { state: localState });
      return { state: localState, cloud: true, user: result.user, migrated: true };
    } catch (error) {
      enabled = false;
      console.warn('[CRYPTOROLL cloud]', error.message);
      return { state: localState, cloud: false, error: error.message };
    }
  }

  async function flush() {
    if (!enabled || syncing || !queuedState) return;
    const snapshot = queuedState;
    queuedState = null;
    syncing = true;
    try {
      await request('PUT', { state: snapshot });
    } catch (error) {
      queuedState = snapshot;
      const now = Date.now();
      if (now - lastErrorAt > 30000) {
        console.warn('[CRYPTOROLL cloud save]', error.message);
        lastErrorAt = now;
      }
    } finally {
      syncing = false;
      if (queuedState) setTimeout(flush, 1500);
    }
  }

  window.CRYPTOROLL_CLOUD = {
    restore,
    schedule(state) {
      if (!enabled) return;
      queuedState = state;
      clearTimeout(timer);
      timer = setTimeout(flush, 1800);
    },
    status: () => enabled ? 'connected' : 'local'
  };
})();
