// 강사가 보낸 주소만 참가자 화면에 표시합니다. 각 연수는 기존의 s 코드로 구분합니다.
(function () {
  'use strict';
  const lifetime = 15 * 60 * 1000;
  const pollMs = 5000;
  const maxUrl = 8192;
  const chunkSize = 500; // yeonsu_live.body는 600자까지입니다.
  const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

  function webAddress(value) {
    if (typeof value !== 'string' || value.length > maxUrl || !/^https?:\/\//i.test(value) || /[\s\\]/.test(value)) return null;
    try {
      const url = new URL(value);
      if (url.username || url.password || url.href.length > maxUrl) return null;
      return url.href;
    } catch { return null; }
  }

  function signedText(room, id, timestamp, url) {
    return JSON.stringify(['ms-github/links/v1', room, id, timestamp, url]);
  }

  async function makeRows(room, url) {
    const id = crypto.randomUUID();
    const t = Date.now();
    const g = await window.trainingLinkAuth.sign(signedText(room, id, t, url));
    const row = (kind, body) => ({ s: room, kind, name: id, body });
    const message = JSON.stringify({ t, g, u: url });
    if (message.length <= 600) return [row('p-link', message)];
    const parts = [];
    for (let pos = 0; pos < url.length; pos += chunkSize) {
      parts.push(row('p-link-part', parts.length + ':' + url.slice(pos, pos + chunkSize)));
    }
    return [...parts, row('p-link', JSON.stringify({ t, g, n: parts.length }))];
  }

  function sender({ panel, fabRow, openPanel, room, endpoint, headers }) {
    const auth = window.trainingLinkAuth;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pz-btn';
    button.textContent = '링크 보내기';
    fabRow.prepend(button);
    const section = document.createElement('details');
    section.className = 'pz-link-form';
    section.innerHTML = '<summary>링크 보내기</summary><form>' +
      '<label data-key-label hidden>강사용 전송 파일 <input type="file" accept=".key"></label>' +
      '<p data-key-help class="pz-sub" hidden>처음 한 번, 이 컴퓨터에 받은 ‘강사용-링크전송.key’ 파일을 선택하세요.</p>' +
      '<label>보낼 주소 <input type="url" required maxlength="8192" placeholder="https://…" autocomplete="off" spellcheck="false"></label>' +
      '<button class="btn primary" type="submit" disabled>선생님들께 보내기</button><p role="status" class="pz-st"></p></form>';
    panel.querySelector('.pz-head').after(section);
    const form = section.querySelector('form');
    const file = form.querySelector('[type=file]');
    const urlField = form.querySelector('[type=url]');
    const submit = form.querySelector('[type=submit]');
    const status = form.querySelector('[role=status]');
    let authorized = false, busy = false, pending = null;
    function paint() {
      form.querySelector('[data-key-label]').hidden = authorized;
      form.querySelector('[data-key-help]').hidden = authorized;
      submit.disabled = !authorized || busy;
      file.disabled = busy;
      urlField.readOnly = busy;
    }
    auth.ready().then(ready => { authorized = ready; paint(); }).catch(() => paint());
    button.addEventListener('click', () => {
      openPanel(); section.open = true;
      (authorized ? urlField : file).focus();
    });
    file.addEventListener('change', async () => {
      if (!file.files.length) return;
      busy = true; paint();
      try {
        await auth.enroll(file.files[0]);
        authorized = true;
        status.textContent = '강사용 파일을 확인했습니다. 보낼 주소를 입력하세요.';
        urlField.focus();
      } catch {
        status.textContent = '강사용 파일을 확인하지 못했습니다. 받은 파일을 다시 선택하세요.';
      } finally { file.value = ''; busy = false; paint(); }
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !authorized) return;
      const url = webAddress(urlField.value.trim());
      if (!url) { status.textContent = 'http:// 또는 https://로 시작하는 웹 주소를 입력하세요.'; urlField.focus(); return; }
      busy = true; paint(); status.textContent = '보내는 중입니다.';
      try {
        // 응답만 유실된 경우 같은 알림 ID로 다시 보냅니다.
        if (!pending || pending.url !== url || Date.now() - pending.at > lifetime) {
          pending = { url, at: Date.now(), rows: await makeRows(room, url) };
        }
        const result = await fetch(endpoint, { method: 'POST', headers: headers(), body: JSON.stringify(pending.rows) });
        if (!result.ok) throw Error('send');
        status.textContent = '보냈습니다. 이 연수 페이지를 열어 둔 선생님들께 표시됩니다.';
        urlField.value = ''; pending = null;
      } catch { status.textContent = '보내지 못했습니다. 연결을 확인하고 다시 눌러 주세요.'; }
      finally { busy = false; paint(); }
    });
  }

  function receiver({ room, endpoint, headers, store, prefix }) {
    const auth = window.trainingLinkAuth;
    const queryBase = endpoint + '?s=eq.' + encodeURIComponent(room);
    async function read(filters) {
      const response = await fetch(queryBase + filters, { headers: headers(), cache: 'no-store' });
      if (!response.ok) throw Error('read');
      return response.json();
    }
    async function unpack(id, msg) {
      if (typeof msg.u === 'string') return msg.u;
      if (!Number.isInteger(msg.n) || msg.n < 1 || msg.n > Math.ceil(maxUrl / chunkSize)) return null;
      const rows = await read('&kind=eq.p-link-part&name=eq.' + id + '&select=body&order=id.asc&limit=' + msg.n);
      const parts = new Map();
      for (const row of rows) {
        const part = /^(\d{1,2}):([\s\S]{1,500})$/.exec(row.body);
        if (!part || +part[1] >= msg.n) return null;
        parts.set(+part[1], part[2]);
      }
      if (parts.size !== msg.n) return null;
      return Array.from({ length: msg.n }, (_, i) => parts.get(i)).join('');
    }
    const card = document.createElement('aside');
    card.className = 'pz-link-card';
    card.hidden = true;
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', '강사가 보낸 링크');
    card.innerHTML = '<div class="pz-head"><h3>강사가 보낸 링크</h3><button class="pz-x" type="button" aria-label="닫기">×</button></div>' +
      '<p class="pz-link-address" dir="ltr"></p><a class="btn primary" target="_blank" rel="noopener noreferrer">링크 열기</a>';
    const notice = document.createElement('span');
    notice.className = 'pz-link-reader';
    notice.setAttribute('role', 'status');
    document.body.append(card, notice);
    const link = card.querySelector('a');
    const address = card.querySelector('p');
    const seenKey = prefix + ':link-seen:' + room;
    let dismissed = store.get(seenKey, {});
    if (!dismissed || typeof dismissed !== 'object' || Array.isArray(dismissed)) dismissed = {};
    let queue = [], active = null, cursor = 0, polling = false;
    function display() {
      const was = active;
      const cutoff = Date.now() - lifetime;
      queue = queue.filter(item => !dismissed[item.id] && item.t >= cutoff);
      active = queue[0] || null;
      if (was === active) return;
      card.hidden = !active;
      if (active) {
        link.href = active.url; address.textContent = active.url;
        notice.textContent = '강사가 보낸 링크가 도착했습니다. ' + new URL(active.url).hostname;
      } else { link.removeAttribute('href'); address.textContent = ''; notice.textContent = ''; }
    }
    function dismiss() {
      if (!active) return;
      dismissed = Object.assign({}, dismissed, store.get(seenKey, {}));
      dismissed[active.id] = active.t;
      for (const [id, time] of Object.entries(dismissed)) {
        if (time < Date.now() - lifetime) delete dismissed[id];
      }
      store.set(seenKey, dismissed); display();
    }
    card.querySelector('button').addEventListener('click', dismiss);
    // 주소를 새 탭으로 연 뒤 다음 알림으로 넘깁니다.
    link.addEventListener('click', () => setTimeout(dismiss, 0));
    card.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); dismiss(); } });
    window.addEventListener('storage', event => {
      if (event.key === seenKey) { Object.assign(dismissed, store.get(seenKey, {})); display(); }
    });
    async function accept(row) {
      const id = row.name;
      if (!uuidPattern.test(id) || dismissed[id] || queue.some(item => item.id === id)) return;
      let msg;
      try { msg = JSON.parse(row.body); } catch { return; }
      const now = Date.now();
      if (!msg || !Number.isSafeInteger(msg.t) || msg.t < now - lifetime || msg.t > now + 60000 ||
          typeof msg.g !== 'string' || msg.g.length !== 86) return;
      const url = webAddress(await unpack(id, msg));
      if (!url || !await auth.verify(signedText(room, id, msg.t, url), msg.g)) return;
      queue.push({ id, url, t: msg.t });
    }
    async function poll() {
      if (document.hidden || polling) return;
      polling = true;
      try {
        display();
        const after = cursor ? '&id=gt.' + cursor : '';
        const since = new Date(Date.now() - lifetime - 60000).toISOString();
        const rows = await read('&kind=eq.p-link&select=id,name,body&created_at=gte.' + encodeURIComponent(since) + after + '&order=id.asc&limit=50');
        for (const row of rows) {
          await accept(row);
          cursor = row.id;
        }
        display();
      } catch { /* 연결이 돌아오면 다음 확인 때 이어 받습니다. */ }
      finally { polling = false; }
    }
    document.addEventListener('visibilitychange', poll);
    window.addEventListener('online', poll);
    poll(); setInterval(poll, pollMs);
  }
  window.trainingLinks = { sender, receiver };
})();
