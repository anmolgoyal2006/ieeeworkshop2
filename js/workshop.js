/* ============================================================
   WORKSHOP.JS — Main orchestrator
   CS Chapter Workshop — Intro to Programming
   Boots Reveal.js, wires slide events, initialises all MCQs.
   ============================================================ */

'use strict';

/* ============================================================
   MCQ Data
   ============================================================ */
const MCQ_DATA = {
  /* Slide 3 — Compiler MCQ */
  compiler: {
    id:       'mcq-compiler',
    question: 'Does a computer directly understand the C++ code we write?',
    options:  [
      { key: 'A', text: 'Yes, it runs it directly' },
      { key: 'B', text: 'No — it needs to be translated first' },
      { key: 'C', text: 'Only on Sundays 😂' },
      { key: 'D', text: 'Only if the code is short' }
    ],
    correct: 'B',
    explain: 'Computers only understand machine code (0s and 1s). A compiler translates our human-readable C++ into machine code the processor can execute.',
    points:  1
  },

  /* Slide 4 — Hello World MCQ */
  helloWorld: {
    id:       'mcq-helloworld',
    question: 'What do you THINK this program prints?',
    options:  [
      { key: 'A', text: 'Hello World!' },
      { key: 'B', text: 'Error' },
      { key: 'C', text: '0' },
      { key: 'D', text: 'Nothing' }
    ],
    correct: 'A',
    explain: 'cout << "Hello World!" sends the text to the screen. This is literally the first program almost every developer ever writes.',
    points:  1
  },

  /* Slide 7 — Variable type MCQ */
  varType: {
    id:       'mcq-vartype',
    question: 'Which data type would you use to store someone\'s age?',
    options:  [
      { key: 'A', text: 'int — whole number' },
      { key: 'B', text: 'string — text' },
      { key: 'C', text: 'bool — true/false' },
      { key: 'D', text: 'char — single character' }
    ],
    correct: 'A',
    explain: 'Age is a whole number (18, 21, 50), so int is the right choice. string would store "18" as text, bool is only true/false, and char holds a single letter.',
    points:  1
  },

  /* Slide 9 — Guess the Output MCQ */
  guessOutput: {
    id:       'mcq-guessoutput',
    question: 'What will be printed?',
    code: `int marks = 35;
if (marks >= 40)
    cout << "PASS";
else
    cout << "FAIL";`,
    options:  [
      { key: 'A', text: 'PASS' },
      { key: 'B', text: 'FAIL' },
      { key: 'C', text: '35' },
      { key: 'D', text: 'Error' }
    ],
    correct: 'B',
    explain: '35 is NOT >= 40, so the else branch runs and prints "FAIL". The condition 35 >= 40 is false.',
    points:  1,
    followUp: {
      question: 'Now what if marks = 40?',
      options:  [
        { key: 'A', text: 'PASS' },
        { key: 'B', text: 'FAIL' }
      ],
      correct: 'A',
      explain: '40 >= 40 is TRUE (>= means "greater than or equal to"), so it prints "PASS". The boundary matters!',
      points:  1
    }
  },

  /* Slide 11 — Loop MCQ */
  loopOutput: {
    id:       'mcq-loopoutput',
    question: 'What will be printed?',
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
    explain: 'The loop starts at i=1, runs while i<=3, prints i each time (1, 2, 3), then increments. So output is 123. Loop runs exactly 3 times.',
    points:  1
  },

  /* Slide 14 — Debug MCQ */
  debug: {
    id:       'mcq-debug',
    question: 'What\'s wrong with this code?',
    code: `if (marks = 40)
    cout << "Pass";`,
    options:  [
      { key: 'A', text: 'Nothing — it looks fine' },
      { key: 'B', text: '= should be == for comparison' },
      { key: 'C', text: 'marks should be a string' },
      { key: 'D', text: 'if cannot be used here' }
    ],
    correct: 'B',
    explain: '= is ASSIGNMENT (stores 40 into marks). == is COMPARISON (checks if marks equals 40). This is one of the most common beginner mistakes — even experienced developers make it occasionally!',
    points:  1
  }
};

/* ============================================================
   Rapid Quiz questions
   ============================================================ */
const RAPID_QUIZ = [
  {
    question: 'What does <code style="background:rgba(0,212,255,0.1);padding:2px 8px;border-radius:4px;font-family:monospace">cout</code> do?',
    options:  [
      { key: 'A', text: 'Takes input from user' },
      { key: 'B', text: 'Prints output to screen' },
      { key: 'C', text: 'Creates a loop' },
      { key: 'D', text: 'Compares two values' }
    ],
    correct: 'B',
    explain:  'cout = "character output". It sends data to the screen. cin is the opposite — it reads input.'
  },
  {
    question: 'What does if/else help us do?',
    options:  [
      { key: 'A', text: 'Repeat an action' },
      { key: 'B', text: 'Store data in memory' },
      { key: 'C', text: 'Make decisions based on conditions' },
      { key: 'D', text: 'Compile the code' }
    ],
    correct: 'C',
    explain:  'if/else lets us run different code depending on whether a condition is true or false. It\'s how programs make decisions.'
  },
  {
    question: 'Why do we use loops?',
    options:  [
      { key: 'A', text: 'To repeat instructions without rewriting them' },
      { key: 'B', text: 'To store text in memory' },
      { key: 'C', text: 'To take user input' },
      { key: 'D', text: 'To fix syntax errors' }
    ],
    correct: 'A',
    explain:  'Loops let us execute the same block of code multiple times. Instead of writing cout 100 times, write it once inside a loop!'
  },
  {
    question: 'What is the FIRST thing you should do when solving a programming problem?',
    options:  [
      { key: 'A', text: 'Start typing random code' },
      { key: 'B', text: 'Copy code from Google' },
      { key: 'C', text: 'Understand and break down the problem' },
      { key: 'D', text: 'Use recursion immediately' }
    ],
    correct: 'C',
    explain:  'Always think before you type. Understand the problem, break it into steps, then write the algorithm. Coding without thinking leads to messy bugs.'
  }
];

