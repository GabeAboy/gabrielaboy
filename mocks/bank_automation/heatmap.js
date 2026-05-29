// Render the savings activity heatmap deterministically.
// Any <svg data-heatmap> on the page becomes a 52 × 7 grid.
document.querySelectorAll('[data-heatmap]').forEach(function (svg) {
  const WEEKS = 52, DAYS = 7;
  const CELL = 12, GAP = 3;
  const X0 = 30, Y0 = 20;
  const colors = [
    'var(--surface-3)',
    'rgba(111, 140, 94, 0.28)',
    'rgba(111, 140, 94, 0.55)',
    'rgba(111, 140, 94, 0.8)',
    '#6f8c5e'
  ];

  function rand(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 100000;
    return x - Math.floor(x);
  }

  function intensityForWeekDay(w, d) {
    const r = rand(w * 7 + d);
    const weekdayBoost = (d >= 1 && d <= 5) ? 0.12 : 0;
    const recencyBoost = (w / WEEKS) * 0.18;
    const paycheck = (w % 2 === 0 && (d === 4 || d === 5)) ? 0.4 : 0;
    const scheduled = (w % 4 === 1 && d === 1) ? 0.35 : 0;
    const v = r + weekdayBoost + recencyBoost + paycheck + scheduled;
    if (v < 0.35) return 0;
    if (v < 0.55) return 1;
    if (v < 0.78) return 2;
    if (v < 0.95) return 3;
    return 4;
  }

  let body = '';

  const dowLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  dowLabels.forEach((lbl, d) => {
    if (lbl) {
      const y = Y0 + d * (CELL + GAP) + CELL - 2;
      body += `<text class="dow-label" x="${X0 - 6}" y="${y}">${lbl}</text>`;
    }
  });

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  months.forEach((m, i) => {
    const x = X0 + (i * 4.3) * (CELL + GAP);
    body += `<text class="month-label" x="${x}" y="${Y0 - 6}">${m}</text>`;
  });

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const x = X0 + w * (CELL + GAP);
      const y = Y0 + d * (CELL + GAP);
      const intensity = intensityForWeekDay(w, d);
      body += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${colors[intensity]}"></rect>`;
    }
  }

  svg.setAttribute('viewBox', '0 0 820 132');
  svg.innerHTML = body;
});
