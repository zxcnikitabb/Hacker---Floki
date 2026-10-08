/* =========================================================
   HACKER — FLOKI :: OSINT TOOLS v3
   Username Sweep (пока только он)
   ========================================================= */
(() => {
  const modal = document.getElementById('toolModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody  = document.getElementById('modalBody');

  function openModal(title){
    modalTitle.textContent = '// ' + title;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function esc(s){ return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function extLink(name, url, desc){
    return `  <span class="key">·</span> <a class="val" href="${url}" target="_blank" rel="noopener" style="text-decoration:none">${name}</a> <span style="color:var(--dim);font-size:11px">— ${desc}</span>\n`;
  }

  // USERNAME SWEEP
  function toolSweep(){
    openModal('USERNAME SWEEP :: 20+ platforms');

    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="sweepUser" type="text" placeholder="username (без @)" autocomplete="off">
        <button id="sweepRun">▶ SWEEP</button>
      </div>
      <div id="sweepOut" class="tool-output">> введи username для проверки</div>
    `;

    const input = document.getElementById('sweepUser');
    const btn   = document.getElementById('sweepRun');
    const out   = document.getElementById('sweepOut');

    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    const platforms = [
      { name:'GitHub',     url:u=>`https://github.com/${u}`,                 api:u=>`https://api.github.com/users/${u}` },
      { name:'Reddit',     url:u=>`https://reddit.com/user/${u}`,            api:u=>`https://www.reddit.com/user/${u}/about.json` },
      { name:'GitLab',     url:u=>`https://gitlab.com/${u}`,                 api:u=>`https://gitlab.com/api/v4/users?username=${u}` },
      { name:'Codeberg',   url:u=>`https://codeberg.org/${u}`,               api:u=>`https://codeberg.org/api/v1/users/${u}` },
      { name:'Hacker News',url:u=>`https://news.ycombinator.com/user?id=${u}`,api:u=>`https://hacker-news.firebaseio.com/v0/user/${u}.json` },
      { name:'Telegram',   url:u=>`https://t.me/${u}` },
      { name:'Twitter/X',  url:u=>`https://x.com/${u}` },
      { name:'Instagram',  url:u=>`https://instagram.com/${u}` },
      { name:'TikTok',     url:u=>`https://tiktok.com/@${u}` },
      { name:'YouTube',    url:u=>`https://youtube.com/@${u}` },
      { name:'Twitch',     url:u=>`https://twitch.tv/${u}` },
      { name:'Steam',      url:u=>`https://steamcommunity.com/id/${u}` },
      { name:'Pinterest',  url:u=>`https://pinterest.com/${u}` },
      { name:'Medium',     url:u=>`https://medium.com/@${u}` },
      { name:'Dev.to',     url:u=>`https://dev.to/${u}` },
      { name:'Keybase',    url:u=>`https://keybase.io/${u}` },
      { name:'SoundCloud', url:u=>`https://soundcloud.com/${u}` },
      { name:'Spotify',    url:u=>`https://open.spotify.com/user/${u}` },
      { name:'Behance',    url:u=>`https://behance.net/${u}` },
      { name:'Dribbble',   url:u=>`https://dribbble.com/${u}` },
      { name:'VK',         url:u=>`https://vk.com/${u}` },
      { name:'Flickr',     url:u=>`https://flickr.com/people/${u}` },
    ];

    btn.addEventListener('click', async () => {
      const u = input.value.trim().replace(/^@/, '');
      if (!u) return;

      out.innerHTML = `<span class="tool-loading">> sweep ${esc(u)}</span>`;
      const results = [];
      const checkable = platforms.filter(p => p.api);
      const linksOnly = platforms.filter(p => !p.api);

      const checks = checkable.map(async p => {
        try {
          const r = await fetch(p.api(u));
          let found = false;
          let extra = '';

          if (p.name === 'GitHub'){
            if (r.ok){
              const d = await r.json();
              found = true;
              extra = `${d.name || ''} · ${d.public_repos} repos`;
            }
          } else if (p.name === 'Reddit'){
            if (r.ok){
              const d = await r.json();
              if (d.data && !d.data.is_suspended){
                found = true;
                extra = `karma: ${d.data.total_karma}`;
              }
            }
          } else if (p.name === 'GitLab'){
            if (r.ok){
              const d = await r.json();
              if (Array.isArray(d) && d.length > 0){
                found = true;
                extra = d[0].name || '';
              }
            }
          } else if (p.name === 'Codeberg'){
            if (r.ok){
              const d = await r.json();
              found = true;
              extra = d.full_name || d.login || '';
            }
          } else if (p.name === 'Hacker News'){
            if (r.ok){
              const d = await r.json();
              if (d && d.id){
                found = true;
                extra = `karma: ${d.karma}`;
              }
            }
          }
          results.push({ ...p, found, extra });
        } catch(e){
          results.push({ ...p, found: false, extra: '' });
        }
      });

      await Promise.all(checks);

      let html = `<span class="ok">> результаты для "${esc(u)}"</span>\n`;
      const foundCount = results.filter(r => r.found).length;
      html += `<span class="ok">> найдено: ${foundCount} / ${checkable.length} (по API)</span>\n\n`;
      html += `<div class="social-list">`;

      results.filter(r => r.found).forEach(r => {
        html += `<div class="social-item found">
          <span class="dot-ind"></span>
          <span style="flex:1"><a href="${r.url(u)}" target="_blank" rel="noopener">${r.name}</a>
          ${r.extra ? `<span style="color:var(--dim);font-size:11px"> · ${esc(r.extra)}</span>` : ''}</span>
          <span style="font-size:10px;color:#27c93f">FOUND</span>
        </div>`;
      });

      results.filter(r => !r.found).forEach(r => {
        html += `<div class="social-item notfound">
          <span class="dot-ind"></span>
          <span style="flex:1">${r.name}</span>
          <span style="font-size:10px;color:var(--dim)">N/A</span>
        </div>`;
      });

      html += `</div>\n\n<span class="ok">> ссылки для ручной проверки (${linksOnly.length})</span>\n`;
      linksOnly.forEach(p => {
        html += extLink(p.name, p.url(u), 'открыть');
      });

      out.innerHTML = html;
    });
  }
// DOMAIN INFO
function toolDomain(){
  openModal('DOMAIN INFO :: rdap + dns');

  modalBody.innerHTML = `
    <div class="tool-input-row">
      <input id="domTarget" type="text" placeholder="example.com" autocomplete="off">
      <button id="domRun">▶ ANALYZE</button>
    </div>
    <div id="domOut" class="tool-output">> введи домен для анализа</div>
  `;

  const input = document.getElementById('domTarget');
  const btn   = document.getElementById('domRun');
  const out   = document.getElementById('domOut');

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  btn.addEventListener('click', async () => {
    const domain = input.value.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
    if (!domain) return;

    out.innerHTML = '<span class="tool-loading">> анализ домена</span>';
    let html = `<span class="ok">> DOMAIN: ${esc(domain)}</span>\n\n`;

    try {
      const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`);
      if (r.ok){
        const d = await r.json();
        const events = d.events || [];
        const reg = events.find(e => e.eventAction === 'registration');
        const exp = events.find(e => e.eventAction === 'expiration');
        const upd = events.find(e => e.eventAction === 'last changed');

        if (reg){
          const regDate = new Date(reg.eventDate);
          const ageDays = Math.floor((Date.now() - regDate.getTime()) / 86400000);
          const ageYears = (ageDays / 365).toFixed(1);
          html += `<span class="key">  registered:</span> <span class="val">${reg.eventDate} (${ageDays} дней / ${ageYears} лет)</span>\n`;
        }
        if (exp){
          const expDate = new Date(exp.eventDate);
          const daysLeft = Math.floor((expDate.getTime() - Date.now()) / 86400000);
          html += `<span class="key">  expires:</span> <span class="val">${exp.eventDate} (${daysLeft} дней)</span>\n`;
        }
        if (upd) html += `<span class="key">  updated:</span> <span class="val">${upd.eventDate}</span>\n`;
        if (d.status) html += `<span class="key">  status:</span> <span class="val">${d.status.join(', ')}</span>\n`;

        const registrar = (d.entities || []).find(e => (e.roles || []).includes('registrar'));
        if (registrar && registrar.vcardArray){
          const fn = registrar.vcardArray[1].find(v => v[0] === 'fn');
          if (fn) html += `<span class="key">  registrar:</span> <span class="val">${esc(fn[3])}</span>\n`;
        }

        if (d.nameservers && d.nameservers.length){
          html += '\n<span class="ok">> nameservers</span>\n';
          d.nameservers.forEach(ns => html += `  <span class="val">${esc(ns.ldhName)}</span>\n`);
        }
      } else {
        html += `<span class="err">> RDAP: не найдено (${r.status})</span>\n`;
      }
    } catch(e){
      html += `<span class="err">> RDAP error: ${esc(e.message)}</span>\n`;
    }

    const dnsTypes = ['A','AAAA','MX','NS','TXT','CNAME'];
    html += '\n<span class="ok">> DNS records</span>\n';
    for (const t of dnsTypes){
      try {
        const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${t}`);
        const d = await r.json();
        const answers = (d.Answer || []).map(a => a.data);
        if (answers.length){
          html += `  <span class="key">${t}:</span>\n`;
          answers.slice(0, 5).forEach(a => html += `    <span class="val">${esc(a)}</span>\n`);
        }
      } catch(e){}
    }

    html += '\n<span class="ok">> external lookups</span>\n';
    html += extLink('Whois',      `https://who.is/whois/${domain}`, 'классический whois');
    html += extLink('crt.sh',     `https://crt.sh/?q=${domain}`, 'SSL сертификаты');
    html += extLink('URLScan',    `https://urlscan.io/domain/${domain}`, 'сканы');
    html += extLink('VirusTotal', `https://www.virustotal.com/gui/domain/${domain}`, 'репутация');
    html += extLink('Wayback',    `https://web.archive.org/web/*/${domain}`, 'архив');
    html += extLink('SecurityTrails', `https://securitytrails.com/domain/${domain}/dns`, 'история DNS');

    out.innerHTML = html;
  });
}
// REVERSE IMAGE
function toolReverse(){
  openModal('REVERSE IMAGE :: search');

  modalBody.innerHTML = `
    <div class="tool-input-row">
      <input id="imgUrl" type="url" placeholder="https://example.com/image.jpg" autocomplete="off">
      <button id="imgRun">▶ SEARCH</button>
    </div>
    <div id="imgPreview" style="margin-bottom:16px"></div>
    <div id="imgOut" class="tool-output">> введи URL картинки</div>
  `;

  const input   = document.getElementById('imgUrl');
  const btn     = document.getElementById('imgRun');
  const out     = document.getElementById('imgOut');
  const preview = document.getElementById('imgPreview');

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  btn.addEventListener('click', () => {
    const url = input.value.trim();
    if (!url) return;

    preview.innerHTML = `<img src="${esc(url)}" style="max-width:100%;max-height:200px;border:1px solid rgba(0,255,156,.3);border-radius:6px" onerror="this.style.display='none'">`;

    const encoded = encodeURIComponent(url);
    let html = `<span class="ok">> IMAGE: ${esc(url)}</span>\n\n`;
    html += `<span class="ok">> поиск по картинке</span>\n`;
    html += extLink('Google Lens',   `https://lens.google.com/uploadbyurl?url=${encoded}`, 'самый точный');
    html += extLink('Yandex Images', `https://yandex.com/images/search?rpt=imageview&url=${encoded}`, 'лучший для СНГ');
    html += extLink('TinEye',        `https://tineye.com/search?url=${encoded}`, 'поиск дубликатов');
    html += extLink('Bing Visual',   `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&q=imgurl:${encoded}`, 'Bing');
    html += extLink('SauceNAO',      `https://saucenao.com/search.php?url=${encoded}`, 'аниме/арт');
    html += extLink('Karma Decay',   `https://karmadecay.com/search?q=${encoded}`, 'Reddit');
    html += extLink('PimEyes',       `https://pimeyes.com/en`, 'поиск по лицу (вставить вручную)');
    html += `\n<span style="color:var(--dim)">> тапни сервис — откроется в новой вкладке</span>`;

    out.innerHTML = html;
  });
}
// IP LOCATION
function toolIpLoc(){
  openModal('IP LOCATION :: geo');

  modalBody.innerHTML = `
    <div class="tool-input-row">
      <input id="iplTarget" type="text" placeholder="8.8.8.8 или пусто = мой IP" autocomplete="off">
      <button id="iplRun">▶ LOCATE</button>
    </div>
    <div id="iplOut" class="tool-output">> введи IP</div>
  `;

  const input = document.getElementById('iplTarget');
  const btn   = document.getElementById('iplRun');
  const out   = document.getElementById('iplOut');

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  btn.addEventListener('click', async () => {
    const ip = input.value.trim();
    out.innerHTML = '<span class="tool-loading">> получение локации</span>';

    try {
      const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : 'https://ipwho.is/';
      const r = await fetch(url);
      const d = await r.json();

      if (!d.success){
        out.innerHTML = `<span class="err">> ${esc(d.message || 'не удалось')}</span>`;
        return;
      }

      const flag = d.country_code
        ? `<img src="https://flagcdn.com/w40/${d.country_code.toLowerCase()}.png" style="vertical-align:middle;margin-left:6px;border:1px solid rgba(0,255,156,.3)">`
        : '';

      let html = `<span class="ok">> IP: ${esc(d.ip)} ${flag}</span>\n\n`;
      html += `<span class="key">  country:</span> <span class="val">${esc(d.country)} (${esc(d.country_code)})</span>\n`;
      html += `<span class="key">  region:</span> <span class="val">${esc(d.region || '—')}</span>\n`;
      html += `<span class="key">  city:</span> <span class="val">${esc(d.city || '—')}</span>\n`;
      html += `<span class="key">  postal:</span> <span class="val">${esc(d.postal || '—')}</span>\n`;
      html += `<span class="key">  lat:</span> <span class="val">${d.latitude}</span>\n`;
      html += `<span class="key">  lon:</span> <span class="val">${d.longitude}</span>\n`;
      html += `<span class="key">  timezone:</span> <span class="val">${esc(d.timezone?.id || '—')}</span>\n`;
      html += `<span class="key">  ASN:</span> <span class="val">${esc(d.connection?.asn || '—')}</span>\n`;
      html += `<span class="key">  ISP:</span> <span class="val">${esc(d.connection?.isp || '—')}</span>\n`;

      if (d.latitude && d.longitude){
        const mapUrl = `https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=10/${d.latitude}/${d.longitude}`;
        const gmapUrl = `https://www.google.com/maps?q=${d.latitude},${d.longitude}`;
        html += `\n<span class="ok">> карта</span>\n`;
        html += `  <span class="key">·</span> <a class="val" href="${mapUrl}" target="_blank" rel="noopener" style="text-decoration:none">OpenStreetMap</a>\n`;
        html += `  <span class="key">·</span> <a class="val" href="${gmapUrl}" target="_blank" rel="noopener" style="text-decoration:none">Google Maps</a>\n`;

        const staticMap = `https://staticmap.openstreetmap.de/staticmap.php?center=${d.latitude},${d.longitude}&zoom=8&size=600x300&maptype=mapnik&markers=${d.latitude},${d.longitude},red-pushpin`;
        html += `\n<img src="${staticMap}" style="width:100%;max-width:600px;border:1px solid rgba(0,255,156,.3);border-radius:6px;margin-top:10px" onerror="this.style.display='none'">\n`;
      }

      out.innerHTML = html;
    } catch(e){
      out.innerHTML = `<span class="err">> error: ${esc(e.message)}</span>`;
    }
  });
}
// JWT / BASE64 DECODER
function toolJwt(){
  openModal('JWT / BASE64 :: decoder');

  modalBody.innerHTML = `
    <div class="tool-input-row">
      <input id="jwtInput" type="text" placeholder="JWT или Base64 строка" autocomplete="off">
      <button id="jwtRun">▶ DECODE</button>
    </div>
    <div id="jwtOut" class="tool-output">> вставь JWT или Base64</div>
  `;

  const input = document.getElementById('jwtInput');
  const btn   = document.getElementById('jwtRun');
  const out   = document.getElementById('jwtOut');

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  // base64url → base64
  function b64urlToB64(s){
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return s;
  }

  function decodeB64(s){
    try {
      const bin = atob(b64urlToB64(s));
      // UTF-8 fix
      return decodeURIComponent(escape(bin));
    } catch(e){
      try { return atob(b64urlToB64(s)); } catch(_){ return null; }
    }
  }

  function prettyJson(str){
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch(_){ return str; }
  }

  btn.addEventListener('click', () => {
    const raw = input.value.trim();
    if (!raw) return;

    let html = '';
    const parts = raw.split('.');

    // === JWT? (3 части, base64url) ===
    if (parts.length === 3 && parts.every(p => /^[A-Za-z0-9_\-]+$/.test(p))){
      html += `<span class="ok">> JWT DETECTED</span>\n\n`;

      const header  = decodeB64(parts[0]);
      const payload = decodeB64(parts[1]);
      const sig     = parts[2];

      if (!header || !payload){
        html += `<span class="err">> не удалось раскодировать JWT</span>`;
        out.innerHTML = html;
        return;
      }

      // header
      html += `<span class="ok">> HEADER</span>\n`;
      html += `<span class="val">${esc(prettyJson(header))}</span>\n\n`;

      // payload
      html += `<span class="ok">> PAYLOAD</span>\n`;
      html += `<span class="val">${esc(prettyJson(payload))}</span>\n\n`;

      // signature
      html += `<span class="ok">> SIGNATURE</span>\n`;
      html += `<span style="color:var(--dim)">${esc(sig)} (не раскодируется — это хеш)</span>\n\n`;

      // доп. анализ
      html += `<span class="ok">> ANALYSIS</span>\n`;
      try {
        const h = JSON.parse(header);
        const p = JSON.parse(payload);

        if (h.alg) html += `<span class="key">  algorithm:</span> <span class="val">${esc(h.alg)}</span>\n`;
        if (h.typ) html += `<span class="key">  type:</span> <span class="val">${esc(h.typ)}</span>\n`;

        if (h.alg === 'none'){
          html += `<span class="err">  ⚠️ ALGORITHM NONE — токен не подписан! Уязвимость.</span>\n`;
        }

        if (p.exp){
          const expDate = new Date(p.exp * 1000);
          const now = new Date();
          const expired = expDate < now;
          html += `<span class="key">  expires:</span> <span class="val">${expDate.toLocaleString('ru-RU')}</span>`;
          html += expired
            ? ` <span class="err">[ИСТЁК]</span>\n`
            : ` <span class="ok">[активен]</span>\n`;
        }
        if (p.iat){
          html += `<span class="key">  issued at:</span> <span class="val">${new Date(p.iat * 1000).toLocaleString('ru-RU')}</span>\n`;
        }
        if (p.nbf){
          html += `<span class="key">  not before:</span> <span class="val">${new Date(p.nbf * 1000).toLocaleString('ru-RU')}</span>\n`;
        }
        if (p.iss)  html += `<span class="key">  issuer:</span> <span class="val">${esc(p.iss)}</span>\n`;
        if (p.sub)  html += `<span class="key">  subject:</span> <span class="val">${esc(p.sub)}</span>\n`;
        if (p.aud)  html += `<span class="key">  audience:</span> <span class="val">${esc(JSON.stringify(p.aud))}</span>\n`;
      } catch(_){}

      html += `\n<span class="ok">> external</span>\n`;
      html += extLink('jwt.io', `https://jwt.io/#debugger-io?token=${encodeURIComponent(raw)}`, 'онлайн-дебаггер');

      out.innerHTML = html;
      return;
    }

    // === Просто Base64 / Base64url ===
    if (/^[A-Za-z0-9+/=_\-\s]+$/.test(raw)){
      const decoded = decodeB64(raw.replace(/\s/g, ''));
      if (decoded !== null){
        html += `<span class="ok">> BASE64 DETECTED</span>\n\n`;
        html += `<span class="key">  length:</span> <span class="val">${raw.length} chars</span>\n`;
        html += `<span class="key">  type:</span> <span class="val">${/[_-]/.test(raw) ? 'base64url' : 'base64'}</span>\n\n`;
        html += `<span class="ok">> DECODED</span>\n`;
        html += `<span class="val">${esc(decoded)}</span>\n\n`;

        // если это JSON — красиво
        const pretty = prettyJson(decoded);
        if (pretty !== decoded){
          html += `<span class="ok">> AS JSON</span>\n`;
          html += `<span class="val">${esc(pretty)}</span>\n`;
        }

        out.innerHTML = html;
        return;
      }
    }

    // === HEX ===
    if (/^[0-9a-fA-F\s]+$/.test(raw) && raw.replace(/\s/g,'').length % 2 === 0){
      try {
        const hex = raw.replace(/\s/g,'');
        let str = '';
        for (let i = 0; i < hex.length; i += 2){
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        const utf8 = decodeURIComponent(escape(str));
        html += `<span class="ok">> HEX DETECTED</span>\n\n`;
        html += `<span class="ok">> DECODED</span>\n`;
        html += `<span class="val">${esc(utf8)}</span>\n`;
        out.innerHTML = html;
        return;
      } catch(_){}
    }

    // === URL-encoded ===
    if (/%[0-9a-fA-F]{2}/.test(raw)){
      try {
        const decoded = decodeURIComponent(raw);
        html += `<span class="ok">> URL-ENCODED DETECTED</span>\n\n`;
        html += `<span class="ok">> DECODED</span>\n`;
        html += `<span class="val">${esc(decoded)}</span>\n`;
        out.innerHTML = html;
        return;
      } catch(_){}
    }

    // Не распознали
    html += `<span class="err">> не удалось определить формат</span>\n\n`;
    html += `<span class="key">поддерживаются:</span>\n`;
    html += `  · JWT (три части через точку)\n`;
    html += `  · Base64 / Base64url\n`;
    html += `  · Hex (чётное кол-во символов 0-9,a-f)\n`;
    html += `  · URL-encoded (%XX)\n`;
    out.innerHTML = html;
  });
}
// GOOGLE DORK BUILDER
function toolDork(){
  openModal('GOOGLE DORK :: builder');

  modalBody.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="color:var(--dim);font-size:12px;letter-spacing:1px;margin-bottom:10px">> выбери dork-шаблон:</div>
      <div id="dorkList" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;padding-right:6px"></div>
    </div>
    <div class="tool-input-row">
      <input id="dorkTarget" type="text" placeholder="example.com или ключевое слово" autocomplete="off">
      <button id="dorkBuild">▶ BUILD</button>
    </div>
    <div id="dorkOut" class="tool-output">> введи домен и выбери шаблон</div>
  `;

  // Шаблоны dork-запросов
  const dorks = [
    { name:'🔓 Open Directories',      d:'site:{target} intitle:"index of"' },
    { name:'📄 PDF Documents',         d:'site:{target} filetype:pdf' },
    { name:'📊 Excel Files',           d:'site:{target} filetype:xls OR filetype:xlsx' },
    { name:'📝 Word Documents',        d:'site:{target} filetype:doc OR filetype:docx' },
    { name:'🗄 Database Dumps',        d:'site:{target} filetype:sql OR filetype:db' },
    { name:'⚙️ Config Files',          d:'site:{target} filetype:env OR filetype:config OR filetype:cfg' },
    { name:'🔑 Passwords',             d:'site:{target} intext:"password" filetype:txt' },
    { name:'🔐 Login Pages',           d:'site:{target} inurl:login OR inurl:admin OR inurl:signin' },
    { name:'📷 Open Webcams',          d:'inurl:"/view/index.shtml" OR intitle:"Live View / - AXIS"' },
    { name:'🚪 phpMyAdmin',            d:'site:{target} intitle:phpMyAdmin' },
    { name:'🗂 Git Repos',             d:'site:{target} inurl:".git" OR intitle:"Index of /.git"' },
    { name:'📡 Admin Panels',          d:'site:{target} intitle:"admin panel" OR inurl:admin' },
    { name:'🔍 Directory Listing',     d:'site:{target} intitle:"Index of /"' },
    { name:'💾 Backups',               d:'site:{target} filetype:bak OR filetype:backup OR filetype:old' },
    { name:'📧 Emails',                d:'site:{target} "@{target}"' },
    { name:'🌐 Subdomains',            d:'site:*.{target}' },
    { name:'🔗 API Endpoints',         d:'site:{target} inurl:api' },
    { name:'📁 Sensitive Files',       d:'site:{target} filetype:log OR filetype:txt' },
    { name:'🗝 SSH Keys',              d:'site:{target} filetype:pem OR filetype:key' },
    { name:'🧪 Test/Staging',          d:'site:{target} inurl:test OR inurl:staging OR inurl:dev' },
  ];

  const listEl = document.getElementById('dorkList');
  const input  = document.getElementById('dorkTarget');
  const btn    = document.getElementById('dorkBuild');
  const out    = document.getElementById('dorkOut');

  // Отрисовка списка dork'ов
  dorks.forEach((dk, i) => {
    const item = document.createElement('div');
    item.className = 'social-item';
    item.style.cursor = 'none';
    item.style.padding = '8px 12px';
    item.dataset.idx = i;
    item.innerHTML = `<span style="flex:1">${esc(dk.name)}</span><span style="font-size:10px;color:var(--dim)">CLICK</span>`;
    item.addEventListener('click', () => {
      // Снимаем выделение с других
      listEl.querySelectorAll('.social-item').forEach(x => x.classList.remove('found'));
      item.classList.add('found');
      listEl.dataset.selected = i;
    });
    listEl.appendChild(item);
  });

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  btn.addEventListener('click', () => {
    const target = input.value.trim();
    const selIdx = listEl.dataset.selected;

    if (selIdx === undefined){
      out.innerHTML = `<span class="err">> сначала выбери шаблон выше</span>`;
      return;
    }
    if (!target){
      out.innerHTML = `<span class="err">> введи домен или ключевое слово</span>`;
      return;
    }

    const dork = dorks[+selIdx];
    const query = dork.d.replace(/\{target\}/g, target);
    const encoded = encodeURIComponent(query);

    let html = `<span class="ok">> ${esc(dork.name)}</span>\n\n`;
    html += `<span class="key">  target:</span> <span class="val">${esc(target)}</span>\n`;
    html += `<span class="key">  dork:</span>\n`;
    html += `<span class="val">${esc(query)}</span>\n\n`;

    html += `<span class="ok">> открыть в поисковиках</span>\n`;
    html += extLink('Google',     `https://www.google.com/search?q=${encoded}`, 'основной');
    html += extLink('Bing',       `https://www.bing.com/search?q=${encoded}`, 'альтернатива');
    html += extLink('DuckDuckGo', `https://duckduckgo.com/?q=${encoded}`, 'без слежки');
    html += extLink('Yandex',     `https://yandex.com/search/?text=${encoded}`, 'для СНГ');

    html += `\n<span class="ok">> quick actions</span>\n`;
    html += `  <span class="key">·</span> <a class="val" href="javascript:void(0)" id="copyDork" style="text-decoration:none">Скопировать dork</a> <span style="color:var(--dim);font-size:11px">— в буфер обмена</span>\n`;
    html += `  <span class="key">·</span> <a class="val" href="javascript:void(0)" id="copyQuery" style="text-decoration:none">Скопировать query</a> <span style="color:var(--dim);font-size:11px">— без URL-кодирования</span>\n`;

    html += `\n<span style="color:var(--dim);font-size:11px">⚠️ Используй легально. Dorking по чужим сайтам без разрешения — нарушение закона.</span>`;

    out.innerHTML = html;

    // Кнопки копирования
    document.getElementById('copyDork')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(query).then(() => {
        const el = document.getElementById('copyDork');
        if (el) el.textContent = 'Скопировано ✓';
      });
    });
    document.getElementById('copyQuery')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(encoded).then(() => {
        const el = document.getElementById('copyQuery');
        if (el) el.textContent = 'Скопировано ✓';
      });
    });
  });
}

  // ПОДКЛЮЧЕНИЕ
const handlers = {
  sweep: toolSweep,
  domain: toolDomain,
   reverse: toolReverse, 
   iploc: toolIpLoc,
   jwt: toolJwt,
};

  document.querySelectorAll('.tool-card').forEach(card => {
    const tool = card.dataset.tool;
    if (handlers[tool]){
      card.addEventListener('click', () => handlers[tool]());
    }
  });
})();