/* ============================================================
   Initialise all MCQs when the slide becomes active
   ============================================================ */
function mountMCQ(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  // Avoid double-mounting
  if (container.dataset.mounted) return;
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

/* ============================================================
   Reveal.js initialisation
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Boot Reveal
  Reveal.initialize({
    hash:              true,
    slideNumber:       false,
    controls:          true,
    controlsTutorial:  false,
    progress:          true,
    center:            false,
    transition:        'slide',
    transitionSpeed:   'fast',
    backgroundTransition: 'fade',
    width:             1280,
    height:            800,
    margin:            0.0,
    minScale:          0.1,
    maxScale:          2.0,
    fragments:         true,
    fragmentInURL:     false,
    keyboard:          true,
    overview:          true,
    touch:             true,
    loop:              false,
    rtl:               false,
    shuffle:           false,
    mouseWheel:        false,
    hideInactiveCursor: true,
    hideCursorTime:    3000,
    preloadIframes:    null,
    autoAnimate:       true,
    autoAnimateDuration: 0.4,
    pdfSeparateFragments: false,
    disableLayout:     false,
    plugins: [
      typeof RevealHighlight !== 'undefined' ? RevealHighlight : null,
      typeof RevealNotes    !== 'undefined' ? RevealNotes    : null,
      typeof RevealZoom     !== 'undefined' ? RevealZoom     : null
    ].filter(Boolean)
  });

  /* ── Slide change handler ── */
  Reveal.on('slidechanged', event => {
    const idx    = event.indexh;
    const total  = Reveal.getTotalSlides();

    // Update progress bar
    if (window.updateWorkshopProgress) {
      updateWorkshopProgress(idx, total);
    }

    // Level toasts
    if (window.LEVELS) {
      const level = LEVELS.find(l => l.slide === idx);
      if (level) showLevelToast(level);
    }

    // Mount MCQs lazily when their slide is reached
    const mcqMap = {
      2:  ['mcq-compiler-container',  MCQ_DATA.compiler],
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

    // Init rapid quiz
    if (idx === 17 && !window.rapidQuizInstance) {
      window.rapidQuizInstance = new RapidQuiz('rapid-quiz-container', RAPID_QUIZ);
    }

    // Re-init loop animation on slide 9 (index 9)
    if (idx === 9 && window.initLoopAnimation) {
      initLoopAnimation();
    }

    // Re-init Maggi animation when slide 1 is reached
    if (idx === 1 && window.initMaggiAnimation) {
      initMaggiAnimation();
    }

    // Re-init compiler pipeline when slide 2 is reached
    if (idx === 2 && window.initCompilerPipeline) {
      initCompilerPipeline();
    }

    // Re-init attendance demo when slide 7 is reached
    if (idx === 7 && window.initAttendanceDemo) {
      initAttendanceDemo();
    }

    // Re-init algorithm builder when slide 11 is reached
    if (idx === 11 && window.initAlgorithmBuilder) {
      initAlgorithmBuilder();
    }

    // Re-init debug slide when slide 13 is reached
    if (idx === 13 && window.initDebugSlide) {
      initDebugSlide();
    }

    // Re-init IO pulse when slide 5 is reached
    if (idx === 5 && window.initIOPulse) {
      initIOPulse();
    }

    // Re-init type selector when slide 6 is reached
    if (idx === 6 && window.initTypeSelector) {
      initTypeSelector();
    }
  });

  /* ── Fragment shown ── */
  Reveal.on('fragmentshown', event => {
    const el = event.fragment;
    if (el && el.dataset.animation) {
      el.classList.add('animate-' + el.dataset.animation);
    }
  });

  // Initial progress
  if (window.updateWorkshopProgress) {
    updateWorkshopProgress(0, Reveal.getTotalSlides());
  }

  /* ── Delegated click handlers for all dynamic slide buttons ── */
  document.addEventListener('click', e => {

    // Maggi robot response buttons
    const maggiBtn = e.target.closest('.maggi-resp-btn');
    if (maggiBtn) {
      document.querySelectorAll('.maggi-resp-btn').forEach(b => {
        b.style.opacity = '0.4';
        b.style.pointerEvents = 'none';
      });
      maggiBtn.style.opacity = '1';
      maggiBtn.style.borderColor = 'var(--accent-cyan)';
      const resp = document.getElementById('maggi-resp');
      if (resp) {
        resp.textContent = maggiBtn.dataset.response;
        resp.style.display = 'block';
        resp.classList.add('animate-fadeinup');
      }
    }

    // Mission complete button
    if (e.target.closest('#mission-complete-btn')) {
      const el = document.getElementById('mission-complete-block');
      const btn = document.getElementById('mission-complete-btn');
      if (el) { el.style.display = 'block'; el.classList.add('animate-bouncein'); }
      if (btn) btn.style.display = 'none';
    }

    // Solution reveal button (slide 13)
    if (e.target.closest('#solution-reveal-btn')) {
      const b = document.getElementById('solution-block');
      const rb = document.getElementById('solution-reveal-btn');
      if (b) { b.style.display = 'block'; b.classList.add('animate-fadeinup'); }
      if (rb) { rb.style.opacity = '0.5'; rb.style.pointerEvents = 'none'; }
    }

  });
    });
  });

});

/* ── Keyboard shortcuts ── */
