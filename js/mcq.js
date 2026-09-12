/* ============================================================
   MCQ.JS — Gamified Multiple Choice Questions & Rapid Quiz
   CS Chapter Workshop — Intro to Programming
   ============================================================ */

const _global = typeof window !== 'undefined' ? window : globalThis;

// Global quiz score & streak tracker
_global.WorkshopScore = _global.WorkshopScore || {
  total: 0,
  correct: 0,
  streak: 0,
  maxStreak: 0,

  add(points) {
    this.streak++;
    if (this.streak > this.maxStreak) this.maxStreak = this.streak;
    const multiplier = this.streak >= 3 ? 1.5 : 1;
    const gained = Math.round(points * multiplier * 25);
    this.total += gained;
    this.correct++;
    this._updateHUD();
    return gained;
  },

  resetStreak() {
    this.streak = 0;
    this._updateHUD();
  },

  _updateHUD() {
    const chip = document.getElementById('hud-streak-chip');
    if (chip) {
      if (this.streak > 1) {
        chip.className = 'hud-chip streak-active animate-bouncein';
        chip.innerHTML = `⚡ STREAK: ${this.streak} 🔥 (+${this.total} XP)`;
      } else {
        chip.className = 'hud-chip';
        chip.innerHTML = `🏆 XP: ${this.total}`;
      }
    }
  },

  getFinalXP() {
    return this.total;
  },

  getRank() {
    if (this.total >= 200) return { rank: 'LEGENDARY CODER 🏆', color: '#fbbf24' };
    if (this.total >= 150) return { rank: 'DEBUGGING MASTER 🔥', color: '#f472b6' };
    if (this.total >= 100) return { rank: 'RISING DEVELOPER ⭐', color: '#00f0ff' };
    if (this.total >= 50)  return { rank: 'EAGER LEARNER 🌱', color: '#10b981' };
    return { rank: 'JUST GETTING STARTED 🚀', color: '#94a3b8' };
  }
};

/* ============================================================
   MCQ Class
   ============================================================ */
class MCQ {
  constructor(opts) {
    this.id        = opts.id || ('mcq_' + Math.random().toString(36).slice(2));
    this.container = opts.container;
    this.code      = opts.code      || null;
    this.question  = opts.question  || '';
    this.options   = opts.options   || [];
    this.correct   = opts.correct   || '';
    this.explain   = opts.explain   || '';
    this.points    = opts.points    || 1;
    this.onCorrect = opts.onCorrect || null;
    this.onReveal  = opts.onReveal  || null;
    this.followUp  = opts.followUp  || null;

    this._answered = false;
    this._selected = null;

    if (this.container) this.render();
  }

  render() {
    this.container.innerHTML = this._buildHTML();
    this._bindEvents();
  }

  _buildHTML() {
    const codeBlock = this.code
      ? `<div class="mcq-code-block">${this._escapeHTML(this.code)}</div>`
      : '';

    const opts = this.options.map(o => `
      <button class="mcq-option" data-key="${o.key}">
        <span class="mcq-option-key">${o.key}</span>
        <span class="mcq-option-text">${o.text}</span>
      </button>`).join('');

    return `
      <div class="mcq-wrapper" id="${this.id}">
        ${codeBlock}
        <p class="mcq-question">${this.question}</p>
        <div class="mcq-options">${opts}</div>
        <div class="mcq-feedback" id="${this.id}_feedback"></div>
        <div class="mcq-controls">
          <button class="btn btn-outline btn-sm" id="${this.id}_reveal">👁 Reveal Answer</button>
          <button class="btn btn-outline btn-sm" id="${this.id}_reset">↺ Reset</button>
          <div class="score-tracker">
            <span>Question XP:</span>
            <span class="st-pts" id="${this.id}_pts">+0</span>
          </div>
        </div>
        <div id="${this.id}_followup" style="margin-top:16px;display:none"></div>
      </div>
    `;
  }

