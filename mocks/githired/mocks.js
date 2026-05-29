// === Theme toggle ===
(function () {
  const STORAGE_KEY = 'gh-mock-theme';
  const root = document.documentElement;
  const isEmbedded = window.self !== window.top;
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = isEmbedded ? 'light' : (stored || (prefersDark ? 'dark' : 'light'));
  root.setAttribute('data-theme', initial);

  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-theme-toggle]');
    if (trigger) toggleTheme();
  });
})();

// === Tailor view, hover-link between draft bullet and posting requirement ===
(function () {
  document.addEventListener('mouseover', function (e) {
    const bullet = e.target.closest('[data-pin]');
    if (!bullet) return;
    const pinIds = (bullet.getAttribute('data-pin') || '').split(/\s+/).filter(Boolean);
    document.querySelectorAll('[data-req]').forEach(function (el) {
      el.classList.toggle('is-highlighted', pinIds.includes(el.getAttribute('data-req')));
    });
    bullet.classList.add('is-active');
  });

  document.addEventListener('mouseout', function (e) {
    const bullet = e.target.closest('[data-pin]');
    if (!bullet) return;
    document.querySelectorAll('[data-req]').forEach(function (el) {
      el.classList.remove('is-highlighted');
    });
    bullet.classList.remove('is-active');
  });
})();

// === Competency hover-link, posting body ↔ extracted tag list ===
(function () {
  document.addEventListener('mouseover', function (e) {
    const el = e.target.closest('[data-competency]');
    if (!el) return;
    const id = el.getAttribute('data-competency');
    document.querySelectorAll('[data-competency="' + id + '"]').forEach(function (m) {
      m.classList.add('is-co-active');
    });
  });

  document.addEventListener('mouseout', function (e) {
    const el = e.target.closest('[data-competency]');
    if (!el) return;
    document.querySelectorAll('[data-competency]').forEach(function (m) {
      m.classList.remove('is-co-active');
    });
  });
})();

// === Generic modal, open via [data-open-modal], close via [data-modal-close], backdrop click, or Esc ===
(function () {
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-open-modal]');
    if (trigger) {
      const id = trigger.getAttribute('data-open-modal');
      const modal = document.querySelector('[data-modal="' + id + '"]');
      if (modal) modal.classList.add('is-open');
      return;
    }
    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      const m = closeBtn.closest('.modal-backdrop');
      if (m) m.classList.remove('is-open');
      return;
    }
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.is-open').forEach(function (m) {
        m.classList.remove('is-open');
      });
    }
  });
})();

// === Add Bullet modal, opens from .req-add-btn with requirement context, char count, borrow-suggestion fill ===
(function () {
  const backdrop = document.querySelector('[data-modal="add-bullet"]');
  if (!backdrop) return;

  const metaEl = backdrop.querySelector('[data-modal-req-meta]');
  const bodyEl = backdrop.querySelector('[data-modal-req-body]');
  const targetGlyph = backdrop.querySelector('.modal-req-target .req-glyph');
  const textarea = backdrop.querySelector('[data-char-input]');
  const count = backdrop.querySelector('[data-char-count]');

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('.req-add-btn');
    if (!trigger) return;
    const card = trigger.closest('.req-card');
    if (card) {
      const meta = card.querySelector('.req-meta')?.textContent || '';
      const body = card.querySelector('.req-text')?.textContent || '';
      const sourceGlyph = card.querySelector('.req-glyph');
      if (metaEl) metaEl.textContent = meta;
      if (bodyEl) bodyEl.textContent = body;
      if (sourceGlyph && targetGlyph) targetGlyph.className = sourceGlyph.className;
    }
    backdrop.classList.add('is-open');
    setTimeout(function () { textarea && textarea.focus(); }, 50);
  });

  if (textarea && count) {
    textarea.addEventListener('input', function () {
      count.textContent = textarea.value.length;
    });
  }

  backdrop.addEventListener('click', function (e) {
    const sug = e.target.closest('.borrow-suggestion');
    if (sug && textarea) {
      const text = sug.querySelector('.borrow-suggestion-text');
      if (text) {
        textarea.value = text.textContent.trim();
        textarea.focus();
        if (count) count.textContent = textarea.value.length;
      }
    }
  });
})();

