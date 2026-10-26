/* ════════════════════════════════════════════════════════════════════

   PROMO SILANG SJ Vidio — khusus aplikasi /app SJ Desain.

   ────────────────────────────────────────────────────────────────────

   • Menu "SJ Vidio" (badge BARU) di sidebar + popup 1× per hari.

   • Berdiri sendiri: TIDAK mengubah bundle React. Dimuat dari index.html

     hanya di rute /app. Gagal apa pun → diam (try/catch), aplikasi jalan.

   • Popup hanya muncul setelah user MASUK (sidebar studio sudah tampil),

     ±1,5 dtk setelah aplikasi siap. Aset video/poster baru diunduh saat

     popup dibuka.

   • Matikan tanpa hapus file: tambahkan  amPromo: false  di /config.js

     (popup saja: amPromoPopup: false).

   localStorage: af_am_popup_date (YYYY-MM-DD lokal), af_am_menu_seen.

   ════════════════════════════════════════════════════════════════════ */

(function () {

  'use strict';

  if (window.__AMX_LOADED) return;

  window.__AMX_LOADED = true;



  var CFG = window.__AF_CONFIG || {};

  if (CFG.amPromo === false) return;



  var VER = '1';

  var BASE = '/am-promo/';

  try {

    var cs = document.currentScript && document.currentScript.src;

    if (cs) BASE = cs.replace(/[^\/]*$/, '');

  } catch (e) {}



  var URL_POPUP = '#';

  var URL_MENU = '#';

  var KEY_DATE = 'af_am_popup_date';

  var KEY_SEEN = 'af_am_menu_seen';

  var DELAY_MS = 1500;



  /* ───── util ───── */

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }

  function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function ssGet(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } }

  function ssSet(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) {} }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function mq(q) { try { return window.matchMedia && window.matchMedia(q).matches; } catch (e) { return false; } }

  function reducedMotion() { return mq('(prefers-reduced-motion: reduce)'); }

  function isAppRoute() {

    var h = location.host || '', p = location.pathname || '', x = location.hash || '';

    return h.indexOf('app.') === 0 || p === '/app' || p.indexOf('/app/') === 0 || x === '#/app' || x.indexOf('#/app/') === 0;

  }

  function el(tag, cls, html) {

    var n = document.createElement(tag);

    if (cls) n.className = cls;

    if (html != null) n.innerHTML = html;

    return n;

  }



  /* Sudah tampil hari ini? Patokan utama: localStorage af_am_popup_date.

     Kalau localStorage gagal menyimpan, jatuh ke sessionStorage (sekali per

     sesi), lalu ke memori halaman — supaya tidak muncul berulang-ulang. */

  var KEY_FB = 'af_am_popup_date_sesi';

  function shownToday() {

    var t = today();

    if (window.__AMX_SHOWN) return true;

    if (lsGet(KEY_DATE) === t) return true;

    return ssGet(KEY_FB) === t;

  }

  function markShown() {

    var t = today();

    window.__AMX_SHOWN = true;

    var ok = lsSet(KEY_DATE, t) && lsGet(KEY_DATE) === t;

    if (!ok) ssSet(KEY_FB, t);

  }



  /* ───── ikon ───── */

  var LOGO_SVG =

    '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><linearGradient id="amxG" x1="0" y1="0" x2="1" y2="1">' +

    '<stop offset="0" stop-color="#FF8A4C"/><stop offset=".55" stop-color="#FF4A33"/><stop offset="1" stop-color="#E11D48"/></linearGradient></defs>' +

    '<rect x="2" y="2" width="60" height="60" rx="17" fill="url(#amxG)"/>' +

    '<path d="M28 21.5 45.5 32 28 42.5Z" fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>' +

    '<path d="M11 24.5h9M8 32h12M11 39.5h9" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>' +

    '<path d="M50 8.5l1.7 4.6 4.6 1.7-4.6 1.7-1.7 4.6-1.7-4.6-4.6-1.7 4.6-1.7z" fill="#fff"/></svg>';

  var CHECK_SVG =

    '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="9" fill="rgba(255,106,61,.16)"/>' +

    '<path d="M6 10.4l2.6 2.6L14.2 7.4" fill="none" stroke="#FF7A45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var X_SVG =

    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  var ARROW_SVG =

    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var SPARK_SVG =

    '<svg viewBox="0 0 24 24" width="11" height="11" aria-hidden="true" focusable="false"><path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19 9.8 12.7 3.5 10.5 9.8 8.3z" fill="currentColor"/></svg>';



  /* ───── CSS (prefix amx- supaya tidak bentrok dengan Tailwind aplikasi) ───── */

  var CSS = [

    /* menu sidebar — jarak antarikon dirapatkan sedikit HANYA bila item ini ada,

       supaya tinggi tombol menu lain tidak ikut menyusut (rail = flex kolom

       dengan tinggi tetap). HP gap 12→9px, desktop (lg) 8→5px. */

    'aside:has(> .amx-side){row-gap:9px}',

    '@media (min-width:1024px){aside:has(> .amx-side){row-gap:5px}}',

    '.amx-side{position:relative;flex:0 0 auto;box-sizing:border-box;width:44px;height:44px;margin:0;display:flex;align-items:center;justify-content:center;border-radius:12px;',

    'background:linear-gradient(135deg,rgba(255,59,48,.16),rgba(255,138,76,.10));box-shadow:inset 0 0 0 1.5px rgba(255,106,61,.8),0 0 12px -2px rgba(255,74,51,.6);',

    'text-decoration:none;-webkit-tap-highlight-color:transparent;cursor:pointer;transition:transform .15s ease,box-shadow .2s ease,background .2s ease}',

    '.amx-side:hover{background:linear-gradient(135deg,rgba(255,59,48,.28),rgba(255,138,76,.18));transform:translateY(-1px)}',

    '.amx-side:focus-visible{outline:2px solid #FF8A4C;outline-offset:3px}',

    '.amx-side svg{width:28px;height:28px;display:block}',

    '.amx-side-badge{position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);padding:2px 4px 2px 5px;border-radius:999px;font:800 8px/1.15 Inter,system-ui,-apple-system,sans-serif;letter-spacing:.1em;color:#fff;',

    'background:linear-gradient(135deg,#F0302A,#FF6A3D);box-shadow:0 0 0 2px var(--bg-panel,#150506);white-space:nowrap;pointer-events:none}',

    '.amx-side-dot{position:absolute;top:-3px;right:-2px;width:9px;height:9px;border-radius:50%;background:#FF8A4C;box-shadow:0 0 0 2px var(--bg-panel,#150506);pointer-events:none;animation:amx-pulse 2s ease-out infinite}',

    '@keyframes amx-pulse{0%{box-shadow:0 0 0 2px var(--bg-panel,#150506),0 0 0 2px rgba(255,138,76,.7)}70%,100%{box-shadow:0 0 0 2px var(--bg-panel,#150506),0 0 0 8px rgba(255,138,76,0)}}',

    '.amx-side.amx-seen{background:rgba(255,74,51,.07);box-shadow:inset 0 0 0 1px rgba(255,106,61,.45)}',

    '.amx-side.amx-seen .amx-side-dot{display:none}',

    '.amx-tip{position:fixed;z-index:10001;pointer-events:none;padding:7px 10px;border-radius:9px;background:var(--bg-panel,#150506);color:var(--text,#fce8e8);border:1px solid rgba(255,106,61,.5);',

    'font:600 11.5px/1.2 Inter,system-ui,-apple-system,sans-serif;white-space:nowrap;box-shadow:0 10px 28px -10px rgba(0,0,0,.7)}',

    '.amx-tip b{font-weight:800;color:#FF7A45}',

    /* popup — HP: sheet dari bawah */

    '.amx-root{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;text-align:left}',

    '.amx-root *,.amx-root *::before,.amx-root *::after{box-sizing:border-box}',

    '.amx-backdrop{position:absolute;inset:0;touch-action:none;background:rgba(0,0,0,.6);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .22s ease}',

    '.amx-dialog{position:relative;width:100%;max-height:88vh;max-height:88dvh;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;',

    'display:grid;grid-template-columns:116px minmax(0,1fr);grid-template-areas:"head head" "media points" "price price" "actions actions";column-gap:14px;',

    'padding:24px 18px calc(16px + env(safe-area-inset-bottom,0px));',

    'background:radial-gradient(120% 70% at 100% 0%,rgba(255,74,51,.17),rgba(255,74,51,0) 55%),var(--bg-panel,#150506);color:var(--text,#fce8e8);',

    'border:1px solid rgba(255,106,61,.4);border-bottom:0;border-radius:20px 20px 0 0;box-shadow:0 -18px 50px -12px rgba(0,0,0,.65);',

    'transform:translateY(28px);opacity:0;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s ease;outline:none}',

    '.amx-root.amx-in .amx-backdrop{opacity:1}',

    '.amx-root.amx-in .amx-dialog{transform:none;opacity:1}',

    '.amx-grab{position:absolute;top:8px;left:50%;width:38px;height:4px;margin-left:-19px;border-radius:4px;background:var(--text-dim,#9c7676);opacity:.45}',

    '.amx-x{position:absolute;top:8px;right:8px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:0;border-radius:12px;padding:0;margin:0;',

    'background:transparent;color:var(--text-muted,#d0a8a8);cursor:pointer;z-index:2;-webkit-tap-highlight-color:transparent}',

    '.amx-x:hover{background:var(--bg-elev,#1f0a0b);color:var(--text,#fce8e8)}',

    '.amx-x:focus-visible,.amx-later:focus-visible,.amx-cta:focus-visible{outline:2px solid #FF8A4C;outline-offset:2px}',

    '.amx-body{display:contents}',

    '.amx-head{grid-area:head;padding-right:40px;margin-bottom:14px;min-width:0}',

    '.amx-eyebrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 9px;font-size:12px;font-weight:600;line-height:1.2;color:var(--text-muted,#d0a8a8)}',

    '.amx-badge{display:inline-flex;align-items:center;gap:4px;padding:5px 9px 5px 8px;border-radius:999px;background:linear-gradient(135deg,#F0302A,#FF6A3D);color:#fff;',

    'font-size:10.5px;font-weight:800;letter-spacing:.12em;line-height:1;box-shadow:0 4px 14px -4px rgba(255,74,51,.75)}',

    '.amx-title{margin:0;font-size:22px;line-height:1.2;font-weight:800;letter-spacing:-.01em;color:var(--text,#fce8e8)}',

    '.amx-grad{background:linear-gradient(135deg,#FF3B30,#FF8A4C);-webkit-background-clip:text;background-clip:text;color:transparent}',

    '.amx-desc{margin:8px 0 0;font-size:14px;line-height:1.5;color:var(--text-muted,#d0a8a8)}',

    '.amx-media{grid-area:media;position:relative;align-self:start;width:100%;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#0b0203;',

    'box-shadow:0 0 0 1px rgba(255,106,61,.5),0 10px 28px -12px rgba(255,74,51,.6)}',

    '@supports not (aspect-ratio:1){.amx-media{height:0;padding-top:177.78%}}',

    '.amx-media video,.amx-media img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block}',

    '.amx-tag{position:absolute;left:6px;top:6px;padding:4px 7px;border-radius:999px;background:rgba(0,0,0,.62);color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.03em;line-height:1}',

    '.amx-points{grid-area:points;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px;align-self:center;min-width:0}',

    '.amx-points li{display:flex;gap:8px;align-items:flex-start;margin:0;font-size:13.5px;line-height:1.4;color:var(--text,#fce8e8)}',

    '.amx-points svg{flex:0 0 18px;width:18px;height:18px;margin-top:1px}',

    '.amx-price{grid-area:price;margin:16px 0 0;padding:11px 13px;border-radius:12px;background:rgba(255,74,51,.08);border:1px solid rgba(255,106,61,.3);font-size:13.5px;line-height:1.4;color:var(--text,#fce8e8)}',

    '.amx-price b{font-weight:800;color:#FF7A45}',

    '.amx-price small{display:block;margin-top:2px;font-size:11.5px;color:var(--text-dim,#9c7676)}',

    '.amx-price s{color:var(--text-dim,#9c7676);font-weight:600}',

    '.amx-kode{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;margin:8px 0 0;min-height:44px;padding:0 12px;border-radius:10px;cursor:pointer;',

    'background:rgba(0,0,0,.25);border:1.5px dashed #FF7A45;color:#fff;font:800 15px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.08em}',

    '.amx-kode span{font:700 12px/1 Inter,system-ui,-apple-system,sans-serif;letter-spacing:0;color:#FF7A45}',

    '.amx-actions{grid-area:actions;display:flex;gap:10px;margin-top:14px}',

    '.amx-cta{flex:1 1 auto;min-height:48px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 16px;border-radius:12px;',

    'background:linear-gradient(135deg,#E8283A 0%,#FF3B30 50%,#FF6A3D 100%);color:#fff;font-size:15px;font-weight:700;line-height:1.1;text-decoration:none;',

    'box-shadow:0 10px 24px -10px rgba(255,59,48,.85);text-shadow:0 1px 1px rgba(90,10,0,.25);-webkit-tap-highlight-color:transparent}',

    '.amx-cta:hover{filter:brightness(1.06)}',

    '.amx-later{flex:0 0 auto;min-height:48px;padding:0 16px;margin:0;border-radius:12px;background:transparent;border:1px solid var(--border-strong,rgba(18,115,235,.42));',

    'color:var(--text-muted,#d0a8a8);font-family:inherit;font-size:14px;font-weight:600;line-height:1.1;cursor:pointer;-webkit-tap-highlight-color:transparent}',

    '.amx-later:hover{background:var(--bg-elev,#1f0a0b);color:var(--text,#fce8e8)}',

    '.theme-light .amx-dialog{box-shadow:0 -18px 50px -12px rgba(15,23,42,.35)}',

    '.theme-light .amx-backdrop{background:rgba(15,23,42,.45)}',

    /* desktop/tablet: kartu tengah dua kolom */

    '@media (min-width:640px){',

    '.amx-root{align-items:center;padding:24px}',

    '.amx-dialog{width:100%;max-width:720px;max-height:calc(100vh - 48px);max-height:calc(100dvh - 48px);border-radius:20px;border-bottom:1px solid rgba(255,106,61,.4);',

    'grid-template-columns:236px minmax(0,1fr);grid-template-areas:"media body";column-gap:28px;',

    'padding:26px;box-shadow:0 30px 80px -20px rgba(0,0,0,.75);transform:translateY(10px) scale(.98)}',

    '.amx-body{grid-area:body;display:flex;flex-direction:column;justify-content:center;min-width:0}',

    '.amx-grab{display:none}',

    '.amx-head{margin-bottom:18px}',

    '.amx-price{margin-top:18px}',

    '.amx-actions{margin-top:16px}',

    '.amx-title{font-size:26px}',

    '.amx-desc{font-size:14.5px}',

    '.amx-points{align-self:stretch;gap:10px}',

    '.amx-points li{font-size:14px}',

    '.amx-tag{left:8px;top:8px;font-size:10.5px;padding:5px 8px}',

    '}',

    /* layar pendek (HP landscape, HP kecil): tombol menempel di bawah supaya CTA selalu terlihat */

    '@media (max-height:600px){',

    '.amx-actions{position:sticky;bottom:0;z-index:1;margin-top:10px;padding:10px 0 2px;background:var(--bg-panel,#150506);box-shadow:0 -16px 16px -8px var(--bg-panel,#150506)}',

    '}',

    '@media (min-width:640px) and (max-height:600px){',

    '.amx-dialog{grid-template-columns:150px minmax(0,1fr);column-gap:20px;padding:18px 22px}',

    '.amx-title{font-size:22px}',

    '.amx-head{margin-bottom:12px}',

    '.amx-price{margin-top:12px}',

    '}',

    '@media (prefers-reduced-motion:reduce){',

    '.amx-side-dot{animation:none}',

    '.amx-side,.amx-backdrop,.amx-dialog{transition:none}',

    '.amx-dialog{transform:none}',

    '.amx-side:hover{transform:none}',

    '}'

  ].join('');



  function ensureCss() {

    if (document.getElementById('amx-css')) return;

    var st = document.createElement('style');

    st.id = 'amx-css';

    st.textContent = CSS;

    (document.head || document.documentElement).appendChild(st);

  }



  /* ───── deteksi UI studio (hanya ada setelah login) ───── */

  function findSidebar() {

    var list = document.querySelectorAll('aside');

    for (var i = 0; i < list.length; i++) {

      if (list[i].querySelector('button.side-btn')) return list[i];

    }

    return null;

  }

  function appReady() {

    var aside = findSidebar();

    return !!(aside && aside.offsetParent !== null);

  }

  /* Ada modal aplikasi lain yang sedang terbuka? (overlay fixed inset-0) */

  function otherModalOpen() {

    var n = document.querySelectorAll('.fixed.inset-0');

    for (var i = 0; i < n.length; i++) {

      if (!n[i].closest || n[i].closest('.amx-root')) continue;

      if (n[i].offsetWidth > 0 || n[i].offsetHeight > 0) return true;

    }

    return false;

  }



  /* ───── MENU SIDEBAR ───── */

  var tipEl = null;

  function hideTip() { if (tipEl && tipEl.parentNode) tipEl.parentNode.removeChild(tipEl); tipEl = null; }

  function showTip(anchor) {

    hideTip();

    if (!mq('(hover: hover)')) return;

    var r = anchor.getBoundingClientRect();

    tipEl = el('div', 'amx-tip', '<b>SJ Vidio</b> &middot; Tools baru');

    tipEl.setAttribute('aria-hidden', 'true');

    document.body.appendChild(tipEl);

    var h = tipEl.offsetHeight || 28;

    tipEl.style.left = Math.round(r.right + 12) + 'px';

    tipEl.style.top = Math.round(r.top + r.height / 2 - h / 2) + 'px';

  }



  function buildSideItem() {

    var a = el('a', 'amx-side');

    a.href = URL_MENU;

    a.target = '_blank';

    a.rel = 'noopener';

    a.setAttribute('data-amx', 'menu');

    a.setAttribute('aria-label', 'Beli SJ Vidio, tools baru (buka di tab baru)');

    a.innerHTML = LOGO_SVG + '<span class="amx-side-dot" aria-hidden="true"></span><span class="amx-side-badge" aria-hidden="true">BARU</span>';

    if (lsGet(KEY_SEEN) === '1') a.className += ' amx-seen';

    a.addEventListener('click', function () {

      lsSet(KEY_SEEN, '1');

      if (a.className.indexOf('amx-seen') < 0) a.className += ' amx-seen';

      hideTip();

    });

    a.addEventListener('mouseenter', function () { showTip(a); });

    a.addEventListener('mouseleave', hideTip);

    a.addEventListener('focus', function () { showTip(a); });

    a.addEventListener('blur', hideTip);

    return a;

  }



  /* Sisipkan setelah daftar mode (sebelum garis pemisah pertama) — tetap

     terlihat di HP tanpa menggeser ikon mode utama. */

  function ensureSideItem() {

    var aside = findSidebar();

    if (!aside) return;

    if (aside.querySelector('[data-amx="menu"]')) return;

    var anchor = null, kids = aside.children;

    for (var i = 0; i < kids.length; i++) {

      var c = kids[i];

      if (c.tagName === 'DIV' && /(^|\s)h-px(\s|$)/.test(c.className || '')) { anchor = c; break; }

    }

    if (!anchor) {

      for (var j = 0; j < kids.length; j++) {

        if (kids[j].tagName === 'DIV' && /(^|\s)flex-1(\s|$)/.test(kids[j].className || '')) { anchor = kids[j]; break; }

      }

    }

    var item = buildSideItem();

    if (anchor) aside.insertBefore(item, anchor); else aside.appendChild(item);

  }



  /* ───── POPUP ───── */

  var root = null, lastFocus = null, prevOverflow = null, onKey = null, onFocusIn = null, closing = false;



  function useVideo() {

    if (reducedMotion()) return false;

    try {

      var c = navigator.connection;

      if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return false;

    } catch (e) {}

    return true;

  }



  function buildPopup() {

    var poster = BASE + 'contoh-hasil.jpg?v=' + VER;

    var clip = BASE + 'contoh-hasil.mp4?v=' + VER;

    var r = el('div', 'amx-root');

    r.setAttribute('data-amx', 'popup');

    var bd = el('div', 'amx-backdrop');

    bd.setAttribute('aria-hidden', 'true');

    var d = el('div', 'amx-dialog');

    d.setAttribute('role', 'dialog');

    d.setAttribute('aria-modal', 'true');

    d.setAttribute('aria-labelledby', 'amx-title');

    d.setAttribute('aria-describedby', 'amx-desc');

    d.setAttribute('tabindex', '-1');

    d.innerHTML =

      '<span class="amx-grab" aria-hidden="true"></span>' +

      '<button type="button" class="amx-x" data-amx-close aria-label="Tutup">' + X_SVG + '</button>' +

      '<div class="amx-media"><span class="amx-tag">Contoh hasil</span></div>' +

      '<div class="amx-body">' +

        '<div class="amx-head">' +

          '<p class="amx-eyebrow"><span class="amx-badge">' + SPARK_SVG + 'BARU</span><span>dari tim SJ Desain</span></p>' +

          '<h2 class="amx-title" id="amx-title">Tools baru: <span class="amx-grad">SJ Vidio</span></h2>' +

          '<p class="amx-desc" id="amx-desc">Video ngomong biasa jadi motion graphics otomatis: caption, b-roll, animasi, transisi, musik — tinggal download MP4.</p>' +

        '</div>' +

        '<ul class="amx-points">' +

          '<li>' + CHECK_SVG + '<span>Upload video ngomong atau cukup isi info produk</span></li>' +

          '<li>' + CHECK_SVG + '<span>29 gaya siap pakai, AI yang menyusun</span></li>' +

          '<li>' + CHECK_SVG + '<span>Bisa di HP &amp; laptop, tanpa skill editing</span></li>' +

        '</ul>' +

        '<div class="amx-price">Khusus member SJ Desain: <s>Rp99.000</s> <b>Rp49.500</b> &middot; sekali bayar' +

          '<small>Pakai kode voucher ini saat checkout (ketuk untuk menyalin):</small>' +

          '<button type="button" class="amx-kode" data-amx-kode="COMINGSOON" aria-label="Salin kode voucher COMINGSOON">COMINGSOON<span>Salin</span></button></div>' +

        '<div class="amx-actions">' +

          '<button type="button" class="amx-later" data-amx-close>Nanti saja</button>' +

          '<a class="amx-cta" href="' + URL_POPUP + '" target="_blank" rel="noopener">Lihat SJ Vidio' + ARROW_SVG + '</a>' +

        '</div>' +

      '</div>';



    /* 25 Okt: kode voucher member — ketuk untuk menyalin */

    var kode = d.querySelector('[data-amx-kode]');

    if (kode) kode.onclick = function () {

      var k = kode.getAttribute('data-amx-kode'), lbl = kode.querySelector('span');

      function ok() { lbl.textContent = 'Tersalin ✓'; setTimeout(function () { lbl.textContent = 'Salin'; }, 2500); }

      function cadangan() {

        try { var t = document.createElement('textarea'); t.value = k; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';

          document.body.appendChild(t); t.select(); var r = document.execCommand('copy'); document.body.removeChild(t); if (r) return ok(); } catch (e) {}

        window.prompt('Salin kode voucher ini:', k);

      }

      try { navigator.clipboard.writeText(k).then(ok, cadangan); } catch (e) { cadangan(); }

    };



    /* Visual: dibuat saat popup dibuka (lazy). Video hanya bila tidak

       reduced-motion / hemat data; selain itu cukup poster. */

    var media = d.querySelector('.amx-media');

    var tag = media.firstChild;

    if (useVideo()) {

      var v = document.createElement('video');

      v.muted = true;

      v.defaultMuted = true;

      v.loop = true;

      v.autoplay = true;

      v.playsInline = true;

      v.setAttribute('muted', '');

      v.setAttribute('playsinline', '');

      v.setAttribute('webkit-playsinline', '');

      v.setAttribute('preload', 'auto');

      v.setAttribute('poster', poster);

      v.setAttribute('aria-label', 'Contoh hasil video SJ Vidio');

      v.setAttribute('disablepictureinpicture', '');

      v.src = clip;

      media.insertBefore(v, tag);

    } else {

      var im = document.createElement('img');

      im.src = poster;

      im.alt = 'Contoh hasil video SJ Vidio';

      im.loading = 'lazy';

      im.decoding = 'async';

      media.insertBefore(im, tag);

    }



    r.appendChild(bd);

    r.appendChild(d);

    bd.addEventListener('click', closePopup);

    var closers = d.querySelectorAll('[data-amx-close]');

    for (var i = 0; i < closers.length; i++) closers[i].addEventListener('click', closePopup);

    d.querySelector('.amx-cta').addEventListener('click', function () {

      /* tab baru terbuka → popup ditutup supaya saat kembali tidak menghalangi */

      setTimeout(closePopup, 60);

    });

    return r;

  }



  function focusables() {

    if (!root) return [];

    var d = root.querySelector('.amx-dialog');

    var n = d.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');

    var out = [];

    for (var i = 0; i < n.length; i++) if (n[i].offsetWidth || n[i].offsetHeight) out.push(n[i]);

    return out;

  }



  function openPopup() {

    if (root) return;

    ensureCss();

    markShown();

    root = buildPopup();

    lastFocus = document.activeElement;

    document.body.appendChild(root);

    try {

      prevOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = 'hidden';

    } catch (e) {}

    var dialog = root.querySelector('.amx-dialog');

    var vid = root.querySelector('video');

    if (vid) {

      try { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}

    }

    onKey = function (e) {

      if (!root) return;

      if (e.key === 'Escape' || e.key === 'Esc') {

        e.preventDefault(); e.stopPropagation();

        closePopup();

        return;

      }

      if (e.key === 'Tab') {

        var f = focusables();

        if (!f.length) { e.preventDefault(); dialog.focus(); return; }

        var first = f[0], last = f[f.length - 1], a = document.activeElement;

        if (e.shiftKey && (a === first || a === dialog || !dialog.contains(a))) { e.preventDefault(); last.focus(); }

        else if (!e.shiftKey && (a === last || !dialog.contains(a))) { e.preventDefault(); first.focus(); }

        e.stopPropagation();

      }

    };

    onFocusIn = function (e) {

      if (root && !root.contains(e.target)) { try { dialog.focus(); } catch (er) {} }

    };

    document.addEventListener('keydown', onKey, true);

    document.addEventListener('focusin', onFocusIn, true);

    /* paksa reflow lalu animasikan masuk */

    void root.offsetWidth;

    root.className += ' amx-in';

    try { dialog.focus({ preventScroll: true }); } catch (e) { try { dialog.focus(); } catch (er) {} }

  }



  function closePopup() {

    if (!root || closing) return;

    closing = true;

    var r = root;

    try { document.removeEventListener('keydown', onKey, true); } catch (e) {}

    try { document.removeEventListener('focusin', onFocusIn, true); } catch (e) {}

    try { document.documentElement.style.overflow = prevOverflow || ''; } catch (e) {}

    var vid = r.querySelector('video');

    if (vid) {

      try { vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) {}

    }

    var done = function () {

      if (r.parentNode) r.parentNode.removeChild(r);

      root = null;

      closing = false;

    };

    r.className = r.className.replace(/\s*amx-in/g, '');

    if (reducedMotion()) done(); else setTimeout(done, 240);

    try {

      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });

    } catch (e) {}

    lastFocus = null;

  }



  /* ───── penjadwal popup ───── */

  var scheduled = false, tries = 0;

  function attemptPopup() {

    try {

      if (CFG.amPromoPopup === false) return;

      if (!isAppRoute() || shownToday()) return;

      if (!appReady()) { scheduled = false; return; }   /* mis. logout → dijadwalkan ulang saat masuk lagi */

      if (document.hidden) {

        var onVis = function () {

          if (!document.hidden) { document.removeEventListener('visibilitychange', onVis); setTimeout(attemptPopup, DELAY_MS); }

        };

        document.addEventListener('visibilitychange', onVis);

        return;

      }

      if (otherModalOpen()) {

        if (++tries < 120) setTimeout(attemptPopup, 1000);

        return;

      }

      openPopup();

    } catch (e) {}

  }

  function maybeSchedule() {

    if (scheduled || CFG.amPromoPopup === false) return;

    if (!appReady() || shownToday()) return;

    scheduled = true;

    setTimeout(attemptPopup, DELAY_MS);

  }



  /* ───── jalan ───── */

  var raf = 0;

  function tick() {

    raf = 0;

    try {

      if (!isAppRoute()) return;

      ensureCss();

      ensureSideItem();

      if (tipEl && !document.querySelector('[data-amx="menu"]')) hideTip();

      maybeSchedule();

    } catch (e) {}

  }

  function queue() {

    if (raf) return;

    raf = window.requestAnimationFrame ? window.requestAnimationFrame(tick) : setTimeout(tick, 16);

  }



  function start() {

    tick();

    try {

      var target = document.getElementById('root') || document.body;

      new MutationObserver(queue).observe(target, { childList: true, subtree: true });

    } catch (e) {

      setInterval(tick, 1500);

    }

    window.addEventListener('hashchange', queue);

    window.addEventListener('popstate', queue);

  }



  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);

  else start();

})();

