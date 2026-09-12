/* ============================================================
   INTERACTIONS.JS — Micro-interactions, GSAP Animations,
   3D Card Tilt, Magnetic Buttons, Ripple FX, Slide Entrances
   ============================================================ */

'use strict';

/* ── Ripple Effect on Buttons ── */
function initRippleEffect() {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn, .mcq-option, .dock-btn, .cr-run-btn, .cr-reset-btn');
    if (!btn) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-fx';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

/* ── 3D Card Tilt on Hover ── */
function initCardTilt() {
  const tiltEls = document.querySelectorAll('.card, .meme-card, .week-card, .var-box');
  tiltEls.forEach(card => {
    if (card.dataset.tiltInit) return;
    card.dataset.tiltInit = '1';

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      const rotY =  x * 12;
      const rotX = -y * 8;
      card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
      card.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5 + 8}px 30px rgba(0,240,255,0.18), 0 0 20px rgba(0,240,255,0.1)`;
      card.style.borderColor = 'rgba(0,240,255,0.45)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.borderColor = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease, border-color 0.3s';
    });
  });
}

/* ── Magnetic Button Effect ── */
function initMagneticButtons() {
  const magnets = document.querySelectorAll('.btn-primary, .btn-cyan, .btn-green, .cr-run-btn');
  magnets.forEach(btn => {
    if (btn.dataset.magnetInit) return;
    btn.dataset.magnetInit = '1';

    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.35;
      const dy     = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.06)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    });
  });
}

/* ── Hover Particle Burst ── */
function initHoverBursts() {
  document.querySelectorAll('.btn, .badge, .flow-node.accent, .flow-node.success').forEach(el => {
    if (el.dataset.burstInit) return;
    el.dataset.burstInit = '1';

    el.addEventListener('mouseenter', e => {
      const rect = el.getBoundingClientRect();
      spawnMiniParticles(
        rect.left + rect.width  / 2,
        rect.top  + rect.height / 2,
        8
      );
    });
  });
}

function spawnMiniParticles(x, y, count) {
  const colors = ['#00f0ff', '#00ff88', '#8b5cf6', '#fbbf24', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    const angle = (Math.random() * 360) * Math.PI / 180;
    const speed = Math.random() * 60 + 30;
    const size  = Math.random() * 5 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];

    dot.style.cssText = `
      position:fixed;
      left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${color};
      box-shadow:0 0 ${size * 2}px ${color};
      pointer-events:none;
      z-index:99999;
      transform:translate(-50%,-50%);
      animation: burst-fly 0.6s ease-out forwards;
      --tx: ${Math.cos(angle) * speed}px;
      --ty: ${Math.sin(angle) * speed}px;
    `;
    document.body.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }
}

/* ── GSAP Slide Entrance Animations ── */
function animateSlideIn(slideEl) {
  if (typeof gsap === 'undefined') return;

  // Kill any running tweens on this slide
  gsap.killTweensOf(slideEl.querySelectorAll('*'));

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Badge first
  const badges = slideEl.querySelectorAll('.badge');
  if (badges.length) {
    tl.fromTo(badges, {
      opacity: 0, y: -20, scale: 0.7
    }, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.4, stagger: 0.06
    }, 0);
  }

  // Heading
  const heading = slideEl.querySelector('h1, h2');
  if (heading) {
    tl.fromTo(heading, {
      opacity: 0, y: 30, filter: 'blur(8px)'
    }, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.55
    }, 0.1);
  }

  // Divider
  const divider = slideEl.querySelector('.divider');
  if (divider) {
    tl.fromTo(divider, {
      scaleX: 0, opacity: 0
    }, {
      scaleX: 1, opacity: 1,
      duration: 0.45, ease: 'power4.out',
      transformOrigin: 'left center'
    }, 0.3);
  }

  // Paragraph / subtitle
  const p = slideEl.querySelector('.muted, .hero-subtitle');
  if (p) {
    tl.fromTo(p, {
      opacity: 0, y: 16
    }, {
      opacity: 1, y: 0,
      duration: 0.4
    }, 0.4);
  }

  // Left column
  const leftCol = slideEl.querySelector('.slide-two-col > *:first-child');
  if (leftCol) {
    tl.fromTo(leftCol, {
      opacity: 0, x: -40
    }, {
      opacity: 1, x: 0,
      duration: 0.55
    }, 0.25);
  }

  // Right column
  const rightCol = slideEl.querySelector('.slide-two-col > *:last-child');
  if (rightCol) {
    tl.fromTo(rightCol, {
      opacity: 0, x: 40
    }, {
      opacity: 1, x: 0,
      duration: 0.55
    }, 0.35);
  }

  // Cards stagger
  const cards = slideEl.querySelectorAll('.card:not(.slide-two-col .card)');
  if (cards.length) {
    tl.fromTo(cards, {
      opacity: 0, y: 25, scale: 0.96
    }, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.45, stagger: 0.08
    }, 0.3);
  }

  // Hero-specific extras
  const heroTitle = slideEl.querySelector('.hero-title');
  if (heroTitle) {
    tl.fromTo(heroTitle, {
      opacity: 0, y: 50, scale: 0.85, filter: 'blur(12px)'
    }, {
      opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
      duration: 0.8, ease: 'expo.out'
    }, 0.05);
  }

  const heroEyebrow = slideEl.querySelector('.hero-eyebrow');
  if (heroEyebrow) {
    tl.fromTo(heroEyebrow, {
      opacity: 0, x: -30
    }, {
      opacity: 1, x: 0, duration: 0.5
    }, 0.0);
  }

  const heroMeta = slideEl.querySelectorAll('.hero-meta .badge, .hero-meta span');
  if (heroMeta.length) {
    tl.fromTo(heroMeta, {
      opacity: 0, y: 20, scale: 0.8
    }, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.4, stagger: 0.08
    }, 0.6);
  }

  // Meme card special pop
  const meme = slideEl.querySelector('.meme-card');
  if (meme) {
    tl.fromTo(meme, {
      opacity: 0, scale: 0.5, rotation: -8
    }, {
      opacity: 1, scale: 1, rotation: 0,
      duration: 0.5, ease: 'back.out(1.8)'
    }, 0.45);
  }

  // Step list items
  const steps = slideEl.querySelectorAll('.step-list li:not(.animate-fadeinup)');
  if (steps.length) {
    tl.fromTo(steps, {
      opacity: 0, x: -20
    }, {
      opacity: 1, x: 0,
      duration: 0.35, stagger: 0.05
    }, 0.45);
  }

  // Flow nodes
  const flowNodes = slideEl.querySelectorAll('.flow-node');
  if (flowNodes.length) {
    tl.fromTo(flowNodes, {
      opacity: 0, scale: 0.8
    }, {
      opacity: 1, scale: 1,
      duration: 0.35, stagger: 0.07, ease: 'back.out(1.5)'
    }, 0.4);
  }

  // Week cards
  const weekCards = slideEl.querySelectorAll('.week-card');
  if (weekCards.length) {
    tl.fromTo(weekCards, {
      opacity: 0, y: 40, scale: 0.9
    }, {
      opacity: 1, y: 0, scale: 1,
      duration: 0.45, stagger: 0.1, ease: 'back.out(1.4)'
    }, 0.25);
  }

  // Domain items
  const domains = slideEl.querySelectorAll('.domain-item');
  if (domains.length) {
    tl.fromTo(domains, {
      opacity: 0, scale: 0.6, rotation: 10
    }, {
      opacity: 1, scale: 1, rotation: 0,
      duration: 0.35, stagger: 0.04, ease: 'back.out(1.6)'
    }, 0.35);
  }

  return tl;
}

/* ── Number Counter Animation ── */
function animateCounter(el, from, to, duration = 1200) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ── XP Gain Animation ── */
function animateXP(amount) {
  const chip = document.getElementById('hud-streak-chip');
  if (!chip) return;

  // Get current XP
  const current = parseInt(chip.textContent.replace(/\D/g, '')) || 0;
  const newXP   = current + amount;

  // Flash burst
  chip.classList.add('xp-burst');
  chip.style.transform = 'scale(1.4)';
  chip.style.borderColor = '#fbbf24';
  chip.style.background = 'rgba(251,191,36,0.2)';
  chip.style.color = '#fbbf24';
  chip.style.boxShadow = '0 0 20px rgba(251,191,36,0.5)';

  // Floating +XP label
  const floater = document.createElement('div');
  floater.textContent = `+${amount} XP`;
  floater.style.cssText = `
    position:fixed; top:50px; right:24px;
    font-family:var(--font-mono); font-weight:900;
    font-size:1.1em; color:#fbbf24;
    text-shadow: 0 0 15px rgba(251,191,36,0.8);
    pointer-events:none; z-index:99999;
    animation: xpFloat 1.2s ease-out forwards;
  `;
  document.body.appendChild(floater);

  animateCounter(chip.querySelector ? chip : chip, current, newXP, 800);
  chip.innerHTML = `🏆 XP: ${newXP}`;

  setTimeout(() => {
    chip.style.transform = '';
    chip.style.borderColor = '';
    chip.style.background = '';
    chip.style.color = '';
    chip.style.boxShadow = '';
    chip.style.transition = 'all 0.4s ease';
  }, 600);

  floater.addEventListener('animationend', () => floater.remove());
}

window.animateXP = animateXP;

/* ── Cursor Trail ── */
function initCursorTrail() {
  const trail = [];
  const N = 10;
  for (let i = 0; i < N; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    dot.style.cssText = `
      position:fixed; pointer-events:none; z-index:99990;
      width:${6 - i * 0.4}px; height:${6 - i * 0.4}px;
      border-radius:50%;
      background:rgba(0,240,255,${0.7 - i * 0.07});
      box-shadow:0 0 ${8 - i}px rgba(0,240,255,0.5);
      transform:translate(-50%,-50%);
      transition: left ${i * 0.025 + 0.02}s linear, top ${i * 0.025 + 0.02}s linear;
    `;
    document.body.appendChild(dot);
    trail.push(dot);
  }

  let mx = -100, my = -100;
  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    trail[0].style.left = mx + 'px';
    trail[0].style.top  = my + 'px';
  });

  function updateTrail(i) {
    if (i >= N) return;
    const prev = trail[i - 1];
    const curr = trail[i];
    const pl = parseFloat(prev.style.left) || mx;
    const pt = parseFloat(prev.style.top)  || my;
    curr.style.left = pl + 'px';
    curr.style.top  = pt + 'px';
    requestAnimationFrame(() => updateTrail(i + 1));
  }

  function loop() {
    for (let i = 1; i < N; i++) {
      const prev = trail[i - 1];
      const curr = trail[i];
      curr.style.left = prev.style.left;
      curr.style.top  = prev.style.top;
    }
    requestAnimationFrame(loop);
  }
  loop();
}

/* ── Slide Progress Pulse ── */
function initProgressPulse() {
  const fill = document.querySelector('.prog-bar-fill');
  if (!fill) return;

  const observer = new MutationObserver(() => {
    fill.classList.remove('prog-pulse');
    void fill.offsetWidth; // reflow
    fill.classList.add('prog-pulse');
  });
  observer.observe(fill, { attributes: true, attributeFilter: ['style'] });
}

/* ── Ambient Canvas Upgrade: Interactive glow on click ── */
function initClickGlows() {
  document.addEventListener('click', e => {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position:fixed;
      left:${e.clientX}px; top:${e.clientY}px;
      width:80px; height:80px;
      border-radius:50%;
      background:radial-gradient(circle, rgba(0,240,255,0.35) 0%, transparent 70%);
      transform:translate(-50%,-50%) scale(0);
      pointer-events:none; z-index:99990;
      animation: clickGlow 0.7s ease-out forwards;
    `;
    document.body.appendChild(glow);
    glow.addEventListener('animationend', () => glow.remove());
  });
}

