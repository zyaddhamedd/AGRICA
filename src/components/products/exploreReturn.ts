// Single-use, tab-local position for native Back after the Explore anchor.
// Ordinary links/visits never intercept history or restore an old position.
const KEY = "agrica:product-explore-return";
const MAX_AGE = 30 * 60 * 1000;

export function rememberExploreReturn(productId: string): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ productId, url: location.pathname + location.search, y: window.scrollY, createdAt: Date.now() }));
  } catch { /* Navigation still works when browser storage is unavailable. */ }
}

export function restoreExploreReturn(): () => void {
  let frame = 0;
  let timeout = 0;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    clearTimeout(timeout);
    window.removeEventListener("load", restore);
    window.removeEventListener("pointerdown", abandon, true);
    window.removeEventListener("keydown", abandon, true);
    window.removeEventListener("wheel", abandon, true);
  };
  const abandon = () => { try { sessionStorage.removeItem(KEY); } catch {} cancel(); };
  let restore = () => {};
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return cancel;
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== "object" || !("url" in saved) || !("productId" in saved) || !("y" in saved) || !("createdAt" in saved)) { abandon(); return cancel; }
    const { url, productId, y, createdAt } = saved;
    if (typeof createdAt !== "number" || Date.now() - createdAt > MAX_AGE || Date.now() < createdAt) { abandon(); return cancel; }
    if (url !== location.pathname + location.search) return cancel;
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== "back_forward" || typeof productId !== "string" || typeof y !== "number" || !Number.isFinite(y) || y < 0) { abandon(); return cancel; }
    restore = () => {
      if (cancelled) return;
      const trigger = document.querySelector<HTMLButtonElement>(`[data-product-id="${CSS.escape(productId)}"] .export-card-keyboard-toggle`);
      if (!trigger || document.documentElement.scrollHeight - innerHeight < y) { frame = requestAnimationFrame(restore); return; }
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        window.scrollTo({ top: y, behavior: "instant" });
        trigger.focus({ preventScroll: true });
        abandon();
      });
    };
    // Wait on readiness without burning a frame-count budget on slow assets.
    timeout = window.setTimeout(abandon, 15000);
    window.addEventListener("pointerdown", abandon, true);
    window.addEventListener("keydown", abandon, true);
    window.addEventListener("wheel", abandon, true);
    if (document.readyState === "complete") frame = requestAnimationFrame(restore);
    else window.addEventListener("load", restore, { once: true });
  } catch { abandon(); }
  return cancel;
}
