(() => {
  'use strict';

  const publicSpki = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEE5bk/DCovyXQkMaMq3X3Wehn6WqgyEGNYuo2kwbLCmZ2xRWC7G/s94ieBdIH5iN0fngqfgGBYqsLjLSvuNzhhA==';
  const keyAlgorithm = { name: 'ECDSA', namedCurve: 'P-256' };
  const signingAlgorithm = { name: 'ECDSA', hash: 'SHA-256' };
  const utf8 = new TextEncoder();
  let publicKeyPromise;
  let signingKey;
  let databasePromise;

  function bytesFromBase64(text) {
    return Uint8Array.from(atob(text), ch => ch.charCodeAt(0));
  }

  function verificationKey() {
    if (!publicKeyPromise) {
      publicKeyPromise = crypto.subtle.importKey(
        'spki', bytesFromBase64(publicSpki), keyAlgorithm, false, ['verify']
      );
    }
    return publicKeyPromise;
  }

  function openDatabase() {
    if (!databasePromise) {
      databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('ms-github-link-signing', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('keys');
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('브라우저 저장소를 열 수 없습니다.'));
        request.onsuccess = () => resolve(request.result);
      });
    }
    return databasePromise;
  }

  async function storedKey() {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const request = database.transaction('keys').objectStore('keys').get(publicSpki);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function remember(key) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('keys', 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onabort = () => reject(transaction.error);
      transaction.objectStore('keys').put(key, publicSpki);
    });
  }

  async function matchesInstructor(key) {
    if (!key || key.type !== 'private' || key.extractable) return false;
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const signature = await crypto.subtle.sign(signingAlgorithm, key, challenge);
    return crypto.subtle.verify(signingAlgorithm, await verificationKey(), signature, challenge);
  }

  async function ready() {
    if (signingKey) return true;
    try {
      const saved = await storedKey();
      if (await matchesInstructor(saved)) signingKey = saved;
    } catch {
      // 개인 브라우징 등에서 저장소를 쓸 수 없어도 파일을 선택하면 전송할 수 있습니다.
    }
    return Boolean(signingKey);
  }

  async function enroll(file) {
    if (!file || !file.size || file.size > 4096) throw new Error('강사용 파일을 선택해 주세요.');
    const contents = new Uint8Array(await file.arrayBuffer());
    let key;
    try {
      key = await crypto.subtle.importKey('pkcs8', contents, keyAlgorithm, false, ['sign']);
    } finally {
      contents.fill(0);
    }
    if (!await matchesInstructor(key)) throw new Error('이 연수의 강사용 파일을 선택해 주세요.');
    signingKey = key;
    try {
      await remember(key);
    } catch {
      // 기기에 저장할 수 없으면 현재 탭에서만 기억합니다.
    }
  }

  async function sign(message) {
    if (typeof message !== 'string') throw new TypeError('서명할 문장이 필요합니다.');
    if (!await ready()) throw new Error('먼저 강사용 파일을 선택해 주세요.');
    const bytes = new Uint8Array(await crypto.subtle.sign(signingAlgorithm, signingKey, utf8.encode(message)));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function verify(message, signature) {
    if (typeof message !== 'string' || typeof signature !== 'string' ||
        !/^[A-Za-z0-9_-]{86}$/.test(signature)) return false;
    try {
      const bytes = bytesFromBase64(signature.replace(/-/g, '+').replace(/_/g, '/'));
      return await crypto.subtle.verify(signingAlgorithm, await verificationKey(), bytes, utf8.encode(message));
    } catch {
      return false;
    }
  }

  window.trainingLinkAuth = Object.freeze({ ready, enroll, sign, verify });
})();
