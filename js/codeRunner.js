/* ============================================================
   CODERUNNER.JS — Ultra-Sleek Simulated C++ Code Runner
   CS Chapter Workshop — Intro to Programming
   ============================================================ */

'use strict';

/* ── C++ Syntax Highlighting Formatter ── */
function syntaxHLCpp(code) {
  const escapeHTML = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return code.split('\n').map((rawLine, idx) => {
    let line = escapeHTML(rawLine);

    // Comments
    if (line.includes('//')) {
      const parts = line.split('//');
      line = highlightTokens(parts[0]) + `<span class="syn-cmt">//${parts.slice(1).join('//')}</span>`;
    } else {
      line = highlightTokens(line);
    }

    return `
      <div class="line">
        <span class="ln">${idx + 1}</span>
        <span class="code-line-text">${line || '&nbsp;'}</span>
      </div>
    `;
  }).join('');
}

function highlightTokens(str) {
  // Single-pass tokenizer: match tokens left-to-right without ever re-scanning
  // already-tagged content. This prevents span attribute text from being
  // re-matched by later keyword/type/function patterns.

  const KEYWORDS  = new Set(['using','namespace','return','if','else','for','while','do','break','continue','class','struct']);
  const TYPES     = new Set(['int','double','float','char','string','bool','void','auto','std']);
  const FUNCTIONS = new Set(['main','cout','cin','endl']);

  // Token patterns tried left-to-right; first match wins.
  // Operates on the HTML-escaped string (< → &lt; etc.)
  const TOKEN_RE = new RegExp(
    [
      // 1. string literals (double-quoted)
      '("(?:[^"\\\\]|\\\\.)*")',
      // 2. char literals (single-quoted)
      "('(?:[^'\\\\]|\\\\.)*')",
      // 3. #include <...>
      '(#include\\s+&lt;[^&]*&gt;)',
      // 4. multi-char operators (must come before single-char)
      '(&lt;&lt;|&gt;&gt;|==|!=|&lt;=|&gt;=)',
      // 5. single-char operators (excluding = to avoid matching HTML attr =)
      '([+\\-*/%])',
      // 6. numbers
      '(\\b\\d+\\b)',
      // 7. identifiers (word chars only — no spaces, so HTML attributes are safe)
      '([A-Za-z_][A-Za-z0-9_]*)',
      // 8. anything else passes through unchanged
      '([^])'
    ].join('|'),
    'g'
  );

  let out = '';
  let m;
  while ((m = TOKEN_RE.exec(str)) !== null) {
    const [full, strDbl, strSng, inc, opMulti, opSingle, num, ident, other] = m;

    if (strDbl  !== undefined) { out += `<span class="syn-str">${strDbl}</span>`;  continue; }
    if (strSng  !== undefined) { out += `<span class="syn-str">${strSng}</span>`;  continue; }
    if (inc     !== undefined) { out += `<span class="syn-inc">${inc}</span>`;     continue; }
    if (opMulti !== undefined) { out += `<span class="syn-op">${opMulti}</span>`;  continue; }
    if (opSingle!== undefined) { out += `<span class="syn-op">${opSingle}</span>`; continue; }
    if (num     !== undefined) { out += `<span class="syn-num">${num}</span>`;     continue; }
    if (ident   !== undefined) {
      if      (KEYWORDS.has(ident))  { out += `<span class="syn-kw">${ident}</span>`;  }
      else if (TYPES.has(ident))     { out += `<span class="syn-typ">${ident}</span>`; }
      else if (FUNCTIONS.has(ident)) { out += `<span class="syn-fn">${ident}</span>`;  }
      else                           { out += ident; }
      continue;
    }
    // other — pass through as-is (&amp; ; ( ) { } spaces etc.)
    out += other !== undefined ? other : full;
  }
  return out;
}

/* ── Output Typing Effect ── */
async function typeOutput(el, lines, delayBetween = 50) {
  el.innerHTML = '';
  for (const item of lines) {
    const div = document.createElement('div');
    div.innerHTML = item.html;
    el.appendChild(div);
    if (window.soundEngine) window.soundEngine.playClick();
    await new Promise(r => setTimeout(r, item.delay || delayBetween));
    el.scrollTop = el.scrollHeight;
  }
}

/* ============================================================
   CodeRunner Class
   ============================================================ */
