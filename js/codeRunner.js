/* ============================================================
   CODERUNNER.JS — Simulated C++ Code Runner
   CS Chapter Workshop — Intro to Programming
   ============================================================
   This is a CONTROLLED SIMULATION — not a real compiler.
   Each code example has a defined behaviour.
   ============================================================ */

'use strict';

/* ── Plain code display (no syntax highlighting — keeps it clean and readable) ── */
function syntaxHL(code) {
  // Just HTML-escape, no coloring — plain C++ as written
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ── Typing animation for output ── */
async function typeOutput(el, lines, delayBetween = 60) {
  el.innerHTML = '';
  for (const line of lines) {
    const div = document.createElement('div');
    div.innerHTML = line.html;
    el.appendChild(div);
    await new Promise(r => setTimeout(r, delayBetween));
    el.scrollTop = el.scrollHeight;
  }
}

/* ── Build code lines with line numbers ── */
function buildCodeLines(codeStr) {
  return codeStr.split('\n').map((line, i) => `
    <div class="line">
      <span class="ln">${i + 1}</span>
      <span>${syntaxHL(line)}</span>
    </div>`).join('');
}

/* ============================================================
   CodeRunner class
   ============================================================ */
class CodeRunner {
  /**
   * @param {object} opts
   *   id          {string}   DOM id of the .code-runner element
   *   code        {string}   C++ source code to display
   *   outputLines {Array}    Array of {html, delay?} output line objects
   *   hasInput    {boolean}  Whether to show an input field
   *   inputLabel  {string}   Label for the input field
   *   onRun       {function} Custom run handler (receives inputVal, outputEl)
   *   extraBtns   {Array}    [{label, onClick}] extra buttons
   */
  constructor(opts) {
    this.id          = opts.id;
    this.code        = opts.code        || '';
    this.outputLines = opts.outputLines || [];
    this.hasInput    = opts.hasInput    || false;
    this.inputLabel  = opts.inputLabel  || 'Enter input:';
    this.onRun       = opts.onRun       || null;
    this.extraBtns   = opts.extraBtns   || [];
    this._running    = false;

    this._el = document.getElementById(this.id);
    if (this._el) this._init();
  }

  _init() {
    // wire run button
    const runBtn = this._el.querySelector('.cr-run-btn');
    if (runBtn) runBtn.addEventListener('click', () => this.run());

    // wire reset
    const resetBtn = this._el.querySelector('.cr-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    // wire extra buttons
    const extraContainer = this._el.querySelector('.cr-extra-btns');
    if (extraContainer && this.extraBtns.length) {
      this.extraBtns.forEach(eb => {
        const b = document.createElement('button');
        b.className   = 'cr-extra-btn';
        b.textContent = eb.label;
        b.addEventListener('click', () => eb.onClick(this));
        extraContainer.appendChild(b);
      });
    }

    // set initial code
    const codeArea = this._el.querySelector('.code-editor-area');
    if (codeArea) codeArea.innerHTML = buildCodeLines(this.code);

    // show/hide input section
    const inputSec = this._el.querySelector('.cr-input-section');
    if (inputSec && this.hasInput) inputSec.classList.add('visible');
  }

  async run() {
    if (this._running) return;
    this._running = true;

    const runBtn   = this._el.querySelector('.cr-run-btn');
    const outputEl = this._el.querySelector('.output-body');
    if (!outputEl) { this._running = false; return; }

    // Update button state
    if (runBtn) {
      runBtn.classList.add('running');
      runBtn.innerHTML = '⏳ Running...';
    }

    // Get input value if present
    const inputField = this._el.querySelector('.cr-input-field');
    const inputVal   = inputField ? inputField.value.trim() : '';

    // Compile / run animation
    outputEl.innerHTML = '';
    await typeOutput(outputEl, [
      { html: '<span class="out-prompt">$</span> <span class="out-compile">Compiling...</span>' },
    ], 0);
    await new Promise(r => setTimeout(r, 500));

    await typeOutput(outputEl, [
      { html: '<span class="out-prompt">$</span> <span class="out-compile">Compiling...</span>' },
      { html: '<span class="out-running">▶ Running program...</span>' }
    ], 0);
    await new Promise(r => setTimeout(r, 500));

    // Run custom handler or default output
    if (this.onRun) {
      await this.onRun(inputVal, outputEl, typeOutput);
    } else {
      const lines = this.outputLines.length
        ? this.outputLines
        : [{ html: '<span class="out-result">Program output here</span>' }];

      await typeOutput(outputEl, [
        { html: '<span class="out-prompt">$</span> <span class="out-compile">Compiling...</span>' },
        { html: '<span class="out-running">▶ Running program...</span>' },
        ...lines
      ], 70);
    }

    // Append done line
    const doneDiv = document.createElement('div');
    doneDiv.innerHTML = '<span class="out-done">── Program finished ──</span>';
    outputEl.appendChild(doneDiv);

    if (runBtn) {
      runBtn.classList.remove('running');
      runBtn.innerHTML = '▶ Run Again';
    }

    this._running = false;
  }

  updateCode(newCode) {
    this.code = newCode;
    const codeArea = this._el.querySelector('.code-editor-area');
    if (codeArea) codeArea.innerHTML = buildCodeLines(newCode);
  }

  reset() {
    const codeArea = this._el.querySelector('.code-editor-area');
    if (codeArea) codeArea.innerHTML = buildCodeLines(this.code);

    const outputEl = this._el.querySelector('.output-body');
    if (outputEl) outputEl.innerHTML = '<span class="out-prompt cursor-blink"></span>';

    const inputField = this._el.querySelector('.cr-input-field');
    if (inputField) inputField.value = '';

    const runBtn = this._el.querySelector('.cr-run-btn');
    if (runBtn) { runBtn.classList.remove('running'); runBtn.innerHTML = '▶ Run'; }

    this._running = false;
  }
}

/* ============================================================
   Pre-built runner configurations
   ============================================================ */

/* SLIDE 5 — Hello World runner */
function initHelloWorldRunner() {
  const baseCode = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CS Chapter!";
    return 0;
}`;

  const runner = new CodeRunner({
    id: 'runner-hello',
    code: baseCode,
    outputLines: [
      { html: '<span class="out-result">Hello, CS Chapter!</span>' }
    ],
    extraBtns: [
      {
        label: '✏️ Change Message',
        onClick(cr) {
          const msgInput = document.getElementById('hello-msg-input');
          const val = msgInput ? msgInput.value.trim() : 'Hello, Future Coder!';
          const newCode = baseCode.replace(
            '"Hello, CS Chapter!"',
            `"${val || 'Hello, Future Coder!'}"`
          );
          cr.code = newCode;
          cr.outputLines = [{ html: `<span class="out-result">${val || 'Hello, Future Coder!'}</span>` }];
          cr.updateCode(newCode);
        }
      }
    ]
  });

  return runner;
}

/* SLIDE 6 — Input / Output (addition) runner */
function initAdditionRunner() {
  return new CodeRunner({
    id: 'runner-addition',
    code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}`,
    hasInput: true,
    inputLabel: 'Enter two numbers (e.g. 7 8):',
    async onRun(inputVal, outputEl, typeOut) {
      const parts = inputVal.split(/\s+/).map(Number).filter(n => !isNaN(n));
      let outputHtml;
      if (parts.length >= 2) {
        const sum = parts[0] + parts[1];
        outputHtml = [
          { html: `<span class="out-running">▶ Input: ${parts[0]}, ${parts[1]}</span>` },
          { html: `<span class="out-result">${sum}</span>` }
        ];
      } else {
        outputHtml = [
          { html: '<span class="out-error">⚠ Please enter two numbers separated by a space</span>' }
        ];
      }
      const lines = [
        { html: '<span class="out-prompt">$</span> <span class="out-compile">Compiling...</span>' },
        { html: '<span class="out-running">▶ Running program...</span>' },
        ...outputHtml
      ];
      await typeOut(outputEl, lines, 70);
    }
  });
}

