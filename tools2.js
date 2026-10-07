/* =========================================================
   HACKER — FLOKI :: OSINT TOOLS v2
   Subdomains / IP WHOIS / Email Check / Hash Lookup
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

  // 5) SUBDOMAINS :: crt.sh
  function toolSubdomains(){
    openModal('SUBDOMAINS :: crt.sh');
    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="subTarget" type="text" placeholder="example.com" autocomplete="off">
        <button id="subRun">▶ ENUMERATE</button>
      </div>
      <div id="subOut" class="tool-output">> введи домен для поиска поддоменов</div>
    `;
    const input = document.getElementById('subTarget');
    const btn   = document.getElementById('subRun');
    const out   = document.getElementById('subOut');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.addEventListener('click', async () => {
      const domain = input.value.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'');
      if (!domain) return;
      out.innerHTML = '<span class="tool-loading">> запрос к crt.sh</span>';
      try {
        const r = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`);
        if (!r.ok){
          out.innerHTML = `<span class="err">> crt.sh вернул ошибку ${r.status}. Попробуй ещё через 10 сек.</span>`;
          return;
        }
        const data = await r.json();
        if (!Array.isArray(data) || data.length === 0){
          out.innerHTML = `<span class="err">> поддомены не найдены для ${esc(domain)}</span>`;
          return;
        }
        const set = new Set();
        data.forEach(cert => {
          const names = (cert.name_value || '').split(/\n+/);
          names.forEach(n => {
            n = n.trim().toLowerCase().replace(/^\*\./, '');
            if (n && n.endsWith(domain)) set.add(n);
          });
        });
        const subs = Array.from(set).sort();
        let html = `<span class="ok">> найдено ${subs.length} уникальных поддоменов</span>\n`;
        html += `<span class="ok">> SSL-сертификатов: ${data.length}</span>\n\n`;
        subs.forEach(s => {
          const sub = s.replace('.' + domain, '');
          const prefix = sub.split('.')[0];
          html += `<span class="key">·</span> <span class="val">${esc(s)}</span>  <span style="color:var(--dim);font-size:11px">[${esc(prefix)}]</span>\n`;
        });
        html += `\n<span class="ok">> источник: crt.sh (Certificate Transparency Logs)</span>`;
        out.innerHTML = html;
      } catch(e){
        out.innerHTML = `<span class="err">> error: ${esc(e.message)}</span>\n<span style="color:var(--dim)">crt.sh иногда тормозит. Попробуй через 10 секунд.</span>`;
      }
    });
  }

  // 6) IP WHOIS :: RDAP
  function toolIpWhois(){
    openModal('IP WHOIS :: rdap.org');
    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="ipwTarget" type="text" placeholder="8.8.8.8 или 1.1.1.1" autocomplete="off">
        <button id="ipwRun">▶ WHOIS</button>
      </div>
      <div id="ipwOut" class="tool-output">> введи IP-адрес</div>
    `;
    const input = document.getElementById('ipwTarget');
    const btn   = document.getElementById('ipwRun');
    const out   = document.getElementById('ipwOut');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.addEventListener('click', async () => {
      const ip = input.value.trim();
      if (!ip) return;
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)){
        out.innerHTML = '<span class="err">> введи корректный IPv4 (например 8.8.8.8)</span>';
        return;
      }
      out.innerHTML = '<span class="tool-loading">> запрос к RDAP</span>';
      try {
        const r = await fetch(`https://rdap.org/ip/${encodeURIComponent(ip)}`);
        if (!r.ok){
          out.innerHTML = `<span class="err">> RDAP вернул ${r.status}</span>`;
          return;
        }
        const d = await r.json();
        let html = `<span class="ok">> RDAP: ${esc(ip)}</span>\n\n`;
        html += row('  handle', d.handle || '—');
        html += row('  name',   d.name   || '—');
        html += row('  type',   d.type   || '—');
        html += row('  country', d.country || '—');
        html += row('  startAddress', d.startAddress || '—');
        html += row('  endAddress',   d.endAddress   || '—');
        html += row('  parentHandle', d.parentHandle || '—');
        if (d.status && d.status.length){
          html += row('  status', d.status.join(', '));
        }
        if (d.events && d.events.length){
          html += '\n<span class="ok">> events</span>\n';
          d.events.forEach(ev => { html += row('  ' + ev.eventAction, ev.eventDate); });
        }
        if (d.entities && d.entities.length){
          html += '\n<span class="ok">> entities</span>\n';
          d.entities.forEach(ent => {
            const roles = (ent.roles || []).join(',') || '—';
            let name = '—';
            if (ent.vcardArray && ent.vcardArray[1]){
              const fn = ent.vcardArray[1].find(v => v[0] === 'fn');
              if (fn) name = fn[3];
            }
            html += `  <span class="key">[${esc(roles)}]</span> <span class="val">${esc(name)}</span>\n`;
            if (ent.handle) html += `    <span style="color:var(--dim)">handle: ${esc(ent.handle)}</span>\n`;
          });
        }
        if (d.remarks && d.remarks.length){
          html += '\n<span class="ok">> remarks</span>\n';
          d.remarks.forEach(rm => {
            const desc = (rm.description || []).join(' ');
            if (desc) html += `  <span style="color:var(--dim)">${esc(desc)}</span>\n`;
          });
        }
        html += `\n<span class="ok">> источник: rdap.org</span>`;
        out.innerHTML = html;
      } catch(e){
        out.innerHTML = `<span class="err">> error: ${esc(e.message)}</span>`;
      }
    });
  }

  // 7) EMAIL CHECK :: disify + MX
  function toolEmail(){
    openModal('EMAIL CHECK :: disify');
    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="emTarget" type="email" placeholder="someone@example.com" autocomplete="off">
        <button id="emRun">▶ CHECK</button>
      </div>
      <div id="emOut" class="tool-output">> введи email для проверки</div>
    `;
    const input = document.getElementById('emTarget');
    const btn   = document.getElementById('emRun');
    const out   = document.getElementById('emOut');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.addEventListener('click', async () => {
      const email = input.value.trim().toLowerCase();
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        out.innerHTML = '<span class="err">> неверный формат email</span>';
        return;
      }
      const [local, domain] = email.split('@');
      out.innerHTML = '<span class="tool-loading">> проверка</span>';
      let html = `<span class="ok">> EMAIL: ${esc(email)}</span>\n\n`;
      html += row('  syntax', '✅ valid');

      try {
        const r = await fetch(`https://www.disify.com/api/email/${encodeURIComponent(email)}`);
        if (r.ok){
          const d = await r.json();
          html += '\n<span class="ok">> disify.com</span>\n';
          html += row('  format', d.format ? '✅ ok' : '❌ bad');
          html += row('  domain', d.domain ? '✅ exists' : '❌ no');
          html += row('  disposable', d.disposable ? '⚠️ YES (временный)' : '✅ no');
          html += row('  dns (MX)', d.dns ? '✅ has MX' : '❌ no MX');
          if (d.disposable){
            html += '\n<span class="err">> ⚠️ Этот домен — временная почта!</span>\n';
          }
        } else {
          html += `\n<span class="err">> disify недоступен (${r.status})</span>\n`;
        }
      } catch(e){
        html += `\n<span class="err">> disify error: ${esc(e.message)}</span>\n`;
      }

      try {
        const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
        const d = await r.json();
        const mxs = (d.Answer || []).map(a => a.data);
        html += '\n<span class="ok">> MX records (dns.google)</span>\n';
        if (mxs.length){
          mxs.forEach(mx => html += `  <span class="val">${esc(mx)}</span>\n`);
        } else {
          html += '  <span class="err">нет MX-записей — домен не принимает почту</span>\n';
        }
      } catch(e){}

      html += '\n<span class="ok">> provider guess</span>\n';
      try {
        const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`);
        const d = await r.json();
        const mxs = (d.Answer || []).map(a => a.data.toLowerCase());
        const providers = [
          { key: 'google', name: 'Google Workspace / Gmail' },
          { key: 'outlook', name: 'Microsoft 365' },
          { key: 'yandex', name: 'Yandex Mail' },
          { key: 'mail.ru', name: 'Mail.ru' },
          { key: 'protonmail', name: 'ProtonMail' },
          { key: 'zoho', name: 'Zoho Mail' },
          { key: 'icloud', name: 'Apple iCloud' },
          { key: 'fastmail', name: 'FastMail' },
        ];
        let found = null;
        for (const p of providers){
          if (mxs.some(mx => mx.includes(p.key))){ found = p.name; break; }
        }
        html += row('  provider', found || 'неизвестный (свой сервер?)');
      } catch(e){}

      html += `\n<span class="ok">> источники: disify.com + dns.google</span>`;
      out.innerHTML = html;
    });
  }

  // 8) HASH LOOKUP
  function toolHash(){
    openModal('HASH LOOKUP :: identify + decrypt');
    modalBody.innerHTML = `
      <div class="tool-input-row">
        <input id="hashInput" type="text" placeholder="5d41402abc4b2a76b9719d911017c592" autocomplete="off">
        <button id="hashRun">▶ LOOKUP</button>
      </div>
      <div id="hashOut" class="tool-output">> вставь MD5 / SHA1 / SHA256 хеш</div>
    `;
    const input = document.getElementById('hashInput');
    const btn   = document.getElementById('hashRun');
    const out   = document.getElementById('hashOut');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });

    btn.addEventListener('click', async () => {
      const hash = input.value.trim().toLowerCase();
      if (!hash) return;
      if (!/^[a-f0-9]+$/.test(hash)){
        out.innerHTML = '<span class="err">> хеш должен содержать только 0-9 и a-f</span>';
        return;
      }
      const types = {32:'MD5',40:'SHA1',64:'SHA256',96:'SHA384',128:'SHA512'};
      const type = types[hash.length];
      if (!type){
        out.innerHTML = `<span class="err">> неизвестная длина: ${hash.length} символов</span>\n<span style="color:var(--dim)">поддерживаются: 32, 40, 64, 96, 128</span>`;
        return;
      }
      let html = `<span class="ok">> HASH: ${esc(hash)}</span>\n`;
      html += row('  length', hash.length + ' chars');
      html += row('  type',   type);
      out.innerHTML = html + '\n<span class="tool-loading">> поиск в БД</span>';

      let found = false;
      try {
        const r = await fetch(`https://hashes.com/en/api/search?hash=${encodeURIComponent(hash)}`);
        if (r.ok){
          const d = await r.json();
          if (d && d.found && d.value){
            html += `\n<span class="ok">> ✅ РАСШИФРОВАНО</span>\n`;
            html += row('  plaintext', d.value);
            found = true;
          }
        }
      } catch(e){}

      if (!found && type === 'MD5'){
        try {
          const r = await fetch(`https://www.nitrxgen.net/md5db/${encodeURIComponent(hash)}.json`);
          if (r.ok){
            const text = await r.text();
            if (text && text !== 'false' && text.trim()){
              let val = text.trim();
              try { val = JSON.parse(text); } catch(_){}
              if (val && val !== false){
                html += `\n<span class="ok">> ✅ РАСШИФРОВАНО (nitrxgen)</span>\n`;
                html += row('  plaintext', val);
                found = true;
              }
            }
          }
        } catch(e){}
      }

      if (!found){
        html += `\n<span style="color:var(--dim)">> в публичных БД не найдено</span>\n`;
        html += `\n<span class="ok">> что можно сделать:</span>\n`;
        html += `  · Проверить на hashes.com вручную\n`;
        html += `  · Использовать hashcat / john the ripper\n`;
        html += `  · Загуглить хеш в кавычках\n`;
        html += `\n<span class="key">  GOOGLE:</span> <a class="val" href="https://www.google.com/search?q=%22${esc(hash)}%22" target="_blank" rel="noopener">поиск ↗</a>\n`;
        html += `<span class="key">  HASHES.COM:</span> <a class="val" href="https://hashes.com/en/decrypt/hash" target="_blank" rel="noopener">открыть ↗</a>\n`;
      } else {
        html += `\n<span class="key">  GOOGLE:</span> <a class="val" href="https://www.google.com/search?q=%22${esc(hash)}%22" target="_blank" rel="noopener">проверить ↗</a>\n`;
      }

      html += `\n<span style="color:var(--dim)">> источники: hashes.com, nitrxgen.net</span>`;
      out.innerHTML = html;
    });
  }

  const handlers = {
    subdomains: toolSubdomains,
    ipwhois:    toolIpWhois,
    email:      toolEmail,
    hash:       toolHash,
  };

  document.querySelectorAll('.tool-card').forEach(card => {
    const tool = card.dataset.tool;
    if (handlers[tool]){
      card.addEventListener('click', () => handlers[tool]());
    }
  });
})();
