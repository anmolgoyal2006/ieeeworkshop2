/* ============================================================
   ANIMATIONS.JS — Slide-specific animations & interactive visuals
   CS Chapter Workshop — Intro to Programming
   ============================================================ */

'use strict';

/* ── Utility ── */
const delay = ms => new Promise(r => setTimeout(r, ms));

/* ============================================================
   SLIDE 2 — Maggi Robot step-by-step animation
   ============================================================ */
function initMaggiAnimation() {
  const steps = document.querySelectorAll('#maggi-steps li');
  const btn   = document.getElementById('maggi-reveal-btn');
  const questionEl = document.getElementById('maggi-result-q');

  if (!steps.length || !btn) return;

  // Idempotent — don't re-bind if already initialised
  if (btn.dataset.maggiInit) return;
  btn.dataset.maggiInit = '1';

  let revealed = 0;

  async function revealNext() {
    if (revealed < steps.length) {
      steps[revealed].style.opacity = '1';
      steps[revealed].style.transform = 'translateX(0)';
      steps[revealed].classList.add('active');
      revealed++;
      if (revealed === steps.length) {
        btn.textContent = '⚡ What if we skip a step?';
        if (questionEl) {
          await delay(300);
          questionEl.style.display = 'block';
          questionEl.classList.add('animate-fadeinup');
        }
      } else {
        btn.textContent = `▶ Show Step ${revealed + 1}`;
      }
    }
  }

  // Set initial hidden state
  steps.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateX(-10px)';
    s.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  });

  btn.addEventListener('click', revealNext);
}

/* ============================================================
   SLIDE 3 — Compiler pipeline animation
   ============================================================ */
function initCompilerPipeline() {
  const nodes  = document.querySelectorAll('#compiler-pipeline .flow-node');
  const arrows = document.querySelectorAll('#compiler-pipeline .flow-arrow');
  const btn    = document.getElementById('pipeline-play-btn');
  let playing  = false;

  if (!nodes.length || !btn) return;
  if (btn.dataset.pipelineInit) return;
  btn.dataset.pipelineInit = '1';

  async function playPipeline() {
    if (playing) return;
    playing = true;
    if (btn) { btn.textContent = '⏳ Running...'; btn.disabled = true; }

    // Reset
    nodes.forEach(n => {
      n.style.opacity = '0.25';
      n.style.transform = 'scale(1)';
      n.style.transition = 'all 0.4s';
    });
    arrows.forEach(a => { a.style.opacity = '0.2'; a.style.transition = 'opacity 0.3s'; });

    await delay(300);

    for (let i = 0; i < nodes.length; i++) {
      nodes[i].style.opacity = '1';
      nodes[i].style.transform = 'scale(1.06)';
      nodes[i].style.boxShadow = '0 0 20px rgba(0,212,255,0.5)';

      await delay(600);
      nodes[i].style.transform = 'scale(1)';
      nodes[i].style.boxShadow = '';

      if (arrows[i]) { arrows[i].style.opacity = '1'; }
      await delay(200);
    }

    playing = false;
    if (btn) { btn.textContent = '▶ Play Again'; btn.disabled = false; }
  }

  if (btn) btn.addEventListener('click', playPipeline);
}

/* ============================================================
   SLIDE 10 — Loop animation
   ============================================================ */
function initLoopAnimation() {
  const boxes  = {
    start:  document.getElementById('loop-start'),
    check:  document.getElementById('loop-check'),
    body:   document.getElementById('loop-body'),
    update: document.getElementById('loop-update'),
    end:    document.getElementById('loop-end')
  };
  const counterEl  = document.getElementById('loop-counter-val');
  const iterEl     = document.getElementById('loop-iter-count');
  const playBtn    = document.getElementById('loop-play-btn');
  const maxI       = 5;

  let running = false;

  function setActive(name) {
    Object.entries(boxes).forEach(([k, el]) => {
      if (!el) return;
      el.classList.toggle('active', k === name);
    });
  }

  function resetBoxes() {
    Object.values(boxes).forEach(el => {
      if (el) el.classList.remove('active');
    });
  }

  async function runLoop() {
    if (running) return;
    running = true;
    if (playBtn) { playBtn.textContent = '⏳ Running...'; playBtn.disabled = true; }

    // START
    setActive('start');
    if (counterEl) counterEl.textContent = 'i = 1';
    await delay(600);

    for (let i = 1; i <= maxI; i++) {
      // CHECK
      setActive('check');
      if (counterEl) counterEl.textContent = `i = ${i}`;
      if (iterEl)    iterEl.textContent = `iteration ${i}`;
      await delay(600);

      if (i > maxI) break;

      // BODY
      setActive('body');
      await delay(600);

      // UPDATE
      setActive('update');
      await delay(500);
    }

    // END
    setActive('end');
    if (counterEl) counterEl.textContent = 'Loop done!';
    if (iterEl)    iterEl.textContent = `ran ${maxI} times ✓`;

    await delay(1200);
    resetBoxes();
    running = false;
    if (playBtn) { playBtn.textContent = '▶ Play Loop'; playBtn.disabled = false; }
  }

  if (playBtn) playBtn.addEventListener('click', runLoop);
}

