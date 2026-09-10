/* ============================================================
   MCQ.JS — Reusable Multiple Choice Question Component
   CS Chapter Workshop — Intro to Programming
   ============================================================ */

'use strict';

// Global quiz score tracker
window.WorkshopScore = window.WorkshopScore || {
  total: 0,
  correct: 0,

  add(points) {
    this.total += points;
    this.correct++;
  },

  getFinalXP() {
    // Convert to XP (out of 8 questions, max 100 XP)
    return Math.round((this.correct / 8) * 100);
  },

  getRank() {
    const xp = this.getFinalXP();
    if (xp >= 90) return { rank: 'LEGENDARY CODER 🏆', color: '#fbbf24' };
    if (xp >= 70) return { rank: 'DEBUGGING MASTER 🔥', color: '#f472b6' };
    if (xp >= 50) return { rank: 'RISING DEVELOPER ⭐', color: '#00d4ff' };
    if (xp >= 30) return { rank: 'EAGER LEARNER 🌱', color: '#22c55e' };
    return { rank: 'JUST GETTING STARTED 🚀', color: '#94a3b8' };
  }
};

/**
 * MCQ class — creates a fully interactive MCQ inside a container element.
 *
 * Options:
 *   id         {string}   unique id for this MCQ instance
 *   container  {Element}  DOM element to render into
 *   code       {string}   optional code block shown above question
 *   question   {string}   question text
 *   options    {Array}    array of { key, text } objects
 *   correct    {string}   key of correct answer (e.g. 'B')
 *   explain    {string}   explanation shown after answer
 *   points     {number}   XP/points for correct answer (default 1)
 *   onCorrect  {function} callback on correct answer
 *   onReveal   {function} callback on reveal
 *   followUp   {object}   optional follow-up MCQ config (same shape)
 */
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
      ? `<div class="mcq-code-block">${this._syntaxHL(this.code)}</div>`
      : '';

    const opts = this.options.map(o => `
      <button class="mcq-option" data-key="${o.key}" aria-label="Option ${o.key}: ${o.text}">
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
          <button class="btn btn-outline btn-sm" id="${this.id}_reveal" aria-label="Reveal Answer">
            👁 Reveal Answer
          </button>
          <button class="btn btn-outline btn-sm" id="${this.id}_reset" aria-label="Reset Question">
            ↺ Reset
          </button>
          <div class="score-tracker">
            <span>XP:</span>
            <span class="st-pts" id="${this.id}_pts">+0</span>
          </div>
        </div>
        <div id="${this.id}_followup" class="mt-2"></div>
      </div>`;
  }

  _bindEvents() {
    const root = document.getElementById(this.id);
    if (!root) return;

    root.querySelectorAll('.mcq-option').forEach(btn => {
      btn.addEventListener('click', () => this._select(btn.dataset.key));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._select(btn.dataset.key);
        }
      });
    });

    const revealBtn = document.getElementById(`${this.id}_reveal`);
    if (revealBtn) revealBtn.addEventListener('click', () => this._reveal());

    const resetBtn = document.getElementById(`${this.id}_reset`);
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  }

  _select(key) {
    if (this._answered) return;
    this._selected = key;
    this._answered = true;

    const root = document.getElementById(this.id);
    if (!root) return;

    // Disable all options
    root.querySelectorAll('.mcq-option').forEach(btn => {
      btn.classList.add('disabled');
      if (btn.dataset.key === key) btn.classList.add('selected');
    });

    const isCorrect = key === this.correct;
    this._showFeedback(isCorrect, key);
    this._highlightAnswer();

    if (isCorrect) {
      WorkshopScore.add(this.points);
      const pts = document.getElementById(`${this.id}_pts`);
      if (pts) {
        pts.textContent = `+${this.points}`;
        pts.style.color = '#22c55e';
      }
      if (this.onCorrect) this.onCorrect();
    } else {
      const pts = document.getElementById(`${this.id}_pts`);
      if (pts) { pts.textContent = '+0'; pts.style.color = '#f87171'; }
    }

    // Show follow-up after a short delay
    if (this.followUp) {
      setTimeout(() => this._renderFollowUp(), 800);
    }
  }

  _reveal() {
    if (this._answered) return;
    this._answered = true;
    this._selected = this.correct;

    const root = document.getElementById(this.id);
    if (!root) return;

    root.querySelectorAll('.mcq-option').forEach(btn => {
      btn.classList.add('disabled');
    });

    this._highlightAnswer();
    this._showFeedback(null, null); // null = reveal mode

    const pts = document.getElementById(`${this.id}_pts`);
    if (pts) { pts.textContent = '+0 (revealed)'; pts.style.color = '#94a3b8'; }

    if (this.onReveal) this.onReveal();
  }

  _highlightAnswer() {
    const root = document.getElementById(this.id);
    if (!root) return;

    root.querySelectorAll('.mcq-option').forEach(btn => {
      if (btn.dataset.key === this.correct) {
        btn.classList.add('correct');
      } else if (btn.dataset.key === this._selected && this._selected !== this.correct) {
        btn.classList.add('wrong');
      }
    });
  }

  _showFeedback(isCorrect, selectedKey) {
    const fb = document.getElementById(`${this.id}_feedback`);
    if (!fb) return;

    if (isCorrect === true) {
      fb.className = 'mcq-feedback correct animate-fadeinup';
      fb.innerHTML = `
        <span class="fb-emoji">✅</span>
        <span class="fb-title">Correct!</span>
        <div class="fb-explain">${this.explain}</div>`;
    } else if (isCorrect === false) {
      fb.className = 'mcq-feedback wrong animate-fadeinup';
      fb.innerHTML = `
        <span class="fb-emoji">🤔</span>
        <span class="fb-title">Not quite — but now we know exactly what to cover!</span>
        <div class="fb-explain">${this.explain}</div>`;
    } else {
      // Reveal mode
      fb.className = 'mcq-feedback correct animate-fadeinup';
      fb.innerHTML = `
        <span class="fb-emoji">👁</span>
        <span class="fb-title">Answer: ${this.correct}</span>
        <div class="fb-explain">${this.explain}</div>`;
    }
  }

  _renderFollowUp() {
    const container = document.getElementById(`${this.id}_followup`);
    if (!container || !this.followUp) return;

    container.innerHTML = `<p class="small muted mt-1" style="font-weight:700;color:#fbbf24">
      ⚡ Follow-up:</p>`;

    const fuOpts = Object.assign({ container }, this.followUp);
    const fuId = this.id + '_fu';
    fuOpts.id = fuId;
    fuOpts.container = container;
    new MCQ(fuOpts);
  }

  reset() {
    this._answered = false;
    this._selected = null;
    const root = document.getElementById(this.id);
    if (!root) return;

    root.querySelectorAll('.mcq-option').forEach(btn => {
      btn.classList.remove('disabled', 'selected', 'correct', 'wrong');
    });

    const fb = document.getElementById(`${this.id}_feedback`);
    if (fb) { fb.className = 'mcq-feedback'; fb.innerHTML = ''; }

    const pts = document.getElementById(`${this.id}_pts`);
    if (pts) { pts.textContent = '+0'; pts.style.color = ''; }

    const followup = document.getElementById(`${this.id}_followup`);
    if (followup) followup.innerHTML = '';
  }

  // Plain C++ — just HTML-escape, no span injection
  _syntaxHL(code) {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/* ============================================================
   Factory — initialise all MCQ instances declared in HTML
   via data-mcq attributes
   ============================================================ */

function initAllMCQs() {
  document.querySelectorAll('[data-mcq-id]').forEach(container => {
    const id      = container.dataset.mcqId;
    const correct = container.dataset.mcqCorrect;
    const explain = container.dataset.mcqExplain || '';
    const points  = parseInt(container.dataset.mcqPoints || '1', 10);
    const question = container.dataset.mcqQuestion || '';
    const codeRaw  = container.dataset.mcqCode || '';

    const optEls = container.querySelectorAll('[data-mcq-opt]');
    const options = Array.from(optEls).map(el => ({
      key:  el.dataset.mcqOpt,
      text: el.textContent.trim()
    }));

    new MCQ({ id, container, correct, explain, points, question, code: codeRaw || null, options });
  });
}

/* ============================================================
   Icebreaker poll handler
   ============================================================ */

function initIcebreaker() {
  const responses = {
    never:    { emoji: '🎯', text: "Perfect. You're exactly where we wanted you. No experience? No problem — you're starting fresh and that's the best way." },
    little:   { emoji: '💪', text: "Okay, you've got a head start. Try not to spoil the answers for everyone else." },
    regular:  { emoji: '😏', text: "Bro, don't spoil the answers. Also... help your neighbour out later 😄" }
  };

  document.querySelectorAll('.ice-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.iceType;
      const r = responses[type];
      if (!r) return;

      // Animate out buttons
      document.querySelectorAll('.ice-opt-btn').forEach(b => {
        b.style.opacity = '0.4';
        b.style.pointerEvents = 'none';
      });
      btn.style.opacity = '1';
      btn.style.border = '2px solid var(--accent-cyan)';

      const resp = document.getElementById('ice-response');
      if (resp) {
        resp.innerHTML = `<span style="font-size:1.5em">${r.emoji}</span> ${r.text}`;
        resp.classList.add('visible');
      }
    });
  });
}

