/* ============================================================
   ANIMATIONS.JS — Cyber Particle Canvas, Sound FX Engine,
                   Laser Pointer, Confetti, and Slide Visualizers
   CS Chapter Workshop — Intro to Programming
   ============================================================ */

'use strict';

const delay = ms => new Promise(r => setTimeout(r, ms));

/* ============================================================
   1. SOUND FX SYNTHESIZER (Web Audio API - Zero External Files)
   ============================================================ */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = typeof localStorage !== 'undefined' ? (localStorage.getItem('cs_workshop_muted') === 'true') : false;
  }

  _init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cs_workshop_muted', this.muted);
    }
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  playSuccess() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  }

  playError() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(140, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playLaser() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playVictory() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.30, d: 0.15 },
      { f: 1046.5, t: 0.45, d: 0.4 }
    ];
    const now = this.ctx.currentTime;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.2, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }
}

if (typeof window !== 'undefined') {
  window.soundEngine = new SoundEngine();
}

/* ============================================================
   2. AMBIENT CYBER PARTICLE CANVAS
   ============================================================ */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const count = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(0, 240, 255,' : 'rgba(139, 92, 246,'
    });
  }

  let mouseX = -1000, mouseY = -1000;
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse subtle attraction
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        p.x += dx * 0.01;
        p.y += dy * 0.01;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.6)';
      ctx.fill();

      // Connect lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - d / 100)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   3. SCI-FI LASER POINTER
   ============================================================ */
function initLaserPointer() {
  const laser = document.getElementById('laser-pointer');
  const toggleBtn = document.getElementById('dock-laser-btn');
  let active = false;

  function setLaser(state) {
    active = state;
    if (laser) laser.style.display = active ? 'block' : 'none';
    if (toggleBtn) toggleBtn.classList.toggle('active', active);
    document.body.style.cursor = active ? 'none' : 'auto';
    if (active) window.soundEngine.playLaser();
  }

  window.addEventListener('mousemove', e => {
    if (!active || !laser) return;
    laser.style.left = e.clientX + 'px';
    laser.style.top = e.clientY + 'px';
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'l' || e.key === 'L') {
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        setLaser(!active);
      }
    }
    if (e.key === 'Escape' && active) {
      setLaser(false);
    }
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => setLaser(!active));
  }
}

/* ============================================================
   4. CANVAS CONFETTI BURSTS
   ============================================================ */
function launchConfetti(originX = 0.5, originY = 0.5, count = 70) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99998';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#00f0ff', '#8b5cf6', '#10b981', '#fbbf24', '#f43f5e', '#ffffff'];
  const particles = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 4;
    particles.push({
      x: canvas.width * originX,
      y: canvas.height * originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1,
      gravity: 0.25
    });
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.alpha -= 0.015;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  frame();
}

if (typeof window !== 'undefined') {
  window.launchConfetti = launchConfetti;
}

/* ============================================================
   5. TOAST NOTIFICATIONS
   ============================================================ */
