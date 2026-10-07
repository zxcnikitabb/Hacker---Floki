/* ============ MATRIX RAIN ============ */
(() => {
  const c = document.getElementById('matrix');
  const ctx = c.getContext('2d');
  let w, h, cols, drops, fontSize = 16;

  function resize(){
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    cols = Math.floor(w / fontSize);
    drops = new Array(cols).fill(1).map(() => Math.random() * h / fontSize);
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = 'アカサタナハマヤラワ0123456789ABCDEF<>{}[]/\\$#@%&*'.split('');
  let last = 0;
  const FPS = 24, interval = 1000 / FPS;

  function draw(t){
    requestAnimationFrame(draw);
    if (t - last < interval) return;
    last = t;

    ctx.fillStyle = 'rgba(5,10,8,0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++){
      const ch = chars[(Math.random() * chars.length) | 0];
      const y = drops[i] * fontSize;
      ctx.fillStyle = Math.random() > 0.975 ? '#ffffff' : 'rgba(0,255,156,' + (0.5 + Math.random() * 0.5) + ')';
      ctx.shadowColor = '#00ff9c';
      ctx.shadowBlur = 8;
      ctx.fillText(ch, i * fontSize, y);
      ctx.shadowBlur = 0;
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  requestAnimationFrame(draw);
})();

/* ============ CUSTOM CURSOR ============ */
(() => {
  const cur = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  let mx = 0, my = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function loop(){
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('hover'));
  });
})();

/* ============ BOOT SEQUENCE ============ */
(() => {
  const boot = document.getElementById('boot');
  const pre  = document.getElementById('boot-text');
  const lines = [
    'HACKER — FLOKI // bootloader v1.0',
    '[ 0.000 ] BIOS check ......... OK',
    '[ 0.142 ] Loading kernel ...... OK',
    '[ 0.312 ] Mounting /dev/floki ... OK',
    '[ 0.501 ] Establishing tunnel ... AES-256 OK',
    '[ 0.720 ] Spoofing MAC ........ OK',
    '[ 0.901 ] Routing through 7 nodes ... OK',
    '[ 1.100 ] Loading OSINT modules ...',
    '           ├─ recon.exe       [✓]',
    '           ├─ metadata.sys    [✓]',
    '           ├─ social.dll      [✓]',
    '           └─ netmap.bin      [✓]',
    '[ 1.442 ] Bypassing firewall ... OK',
    '[ 1.701 ] Anonymity level: 98.7%',
    '[ 2.003 ] >> ACCESS GRANTED :: HACKER — FLOKI <<',
  ];

  let i = 0;
  function typeLine(){
    if (i >= lines.length){
      setTimeout(() => boot.classList.add('done'), 600);
      return;
    }
    let j = 0;
    const line = lines[i] + '\n';
    const t = setInterval(() => {
      pre.textContent += line[j++];
      if (j >= line.length){ clearInterval(t); i++; setTimeout(typeLine, 60); }
    }, 8);
  }
  typeLine();
})();

/* ============ HERO TYPED SUBTITLE ============ */
(() => {
  const el = document.getElementById('typed');
  const phrases = [
    'Мы находим то, что скрыто на виду.',
    'Открытые источники — наше оружие.',
    'paranoia is a feature, not a bug.',
    'HACKER — FLOKI :: OSINT Intelligence',
  ];
  let p = 0, i = 0, deleting = false;

  function tick(){
    const cur = phrases[p];
    el.textContent = cur.slice(0, i);
    if (!deleting){
      if (i < cur.length){ i++; setTimeout(tick, 55); }
      else { deleting = true; setTimeout(tick, 1800); }
    } else {
      if (i > 0){ i--; setTimeout(tick, 25); }
      else { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 300); }
    }
  }
  setTimeout(tick, 2400);
})();