/* ============================================================
   Path Selector (roadmap)
   ============================================================ */

function initPathSelector() {
  const paths = {
    building: {
      emoji: '🏗️',
      title: 'Web / App Development',
      text:  'Start with HTML, CSS, JavaScript. Then pick React or Flutter. Build things you can show people. Projects are your portfolio.'
    },
    solving: {
      emoji: '🧩',
      title: 'Problem Solving / Competitive',
      text:  'Focus on C++ or Python fundamentals, then move to DSA. Platforms like Codeforces, LeetCode, and CodeChef will be your gym.'
    },
    ai: {
      emoji: '🤖',
      title: 'AI / Machine Learning',
      text:  'First build a strong programming + math (linear algebra, probability) foundation. Then Python → NumPy → scikit-learn → deep learning.'
    },
    unknown: {
      emoji: '🧭',
      title: "Explorer Mode — totally valid",
      text:  "Spend your first month just learning the basics. Try one small project from each area. Let curiosity guide you. You'll figure it out."
    }
  };

  document.querySelectorAll('.path-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.path-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.pathType;
      const p = paths[type];
      if (!p) return;

      const result = document.getElementById('path-result');
      if (result) {
        result.innerHTML = `
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="font-size:1.8em;line-height:1">${p.emoji}</span>
            <div>
              <div style="font-weight:800;color:var(--accent-cyan);margin-bottom:4px">${p.title}</div>
              <div style="color:var(--text-muted);font-size:0.88em;line-height:1.5">${p.text}</div>
            </div>
          </div>`;
        result.classList.add('visible');
      }
    });
  });
}

