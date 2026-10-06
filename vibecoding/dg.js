/* ═══════════════════════════════════════════════════════════════
   모식도(그림) 부품 — 아이콘 모음 · 보일 때만 움직이기 · 단계 넘기기 · 두 경우 바꿔 보기
   쓰는 법: <svg class="ic"><use href="#i-db"/></svg>
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const P = {
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M6 6.5h.01M8.5 6.5h.01"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
    teacher: '<circle cx="9" cy="8" r="3"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><rect x="14" y="4" width="7" height="6" rx="1"/>',
    server: '<rect x="4" y="3" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="7" rx="1.5"/><path d="M8 6.5h.01M8 17.5h.01"/>',
    db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13"/><path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/>',
    ai: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M3 14h18M9 4v16"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    cursor: '<path d="M5 3l14 7-6 1.8L10.5 18z"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    repo: '<path d="M5 4h11l3 3v13H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.8 2.5 14.2 0 17M12 3.5c-2.5 2.8-2.5 14.2 0 17"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>',
    paper: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    board: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M7 20l2-4M17 20l-2-4"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>',
    app: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    money: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6v1.5M12 16.5V18"/>',
    palette: '<path d="M12 3a9 9 0 0 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>'
  };
  const sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">' +
    Object.keys(P).map(k => '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + P[k] + '</symbol>').join('') + '</svg>';
  document.body.insertAdjacentHTML('afterbegin', sprite);

  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const all = [...document.querySelectorAll('.dg')];

  /* 움직임을 처음부터 다시 */
  function restart(root) {
    root.querySelectorAll('*').forEach(el => {
      if (getComputedStyle(el).animationName === 'none') return;
      el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    });
  }

  /* 보일 때만 움직이기 */
  if (still) all.forEach(d => d.classList.add('still'));
  else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('run', e.isIntersecting)), { threshold: 0.12 });
    all.forEach(d => io.observe(d));
  } else all.forEach(d => d.classList.add('run'));

  /* 두 경우 바꿔 보기 */
  all.forEach(d => {
    const tabs = d.querySelectorAll(':scope > .dg-tabs button[data-v]');
    if (!tabs.length) return;
    const views = d.querySelectorAll('[data-view]');
    function show(v) {
      tabs.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
      views.forEach(x => { const on = x.dataset.view === v; x.classList.toggle('cur', on); if (on) restart(x); });
      d.dataset.v = v;
      const say = d.querySelectorAll('[data-vsay]');
      say.forEach(x => { x.hidden = x.dataset.vsay !== v; });
    }
    tabs.forEach(b => b.addEventListener('click', () => show(b.dataset.v)));
    const first = [...tabs].find(b => b.getAttribute('aria-pressed') === 'true') || tabs[0];
    show(first.dataset.v);
  });

  /* 단계 넘기기 */
  all.filter(d => d.hasAttribute('data-steps')).forEach(d => {
    const says = [...d.querySelectorAll('.dg-say > [data-say]')];
    const n = says.filter(s => s.dataset.say !== '0').length;
    const hits = [...d.querySelectorAll('[data-s]')];
    const shows = [...d.querySelectorAll('[data-show]')];
    const ctl = document.createElement('div');
    ctl.className = 'dg-ctl';
    const labels = says.filter(s => s.dataset.say !== '0').map(s => (s.querySelector('b') || s).textContent.trim());
    ctl.innerHTML = '<button type="button" class="prev" aria-label="앞 단계">◀</button>' +
      '<div class="dots" role="group" aria-label="단계 고르기">' + labels.map((l, i) => '<button type="button" data-go="' + (i + 1) + '" aria-pressed="false">' + (i + 1) + ' ' + l + '</button>').join('') + '</div>' +
      '<button type="button" class="next" aria-label="다음 단계">▶</button>' +
      '<button type="button" class="pri auto">⏵ 차례로 보기</button>' +
      '<button type="button" class="whole">전체 보기</button>';
    const sayBox = d.querySelector('.dg-say');
    sayBox.after(ctl);
    let cur = 0, timer = null;
    const autoBtn = ctl.querySelector('.auto');
    function set(i) {
      cur = i;
      d.classList.toggle('stepping', i > 0);
      hits.forEach(el => el.classList.toggle('hit', i > 0 && el.dataset.s.split(/\s+/).includes(String(i))));
      shows.forEach(el => { const on = el.dataset.show.split(/\s+/).includes(String(i)); el.classList.toggle('vis', on); if (on) restart(el); });
      says.forEach(s => s.classList.toggle('cur', s.dataset.say === String(i)));
      ctl.querySelectorAll('[data-go]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.go === i)));
      d.dataset.at = i;
    }
    function stop() { clearInterval(timer); timer = null; autoBtn.textContent = '⏵ 차례로 보기'; }
    ctl.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.go) { stop(); set(+b.dataset.go); }
      else if (b.classList.contains('prev')) { stop(); set(cur <= 1 ? n : cur - 1); }
      else if (b.classList.contains('next')) { stop(); set(cur >= n ? 1 : cur + 1); }
      else if (b.classList.contains('whole')) { stop(); set(0); }
      else if (b.classList.contains('auto')) {
        if (timer) { stop(); return; }
        set(cur >= n || cur === 0 ? 1 : cur + 1);
        autoBtn.textContent = '⏸ 멈춤';
        timer = setInterval(() => { if (cur >= n) { stop(); return; } set(cur + 1); }, +(d.dataset.auto || 4200));
      }
    });
    set(0);
  });

  /* 누르면 펼쳐지는 설명판: <button data-more="상자id" aria-expanded="false"> */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-more]'); if (!b) return;
    const id = b.dataset.more, box = document.getElementById(id); if (!box) return;
    const open = box.hidden;
    box.hidden = !open;
    document.querySelectorAll('[data-more="' + id + '"][aria-expanded]').forEach(x => x.setAttribute('aria-expanded', String(open)));
    if (open) box.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'nearest' });
    else if (b.closest('#' + CSS.escape(id))) { const opener = document.querySelector('[data-more="' + id + '"][aria-expanded]'); if (opener) opener.focus(); }
  });

  /* 다시 보기 단추 */
  document.querySelectorAll('.dg [data-replay]').forEach(b => b.addEventListener('click', () => restart(b.closest('.dg'))));
})();