/* ── Scroll-like slide entrance via Reveal events ── */
function hookRevealAnimations() {
  if (typeof Reveal === 'undefined') {
    setTimeout(hookRevealAnimations, 300);
    return;
  }

  Reveal.on('slidechanged', event => {
    const slide = event.currentSlide;
    if (!slide) return;

    // Re-init tilt and magnets for new slide content
    setTimeout(() => {
      initCardTilt();
      initMagneticButtons();
      initHoverBursts();
    }, 100);

    // GSAP entrance
    if (typeof gsap !== 'undefined') {
      animateSlideIn(slide);
    }
  });

  // Animate the first slide
  const firstSlide = document.querySelector('.reveal .slides section');
  if (firstSlide && typeof gsap !== 'undefined') {
    setTimeout(() => animateSlideIn(firstSlide), 200);
  }
}

/* ── MCQ XP Hook ── */
function hookMCQXP() {
  document.addEventListener('mcqCorrect', e => {
    animateXP((e.detail && e.detail.points) ? e.detail.points * 10 : 10);
    if (window.launchConfetti) window.launchConfetti(0.5, 0.3, 50);
  });
}

/* ── Hint Button Toggle ── */
function initHintButtons() {
  document.querySelectorAll('.hint-btn').forEach(btn => {
    if (btn.dataset.hintInit) return;
    btn.dataset.hintInit = '1';
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.hintTarget);
      if (!target) return;
      const isHidden = target.style.display === 'none' || !target.style.display;
      target.style.display = isHidden ? 'block' : 'none';
      btn.classList.toggle('btn-cyan', isHidden);
      btn.classList.toggle('btn-outline', !isHidden);
      if (isHidden && typeof gsap !== 'undefined') {
        gsap.fromTo(target, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
  });
}

/* ── Debug Reveal Button ── */
function initDebugReveal() {
  const btn = document.getElementById('debug-reveal-btn');
  const fix = document.getElementById('debug-fix');
  if (!btn || btn.dataset.debugInit) return;
  btn.dataset.debugInit = '1';
  btn.addEventListener('click', () => {
    if (!fix) return;
    fix.style.display = 'block';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(fix, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' });
    }
    btn.style.display = 'none';
  });
}

/* ── Solution Reveal Button ── */
function initSolutionReveal() {
  const btn   = document.getElementById('solution-reveal-btn');
  const block = document.getElementById('solution-block');
  if (!btn || btn.dataset.solInit) return;
  btn.dataset.solInit = '1';
  btn.addEventListener('click', () => {
    if (!block) return;
    block.style.display = 'block';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(block, { opacity: 0, scaleY: 0, transformOrigin: 'top' }, { opacity: 1, scaleY: 1, duration: 0.45, ease: 'back.out(1.4)' });
    }
    btn.textContent = '✓ Solution Revealed';
    btn.classList.replace('btn-yellow', 'btn-green');
  });
}

