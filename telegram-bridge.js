// Load this file after telegram-web-app.js. This helper does not replace server-side auth.
(() => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  tg.ready();
  tg.expand();
  document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight}px`);
  window.CITYROLL_TELEGRAM = {
    initData: tg.initData, // send to backend in X-Telegram-Init-Data; never trust initDataUnsafe
    user: tg.initDataUnsafe?.user ?? null, // display only; not an authorization source
    haptic: (style='light') => tg.HapticFeedback?.impactOccurred(style),
    showBackButton: (handler) => { tg.BackButton.show(); tg.BackButton.onClick(handler); },
    hideBackButton: () => tg.BackButton.hide()
  };
})();
