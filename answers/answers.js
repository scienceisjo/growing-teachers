/* 학생 답 모으기 — 칠판 강의 화면에 덧붙이는 모듈 (해누리중 조승재)
 *
 * 붙이는 법: 강의 화면 </body> 앞에 한 줄
 *   <script src="https://scienceisjo.github.io/growing-teachers/answers/answers.js"></script>
 * 질문을 낼 단계에, 그 단계에만 보이는 요소를 둔다(보이고 숨는 방법은 화면이 정한다).
 *   <div class="ask" data-ask="choice"  data-qid="c1" data-q="생수병 속 공기의 부피는?" data-choices="커졌다|작아졌다|그대로다" data-answer="작아졌다"></div>
 *   <div class="ask" data-ask="predict" data-qid="p1" data-q="60 ℃가 되면 부피는 몇 mL일까요?" data-unit="mL" data-actual="56.8"></div>
 *   <div class="ask" data-ask="blank"   data-qid="b2" data-q="빈칸 ②에 들어갈 말은?" data-answer="늘어나고"></div>
 *   <div class="ask" data-ask="text"    data-qid="t1" data-q="입자 수는 그대로인데 왜 부피가 커질까요?"></div>
 *   <div class="ask" data-ask="sketch"  data-qid="g1" data-q="온도를 올리면 부피는 어떻게 변할까요? 그래프로 그려요."
 *        data-x="온도(℃)" data-xmin="0" data-xmax="100" data-y="부피(mL)" data-ymin="40" data-ymax="70" data-actual="0:46.6|100:63.7"></div>
 *     (그래프 예측: 학생이 손가락으로 그린 선을 칠판에 겹쳐 보이고, 「실제 그래프와 견주기」로 data-actual 의 점들을 이은 선을 얹는다)
 * 「질문 보내기」는 요소 없이 수업 내내 열려 있다.
 * 선생님이 「학생 답」 단추로 방을 열기 전에는 .ask 요소가 비어 있어 화면에 아무것도 보이지 않는다.
 *
 * 학생 휴대폰의 「선생님 화면」: 화면 주소가 https:// 이고 주소 끝에 #장면.단계 를 쓰는 강의 화면이면,
 *   학생 페이지가 같은 화면을 ?s=1&ansview=코드 로 띄우고, 이 모듈이 방향키를 대신 눌러 선생님 단계에 맞춘다.
 *   (손으로 그은 판서·시뮬레이터 값은 따라가지 않는다)
 * 보는 학생 수·나간 학생: 서버에 answers_v2.sql 이 있어야 한다. 없으면 그 칸만 숨는다.
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
  function rpc(fn, args, keep) {
    return fetch(CFG.url + '/rest/v1/rpc/' + fn, {
      method: 'POST', keepalive: !!keep,
      headers: { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    }).then(function (r) {
      if (!r.ok) { var e = new Error('서버 ' + r.status); e.status = r.status; throw e; }
      return r.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }
  var real = {
    open: function (title, useNum) { return rpc('ans_open', { p_title: title, p_use_number: !!useNum }).then(function (r) { return { code: r[0].room_code, key: r[0].room_key }; }); },
    setCur: function (code, key, cur) { return rpc('ans_set_cur', { p_code: code, p_key: key, p_cur: cur }); },
    room: function (code) { return rpc('ans_room', { p_code: code }).then(function (r) { return (r && r[0]) || null; }); },
    // 방 정보를 받으면서 「보는 중/나감」 신호를 남긴다(answers_v2.sql). 서버에 없으면 404.
    ping: function (code, device, num, state, keep) { return rpc('ans_room_ping', { p_code: code, p_device: device, p_num: num || null, p_state: state || 'here' }, keep).then(function (r) { return (r && r[0]) || null; }); },
    people: function (code, key) { return rpc('ans_people_list', { p_code: code, p_key: key }); },
    submit: function (code, a) { return rpc('ans_submit', { p_code: code, p_qid: a.qid, p_kind: a.kind, p_prompt: a.prompt || '', p_body: a.body, p_num: a.num || null, p_device: a.device }); },
    list: function (code, key, since) { return rpc('ans_list', { p_code: code, p_key: key, p_since: since || 0 }); },
    close: function (code, key) { return rpc('ans_close', { p_code: code, p_key: key }); }
  };
  // 가짜 서버: 같은 주소의 탭끼리 localStorage 로 주고받는다(시험용, 실제 서버에 아무것도 남기지 않음)
  // 지금 단계(cur)와 기기 목록은 따로 적는다. 한 덩어리에 같이 적으면 탭끼리 서로 덮어쓴다.
  var fake = (function () {
    var K = 'ansfake:db';
    function load() { try { return JSON.parse(localStorage.getItem(K)) || { rooms: {}, answers: [], seq: 0 }; } catch (e) { return { rooms: {}, answers: [], seq: 0 }; } }
    function save(d) { localStorage.setItem(K, JSON.stringify(d)); }
    function get(k, dflt) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? dflt : v; } catch (e) { return dflt; } }
    function put(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
    function later(v) { return new Promise(function (res) { setTimeout(function () { res(v); }, 30); }); }
    function up(c) { return String(c || '').toUpperCase(); }
    var ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    function roomOf(c) { var r = load().rooms[c]; return r ? { title: r.title, cur: get('ansfake:cur:' + c, null), use_number: r.useNum } : null; }
    return {
      open: function (title, useNum) {
        var d = load(), c;
        do { c = ''; for (var i = 0; i < 6; i++) c += ABC[Math.floor(Math.random() * ABC.length)]; } while (d.rooms[c]);
        var key = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        d.rooms[c] = { key: key, title: title, useNum: !!useNum }; save(d);
        return later({ code: c, key: key });
      },
      setCur: function (code, key, cur) { var c = up(code), r = load().rooms[c]; if (!r || r.key !== key) return later(null); put('ansfake:cur:' + c, cur); return later(true); },
      room: function (code) { return later(roomOf(up(code))); },
      ping: function (code, device, num, state) {
        var c = up(code), info = roomOf(c);
        if (!info) return later(null);
        if (String(device || '').length >= 8) {
          var ps = get('ansfake:people:' + c, {}), s = state === 'away' ? 'away' : 'here';
          var p = ps[device] || { num: null, state: 'here', joined: Date.now(), left: 0 };
          if (s === 'away' && p.state !== 'away') p.left++;
          if (num) p.num = String(num).slice(0, 10);
          p.state = s; p.seen = Date.now(); ps[device] = p; put('ansfake:people:' + c, ps);
        }
        return later(info);
      },
      people: function (code, key) {
        var c = up(code), r = load().rooms[c]; if (!r || r.key !== key) return later([]);
        var ps = get('ansfake:people:' + c, {});
        return later(Object.keys(ps).map(function (k) { var p = ps[k]; return { device: k, num: p.num, state: p.state, ago: Math.floor((Date.now() - p.seen) / 1000), left_count: p.left, _j: p.joined }; })
          .sort(function (a, b) { return a._j - b._j; }));
      },
      submit: function (code, a) {
        var d = load(), c = up(code), body = String(a.body || '').trim();
        if (!d.rooms[c] || !body || body.length > 500) return later(false);
        if (a.kind !== 'ask') d.answers = d.answers.filter(function (x) { return !(x.code === c && x.qid === a.qid && x.device === a.device); });
        d.answers.push({ id: ++d.seq, code: c, qid: a.qid, kind: a.kind, prompt: a.prompt || '', body: body, num: a.num || null, device: a.device, created_at: new Date().toISOString() });
        save(d); return later(true);
      },
      list: function (code, key, since) { var d = load(), c = up(code), r = d.rooms[c]; if (!r || r.key !== key) return later([]); return later(d.answers.filter(function (x) { return x.code === c && x.id > (since || 0); })); },
      close: function (code, key) {
        var d = load(), c = up(code), r = d.rooms[c]; if (!r || r.key !== key) return later(null);
        delete d.rooms[c]; d.answers = d.answers.filter(function (x) { return x.code !== c; }); save(d);
        localStorage.removeItem('ansfake:cur:' + c); localStorage.removeItem('ansfake:people:' + c);
        return later(true);
      }
    };
  })();
  var api = FAKE ? fake : real;
  function studentUrl(code) { return CFG.student + '?c=' + code + (FAKE ? '&ansfake=1' : ''); }
  function reviewUrl(code, key) { return CFG.student + 'review.html' + (FAKE ? '?ansfake=1' : '') + '#c=' + code + '&k=' + key; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  // 기기 목록 → 보는 중 / 나감. 15초 넘게 신호가 없으면 창을 닫은 것으로 본다(와이파이가 잠깐 끊기는 것은 넘긴다).
  function splitPeople(rows) {
    var here = 0, away = [];
    (rows || []).forEach(function (p) { if (p.state === 'here' && p.ago <= 15) here++; else away.push(p); });
    away.sort(function (a, b) { return a.ago - b.ago; });
    return { here: here, away: away, total: (rows || []).length };
  }
  function agoText(s) { return s < 60 ? '방금' : Math.floor(s / 60) + '분 전'; }

  /* ── 그래프 예측(sketch) ─────────────────────────────
   * 학생이 그린 선을 가로 41칸으로 다시 재서 0~1000 으로 담는다.
   * 답 = 'sk:x최소,x최대,y최소,y최대:v0,v1,…,v40' (빈칸은 그 x 에 선이 없음). 답만 보고도 축을 알 수 있다. */
  var SKN = 41;
  function numOr(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function skAxes(q) {
    var a = { x: q.x || '', y: q.y || '', xmin: numOr(q.xmin, 0), xmax: numOr(q.xmax, 10), ymin: numOr(q.ymin, 0), ymax: numOr(q.ymax, 10) };
    if (a.xmax <= a.xmin) a.xmax = a.xmin + 1; if (a.ymax <= a.ymin) a.ymax = a.ymin + 1;
    return a;
  }
  // 선 여러 개(손가락을 뗐다 다시 그린 것) → 칸마다 y. 같은 x 를 두 번 지나면 나중에 그은 쪽.
  function skResample(strokes) {
    var out = []; for (var i = 0; i < SKN; i++) out.push(null);
    (strokes || []).forEach(function (s) {
      if (s.length === 1) { out[Math.round(s[0][0] * (SKN - 1))] = s[0][1]; return; }
      for (var k = 1; k < s.length; k++) {
        var a = s[k - 1], b = s[k], x0 = a[0] * (SKN - 1), x1 = b[0] * (SKN - 1);
        for (var j = Math.ceil(Math.min(x0, x1)); j <= Math.floor(Math.max(x0, x1)); j++) {
          out[j] = x1 === x0 ? b[1] : a[1] + (b[1] - a[1]) * (j - x0) / (x1 - x0);
        }
      }
    });
    return out;
  }
  function skEncode(ax, vals) {
    return 'sk:' + [ax.xmin, ax.xmax, ax.ymin, ax.ymax].join(',') + ':' + vals.map(function (v) { return v == null ? '' : Math.round(clamp01(v) * 1000); }).join(',');
  }
  function skParse(body) {
    var m = /^sk:([^:]*):(.*)$/.exec(String(body || '')); if (!m) return null;
    var r = m[1].split(',').map(Number), vals = m[2].split(',').map(function (s) { return s === '' || isNaN(+s) ? null : clamp01(+s / 1000); });
    if (vals.length !== SKN || r.length !== 4 || r.some(function (n) { return !isFinite(n); })) return null;
    return { xmin: r[0], xmax: r[1], ymin: r[2], ymax: r[3], vals: vals };
  }
  // data-actual="0:46.6|100:63.7" → [[x,y],…]
  function skActual(s) {
    return String(s || '').split('|').map(function (p) { return p.split(':').map(Number); })
      .filter(function (p) { return p.length === 2 && isFinite(p[0]) && isFinite(p[1]); }).sort(function (a, b) { return a[0] - b[0]; });
  }
  function skText(p) {   // CSV 용: y 값을 원래 단위로
    return 'x ' + p.xmin + '~' + p.xmax + ' 사이 ' + SKN + '점, y: ' + p.vals.map(function (v) { return v == null ? '-' : +(p.ymin + v * (p.ymax - p.ymin)).toFixed(2); }).join(' ');
  }
  var SKG = {   // 화면 크기별 그림 틀(뷰박스 단위). 휴대폰은 작은 틀이라 글자가 실제 크기에 가깝다.
    phone: { W: 360, H: 270, L: 50, R: 16, T: 30, B: 48, fs: 13, sw: 4 },
    board: { W: 640, H: 420, L: 80, R: 26, T: 42, B: 66, fs: 19, sw: 3.5 },
    mini: { W: 200, H: 120, L: 4, R: 4, T: 4, B: 4, fs: 0, sw: 2.5 }
  };
  function skGeom(size) { var g = Object.assign({}, SKG[size] || SKG.board); g.pw = g.W - g.L - g.R; g.ph = g.H - g.T - g.B; return g; }
  function skX(g, u) { return +(g.L + u * g.pw).toFixed(1); }
  function skY(g, v) { return +(g.T + (1 - v) * g.ph).toFixed(1); }
  function skPath(g, vals) {
    var d = '', pen = false;
    vals.forEach(function (v, i) { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + skX(g, i / (SKN - 1)) + ' ' + skY(g, v); pen = true; });
    return d;
  }
  function skFmt(n) { return String(+(+n).toFixed(2)); }
  var skId = 0;
  // 축 + 학생 선들(curves) + 반의 가운데 선(median) + 실제 그래프(actual, 원래 단위 점들)
  function skSVG(ax, curves, o) {
    o = o || {}; var g = skGeom(o.size), id = 'ansclip' + (++skId);
    var h = '<svg class="ans-sk" viewBox="0 0 ' + g.W + ' ' + g.H + '" role="img" aria-label="' + esc(o.label || '그래프') + '">' +
      '<defs><clipPath id="' + id + '"><rect x="' + g.L + '" y="' + g.T + '" width="' + g.pw + '" height="' + g.ph + '"/></clipPath></defs>' +
      '<rect x="' + g.L + '" y="' + g.T + '" width="' + g.pw + '" height="' + g.ph + '" fill="#fff"/>';
    for (var k = 1; k < 4; k++) h += '<line x1="' + skX(g, k / 4) + '" y1="' + g.T + '" x2="' + skX(g, k / 4) + '" y2="' + (g.T + g.ph) + '" stroke="#e5e5ea"/><line x1="' + g.L + '" y1="' + skY(g, k / 4) + '" x2="' + (g.L + g.pw) + '" y2="' + skY(g, k / 4) + '" stroke="#e5e5ea"/>';
    h += '<path d="M' + g.L + ' ' + g.T + 'V' + (g.T + g.ph) + 'H' + (g.L + g.pw) + '" fill="none" stroke="#1d1d1f" stroke-width="' + (o.size === 'mini' ? 1.2 : 2) + '"/>';
    if (g.fs) {
      var ty = g.T + g.ph + g.fs + 6, t = function (x, y, s, anc) { return '<text x="' + x + '" y="' + y + '" font-size="' + g.fs + '" fill="#6e6e73" text-anchor="' + anc + '">' + esc(s) + '</text>'; };
      h += t(g.L, ty, skFmt(ax.xmin), 'middle') + t(skX(g, .5), ty, skFmt((ax.xmin + ax.xmax) / 2), 'middle') + t(g.L + g.pw, ty, skFmt(ax.xmax), 'end');
      h += t(g.L - 6, skY(g, 0) + g.fs * .35, skFmt(ax.ymin), 'end') + t(g.L - 6, skY(g, .5) + g.fs * .35, skFmt((ax.ymin + ax.ymax) / 2), 'end') + t(g.L - 6, g.T + g.fs * .35, skFmt(ax.ymax), 'end');
      h += '<text x="' + (g.L + g.pw / 2) + '" y="' + (g.H - 6) + '" font-size="' + g.fs + '" fill="#1d1d1f" font-weight="600" text-anchor="middle">' + esc(ax.x) + '</text>';
      h += '<text x="4" y="' + (g.T - 12) + '" font-size="' + g.fs + '" fill="#1d1d1f" font-weight="600" text-anchor="start">' + esc(ax.y) + '</text>';
    }
    h += '<g clip-path="url(#' + id + ')" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    var op = o.size === 'mini' ? 1 : Math.max(.2, Math.min(.75, 3 / Math.max(1, curves.length)));
    curves.forEach(function (c) { var d = skPath(g, c); if (d) h += '<path d="' + d + '" stroke="#0a84ff" stroke-width="' + g.sw + '" stroke-opacity="' + op + '"/>'; });
    if (o.median && curves.length >= 5) {   // 다섯 명은 넘어야 가운데 선이 한 사람 선을 따라 꺾이지 않는다
      var med = [];
      for (var i = 0; i < SKN; i++) {
        var col = curves.map(function (c) { return c[i]; }).filter(function (v) { return v != null; }).sort(function (a, b) { return a - b; });
        med.push(col.length >= Math.max(2, Math.ceil(curves.length / 2)) ? (col.length % 2 ? col[(col.length - 1) / 2] : (col[col.length / 2 - 1] + col[col.length / 2]) / 2) : null);
      }
      var dm = skPath(g, med); if (dm) h += '<path d="' + dm + '" stroke="#1d1d1f" stroke-width="' + (g.sw * 1.8) + '"/>';
    }
    if (o.actual && o.actual.length >= 2) {
      h += '<path d="' + o.actual.map(function (p, j) { return (j ? 'L' : 'M') + skX(g, (p[0] - ax.xmin) / (ax.xmax - ax.xmin)) + ' ' + skY(g, (p[1] - ax.ymin) / (ax.ymax - ax.ymin)); }).join('') +
        '" stroke="#ff3b30" stroke-width="' + (g.sw * 1.5) + '" stroke-dasharray="' + (g.sw * 3.5) + ' ' + (g.sw * 2.2) + '"/>';
    }
    return h + '</g></svg>';
  }
  var sketch = { N: SKN, axes: skAxes, resample: skResample, encode: skEncode, parse: skParse, actual: skActual, text: skText, geom: skGeom, x: skX, y: skY, path: skPath, svg: skSVG };
  window.Answers = { api: api, CFG: CFG, FAKE: FAKE, studentUrl: studentUrl, reviewUrl: reviewUrl, esc: esc, splitPeople: splitPeople, agoText: agoText, sketch: sketch };
  if (MODE !== 'teacher') return;
  if (QS.get('ansview')) { viewMode(QS.get('ansview')); return; }

  /* ── 학생 휴대폰 안에서 따라 보는 화면 ─────────────────
   * 누르기는 막고, 선생님 단계(#장면.단계)에 닿을 때까지 방향키를 대신 누른다.
   * 단계는 학생 페이지가 postMessage 로 넘겨준다. 이 주소를 따로 열었을 때만 직접 서버에 묻는다. */
  function viewMode(code) {
    document.documentElement.classList.add('ans-view');
    function shield() {
      var sh = document.createElement('div');
      sh.className = 'ans-shield nonav';
      sh.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:transparent;touch-action:none';
      ['click', 'dblclick', 'contextmenu', 'pointerdown', 'pointerup', 'pointermove', 'mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchmove', 'touchend', 'wheel'].forEach(function (t) {
        sh.addEventListener(t, function (e) { e.stopPropagation(); if (e.cancelable && !/move$/.test(t)) e.preventDefault(); }, { passive: false });
      });
      document.body.appendChild(sh);
    }
    if (document.body) shield(); else document.addEventListener('DOMContentLoaded', shield);
    var target = '', pendHash = null, pendAt = 0, fails = 0;
    function parse(h) { var m = /^#(\d+)(?:\.(\d+))?/.exec(h || ''); return m ? [+m[1], +(m[2] || 0)] : null; }
    function setTarget(p) { if (typeof p === 'string' && /^#\d+(\.\d+)?$/.test(p) && p !== target) { target = p; fails = 0; pendHash = null; } }
    window.addEventListener('message', function (e) { if (e.source !== window.parent || !e.data || e.data.ans !== 'pos') return; setTarget(e.data.pos); });
    if (window.parent === window) {
      var pull = function () { api.room(code).then(function (r) { var v = r && r.cur && r.cur.view; if (v) setTarget(v.pos); }).catch(function () {}); };
      pull(); setInterval(pull, 2000);
    }
    function press(k) {
      var kc = k === 'ArrowRight' ? 39 : 37, el = document.body || document.documentElement;
      ['keydown', 'keyup'].forEach(function (type) {
        var ev = new KeyboardEvent(type, { key: k, code: k, bubbles: true, cancelable: true });
        try { Object.defineProperty(ev, 'keyCode', { get: function () { return kc; } }); Object.defineProperty(ev, 'which', { get: function () { return kc; } }); } catch (x) {}
        el.dispatchEvent(ev);
      });
    }
    function follow() {
      var b = parse(target); if (!b || fails >= 6) return;
      for (var i = 0; i < 12; i++) {
        var h = location.hash, a = parse(h) || [1, 0];
        var c = a[0] - b[0] || a[1] - b[1];
        if (c === 0) { fails = 0; pendHash = null; return; }
        if (pendHash !== null && h === pendHash) {        // 지난번 키에 아직 안 움직였으면(넘어가는 효과 중) 잠깐 기다린다
          if (Date.now() - pendAt < 700) return;
          if (++fails >= 6) return;                        // 끝 단계라 더 갈 수 없으면 다음 단계 신호까지 멈춘다
        }
        press(c < 0 ? 'ArrowRight' : 'ArrowLeft');
        if (location.hash === h) { pendHash = h; pendAt = Date.now(); return; }
        pendHash = null;
      }
    }
    setInterval(follow, 200);
  }

  /* ── 선생님 화면 ──────────────────────────────────── */
  var KINDS = { choice: '고르기', predict: '예측', blank: '빈칸 미리 맞히기', text: '짧은 서술', sketch: '그래프 예측', ask: '질문함' };
  var css = '' +
    '.ans-root,.ans-panel,.ans-ov{font-family:"Pretendard Variable",Pretendard,system-ui,-apple-system,"Malgun Gothic",sans-serif;letter-spacing:-.01em;word-break:keep-all}' +
    '.ans-root{position:fixed;left:14px;bottom:14px;z-index:2147483000}' +
    '.ans-fab{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.28);background:#1d1d1f;color:#fff;border-radius:999px;padding:9px 16px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;opacity:.86}' +
    '.ans-fab:hover{opacity:1}.ans-fab .ans-n{background:#0a84ff;border-radius:999px;padding:0 8px;font-size:13px;line-height:20px}' +
    '.ans-fab .ans-w{color:#d1d1d6;font-weight:500;font-size:14px}.ans-fab .ans-away{background:#ff9f0a;color:#1d1d1f;border-radius:999px;padding:0 8px;font-size:13px;line-height:20px}' +
    '.ans-pill{display:inline-flex;align-items:center;gap:14px;background:#1d1d1f;color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:12px 26px;font-size:28px;font-weight:600;line-height:1.2;cursor:pointer;white-space:nowrap;font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif}' +
    '.ans-pill b{color:#64b5ff;letter-spacing:.06em}.ans-pill .ans-k{font-size:22px;font-weight:500;color:#c7c7cc}.ans-pill .ans-cnt{background:#0a84ff;color:#fff;border-radius:999px;padding:2px 14px;font-size:24px}' +
    '.ans-panel{position:fixed;top:0;right:0;bottom:0;width:min(50vw,980px);min-width:360px;background:#fff;color:#1d1d1f;z-index:2147483001;display:flex;flex-direction:column;border-left:1px solid #d2d2d7;transform:translateX(101%);transition:transform .22s ease;font-size:18px}' +
    '.ans-panel.ans-open{transform:none}' +
    '.ans-hd{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #e5e5ea}' +
    '.ans-hd .ans-code{font-size:32px;font-weight:700;letter-spacing:.08em}.ans-hd .ans-code small{display:block;font-size:12px;font-weight:500;letter-spacing:0;color:#6e6e73}' +
    '.ans-hd .ans-sp{flex:1}.ans-b{border:1px solid #d2d2d7;background:#fff;color:#1d1d1f;border-radius:999px;padding:7px 15px;font:inherit;font-size:16px;cursor:pointer}.ans-b:hover{border-color:#1d1d1f}.ans-b.ans-on{background:#1d1d1f;color:#fff;border-color:#1d1d1f}' +
    '.ans-pres{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 18px;border-bottom:1px solid #e5e5ea;font-size:17px;color:#3a3a3c}.ans-pres b{font-size:22px;color:#1d1d1f}.ans-pres .ans-b{font-size:15px;padding:4px 12px}' +
    '.ans-pres .ans-mute{color:#8e8e93;font-size:15px}.ans-away-list{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px}' +
    '.ans-away-list span{background:#fff4e5;border:1px solid #ffd59e;color:#7a4b00;border-radius:999px;padding:3px 11px;font-size:15px}.ans-note{flex-basis:100%;font-size:13px;color:#8e8e93}' +
    '.ans-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:10px 18px;border-bottom:1px solid #e5e5ea}' +
    '.ans-tabs button{border:1px solid #d2d2d7;background:#fff;border-radius:999px;padding:6px 13px;font:inherit;font-size:16px;color:#3a3a3c;cursor:pointer;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.ans-tabs button.ans-on{border-color:#0066cc;color:#0066cc;background:#eaf2fb;font-weight:600}.ans-tabs button .ans-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#34c759;margin-right:6px}' +
    '.ans-bd{flex:1;overflow:auto;padding:18px 20px 30px}.ans-bd.ans-blur .ans-res{filter:blur(14px);pointer-events:none;user-select:none}' +
    '.ans-q{font-size:32px;font-weight:700;line-height:1.35;margin:0 0 4px}.ans-meta{color:#6e6e73;font-size:18px;margin:0 0 16px}' +
    '.ans-row{display:grid;grid-template-columns:minmax(110px,32%) 1fr 64px;align-items:center;gap:14px;margin:14px 0;font-size:26px}' +
    '.ans-row .ans-bar{height:38px;background:#f2f2f7;border-radius:8px;overflow:hidden}.ans-row .ans-bar i{display:block;height:100%;background:#0a84ff;border-radius:8px}' +
    '.ans-row.ans-ok .ans-lb{color:#1d8a4e;font-weight:700}.ans-row.ans-ok .ans-bar i{background:#34c759}.ans-row .ans-c{text-align:right;font-variant-numeric:tabular-nums;color:#3a3a3c}' +
    '.ans-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}' +
    '.ans-card{position:relative;border:1px solid #e5e5ea;border-radius:12px;padding:16px 18px 32px;font-size:23px;line-height:1.5;background:#fbfbfd;cursor:pointer;white-space:pre-wrap;overflow-wrap:anywhere}' +
    '.ans-card .ans-x{position:absolute;right:8px;bottom:6px;border:0;background:none;color:#8e8e93;font:inherit;font-size:13px;cursor:pointer}.ans-card.ans-hid{opacity:.35}' +
    '.ans-dots{position:relative;height:120px;margin:24px 10px 8px;border-bottom:2px solid #1d1d1f}' +
    '.ans-dots i{position:absolute;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:#0a84ff;opacity:.8}' +
    '.ans-dots .ans-act{position:absolute;bottom:-6px;top:-14px;border-left:3px dashed #ff3b30}.ans-dots .ans-act span{position:absolute;top:-24px;left:6px;color:#ff3b30;font-size:19px;font-weight:700;white-space:nowrap}' +
    '.ans-skbox svg{display:block;width:100%;height:auto;max-height:56vh}.ans-skkey{display:flex;gap:18px;flex-wrap:wrap;align-items:center;font-size:18px;color:#3a3a3c;margin:0 0 10px}.ans-skkey .ans-b{margin-left:auto}' +
    '.ans-skkey i{display:inline-block;width:28px;height:0;border-top:4px solid #0a84ff;vertical-align:middle;margin-right:8px}.ans-skkey i.ans-l1{opacity:.6}.ans-skkey i.ans-l2{border-top:7px solid #1d1d1f}.ans-skkey i.ans-l3{border-top:5px dashed #ff3b30}' +
    '.ans-axis{display:flex;justify-content:space-between;color:#6e6e73;font-size:17px;margin:4px 10px 14px}' +
    '.ans-empty{color:#8e8e93;font-size:20px;padding:30px 0}' +
    '.ans-ov{position:fixed;inset:0;z-index:2147483002;background:rgba(0,0,0,.86);color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;text-align:center;padding:20px}' +
    '.ans-ov .ans-big{font-size:min(9vw,96px);font-weight:800;letter-spacing:.12em}.ans-ov .ans-url{font-size:min(2.6vw,22px);color:#d1d1d6;word-break:break-all}' +
    '.ans-ov .ans-qr{background:#fff;padding:16px;border-radius:16px;line-height:0}.ans-ov .ans-qr img,.ans-ov .ans-qr canvas{width:min(46vh,46vw);height:auto;image-rendering:pixelated}' +
    '.ans-ov .ans-say{font-size:min(5vw,46px);line-height:1.4;max-width:1100px;white-space:pre-wrap;font-weight:600}' +
    '.ans-ov .ans-b{background:transparent;color:#fff;border-color:rgba(255,255,255,.5);font-size:16px}' +
    '.ans-dlg{background:#fff;color:#1d1d1f;border-radius:16px;padding:24px 26px;max-width:460px;text-align:left;font-size:17px;line-height:1.55}' +
    '.ans-dlg h3{margin:0 0 8px;font-size:21px}.ans-dlg label{display:flex;gap:10px;align-items:flex-start;margin:14px 0}.ans-dlg .ans-r{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}' +
    '.ans-dlg .ans-b{color:#1d1d1f;border-color:#d2d2d7}.ans-dlg .ans-b.ans-pri{background:#0066cc;color:#fff;border-color:#0066cc}' +
    '.ans-dlg small{color:#6e6e73}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var STORE = 'answers:room:' + location.pathname;
  var room = null;            // {code,key,title,at}
  var cache = {};             // id -> answer (같은 기기·같은 질문은 마지막 것만)
  var lastId = 0;
  var cur = null, qJson = 'null', curJson = 'null';   // cur = 지금 질문, curJson = 서버에 보낸 {q, view}
  var sel = null;             // 패널에서 보고 있는 qid
  var hiddenCards = {};
  var showAnswer = {};
  var blur = false;
  var pres = null, presOff = false, showAway = false;   // 보는 학생 수(answers_v2.sql 이 없으면 presOff)

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
      unit: d.unit || '', answer: d.answer || '', actual: d.actual || '', actualFrom: d.actualFrom || '',
      x: d.x || '', y: d.y || '', xmin: d.xmin, xmax: d.xmax, ymin: d.ymin, ymax: d.ymax
    };
  }
  function visible(el) {
    if (!el.isConnected) return false;
    if (el.checkVisibility) { if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })) return false; }
    else { var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; }
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  }
  // 학생 휴대폰에 띄울 이 화면의 주소와 지금 단계. 파일(file://)로 연 화면은 휴대폰이 열 수 없어 null.
  function viewInfo() {
    if (!/^https?:$/.test(location.protocol)) return null;
    var sp = new URLSearchParams(location.search); ['ansfake', 'ansview', 's'].forEach(function (k) { sp.delete(k); });
    var qs = sp.toString(), m = location.hash.match(/^#\d+(\.\d+)?/);
    return { url: location.origin + location.pathname + (qs ? '?' + qs : ''), pos: m ? m[0] : '' };
  }
  function devicesFor(qid) { var s = {}; Object.keys(cache).forEach(function (id) { var a = cache[id]; if (a.qid === qid) s[a.device] = 1; }); return Object.keys(s).length; }
  function paintPills() {
    asks().forEach(function (el) {
      el.classList.add('nonav');
      if (!room) { if (el.firstChild) el.innerHTML = ''; return; }
      var q = qInfo(el), n = devicesFor(q.qid);
      var html = '<span class="ans-pill"><span class="ans-k">' + esc(KINDS[q.kind]) + '</span>휴대폰으로 답하기 · <b>' + esc(room.code) + '</b><span class="ans-cnt">' + n + '명</span></span>';
      if (el.getAttribute('data-ans-html') !== html) { el.innerHTML = html; el.setAttribute('data-ans-html', html); }
      if (!el.dataset.ansBound) {
        el.dataset.ansBound = '1'; guard(el);
        el.addEventListener('click', function () { sel = qInfo(el).qid; openPanel(); });
      }
    });
  }
  function paintFab() {
    if (!room) { fab.textContent = '학생 답'; return; }
    var h = '학생 답 · ' + esc(room.code);
    if (pres) h += ' <span class="ans-w">보는 중 ' + pres.here + '</span>' + (pres.away.length ? '<span class="ans-away">나감 ' + pres.away.length + '</span>' : '');
    fab.innerHTML = h + ' <span class="ans-n">답 ' + Object.keys(cache).length + '</span>';
  }
  function tick() {
    if (!room) return;
    paintPills();
    var vis = asks().filter(visible), el = vis[vis.length - 1], q = null;
    if (el) {
      var i = qInfo(el); q = { qid: i.qid, kind: i.kind, prompt: i.prompt, choices: i.choices, unit: i.unit };
      if (i.kind === 'sketch') { var ax = skAxes(i); q.x = ax.x; q.y = ax.y; q.xmin = ax.xmin; q.xmax = ax.xmax; q.ymin = ax.ymin; q.ymax = ax.ymax; }
    }
    var j = JSON.stringify({ q: q, view: viewInfo() });
    if (j !== curJson) {
      curJson = j;
      api.setCur(room.code, room.key, JSON.parse(j)).catch(function () { curJson = 'retry'; });
    }
    var qj = JSON.stringify(q);
    if (qj !== qJson) {
      qJson = qj; cur = q;
      if (q) sel = q.qid;   // 새 질문 단계에 오면 패널도 그 질문으로(다른 질문은 위 단추로 골라 봄)
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
      paintFab(); paintPills(); renderPanel();
    }).catch(function () {});
  }
  function pollPeople() {
    if (!room || presOff) return;
    api.people(room.code, room.key).then(function (rows) {
      pres = splitPeople(rows); paintFab(); renderPres();
    }).catch(function (e) { if (e && e.status === 404) { presOff = true; pres = null; paintFab(); renderPres(); } });
  }

  /* 방 열기·닫기 */
  function setRoom(r) {
    room = r; cache = {}; lastId = 0; curJson = 'null'; qJson = 'null'; cur = null; pres = null; showAway = false;
    if (r) { try { localStorage.setItem(STORE, JSON.stringify(r)); } catch (e) {} document.documentElement.classList.add('ans-live'); }
    else { try { localStorage.removeItem(STORE); } catch (e) {} document.documentElement.classList.remove('ans-live'); panel.classList.remove('ans-open'); }
    paintFab(); paintPills(); renderPanel();
    if (r) pollPeople();
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
      '<label><input type="checkbox" id="ansNum"> <span>번호 받기<br><small>세특 기록처럼 누가 쓴 답인지 알아야 할 때, 나간 학생 번호를 보고 싶을 때만 켭니다. 번호는 칠판에 저절로 뜨지 않습니다.</small></span></label>' +
      '<div class="ans-r"><button class="ans-b" data-close type="button">취소</button><button class="ans-b ans-pri" id="ansGo" type="button">시작</button></div></div>');
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
    var ov = overlay('<div class="ans-qr" id="ansQR"></div><div class="ans-big">' + esc(room.code) + '</div><div class="ans-url">' + esc(url) + '</div>' +
      '<div class="ans-say" style="font-size:min(3vw,28px);font-weight:500">휴대폰 카메라로 찍거나, 주소에 들어가 코드를 넣어요.</div><button class="ans-b" data-close type="button">닫기</button>');
    needQR().then(function (qr) { var q = qr(0, 'M'); q.addData(url); q.make(); ov.querySelector('#ansQR').innerHTML = q.createImgTag(8, 0); }).catch(function () { ov.querySelector('#ansQR').remove(); });
  }
  function closeRoom() {
    var ov = overlay('<div class="ans-dlg"><h3>방을 닫을까요?</h3><p>닫으면 이 수업에서 받은 답이 서버에서 지워집니다. 남겨 두려면 먼저 「모아보기」에서 CSV로 받아 두세요.</p>' +
      '<div class="ans-r"><button class="ans-b" data-close type="button">취소</button><button class="ans-b ans-pri" id="ansDel" type="button">닫고 지우기</button></div></div>');
    ov.querySelector('#ansDel').addEventListener('click', function () { var r = room; api.close(r.code, r.key).then(function () { ov.remove(); setRoom(null); }).catch(function () { ov.remove(); setRoom(null); }); });
  }

  /* 패널 */
  function togglePanel() { if (panel.classList.contains('ans-open')) panel.classList.remove('ans-open'); else openPanel(true); }
  function openPanel(followCur) { if (followCur && cur) sel = cur.qid; panel.classList.add('ans-open'); renderPanel(); }   // 단추로 열면 지금 질문, 알약으로 열면 그 알약의 질문
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
    return rows.map(function (r) { var p = total ? Math.round(r.n * 100 / total) : 0; return '<div class="ans-row' + (okFn && okFn(r) ? ' ans-ok' : '') + '"><span class="ans-lb">' + esc(r.label) + '</span><span class="ans-bar"><i style="width:' + p + '%"></i></span><span class="ans-c">' + r.n + '</span></div>'; }).join('');
  }
  function actualOf(q) {
    if (q.actualFrom) { var e = document.querySelector(q.actualFrom); if (e) { var m = (e.textContent || '').match(/-?\d+(\.\d+)?/); if (m) return +m[0]; } }
    return q.actual !== '' && q.actual != null && !isNaN(+q.actual) ? +q.actual : null;
  }
  // 보는 학생 수 줄. 나간 학생 번호는 칠판에 그냥 뜨지 않게 「보기」를 눌렀을 때만 펼친다.
  function presHTML() {
    var h = '';
    if (!pres) h = '<span class="ans-mute">들어온 학생을 세는 중…</span>';
    else {
      h = '<span>보는 중 <b>' + pres.here + '</b>명</span>';
      if (pres.away.length) h += '<button class="ans-b' + (showAway ? ' ans-on' : '') + '" data-a="away" type="button">나감 ' + pres.away.length + '명 · ' + (showAway ? '접기' : '보기') + '</button>';
      else if (pres.total) h += '<span class="ans-mute">나간 학생 없음</span>';
      if (showAway && pres.away.length) {
        var nums = pres.away.filter(function (p) { return p.num; }), noNum = pres.away.length - nums.length;
        h += '<div class="ans-away-list">' + nums.map(function (p) { return '<span>' + esc(p.num) + '번 · ' + agoText(p.ago) + (p.left_count > 1 ? ' · ' + p.left_count + '회' : '') + '</span>'; }).join('') +
          (noNum ? '<span>번호 없는 기기 ' + noNum + '대</span>' : '') + '</div>';
      }
    }
    return h;
  }
  function renderPres() {
    var el = panel.querySelector('.ans-pres'); if (!el) return;
    var h = presOff ? '' : presHTML();
    if (!viewInfo()) h += '<div class="ans-note">학생 휴대폰에 이 화면이 같이 뜨는 것은 인터넷 주소(https://…)로 연 화면에서만 됩니다.</div>';
    el.hidden = !h; el.innerHTML = h;
  }
  function renderPanel() {
    if (!panel.classList.contains('ans-open') || !room) { if (!room) panel.innerHTML = ''; return; }
    var qs = qList();
    if (!sel || !qs.some(function (q) { return q.qid === sel; })) sel = (cur && cur.qid) || qs[0].qid;
    var q = qs.filter(function (x) { return x.qid === sel; })[0];
    var list = answersOf(q.qid), total = list.length;
    var h = '<div class="ans-hd"><div class="ans-code">' + esc(room.code) + '<small>학생 입장 코드</small></div><span class="ans-sp"></span>' +
      '<button class="ans-b" data-a="qr" type="button">QR</button>' +
      '<button class="ans-b' + (blur ? ' ans-on' : '') + '" data-a="blur" type="button">' + (blur ? '답 보이기' : '답 가리기') + '</button>' +
      '<button class="ans-b" data-a="review" type="button">모아보기</button>' +
      '<button class="ans-b" data-a="close" type="button">방 닫기</button>' +
      '<button class="ans-b" data-a="hide" type="button">접기</button></div>';
    h += '<div class="ans-pres"></div>';
    h += '<div class="ans-tabs">' + qs.map(function (x) {
      var n = x.qid === 'ask' ? answersOf('ask').length : devicesFor(x.qid);
      return '<button type="button" data-q="' + esc(x.qid) + '" class="' + (x.qid === sel ? 'ans-on' : '') + '" title="' + esc(x.prompt) + '">' + (cur && cur.qid === x.qid ? '<span class="ans-dot"></span>' : '') + esc(x.kind === 'ask' ? '질문함' : (x.prompt || x.qid)) + ' · ' + n + '</button>';
    }).join('') + '</div>';
    h += '<div class="ans-bd' + (blur ? ' ans-blur' : '') + '"><p class="ans-q">' + esc(q.prompt) + '</p><p class="ans-meta">' + esc(KINDS[q.kind]) + ' · ' + (q.kind === 'ask' ? total + '개' : devicesFor(q.qid) + '명 냈어요') + '</p><div class="ans-res">';
    if (!total) h += '<div class="ans-empty">아직 들어온 답이 없습니다.</div>';
    else if (q.kind === 'choice' || q.kind === 'blank') {
      var g = {}, order = [];
      (q.choices || []).forEach(function (c) { var k = norm(c); g[k] = { label: c, n: 0 }; order.push(k); });
      list.forEach(function (a) { var k = norm(a.body); if (!g[k]) { g[k] = { label: a.body, n: 0 }; order.push(k); } g[k].n++; });
      var rows = order.map(function (k) { return g[k]; });
      if (q.kind === 'blank') rows.sort(function (a, b) { return b.n - a.n; });
      var okOn = !!showAnswer[q.qid] && q.answer;
      h += bars(rows, total, okOn ? function (r) { return norm(r.label) === norm(q.answer); } : null);
      if (q.answer) h += '<p style="margin-top:14px"><button class="ans-b' + (okOn ? ' ans-on' : '') + '" data-a="ok" type="button">' + (okOn ? '정답 표시 끄기' : '정답 표시') + '</button></p>';
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
        h += '<div class="ans-dots">' + dots + (act !== null ? '<div class="ans-act" style="left:' + ((act - lo) / (hi - lo) * 100).toFixed(2) + '%"><span>실제 ' + act + ' ' + esc(q.unit) + '</span></div>' : '') + '</div>' +
          '<div class="ans-axis"><span>' + (+lo.toFixed(1)) + '</span><span>' + (+hi.toFixed(1)) + ' ' + esc(q.unit) + '</span></div>' +
          '<p style="font-size:24px">가운데 값 <b>' + (+med.toFixed(2)) + ' ' + esc(q.unit) + '</b> · 가장 작은 값 ' + srt[0] + ' · 가장 큰 값 ' + srt[srt.length - 1] + '</p>';
      }
      if (q.actual || q.actualFrom) h += '<p><button class="ans-b' + (showAnswer[q.qid] ? ' ans-on' : '') + '" data-a="ok" type="button">' + (showAnswer[q.qid] ? '실제 값 숨기기' : '실제 값과 견주기') + '</button></p>';
    } else if (q.kind === 'sketch') {
      var parsed = list.map(function (a) { return skParse(a.body); }).filter(Boolean), first = parsed[0] || {};
      var sax = q.xmin !== undefined ? skAxes(q) : skAxes({ x: '', y: '', xmin: first.xmin, xmax: first.xmax, ymin: first.ymin, ymax: first.ymax });
      var curves = parsed.map(function (p) { return p.vals; }), sact = showAnswer[q.qid] ? skActual(q.actual) : null;
      h += '<div class="ans-skkey"><span><i class="ans-l1"></i>학생 ' + curves.length + '명</span>' + (curves.length >= 5 ? '<span><i class="ans-l2"></i>반의 가운데 선</span>' : '') + (sact && sact.length >= 2 ? '<span><i class="ans-l3"></i>실제</span>' : '') +
        (q.actual ? '<button class="ans-b' + (showAnswer[q.qid] ? ' ans-on' : '') + '" data-a="ok" type="button">' + (showAnswer[q.qid] ? '실제 그래프 숨기기' : '실제 그래프와 견주기') + '</button>' : '') + '</div>';
      h += '<div class="ans-skbox">' + skSVG(sax, curves, { size: 'board', median: true, actual: sact, label: q.prompt }) + '</div>';
    } else {
      h += '<div class="ans-cards">' + list.slice().reverse().map(function (a) {
        return '<div class="ans-card' + (hiddenCards[a.id] ? ' ans-hid' : '') + '" data-card="' + a.id + '">' + esc(a.body) + '<button class="ans-x" type="button" data-hide="' + a.id + '">' + (hiddenCards[a.id] ? '보이기' : '가리기') + '</button></div>';
      }).join('') + '</div>';
    }
    h += '</div></div>';
    var oldBd = panel.querySelector('.ans-bd'), top = oldBd ? oldBd.scrollTop : 0, same = panel.getAttribute('data-ans-q') === q.qid;
    panel.innerHTML = h; panel.setAttribute('data-ans-q', q.qid);
    if (same && top) panel.querySelector('.ans-bd').scrollTop = top;   // 새 답이 들어와도 보던 자리 그대로
    renderPres();
  }
  panel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a],[data-q],[data-hide],[data-card]'); if (!b) return;
    if (b.dataset.q) { sel = b.dataset.q; renderPanel(); return; }
    if (b.dataset.hide) { var id = b.dataset.hide; hiddenCards[id] = !hiddenCards[id]; renderPanel(); return; }
    if (b.dataset.card) { var a = cache[b.dataset.card]; if (a && !hiddenCards[a.id]) overlay('<div class="ans-say">' + esc(a.body) + '</div><button class="ans-b" data-close type="button">닫기</button>'); return; }
    var act = b.dataset.a;
    if (act === 'qr') showQR();
    else if (act === 'blur') { blur = !blur; renderPanel(); }
    else if (act === 'review') window.open(reviewUrl(room.code, room.key), '_blank', 'noopener');
    else if (act === 'close') closeRoom();
    else if (act === 'hide') panel.classList.remove('ans-open');
    else if (act === 'ok') { showAnswer[sel] = !showAnswer[sel]; renderPanel(); }
    else if (act === 'away') { showAway = !showAway; renderPres(); }
  });

  /* 다시 열면 이어서 */
  (function resume() {
    var r = null; try { r = JSON.parse(localStorage.getItem(STORE)); } catch (e) {}
    if (!r || !r.code || Date.now() - (r.at || 0) > 12 * 3600 * 1000) { try { localStorage.removeItem(STORE); } catch (e) {} return; }
    api.room(r.code).then(function (x) { if (x) setRoom(r); else setRoom(null); }).catch(function () { setRoom(r); });
  })();
  setInterval(tick, 700);
  setInterval(poll, 2500);
  setInterval(pollPeople, 3000);
})();
