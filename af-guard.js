/* SJ Desain — batas perangkat (1 HP + 1 laptop/PC). 23 Okt 2026.

   Lapisan terpisah dari app: TIDAK menyentuh logika prompt/generate. Hanya:

   1) menambah info jenis perangkat ke permintaan login /auth.php & menampilkan pilihan "Pindahkan ke perangkat ini",

   2) cek ringan /device.php saat app dibuka & berkala,

   3) info perangkat di Pengaturan + pengumuman aturan (sekali).

   Semua gagal terbuka: bila server/skrip bermasalah, app berjalan seperti biasa. */

(function () {

  'use strict';

  if (window.__AFD) return;

  return; // Deactivated for public access
  window.__AFD = 1;

  var ofetch = window.fetch;

  if (typeof ofetch !== 'function' || typeof Promise === 'undefined') return;

  ofetch = ofetch.bind(window);



  var SKEY = 'af_session_v1', SEEN = 'af_dev_rule_seen_v1', INAPP_X = 'af_dev_inapp_x';

  var SESSION_MS = 3 * 24 * 60 * 60 * 1000;

  var state = { info: null, lastCheck: 0, busy: false, overlay: false };



  function ua() { return navigator.userAgent || ''; }

  function isInApp() { return /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Line\/|TikTok|musical_ly|BytedanceWebview|Twitter|Snapchat|WhatsApp/i.test(ua()); }

  function isAndroid() { return /Android/i.test(ua()); }

  function hint() {

    var u = ua(), t = navigator.maxTouchPoints || 0, m = 9999;

    try { m = Math.min(screen.width || 9999, screen.height || 9999); } catch (e) {}

    if (/Macintosh/.test(u) && t > 1) return 'hp';                           /* iPad mode desktop */

    if (/Linux|X11/.test(u) && !/CrOS|Windows/.test(u) && t > 0 && m <= 1000) return 'hp'; /* HP "situs desktop" */

    return '';

  }

  function isApp() {

    var p = location.pathname || '', h = location.hash || '', host = location.host || '';

    return host.indexOf('app.') === 0 || p === '/app' || p.indexOf('/app/') === 0 || h === '#/app' || h.indexOf('#/app/') === 0;

  }

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function getSess() {

    try { var s = JSON.parse(lsGet(SKEY) || 'null'); return s && s.email && s.expiresAt && Date.now() < s.expiresAt ? s : null; } catch (e) { return null; }

  }

  function post(url, obj) {

    return ofetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(obj), credentials: 'same-origin', cache: 'no-store' });

  }

  function asResp(obj) { return new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } }); }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function kindShort(k) { return k === 'hp' ? 'HP' : 'laptop/PC'; }



  /* ---------------- gaya ---------------- */

  function css() {

    if (document.getElementById('afd-css')) return;

    var st = document.createElement('style');

    st.id = 'afd-css';

    st.textContent =

      '.afd-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(6,6,12,.8);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +

      '.afd-card{background:#fff;color:#14141c;width:100%;max-width:420px;border-radius:16px;padding:20px 18px;box-shadow:0 20px 60px rgba(0,0,0,.45);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;max-height:calc(100vh - 32px);overflow-y:auto}' +

      '.afd-card h3{margin:0 0 8px;font-size:18px;line-height:1.3}.afd-card p{margin:0 0 10px}.afd-mut{color:#555;font-size:13.5px}' +

      '.afd-box{background:#f3f2f8;border-radius:10px;padding:10px 12px;margin:0 0 12px;font-size:14px}' +

      '.afd-btn{display:block;width:100%;box-sizing:border-box;min-height:46px;border:0;border-radius:11px;font:600 15px/1.2 inherit;font-family:inherit;padding:12px;margin:8px 0 0;cursor:pointer;text-align:center;text-decoration:none}' +

      '.afd-pri{background:#ef4444;color:#fff}.afd-pri[disabled]{opacity:.6;cursor:wait}.afd-sec{background:#ecebf3;color:#14141c}.afd-buy{background:#16a34a;color:#fff}' +

      '.afd-in{display:block;width:100%;box-sizing:border-box;min-height:46px;border:1px solid #cfcdd9;border-radius:11px;padding:10px 12px;font:16px inherit;font-family:inherit;margin:4px 0 4px;color:#14141c;background:#fff}' +

      '.afd-err{color:#b00020;font-size:14px;margin:8px 0 0;min-height:1px}.afd-ok{color:#15803d}' +

      '.afd-bn{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147482000;max-width:520px;margin:0 auto;background:#14141c;color:#fff;border-radius:14px;padding:14px 14px 12px;box-shadow:0 12px 40px rgba(0,0,0,.4);font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +

      '.afd-bn b{font-size:15px}.afd-bn .afd-row{display:flex;gap:8px;margin-top:10px}.afd-bn .afd-btn{margin:0;min-height:40px;font-size:14px;padding:9px}' +

      '.afd-set-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin:6px 0}.afd-set-row span:last-child{text-align:right}' +

      '.afd-set-note{font-size:11px;opacity:.75;margin-top:8px;line-height:1.5}.afd-set-buy{display:inline-block;margin-top:8px;background:#16a34a;color:#fff;border-radius:8px;padding:7px 12px;font-weight:600;text-decoration:none;font-size:12px}';

    (document.head || document.documentElement).appendChild(st);

  }



  function inAppNote() {

    if (!isInApp()) return '';

    return '<p class="afd-mut">Kamu membuka lewat browser di dalam Instagram/Facebook. Browser ini dihitung sebagai perangkat tersendiri. ' +

      'Sebaiknya buka autofeeds.id/app di Chrome/Safari dan selalu pakai browser itu.</p>';

  }

  function quotaLine(d) {

    var q = d.quota || {};

    if (d.transition) return '<p class="afd-mut">Masa penyesuaian sampai ' + esc(d.transitionEnd || '') + ': pindah perangkat tidak mengurangi jatah.</p>';

    if (q.max == null) return '';

    return '<p class="afd-mut">Sisa jatah pindah: <b>' + esc(q.left) + ' dari ' + esc(q.max) + '</b> (per ' + esc(q.days) + ' hari).</p>';

  }



  /* ---------------- jendela "perangkat penuh" ----------------

     ctx: {email, password (boleh null → minta diisi), url, done(jsonAkhir|null)} */

  function showBlocked(j, ctx) {

    css();

    var d = (j && j.device) || {};

    var old = document.getElementById('afd-ov'); if (old) old.parentNode.removeChild(old);

    var ov = document.createElement('div'); ov.className = 'afd-ov'; ov.id = 'afd-ov';

    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');

    var card = document.createElement('div'); card.className = 'afd-card';

    ov.appendChild(card);

    state.overlay = true;

    var finished = false;

    function close(final) {

      if (finished) return; finished = true;

      state.overlay = false;

      if (ov.parentNode) ov.parentNode.removeChild(ov);

      ctx.done(final);

    }

    function render(dd, msg) {

      d = dd || d;

      var k = kindShort(d.kind);

      var h = '';

      if (d.status === 'quota') {

        h += '<h3>Jatah pindah perangkat habis</h3>';

        h += '<p>' + esc(msg || (j && j.error) || '') + '</p>';

        if (d.quota && d.quota.backText) h += '<p class="afd-mut">Jatah pindah berikutnya kembali pada ' + esc(d.quota.backText) + '.</p>';

        h += inAppNote();

        h += '<a class="afd-btn afd-buy" id="afd-buy" href="' + esc(d.checkout || 'https://aiautomation.myr.id/pl/auto-feeds') + '" target="_blank" rel="noopener">Beli akses lagi (email berbeda)</a>';

        h += '<button type="button" class="afd-btn afd-sec" id="afd-cancel">' + (ctx.password == null ? 'Keluar' : 'Tutup') + '</button>';

      } else {

        h += '<h3>Akun ini sudah dipakai di ' + k + ' lain</h3>';

        h += '<p>' + esc((j && j.error) || ('Akun ini sudah dipakai di 1 ' + k + ' lain. Maksimal 1 HP + 1 laptop/PC.')) + '</p>';

        h += '<div class="afd-box">Pindahkan akses ' + k + ' ke perangkat ini? ' + k + ' yang lama akan otomatis keluar.</div>';

        h += quotaLine(d);

        h += inAppNote();

        h += '<p class="afd-mut">Setiap browser dihitung 1 perangkat. Mode samaran/incognito atau habis menghapus data browser juga dianggap perangkat baru.</p>';

        if (ctx.password == null) h += '<label class="afd-mut" for="afd-pw">Masukkan password SJ Desain (dari email order) untuk memindahkan</label><input class="afd-in" id="afd-pw" type="password" autocomplete="current-password">';

        if (d.mode === 'kode_email') {

          if (d.codeSent || state.codeSent) h += '<label class="afd-mut" for="afd-code">Kode 6 digit dari email</label><input class="afd-in" id="afd-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code">' +

            '<button type="button" class="afd-btn afd-pri" id="afd-go">Pindahkan ke perangkat ini</button><button type="button" class="afd-btn afd-sec" id="afd-send">Kirim kode lagi</button>';

          else h += '<button type="button" class="afd-btn afd-pri" id="afd-send">Kirim kode ke email</button>';

        } else {

          h += '<button type="button" class="afd-btn afd-pri" id="afd-go">Ya, pindahkan ke perangkat ini</button>';

        }

        h += '<button type="button" class="afd-btn afd-sec" id="afd-cancel">' + (ctx.password == null ? 'Keluar' : 'Batal') + '</button>';

        h += '<p class="afd-err" id="afd-err">' + (msg ? esc(msg) : '') + '</p>';

      }

      card.innerHTML = h;

      var c = card.querySelector('#afd-cancel'); if (c) c.onclick = function () { close(null); };

      var go = card.querySelector('#afd-go'); if (go) go.onclick = function () { act('transfer', go); };

      var se = card.querySelector('#afd-send'); if (se) se.onclick = function () { act('send_code', se); };

    }

    function act(what, btn) {

      var pw = ctx.password;

      var errEl = card.querySelector('#afd-err');

      if (pw == null) {

        var pi = card.querySelector('#afd-pw'); pw = pi ? pi.value : '';

        if (!pw) { if (errEl) errEl.textContent = 'Isi password dulu.'; return; }

      }

      var body = { email: ctx.email, password: pw, dk: hint(), g: 1, device_action: what };

      if (what === 'transfer' && d.mode === 'kode_email') { var ci = card.querySelector('#afd-code'); body.code = ci ? ci.value : ''; }

      var all = card.querySelectorAll('button'); for (var i = 0; i < all.length; i++) all[i].disabled = true;

      var label = btn.textContent; btn.textContent = 'Memproses…';

      post(ctx.url, body).then(function (r) { return r.json(); }).then(function (r) {

        if (r && r.ok) {

          if (r.device) state.info = r.device;

          if (ctx.password == null) ctx.password = pw;

          card.innerHTML = '<h3 class="afd-ok">Berhasil dipindahkan</h3><p>Akun sekarang aktif di perangkat ini.</p>';

          setTimeout(function () { close(r); }, 900);

          return;

        }

        if (r && r.device && r.device.codeSent) state.codeSent = true;

        if (r && r.device && r.device.status === 'quota') { render(r.device, r.error); return; }

        if (r && r.device) { render(r.device, what === 'send_code' && r.device.codeSent ? 'Kode sudah dikirim ke ' + ctx.email + '. Cek kotak masuk/spam.' : r.error); return; }

        render(null, (r && r.error) || 'Gagal memindahkan. Coba lagi.');

      }).catch(function () {

        for (var i = 0; i < all.length; i++) all[i].disabled = false;

        btn.textContent = label;

        if (errEl) errEl.textContent = 'Tidak bisa terhubung. Cek koneksi internet kamu lalu coba lagi.';

      });

    }

    render(d, null);

    (document.body || document.documentElement).appendChild(ov);

  }



  /* ---------------- login: tambah hint + tangani "perangkat penuh" ---------------- */

  function loginFlow(url, body) {

    body.dk = hint(); body.g = 1;

    return post(url, body).then(function (r) {

      if (!r.ok) return r;

      return r.text().then(function (txt) {

        var j = null; try { j = JSON.parse(txt); } catch (e) {}

        if (j && j.ok) { onLoginOk(j); return asResp(j); }

        if (j && j.device && (j.device.status === 'blocked' || j.device.status === 'quota')) {

          return new Promise(function (resolve) {

            showBlocked(j, { email: body.email, password: body.password, url: url, done: function (final) {

              if (final && final.ok) { onLoginOk(final); resolve(asResp(final)); }

              else resolve(asResp({ ok: false, error: j.error || 'Akun ini sudah dipakai di perangkat lain.' }));

            } });

          });

        }

        return new Response(txt, { status: r.status, headers: { 'Content-Type': 'application/json' } });

      });

    });

  }

  function onLoginOk(j) {

    state.lastCheck = Date.now();

    if (j && j.device) state.info = j.device;

    setTimeout(function () { maybeBanner(); renderSettings(); }, 1200);

  }



  window.fetch = function (input, init) {

    try {

      var url = typeof input === 'string' ? input : (input && input.url) || '';

      var path = url.replace(location.origin, '');

      var method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();

      if (method === 'POST' && /^\/?auth\.php(\?|$)/.test(path) && init && typeof init.body === 'string') {

        var body = JSON.parse(init.body);

        if (body && typeof body === 'object' && body.email && !body.device_action) return loginFlow(url, body);

      }

    } catch (e) {}

    return ofetch.apply(window, arguments);

  };



  /* ---------------- cek saat app dibuka & berkala ---------------- */

  function check(force) {

    var s = getSess();

    if (!s || !isApp() || state.busy || state.overlay) return;

    if (!force && Date.now() - state.lastCheck < 5 * 60 * 1000) return;

    state.busy = true; state.lastCheck = Date.now();

    post('/device.php', { a: 'check', email: s.email, dk: hint(), li: s.loggedInAt || 0 }).then(function (r) { return r.ok ? r.json() : null; })

      .then(function (j) {

        state.busy = false;

        if (!j || !j.ok || !j.device) return;          /* gagal terbuka */

        var d = j.device;

        var cur = getSess(); if (!cur || cur.email !== s.email) return;

        if (d.status === 'ok') { state.info = d; maybeBanner(); renderSettings(); return; }

        if (d.status === 'blocked' || d.status === 'quota') {

          lsDel(SKEY);

          showBlocked(j, { email: s.email, password: null, url: '/auth.php', done: function (final) {

            if (final && final.ok) { var n = Date.now(); lsSet(SKEY, JSON.stringify({ email: s.email, loggedInAt: n, expiresAt: n + SESSION_MS })); }

            location.reload();

          } });

          return;

        }

        if (d.status === 'relogin') { lsDel(SKEY); showRelogin(); }

      }).catch(function () { state.busy = false; });

  }

  function showRelogin() {

    css();

    var ov = document.createElement('div'); ov.className = 'afd-ov';

    ov.innerHTML = '<div class="afd-card"><h3>Silakan masuk lagi</h3><p>Perangkat ini perlu dicatat ulang. Masuk lagi dengan email & password SJ Desain kamu.</p>' +

      '<button type="button" class="afd-btn afd-pri">Masuk lagi</button></div>';

    ov.querySelector('button').onclick = function () { location.reload(); };

    state.overlay = true;

    (document.body || document.documentElement).appendChild(ov);

  }



  /* ---------------- pengumuman aturan (sekali) ---------------- */

  function maybeBanner() {

    return;   /* 25 Okt (user): banner aturan perangkat di app dimatikan — menghalangi popup Auto Motion. Info perangkat tetap ada di menu Pengaturan. */

    if (lsGet(SEEN) || !getSess() || !isApp() || state.overlay || document.getElementById('afd-bn') || !state.info || state.info.off) return;

    if (document.querySelector('[data-amx="popup"].amx-in')) return;   /* tunggu popup promo ditutup dulu (dicoba lagi di tick) */

    css();

    var b = document.createElement('div'); b.className = 'afd-bn'; b.id = 'afd-bn'; b.setAttribute('role', 'status');

    b.innerHTML = '<b>Aturan baru akun SJ Desain</b><div>1 akun bisa dipakai di <b>1 HP + 1 laptop/PC</b>. Mau ganti perangkat? Masuk di perangkat baru lalu pilih ' +

      '<b>"Ya, pindahkan ke perangkat ini"</b> — maksimal 3x per 30 hari. Info perangkat ada di menu Pengaturan.</div>' +

      '<div class="afd-row"><button type="button" class="afd-btn afd-pri" id="afd-bn-ok">Mengerti</button></div>';

    b.querySelector('#afd-bn-ok').onclick = function () { lsSet(SEEN, '1'); if (b.parentNode) b.parentNode.removeChild(b); };

    (document.body || document.documentElement).appendChild(b);

  }



  /* ---------------- info perangkat di menu Pengaturan ---------------- */

  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-accent" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>';

  function settingsHtml() {

    var d = state.info || {};

    var q = d.quota || { left: '–', max: 3, days: 30 };

    var rule = d.rule || 'Maksimal 1 HP + 1 laptop/PC. Pindah perangkat maksimal 3x per 30 hari.';

    var rows = '';

    ['hp', 'pc'].forEach(function (k) {

      var dev = null, list = d.devices || [];

      for (var i = 0; i < list.length; i++) if (list[i].kind === k) dev = list[i];

      rows += '<div class="afd-set-row"><span class="text-text-mut">' + (k === 'hp' ? 'HP/tablet' : 'Laptop/PC') + '</span><span class="text-text">' +

        (dev ? 'Terdaftar · dipakai ' + esc(dev.lastText) + (dev.current ? ' <b>(perangkat ini)</b>' : '') : 'Belum ada') + '</span></div>';

    });

    var h = '<div class="flex items-center gap-2 mb-3">' + ICON + '<h3 class="text-xs font-semibold uppercase tracking-widest mono text-text">Perangkat</h3></div>' +

      '<div class="text-xs"><p class="text-text" style="margin:0 0 8px">' + esc(rule) + '</p>' + rows +

      '<div class="afd-set-row"><span class="text-text-mut">Sisa jatah pindah</span><span class="text-text">' +

      (d.transition ? 'Tidak berkurang sampai ' + esc(d.transitionEnd) : '<b>' + esc(q.left) + ' dari ' + esc(q.max) + '</b> (per ' + esc(q.days) + ' hari)') + '</span></div>';

    if (!d.transition && q.backText && q.left !== q.max) h += '<div class="afd-set-row"><span class="text-text-mut">Jatah kembali</span><span class="text-text">' + esc(q.backText) + '</span></div>';

    if (!d.transition && q.left === 0) h += '<p class="text-text" style="margin:8px 0 0">Jatah pindah bulan ini sudah habis. Untuk perangkat tambahan, silakan beli akses lagi dengan email berbeda.</p>' +

      '<a class="afd-set-buy" href="' + esc(d.checkout || 'https://aiautomation.myr.id/pl/auto-feeds') + '" target="_blank" rel="noopener">Beli akses lagi</a>';

    h += '<p class="afd-set-note text-text-mut">Cara pindah: masuk di perangkat baru, lalu pilih "Ya, pindahkan ke perangkat ini" — perangkat lama otomatis keluar. ' +

      'Setiap browser dihitung 1 perangkat (mode samaran & browser di dalam Instagram/Facebook juga).</p></div>';

    return h;

  }

  function findSettings() {

    var hs = document.getElementsByTagName('h2');

    for (var i = 0; i < hs.length; i++) {

      if ((hs[i].textContent || '').trim() !== 'Pengaturan') continue;

      var panel = hs[i].parentNode && hs[i].parentNode.parentNode;

      if (!panel) continue;

      var h3 = panel.getElementsByTagName('h3');

      for (var k = 0; k < h3.length; k++) {

        if ((h3[k].textContent || '').trim().toLowerCase() === 'akun') {

          var sec = h3[k]; while (sec && sec.tagName !== 'SECTION' && sec !== panel) sec = sec.parentNode;

          if (sec && sec.tagName === 'SECTION') return sec;

        }

      }

    }

    return null;

  }

  var lastSettingsCheck = 0;

  function renderSettings() {

    var mine = document.getElementById('afd-set');

    if (state.info && state.info.off) { if (mine && mine.parentNode) mine.parentNode.removeChild(mine); return; }

    var akun = findSettings();

    if (!akun) return;

    css();

    if (!mine) {

      mine = document.createElement('section');

      mine.id = 'afd-set';

      mine.className = akun.className || 'px-5 py-4 border-b border-border';

      if (akun.nextSibling) akun.parentNode.insertBefore(mine, akun.nextSibling); else akun.parentNode.appendChild(mine);

      if (Date.now() - lastSettingsCheck > 30000) { lastSettingsCheck = Date.now(); check(true); }

    }

    var html = settingsHtml();

    if (mine.getAttribute('data-h') !== html) { mine.innerHTML = html; mine.setAttribute('data-h', html); }

  }



  /* ---------------- browser dalam aplikasi (IG/FB): saran buka di Chrome/Safari ---------------- */

  function inAppTip() {

    if (!isInApp() || !isApp() || getSess() || lsGet(INAPP_X) || document.getElementById('afd-ia')) return;

    css();

    var b = document.createElement('div'); b.className = 'afd-bn'; b.id = 'afd-ia'; b.style.top = '12px'; b.style.bottom = 'auto';

    var link = 'https://' + location.host + '/app';

    var open = isAndroid() ? '<a class="afd-btn afd-pri" href="intent://' + location.host + '/app#Intent;scheme=https;package=com.android.chrome;end">Buka di Chrome</a>' : '';

    b.innerHTML = '<b>Kamu membuka lewat browser Instagram/Facebook</b><div>Akun SJ Desain dibatasi 1 HP + 1 laptop/PC, dan setiap browser dihitung 1 perangkat. ' +

      'Supaya tidak perlu pindah perangkat nanti, buka <b>autofeeds.id/app</b> di ' + (isAndroid() ? 'Chrome' : 'Safari/Chrome') + ' lalu masuk di sana.</div>' +

      '<div class="afd-row">' + open + '<button type="button" class="afd-btn afd-sec" id="afd-ia-copy">Salin link</button><button type="button" class="afd-btn afd-sec" id="afd-ia-x">Tutup</button></div>';

    b.querySelector('#afd-ia-copy').onclick = function () {

      var el = this;

      function ok() { el.textContent = 'Tersalin ✓'; }

      try { navigator.clipboard.writeText(link).then(ok, function () { prompt('Salin link ini:', link); }); } catch (e) { prompt('Salin link ini:', link); }

    };

    b.querySelector('#afd-ia-x').onclick = function () { lsSet(INAPP_X, '1'); if (b.parentNode) b.parentNode.removeChild(b); };

    (document.body || document.documentElement).appendChild(b);

  }



  function cookieTip() {

    if (navigator.cookieEnabled !== false || !isApp() || document.getElementById('afd-ck')) return;

    css();

    var b = document.createElement('div'); b.className = 'afd-bn'; b.id = 'afd-ck'; b.style.top = '12px'; b.style.bottom = 'auto';

    b.innerHTML = '<b>Cookie browser ini mati</b><div>SJ Desain memerlukan cookie untuk mengenali perangkat kamu. Aktifkan cookie atau pakai browser lain (Chrome/Safari) tanpa mode samaran.</div>';

    (document.body || document.documentElement).appendChild(b);

  }



  /* ---------------- jalankan ---------------- */

  var moT = 0;

  function tick() { try { renderSettings(); check(false); if (state.info && state.info.status === 'ok') maybeBanner(); } catch (e) {} }

  function start() {

    try {

      check(true); inAppTip(); cookieTip();

      if (window.MutationObserver) new MutationObserver(function () { if (moT) return; moT = setTimeout(function () { moT = 0; tick(); inAppTip(); }, 120); })

        .observe(document.body, { childList: true, subtree: true });

      setInterval(function () { if (!document.hidden) check(false); }, 60 * 1000);

      document.addEventListener('visibilitychange', function () { if (!document.hidden) check(false); });

      window.addEventListener('hashchange', function () { check(false); });

      window.addEventListener('popstate', function () { setTimeout(function () { check(false); }, 50); });

    } catch (e) {}

  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

})();

