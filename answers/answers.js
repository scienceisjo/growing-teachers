/* 학생 답 모으기 — 칠판 강의 화면에 덧붙이는 모듈 (해누리중 조승재)
 *
 * 붙이는 법: 강의 화면 </body> 앞에 한 줄
 *   <script src="https://scienceisjo.github.io/growing-teachers/answers/answers.js"></script>
 * 질문을 낼 단계에, 그 단계에만 보이는 요소를 둔다(보이고 숨는 방법은 화면이 정한다).
 *   <div class="ask" data-ask="choice"  data-qid="c1" data-q="생수병 속 공기의 부피는?" data-choices="커졌다|작아졌다|그대로다" data-answer="작아졌다"></div>
 *   <div class="ask" data-ask="predict" data-qid="p1" data-q="60 ℃가 되면 부피는 몇 mL일까요?" data-unit="mL" data-actual="56.8"></div>
 *   <div class="ask" data-ask="blank"   data-qid="b2" data-q="빈칸 ②에 들어갈 말은?" data-answer="늘어나고"></div>
 *   <div class="ask" data-ask="text"    data-qid="t1" data-q="입자 수는 그대로인데 왜 부피가 커질까요?"></div>
 * 「질문 보내기」는 요소 없이 수업 내내 열려 있다.
 * 선생님이 「학생 답」 단추로 방을 열기 전에는 .ask 요소가 비어 있어 화면에 아무것도 보이지 않는다.
 * 주소 끝에 ?ansfake=1 을 붙이면 서버 대신 이 브라우저 안의 가짜 서버를 쓴다(시험용).
 */