/* ── Mission Complete Button ── */
function initMissionComplete() {
  const btn   = document.getElementById('mission-complete-btn');
  const block = document.getElementById('mission-complete-block');
  if (!btn || btn.dataset.missionInit) return;
  btn.dataset.missionInit = '1';
  btn.addEventListener('click', () => {
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.launchConfetti) {
      window.launchConfetti(0.3, 0.5, 60);
      window.launchConfetti(0.7, 0.5, 60);
      setTimeout(() => window.launchConfetti(0.5, 0.3, 80), 300);
    }
    animateXP(50);
    if (block) {
      block.style.display = 'block';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(block, {
          opacity: 0, scale: 0.7, y: 30
        }, {
          opacity: 1, scale: 1, y: 0,
          duration: 0.7, ease: 'back.out(1.8)'
        });
      }
    }
    btn.style.display = 'none';
  });
}

/* ── Challenge Timer ── */
function initChallengeTimer() {
  const btn   = document.getElementById('timer-start-btn');
  const display = document.getElementById('challenge-timer');
  if (!btn || btn.dataset.timerInit) return;
  btn.dataset.timerInit = '1';

  let total = 150; // 2:30
  let interval = null;

  btn.addEventListener('click', () => {
    if (interval) { clearInterval(interval); interval = null; btn.textContent = '▶ Start Timer'; total = 150; display.textContent = '2:30'; display.style.color = '#c4b5fd'; return; }

    btn.textContent = '⏹ Stop';
    interval = setInterval(() => {
      total--;
      const m = Math.floor(total / 60);
      const s = total % 60;
      display.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      if (total <= 30) { display.style.color = '#f43f5e'; display.style.textShadow = '0 0 15px rgba(244,63,94,0.5)'; }
      else if (total <= 60) { display.style.color = '#fbbf24'; }

      if (total <= 0) {
        clearInterval(interval);
        interval = null;
        display.textContent = "TIME'S UP!";
        display.style.fontSize = '1.5em';
        if (window.soundEngine) window.soundEngine.playError();
        if (window.launchConfetti) window.launchConfetti(0.5, 0.5, 40);
        btn.textContent = '↺ Reset';
        total = 150;
      }
    }, 1000);
  });
}

