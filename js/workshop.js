/* ============================================================
   WORKSHOP.JS — Main Orchestrator & Interactive Controllers
   CS Chapter Workshop — Intro to Programming
   ============================================================ */

'use strict';

/* ============================================================
   MCQ DATA DEFINITIONS
   ============================================================ */
const MCQ_DATA = {
  compiler: {
    id:       'mcq-compiler',
    question: 'Does a computer directly understand human-written C++ code?',
    options:  [
      { key: 'A', text: 'Yes, CPU runs C++ text directly' },
      { key: 'B', text: 'No — it must be compiled into machine code first' },
      { key: 'C', text: 'Only on Linux machines 😂' },
      { key: 'D', text: 'Only if the file is small' }
    ],
    correct: 'B',
    explain: 'Computers only execute binary machine code (0s and 1s). The C++ compiler translates our human-readable instructions into CPU-executable machine instructions.',
    points:  1
  },

  helloWorld: {
    id:       'mcq-helloworld',
    question: 'What do you predict this program will output?',
    options:  [
      { key: 'A', text: 'Hello World!' },
      { key: 'B', text: 'Compilation Error' },
      { key: 'C', text: '0' },
      { key: 'D', text: 'Nothing' }
    ],
    correct: 'A',
    explain: 'cout << "Hello World!" sends the text stream to the screen terminal. This is the universal first milestone for developers.',
    points:  1
  },

  varType: {
    id:       'mcq-vartype',
    question: 'Which C++ data type would you select to store a student\'s age?',
    options:  [
      { key: 'A', text: 'int — whole number' },
      { key: 'B', text: 'string — text' },
      { key: 'C', text: 'bool — true/false flag' },
      { key: 'D', text: 'char — single character' }
    ],
    correct: 'A',
    explain: 'Age is a discrete integer (18, 19, 21), making int optimal. string stores text, bool is binary truth, and char is a single byte letter.',
    points:  1
  },

  guessOutput: {
    id:       'mcq-guessoutput',
    question: 'What will be printed to the console?',
    code: `int marks = 35;
if (marks >= 40)
    cout << "PASS";
else
    cout << "FAIL";`,
    options:  [
      { key: 'A', text: 'PASS' },
      { key: 'B', text: 'FAIL' },
      { key: 'C', text: '35' },
      { key: 'D', text: 'Syntax Error' }
    ],
    correct: 'B',
    explain: '35 is NOT >= 40, so the condition evaluates to false and executes the else branch, outputting "FAIL".',
    points:  1,
    followUp: {
      question: '⚡ Follow-up: What if marks = 40 exactly?',
      options:  [
        { key: 'A', text: 'PASS' },
        { key: 'B', text: 'FAIL' }
      ],
      correct: 'A',
      explain: '40 >= 40 is TRUE because >= means "greater than or equal to". Boundary conditions are critical in CSE!',
      points:  1
    }
  },

  loopOutput: {
    id:       'mcq-loopoutput',
    question: 'What will this loop output?',
    code: `for(int i = 1; i <= 3; i++) {
    cout << i;
}`,
    options:  [
      { key: 'A', text: '123' },
      { key: 'B', text: '0123' },
      { key: 'C', text: '1234' },
      { key: 'D', text: '111' }
    ],
    correct: 'A',
    explain: 'Loop initializes i=1, prints 1, increments to 2, prints 2, increments to 3, prints 3. At i=4, condition 4<=3 fails and loop terminates.',
    points:  1
  },

  debug: {
    id:       'mcq-debug',
    question: 'What is the bug in this decision statement?',
    code: `if (marks = 40)
    cout << "Pass";`,
    options:  [
      { key: 'A', text: 'Nothing — syntax is valid' },
      { key: 'B', text: '= (assignment) should be == (equality comparison)' },
      { key: 'C', text: 'marks variable must be in double quotes' },
      { key: 'D', text: 'if statement requires an else block' }
    ],
    correct: 'B',
    explain: 'Single = is variable ASSIGNMENT (sets marks to 40). Double == is EQUALITY COMPARISON. This is the #1 classic bug in beginner C++!',
    points:  1
  }
};

/* ============================================================
   RAPID QUIZ QUESTIONS (Slide 18)
   ============================================================ */
