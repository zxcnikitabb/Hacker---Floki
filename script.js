/* =========================================================
   HACKER — FLOKI :: OSINT TERMINAL
   ========================================================= */

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

/* =========================================================
   3D GLOBE :: HACKER — FLOKI
   Собственная реализация на Canvas 2D (без библиотек)
   ========================================================= */
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

  // --- Параметры вращения ---
  let rotX = -0.35;
  let rotY = 0.6;
  let autoSpin = 0.0022;
  let zoom = 1;
  let targetZoom = 1;
  let dragging = false, lastX = 0, lastY = 0;

  // --- Кластеры