  _escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  _bindEvents() {
    const wrap = document.getElementById(this.id);
    if (!wrap) return;

    wrap.querySelectorAll('.mcq-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this._answered) return;
        this._handleAnswer(btn.dataset.key);
      });
    });

    const revealBtn = document.getElementById(`${this.id}_reveal`);
    if (revealBtn) revealBtn.addEventListener('click', () => this._revealAnswer());

    const resetBtn = document.getElementById(`${this.id}_reset`);
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  }

  _handleAnswer(key) {
    this._answered = true;
    this._selected = key;

    const wrap = document.getElementById(this.id);
    const btns = wrap.querySelectorAll('.mcq-option');
    const feedback = document.getElementById(`${this.id}_feedback`);
    const ptsEl = document.getElementById(`${this.id}_pts`);

    btns.forEach(b => {
      if (b.dataset.key === this.correct) {
        b.classList.add('correct');
      } else if (b.dataset.key === key && key !== this.correct) {
        b.classList.add('wrong');
      } else {
        b.classList.add('dimmed');
      }
    });

    if (key === this.correct) {
      if (window.soundEngine) window.soundEngine.playSuccess();
      if (window.launchConfetti) window.launchConfetti(0.5, 0.4, 50);

      const gained = window.WorkshopScore.add(this.points);
      if (ptsEl) ptsEl.textContent = `+${gained} XP`;
      if (window.showToast) window.showToast(`+${gained} XP! Streak: ${window.WorkshopScore.streak} 🔥`, 'success');

      // Fire XP animation
      if (window.animateXP) window.animateXP(gained);
      // Dispatch event for other listeners
      document.dispatchEvent(new CustomEvent('mcqCorrect', { detail: { points: this.points } }));

      if (feedback) {
        feedback.className = 'mcq-feedback correct';
        feedback.innerHTML = `<strong>✅ Brilliant!</strong> ${this.explain}`;
        feedback.style.display = 'block';
      }
      if (this.onCorrect) this.onCorrect();
    } else {
      if (window.soundEngine) window.soundEngine.playError();
      window.WorkshopScore.resetStreak();

      if (feedback) {
        feedback.className = 'mcq-feedback wrong';
        feedback.innerHTML = `<strong>❌ Not quite!</strong> ${this.explain}`;
        feedback.style.display = 'block';
      }
    }

    if (this.followUp) {
      this._renderFollowUp();
    }
  }

  _revealAnswer() {
    if (this._answered) return;
    this._answered = true;
    if (window.soundEngine) window.soundEngine.playClick();

    const wrap = document.getElementById(this.id);
    wrap.querySelectorAll('.mcq-option').forEach(b => {
      if (b.dataset.key === this.correct) b.classList.add('correct');
      else b.classList.add('dimmed');
    });

    const feedback = document.getElementById(`${this.id}_feedback`);
    if (feedback) {
      feedback.className = 'mcq-feedback correct';
      feedback.innerHTML = `<strong>💡 Correct Answer: (${this.correct})</strong> ${this.explain}`;
      feedback.style.display = 'block';
    }

    if (this.followUp) this._renderFollowUp();
    if (this.onReveal) this.onReveal();
  }

  _renderFollowUp() {
    const fuContainer = document.getElementById(`${this.id}_followup`);
    if (!fuContainer) return;
    fuContainer.style.display = 'block';
    fuContainer.classList.add('animate-fadeinup');

    new MCQ({
      id: `${this.id}_fu`,
      container: fuContainer,
      question: this.followUp.question,
      options: this.followUp.options,
      correct: this.followUp.correct,
      explain: this.followUp.explain,
      points: this.followUp.points || 1
    });
  }

  reset() {
    this._answered = false;
    this._selected = null;
    if (typeof window !== 'undefined' && window.soundEngine) window.soundEngine.playClick();
    this.render();
  }
}

/* ============================================================
   Rapid Quiz Component
   ============================================================ */
class RapidQuiz {
  constructor(opts) {
    this.container = opts.container;
    this.questions = opts.questions || [];
    this.current   = 0;
    this.score     = 0;

    if (this.container) this.render();
  }