/* ── Maggi response buttons ── */
function initMaggiResponses() {
  document.querySelectorAll('.maggi-resp-btn').forEach(btn => {
    if (btn.dataset.maggiRespInit) return;
    btn.dataset.maggiRespInit = '1';
    btn.addEventListener('click', () => {
      const resp = document.getElementById('maggi-resp');
      if (resp) {
        resp.style.display = 'block';
        resp.textContent = btn.dataset.response;
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(resp, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
        }
      }
      document.querySelectorAll('.maggi-resp-btn').forEach(b => {
        b.classList.remove('btn-cyan');
        b.classList.add('btn-outline');
      });
      btn.classList.replace('btn-outline', 'btn-cyan');
      if (window.soundEngine) window.soundEngine.playClick();
    });
  });
}

/* ── Ice-breaker buttons ── */
function initIcebreaker() {
  const responses = {
    never:   '🎯 Perfect. Zero experience is the best starting point — no wrong habits to unlearn! You\'re exactly who this is built for.',
    little:  '🤏 Nice! A small head start. Feel free to help your neighbour during activities.',
    regular: '💻 Legend. Stay sharp — don\'t spoil the answers. Stick around, it gets fun later!'
  };
  document.querySelectorAll('.ice-opt-btn').forEach(btn => {
    if (btn.dataset.iceInit) return;
    btn.dataset.iceInit = '1';
    btn.addEventListener('click', () => {
      const resp = document.getElementById('ice-response');
      if (resp) {
        resp.textContent = responses[btn.dataset.iceType] || '';
        resp.style.display = 'block';
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(resp, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' });
        }
      }
      document.querySelectorAll('.ice-opt-btn').forEach(b => b.classList.remove('btn-cyan'));
      btn.classList.replace('btn-outline', 'btn-cyan');
      if (window.soundEngine) window.soundEngine.playClick();
      animateXP(5);
    });
  });
}

/* ── Staggered badge typing effect ── */
function initBadgeGlow() {
  document.querySelectorAll('.badge').forEach((b, i) => {
    b.style.animationDelay = `${i * 0.08}s`;
  });
}

/* ── Global Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initRippleEffect();
  initCardTilt();
  initMagneticButtons();
  initHoverBursts();
  initClickGlows();
  initProgressPulse();
  initCursorTrail();
  hookRevealAnimations();
  hookMCQXP();
  initHintButtons();
  initDebugReveal();
  initSolutionReveal();
  initMissionComplete();
  initChallengeTimer();
  initMaggiResponses();
  initIcebreaker();
  initBadgeGlow();
});

// Re-init on slide change
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof Reveal !== 'undefined') {
      Reveal.on('slidechanged', () => {
        initHintButtons();
        initDebugReveal();
        initSolutionReveal();
        initMissionComplete();
        initChallengeTimer();
        initMaggiResponses();
        initIcebreaker();
        setTimeout(() => {
          initCardTilt();
          initMagneticButtons();
          initHoverBursts();
        }, 150);
      });
    }
  });
}