const RAPID_QUIZ = [
  {
    question: 'What does the <code style="color:var(--accent-cyan)">cout &lt;&lt;</code> stream operator do in C++?',
    options:  [
      { key: 'A', text: 'Takes input from the keyboard' },
      { key: 'B', text: 'Prints output to the console' },
      { key: 'C', text: 'Declares an infinite loop' },
      { key: 'D', text: 'Deletes RAM allocation' }
    ],
    correct: 'B',
    explain:  'cout stands for "Character Output" and sends data to the standard output terminal.'
  },
  {
    question: 'What is the primary role of <code style="color:var(--accent-purple)">if / else</code> control flow?',
    options:  [
      { key: 'A', text: 'Repeat code 100 times' },
      { key: 'B', text: 'Allocate heap memory' },
      { key: 'C', text: 'Make decisions based on condition evaluation' },
      { key: 'D', text: 'Compile C++ into bytecode' }
    ],
    correct: 'C',
    explain:  'Conditional statements let programs branch and take different actions based on dynamic values.'
  },
  {
    question: 'Why do software engineers use loops (<code style="color:var(--accent-green)">for / while</code>)?',
    options:  [
      { key: 'A', text: 'To repeat instructions without duplicate code' },
      { key: 'B', text: 'To convert numbers into text strings' },
      { key: 'C', text: 'To restart the operating system' },
      { key: 'D', text: 'To auto-fix compiler bugs' }
    ],
    correct: 'A',
    explain:  'Loops implement DRY (Don\'t Repeat Yourself) — allowing 1000s of iterations in 3 lines of code.'
  },
  {
    question: 'What is the FIRST thing you should do when given a programming problem?',
    options:  [
      { key: 'A', text: 'Start typing syntax immediately' },
      { key: 'B', text: 'Copy-paste code blindly' },
      { key: 'C', text: 'Understand problem & formulate step-by-step logic' },
      { key: 'D', text: 'Give up and ask ChatGPT' }
    ],
    correct: 'C',
    explain:  'Thinking and algorithm planning takes 80% of development. Writing the syntax is just the translation step.'
  }
];

/* ============================================================
   CODE RUNNERS INITIALIZATION
   ============================================================ */
function initCodeRunners() {
  // 1. Hello World Runner (Slide 5)
  const runnerHello = new CodeRunner({
    id: 'runner-hello',
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Future Coder!" << endl;
    return 0;
}`,
    outputLines: [
      { html: '<span style="color:#a7f3d0">Hello, Future Coder!</span>' }
    ]
  });

  const msgInput = document.getElementById('hello-msg-input');
  if (msgInput) {
    msgInput.addEventListener('input', () => {
      const msg = msgInput.value.trim() || 'Hello, Future Coder!';
      runnerHello.setCode(`#include <iostream>
using namespace std;

int main() {
    cout << "${msg.replace(/"/g, '\\"')}" << endl;
    return 0;
}`);
      runnerHello.outputLines = [
        { html: `<span style="color:#a7f3d0">${msg}</span>` }
      ];
    });
  }

  // 2. Addition Runner (Slide 6)
  new CodeRunner({
    id: 'runner-addition',
    code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Result: " << (a + b) << endl;
    return 0;
}`,
    hasInput: true,
    inputLabel: 'Enter two numbers (e.g. 15 25):',
    onRun: async (val, outEl) => {
      const parts = val.split(/\s+/).map(Number);
      const a = !isNaN(parts[0]) ? parts[0] : 10;
      const b = !isNaN(parts[1]) ? parts[1] : 20;
      const sum = a + b;
      await typeOutput(outEl, [
        { html: `<span style="color:var(--text-muted)">Input received:</span> <span style="color:var(--accent-cyan)">${a}, ${b}</span>` },
        { html: `<span style="color:#a7f3d0;font-weight:700">Result: ${sum}</span>` }
      ], 40);
    }
  });

  // 3. Even / Odd Runner (Slide 13)
  new CodeRunner({
    id: 'runner-evenodd',
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n % 2 == 0) {
        cout << n << " is EVEN" << endl;
    } else {
        cout << n << " is ODD" << endl;
    }
    return 0;
}`,
    hasInput: true,
    inputLabel: 'Enter any whole integer:',
    onRun: async (val, outEl) => {
      const num = parseInt(val, 10) || 7;
      const isEven = num % 2 === 0;
      await typeOutput(outEl, [
        { html: `<span style="color:var(--text-muted)">Testing number:</span> <span style="color:var(--accent-cyan)">${num}</span>` },
        { html: `<span style="color:${isEven ? '#10b981' : '#fbbf24'};font-weight:700">${num} is ${isEven ? 'EVEN ⚡' : 'ODD 🔥'}</span>` }
      ], 40);
    }
  });

  // 4. Final Challenge Runner (Slide 19)
  new CodeRunner({
    id: 'runner-final',
    code: `#include <iostream>