  render() {
    if (!this.container) return;
    if (this.current >= this.questions.length) {
      this._renderResults();
      return;
    }

    const q = this.questions[this.current];
    const optsHTML = q.options.map(o => `
      <button class="mcq-option" data-key="${o.key}" style="padding:14px 18px">
        <span class="mcq-option-key">${o.key}</span>
        <span class="mcq-option-text">${o.text}</span>
      </button>`).join('');

    this.container.innerHTML = `
      <div class="card card-accent-top purple animate-fadein" style="padding:28px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <span class="badge badge-purple">QUESTION ${this.current + 1} OF ${this.questions.length}</span>
          <span style="font-family:var(--font-mono);font-size:0.85em;color:var(--accent-cyan);font-weight:700">SCORE: ${this.score}</span>
        </div>
        <p class="mcq-question" style="font-size:1.2em;margin-bottom:20px">${q.question}</p>
        <div class="mcq-options" style="grid-template-columns:1fr 1fr;gap:12px">${optsHTML}</div>
        <div id="rq-feedback" class="mcq-feedback" style="display:none"></div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const btns = this.container.querySelectorAll('.mcq-option');
    const feedback = this.container.querySelector('#rq-feedback');
    const q = this.questions[this.current];

    btns.forEach(btn => {
      btn.addEventListener('click', async () => {
        btns.forEach(b => b.style.pointerEvents = 'none');
        const chosen = btn.dataset.key;

        if (chosen === q.correct) {
          this.score++;
          btn.classList.add('correct');
          if (typeof window !== 'undefined' && window.soundEngine) window.soundEngine.playSuccess();
          if (typeof window !== 'undefined' && window.launchConfetti) window.launchConfetti(0.5, 0.5, 40);
          feedback.className = 'mcq-feedback correct';
          feedback.innerHTML = `<strong>✅ Correct!</strong> ${q.explain}`;
        } else {
          btn.classList.add('wrong');
          if (typeof window !== 'undefined' && window.soundEngine) window.soundEngine.playError();
          btns.forEach(b => { if (b.dataset.key === q.correct) b.classList.add('correct'); });
          feedback.className = 'mcq-feedback wrong';
          feedback.innerHTML = `<strong>❌ Not quite!</strong> ${q.explain}`;
        }

        feedback.style.display = 'block';

        await new Promise(r => setTimeout(r, 2000));
        this.current++;
        this.render();
      });
    });
  }

  _renderResults() {
    if (typeof window !== 'undefined' && window.soundEngine) window.soundEngine.playVictory();
    if (typeof window !== 'undefined' && window.launchConfetti) window.launchConfetti(0.5, 0.4, 100);

    this.container.innerHTML = `
      <div class="card card-accent-top yellow text-center animate-bouncein" style="padding:36px 24px">
        <div style="font-size:3.5em;margin-bottom:8px">🏆</div>
        <h3 style="font-size:1.8em;margin:0 0 6px;color:var(--accent-yellow)">QUIZ COMPLETE!</h3>
        <p style="color:var(--text-muted);font-size:1em;margin-bottom:20px">You scored <strong>${this.score}</strong> out of <strong>${this.questions.length}</strong> questions!</p>
        <div style="display:inline-block;padding:8px 24px;border-radius:var(--radius-full);background:rgba(251,191,36,0.15);border:1px solid var(--accent-yellow);color:var(--accent-yellow);font-family:var(--font-mono);font-weight:900;font-size:1.1em;margin-bottom:24px">
          ${this.score >= 3 ? '⚡ VERIFIED CODER STATUS UNLOCKED' : '🌱 GREAT EFFORT — KEEP PRACTICING!'}
        </div>
        <div>
          <button class="btn btn-primary btn-sm" id="rq-restart-btn">↺ Try Quiz Again</button>
        </div>
      </div>
    `;

    const restartBtn = this.container.querySelector('#rq-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.current = 0;
        this.score = 0;
        this.render();
      });
    }
  }
}

_global.MCQ = MCQ;
_global.RapidQuiz = RapidQuiz;
