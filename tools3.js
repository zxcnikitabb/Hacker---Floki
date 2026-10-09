/* =========================================================
   HACKER — FLOKI :: OSINT TOOLS v3
   Sweep / Domain / Reverse / IP Location / JWT / Dork
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
  function row(k, v){
    return `<span class="key">${k}:</span> <span class="val">${String(v).replace(/</g,'&lt;')}</span>\n`;
  }
  function esc(s){ return String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function extLink(name, url, desc){
    return `  <span class="key">·</span> <a class="val" href="${url}" target="_blank" rel="noopener" style="text-decoration:none">${name}</a> <span style="color:var(--dim);font-size:11px">— ${desc}</span>\n`;
  }

  // =========================================================
  // USERNAME SWEEP
  // =========================================================
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

  // =========================================================
  // DOMAIN INFO
  // =========================================================
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

  // =========================================================
  // REVERSE IMAGE
  // =========================================================
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

  // =========================================================
  // IP LOCATION
  // =========================================================
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
        html += row('  country',   `${d.country} (${d.country_code})`);
        html += row('  region',    d.region || '—');
        html += row('  city',      d.city || '—');
        html += row('  postal',    d.postal || '—');
        html += row('  lat',       d.latitude);
        html += row('  lon',       d.longitude);
        html += row('  timezone',  d.timezone?.id || '—');
        html += row('  ASN',       d.connection?.asn || '—');
        html += row('  ISP',       d.connection?.isp || '—');

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

  // =========================================================
  // JWT / BASE64 DECODER
  // =========================================================
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

    function b64urlToB64(s){
      s = s.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      return s;
    }

    function decodeB64(s){
      try {
        const bin = atob(b64urlToB64(s));
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

      // JWT
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

        html += `<span class="ok">> HEADER</span>\n`;
        html += `<span class="val">${esc(prettyJson(header))}</span>\n\n`;

        html += `<span class="ok">> PAYLOAD</span>\n`;
        html += `<span class="val">${esc(prettyJson(payload))}</span>\n\n`;

        html += `<span class="ok">> SIGNATURE</span>\n`;
        html += `<span style="color:var(--dim)">${esc(sig)} (не раскодируется — это хеш)</span>\n\n`;

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

      // Base64
      if (/^[A-Za-z0-9+/=_\-\s]+$/.test(raw)){
        const decoded = decodeB64(raw.replace(/\s/g, ''));
        if (decoded !== null){
          html += `<span class="ok">> BASE64 DETECTED</span>\n\n`;
          html += `<span class="key">  length:</span> <span class="val">${raw.length} chars</span>\n`;
          html += `<span class="key">  type:</span> <span class="val">${/[_-]/.test(raw) ? 'base64url' : 'base64'}</span>\n\n`;
          html += `<span class="ok">> DECODED</span>\n`;
          html += `<span class="val">${esc(decoded)}</span>\n\n`;

          const pretty = prettyJson(decoded);
          if (pretty !== decoded){
            html += `<span class="ok">> AS JSON</span>\n`;
            html += `<span class="val">${esc(pretty)}</span>\n`;
          }

          out.innerHTML = html;
          return;
        }
      }

      // HEX
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

      // URL-encoded
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

      html += `<span class="err">> не удалось определить формат</span>\n\n`;
      html += `<span class="key">поддерживаются:</span>\n`;
      html += `  · JWT (три части через точку)\n`;
      html += `  · Base64 / Base64url\n`;
      html += `  · Hex (чётное кол-во символов 0-9,a-f)\n`;
      html += `  · URL-encoded (%XX)\n`;
      out.innerHTML = html;
    });
  }

  // =========================================================
  // GOOGLE DORK BUILDER
  // =========================================================
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

    dorks.forEach((dk, i) => {
      const item = document.createElement('div');
      item.className = 'social-item';
      item.style.cursor = 'none';
      item.style.padding = '8px 12px';
      item.dataset.idx = i;
      item.innerHTML = `<span style="flex:1">${esc(dk.name)}</span><span style="font-size:10px;color:var(--dim)">CLICK</span>`;
      item.addEventListener('click', () => {
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
// =========================================================
// GEOINT :: УНИВЕРСАЛЬНЫЙ ГЕОПРОСТРАНСТВЕННЫЙ АНАЛИЗ
// =========================================================
function toolGeo(){
  openModal('GEOINT :: geo analysis');

  modalBody.innerHTML = `
    <div class="tool-input-row">
      <input id="geoInput" type="text" placeholder="55.7558, 37.6173 или адрес" autocomplete="off">
      <button id="geoRun">▶ ANALYZE</button>
    </div>
    <div class="geo-hint-input">
      > поддерживается: координаты · адрес · Plus Code · ссылка Google/OSM
    </div>
    <div id="geoOut" class="tool-output" style="margin-top:14px">> введи координаты или адрес</div>
  `;

  const input = document.getElementById('geoInput');
  const btn   = document.getElementById('geoRun');
  const out   = document.getElementById('geoOut');

  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

  function parseCoords(str){
    const m = str.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
    const g = str.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (g) return { lat: parseFloat(g[1]), lon: parseFloat(g[2]) };
    const o = str.match(/map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
    if (o) return { lat: parseFloat(o[1]), lon: parseFloat(o[2]) };
    return null;
  }

  async function reverseGeocode(lat, lon){
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;
    const r = await fetch(url, { headers: { 'User-Agent': 'HACKER-FLOKI-OSINT' } });
    return r.json();
  }

  async function forwardGeocode(q){
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=ru`;
    const r = await fetch(url, { headers: { 'User-Agent': 'HACKER-FLOKI-OSINT' } });
    return r.json();
  }

  async function getElevation(lat, lon){
    try {
      const r = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`);
      const d = await r.json();
      return d.results?.[0]?.elevation ?? '—';
    } catch(_){ return '—'; }
  }

  async function getWeather(lat, lon){
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
      const d = await r.json();
      const c = d.current || {};
      const code = c.weather_code;
      const desc = {0:'ясно',1:'преим. ясно',2:'перем. облачно',3:'облачно',45:'туман',48:'изморозь',51:'морось',61:'дождь',63:'дождь',65:'ливень',71:'снег',73:'снег',75:'снегопад',80:'ливни',95:'гроза',96:'гроза с градом'}[code] || '—';
      return `${c.temperature_2m}°C, ${desc}`;
    } catch(_){ return '—'; }
  }

  async function getNearby(lat, lon){
    try {
      const q = `[out:json][timeout:20];(node(around:300,${lat},${lon})[amenity];way(around:300,${lat},${lon})[amenity];);out center 15;`;
      const r = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:'data=' + encodeURIComponent(q) });
      const d = await r.json();
      return (d.elements || []).slice(0, 10).map(el => ({ name: el.tags?.name || '(без имени)', type: el.tags?.amenity || 'объект' }));
    } catch(_){ return []; }
  }

  function toDMS(deg, type){
    const d = Math.abs(deg);
    const degrees = Math.floor(d);
    const minFloat = (d - degrees) * 60;
    const minutes = Math.floor(minFloat);
    const seconds = ((minFloat - minutes) * 60).toFixed(2);
    const dir = type === 'lat' ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${dir}`;
  }

  btn.addEventListener('click', async () => {
    const raw = input.value.trim();
    if (!raw) return;

    out.innerHTML = '<span class="tool-loading">> анализ</span>';

    let lat, lon, addressData = null;

// =========================================================
// GEOINT :: ГИБРИДНЫЙ (EXIF + AI tools)
// =========================================================
function toolGeo(){
  openModal('GEOINT :: image intelligence');

  modalBody.innerHTML = `
    <div style="margin-bottom:14px">
      <label class="drop-zone" id="geoDrop">
        <input type="file" id="geoFile" accept="image/*">
        <div>📷 загрузи фото (клик или drag&drop)<br>
        <span style="font-size:11px;color:var(--dim)">файл обрабатывается локально, никуда не уходит</span></div>
      </label>
    </div>

    <div style="margin-bottom:16px">
      <div style="color:var(--dim);font-size:11px;letter-spacing:1px;margin-bottom:8px">> или введи координаты / адрес вручную:</div>
      <div class="tool-input-row">
        <input id="geoManual" type="text" placeholder="55.7558, 37.6173 или адрес" autocomplete="off">
        <button id="geoManualRun">▶ ANALYZE</button>
      </div>
    </div>

    <div id="geoOut" class="tool-output">> жду фото или координаты</div>
  `;

  const dropZone = document.getElementById('geoDrop');
  const fileEl   = document.getElementById('geoFile');
  const manualIn = document.getElementById('geoManual');
  const manualBtn= document.getElementById('geoManualRun');
  const out      = document.getElementById('geoOut');

  // ===== Drag & drop =====
  ['dragenter','dragover'].forEach(ev =>
    dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('dragover'); })
  );
  ['dragleave','drop'].forEach(ev =>
    dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('dragover'); })
  );
  dropZone.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (f) processImage(f);
  });
  fileEl.addEventListener('change', e => {
    const f = e.target.files[0];
    if (f) processImage(f);
  });

  manualBtn.addEventListener('click', () => {
    const raw = manualIn.value.trim();
    if (raw) analyzeCoordsFromString(raw);
  });
  manualIn.addEventListener('keydown', e => { if (e.key === 'Enter') manualBtn.click(); });

  // ===== Парсинг координат из строки =====
  function parseCoords(str){
    const m = str.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
    const g = str.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (g) return { lat: parseFloat(g[1]), lon: parseFloat(g[2]) };
    const o = str.match(/map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
    if (o) return { lat: parseFloat(o[1]), lon: parseFloat(o[2]) };
    return null;
  }

  // ===== Геокодеры =====
  async function reverseGeocode(lat, lon){
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;
      const r = await fetch(url, { headers: { 'User-Agent': 'HACKER-FLOKI-OSINT' } });
      return r.json();
    } catch(_){ return null; }
  }

  async function forwardGeocode(q){
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=ru`;
      const r = await fetch(url, { headers: { 'User-Agent': 'HACKER-FLOKI-OSINT' } });
      return r.json();
    } catch(_){ return []; }
  }

  async function getElevation(lat, lon){
    try {
      const r = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`);
      const d = await r.json();
      return d.results?.[0]?.elevation ?? '—';
    } catch(_){ return '—'; }
  }

  async function getWeather(lat, lon){
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
      const d = await r.json();
      const c = d.current || {};
      const code = c.weather_code;
      const desc = {0:'ясно',1:'преим. ясно',2:'перем. облачно',3:'облачно',45:'туман',48:'изморозь',51:'морось',61:'дождь',63:'дождь',65:'ливень',71:'снег',73:'снег',75:'снегопад',80:'ливни',95:'гроза',96:'гроза с градом'}[code] || '—';
      return `${c.temperature_2m}°C, ${desc}`;
    } catch(_){ return '—'; }
  }

  async function getNearby(lat, lon){
    try {
      const q = `[out:json][timeout:20];(node(around:300,${lat},${lon})[amenity];way(around:300,${lat},${lon})[amenity];);out center 15;`;
      const r = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:'data=' + encodeURIComponent(q) });
      const d = await r.json();
      return (d.elements || []).slice(0, 10).map(el => ({ name: el.tags?.name || '(без имени)', type: el.tags?.amenity || 'объект' }));
    } catch(_){ return []; }
  }

  function toDMS(deg, type){
    const d = Math.abs(deg);
    const degrees = Math.floor(d);
    const minFloat = (d - degrees) * 60;
    const minutes = Math.floor(minFloat);
    const seconds = ((minFloat - minutes) * 60).toFixed(2);
    const dir = type === 'lat' ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${dir}`;
  }

  // ===== Обработка изображения =====
  function processImage(file){
    if (!file.type.startsWith('image/')){
      out.innerHTML = '<span class="err">> это не изображение</span>';
      return;
    }

    out.innerHTML = `<span class="tool-loading">> анализирую ${esc(file.name)}</span>`;

    // Превью
    const reader = new FileReader();
    reader.onload = e => {
      const imgSrc = e.target.result;

      EXIF.getData(e.target, async function(){
        const all = EXIF.getAllTags(this);
        const hasExif = all && Object.keys(all).length > 0;
        const hasGPS = all && all.GPSLatitude && all.GPSLongitude;

        let html = `<div class="geo-result">`;

        // Превью фото
        html += `<div class="geo-block">
          <div class="geo-block-title">📷 image preview</div>
          <img class="geo-image" src="${imgSrc}" alt="preview" style="max-height:300px;object-fit:contain">
        </div>`;

        // EXIF блок
        if (hasExif){
          html += `<div class="geo-block">
            <div class="geo-block-title">📋 exif data</div>`;
          const interesting = ['Make','Model','Software','DateTimeOriginal','CreateDate','ModifyDate','LensModel','FocalLength','ExposureTime','FNumber','ISOSpeedRatings'];
          let anyData = false;
          interesting.forEach(tag => {
            if (all[tag] !== undefined && all[tag] !== null && all[tag] !== ''){
              anyData = true;
              html += `<div class="geo-row"><span class="k">${tag}:</span><span class="v">${esc(String(all[tag]))}</span></div>`;
            }
          });
          if (!anyData) html += `<div class="geo-row"><span class="v" style="color:var(--dim)">— метаданные не найдены</span></div>`;
          html += `</div>`;
        } else {
          html += `<div class="geo-block">
            <div class="geo-block-title">📋 exif data</div>
            <div class="geo-row"><span class="v" style="color:var(--err,#ff2a6d)">⚠️ EXIF отсутствует или удалён</span></div>
            <div class="geo-row"><span class="v" style="color:var(--dim);font-size:11px">Скорее всего фото из мессенджера, соцсети или скриншот.</span></div>
          </div>`;
        }

        // GPS найден → полный анализ
        if (hasGPS){
          const lat = toDecimal(all.GPSLatitude, all.GPSLatitudeRef);
          const lon = toDecimal(all.GPSLongitude, all.GPSLongitudeRef);

          if (lat !== null && lon !== null){
            html += `</div>`; // закрываем geo-result
            out.innerHTML = html;
            // Дозагружаем данные
            await renderFullGeo(lat, lon, imgSrc);
            return;
          }
        }

        // GPS не найден → AI-инструменты
        html += `<div class="geo-block">
          <div class="geo-block-title">🤖 ai geolocation tools</div>
          <div class="geo-row"><span class="v" style="color:var(--dim);font-size:11px">Загрузи фото в один из сервисов — они определят место по содержимому.</span></div>
          <div class="geo-actions" style="flex-wrap:wrap;gap:6px">
            <a href="https://geospy.ai/" target="_blank" rel="noopener">🔍 GeoSpy.ai</a>
            <a href="https://www.picarta.ai/" target="_blank" rel="noopener">🧠 Picarta.ai</a>
            <a href="https://lens.google.com/" target="_blank" rel="noopener">🔎 Google Lens</a>
            <a href="https://yandex.com/images/" target="_blank" rel="noopener">🌐 Yandex Images</a>
            <a href="https://tineye.com/" target="_blank" rel="noopener">🎯 TinEye</a>
            <a href="https://www.bing.com/visualsearch" target="_blank" rel="noopener">🅱️ Bing Visual</a>
          </div>
          <div style="margin-top:10px;color:var(--dim);font-size:11px;line-height:1.6">
            💡 <b>Как работать с AI:</b><br>
            1. Скачай фото в GeoSpy (3 бесплатных/день)<br>
            2. Получи координаты<br>
            3. Вставь их в поле ввода выше → увидишь спутник и карту
          </div>
        </div>`;

        // Подсказки для ручного анализа
        html += `<div class="geo-block">
          <div class="geo-block-title">💡 manual osint tips</div>
          <div class="geo-row"><span class="k">Язык:</span><span class="v">надписи на каком языке?</span></div>
          <div class="geo-row"><span class="k">Архитектура:</span><span class="v">стиль зданий, материалы</span></div>
          <div class="geo-row"><span class="k">Природа:</span><span class="v">растения, рельеф, климат</span></div>
          <div class="geo-row"><span class="k">Транспорт:</span><span class="v">номера машин, марка автобусов</span></div>
          <div class="geo-row"><span class="k">Тени:</span><span class="v">направление солнца = сторона света</span></div>
          <div class="geo-row"><span class="k">Улики:</span><span class="v">вывески, бренды, реклама</span></div>
        </div>`;

        html += `</div>`;
        out.innerHTML = html;
      });
    };
    reader.readAsDataURL(file);
  }

  // ===== Анализ координат (ручной ввод) =====
  async function analyzeCoordsFromString(raw){
    const coords = parseCoords(raw);

    if (coords){
      await renderFullGeo(coords.lat, coords.lon, null);
      return;
    }

    // Иначе — это адрес
    out.innerHTML = '<span class="tool-loading">> геокодинг адреса</span>';
    try {
      const results = await forwardGeocode(raw);
      if (!results.length){
        out.innerHTML = `<span class="err">> адрес не найден</span>\n\n<span style="color:var(--dim)">Попробуй координаты: 55.7539, 37.6208</span>`;
        return;
      }
      const lat = parseFloat(results[0].lat);
      const lon = parseFloat(results[0].lon);
      await renderFullGeo(lat, lon, null);
    } catch(e){
      out.innerHTML = `<span class="err">> ошибка: ${esc(e.message)}</span>`;
    }
  }

  // ===== Полный рендер по координатам =====
  async function renderFullGeo(lat, lon, imgSrc){
    out.innerHTML = '<span class="tool-loading">> получение данных</span>';

    const [addr, elev, weather, nearby] = await Promise.all([
      reverseGeocode(lat, lon),
      getElevation(lat, lon),
      getWeather(lat, lon),
      getNearby(lat, lon)
    ]);

    const latFixed = lat.toFixed(6);
    const lonFixed = lon.toFixed(6);
    const coordStr = `${latFixed}, ${lonFixed}`;

    let html = `<div class="geo-result">`;

    if (imgSrc){
      html += `<div class="geo-block">
        <div class="geo-block-title">📷 source image</div>
        <img class="geo-image" src="${imgSrc}" alt="source" style="max-height:300px;object-fit:contain">
      </div>`;
    }

    html += `<div class="geo-block">
      <div class="geo-block-title">📍 coordinates</div>
      <div class="geo-row"><span class="k">latitude:</span><span class="v">${latFixed}</span></div>
      <div class="geo-row"><span class="k">longitude:</span><span class="v">${lonFixed}</span></div>
      <div class="geo-row"><span class="k">DMS:</span><span class="v">${toDMS(lat, 'lat')} ${toDMS(lon, 'lon')}</span></div>
      <div class="geo-actions"><button id="geoCopy">📋 Скопировать</button></div>
    </div>`;

    if (addr){
      const a = addr.address || {};
      html += `<div class="geo-block">
        <div class="geo-block-title">🌍 address</div>
        ${addr.display_name ? `<div class="geo-row"><span class="k">full:</span><span class="v">${esc(addr.display_name)}</span></div>` : ''}
        ${a.country ? `<div class="geo-row"><span class="k">country:</span><span class="v">${esc(a.country)}</span></div>` : ''}
        ${a.state ? `<div class="geo-row"><span class="k">region:</span><span class="v">${esc(a.state)}</span></div>` : ''}
        ${a.city || a.town || a.village ? `<div class="geo-row"><span class="k">city:</span><span class="v">${esc(a.city || a.town || a.village)}</span></div>` : ''}
        ${a.road ? `<div class="geo-row"><span class="k">street:</span><span class="v">${esc(a.road)}</span></div>` : ''}
        ${a.postcode ? `<div class="geo-row"><span class="k">postcode:</span><span class="v">${esc(a.postcode)}</span></div>` : ''}
      </div>`;
    }

    html += `<div class="geo-block">
      <div class="geo-block-title">⛰️ nature</div>
      <div class="geo-row"><span class="k">elevation:</span><span class="v">${elev} м</span></div>
      <div class="geo-row"><span class="k">weather:</span><span class="v">${esc(weather)}</span></div>
    </div>`;

    const satUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lon-0.003},${lat-0.002},${lon+0.003},${lat+0.002}&bboxSR=4326&imageSR=4326&size=600,400&f=image&format=png`;
    html += `<div class="geo-block">
      <div class="geo-block-title">🛰️ satellite view</div>
      <img class="geo-image" src="${satUrl}" alt="satellite" onerror="this.style.display='none'">
    </div>`;

    const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=16&size=600x300&maptype=mapnik&markers=${lat},${lon},red-pushpin`;
    html += `<div class="geo-block">
      <div class="geo-block-title">🗺️ street map</div>
      <img class="geo-image" src="${mapUrl}" alt="map" onerror="this.style.display='none'">
    </div>`;

    if (nearby.length){
      html += `<div class="geo-block"><div class="geo-block-title">🏢 nearby (300m)</div>`;
      nearby.forEach(o => {
        html += `<div class="geo-row"><span class="k">${esc(o.type)}:</span><span class="v">${esc(o.name)}</span></div>`;
      });
      html += `</div>`;
    }

    html += `<div class="geo-block">
      <div class="geo-block-title">🔗 external</div>
      <div class="geo-actions">
        <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" rel="noopener">Google Maps</a>
        <a href="https://yandex.ru/maps/?pt=${lon},${lat}&z=17&l=map" target="_blank" rel="noopener">Yandex Maps</a>
        <a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}" target="_blank" rel="noopener">OSM</a>
        <a href="https://earth.google.com/web/@${lat},${lon},0a,1000d,35y" target="_blank" rel="noopener">Google Earth</a>
        <a href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}" target="_blank" rel="noopener">Street View</a>
      </div>
    </div>`;

    html += `</div>`;
    out.innerHTML = html;

    const copyBtn = document.getElementById('geoCopy');
    if (copyBtn){
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(coordStr).then(() => {
          copyBtn.textContent = '✓ Скопировано';
          setTimeout(() => { copyBtn.textContent = '📋 Скопировать'; }, 1500);
        });
      });
    }
  }

  // Конвертация EXIF GPS в десятичные градусы
  function toDecimal(arr, ref){
    if (!Array.isArray(arr) || arr.length < 3) return null;
    const d = arr[0] + arr[1]/60 + arr[2]/3600;
    return (ref === 'S' || ref === 'W') ? -d : d;
  }
}

  // =========================================================
  // ПОДКЛЮЧЕНИЕ
  // =========================================================
  const handlers = {
    sweep: toolSweep,
    domain: toolDomain,
    reverse: toolReverse,
    iploc: toolIploc,
    jwt: toolJwt,
    dork: toolDork,
     geo: toolGeo,
  };
  document.querySelectorAll('.tool-card').forEach(card => {
    const tool = card.dataset.tool;
    if (handlers[tool]){
      card.addEventListener('click', () => handlers[tool]());
    }
  });
})();
