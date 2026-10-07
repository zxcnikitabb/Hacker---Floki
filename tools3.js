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

  // ПОДКЛЮЧЕНИЕ
  const handlers = {
    sweep: toolSweep,
  };

  document.querySelectorAll('.tool-card').forEach(card => {
    const tool = card.dataset.tool;
    if (handlers[tool]){
      card.addEventListener('click', () => handlers[tool]());
    }
  });
})();