/* SLIDE 8 — Attendance if/else demo */
function initAttendanceDemo() {
  const slider    = document.getElementById('attendance-slider');
  const sliderVal = document.getElementById('attendance-val');
  const resultEl  = document.getElementById('attendance-result');
  const codeEl    = document.getElementById('attendance-code');

  if (!slider) return;

  function update(val) {
    if (sliderVal) sliderVal.textContent = val + '%';
    const isAllowed = val >= 75;
    if (resultEl) {
      resultEl.textContent = isAllowed ? '✅ Allowed' : '❌ Not Allowed';
      resultEl.style.color      = isAllowed ? 'var(--accent-green)' : '#f87171';
      resultEl.style.background = isAllowed ? 'rgba(34,197,94,0.1)'  : 'rgba(239,68,68,0.1)';
      resultEl.style.border     = isAllowed ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)';
    }
    if (codeEl) {
      codeEl.innerHTML = val >= 75
        ? `if (attendance &gt;= 75) {<br>&nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; "Allowed";<br>} else {<br>&nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; "Not Allowed";<br>}`
        : `if (attendance &gt;= 75) {<br>&nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; "Allowed";<br>} else {<br>&nbsp;&nbsp;&nbsp;&nbsp;cout &lt;&lt; "Not Allowed"; <span style="color:var(--text-dim)">// ← this runs</span><br>}`;
    }
  }

  // Idempotent — replace listener by cloning the slider element
  const newSlider = slider.cloneNode(true);
  slider.parentNode.replaceChild(newSlider, slider);
  newSlider.addEventListener('input', () => update(parseInt(newSlider.value)));

  // Run immediately so result box is populated on first view
  update(parseInt(newSlider.value));
}

