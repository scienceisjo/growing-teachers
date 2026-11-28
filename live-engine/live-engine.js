/* 라이브 슬라이드 공통 엔진 — 시안 0.2 (2026-11-27, 해누리중 조승재)
 *
 * 화면 파일은 내용만 적고, 넘기기·단계·편집·저장은 이 파일이 맡는다.
 *
 * 약속(화면 파일이 지킬 것)
 *   <div class="ls-deck">                      무대(1920×1080). 엔진이 창 크기에 맞춘다
 *     <section class="ls-slide"> … </section>  슬라이드 한 장
 *   </div>
 *   <script src="live-engine.js" data-ls-engine></script>
 *   · 단계: 요소에 data-step="2" 를 적으면 2단계부터 그 요소에 class="ls-on" 이 붙는다.
 *           보이고 숨는 모양은 화면의 CSS 가 정한다. 엔진의 기본 모양(서서히 나타남)을 쓰려면 class 에 ls-fade 를 더한다.
 *   · 그림 자리: <div class="ls-slot" data-name="주사기 사진"></div>  크기와 위치는 화면의 CSS 가 정한다
 *   · 움직이는 그림·시뮬레이터: 엔진 뒤에 오는 스크립트에서 LiveSlide.onStep(function(i, s, el){ … }) 로 단계를 받는다.
 *           스크립트는 다시 실행해도 같은 모습이 되게 쓴다(저장한 파일을 다시 열면 한 번 더 실행된다).
 *   · 저장하면 이 엔진이 파일 안에 들어가서, 인터넷이 없어도 열린다.
 */
