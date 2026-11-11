const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

/** Format integer VND, e.g. 1500000 -> "1.500.000 ₫" */
export function formatVnd(amount) {
  return vnd.format(amount).replace(/\u00a0/g, ' ');
}

/** 125000 ms -> "02:05" (or "1:02:05" when >= 1h). Never negative. */
export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
