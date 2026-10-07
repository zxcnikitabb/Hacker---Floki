/* =========================================================
   HACKER — FLOKI :: OSINT TOOLS
   ========================================================= */
(() => {
  const modal   = document.getElementById('toolModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody  = document.getElementById('modalBody');

  function openModal(title){
    modalTitle.textContent = '// ' + title;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.hidden = true;
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
  }

  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  function extLink(name, url, desc){
  return `  <span class="key">·</span> <a class="val" href="${url}" target="_blank" rel="noopener" style="text-decoration:none">${name}</a> <span style="color:var(--dim);font-size:11px">— ${desc}</span>\n`;
  }

  // ============ 1) RECON ============
  function toolRecon(){
    openModal('RECON :: dns + whois');

    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="reconTarget" type="text" placeholder="example.com или 8.8.8.8" autocomplete="off">
        <button id="reconRun">▶ RUN</button>
      </div>
      <div id="reconOut" class="tool-output">> введите домен или IP и нажмите RUN</div>
    `;

    const input = document.getElementById('reconTarget');
    const btn   = document.getElementById('reconRun');
    const out   = document.getElementById('reconOut');

    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.addEventListener('click', async () => {
      const target = input.value.trim();
      if (!target) return;

      out.textContent = '> resolving ...';
      const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(target);
      let html = '';

      try {
        if (!isIp){
          const types = ['A','AAAA','MX','NS','TXT'];
          html += `<span class="ok">> DNS lookup: ${target}</span>\n\n`;

          for (const t of types){
            try {
              const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(target)}&type=${t}`);
              const d = await r.json();
              const answers = (d.Answer || []).map(a => a.data);
              if (answers.length){
                html += row('  ' + t, answers.join(', '));
              }
            } catch(_) {}
          }

          html += `\n<span class="ok">> WHOIS (RDAP): ${target}</span>\n\n`;
          try {
            const r = await fetch(`https://rdap.org/domain/${encodeURIComponent(target)}`);
            if (r.ok){
              const d = await r.json();
              const events = (d.events || []).map(e => `${e.eventAction}: ${e.eventDate}`).join(' | ');
              const registrar = (d.entities || []).find(e => (e.roles || []).includes('registrar'));
              const regName = registrar && registrar.vcardArray
                ? registrar.vcardArray[1].find(v => v[0] === 'fn')?.[3]
                : '—';

              html += row('  name', d.ldhName || target);
              html += row('  status', (d.status || []).join(', ') || '—');
              html += row('  registrar', regName || '—');
              if (events) html += row('  events', events);
              html += row('  nameservers',
                (d.nameservers || []).map(n => n.ldhName).join(', ') || '—');
            } else {
              html += `<span class="err">  WHOIS не найден (${r.status})</span>\n`;
            }
          } catch(e){
            html += `<span class="err">  WHOIS error: ${e.message}</span>\n`;
          }
        } else {
          html += `<span class="ok">> Reverse DNS: ${target}</span>\n\n`;
          try {
            const rev = target.split('.').reverse().join('.') + '.in-addr.arpa';
            const r = await fetch(`https://dns.google/resolve?name=${rev}&type=PTR`);
            const d = await r.json();
            const answers = (d.Answer || []).map(a => a.data);
            html += row('  PTR', answers.length ? answers.join(', ') : 'не найден');
          } catch(e){
            html += `<span class="err">  error: ${e.message}</span>\n`;
          }
        }
      } catch(e){
        html += `<span class="err">FATAL: ${e.message}</span>`;
      }

      out.innerHTML = html || '<span class="err">нет данных</span>';
    });
  }

  // ============ 2) METADATA ============
  function toolMetadata(){
    openModal('METADATA :: EXIF reader');

    modalBody.innerHTML = `
      <label class="drop-zone" id="dropZone">
        <input type="file" id="exifFile" accept="image/*">
        <div>◈ перетащи фото сюда или кликни<br>
        <span style="font-size:11px;color:var(--dim)">обработка локально, файл никуда не уходит</span></div>
      </label>
      <div id="exifOut" class="tool-output" style="margin-top:16px">> жду изображение ...</div>
    `;

    const drop  = document.getElementById('dropZone');
    const file  = document.getElementById('exifFile');
    const out   = document.getElementById('exifOut');

    ['dragenter','dragover'].forEach(ev =>
      drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('dragover'); })
    );
    ['dragleave','drop'].forEach(ev =>
      drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('dragover'); })
    );
    drop.addEventListener('drop', e => {
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    });
    file.addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) processFile(f);
    });

    function processFile(f){
      if (!f.type.startsWith('image/')){
        out.innerHTML = '<span class="err">> это не изображение</span>';
        return;
      }
      out.textContent = `> анализирую ${f.name} (${(f.size/1024).toFixed(1)} KB) ...`;

      const reader = new FileReader();
      reader.onload = e => {
        const interesting = [
          'Make','Model','Software','DateTimeOriginal','CreateDate',
          'ModifyDate','GPSLatitude','GPSLongitude','GPSLatitudeRef','GPSLongitudeRef',
          'GPSAltitude','Orientation','ExposureTime','FNumber','ISOSpeedRatings',
          'FocalLength','LensModel','SerialNumber','Artist','Copyright','ImageSize'
        ];

        EXIF.getData(e.target, function(){
          const all = EXIF.getAllTags(this);
          if (!all || Object.keys(all).length === 0){
            out.innerHTML = '<span class="err">> в файле нет EXIF-данных</span>';
            return;
          }

          let html = `<span class="ok">> файл: ${f.name}</span>\n`;
          html += `<span class="ok">> размер: ${(f.size/1024).toFixed(2)} KB</span>\n\n`;
          html += '<table class="exif-table">';

          interesting.forEach(tag => {
            if (all[tag] !== undefined && all[tag] !== null && all[tag] !== ''){
              let val = all[tag];
              if (typeof val === 'object' && val.toString) val = val.toString();
              if (tag === 'GPSLatitude' || tag === 'GPSLongitude'){
                if (Array.isArray(val) && val.length === 3){
                  val = `${val[0]}° ${val[1]}' ${val[2]}"`;
                }
              }
              html += `<tr><td>${tag}</td><td>${String(val).replace(/</g,'&lt;')}</td></tr>`;
            }
          });

          if (all.GPSLatitude && all.GPSLongitude){
            const lat = toDecimal(all.GPSLatitude, all.GPSLatitudeRef);
            const lon = toDecimal(all.GPSLongitude, all.GPSLongitudeRef);
            if (lat !== null && lon !== null){
              const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
              html += `<tr><td>MAP</td><td><a href="${url}" target="_blank" rel="noopener" style="color:var(--neon)">Открыть на карте ↗</a></td></tr>`;
            }
          }

          html += '</table>';
          out.innerHTML = html;
        });
      };
      reader.readAsDataURL(f);
    }

    function toDecimal(arr, ref){
      if (!Array.isArray(arr) || arr.length < 3) return null;
      const d = arr[0] + arr[1]/60 + arr[2]/3600;
      return (ref === 'S' || ref === 'W') ? -d : d;
    }
  }

  // ============ 3) SOCIAL ============
  function toolSocial(){
    openModal('SOCIAL :: username checker');

    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="socialUser" type="text" placeholder="username (без @)" autocomplete="off">
        <button id="socialRun">▶ SCAN</button>
      </div>
      <div id="socialOut" class="tool-output">> введите username для проверки</div>
    `;

    const input = document.getElementById('socialUser');
    const btn   = document.getElementById('socialRun');
    const out   = document.getElementById('socialOut');

    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    const platforms = [
      { name:'GitHub',    url:u=>`https://github.com/${u}`,       test:u=>`https://api.github.com/users/${u}` },
      { name:'Reddit',    url:u=>`https://reddit.com/user/${u}`,  test:u=>`https://www.reddit.com/user/${u}/about.json` },
      { name:'Telegram',  url:u=>`https://t.me/${u}` },
      { name:'Instagram', url:u=>`https://instagram.com/${u}` },
      { name:'Twitter/X', url:u=>`https://x.com/${u}` },
      { name:'TikTok',    url:u=>`https://tiktok.com/@${u}` },
      { name:'Pinterest', url:u=>`https://pinterest.com/${u}` },
      { name:'Medium',    url:u=>`https://medium.com/@${u}` },
    ];

    btn.addEventListener('click', async () => {
      const u = input.value.trim().replace(/^@/, '');
      if (!u) return;

      out.innerHTML = `<span class="tool-loading">> сканирую ${u}</span>`;
      let html = '';

      try {
        const r = await fetch(platforms[0].test(u));
        if (r.ok){
          const d = await r.json();
          html += buildItem('GitHub', true, platforms[0].url(u),
            `${d.name || ''} · ${d.public_repos} repos · ${d.followers} followers`);
        } else {
          html += buildItem('GitHub', false);
        }
      } catch { html += buildItem('GitHub', false); }

      try {
        const r = await fetch(platforms[1].test(u));
        if (r.ok){
          const d = await r.json();
          html += buildItem('Reddit', true, platforms[1].url(u),
            `karma: ${d.data?.total_karma ?? '—'}`);
        } else {
          html += buildItem('Reddit', false);
        }
      } catch { html += buildItem('Reddit', false); }

      platforms.slice(2).forEach(p => {
        html += buildItem(p.name, null, p.url(u), 'открой ссылку для проверки');
      });

      out.innerHTML = `<span class="ok">> результаты для "${u}"</span>\n\n<div class="social-list">${html}</div>`;
    });

    function buildItem(name, found, url, extra){
      const cls = found === true ? 'found' : found === false ? 'notfound' : '';
      const link = url ? `<a href="${url}" target="_blank" rel="noopener">${name}</a>` : name;
      const extraHtml = extra ? ` <span style="color:var(--dim);font-size:11px">${extra}</span>` : '';
      return `<div class="social-item ${cls}">
        <span class="dot-ind"></span>
        <span style="flex:1">${link}${extraHtml}</span>
        <span style="font-size:10px;color:var(--dim)">${found === true ? 'FOUND' : found === false ? 'N/A' : 'CHECK'}</span>
      </div>`;
    }
  }

  // ============ 4) NETWORK ============
  function toolNetwork(){
    openModal('NETWORK :: IP intelligence');

    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="netIp" type="text" placeholder="8.8.8.8 или пусто = мой IP" autocomplete="off">
        <button id="netRun">▶ LOOKUP</button>
      </div>
      <div id="netOut" class="tool-output">> введите IP или оставь пустым для своего</div>
    `;

    const input = document.getElementById('netIp');
    const btn   = document.getElementById('netRun');
    const out   = document.getElementById('netOut');

    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.addEventListener('click', async () => {
      const ip = input.value.trim();
      out.innerHTML = '<span class="tool-loading">> запрос</span>';

      try {
        const url = ip
          ? `https://ipwho.is/${encodeURIComponent(ip)}`
          : 'https://ipwho.is/';
        const r = await fetch(url);
        const d = await r.json();

        if (!d.success){
          out.innerHTML = `<span class="err">> ${d.message || 'не удалось'}</span>`;
          return;
        }

        let html = `<span class="ok">> IP: ${d.ip} (${d.type})</span>\n\n`;
        html += row('  country', `${d.country} (${d.country_code})`);
        html += row('  region',  d.region || '—');
        html += row('  city',    d.city || '—');
        html += row('  postal',  d.postal || '—');
        html += row('  lat',     d.latitude);
        html += row('  lon',     d.longitude);
        html += row('  timezone', d.timezone?.id || '—');
        html += row('  ASN',     d.connection?.asn || '—');
        html += row('  ISP',     d.connection?.isp || '—');
        html += row('  ORG',     d.connection?.org || '—');
        html += row('  domain',  d.connection?.domain || '—');

        if (d.security){
          html += '\n<span class="ok">> security</span>\n';
          html += row('  VPN',   d.security.is_vpn);
          html += row('  proxy', d.security.is_proxy);
          html += row('  Tor',   d.security.is_tor);
        }

        if (d.latitude && d.longitude){
          const mapUrl = `https://www.openstreetmap.org/?mlat=${d.latitude}&mlon=${d.longitude}#map=10/${d.latitude}/${d.longitude}`;
          // Если это мой IP — покажем дополнительно
if (!ip){
  html += `\n<span style="color:var(--dim)">(это твой публичный IP)</span>\n`;
}

// ---- external lookups ----
const realIp = d.ip;
html += `\n<span class="ok">> external lookups</span>\n`;
html += extLink('Shodan',      `https://www.shodan.io/host/${realIp}`,        'открытые порты и сервисы');
html += extLink('AbuseIPDB',   `https://www.abuseipdb.com/check/${realIp}`,   'жалобы на IP');
html += extLink('VirusTotal',  `https://www.virustotal.com/gui/ip-address/${realIp}`, 'репутация');
html += extLink('BGP HE',      `https://bgp.he.net/ip/${realIp}`,             'маршруты и ASN');
html += extLink('IPinfo',      `https://ipinfo.io/${realIp}`,                 'детали IP');
html += extLink('ViewDNS',     `https://viewdns.info/reverseip/?host=${realIp}`, 'домены на IP');

out.innerHTML = html;
      } catch(e){
        out.innerHTML = `<span class="err">> error: ${e.message}</span>`;
      }
    });
  }

  // ============ ПОДКЛЮЧЕНИЕ ============
  const handlers = {
    recon: toolRecon,
    metadata: toolMetadata,
    social: toolSocial,
    network: toolNetwork,
  };

  document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => {
      const tool = card.dataset.tool;
      if (handlers[tool]) handlers[tool]();
    });
  });
})();