/* ============ LIVE TERMINAL ============ */
(() => {
  const t = document.getElementById('terminal');
  const seq = [
    '$ ssh floki@hacker.node',
    'Connecting ...',
    'Host key fingerprint: SHA256:9f2a...c7e1',
    'Welcome to HACKER — FLOKI v4.2',
    '',
    '$ ./recon --target example.com',
    '> WHOIS .......... 1998-04-12',
    '> DNS A .......... 93.184.216.34',
    '> Subdomains ..... 47 found',
    '> Open ports ..... 22, 80, 443',
    '',
    '$ ./osint --user floki',
    '> Twitter ........ @floki_',
    '> GitHub ......... floki-dev',
    '> Leaks .......... 0',
    '',
    '$ _',
  ];
  let li = 0, ci = 0, cur = '';
  function tick(){
    if (li >= seq.length) return;
    const line = seq[li];
    if (ci < line.length){
      cur += line[ci++];
      t.textContent = cur + '\u2588';
      setTimeout(tick, Math.random() * 30 + 12);
    } else {
      cur += '\n'; ci = 0; li++;
      t.textContent = cur;
      setTimeout(tick, 180 + Math.random() * 200);
    }
  }
  setTimeout(tick, 2600);
})();

/* ============ 3D GLOBE ============ */
(() => {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap);

  let rotX = -0.35;
  let rotY = 0.6;
  let autoSpin = 0.0022;
  let zoom = 1;
  let targetZoom = 1;
  let dragging = false, lastX = 0, lastY = 0;

  const cityClusters = [
    {lat: 55.75,  lon:   37.62, name: 'MOSCOW'},
    {lat: 40.71,  lon:  -74.00, name: 'NEW YORK'},
    {lat: 51.50,  lon:   -0.12, name: 'LONDON'},
    {lat: 35.68,  lon:  139.69, name: 'TOKYO'},
    {lat: 37.77,  lon: -122.41, name: 'SAN FRANCISCO'},
    {lat: 52.52,  lon:   13.40, name: 'BERLIN'},
    {lat: 48.85,  lon:    2.35, name: 'PARIS'},
    {lat:  1.35,  lon:  103.81, name: 'SINGAPORE'},
    {lat:-33.86,  lon:  151.20, name: 'SYDNEY'},
    {lat:-23.55,  lon:  -46.63, name: 'SAO PAULO'},
    {lat: 19.43,  lon:  -99.13, name: 'MEXICO'},
    {lat: 30.04,  lon:   31.23, name: 'CAIRO'},
    {lat: 25.20,  lon:   55.27, name: 'DUBAI'},
    {lat: 19.07,  lon:   72.87, name: 'MUMBAI'},
    {lat: 39.90,  lon:  116.40, name: 'BEIJING'},
    {lat: 31.23,  lon:  121.47, name: 'SHANGHAI'},
    {lat: 22.31,  lon:  114.16, name: 'HONG KONG'},
    {lat: 13.75,  lon:  100.50, name: 'BANGKOK'},
    {lat: 37.56,  lon:  126.97, name: 'SEOUL'},
    {lat: 59.32,  lon:   18.06, name: 'STOCKHOLM'},
    {lat: 47.37,  lon:    8.54, name: 'ZURICH'},
    {lat: 50.85,  lon:    4.35, name: 'BRUSSELS'},
    {lat: 52.37,  lon:    4.89, name: 'AMSTERDAM'},
    {lat: 45.46,  lon:    9.19, name: 'MILAN'},
    {lat: 41.38,  lon:    2.17, name: 'BARCELONA'},
    {lat: 38.72,  lon:   -9.13, name: 'LISBON'},
    {lat: 53.34,  lon:   -6.26, name: 'DUBLIN'},
    {lat: 60.16,  lon:   24.93, name: 'HELSINKI'},
    {lat: 59.91,  lon:   10.75, name: 'OSLO'},
    {lat: 55.67,  lon:   12.56, name: 'COPENHAGEN'},
    {lat: 64.14,  lon:  -21.94, name: 'REYKJAVIK'},
    {lat: 34.05,  lon: -118.24, name: 'LOS ANGELES'},
    {lat: 41.87,  lon:  -87.62, name: 'CHICAGO'},
    {lat: 32.77,  lon:  -96.79, name: 'DALLAS'},
    {lat: 47.60,  lon: -122.33, name: 'SEATTLE'},
    {lat: 25.76,  lon:  -80.19, name: 'MIAMI'},
    {lat: 43.65,  lon:  -79.38, name: 'TORONTO'},
    {lat: 49.28,  lon: -123.12, name: 'VANCOUVER'},
    {lat:-34.60,  lon:  -58.38, name: 'BUENOS AIRES'},
    {lat:-12.04,  lon:  -77.02, name: 'LIMA'},
    {lat:-33.44,  lon:  -70.66, name: 'SANTIAGO'},
    {lat:-26.20,  lon:   28.04, name: 'JOHANNESBURG'},
    {lat:  6.52,  lon:    3.37, name: 'LAGOS'},
    {lat: 33.57,  lon:   -7.58, name: 'CASABLANCA'},
    {lat: 24.86,  lon:   67.00, name: 'KARACHI'},
    {lat: 28.61,  lon:   77.20, name: 'DELHI'},
    {lat: 23.81,  lon:   90.41, name: 'DHAKA'},
    {lat:  3.13,  lon:  101.68, name: 'KUALA LUMPUR'},
    {lat: -6.20,  lon:  106.84, name: 'JAKARTA'},
    {lat: 14.60,  lon:  120.98, name: 'MANILA'},
    {lat: 10.82,  lon:  106.62, name: 'HO CHI MINH'},
    {lat: 35.68,  lon:   51.38, name: 'TEHRAN'},
    {lat: 41.00,  lon:   28.97, name: 'ISTANBUL'},
    {lat: 50.45,  lon:   30.52, name: 'KYIV'},
    {lat: 47.01,  lon:   28.86, name: 'CHISINAU'},
    {lat: 44.43,  lon:   26.10, name: 'BUCHAREST'},
    {lat: 42.70,  lon:   23.32, name: 'SOFIA'},
    {lat: 37.98,  lon:   23.73, name: 'ATHENS'},
    {lat: 41.90,  lon:   12.50, name: 'ROME'},
    {lat: 40.42,  lon:   -3.70, name: 'MADRID'},
  ];

  function latLonToXYZ(lat, lon, r){
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return {
      x: -r * Math.sin(phi) * Math.cos(theta),
      y:  r * Math.cos(phi),
      z:  r * Math.sin(phi) * Math.sin(theta),
    };
  }

  function rotate(p){
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX);
    let z2 = p.y * Math.sin(rotX) + z * Math.cos(rotX);
    return { x, y, z: z2 };
  }

  function project(p){
    const d = 3.2;
    const scale = (d / (d + p.z)) * zoom;
    return {
      x: W / 2 + p.x * scale * (Math.min(W, H) * 0.42),
      y: H / 2 + p.y * scale * (Math.min(W, H) * 0.42),
      scale,
      z: p.z,
    };
  }

  const RADIUS = 1;
  const points = cityClusters.map(c => {
    const p = latLonToXYZ(c.lat, c.lon, RADIUS);
    return { base: p, name: c.name, lat: c.lat, lon: c.lon, pulse: Math.random() * Math.PI * 2 };
  });

  const gridLines = [];
  for (let lat = -60; lat <= 60; lat += 30){
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 6){
      pts.push(latLonToXYZ(lat, lon - 180, RADIUS * 1.001));
    }
    gridLines.push(pts);
  }
  for (let lon = 0; lon < 360; lon += 30){
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4){
      pts.push(latLonToXYZ(lat, lon - 180, RADIUS * 1.001));
    }
    gridLines.push(pts);
  }

  const traces = [];
  const MAX_TRACES = 6;

  function spawnTrace(){
    if (traces.length >= MAX_TRACES) return;
    const a = points[(Math.random() * points.length) | 0];
    let b = points[(Math.random() * points.length) | 0];
    let guard = 0;
    while (b === a && guard++ < 10) b = points[(Math.random() * points.length) | 0];
    if (b === a) return;

    traces.push({
      from: a, to: b,
      progress: 0,
      speed: 0.006 + Math.random() * 0.008,
      suspicious: Math.random() < 0.18,
      life: 0,
      maxLife: 280,
    });

    const active = document.getElementById('hudActive');
    if (active) active.textContent = `${a.name} → ${b.name}`.slice(0, 26);

    const line = document.createElement('div');
    line.className = 'log-line';
    const tag = traces[traces.length - 1].suspicious ? '⚠ ANOMALY' : '✓ ROUTE';
    line.textContent = `[${tag}] ${a.name} → ${b.name}`;
    line.style.color = traces[traces.length - 1].suspicious ? '#ff2a6d' : '#00ff9c';
    const log = document.getElementById('globeLog');
    if (log){
      log.appendChild(line);
      while (log.children.length > 6) log.removeChild(log.firstChild);
    }
  }

  canvas.addEventListener('mousedown', e => {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.005;
    rotX += (e.clientY - lastY) * 0.005;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('mouseup', () => { dragging = false; });

  canvas.addEventListener('touchstart', e => {
    if (e.touches[0]){
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (!dragging || !e.touches[0]) return;
    rotY += (e.touches[0].clientX - lastX) * 0.008;
    rotX += (e.touches[0].clientY - lastY) * 0.008;
    rotX = Math.max(-1.2, Math.min(1.2, rotX));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchend', () => { dragging = false; });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    targetZoom += -e.deltaY * 0.001;
    targetZoom = Math.max(0.6, Math.min(2.4, targetZoom));
  }, { passive: false });

  const hudLat = document.getElementById('hudLat');
  const hudLon = document.getElementById('hudLon');
  const hudNodes = document.getElementById('hudNodes');
  const hudTargets = document.getElementById('hudTargets');
  if (hudNodes) hudNodes.textContent = points.length;
  let targets = 0;

  setInterval(() => {
    if (!document.hidden){
      const r = wrap.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight){
        spawnTrace();
        targets += 1 + Math.floor(Math.random() * 3);
        if (hudTargets) hudTargets.textContent = targets.toLocaleString();
      }
    }
  }, 620);

  function loop(t){
    requestAnimationFrame(loop);

    if (!dragging) rotY += autoSpin;
    zoom += (targetZoom - zoom) * 0.08;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) * 0.42 * zoom;

    const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.35);
    grad.addColorStop(0, 'rgba(0,255,156,0.18)');
    grad.addColorStop(0.5, 'rgba(0,255,156,0.06)');
    grad.addColorStop(1, 'rgba(0,255,156,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,255,156,0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    const inner = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    inner.addColorStop(0, 'rgba(0,255,156,0.05)');
    inner.addColorStop(0.8, 'rgba(0,20,10,0.25)');
    inner.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,255,156,0.18)';
    ctx.lineWidth = 0.7;
    gridLines.forEach(pts => {
      let started = false;
      ctx.beginPath();
      for (const p of pts){
        const rp = rotate(p);
        const pr = project(rp);
        if (rp.z < -0.05) { started = false; continue; }
        if (!started){ ctx.moveTo(pr.x, pr.y); started = true; }
        else ctx.lineTo(pr.x, pr.y);
      }
      ctx.stroke();
    });

    const rendered = points.map(p => {
      const rp = rotate(p.base);
      const pr = project(rp);
      return { p, rp, pr };
    }).sort((a, b) => a.rp.z - b.rp.z);

    rendered.forEach(({ p, rp, pr }) => {
      if (rp.z < 0) return;
      const pulse = 0.6 + Math.abs(Math.sin(t * 0.002 + p.pulse)) * 0.4;
      const size = 2 + pulse * 2;

      ctx.fillStyle = `rgba(0,255,156,${0.15 * pulse})`;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00ff9c';
      ctx.shadowColor = '#00ff9c';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    for (let i = traces.length - 1; i >= 0; i--){
      const tr = traces[i];
      tr.progress += tr.speed;
      tr.life++;

      const a = rotate(tr.from.base);
      const b = rotate(tr.to.base);
      const pa = project(a);
      const pb = project(b);

      const midX = (pa.x + pb.x) / 2;
      const midY = (pa.y + pb.y) / 2;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (midX - W / 2);
      const ny = (midY - H / 2);
      const nlen = Math.hypot(nx, ny) || 1;
      const lift = 80 + len * 0.25;
      const cx1 = midX + (nx / nlen) * lift;
      const cy1 = midY + (ny / nlen) * lift;

      const alpha = tr.life > tr.maxLife * 0.65
        ? Math.max(0, 1 - (tr.life - tr.maxLife * 0.65) / (tr.maxLife * 0.35))
        : 1;

      const color = tr.suspicious ? '255,42,109' : '0,255,156';
      const seg = 40;
      const upto = Math.max(1, Math.floor(seg * Math.min(1, tr.progress + 0.15)));

      ctx.strokeStyle = `rgba(${color},${0.55 * alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let s = 0; s <= upto; s++){
        const tt = s / seg;
        const x = (1 - tt) * (1 - tt) * pa.x + 2 * (1 - tt) * tt * cx1 + tt * tt * pb.x;
        const y = (1 - tt) * (1 - tt) * pa.y + 2 * (1 - tt) * tt * cy1 + tt * tt * pb.y;
        if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const tt = Math.min(1, tr.progress);
      const px = (1 - tt) * (1 - tt) * pa.x + 2 * (1 - tt) * tt * cx1 + tt * tt * pb.x;
      const py = (1 - tt) * (1 - tt) * pa.y + 2 * (1 - tt) * tt * cy1 + tt * tt * pb.y;

      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.shadowColor = `rgba(${color},${alpha})`;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = `rgba(${color},${0.15 * alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();

      if (tr.life >= tr.maxLife) traces.splice(i, 1);
    }

    if (hudLat && hudLon){
      hudLat.textContent = (-rotX * 180 / Math.PI).toFixed(4);
      hudLon.textContent = ((rotY * 180 / Math.PI) % 360).toFixed(4);
    }
  }

  setTimeout(spawnTrace, 500);
  setTimeout(spawnTrace, 1000);

  requestAnimationFrame(loop);
})();

/* ============ SCROLL REVEAL ============ */
(() => {
  const els = document.querySelectorAll('section, .card, .about-text, .stats > div');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
})();

/* ============ COUNTERS ============ */
(() => {
  const els = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      let n = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const t = setInterval(() => {
        n += step;
        if (n >= target){ n = target; clearInterval(t); }
        el.textContent = n;
      }, 25);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
})();

/* ============ PARALLAX HERO ============ */
(() => {
  const hero = document.querySelector('.hero-content');
  const term = document.querySelector('.terminal-window');
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    if (hero) hero.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
    if (term) term.style.transform = `translate(${x * -10}px, ${y * -10}px) rotateY(${x * 2}deg) rotateX(${y * -2}deg)`;
  });
})();

/* ============ KONAMI EASTER EGG ============ */
(() => {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  window.addEventListener('keydown', e => {
    if (e.key === code[idx]){
      idx++;
      if (idx === code.length){
        document.body.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => document.body.style.filter = '', 3000);
        idx = 0;
      }
    } else idx = 0;
  });
})();