function showToast(msg, type = 'info') {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('workshop-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'workshop-toast';
    toast.style.cssText = `
      position: fixed;
      top: 60px;
      right: 24px;
      z-index: 99999;
      background: rgba(15, 20, 42, 0.95);
      border: 1px solid var(--accent-cyan);
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.85em;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 15px rgba(0,240,255,0.25);
      display: flex;
      align-items: center;
      gap: 8px;
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = (type === 'success' ? '⚡ ' : 'ℹ️ ') + msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
  }, 2500);
}

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}

/* ============================================================
   6. SLIDE 2 — MAGGI ROBOT ANIMATION
   ============================================================ */
function initMaggiAnimation() {
  const steps = document.querySelectorAll('#maggi-steps li');
  const btn   = document.getElementById('maggi-reveal-btn');
  const questionEl = document.getElementById('maggi-result-q');
  if (!steps.length || !btn || btn.dataset.maggiInit) return;
  btn.dataset.maggiInit = '1';

  let revealed = 0;
  steps.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateX(-12px)';
    s.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  });

  btn.addEventListener('click', async () => {
    window.soundEngine.playClick();
    if (revealed < steps.length) {
      steps[revealed].style.opacity = '1';
      steps[revealed].style.transform = 'translateX(0)';
      steps[revealed].classList.add('active');
      revealed++;
      if (revealed === steps.length) {
        btn.textContent = '⚡ What if we skip a step?';
        btn.classList.replace('btn-primary', 'btn-yellow');
        if (questionEl) {
          await delay(300);
          questionEl.style.display = 'block';
          questionEl.classList.add('animate-fadeinup');
        }
      } else {
        btn.textContent = `▶ Show Step ${revealed + 1}`;
      }
    }
  });
}

/* ============================================================
   7. SLIDE 3 — COMPILER PIPELINE ANIMATION
   ============================================================ */
function initCompilerPipeline() {
  const nodes  = document.querySelectorAll('#compiler-pipeline .flow-node');
  const arrows = document.querySelectorAll('#compiler-pipeline .flow-arrow');
  const btn    = document.getElementById('pipeline-play-btn');
  if (!nodes.length || !btn || btn.dataset.pipelineInit) return;
  btn.dataset.pipelineInit = '1';

  btn.addEventListener('click', async () => {
    btn.textContent = '⏳ Compiling...';
    btn.disabled = true;
    window.soundEngine.playClick();

    nodes.forEach(n => { n.style.opacity = '0.3'; n.style.transform = 'scale(1)'; });
    arrows.forEach(a => { a.style.opacity = '0.3'; });
    await delay(200);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].style.opacity = '1';
      nodes[i].style.transform = 'scale(1.08)';
      nodes[i].style.boxShadow = '0 0 25px rgba(0,240,255,0.6)';
      window.soundEngine.playClick();
      await delay(500);
      nodes[i].style.transform = 'scale(1)';
      nodes[i].style.boxShadow = '';
      if (arrows[i]) arrows[i].style.opacity = '1';
      await delay(150);
    }
    window.soundEngine.playSuccess();
    btn.textContent = '▶ Replay Pipeline';
    btn.disabled = false;
  });
}

/* ============================================================
   8. SLIDE 7 — DATA TYPES / MEMORY INSPECTOR
   ============================================================ */
function initTypeDemo() {
  const container = document.getElementById('type-demo');
  if (!container || container.dataset.typeDemoInit) return;
  container.dataset.typeDemoInit = '1';

  const types = {
    int: {
      desc: 'Stores whole numbers. Allocates 4 bytes (32 bits) in RAM.',
      val: '42',
      code: 'int score = 42;',
      color: '#00f0ff',
      bytes: '4 Bytes'
    },
    double: {
      desc: 'Stores decimals with high precision. Allocates 8 bytes in RAM.',
      val: '9.85',
      code: 'double gpa = 9.85;',
      color: '#10b981',
      bytes: '8 Bytes'
    },
    char: {
      desc: 'Stores a single ASCII character in single quotes. Allocates 1 byte.',
      val: "'A'",
      code: "char section = 'A';",
      color: '#fbbf24',
      bytes: '1 Byte'
    },
    string: {
      desc: 'Stores text sequences in double quotes. Dynamic size array of characters.',
      val: '"Alex"',
      code: 'string name = "Alex";',
      color: '#a855f7',
      bytes: 'Dynamic'
    },
    bool: {
      desc: 'Stores boolean truth value (true/false, 1 or 0). Allocates 1 byte.',
      val: 'true',
      code: 'bool isPassed = true;',
      color: '#f43f5e',
      bytes: '1 Byte'
    }
  };

  const btns     = container.querySelectorAll('[data-type]');
  const descEl   = document.getElementById('type-desc');
  const valBox   = document.getElementById('type-var-box');
  const codeEl   = document.getElementById('type-code');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.soundEngine.playClick();
      btns.forEach(b => b.classList.remove('btn-cyan', 'btn-primary'));
      btn.classList.add('btn-cyan');

      const data = types[btn.dataset.type];
      if (!data) return;

      if (descEl) descEl.innerHTML = `<strong>${btn.dataset.type}</strong> (${data.bytes}): ${data.desc}`;
      if (valBox) {
        valBox.textContent = data.val;
        valBox.style.borderColor = data.color;
        valBox.style.color = data.color;
        valBox.style.boxShadow = `0 0 16px ${data.color}40`;
      }
      if (codeEl) {
        codeEl.textContent = data.code;
        codeEl.style.color = data.color;
      }
    });
  });
}

/* ============================================================
   9. SLIDE 8 — ATTENDANCE RADAR & GAUGE
   ============================================================ */
function initAttendanceDemo() {
  const slider = document.getElementById('attendance-slider');
  const valEl  = document.getElementById('attendance-val');
  const resEl  = document.getElementById('attendance-result');
  if (!slider || !valEl || !resEl || slider.dataset.attInit) return;
  slider.dataset.attInit = '1';

  function update() {
    const val = parseInt(slider.value, 10);
    valEl.textContent = val + '%';
    if (val >= 75) {
      resEl.textContent = '✅ ELIGIBLE — Sit for Exam';
      resEl.style.color = '#10b981';
      resEl.style.borderColor = '#10b981';
      resEl.style.background = 'rgba(16, 185, 129, 0.12)';
      resEl.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.25)';
    } else {
      resEl.textContent = '❌ DEBARRED — Attendance < 75%';
      resEl.style.color = '#f43f5e';
      resEl.style.borderColor = '#f43f5e';
      resEl.style.background = 'rgba(244, 63, 94, 0.12)';
      resEl.style.boxShadow = '0 0 20px rgba(244, 63, 94, 0.25)';
    }
  }
  slider.addEventListener('input', update);
  update();
}

/* ============================================================
   10. SLIDE 10 — LOOP STEP-BY-STEP VISUALIZER 2.0
   ============================================================ */
function initLoopVisualizer() {
  const playBtn  = document.getElementById('loop-play-btn');
  const valEl    = document.getElementById('loop-counter-val');
  const iterEl   = document.getElementById('loop-iter-count');
  const startBox = document.getElementById('loop-start');
  const checkBox = document.getElementById('loop-check');
  const bodyBox  = document.getElementById('loop-body');
  const updateBox= document.getElementById('loop-update');
  const endBox   = document.getElementById('loop-end');
  if (!playBtn || playBtn.dataset.loopInit) return;
  playBtn.dataset.loopInit = '1';

  const boxes = [startBox, checkBox, bodyBox, updateBox, endBox].filter(Boolean);
  let isRunning = false;

  playBtn.addEventListener('click', async () => {
    if (isRunning) return;
    isRunning = true;
    playBtn.textContent = '⏳ Executing...';
    playBtn.disabled = true;

    function highlight(box) {
      boxes.forEach(b => b.classList.remove('active-step'));
      if (box) {
        box.classList.add('active-step');
        window.soundEngine.playClick();
      }
    }

    highlight(startBox);
    if (valEl) valEl.textContent = '1';
    if (iterEl) iterEl.textContent = 'Initialized: i = 1';
    await delay(600);

    for (let i = 1; i <= 5; i++) {
      highlight(checkBox);
      if (iterEl) iterEl.textContent = `Check: ${i} <= 5 ? TRUE`;
      await delay(500);

      highlight(bodyBox);
      if (valEl) valEl.textContent = i;
      if (iterEl) iterEl.textContent = `Printed: ${i}`;
      await delay(500);

      if (i < 5) {
        highlight(updateBox);
        if (iterEl) iterEl.textContent = `Increment: i becomes ${i + 1}`;
        await delay(400);
      }
    }

    highlight(checkBox);
    if (iterEl) iterEl.textContent = 'Check: 6 <= 5 ? FALSE';
    await delay(500);

    highlight(endBox);
    if (valEl) valEl.textContent = '6';
    if (iterEl) iterEl.textContent = 'Loop Finished!';
    window.soundEngine.playSuccess();
    launchConfetti(0.7, 0.5, 40);

    await delay(600);
    playBtn.textContent = '▶ Replay Loop';
    playBtn.disabled = false;
    isRunning = false;
  });
}

/* ============================================================
   11. SLIDE 12 — ALGORITHM STEP REVEAL
   ============================================================ */
function initAlgoSteps() {
  const stepsList = document.getElementById('algo-steps');
  const btn = document.getElementById('algo-reveal-btn');
  const codeReveal = document.getElementById('algo-code-reveal');
  if (!stepsList || !btn || btn.dataset.algoInit) return;
  btn.dataset.algoInit = '1';

  const steps = [
    'Take two numbers (let\'s call them a and b)',
    'Compare: is a greater than b?',
    'If YES → the larger number is a',
    'If NO → the larger number is b',
    'Print the larger number'
  ];
  let cur = 0;

  btn.addEventListener('click', () => {
    window.soundEngine.playClick();
    if (cur < steps.length) {
      const li = document.createElement('li');
      li.className = 'animate-fadeinup';
      li.innerHTML = `<span class="step-num">0${cur + 1}</span>${steps[cur]}`;
      stepsList.appendChild(li);
      cur++;
      if (cur < steps.length) {
        btn.textContent = `▶ Step ${cur + 1} / ${steps.length}`;
      } else {
        btn.textContent = '⚡ Reveal C++ Code';
        btn.classList.add('btn-cyan');
      }
    } else {
      if (codeReveal) {
        codeReveal.style.display = 'block';
        codeReveal.classList.add('animate-fadeinup');
        window.soundEngine.playSuccess();
      }
      btn.style.display = 'none';
    }
  });
}

/* ============================================================
   12. SLIDE 16 — PATH SELECTOR
   ============================================================ */
function initPathSelector() {
  const btns = document.querySelectorAll('.path-btn');
  const resEl = document.getElementById('path-result');
  if (!btns.length || !resEl) return;

  const paths = {
    building: {
      title: '🏗️ The Builder Path',
      text: 'Start with <strong>C++ Basics</strong> → Web Dev (HTML, CSS, JS, React) or Mobile Dev (Flutter). You love making apps people touch and use.'
    },
    solving: {
      title: '🧩 The Problem Solver Path',
      text: 'Master <strong>C++ + DSA</strong> → Practice on LeetCode & Codeforces → Competitive Programming. Great for top tech interviews!'
    },
    ai: {
      title: '🤖 The AI / Data Path',
      text: 'Solidify <strong>C++ / Python logic</strong> → Linear Algebra → Machine Learning with PyTorch. Math + code powerhouse.'
    },
    unknown: {
      title: '🤷 The Explorer Path (Recommended!)',
      text: 'Completely normal for 1st Year! Just master <strong>core programming logic</strong> this semester. The right path reveals itself naturally.'
    }
  };

  btns.forEach(b => {
    b.addEventListener('click', () => {
      window.soundEngine.playClick();
      btns.forEach(btn => btn.classList.remove('active'));
      b.classList.add('active');
      const item = paths[b.dataset.pathType];
      if (item) {
        resEl.innerHTML = `
          <div class="card card-accent-top purple animate-fadeinup" style="margin-top:12px">
            <h4 style="margin:0 0 6px;color:var(--accent-cyan)">${item.title}</h4>
            <p style="margin:0;font-size:0.88em;color:var(--text-secondary)">${item.text}</p>
          </div>
        `;
      }
    });
  });
}

/* ============================================================
   Global Init
   ============================================================ */
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    initLaserPointer();
    initMaggiAnimation();
    initCompilerPipeline();
    initTypeDemo();
    initAttendanceDemo();
    initLoopVisualizer();
    initAlgoSteps();
    initPathSelector();
  });
}

// Re-init on slide change
if (typeof window !== 'undefined' && window.Reveal) {
  window.Reveal.on('slidechanged', () => {
    initMaggiAnimation();
    initCompilerPipeline();
    initTypeDemo();
    initAttendanceDemo();
    initLoopVisualizer();
    initAlgoSteps();
    initPathSelector();
  });
}