// === Reading view, text selection → highlight or add note ===
(function () {
  const postingBody = document.querySelector('.posting-body');
  if (!postingBody) return;

  // Build floating popover (Highlight / Add note)
  const popover = document.createElement('div');
  popover.className = 'selection-popover';
  popover.innerHTML =
    '<button type="button" data-sel-action="highlight"><i data-lucide="highlighter"></i> Highlight</button>' +
    '<button type="button" data-sel-action="note"><i data-lucide="message-square-plus"></i> Add note</button>';
  document.body.appendChild(popover);

  // Build composer modal
  const composer = document.createElement('div');
  composer.className = 'selection-composer';
  composer.innerHTML =
    '<div class="selection-composer-eyebrow">Highlighted</div>' +
    '<div class="selection-composer-quote" data-sel-quote></div>' +
    '<div class="selection-composer-eyebrow">Your note</div>' +
    '<textarea placeholder="What did you notice? A signal, a question, a connection to your resume…"></textarea>' +
    '<div class="selection-composer-actions">' +
      '<span class="selection-composer-hint">⌘↩ to save · esc to cancel</span>' +
      '<div style="display: flex; gap: 8px;">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-sel-action="cancel">Cancel</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-sel-action="save"><i data-lucide="check"></i> Save note</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(composer);

  // Build hover tooltip for existing highlights
  const tooltip = document.createElement('div');
  tooltip.className = 'highlight-tooltip';
  tooltip.innerHTML =
    '<div class="highlight-tooltip-meta">Your note</div>' +
    '<div data-tooltip-body></div>';
  document.body.appendChild(tooltip);

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  let lastRange = null;
  let lastText = '';

  function showPopover(rect) {
    popover.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
    popover.style.top = (rect.top + window.scrollY - 48) + 'px';
    popover.classList.add('is-visible');
  }

  function hidePopover() { popover.classList.remove('is-visible'); }

  function showComposer(text) {
    composer.querySelector('[data-sel-quote]').textContent = '"' + text + '"';
    composer.querySelector('textarea').value = '';
    composer.classList.add('is-visible');
    setTimeout(function () { composer.querySelector('textarea').focus(); }, 50);
  }

  function hideComposer() { composer.classList.remove('is-visible'); }

  function applyHighlight(withNote) {
    if (!lastRange) return;
    try {
      const span = document.createElement('span');
      span.className = 'highlight' + (withNote ? ' highlight-with-note' : '');
      if (withNote) {
        const note = composer.querySelector('textarea').value || '';
        if (note) span.setAttribute('data-note', note);
      }
      lastRange.surroundContents(span);
    } catch (err) {
      // surroundContents fails for selections that span multiple elements
    }
    const sel = window.getSelection();
    if (sel) sel.removeAllRanges();
  }

  document.addEventListener('mouseup', function (e) {
    setTimeout(function () {
      if (e.target.closest && (e.target.closest('.selection-popover') || e.target.closest('.selection-composer'))) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { hidePopover(); return; }
      const anchor = sel.anchorNode;
      if (!anchor || !postingBody.contains(anchor)) { hidePopover(); return; }
      const range = sel.getRangeAt(0);
      lastRange = range.cloneRange();
      lastText = sel.toString().trim();
      if (!lastText) { hidePopover(); return; }
      showPopover(range.getBoundingClientRect());
    }, 0);
  });

  popover.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-sel-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-sel-action');
    hidePopover();
    if (action === 'highlight') applyHighlight(false);
    else if (action === 'note') showComposer(lastText);
  });

  composer.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-sel-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-sel-action');
    if (action === 'cancel') hideComposer();
    else if (action === 'save') { applyHighlight(true); hideComposer(); }
  });

  document.addEventListener('mousedown', function (e) {
    if (e.target.closest && !e.target.closest('.selection-popover') && !postingBody.contains(e.target)) {
      hidePopover();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { hidePopover(); hideComposer(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && composer.classList.contains('is-visible')) {
      applyHighlight(true);
      hideComposer();
    }
  });

  // Tooltip on hover of existing highlights with notes
  document.addEventListener('mouseover', function (e) {
    const h = e.target.closest && e.target.closest('.highlight-with-note[data-note]');
    if (!h) return;
    const note = h.getAttribute('data-note');
    if (!note) return;
    tooltip.querySelector('[data-tooltip-body]').textContent = note;
    const rect = h.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX) + 'px';
    tooltip.style.top = (rect.bottom + window.scrollY + 8) + 'px';
    tooltip.classList.add('is-visible');
  });

  document.addEventListener('mouseout', function (e) {
    const h = e.target.closest && e.target.closest('.highlight-with-note[data-note]');
    if (!h) return;
    tooltip.classList.remove('is-visible');
  });
})();

// === Re-render lucide icons after dynamic content ===
window.addEventListener('DOMContentLoaded', function () {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
});