class CodeRunner {
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
    // Header status chip
    const header = this._el.querySelector('.code-runner-header');
    if (header && !header.querySelector('.cr-status-chip')) {
      const chip = document.createElement('div');
      chip.className = 'cr-status-chip';
      chip.innerHTML = '● Ready';
      header.appendChild(chip);
    }

    // Wire Run button
    const runBtn = this._el.querySelector('.cr-run-btn');
    if (runBtn) {
      runBtn.innerHTML = '▶ Run Code';
      runBtn.addEventListener('click', () => this.run());
    }

    // Wire Reset button
    const resetBtn = this._el.querySelector('.cr-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    // Add Copy Code button
    const btnRow = this._el.querySelector('.cr-btn-row');
    if (btnRow && !btnRow.querySelector('.cr-copy-btn')) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'cr-copy-btn';
      copyBtn.innerHTML = '📋 Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.code);
        if (window.showToast) window.showToast('Code copied to clipboard!', 'success');
        if (window.soundEngine) window.soundEngine.playClick();
      });
      btnRow.appendChild(copyBtn);
    }

    // Wire Extra buttons
    const extraContainer = this._el.querySelector('.cr-extra-btns');
    if (extraContainer && this.extraBtns.length) {
      this.extraBtns.forEach(eb => {
        const b = document.createElement('button');
        b.className = 'cr-extra-btn';
        b.textContent = eb.label;
        b.addEventListener('click', () => eb.onClick(this));
        extraContainer.appendChild(b);
      });
    }

    // Initial code rendering with syntax highlighting
    const codeArea = this._el.querySelector('.code-editor-area');
    if (codeArea) codeArea.innerHTML = syntaxHLCpp(this.code);

    // Show input section if required
    const inputSec = this._el.querySelector('.cr-input-section');
    if (inputSec && this.hasInput) {
      inputSec.classList.add('visible');
      const inputField = inputSec.querySelector('.cr-input-field');
      if (inputField) {
        inputField.addEventListener('keydown', e => {
          if (e.key === 'Enter') this.run();
        });
      }
    }
  }

  setCode(newCode) {
    this.code = newCode;
    const codeArea = this._el.querySelector('.code-editor-area');
    if (codeArea) {
      codeArea.innerHTML = syntaxHLCpp(newCode);
      codeArea.classList.add('animate-fadein');
      setTimeout(() => codeArea.classList.remove('animate-fadein'), 400);
    }
  }

  async run() {
    if (this._running) return;
    this._running = true;

    if (window.soundEngine) window.soundEngine.playClick();

    const runBtn = this._el.querySelector('.cr-run-btn');
    const chip = this._el.querySelector('.cr-status-chip');
    const outBody = this._el.querySelector('.output-body');

    if (runBtn) {
      runBtn.innerHTML = '⏳ Compiling...';
      runBtn.disabled = true;
    }
    if (chip) {
      chip.className = 'cr-status-chip running';
      chip.innerHTML = '⚙ Executing...';
    }
    if (outBody) {
      outBody.innerHTML = '<span style="color:var(--text-dim)">[Compiling C++ Source...]</span>';
    }

    // Simulated short compile delay
    await new Promise(r => setTimeout(r, 450));

    let val = '';
    const inputField = this._el.querySelector('.cr-input-field');
    if (inputField) val = inputField.value.trim();

    if (this.onRun) {
      await this.onRun(val, outBody);
    } else {
      await typeOutput(outBody, this.outputLines);
    }

    if (chip) {
      chip.className = 'cr-status-chip success';
      const execTime = Math.floor(Math.random() * 8 + 4);
      chip.innerHTML = `✓ Exit: 0 (${execTime}ms)`;
    }
    if (runBtn) {
      runBtn.innerHTML = '▶ Run Again';
      runBtn.disabled = false;
    }

    if (window.soundEngine) window.soundEngine.playSuccess();
    this._running = false;
  }

  reset() {
    if (window.soundEngine) window.soundEngine.playClick();
    const outBody = this._el.querySelector('.output-body');
    const chip = this._el.querySelector('.cr-status-chip');
    if (outBody) outBody.innerHTML = '<span class="out-prompt cursor-blink"></span>';
    if (chip) {
      chip.className = 'cr-status-chip';
      chip.innerHTML = '● Ready';
    }
    const inputField = this._el.querySelector('.cr-input-field');
    if (inputField) inputField.value = '';
  }
}

(typeof window !== 'undefined' ? window : globalThis).CodeRunner = CodeRunner;