function __liveEngine() {
  'use strict';
  /* 작은 엔진(화면 파일 안의 몇 줄짜리 넘기기 코드)이 먼저 돌고 있으면 그 자리와 단계 받는 코드를 이어받는다 */
  var before = window.LiveSlide; if (before && before.full) return;
  var deck = document.querySelector('.ls-deck'); if (!deck) return;
  var W = 1920, H = 1080, k = 1;

  var CSS = [
    'html,body{margin:0;height:100%;overflow:hidden;background:#000}',
    '.ls-deck{position:absolute;left:50%;top:50%;width:1920px;height:1080px;overflow:hidden;transform-origin:center center}',
    '.ls-slide{position:absolute;inset:0;display:none}',
    '.ls-slide.ls-cur{display:block}',
    '.ls-fade{opacity:0;transition:opacity .45s}',
    '.ls-fade.ls-on{opacity:1}',
    /* 그림 블록(자유롭게 놓은 것) */
    '.ls-block{position:absolute;z-index:3}',
    '.ls-block img,.ls-slot img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none}',
    '.ls-block[data-step],.ls-slot[data-step]{opacity:0;visibility:hidden;transition:opacity .45s}',
    '.ls-block[data-step].ls-on,.ls-slot[data-step].ls-on{opacity:1;visibility:visible}',
    /* 그림 자리 */
    '.ls-slot{position:relative;min-height:120px}',
    '.ls-slot:not(.ls-filled){visibility:hidden}',
    '.ls-edit .ls-slot:not(.ls-filled){visibility:visible;opacity:1;border:4px dashed #8e8e93;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#8e8e93;font-size:28px;text-align:center;background:rgba(142,142,147,.12)}',
    '.ls-edit .ls-slot:not(.ls-filled)::before{content:"그림 자리 · " attr(data-name)}',
    '.ls-edit .ls-block,.ls-edit .ls-slot{cursor:pointer}',
    '.ls-edit .ls-block{cursor:move}',
    '.ls-sel{outline:5px solid #0a84ff;outline-offset:3px}',
    '.ls-edit [data-ls-badge]::after{content:attr(data-ls-badge);position:absolute;left:0;top:-40px;background:#0a84ff;color:#fff;font:600 22px/1 system-ui,sans-serif;padding:7px 12px;border-radius:9px;white-space:nowrap;z-index:5}',
    '.ls-handle{position:absolute;right:-16px;bottom:-16px;width:32px;height:32px;border-radius:50%;background:#0a84ff;border:4px solid #fff;cursor:nwse-resize;z-index:6}',
    /* 엔진 단추와 편집 줄(무대 밖, 크기 고정) */
    '#ls-ui{position:fixed;inset:0;pointer-events:none;z-index:99;font:15px/1.4 "Pretendard Variable",Pretendard,system-ui,"Malgun Gothic",sans-serif}',
    '#ls-ui button{font:inherit;cursor:pointer;border:1px solid rgba(255,255,255,.28);background:rgba(44,44,46,.94);color:#fff;border-radius:9999px;padding:7px 14px;white-space:nowrap}',
    '#ls-ui button:hover{background:#48484a}',
    '#ls-ui button.pri{background:#0a84ff;border-color:#0a84ff}',
    '#ls-ui button:disabled{opacity:.4;cursor:default}',
    '#ls-go{position:absolute;right:12px;top:12px;pointer-events:auto;opacity:.45}',
    '#ls-go:hover{opacity:1}',
    '#ls-bar{position:absolute;left:0;right:0;top:0;display:none;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 12px;background:rgba(28,28,30,.96);color:#fff;pointer-events:auto}',
    '#ls-bar .sp{flex:1}',
    '#ls-bar .who{color:#d1d1d6;margin:0 4px}',
    '#ls-tip{position:absolute;left:12px;bottom:12px;display:none;background:rgba(28,28,30,.92);color:#fff;border-radius:10px;padding:8px 12px;max-width:min(560px,70vw);pointer-events:none}',
    '#ls-pick{position:absolute;right:0;top:52px;bottom:0;width:240px;display:none;flex-direction:column;background:rgba(28,28,30,.97);color:#fff;pointer-events:auto;padding:10px;gap:8px}',
    '#ls-pick .list{overflow:auto;display:grid;grid-template-columns:1fr 1fr;gap:6px;align-content:start}',
    '#ls-pick img{width:100%;aspect-ratio:1/1;object-fit:contain;background:#fff;border-radius:6px;cursor:pointer}',
    '.ls-editing #ls-bar{display:flex}.ls-editing #ls-tip{display:block}.ls-editing #ls-go{display:none}',
    '@media print{#ls-ui{display:none}}'
  ].join('\n');
  var st = document.getElementById('ls-style');
  if (!st) { st = document.createElement('style'); st.id = 'ls-style'; document.head.appendChild(st); }
  st.textContent = CSS;

  var slides = function () { return [].slice.call(deck.querySelectorAll(':scope > .ls-slide')); };
  var stepsOf = function (el) { var m = 0; [].forEach.call(el.querySelectorAll('[data-step]'), function (e) { var n = +e.getAttribute('data-step') || 0; if (n > m) m = n; }); return m; };
  var i = (before && before.index) || 0, s = (before && before.step) || 0, editing = false, sel = null, hooks = window.__lsHooks || (window.__lsHooks = []);

  function fit() { var top = editing ? 52 : 0;   /* 편집 줄이 무대를 가리지 않게 */
    k = Math.min(innerWidth / W, (innerHeight - top) / H); deck.style.top = 'calc(50% + ' + (top / 2) + 'px)'; deck.style.transform = 'translate(-50%,-50%) scale(' + k + ')'; }
  function render() {
    var S = slides(); if (!S.length) return;
    i = Math.max(0, Math.min(S.length - 1, i));
    var mx = stepsOf(S[i]); s = editing ? mx : Math.max(0, Math.min(mx, s));
    S.forEach(function (c, n) { c.classList.toggle('ls-cur', n === i); });
    [].forEach.call(S[i].querySelectorAll('[data-step]'), function (e) { e.classList.toggle('ls-on', (+e.getAttribute('data-step') || 0) <= s); });
    hooks.forEach(function (f) { try { f(i, s, S[i]); } catch (e) { console.error(e); } });
    if (!editing) { try { history.replaceState(null, '', '#' + (i + 1) + '.' + s); } catch (e) {} }
    paintBar();
  }
  function next() { var S = slides(); if (editing) { if (i < S.length - 1) { i++; select(null); } } else if (s < stepsOf(S[i])) s++; else if (i < S.length - 1) { i++; s = 0; } render(); }
  function prev() { var S = slides(); if (editing) { if (i > 0) { i--; select(null); } } else if (s > 0) s--; else if (i > 0) { i--; s = stepsOf(S[i]); } render(); }

  /* ── 단추와 편집 줄 ── */
  var ui = document.createElement('div'); ui.id = 'ls-ui';
  ui.innerHTML = '<button id="ls-go" type="button">편집</button>' +
    '<div id="ls-bar"><button type="button" data-a="pick" class="pri">그림 넣기</button><input type="file" accept="image/*,.pptx" multiple hidden>' +
    '<span class="who" id="ls-who"></span><button type="button" data-a="minus">−</button><button type="button" data-a="plus">+</button><button type="button" data-a="del">지우기</button>' +
    '<span class="sp"></span><span class="who" id="ls-page"></span><button type="button" data-a="save" class="pri">저장</button><button type="button" data-a="save0">그림 빼고 저장</button><button type="button" data-a="done">편집 끝</button></div>' +
    '<div id="ls-tip">그림 파일이나 PPT 파일을 끌어다 놓거나, 복사한 그림을 Ctrl+V 로 붙여 넣습니다. ← → 로 슬라이드를 옮깁니다.</div>' +
    '<div id="ls-pick"><b>꺼낸 그림</b><span id="ls-pickmsg"></span><div class="list"></div><button type="button" data-a="pickclose">닫기</button></div>';
  document.body.appendChild(ui);
  var q = function (x) { return ui.querySelector(x); };
  var fileIn = q('input[type=file]'), pick = q('#ls-pick'), pickList = q('#ls-pick .list');

  function stepText(el) { var n = +el.getAttribute('data-step') || 0; return n ? n + '단계부터 보임' : '처음부터 보임'; }
  function paintBar() {
    var S = slides(); q('#ls-page').textContent = (i + 1) + ' / ' + S.length;
    var has = !!sel;
    q('#ls-who').textContent = has ? ((sel.getAttribute('data-name') || '그림') + ' · ' + stepText(sel)) : '그림을 누르면 고를 수 있습니다';
    ['minus', 'plus', 'del'].forEach(function (a) { q('[data-a=' + a + ']').disabled = !has; });
    [].forEach.call(deck.querySelectorAll('[data-ls-badge]'), function (e) { e.removeAttribute('data-ls-badge'); });
    if (editing) [].forEach.call(S[i].querySelectorAll('.ls-block,.ls-slot.ls-filled'), function (e) { e.setAttribute('data-ls-badge', stepText(e)); });
  }
  function select(el) {
    if (sel) { sel.classList.remove('ls-sel'); var h = sel.querySelector(':scope > .ls-handle'); if (h) h.remove(); }
    sel = el;
    if (sel) { sel.classList.add('ls-sel'); if (sel.classList.contains('ls-block')) { var hd = document.createElement('i'); hd.className = 'ls-handle'; sel.appendChild(hd); } }
    paintBar();
  }
  function setEdit(on) {
    editing = on; select(null);
    document.documentElement.classList.toggle('ls-editing', on); deck.classList.toggle('ls-edit', on);
    if (!on) pick.style.display = 'none';
    fit(); render();
  }

  /* ── 그림 넣기 ── */
  function toDataURL(blob) {
    return new Promise(function (res, rej) {
      var plain = function () { var fr = new FileReader(); fr.onload = function () { res({ url: fr.result, w: 0, h: 0 }); }; fr.onerror = rej; fr.readAsDataURL(blob); };
      if (/svg|gif/.test(blob.type) || !window.createImageBitmap) return plain();
      createImageBitmap(blob).then(function (bm) {
        var m = Math.min(1, 1600 / Math.max(bm.width, bm.height)), c = document.createElement('canvas');
        c.width = Math.round(bm.width * m); c.height = Math.round(bm.height * m);
        c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
        var u = c.toDataURL('image/webp', 0.85); if (u.indexOf('data:image/webp') !== 0) u = c.toDataURL('image/jpeg', 0.88);
        res({ url: u, w: c.width, h: c.height });
      }).catch(plain);
    });
  }
  function natural(url) { return new Promise(function (res) { var im = new Image(); im.onload = function () { res({ w: im.naturalWidth || 800, h: im.naturalHeight || 600 }); }; im.onerror = function () { res({ w: 800, h: 600 }); }; im.src = url; }); }
  function addImage(blob, at, slot) {
    var S = slides(), cur = S[i];
    return toDataURL(blob).then(function (d) {
      return (d.w ? Promise.resolve(d) : natural(d.url).then(function (n) { d.w = n.w; d.h = n.h; return d; }));
    }).then(function (d) {
      var img = document.createElement('img'); img.src = d.url; img.alt = '';
      /* 자리를 따로 짚지 않았으면: 골라 둔 빈 자리 → 이 슬라이드의 첫 빈 자리 → 없으면 자유롭게 */
      if (!slot) slot = (sel && sel.classList.contains('ls-slot') && !sel.classList.contains('ls-filled') && sel) || cur.querySelector('.ls-slot:not(.ls-filled)');
      if (slot) { slot.innerHTML = ''; slot.appendChild(img); slot.classList.add('ls-filled'); render(); select(slot); return slot; }
      var w = Math.min(820, d.w), h = Math.round(w * d.h / d.w); if (h > 700) { h = 700; w = Math.round(h * d.w / d.h); }
      var x = at ? at.x - w / 2 : (W - w) / 2, y = at ? at.y - h / 2 : (H - h) / 2;
      var b = document.createElement('div'); b.className = 'ls-block ls-img';
      b.style.cssText = 'left:' + Math.round(Math.max(0, Math.min(W - w, x))) + 'px;top:' + Math.round(Math.max(0, Math.min(H - h, y))) + 'px;width:' + w + 'px;height:' + h + 'px';
      b.appendChild(img); cur.appendChild(b); render(); select(b); return b;
    });
  }
  /* PPT 파일(.pptx)은 압축 꾸러미다. 그 안 ppt/media/ 의 그림을 꺼내 목록으로 보여 준다 */
  function unzipMedia(file) {
    return file.arrayBuffer().then(function (buf) {
      var dv = new DataView(buf), n = buf.byteLength, e = n - 22;
      while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
      if (e < 0) throw new Error('zip');
      var cnt = dv.getUint16(e + 10, true), p = dv.getUint32(e + 16, true), out = [], td = new TextDecoder();
      for (var c = 0; c < cnt && dv.getUint32(p, true) === 0x02014b50; c++) {
        var method = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
        var name = td.decode(new Uint8Array(buf, p + 46, nl));
        var m = /^ppt\/media\/[^/]+\.(png|jpe?g|gif|webp|bmp|svg)$/i.exec(name);
        if (m) { var ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true); out.push({ name: name, ext: m[1].toLowerCase(), method: method, data: new Uint8Array(buf, ds, csz) }); }
        p += 46 + nl + xl + cl;
      }
      return Promise.all(out.map(function (o) {
        var type = 'image/' + (o.ext === 'jpg' ? 'jpeg' : o.ext === 'svg' ? 'svg+xml' : o.ext);
        if (o.method === 0) return new Blob([o.data], { type: type });
        return new Response(new Blob([o.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob().then(function (b) { return new Blob([b], { type: type }); });
      }));
    });
  }
  function showPicked(blobs, label) {
    pickList.innerHTML = ''; q('#ls-pickmsg').textContent = label + ' · ' + blobs.length + '장. 누르면 지금 슬라이드에 들어갑니다.';
    blobs.forEach(function (b) { var im = document.createElement('img'); im.src = URL.createObjectURL(b); im.alt = ''; im.addEventListener('click', function () { addImage(b); }); pickList.appendChild(im); });
    pick.style.display = 'flex';
  }
  function takeFiles(files, at, slot) {
    var list = [].slice.call(files || []), chain = Promise.resolve();
    list.forEach(function (f) {
      if (/\.pptx$/i.test(f.name)) chain = chain.then(function () { return unzipMedia(f).then(function (bl) { showPicked(bl, f.name); }).catch(function () { q('#ls-pickmsg').textContent = '이 파일에서는 그림을 꺼내지 못했습니다.'; pick.style.display = 'flex'; }); });
      else if (/^image\//.test(f.type)) chain = chain.then(function () { return addImage(f, at, slot); });
    });
    return chain;
  }

  /* ── 저장: 그림과 엔진이 든 HTML 하나로 내려받는다 ── */
  function save(strip) {
    select(null);
    var doc = document.documentElement.cloneNode(true);
    var gone = doc.querySelector('#ls-ui'); if (gone) gone.remove();
    doc.classList.remove('ls-editing');
    [].forEach.call(doc.querySelectorAll('.ls-cur,.ls-on,.ls-edit,.ls-sel'), function (e) { e.classList.remove('ls-cur', 'ls-on', 'ls-edit', 'ls-sel'); });
    [].forEach.call(doc.querySelectorAll('[data-ls-badge]'), function (e) { e.removeAttribute('data-ls-badge'); });
    [].forEach.call(doc.querySelectorAll('.ls-handle'), function (e) { e.remove(); });
    [].forEach.call(doc.querySelectorAll('[data-ls-runtime]'), function (e) { e.innerHTML = ''; });
    var d = doc.querySelector('.ls-deck'); if (d) { d.style.transform = ''; d.style.top = ''; }
    if (strip) {
      [].forEach.call(doc.querySelectorAll('.ls-slot.ls-filled'), function (e) { e.innerHTML = ''; e.classList.remove('ls-filled'); });
      [].forEach.call(doc.querySelectorAll('.ls-block.ls-img'), function (e) { e.innerHTML = ''; e.className = 'ls-slot'; e.style.position = 'absolute'; if (!e.getAttribute('data-name')) e.setAttribute('data-name', '그림'); });
    }
    var sc = doc.querySelector('script[data-ls-engine]');
    if (sc) { sc.removeAttribute('src'); sc.textContent = __liveEngine.toString() + '\n__liveEngine();'; }
    var html = '<!DOCTYPE html>\n' + doc.outerHTML;
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = (document.title || '라이브 슬라이드').replace(/[\\/:*?"<>|]/g, ' ').trim() + (strip ? '_그림뺀판' : '') + '.html';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
    return html.length;
  }

  /* ── 눌림과 키 ── */
  var pt = function (e) { var r = deck.getBoundingClientRect(); return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; };
  q('#ls-go').addEventListener('click', function () { setEdit(true); });
  q('#ls-bar').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a'); b.blur();
    if (a === 'pick') fileIn.click();
    else if (a === 'done') setEdit(false);
    else if (a === 'save') save(false);
    else if (a === 'save0') save(true);
    else if (sel && (a === 'minus' || a === 'plus')) { var n = Math.max(0, (+sel.getAttribute('data-step') || 0) + (a === 'plus' ? 1 : -1)); if (n) sel.setAttribute('data-step', n); else sel.removeAttribute('data-step'); render(); }
    else if (sel && a === 'del') { var t = sel; select(null); if (t.classList.contains('ls-slot')) { t.innerHTML = ''; t.classList.remove('ls-filled'); } else t.remove(); render(); }
  });
  q('[data-a=pickclose]').addEventListener('click', function () { pick.style.display = 'none'; });
  fileIn.addEventListener('change', function () { takeFiles(fileIn.files).then(function () { fileIn.value = ''; }); });

  var drag = null;
  deck.addEventListener('pointerdown', function (e) {
    if (!editing) return;
    var t = e.target.closest('.ls-block,.ls-slot'); select(t || null);
    if (t && t.classList.contains('ls-block')) {
      var p = pt(e); drag = { el: t, x: p.x, y: p.y, l: parseFloat(t.style.left) || 0, t: parseFloat(t.style.top) || 0, w: parseFloat(t.style.width) || 100, h: parseFloat(t.style.height) || 100, size: !!e.target.closest('.ls-handle') };
      try { deck.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault();
    }
  });
  deck.addEventListener('pointermove', function (e) {
    if (!drag) return; var p = pt(e), dx = p.x - drag.x, dy = p.y - drag.y;
    if (drag.size) { var w = Math.max(60, drag.w + dx), h = Math.round(w * drag.h / drag.w); drag.el.style.width = Math.round(w) + 'px'; drag.el.style.height = h + 'px'; }
    else { drag.el.style.left = Math.round(drag.l + dx) + 'px'; drag.el.style.top = Math.round(drag.t + dy) + 'px'; }
  });
  var endDrag = function () { drag = null; };
  deck.addEventListener('pointerup', endDrag); deck.addEventListener('pointercancel', endDrag);
  /* 편집 중에는 화면 속 단추가 눌리지 않게, 보는 중에는 눌러서 다음 단계로 */
  document.addEventListener('click', function (e) {
    if (e.target.closest('#ls-ui')) return;
    var inDeck = e.target.closest('.ls-deck');
    if (editing) { if (inDeck) { e.stopPropagation(); e.preventDefault(); } return; }
    if (!inDeck && e.target !== document.body && e.target !== document.documentElement) return;
    if (e.target.closest('button,a,input,select,textarea,label,summary,video,audio,[data-ls-nonav]')) return;
    next();
  }, true);
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && t.matches && t.matches('input,textarea,select,[contenteditable]')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { i = 0; s = 0; render(); }
    else if (e.key === 'End') { var S = slides(); i = S.length - 1; s = stepsOf(S[i]); render(); }
    else if (e.key === 'Escape' && editing) setEdit(false);
    else if ((e.key === 'Delete' || e.key === 'Backspace') && editing && sel) { e.preventDefault(); q('[data-a=del]').click(); }
  });
  addEventListener('paste', function (e) {
    if (!editing || !e.clipboardData) return;
    var fs = [].filter.call(e.clipboardData.items || [], function (it) { return it.kind === 'file' && /^image\//.test(it.type); }).map(function (it) { return it.getAsFile(); });
    if (fs.length) { e.preventDefault(); takeFiles(fs); }
  });
  addEventListener('dragover', function (e) { if (editing) e.preventDefault(); });
  addEventListener('drop', function (e) {
    if (!editing) return; e.preventDefault();
    var slot = e.target.closest && e.target.closest('.ls-slot'); takeFiles(e.dataTransfer.files, pt(e), slot || null);
  });
  addEventListener('resize', fit);

  window.LiveSlide = {
    version: '0.2', full: true,
    get index() { return i; }, get step() { return s; }, get count() { return slides().length; }, get editing() { return editing; },
    go: function (a, b) { i = a; s = b || 0; render(); }, next: next, prev: prev,
    onStep: function (f) { hooks.push(f); render(); },
    edit: setEdit, addImage: addImage, takeFiles: takeFiles, save: save
  };
  var m = /^#(\d+)\.(\d+)/.exec(location.hash); if (m) { i = +m[1] - 1; s = +m[2]; }
  fit(); render();
}
__liveEngine();