/* ============================================================
   SLIDE 12 — Algorithm step builder
   ============================================================ */
function initAlgorithmBuilder() {
  const steps = [
    { num: '01', text: 'Take number <strong>A</strong>' },
    { num: '02', text: 'Take number <strong>B</strong>' },
    { num: '03', text: 'Compare <strong>A</strong> and <strong>B</strong>' },
    { num: '04', text: 'If <strong>A &gt; B</strong> → print A' },
    { num: '05', text: 'Otherwise → print B' }
  ];

  const container = document.getElementById('algo-steps');
  const btn       = document.getElementById('algo-reveal-btn');

  if (!container || !btn) return;

  // Idempotent — don't re-bind if already done
  if (btn.dataset.algoInit) return;
  btn.dataset.algoInit = '1';

  let revealed = 0;

  btn.addEventListener('click', async () => {
    if (revealed < steps.length) {
      const s = steps[revealed];
      const li = document.createElement('li');
      li.innerHTML = `<span class="step-num">${s.num}</span> <span>${s.text}</span>`;
      li.style.opacity = '0';
      li.style.transform = 'translateX(-12px)';
      li.style.transition = 'all 0.35s ease';
      container.appendChild(li);

      await delay(30);
      li.style.opacity = '1';
      li.style.transform = 'translateX(0)';
      revealed++;

      if (revealed === steps.length) {
        btn.textContent = '✓ Complete! Now let\'s code it.';
        btn.disabled = true;
        btn.style.opacity = '0.6';

        const codeReveal = document.getElementById('algo-code-reveal');
        if (codeReveal) {
          await delay(500);
          codeReveal.style.display = 'block';
          codeReveal.classList.add('animate-fadeinup');
        }
      } else {
        btn.textContent = `▶ Step ${revealed + 1} / ${steps.length}`;
      }
    }
  });

  btn.textContent = '▶ Step 1 / 5';
}

/* ============================================================
   SLIDE 6 — I/O visual pulse
   ============================================================ */
function initIOPulse() {
  const ioArrows = document.querySelectorAll('.io-arrow');
  const ioBoxes  = document.querySelectorAll('.io-box .io-val');
  let animating  = false;

  const runBtn = document.getElementById('io-demo-run');
  if (!runBtn || runBtn.dataset.ioPulseInit) return;
  runBtn.dataset.ioPulseInit = '1';

  runBtn.addEventListener('click', async () => {
    if (animating) return;
    animating = true;

    // Pulse input
    const inputBox = document.getElementById('io-input-box');
    const procBox  = document.getElementById('io-proc-box');
    const outBox   = document.getElementById('io-out-box');
    const inputA   = document.getElementById('io-num-a');
    const inputB   = document.getElementById('io-num-b');

    const a = parseInt(inputA ? inputA.value : 10, 10) || 10;
    const b = parseInt(inputB ? inputB.value : 20, 10) || 20;
    const result = a + b;

    async function pulse(el, color) {
      if (!el) return;
      el.style.borderColor = color;
      el.style.boxShadow = `0 0 20px ${color}80`;
      el.style.transform = 'scale(1.08)';
      await delay(400);
      el.style.transform = '';
      el.style.boxShadow = '';
    }

    if (inputBox) inputBox.textContent = `${a}, ${b}`;
    await pulse(inputBox, '#00d4ff');
    await delay(200);

    ioArrows.forEach(a => { a.style.color = '#00d4ff'; a.style.transition = 'color 0.3s'; });
    await delay(300);

    if (procBox) procBox.textContent = `${a} + ${b}`;
    await pulse(procBox, '#7c3aed');
    await delay(200);

    if (outBox) outBox.textContent = result;
    await pulse(outBox, '#22c55e');

    animating = false;
  });
}

/* ============================================================
   SLIDE 7 — Variable type selector
   ============================================================ */
function initTypeSelector() {
  const types = {
    int:    { desc: 'Whole numbers: -2, 0, 42, 1000',    color: '#00d4ff', example: '42'      },
    double: { desc: 'Decimal numbers: 3.14, 9.81',       color: '#f472b6', example: '3.14'    },
    char:   { desc: 'Single character: \'A\', \'z\'',    color: '#fbbf24', example: "'A'"     },
    string: { desc: 'Text: "Hello", "CS Chapter"',       color: '#22c55e', example: '"Hello"' },
    bool:   { desc: 'true or false — binary choice',     color: '#a78bfa', example: 'true'    }
  };

  const container = document.getElementById('type-demo');
  if (!container) return;

  Object.entries(types).forEach(([name, info]) => {
    const btn = container.querySelector(`[data-type="${name}"]`);
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Deactivate all
      container.querySelectorAll('[data-type]').forEach(b => {
        b.style.borderColor = '';
        b.style.background  = '';
        b.style.color       = '';
      });

      // Activate
      btn.style.borderColor = info.color;
      btn.style.background  = `${info.color}18`;
      btn.style.color       = info.color;

      // Update displays
      const descEl = document.getElementById('type-desc');
      const boxEl  = document.getElementById('type-var-box');
      const codeEl = document.getElementById('type-code');

      if (descEl) descEl.textContent = info.desc;
      if (boxEl)  {
        boxEl.textContent = info.example;
        boxEl.style.borderColor = info.color;
        boxEl.style.boxShadow   = `0 0 16px ${info.color}40`;
      }
      if (codeEl) {
        codeEl.innerHTML = `<span style="color:#38bdf8">${name}</span> myVar = <span style="color:${info.color}">${info.example}</span>;`;
      }
    });
  });
}