using namespace std;

int main() {
    int marks;
    cin >> marks;
    if (marks >= 40) {
        cout << "STATUS: PASS (Exam Cleared!)" << endl;
    } else {
        cout << "STATUS: FAIL (Keep practicing!)" << endl;
    }
    return 0;
}`,
    hasInput: true,
    inputLabel: 'Enter marks (0 - 100):',
    onRun: async (val, outEl) => {
      const marks = parseInt(val, 10) || 45;
      const isPass = marks >= 40;
      await typeOutput(outEl, [
        { html: `<span style="color:var(--text-muted)">Evaluated Marks:</span> <span style="color:var(--accent-cyan)">${marks}</span>` },
        { html: `<span style="color:${isPass ? '#10b981' : '#f43f5e'};font-weight:900;font-size:1.1em">${isPass ? '🏆 STATUS: PASS — Mission Accomplished!' : '❌ STATUS: FAIL — Need 40+ to Pass!'}</span>` }
      ], 40);
    }
  });
}

/* ============================================================
   HUD DOCK & PRESENTATION MODALS
   ============================================================ */
function initFloatingDock() {
  // Laser Pointer Toggle
  const laserBtn = document.getElementById('dock-laser-btn');
  // Sound Mute Toggle
  const audioBtn = document.getElementById('dock-audio-btn');
  if (audioBtn) {
    const isMuted = localStorage.getItem('cs_workshop_muted') === 'true';
    audioBtn.innerHTML = isMuted ? '🔇' : '🔊';
    audioBtn.classList.toggle('active', !isMuted);

    audioBtn.addEventListener('click', () => {
      const muted = window.soundEngine.toggleMute();
      audioBtn.innerHTML = muted ? '🔇' : '🔊';
      audioBtn.classList.toggle('active', !muted);
      if (window.showToast) window.showToast(muted ? 'Sound FX Muted' : 'Sound FX Enabled', 'info');
      if (!muted) window.soundEngine.playSuccess();
    });
  }

  // Fullscreen Toggle
  const fsBtn = document.getElementById('dock-fs-btn');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Slide Jump Navigator Modal
  const slideGridBtn = document.getElementById('dock-slides-btn');
  const slideModal = document.getElementById('slide-jump-modal');
  if (slideGridBtn && slideModal) {
    slideGridBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      buildSlideGrid();
      slideModal.classList.add('open');
    });
  }

  // Keyboard Shortcuts Modal
  const helpBtn = document.getElementById('dock-help-btn');
  const helpModal = document.getElementById('shortcuts-modal');
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      helpModal.classList.add('open');
    });
  }

  // Modal Close buttons
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        modal.classList.remove('open');
      });
    }
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    if (e.key === '?') {
      if (helpModal) helpModal.classList.toggle('open');
    }
    if (e.key === 'm' || e.key === 'M') {
      if (audioBtn) audioBtn.click();
    }
    if (e.key === 'f' || e.key === 'F') {
      if (fsBtn) fsBtn.click();
    }
    if (e.key === 'g' || e.key === 'G') {
      if (slideGridBtn) slideGridBtn.click();
    }
    if (e.key === 's' || e.key === 'S') {
      // Open Reveal's built-in speaker notes window
      if (typeof Reveal !== 'undefined' && Reveal.getPlugin('notes')) {
        Reveal.getPlugin('notes').open();
      }
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}

/* ── Build Slide Grid for Quick Navigator ── */
function buildSlideGrid() {
  const container = document.getElementById('slide-grid-container');
  if (!container) return;

  const slides = document.querySelectorAll('.reveal .slides > section');
  const curIdx = Reveal.getIndices().h;

  container.innerHTML = '';
  slides.forEach((s, idx) => {
    const titleEl = s.querySelector('h1, h2');
    const title = titleEl ? titleEl.textContent.replace(/[^\w\s—→?]/gi, '').trim() : `Slide ${idx + 1}`;

    const card = document.createElement('div');
    card.className = `slide-nav-card ${idx === curIdx ? 'current' : ''}`;
    card.innerHTML = `
      <div class="slide-nav-num">SLIDE ${idx + 1}</div>
      <div class="slide-nav-title">${title}</div>
    `;
    card.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      Reveal.slide(idx);
      document.getElementById('slide-jump-modal').classList.remove('open');
    });
    container.appendChild(card);
  });
}

/* ============================================================
   CERTIFICATE GENERATOR (Slide 19)
   ============================================================ */
function initCertificateModal() {
  const genBtn = document.getElementById('generate-cert-btn');
  const certModal = document.getElementById('cert-modal');
  const nameInput = document.getElementById('cert-name-input');
  const certNameDisplay = document.getElementById('cert-display-name');
  const printBtn = document.getElementById('print-cert-btn');

  if (genBtn && certModal) {
    genBtn.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playVictory();
      if (window.launchConfetti) window.launchConfetti(0.5, 0.4, 80);
      certModal.classList.add('open');
    });
  }

  if (nameInput && certNameDisplay) {
    nameInput.addEventListener('input', () => {
      certNameDisplay.textContent = nameInput.value.trim() || 'FUTURE TECH LEADER';
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ============================================================
   PROGRESS BAR & SLIDE MOUNTING
   ============================================================ */
function updateWorkshopProgress(idx, total) {
  const label = document.querySelector('#workshop-progress .prog-label');
  const fill  = document.querySelector('#workshop-progress .prog-bar-fill');
  if (label) label.innerHTML = `<span>⚡ SLIDE ${idx + 1} / ${total}</span>`;
  if (fill) fill.style.width = `${Math.round(((idx + 1) / total) * 100)}%`;
}

function mountMCQ(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.mounted) return;
  container.dataset.mounted = 'true';
  new MCQ({
    id:        data.id,
    container: container,
    code:      data.code || null,
    question:  data.question,
    options:   data.options,
    correct:   data.correct,
    explain:   data.explain,
    points:    data.points || 1,
    followUp:  data.followUp || null
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Boot CodeRunners
    initCodeRunners();

    // Boot Floating HUD Dock & Modals
    initFloatingDock();
    initCertificateModal();

    if (typeof Reveal !== 'undefined') {
      // Boot Reveal.js
      Reveal.initialize({
        hash:                 true,
        slideNumber:          false,
        controls:             true,
        controlsTutorial:     false,
        progress:             true,
        center:               false,
        transition:           'convex',
        transitionSpeed:      'default',
        backgroundTransition: 'zoom',
        width:                1280,
        height:               800,
        margin:               0.02,
        minScale:             0.2,
        maxScale:             2.0,
        keyboard:             true,
        touch:                true,
        overview:             false,
        plugins: [
          typeof RevealHighlight !== 'undefined' ? RevealHighlight : null,
          typeof RevealNotes     !== 'undefined' ? RevealNotes     : null,
          typeof RevealZoom      !== 'undefined' ? RevealZoom      : null
        ].filter(Boolean)
      });

      // Slide Change Events
      Reveal.on('slidechanged', event => {
        const idx   = event.indexh;
        const total = Reveal.getTotalSlides();
        updateWorkshopProgress(idx, total);

        // Mount MCQs on specific slides
        const mcqMap = {
          2:  ['mcq-compiler-container',   MCQ_DATA.compiler],
          3:  ['mcq-helloworld-container', MCQ_DATA.helloWorld],
          6:  ['mcq-vartype-container',    MCQ_DATA.varType],
          8:  ['mcq-guessoutput-container',MCQ_DATA.guessOutput],
          10: ['mcq-loopoutput-container', MCQ_DATA.loopOutput],
          13: ['mcq-debug-container',      MCQ_DATA.debug]
        };

        if (mcqMap[idx]) {
          const [cid, data] = mcqMap[idx];
          mountMCQ(data, cid);
        }

        // Mount Rapid Quiz on Slide 18 (index 17)
        if (idx === 17 && !window.rapidQuizInstance) {
          window.rapidQuizInstance = new RapidQuiz({
            container: document.getElementById('rapid-quiz-container'),
            questions: RAPID_QUIZ
          });
        }

        // Audio slide transition tick
        if (window.soundEngine) window.soundEngine.playClick();
      });

      // Initial Progress Bar
      updateWorkshopProgress(0, Reveal.getTotalSlides());
    }
  });
}