/* SLIDE 13 — Even/Odd challenge runner */
function initEvenOddRunner() {
  return new CodeRunner({
    id: 'runner-evenodd',
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n % 2 == 0)
        cout << "Even";
    else
        cout << "Odd";
    return 0;
}`,
    hasInput: true,
    inputLabel: 'Enter a number:',
    async onRun(inputVal, outputEl, typeOut) {
      const n = parseInt(inputVal, 10);
      let outputHtml;
      if (!isNaN(n)) {
        const result = n % 2 === 0 ? 'Even' : 'Odd';
        const color  = n % 2 === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)';
        outputHtml = [
          { html: `<span class="out-running">▶ Input: ${n}</span>` },
          { html: `<span style="color:${color};font-weight:700;font-size:1.2em">${result}</span>` }
        ];
      } else {
        outputHtml = [
          { html: '<span class="out-error">⚠ Please enter a valid integer</span>' }
        ];
      }
      const lines = [
        { html: '<span class="out-prompt">$</span> <span class="out-compile">Compiling...</span>' },
        { html: '<span class="out-running">▶ Running program...</span>' },
        ...outputHtml
      ];
      await typeOut(outputEl, lines, 80);
    }
  });
}

/* SLIDE 19 — Final challenge runner */
function initFinalChallengeRunner() {
  return new CodeRunner({
    id: 'runner-final',
    code: `#include <iostream>
using namespace std;

int main() {
    int marks;
    cin >> marks;
    if (marks >= 40)
        cout << "PASS";
    else
        cout << "FAIL";
    return 0;
}`,
    hasInput: true,
    inputLabel: 'Enter marks (0–100):',
    async onRun(inputVal, outputEl, typeOut) {
      const marks = parseInt(inputVal, 10);
      let outputHtml;
      if (!isNaN(marks) && marks >= 0 && marks <= 100) {
        const result = marks >= 40 ? 'PASS ✅' : 'FAIL ❌';
        const color  = marks >= 40 ? 'var(--accent-green)' : '#f87171';
        outputHtml = [
          { html: `<span class="out-running">▶ Marks: ${marks}</span>` },
          { html: `<span style="color:${color};font-weight:900;font-size:1.4em">${result}</span>` }
        ];
      } else {
        outputHtml = [
          { html: '<span class="out-error">⚠ Enter a number between 0 and 100</span>' }
        ];
      }
      const lines = [
        { html: '<span class="out-prompt">$</span> <span class="out-compile">Compiling...</span>' },
        { html: '<span class="out-running">▶ Running program...</span>' },
        ...outputHtml
      ];
      await typeOut(outputEl, lines, 80);
    }
  });
}

/* ============================================================
   DOMContentLoaded — boot all runners
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Hello World runner (Slide 5)
  if (document.getElementById('runner-hello')) {
    window.helloRunner = initHelloWorldRunner();
  }

  // Addition runner (Slide 6)
  if (document.getElementById('runner-addition')) {
    window.additionRunner = initAdditionRunner();
  }

  // Attendance demo (Slide 8)
  initAttendanceDemo();

  // Even/Odd runner (Slide 13)
  if (document.getElementById('runner-evenodd')) {
    window.evenOddRunner = initEvenOddRunner();
  }

  // Final challenge runner (Slide 19)
  if (document.getElementById('runner-final')) {
    window.finalRunner = initFinalChallengeRunner();
  }
});

// Expose
window.CodeRunner            = CodeRunner;
window.syntaxHL              = syntaxHL;
window.buildCodeLines        = buildCodeLines;
window.initHelloWorldRunner  = initHelloWorldRunner;
window.initAdditionRunner    = initAdditionRunner;
window.initEvenOddRunner     = initEvenOddRunner;
window.initAttendanceDemo    = initAttendanceDemo;
window.initFinalChallengeRunner = initFinalChallengeRunner;