(function () {
  'use strict';
  if (window.Answers) return;
  var SCRIPT = document.currentScript;
  var BASE = SCRIPT && SCRIPT.src ? SCRIPT.src.replace(/[^/]*$/, '') : 'https://scienceisjo.github.io/growing-teachers/answers/';
  var CFG = Object.assign({
    url: 'https://vbvtnmnodeoocbbjauap.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidnRubW5vZGVvb2NiYmphdWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTQ0OTYsImV4cCI6MjA5NTA3MDQ5Nn0.dvuRrt3qw2Tya_QwGbcXrmGPdfDgI4xmgyH8UjU73Nc',
    student: BASE
  }, window.ANSWERS_CONFIG || {});
  var QS = new URLSearchParams(location.search);
  var FAKE = QS.get('ansfake') === '1' || CFG.fake === true;
  var MODE = window.ANSWERS_MODE || 'teacher';

  /* ── 서버 ─────────────────────────────────────────── */
  function rpc(fn, args) {
    return fetch(CFG.url + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    }).then(function (r) {
      if (!r.ok) throw new Error('서버 ' + r.status);
      return r.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }
  var real = {
    open: function (title, useNum) { return rpc('ans_open', { p_title: title, p_use_number: !!useNum }).then(function (r) { return { code: r[0].room_code, key: r[0].room_key }; }); },
    setCur: function (code, key, cur) { return rpc('ans_set_cur', { p_code: code, p_key: key, p_cur: cur }); },
    room: function (code) { return rpc('ans_room', { p_code: code }).then(function (r) { return (r && r[0]) || null; }); },
    submit: function (code, a) { return rpc('ans_submit', { p_code: code, p_qid: a.qid, p_kind: a.kind, p_prompt: a.prompt || '', p_body: a.body, p_num: a.num || null, p_device: a.device }); },
    list: function (code, key, since) { return rpc('ans_list', { p_code: code, p_key: key, p_since: since || 0 }); },
    close: function (code, key) { return rpc('ans_close', { p_code: code, p_key: key }); }
  };
  // 가짜 서버: 같은 주소의 탭끼리 localStorage 로 주고받는다(시험용, 실제 서버에 아무것도 남기지 않음)
  var fake = (function () {
    var K = 'ansfake:db';
    function load() { try { return JSON.parse(localStorage.getItem(K)) || { rooms: {}, answers: [], seq: 0 }; } catch (e) { return { rooms: {}, answers: [], seq: 0 }; } }
    function save(d) { localStorage.setItem(K, JSON.stringify(d)); }
    function later(v) { return new Promise(function (res) { setTimeout(function () { res(v); }, 30); }); }
    var ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return {
      open: function (title, useNum) {
        var d = load(), c;
        do { c = ''; for (var i = 0; i < 6; i++) c += ABC[Math.floor(Math.random() * ABC.length)]; } while (d.rooms[c]);
        var key = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        d.rooms[c] = { key: key, title: title, useNum: !!useNum, cur: null }; save(d);
        return later({ code: c, key: key });
      },
      setCur: function (code, key, cur) { var d = load(), r = d.rooms[String(code).toUpperCase()]; if (!r || r.key !== key) return later(null); r.cur = cur; save(d); return later(true); },
      room: function (code) { var r = load().rooms[String(code || '').toUpperCase()]; return later(r ? { title: r.title, cur: r.cur, use_number: r.useNum } : null); },
      submit: function (code, a) {
        var d = load(), c = String(code || '').toUpperCase(), body = String(a.body || '').trim();
        if (!d.rooms[c] || !body || body.length > 500) return later(false);
        if (a.kind !== 'ask') d.answers = d.answers.filter(function (x) { return !(x.code === c && x.qid === a.qid && x.device === a.device); });
        d.answers.push({ id: ++d.seq, code: c, qid: a.qid, kind: a.kind, prompt: a.prompt || '', body: body, num: a.num || null, device: a.device, created_at: new Date().toISOString() });
        save(d); return later(true);
      },
      list: function (code, key, since) { var d = load(), c = String(code).toUpperCase(), r = d.rooms[c]; if (!r || r.key !== key) return later([]); return later(d.answers.filter(function (x) { return x.code === c && x.id > (since || 0); })); },
      close: function (code, key) { var d = load(), c = String(code).toUpperCase(), r = d.rooms[c]; if (!r || r.key !== key) return later(null); delete d.rooms[c]; d.answers = d.answers.filter(function (x) { return x.code !== c; }); save(d); return later(true); }
    };
  })();
  var api = FAKE ? fake : real;
  function studentUrl(code) { return CFG.student + '?c=' + code + (FAKE ? '&ansfake=1' : ''); }
  function reviewUrl(code, key) { return CFG.student + 'review.html' + (FAKE ? '?ansfake=1' : '') + '#c=' + code + '&k=' + key; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  window.Answers = { api: api, CFG: CFG, FAKE: FAKE, studentUrl: studentUrl, reviewUrl: reviewUrl, esc: esc };
  if (MODE !== 'teacher') return;

  /* ── 선생님 화면 ──────────────────────────────────── */
  var KINDS = { choice: '고르기', predict: '예측', blank: '빈칸 미리 맞히기', text: '짧은 서술', ask: '질문함' };
  var css = '' +
    '.ans-root,.ans-panel,.ans-ov{font-family:"Pretendard Variable",Pretendard,system-ui,-apple-system,"Malgun Gothic",sans-serif;letter-spacing:-.01em;word-break:keep-all}' +
    '.ans-root{position:fixed;left:14px;bottom:14px;z-index:2147483000}' +
    '.ans-fab{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.28);background:#1d1d1f;color:#fff;border-radius:999px;padding:9px 16px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;opacity:.86}' +
    '.ans-fab:hover{opacity:1}.ans-fab .n{background:#0a84ff;border-radius:999px;padding:0 8px;font-size:13px;line-height:20px}' +
    '.ans-pill{display:inline-flex;align-items:center;gap:14px;background:#1d1d1f;color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:12px 26px;font-size:28px;font-weight:600;line-height:1.2;cursor:pointer;white-space:nowrap;font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif}' +
    '.ans-pill b{color:#64b5ff;letter-spacing:.06em}.ans-pill .k{font-size:22px;font-weight:500;color:#c7c7cc}.ans-pill .cnt{background:#0a84ff;color:#fff;border-radius:999px;padding:2px 14px;font-size:24px}' +
    '.ans-panel{position:fixed;top:0;right:0;bottom:0;width:min(50vw,980px);min-width:360px;background:#fff;color:#1d1d1f;z-index:2147483001;display:flex;flex-direction:column;border-left:1px solid #d2d2d7;transform:translateX(101%);transition:transform .22s ease;font-size:18px}' +
    '.ans-panel.open{transform:none}' +
    '.ans-hd{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #e5e5ea}' +
    '.ans-hd .code{font-size:32px;font-weight:700;letter-spacing:.08em}.ans-hd .code small{display:block;font-size:12px;font-weight:500;letter-spacing:0;color:#6e6e73}' +
    '.ans-hd .sp{flex:1}.ans-b{border:1px solid #d2d2d7;background:#fff;color:#1d1d1f;border-radius:999px;padding:7px 15px;font:inherit;font-size:16px;cursor:pointer}.ans-b:hover{border-color:#1d1d1f}.ans-b.on{background:#1d1d1f;color:#fff;border-color:#1d1d1f}' +
    '.ans-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:10px 18px;border-bottom:1px solid #e5e5ea}' +
    '.ans-tabs button{border:1px solid #d2d2d7;background:#fff;border-radius:999px;padding:6px 13px;font:inherit;font-size:16px;color:#3a3a3c;cursor:pointer;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ans-tabs button.on{border-color:#0066cc;color:#0066cc;background:#eaf2fb;font-weight:600}.ans-tabs button .live{display:inline-block;width:8px;height:8px;border-radius:50%;background:#34c759;margin-right:6px}' +
    '.ans-bd{flex:1;overflow:auto;padding:18px 20px 30px}.ans-bd.blur .ans-res{filter:blur(14px);pointer-events:none;user-select:none}' +
    '.ans-q{font-size:32px;font-weight:700;line-height:1.35;margin:0 0 4px}.ans-meta{color:#6e6e73;font-size:18px;margin:0 0 16px}' +
    '.ans-row{display:grid;grid-template-columns:minmax(110px,32%) 1fr 64px;align-items:center;gap:14px;margin:14px 0;font-size:26px}' +
    '.ans-row .bar{height:38px;background:#f2f2f7;border-radius:8px;overflow:hidden}.ans-row .bar i{display:block;height:100%;background:#0a84ff;border-radius:8px}' +
    '.ans-row.ok .lb{color:#1d8a4e;font-weight:700}.ans-row.ok .bar i{background:#34c759}.ans-row .c{text-align:right;font-variant-numeric:tabular-nums;color:#3a3a3c}' +
    '.ans-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}' +
    '.ans-card{position:relative;border:1px solid #e5e5ea;border-radius:12px;padding:16px 18px 32px;font-size:23px;line-height:1.5;background:#fbfbfd;cursor:pointer;white-space:pre-wrap;overflow-wrap:anywhere}' +
    '.ans-card .x{position:absolute;right:8px;bottom:6px;border:0;background:none;color:#8e8e93;font:inherit;font-size:13px;cursor:pointer}.ans-card.hid{opacity:.35}' +
    '.ans-dots{position:relative;height:120px;margin:24px 10px 8px;border-bottom:2px solid #1d1d1f}' +
    '.ans-dots i{position:absolute;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:#0a84ff;opacity:.8}' +
    '.ans-dots .act{position:absolute;bottom:-6px;top:-14px;border-left:3px dashed #ff3b30}.ans-dots .act span{position:absolute;top:-24px;left:6px;color:#ff3b30;font-size:19px;font-weight:700;white-space:nowrap}' +
    '.ans-axis{display:flex;justify-content:space-between;color:#6e6e73;font-size:17px;margin:4px 10px 14px}' +
    '.ans-empty{color:#8e8e93;font-size:20px;padding:30px 0}' +
    '.ans-ov{position:fixed;inset:0;z-index:2147483002;background:rgba(0,0,0,.86);color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;text-align:center;padding:20px}' +
    '.ans-ov .big{font-size:min(9vw,96px);font-weight:800;letter-spacing:.12em}.ans-ov .url{font-size:min(2.6vw,22px);color:#d1d1d6;word-break:break-all}' +
    '.ans-ov .qr{background:#fff;padding:16px;border-radius:16px;line-height:0}.ans-ov .qr img,.ans-ov .qr canvas{width:min(46vh,46vw);height:auto;image-rendering:pixelated}' +
    '.ans-ov .say{font-size:min(5vw,46px);line-height:1.4;max-width:1100px;white-space:pre-wrap;font-weight:600}' +
    '.ans-ov .ans-b{background:transparent;color:#fff;border-color:rgba(255,255,255,.5);font-size:16px}' +
    '.ans-dlg{background:#fff;color:#1d1d1f;border-radius:16px;padding:24px 26px;max-width:460px;text-align:left;font-size:17px;line-height:1.55}' +
    '.ans-dlg h3{margin:0 0 8px;font-size:21px}.ans-dlg label{display:flex;gap:10px;align-items:flex-start;margin:14px 0}.ans-dlg .r{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}' +
    '.ans-dlg .ans-b{color:#1d1d1f;border-color:#d2d2d7}.ans-dlg .ans-b.pri{background:#0066cc;color:#fff;border-color:#0066cc}' +
    '.ans-dlg small{color:#6e6e73}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var STORE = 'answers:room:' + location.pathname;
  var room = null;            // {code,key,title,at}
  var cache = {};             // id -> answer (같은 기기·같은 질문은 마지막 것만)
  var lastId = 0;
  var cur = null, curJson = 'null';
  var sel = null;             // 패널에서 보고 있는 qid
  var hiddenCards = {};
  var showAnswer = {};
  var blur = false;

  function stop(e) { e.stopPropagation(); }
  function guard(el) { ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'contextmenu', 'dblclick', 'wheel'].forEach(function (t) { el.addEventListener(t, stop); }); el.classList.add('nonav'); return el; }

  var root = guard(document.createElement('div')); root.className = 'ans-root nonav';
  root.innerHTML = '<button class="ans-fab" type="button" title="학생 답 모으기">학생 답</button>';
  var fab = root.firstChild;
  var panel = guard(document.createElement('div')); panel.className = 'ans-panel nonav';
  document.body.appendChild(root); document.body.appendChild(panel);
  fab.addEventListener('click', function () { if (!room) openDialog(); else togglePanel(); });

  /* 질문 표시 요소 */
  function asks() { return Array.prototype.slice.call(document.querySelectorAll('[data-ask]')); }
  function qInfo(el) {
    var d = el.dataset, kind = d.ask in KINDS ? d.ask : 'text';
    return {
      qid: d.qid || ('q' + asks().indexOf(el)), kind: kind, prompt: d.q || '',
      choices: d.choices ? d.choices.split('|').map(function (s) { return s.trim(); }).filter(Boolean) : null,
      unit: d.unit || '', answer: d.answer || '', actual: d.actual || '', actualFrom: d.actualFrom || ''
    };
  }
  function visible(el) {
    if (!el.isConnected) return false;
    if (el.checkVisibility) { if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false; }
    else { var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; }
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  function devicesFor(qid) { var s = {}; Object.keys(cache).forEach(function (id) { var a = cache[id]; if (a.qid === qid) s[a.device] = 1; }); return Object.keys(s).length; }
  function paintPills() {
    asks().forEach(function (el) {
      el.classList.add('nonav');
      if (!room) { if (el.firstChild) el.innerHTML = ''; return; }
      var q = qInfo(el), n = devicesFor(q.qid);
      var html = '<span class="ans-pill"><span class="k">' + esc(KINDS[q.kind]) + '</span>휴대폰으로 답하기 · <b>' + esc(room.code) + '</b><span class="cnt">' + n + '명</span></span>';
      if (el.getAttribute('data-ans-html') !== html) { el.innerHTML = html; el.setAttribute('data-ans-html', html); }
      if (!el.dataset.ansBound) {
        el.dataset.ansBound = '1'; guard(el);
        el.addEventListener('click', function () { sel = qInfo(el).qid; openPanel(); });
      }
    });
  }
  function tick() {
    if (!room) return;
    paintPills();
    var vis = asks().filter(visible), el = vis[vis.length - 1];
    var next = null;
    if (el) { var q = qInfo(el); next = { qid: q.qid, kind: q.kind, prompt: q.prompt, choices: q.choices, unit: q.unit }; }
    var j = JSON.stringify(next);
    if (j !== curJson) {
      curJson = j; cur = next;
      api.setCur(room.code, room.key, next).catch(function () { curJson = 'retry'; });
      if (next) sel = next.qid;   // 새 질문 단계에 오면 패널도 그 질문으로(다른 질문은 위 단추로 골라 봄)
      renderPanel();
    }
  }
  function poll() {
    if (!room) return;
    api.list(room.code, room.key, lastId).then(function (rows) {
      if (!rows || !rows.length) return;
      rows.forEach(function (a) {
        lastId = Math.max(lastId, a.id);
        if (a.kind !== 'ask') Object.keys(cache).forEach(function (id) { var b = cache[id]; if (b.qid === a.qid && b.device === a.device) delete cache[id]; });
        cache[a.id] = a;
      });
      var n = Object.keys(cache).length;
      fab.innerHTML = '학생 답 · ' + esc(room.code) + ' <span class="n">' + n + '</span>';
      paintPills(); renderPanel();
    }).catch(function () {});
  }

  /* 방 열기·닫기 */
  function setRoom(r) {
    room = r; cache = {}; lastId = 0; curJson = 'null'; cur = null;
    if (r) { try { localStorage.setItem(STORE, JSON.stringify(r)); } catch (e) {} fab.innerHTML = '학생 답 · ' + esc(r.code) + ' <span class="n">0</span>'; document.documentElement.classList.add('ans-live'); }
    else { try { localStorage.removeItem(STORE); } catch (e) {} fab.textContent = '학생 답'; document.documentElement.classList.remove('ans-live'); panel.classList.remove('open'); }
    paintPills(); renderPanel();
  }
  function overlay(html) {
    var ov = guard(document.createElement('div')); ov.className = 'ans-ov nonav'; ov.innerHTML = html;
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-close]')) ov.remove(); });
    return ov;
  }
  function openDialog() {
    var ov = overlay('<div class="ans-dlg"><h3>학생 답 받기를 시작할까요?</h3>' +
      '<p>학생은 휴대폰으로 코드를 넣고 들어옵니다. 이름은 받지 않습니다.</p>' +
      '<label><input type="checkbox" id="ansNum"> <span>번호 받기<br><small>세특 기록처럼 누가 쓴 답인지 알아야 할 때만 켭니다. 번호는 「모아보기」에서만 보이고 칠판에는 나오지 않습니다.</small></span></label>' +
      '<div class="r"><button class="ans-b" data-close type="button">취소</button><button class="ans-b pri" id="ansGo" type="button">시작</button></div></div>');
    ov.querySelector('#ansGo').addEventListener('click', function () {
      var useNum = ov.querySelector('#ansNum').checked;
      this.disabled = true; this.textContent = '여는 중…';
      api.open(document.title.slice(0, 120), useNum).then(function (r) {
        ov.remove(); setRoom({ code: r.code, key: r.key, title: document.title, at: Date.now() }); showQR(); tick();
      }).catch(function () { ov.querySelector('#ansGo').textContent = '서버에 연결하지 못했습니다'; });
    });
  }
  var qrLib = null;
  function needQR() {
    if (window.qrcode) return Promise.resolve(window.qrcode);
    if (qrLib) return qrLib;
    qrLib = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'; s.onload = function () { res(window.qrcode); }; s.onerror = rej; document.head.appendChild(s); });
    return qrLib;
  }
  function showQR() {
    var url = studentUrl(room.code);
    var ov = overlay('<div class="qr" id="ansQR"></div><div class="big">' + esc(room.code) + '</div><div class="url">' + esc(url) + '</div>' +
      '<div class="say" style="font-size:min(3vw,28px);font-weight:500">휴대폰 카메라로 찍거나, 주소에 들어가 코드를 넣어요.</div><button class="ans-b" data-close type="button">닫기</button>');
    needQR().then(function (qr) { var q = qr(0, 'M'); q.addData(url); q.make(); ov.querySelector('#ansQR').innerHTML = q.createImgTag(8, 0); }).catch(function () { ov.querySelector('#ansQR').remove(); });
  }
  function closeRoom() {
    var ov = overlay('<div class="ans-dlg"><h3>방을 닫을까요?</h3><p>닫으면 이 수업에서 받은 답이 서버에서 지워집니다. 남겨 두려면 먼저 「모아보기」에서 CSV로 받아 두세요.</p>' +
      '<div class="r"><button class="ans-b" data-close type="button">취소</button><button class="ans-b pri" id="ansDel" type="button">닫고 지우기</button></div></div>');
    ov.querySelector('#ansDel').addEventListener('click', function () { var r = room; api.close(r.code, r.key).then(function () { ov.remove(); setRoom(null); }).catch(function () { ov.remove(); setRoom(null); }); });
  }

  /* 패널 */
  function togglePanel() { if (panel.classList.contains('open')) panel.classList.remove('open'); else openPanel(true); }
  function openPanel(followCur) { if (followCur && cur) sel = cur.qid; panel.classList.add('open'); renderPanel(); }   // 단추로 열면 지금 질문, 알약으로 열면 그 알약의 질문
  function qList() {
    var seen = {}, out = [];
    asks().forEach(function (el) { var q = qInfo(el); if (!seen[q.qid]) { seen[q.qid] = 1; out.push(q); } });
    Object.keys(cache).forEach(function (id) { var a = cache[id]; if (a.kind !== 'ask' && !seen[a.qid]) { seen[a.qid] = 1; out.push({ qid: a.qid, kind: a.kind, prompt: a.prompt, choices: null, unit: '', answer: '' }); } });
    out.push({ qid: 'ask', kind: 'ask', prompt: '학생이 보낸 질문', choices: null });
    return out;
  }
  function answersOf(qid) { return Object.keys(cache).map(function (id) { return cache[id]; }).filter(function (a) { return a.qid === qid; }).sort(function (a, b) { return a.id - b.id; }); }
  function norm(s) { return String(s).replace(/[\s.,!?·~"'()]/g, '').toLowerCase(); }
  function bars(rows, total, okFn) {
    return rows.map(function (r) { var p = total ? Math.round(r.n * 100 / total) : 0; return '<div class="ans-row' + (okFn && okFn(r) ? ' ok' : '') + '"><span class="lb">' + esc(r.label) + '</span><span class="bar"><i style="width:' + p + '%"></i></span><span class="c">' + r.n + '</span></div>'; }).join('');
  }
  function actualOf(q) {
    if (q.actualFrom) { var e = document.querySelector(q.actualFrom); if (e) { var m = (e.textContent || '').match(/-?\d+(\.\d+)?/); if (m) return +m[0]; } }
    return q.actual !== '' && q.actual != null && !isNaN(+q.actual) ? +q.actual : null;
  }
  function renderPanel() {
    if (!panel.classList.contains('open') || !room) { if (!room) panel.innerHTML = ''; return; }
    var qs = qList();
    if (!sel || !qs.some(function (q) { return q.qid === sel; })) sel = (cur && cur.qid) || qs[0].qid;
    var q = qs.filter(function (x) { return x.qid === sel; })[0];
    var list = answersOf(q.qid), total = list.length;
    var h = '<div class="ans-hd"><div class="code">' + esc(room.code) + '<small>학생 입장 코드</small></div><span class="sp"></span>' +
      '<button class="ans-b" data-a="qr" type="button">QR</button>' +
      '<button class="ans-b' + (blur ? ' on' : '') + '" data-a="blur" type="button">' + (blur ? '답 보이기' : '답 가리기') + '</button>' +
      '<button class="ans-b" data-a="review" type="button">모아보기</button>' +
      '<button class="ans-b" data-a="close" type="button">방 닫기</button>' +
      '<button class="ans-b" data-a="hide" type="button">접기</button></div>';
    h += '<div class="ans-tabs">' + qs.map(function (x) {
      var n = x.qid === 'ask' ? answersOf('ask').length : devicesFor(x.qid);
      return '<button type="button" data-q="' + esc(x.qid) + '" class="' + (x.qid === sel ? 'on' : '') + '" title="' + esc(x.prompt) + '">' + (cur && cur.qid === x.qid ? '<span class="live"></span>' : '') + esc(x.kind === 'ask' ? '질문함' : (x.prompt || x.qid)) + ' · ' + n + '</button>';
    }).join('') + '</div>';
    h += '<div class="ans-bd' + (blur ? ' blur' : '') + '"><p class="ans-q">' + esc(q.prompt) + '</p><p class="ans-meta">' + esc(KINDS[q.kind]) + ' · ' + (q.kind === 'ask' ? total + '개' : devicesFor(q.qid) + '명 냈어요') + '</p><div class="ans-res">';
    if (!total) h += '<div class="ans-empty">아직 들어온 답이 없습니다.</div>';
    else if (q.kind === 'choice' || q.kind === 'blank') {
      var g = {}, order = [];
      (q.choices || []).forEach(function (c) { var k = norm(c); g[k] = { label: c, n: 0 }; order.push(k); });
      list.forEach(function (a) { var k = norm(a.body); if (!g[k]) { g[k] = { label: a.body, n: 0 }; order.push(k); } g[k].n++; });
      var rows = order.map(function (k) { return g[k]; });
      if (q.kind === 'blank') rows.sort(function (a, b) { return b.n - a.n; });
      var okOn = !!showAnswer[q.qid] && q.answer;
      h += bars(rows, total, okOn ? function (r) { return norm(r.label) === norm(q.answer); } : null);
      if (q.answer) h += '<p style="margin-top:14px"><button class="ans-b' + (okOn ? ' on' : '') + '" data-a="ok" type="button">' + (okOn ? '정답 표시 끄기' : '정답 표시') + '</button></p>';
    } else if (q.kind === 'predict') {
      var nums = list.map(function (a) { var m = String(a.body).replace(/,/g, '').match(/-?\d+(\.\d+)?/); return m ? +m[0] : null; }).filter(function (v) { return v !== null; });
      var act = showAnswer[q.qid] ? actualOf(q) : null;
      if (!nums.length) h += '<div class="ans-empty">숫자로 된 답이 아직 없습니다.</div>';
      else {
        var all = nums.concat(act !== null ? [act] : []), lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
        if (lo === hi) { lo -= 1; hi += 1; }
        var pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
        var stack = {}, dots = nums.map(function (v) { var x = (v - lo) / (hi - lo) * 100, key = Math.round(x); stack[key] = (stack[key] || 0) + 1; return '<i style="left:' + x.toFixed(2) + '%;bottom:' + ((stack[key] - 1) * 26 + 4) + 'px" title="' + v + '"></i>'; }).join('');
        var srt = nums.slice().sort(function (a, b) { return a - b; }), med = srt.length % 2 ? srt[(srt.length - 1) / 2] : (srt[srt.length / 2 - 1] + srt[srt.length / 2]) / 2;
        h += '<div class="ans-dots">' + dots + (act !== null ? '<div class="act" style="left:' + ((act - lo) / (hi - lo) * 100).toFixed(2) + '%"><span>실제 ' + act + ' ' + esc(q.unit) + '</span></div>' : '') + '</div>' +
          '<div class="ans-axis"><span>' + (+lo.toFixed(1)) + '</span><span>' + (+hi.toFixed(1)) + ' ' + esc(q.unit) + '</span></div>' +
          '<p style="font-size:24px">가운데 값 <b>' + (+med.toFixed(2)) + ' ' + esc(q.unit) + '</b> · 가장 작은 값 ' + srt[0] + ' · 가장 큰 값 ' + srt[srt.length - 1] + '</p>';
      }
      if (q.actual || q.actualFrom) h += '<p><button class="ans-b' + (showAnswer[q.qid] ? ' on' : '') + '" data-a="ok" type="button">' + (showAnswer[q.qid] ? '실제 값 숨기기' : '실제 값과 견주기') + '</button></p>';
    } else {
      h += '<div class="ans-cards">' + list.slice().reverse().map(function (a) {
        return '<div class="ans-card' + (hiddenCards[a.id] ? ' hid' : '') + '" data-card="' + a.id + '">' + esc(a.body) + '<button class="x" type="button" data-hide="' + a.id + '">' + (hiddenCards[a.id] ? '보이기' : '가리기') + '</button></div>';
      }).join('') + '</div>';
    }
    h += '</div></div>';
    panel.innerHTML = h;
  }
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a],[data-q],[data-hide],[data-card]'); if (!b) return;
    if (b.dataset.q) { sel = b.dataset.q; renderPanel(); return; }
    if (b.dataset.hide) { var id = b.dataset.hide; hiddenCards[id] = !hiddenCards[id]; renderPanel(); return; }
    if (b.dataset.card) { var a = cache[b.dataset.card]; if (a && !hiddenCards[a.id]) overlay('<div class="say">' + esc(a.body) + '</div><button class="ans-b" data-close type="button">닫기</button>'); return; }
    var act = b.dataset.a;
    if (act === 'qr') showQR();
    else if (act === 'blur') { blur = !blur; renderPanel(); }
    else if (act === 'review') window.open(reviewUrl(room.code, room.key), '_blank', 'noopener');
    else if (act === 'close') closeRoom();
    else if (act === 'hide') panel.classList.remove('open');
    else if (act === 'ok') { showAnswer[sel] = !showAnswer[sel]; renderPanel(); }
  });

  /* 다시 열면 이어서 */
  (function resume() {
    var r = null; try { r = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (!r || !r.code || Date.now() - (r.at || 0) > 12 * 3600 * 1000) { try { localStorage.removeItem(STORE); } catch (e) {} return; }
    api.room(r.code).then(function (x) { if (x) setRoom(r); else setRoom(null); }).catch(function () { setRoom(r); });
  })();
  setInterval(tick, 700);
  setInterval(poll, 2500);
})();