/* ============================================================
   SLIDE 14 — Debug highlight
   ============================================================ */
function initDebugSlide() {
  const bugBtn  = document.getElementById('debug-reveal-btn');
  const codeEl  = document.getElementById('debug-code');
  const fixEl   = document.getElementById('debug-fix');

  if (!bugBtn) return;
  if (bugBtn.dataset.debugInit) return;
  bugBtn.dataset.debugInit = '1';

  bugBtn.addEventListener('click', () => {
    if (codeEl) {
      codeEl.innerHTML = codeEl.innerHTML
        .replace(
          /marks\s*=\s*40/,
          `marks <span style="color:#f87171;background:rgba(239,68,68,0.2);padding:2px 6px;border-radius:4px;font-weight:900">= 40</span>`
        );
    }
    if (fixEl) {
      fixEl.style.display = 'block';
      fixEl.classList.add('animate-fadeinup');
    }
    bugBtn.textContent = '✓ Bug Identified!';
    bugBtn.style.background = 'rgba(34,197,94,0.2)';
    bugBtn.style.borderColor = 'rgba(34,197,94,0.4)';
    bugBtn.style.color = 'var(--accent-green)';
  });
}

/* ============================================================
   Workshop progress update (called by Reveal.js events)
   ============================================================ */
function updateWorkshopProgress(slideIndex, totalSlides) {
  const fill = document.querySelector('.prog-bar-fill');
  const pct  = Math.round((slideIndex / (totalSlides - 1)) * 100);
  if (fill) fill.style.width = pct + '%';

  const label = document.querySelector('#workshop-progress .prog-label');
  if (label) label.textContent = `${slideIndex + 1} / ${totalSlides}`;
}

/* ============================================================
   Level system — called at milestone slides
   ============================================================ */
const LEVELS = [
  { slide: 4,  label: 'LEVEL 1',  name: 'THINK',   color: '#7c3aed' },
  { slide: 7,  label: 'LEVEL 2',  name: 'CODE',     color: '#00d4ff' },
  { slide: 11, label: 'LEVEL 3',  name: 'TEST',     color: '#22c55e' },
  { slide: 14, label: 'LEVEL 4',  name: 'DEBUG',    color: '#fbbf24' },
  { slide: 17, label: 'LEVEL 5',  name: 'BUILD',    color: '#f472b6' }
];

function showLevelToast(level) {
  // Remove existing
  const old = document.getElementById('level-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'level-toast';
  toast.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0);
    background: linear-gradient(135deg, ${level.color}22, ${level.color}44);
    border: 2px solid ${level.color};
    border-radius: 20px; padding: 24px 48px; text-align: center;
    z-index: 99999; font-family: var(--font-sans,'Inter',sans-serif);
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s;
    opacity: 0; pointer-events: none;
    box-shadow: 0 0 60px ${level.color}50;
  `;
  toast.innerHTML = `
    <div style="font-size:0.75em;font-weight:700;letter-spacing:0.2em;color:${level.color};text-transform:uppercase;margin-bottom:4px">${level.label} COMPLETE ✓</div>
    <div style="font-size:2em;font-weight:900;color:#fff">${level.name}</div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translate(-50%, -50%) scale(1)';
    toast.style.opacity   = '1';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => toast.remove(), 350);
  }, 2000);
}

/* ============================================================
   DOMContentLoaded — boot all animations
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initMaggiAnimation();
  initCompilerPipeline();
  initLoopAnimation();
  initAlgorithmBuilder();
  initIOPulse();
  initTypeSelector();
  initDebugSlide();
});

// Expose for Reveal.js event hooks
window.updateWorkshopProgress = updateWorkshopProgress;
window.showLevelToast         = showLevelToast;
window.LEVELS                 = LEVELS;
window.initLoopAnimation      = initLoopAnimation;
window.initMaggiAnimation     = initMaggiAnimation;
window.initCompilerPipeline   = initCompilerPipeline;
window.initAlgorithmBuilder   = initAlgorithmBuilder;
window.initAttendanceDemo     = initAttendanceDemo;
window.initDebugSlide         = initDebugSlide;
window.initTypeSelector       = initTypeSelector;
window.initIOPulse            = initIOPulse;