/* ============================================================
   Hint system
   ============================================================ */

function initHints() {
  document.querySelectorAll('.hint-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.hintTarget;
      const target = document.getElementById(targetId);
      if (!target) return;

      target.classList.add('visible');
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    });
  });
}

/* ============================================================
   Step reveal system
   ============================================================ */

function initStepReveal() {
  document.querySelectorAll('.step-reveal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.revealTarget;
      const target = document.getElementById(targetId);
      if (!target) return;

      target.style.display = 'flex';
      target.classList.add('animate-fadeinup');

      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
    });
  });
}

/* ============================================================
   Rapid-fire Final Quiz
   ============================================================ */

class RapidQuiz {
  constructor(containerId, questions) {
    this.container  = document.getElementById(containerId);
    this.questions  = questions;
    this.current    = 0;
    this.score      = 0;
    this.answered   = [];
    if (this.container) this.render();
  }

  render() {
    const q = this.questions[this.current];
    if (!q) { this._showResult(); return; }

    const total = this.questions.length;
    const opts  = q.options.map(o => `
      <button class="mcq-option rq-opt" data-key="${o.key}">
        <span class="mcq-option-key">${o.key}</span>
        <span>${o.text}</span>
      </button>`).join('');

    this.container.innerHTML = `
      <div class="quiz-container animate-fadeinup">
        <div class="quiz-qnum">QUESTION ${this.current + 1} / ${total}</div>
        <p class="mcq-question">${q.question}</p>
        <div class="mcq-options">${opts}</div>
        <div id="rq_feedback" class="mcq-feedback"></div>
        <div id="rq_next" style="display:none;margin-top:12px">
          <button class="btn btn-cyan btn-sm" id="rq_next_btn">
            ${this.current < total - 1 ? 'Next Question →' : 'See Results 🎯'}
          </button>
        </div>
      </div>`;

    this.container.querySelectorAll('.rq-opt').forEach(btn => {
      btn.addEventListener('click', () => this._answer(btn.dataset.key, q.correct, q.explain));
    });
  }

