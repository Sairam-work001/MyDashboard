// ===== Dark mode only (theme fixed to dark in <html data-theme="dark">) =====
// (Traditional nav bar / mobile menu removed — navigation is now the spatial hub.)

// ===== Reveal targets (revealed when their spatial panel opens) =====
document.querySelectorAll('.timeline-item, .skill-category, .edu-card, .contact-card').forEach(el => {
  el.classList.add('fade-in');
  const sibs = Array.from(el.parentElement.children);
  el.dataset.revealIndex = String(sibs.indexOf(el) % 6);
});

// ===== Cinematic project showcase (icon + info, alternating, reveals on scroll) =====
document.querySelectorAll('.project-card').forEach(card => {
  const icon = card.querySelector('.project-icon');
  const visual = document.createElement('div');
  visual.className = 'project-visual';
  if (icon) visual.appendChild(icon);

  const info = document.createElement('div');
  info.className = 'project-info';
  Array.from(card.children).forEach(ch => { if (ch !== visual) info.appendChild(ch); });

  card.appendChild(visual);
  card.appendChild(info);
});

// ===== 3D tilt on content cards (pointer-driven, respects touch & reduced-motion) =====
const canHover = window.matchMedia('(hover: hover)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canHover && !reduceMotion) {
  const TILT = 9; // max degrees
  document.querySelectorAll('.skill-category, .edu-card, .highlight-card, .contact-card, .timeline-content').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'transform 80ms linear';   // inline = stays snappy
      card.style.transform = `translateY(-6px) rotateX(${(-py * TILT).toFixed(2)}deg) rotateY(${(px * TILT).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease';
      card.style.transform = '';
    });
  });
}

// ===== (In-browser edit mode removed) =====

// ===== Count-up animation for highlight numbers =====
function animateCount(el) {
  const raw = el.textContent.trim();          // e.g. "12+", "6+", "3"
  const match = raw.match(/(\d+)(.*)/);
  if (!match) return;
  const target = parseInt(match[1], 10);
  const suffix = match[2] || '';
  const duration = 1900;
  let startTime = null;

  function step(now) {
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);   // easeOutCubic
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      animateCount(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.highlight-number').forEach(el => countObserver.observe(el));

// ===== IDE / code-editor window chrome on content cards =====
// Wraps each card's content in a body and prepends a titlebar (traffic lights + filename).
function toFileName(text, ext) {
  const words = (text || 'file').replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/);
  const camel = words.map((w, i) =>
    i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join('').slice(0, 22);
  return (camel || 'file') + ext;
}
function applyWindowChrome(selector, ext, headingSel) {
  document.querySelectorAll(selector).forEach(card => {
    if (card.classList.contains('ide-card')) return;
    const heading = card.querySelector(headingSel);
    const name = toFileName(heading ? heading.textContent : '', ext);

    const bar = document.createElement('div');
    bar.className = 'win-bar';
    bar.innerHTML = '<span class="win-name">' + name + '</span>';

    const body = document.createElement('div');
    body.className = 'card-body';
    while (card.firstChild) body.appendChild(card.firstChild);

    card.appendChild(bar);
    card.appendChild(body);
    card.classList.add('ide-card');
  });
}
applyWindowChrome('.skill-category', '.swift', 'h3');
applyWindowChrome('.timeline-content', '.swift', 'h3');
applyWindowChrome('.edu-card', '.md', '.edu-degree');

// ===== Matrix code-rain background (pure canvas) =====
(function matrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const chars = '01</>{}[]();=+*&%01ƒλ01'.split('');
  const fontSize = 16;
  let w, h, cols, drops;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.floor(w / fontSize);
    drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -h / fontSize));
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(6, 6, 14, 0.09)';   // trailing fade
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px ' + '"Fira Code", monospace';
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      // occasional bright cyan "head", otherwise soft violet
      ctx.fillStyle = Math.random() > 0.94 ? 'rgba(120, 240, 255, 0.95)' : 'rgba(140, 134, 255, 0.75)';
      ctx.fillText(ch, x, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = true, frame = 0;
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    if (frame++ % 3 === 0) draw();   // ~20fps — calmer rain
  }
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reduce) loop();
  });
  if (reduce) { draw(); } else { loop(); }
})();

// ===== Spatial navigation: hub <-> panels (visionOS-style routing) =====
(function spatialNav() {
  const stage = document.getElementById('spatial');
  const hub = document.getElementById('hub');
  if (!stage || !hub) return;
  const panels = {};
  document.querySelectorAll('.spatial-panel').forEach(p => { panels[p.id] = p; });

  function revealPanel(panel) {
    const title = panel.querySelector('.section-title');
    if (title) title.classList.add('visible');
    panel.querySelectorAll('.fade-in, .project-card').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), (i % 8) * 95);
    });
  }
  function resetPanel(panel) {
    panel.scrollTop = 0;
    panel.querySelectorAll('.visible').forEach(el => el.classList.remove('visible'));
  }

  let current = 'hub';
  function showView(name) {
    if (name === current) return;
    if (name === 'hub' || !panels[name]) {
      if (panels[current]) panels[current].classList.remove('active');
      hub.classList.add('active-view');
      document.body.classList.remove('in-panel');
      current = 'hub';
      return;
    }
    hub.classList.remove('active-view');
    if (panels[current]) panels[current].classList.remove('active');
    const panel = panels[name];
    resetPanel(panel);
    panel.classList.add('active');
    document.body.classList.add('in-panel');
    current = name;
    setTimeout(() => revealPanel(panel), 900);
  }

  // Tiles + HUD logo/home (data-nav), and in-app hash links (Get in Touch / View Projects)
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); showView(el.getAttribute('data-nav')); });
  });
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (id === 'hub' || panels[id]) { e.preventDefault(); showView(id); }
    });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') showView('hub'); });

  // Look-around parallax (subtle 3D tilt of the whole stage with the pointer)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      stage.style.setProperty('--srx', (cx * 6).toFixed(2) + 'deg');
      stage.style.setProperty('--sry', (-cy * 5).toFixed(2) + 'deg');
      requestAnimationFrame(loop);
    })();
  }
})();


