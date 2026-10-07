/* =========================================================
   HACKER — FLOKI :: OSINT TOOLS v3
   Username Sweep / Domain Info / Reverse Image / IP Location
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
  // 9) USERNAME SWEEP :: 20+ платформ
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
  // 10) DOMAIN INFO :: RDAP + DNS
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
            html += row('  registered', `${reg.eventDate} (${ageDays} дней / ${ageYears} лет)`);
          }
          if (exp){
            const expDate = new Date(exp.eventDate);
            const daysLeft = Math.floor((expDate.getTime() - Date.now()) / 86400000);
            html += row('  expires', `${exp.eventDate} (${daysLeft} дней)`);
          }
          if (upd) html += row('  updated', upd.eventDate);
          if (d.status) html += row('  status', d.status.join(', '));

          const registrar = (d.entities || []).find(e => (e.roles || []).includes('registrar'));
          if (registrar && registrar.vcardArray){
            const fn = registrar.vcardArray[1].find(v => v[0] === 'fn');
            if (fn) html += row('  registrar', fn[3]);
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
  // 11) REVERSE IMAGE :: поиск по картинке
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
  // 12) IP LOCATION :: geo + карта
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
  // ПОДКЛЮЧЕНИЕ К КАРТОЧКАМ
  // =========================================================
  const handlers = {
    sweep:   toolSweep,
    domain:  toolDomain,
    reverse: toolReverse,
    iploc:   toolIpLoc,
  };

  document.querySelectorAll('.tool-card').forEach(card => {
    const tool = card.dataset.tool;
    if (handlers[tool]){
      card.addEventListener('click', () => handlers[tool]());
    }
  });
})();