  _answer(key, correct, explain) {
    const isCorrect = key === correct;
    if (isCorrect) this.score++;
    this.answered.push(isCorrect);

    this.container.querySelectorAll('.rq-opt').forEach(btn => {
      btn.classList.add('disabled');
      if (btn.dataset.key === correct) btn.classList.add('correct');
      else if (btn.dataset.key === key && !isCorrect) btn.classList.add('wrong');
    });

    const fb = document.getElementById('rq_feedback');
    if (fb) {
      if (isCorrect) {
        fb.className = 'mcq-feedback correct animate-fadeinup';
        fb.innerHTML = `<span class="fb-emoji">✅</span> <span class="fb-title">Correct!</span> <div class="fb-explain">${explain}</div>`;
      } else {
        fb.className = 'mcq-feedback wrong animate-fadeinup';
        fb.innerHTML = `<span class="fb-emoji">🤔</span> <span class="fb-title">Answer is ${correct}.</span> <div class="fb-explain">${explain}</div>`;
      }
    }

    const nextDiv = document.getElementById('rq_next');
    if (nextDiv) nextDiv.style.display = 'block';

    const nextBtn = document.getElementById('rq_next_btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.current++;
        this.render();
      });
    }
  }

  _showResult() {
    const total  = this.questions.length;
    const pct    = Math.round((this.score / total) * 100);
    const stars  = pct >= 80 ? '⭐⭐⭐' : pct >= 50 ? '⭐⭐' : '⭐';
    const { rank, color } = WorkshopScore.getRank();

    this.container.innerHTML = `
      <div class="xp-display animate-bouncein">
        <div class="xp-num">${pct}</div>
        <div class="xp-label">PROGRAMMING XP</div>
        <div class="xp-stars">${stars}</div>
        <div style="margin-top:16px;font-size:1.1em;font-weight:800;color:${color}">${rank}</div>
        <div style="margin-top:8px;color:var(--text-muted);font-size:0.82em">
          ${this.score} / ${total} correct
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:16px" onclick="rapidQuizInstance.current=0;rapidQuizInstance.score=0;rapidQuizInstance.render()">
          ↺ Try Again
        </button>
      </div>`;

    // Update global score display
    const xpEl = document.getElementById('final-xp');
    if (xpEl) xpEl.textContent = pct;
  }
}

// Global reference for reset
window.rapidQuizInstance = null;

/* ============================================================
   DOMContentLoaded — wire everything up
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initIcebreaker();
  initPathSelector();
  initHints();
  initStepReveal();
});

// Expose for use in HTML
window.MCQ         = MCQ;
window.RapidQuiz   = RapidQuiz;
window.initAllMCQs = initAllMCQs;
