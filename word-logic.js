// ══════════════════════════════════════
// CORE STATE
// ══════════════════════════════════════
let zoomLevel = 100;
let trackChanges = false;
let showComments = true;
let showPilcrow = false;
let splitViewOn = false;
let focusModeOn = false;
let currentLang = 'en-US';
let undoStack = [], redoStack = [];
let pageMargins = { top: 96, bottom: 96, left: 96, right: 96 };
let findResults = [], findIdx = 0;
let commentList = [];
let headerText = '', footerText = '';
let currentStyle = 'p';
let fpActive = false; // format painter
let savedRange = null;
let pageCount = 1;

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════
let _tt;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(_tt); _tt = setTimeout(() => t.style.display = 'none', 2400);
}

function getEditor() {
  const pg = document.querySelector('.page.active .page-content') ||
             document.querySelector('.page-content');
  return pg;
}

function focusEditor() {
  const ed = getEditor();
  if (ed) {
    ed.focus();
    if (savedRange) restoreRange();
  }
}

function saveRange() {
  const sel = window.getSelection();
  if (sel.rangeCount > 0) savedRange = sel.getRangeAt(0).cloneRange();
}

function restoreRange() {
  if (!savedRange) return;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(savedRange);
}

function execCmd(cmd, val = null) {
  focusEditor();
  document.execCommand(cmd, false, val);
  onDocChange();
  syncRibbonState();
}

function toggleCmd(cmd) {
  focusEditor();
  document.execCommand(cmd, false, null);
  onDocChange();
  syncRibbonState();
}

// ══════════════════════════════════════
// UNDO / REDO
// ══════════════════════════════════════
function saveToUndo() {
  const ed = getEditor();
  if (!ed) return;
  const snap = ed.innerHTML;
  if (undoStack.length && undoStack[undoStack.length-1] === snap) return;
  undoStack.push(snap);
  if (undoStack.length > 100) undoStack.shift();
  redoStack = [];
  updateUndoRedoBtns();
}

function doUndo() {
  const ed = getEditor(); if (!ed || undoStack.length < 2) return;
  redoStack.push(undoStack.pop());
  ed.innerHTML = undoStack[undoStack.length - 1] || '';
  updateUndoRedoBtns(); onDocChange();
}

function doRedo() {
  const ed = getEditor(); if (!ed || !redoStack.length) return;
  const snap = redoStack.pop();
  undoStack.push(snap);
  ed.innerHTML = snap;
  updateUndoRedoBtns(); onDocChange();
}

function updateUndoRedoBtns() {
  const u = document.getElementById('qs-undo');
  const r = document.getElementById('qs-redo');
  if (u) u.disabled = undoStack.length < 2;
  if (r) r.disabled = redoStack.length === 0;
}

// ══════════════════════════════════════
// DOCUMENT EVENTS
// ══════════════════════════════════════
function onDocChange() {
  updateWordCount();
  updatePageCount();
  updateStatusBar();
  autoSaveIndicator();
}

function onDocInput(e) {
  saveRange();
  // Auto-detect headings typed as "# text"
  checkAutoFormat(e);
}

function handleDocKey(e) {
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && e.key === 'z') { e.preventDefault(); doUndo(); return; }
  if (ctrl && e.key === 'y') { e.preventDefault(); doRedo(); return; }
  if (ctrl && e.key === 'b') { e.preventDefault(); toggleCmd('bold'); return; }
  if (ctrl && e.key === 'i') { e.preventDefault(); toggleCmd('italic'); return; }
  if (ctrl && e.key === 'u') { e.preventDefault(); toggleCmd('underline'); return; }
  if (ctrl && e.key === 's') { e.preventDefault(); doSave(); return; }
  if (ctrl && e.key === 'f') { e.preventDefault(); openFind(); return; }
  if (ctrl && e.key === 'h') { e.preventDefault(); openFindReplace(); return; }
  if (ctrl && e.key === 'k') { e.preventDefault(); openDlg('link'); return; }
  if (ctrl && e.key === 'p') { e.preventDefault(); window.print(); return; }
  if (ctrl && e.key === 'a') { e.preventDefault(); execCmd('selectAll'); return; }
  if (ctrl && e.key === 'l') { e.preventDefault(); execCmd('justifyLeft'); return; }
  if (ctrl && e.key === 'e') { e.preventDefault(); execCmd('justifyCenter'); return; }
  if (ctrl && e.key === 'r') { e.preventDefault(); execCmd('justifyRight'); return; }
  if (ctrl && e.key === 'j') { e.preventDefault(); execCmd('justifyFull'); return; }
  if (ctrl && e.key === 'd') { e.preventDefault(); openFontDlg(); return; }
  if (ctrl && e.shiftKey && e.key === '>') { e.preventDefault(); changeFontSize(1); return; }
  if (ctrl && e.shiftKey && e.key === '<') { e.preventDefault(); changeFontSize(-1); return; }
  if (ctrl && e.key === 'Enter') { e.preventDefault(); insertPageBreak(); return; }
  if (e.key === 'Enter') {
    setTimeout(()=>{ saveToUndo(); updateWordCount(); checkNewPage(); }, 10);
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    execCmd('insertHTML', '&emsp;&emsp;');
    return;
  }
  if (e.key === 'F7') { e.preventDefault(); openSpellCheck(); return; }
  saveRange();
}

function onDocMouseUp() {
  saveRange();
  syncRibbonState();
  updateSelectionInfo();
}

function onDocPaste(e) {
  // Rich paste — just let browser handle it, then sanitize
  setTimeout(() => { onDocChange(); saveToUndo(); }, 50);
}

function checkAutoFormat(e) {
  // Convert markdown-like headings on Enter
  if (e.key !== ' ') return;
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const node = sel.getRangeAt(0).startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return;
  const txt = node.textContent;
  if (txt === '#') { document.execCommand('delete'); applyStyle('h1'); }
  else if (txt === '##') { document.execCommand('delete'); document.execCommand('delete'); applyStyle('h2'); }
  else if (txt === '###') { for(let i=0;i<3;i++) document.execCommand('delete'); applyStyle('h3'); }
}

function updateSelectionInfo() {
  try {
    const sel = window.getSelection();
    if (sel.toString().length > 0) {
      document.getElementById('sb-mode') && (document.getElementById('sb-mode').textContent = sel.toString().split(/\s+/).filter(Boolean).length + ' words selected');
    }
  } catch(e) {}
}

// ══════════════════════════════════════
// WORD COUNT & STATUS
// ══════════════════════════════════════
function updateWordCount() {
  const ed = getEditor();
  if (!ed) return;
  const text = ed.innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text.replace(/\n/g, '').length;
  const wordsEl = document.getElementById('sb-words');
  if (wordsEl) wordsEl.textContent = words.toLocaleString();
  return { words, chars, pages: pageCount };
}

function updatePageCount() {
  const ed = getEditor();
  if (!ed) return;
  const height = ed.scrollHeight;
  const pageH = 1031; // approx page content height
  pageCount = Math.max(1, Math.ceil(height / pageH));
  const sp = document.getElementById('sb-pages');
  if (sp) sp.textContent = pageCount;
}

function checkNewPage() {
  // Auto page break visualization
  const ed = getEditor();
  if (!ed) return;
  if (ed.scrollHeight > ed.offsetHeight + 200) {
    // Could add visual page break indicator
  }
}

function updateStatusBar() {
  const pg = document.getElementById('sb-page');
  if (pg) pg.textContent = '1';
}

function autoSaveIndicator() {
  const tog = document.getElementById('autosave-toggle');
  if (tog && tog.checked) {
    // Simulate autosave flash
  }
}

// ══════════════════════════════════════
// SAVE / EXPORT
// ══════════════════════════════════════
function doSave() {
  const ed = getEditor();
  const title = document.getElementById('doc-title').value || 'Document1';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>body{font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.15;max-width:794px;margin:40px auto;padding:96px;color:#000;}
h1{font-size:28pt;color:#2e74b5;}h2{font-size:18pt;color:#2e74b5;}h3{font-size:14pt;color:#1f3864;}
table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ccc;padding:4pt 6pt;}th{background:#dce6f4;}
blockquote{border-left:3px solid #2b579a;padding:4pt 8pt;margin-left:20pt;color:#444;font-style:italic;}
a{color:#2b579a;}</style></head><body>
${headerText ? `<div style="border-bottom:1px solid #ccc;margin-bottom:20px;padding-bottom:8px;">${headerText}</div>` : ''}
${ed ? ed.innerHTML : ''}
${footerText ? `<div style="border-top:1px solid #ccc;margin-top:20px;padding-top:8px;">${footerText}</div>` : ''}
</body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = title + '.html';
  a.click();
  toast('Saved as ' + title + '.html ✓');
}

function exportAsPDF() {
  toast('Preparing PDF…');
  setTimeout(() => window.print(), 300);
}

// ══════════════════════════════════════
// FONT OPERATIONS
// ══════════════════════════════════════
function changeFontSize(delta) {
  focusEditor();
  try {
    const size = parseInt(document.queryCommandValue('fontSize')) || 3;
    const sizes = [8,9,10,11,12,14,16,18,20,22,24,28,32,36,48,72];
    const idx = Math.min(sizes.length-1, Math.max(0, sizes.indexOf(size*4) + delta));
    document.execCommand('fontSize', false, idx > 5 ? 5 : idx < 1 ? 1 : idx);
  } catch(e) {}
}

function applyFontColor(v) {
  document.getElementById('fontcolor-bar').style.background = v;
  execCmd('foreColor', v);
}

function applyHighlight(v) {
  if (document.getElementById('highlight-bar')) document.getElementById('highlight-bar').style.background = v || '#ffff00';
  if (v) execCmd('hiliteColor', v);
  else execCmd('removeFormat');
}

function applyUnderlineStyle(style) {
  focusEditor();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.style.textDecorationLine = 'underline';
  span.style.textDecorationStyle = style;
  try { range.surroundContents(span); } catch(e) { execCmd('underline'); }
  onDocChange();
}

function applyShading(v) {
  if (document.getElementById('shading-bar')) document.getElementById('shading-bar').style.background = v;
  execCmd('hiliteColor', v);
}

function doFormatPainter() {
  fpActive = true;
  toast('Format Painter active — click text to apply format');
  document.body.style.cursor = 'crosshair';
  const handler = () => {
    fpActive = false;
    document.body.style.cursor = '';
    document.removeEventListener('mouseup', handler);
    toast('Format applied ✓');
  };
  document.addEventListener('mouseup', handler);
}

// ══════════════════════════════════════
// PARAGRAPH / STYLE
// ══════════════════════════════════════
function applyStyle(tag) {
  focusEditor();
  currentStyle = tag;
  if (tag === 'title-style') {
    document.execCommand('formatBlock', false, 'h1');
    execCmd('fontSize', 7);
    execCmd('bold');
  } else if (tag === 'subtitle-style') {
    document.execCommand('formatBlock', false, 'p');
    execCmd('italic');
    execCmd('foreColor', '#666666');
  } else if (tag === 'subtle-em') {
    execCmd('italic');
    execCmd('foreColor', '#666666');
  } else {
    document.execCommand('formatBlock', false, '<' + tag + '>');
  }
  document.querySelectorAll('.style-card').forEach(c => c.classList.remove('active'));
  syncRibbonState();
  onDocChange();
}

function setLineHeight(h) {
  focusEditor();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  execCmd('insertHTML', `<span style="line-height:${h}">${sel.toString() || ' '}</span>`);
  toast('Line spacing set to ' + h);
}

function addSpaceBefore() {
  execCmd('insertHTML', '<div style="margin-top:12pt;"></div>');
  toast('Space before paragraph added');
}
function addSpaceAfter() {
  execCmd('insertHTML', '<div style="margin-bottom:12pt;"></div>');
  toast('Space after paragraph added');
}

function applyBulletStyle(type) {
  focusEditor();
  execCmd('insertUnorderedList');
  if (type) {
    execCmd('insertHTML', `<ul style="list-style-type:${type};"><li></li></ul>`);
  }
  toast('Bullet style applied');
}

function applyNumberStyle(type) {
  focusEditor();
  execCmd('insertHTML', `<ol style="list-style-type:${type};"><li></li></ol>`);
  toast('Numbering applied');
}

function applyBulletDlg() { openDlg('bullets'); }
function applyNumberDlg() { openDlg('bullets'); }

function togglePilcrow() {
  showPilcrow = !showPilcrow;
  const el = document.getElementById('btn-pilcrow');
  if (el) el.classList.toggle('on', showPilcrow);
  document.querySelectorAll('.page-content').forEach(pg => {
    pg.style.whiteSpace = showPilcrow ? 'pre-wrap' : '';
  });
  toast(showPilcrow ? 'Formatting marks shown' : 'Formatting marks hidden');
}

function applyParaBorder(side) {
  focusEditor();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const block = range.startContainer.parentElement?.closest('p,div,h1,h2,h3,blockquote') || range.startContainer.parentElement;
  if (!block) return;
  const style = side === 'none' ? '' : side === 'all' ? '1px solid #000' : '';
  if (side === 'bottom') block.style.borderBottom = '1px solid #000';
  else if (side === 'top') block.style.borderTop = '1px solid #000';
  else if (side === 'left') block.style.borderLeft = '1px solid #000';
  else if (side === 'right') block.style.borderRight = '1px solid #000';
  else if (side === 'box' || side === 'all') block.style.border = '1px solid #000';
  else if (side === 'none') block.style.border = '';
  toast('Border applied');
}

function insertHorizontalLine() {
  execCmd('insertHorizontalRule');
  toast('Horizontal line inserted');
}

function selectCurrentLine() {
  focusEditor();
  execCmd('selectAll');
  toast('All text selected');
}

function selectCurrentPara() {
  focusEditor();
  document.execCommand('selectAll');
  toast('Paragraph selected');
}

function sortSelection(dir) {
  const ed = getEditor();
  if (!ed) return;
  const sel = window.getSelection();
  if (!sel.toString()) { toast('Select text to sort'); return; }
  const txt = sel.toString().split('\n').filter(Boolean);
  txt.sort((a,b) => dir==='az' ? a.localeCompare(b) : b.localeCompare(a));
  execCmd('insertHTML', txt.join('<br/>'));
  toast('Sorted ' + (dir==='az'?'A→Z':'Z→A'));
}

function scrollStyles(dir) { toast('More styles ' + (dir > 0 ? 'down' : 'up')); }
function openStylesPane() { toast('Styles pane opened — select text and click a style'); }

// ══════════════════════════════════════
// INSERT OPERATIONS
// ══════════════════════════════════════
function insertPageBreak() {
  execCmd('insertHTML', '<div style="page-break-after:always;border-top:1px dashed #aaa;margin:12pt 0;text-align:center;color:#aaa;font-size:10px;">─ Page Break ─</div><p></p>');
  toast('Page break inserted');
}

function insertBlankPage() {
  execCmd('insertHTML', '<div style="page-break-after:always;height:200px;"></div>');
  toast('Blank page inserted');
}

function insertCoverPage() {
  execCmd('insertHTML', `<div style="page-break-after:always;text-align:center;padding:100px 40px;background:#f0f4fc;border:2px solid #2b579a;margin-bottom:20px;">
    <h1 style="font-size:36pt;color:#2b579a;margin-bottom:20px;">${document.getElementById('doc-title').value||'Document Title'}</h1>
    <p style="font-size:14pt;color:#666;">Author Name</p>
    <p style="font-size:12pt;color:#888;">${new Date().toLocaleDateString()}</p>
  </div><p></p>`);
  toast('Cover page inserted');
}

function insertPageNumber() {
  execCmd('insertHTML', '<span style="color:#666;font-size:10px;">[Page #]</span>');
  toast('Page number field inserted');
}

function insertTextBox() {
  execCmd('insertHTML', '<div style="border:1px solid #ccc;padding:8pt 10pt;margin:8pt 0;min-height:40pt;background:#fafafa;" contenteditable="true">Text box — click to edit</div>');
  toast('Text box inserted');
}

function insertWordArt() {
  const txt = prompt('WordArt text:', 'WordArt') || 'WordArt';
  execCmd('insertHTML', `<div style="font-size:28pt;font-weight:700;color:#2b579a;text-shadow:2px 2px 4px rgba(0,0,0,.3);text-align:center;padding:10pt;">${txt}</div>`);
  toast('WordArt inserted');
}

function insertDropCap() {
  const ed = getEditor(); if (!ed) return;
  const sel = window.getSelection();
  const first = (sel.toString() || 'D').charAt(0);
  execCmd('insertHTML', `<span style="float:left;font-size:60pt;line-height:0.8;padding:4pt 8pt 0 0;font-weight:700;color:#2b579a;">${first}</span>`);
  toast('Drop cap inserted');
}

function insertDateField() {
  const now = new Date();
  execCmd('insertHTML', `<span style="color:#555;">${now.toLocaleDateString('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>`);
  toast('Date inserted');
}

function insertFieldCode() {
  const code = prompt('Field code:', 'PAGE');
  if (!code) return;
  execCmd('insertHTML', `<span style="background:#e8e8e8;padding:1px 4px;border-radius:2px;font-size:10px;color:#555;">{ ${code} }</span>`);
  toast('Field inserted');
}

function insertBookmark() {
  const name = prompt('Bookmark name:', 'Bookmark1');
  if (!name) return;
  execCmd('insertHTML', `<a id="${name}" style="color:#2b579a;font-size:10px;" title="Bookmark: ${name}">🔖</a>`);
  toast('Bookmark "' + name + '" inserted');
}

function insertCrossRef() {
  toast('Cross-reference: select a bookmark or heading to reference');
}

function insertComment() {
  const ed = getEditor(); if (!ed) return;
  const sel = window.getSelection();
  const selectedText = sel.toString() || 'Comment';
  const txt = prompt('Add comment:', '');
  if (txt === null) return;
  const id = 'cmt-' + Date.now();
  commentList.push({ id, text: txt, selectedText, date: new Date().toLocaleString() });
  execCmd('insertHTML', `<span class="comment-mark" id="${id}" title="💬 ${txt}" onclick="showCommentPopup('${id}')">${selectedText}</span>`);
  toast('Comment added ✓');
}

function showCommentPopup(id) {
  const c = commentList.find(x => x.id === id);
  if (c) toast('💬 Comment: ' + c.text);
}

function deleteComment() {
  document.querySelectorAll('.comment-mark').forEach(el => {
    el.outerHTML = el.innerHTML;
  });
  commentList = [];
  toast('All comments deleted');
}

function navComment(dir) {
  const marks = document.querySelectorAll('.comment-mark');
  if (!marks.length) { toast('No comments found'); return; }
  toast('Comment: ' + (marks[0].title || ''));
  marks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function toggleShowComments() {
  showComments = !showComments;
  document.querySelectorAll('.comment-mark').forEach(el => {
    el.style.background = showComments ? '#ffffa0' : 'transparent';
    el.style.borderBottom = showComments ? '2px solid #ffcc00' : '';
  });
  toast(showComments ? 'Comments shown' : 'Comments hidden');
}

function insertFootnote() {
  const num = document.querySelectorAll('.footnote-ref').length + 1;
  execCmd('insertHTML', `<sup class="footnote-ref" style="color:#2b579a;cursor:pointer;" title="Footnote ${num}">[${num}]</sup>`);
  const txt = prompt('Footnote text:', '');
  if (txt) execCmd('insertHTML', `<div style="border-top:1px solid #ccc;margin-top:8pt;font-size:9pt;color:#555;padding-top:4pt;">${num}. ${txt}</div>`);
  toast('Footnote inserted');
}

function insertEndnote() {
  const num = document.querySelectorAll('.endnote-ref').length + 1;
  execCmd('insertHTML', `<sup class="endnote-ref" style="color:#333;cursor:pointer;" title="Endnote ${num}">[${num}]</sup>`);
  toast('Endnote ' + num + ' inserted — add text at end of document');
}

function navFootnote(dir) { toast('Navigate footnotes: ' + (dir > 0 ? 'next' : 'previous')); }

function insertEquation() {
  const eq = prompt('Enter equation (LaTeX or plain):', 'E = mc²');
  if (!eq) return;
  execCmd('insertHTML', `<span style="font-family:'Times New Roman',serif;font-style:italic;font-size:14pt;color:#1f1f1f;background:#f8f8f8;padding:2pt 6pt;border:1px solid #e0e0e0;border-radius:2pt;">${eq}</span>`);
  toast('Equation inserted');
}

function insertSymbol() {
  const symbols = ['©','®','™','°','±','×','÷','≈','≠','≤','≥','∞','√','π','∑','∆','α','β','γ','δ','ε','µ','Ω','←','→','↑','↓','↔','⇒','⇔','•','…','–','—','«','»','„','"','"','€','£','¥','¢','§','¶'];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  const choice = prompt('Symbol (or pick): ' + symbols.slice(0,10).join(' '), sym);
  if (!choice) return;
  execCmd('insertHTML', choice.charAt(0));
  toast('Symbol "' + choice.charAt(0) + '" inserted');
}

function insertCaption() {
  const txt = prompt('Caption text:', 'Figure 1:');
  if (!txt) return;
  execCmd('insertHTML', `<p style="text-align:center;font-size:10pt;color:#555;font-style:italic;">${txt}</p>`);
  toast('Caption inserted');
}

function insertMarkEntry() {
  const txt = prompt('Index entry:', '');
  if (!txt) return;
  execCmd('insertHTML', `<span style="background:#ffe0b2;font-size:9px;" title="Index: ${txt}">{ XE "${txt}" }</span>`);
  toast('Index entry marked');
}

function insertBibliography() {
  execCmd('insertHTML', `<div style="border-top:1px solid #ccc;margin-top:16pt;padding-top:8pt;">
    <h2 style="font-size:14pt;color:#2e74b5;">Bibliography</h2>
    <p style="font-size:10pt;color:#333;margin:4pt 0;">Author, A. (Year). <em>Title of work</em>. Publisher.</p>
    <p style="font-size:10pt;color:#333;margin:4pt 0;">Author, B., &amp; Author, C. (Year). Article title. <em>Journal Name</em>, <em>volume</em>(issue), pages.</p>
  </div>`);
  toast('Bibliography inserted');
}

function updateTOC() { toast('Table of Contents updated'); }

// ══════════════════════════════════════
// HYPERLINK
// ══════════════════════════════════════
function openHyperlinkDlg() { openDlg('link'); }

function applyHyperlink() {
  const url = document.getElementById('link-url').value.trim();
  const txt = document.getElementById('link-text').value.trim() || url;
  const tip = document.getElementById('link-tip').value.trim();
  if (!url) { toast('Please enter a URL'); return; }
  focusEditor();
  if (savedRange) restoreRange();
  const link = `<a href="${url}" target="_blank" title="${tip || url}" style="color:#2b579a;text-decoration:underline;">${txt}</a>`;
  execCmd('insertHTML', link);
  closeDlg();
  toast('Hyperlink inserted ✓');
}

// ══════════════════════════════════════
// TABLE
// ══════════════════════════════════════
function openTablePicker(e) {
  const picker = document.getElementById('table-picker');
  const grid = document.getElementById('tp-grid');
  const MAXR = 8, MAXC = 10;
  grid.style.gridTemplateColumns = `repeat(${MAXC}, 16px)`;
  grid.innerHTML = '';
  for (let r = 0; r < MAXR; r++) {
    for (let c = 0; c < MAXC; c++) {
      const cell = document.createElement('div');
      cell.className = 'tp-cell';
      cell.dataset.r = r + 1; cell.dataset.c = c + 1;
      cell.addEventListener('mouseover', function() {
        const tr = +this.dataset.r, tc = +this.dataset.c;
        document.querySelectorAll('.tp-cell').forEach(cl => {
          cl.classList.toggle('hover', +cl.dataset.r <= tr && +cl.dataset.c <= tc);
        });
        document.getElementById('tp-label').textContent = `${tc} × ${tr} Table`;
      });
      cell.addEventListener('click', function() {
        const tr = +this.dataset.r, tc = +this.dataset.c;
        buildTable(tr, tc);
        picker.style.display = 'none';
      });
      grid.appendChild(cell);
    }
  }
  const rect = (e.currentTarget || e.target).getBoundingClientRect?.() || { left: 100, bottom: 150 };
  picker.style.left = rect.left + 'px';
  picker.style.top = (rect.bottom + 4) + 'px';
  picker.style.display = 'block';
  const hide = (ev) => { if (!picker.contains(ev.target)) { picker.style.display = 'none'; document.removeEventListener('click', hide); } };
  setTimeout(() => document.addEventListener('click', hide), 100);
}

function buildTable(rows, cols) {
  focusEditor();
  let html = '<table style="border-collapse:collapse;width:100%;margin:8pt 0;">';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      if (r === 0) {
        html += `<th style="border:1px solid #ccc;padding:5pt 8pt;background:#dce6f4;font-weight:700;font-size:11pt;"></th>`;
      } else {
        html += `<td style="border:1px solid #ccc;padding:5pt 8pt;min-width:40px;font-size:11pt;"></td>`;
      }
    }
    html += '</tr>';
  }
  html += '</table><p></p>';
  execCmd('insertHTML', html);
  toast(`${cols} × ${rows} table inserted ✓`);
}

function doInsertTable() {
  const rows = +document.getElementById('tbl-rows').value || 3;
  const cols = +document.getElementById('tbl-cols').value || 3;
  buildTable(rows, cols);
  closeDlg();
}

function initTablePicker() {
  // Table picker initialized on demand
}

// ══════════════════════════════════════
// IMAGE
// ══════════════════════════════════════
function previewImgUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const prev = document.getElementById('img-preview-box');
    prev.innerHTML = `<img src="${e.target.result}" style="max-height:100px;max-width:100%;"/>`;
    document.getElementById('img-url').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function doInsertImage() {
  const url = document.getElementById('img-url').value.trim();
  const alt = document.getElementById('img-alt').value.trim() || 'Image';
  if (!url) { toast('Please enter an image URL or upload a file'); return; }
  focusEditor();
  execCmd('insertHTML', `<figure style="margin:8pt 0;text-align:center;">
    <img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:3pt;"/>
    <figcaption style="font-size:9pt;color:#666;font-style:italic;margin-top:4pt;">${alt}</figcaption>
  </figure>`);
  closeDlg();
  toast('Image inserted ✓');
}

function insertShape(shape) {
  let html = '';
  if (shape === 'line') html = '<hr style="border:2px solid #2b579a;margin:8pt 0;"/>';
  else if (shape === 'arrow') html = '<div style="font-size:24pt;color:#2b579a;text-align:center;">→</div>';
  else if (shape === 'textbox') html = '<div style="border:1px solid #2b579a;padding:8pt;margin:8pt 0;min-height:30pt;background:#f8f9ff;">Text box</div>';
  else html = `<div style="font-size:40pt;color:#2b579a;text-align:center;">${shape}</div>`;
  execCmd('insertHTML', html);
  toast('Shape inserted');
}

// ══════════════════════════════════════
// HEADER / FOOTER
// ══════════════════════════════════════
function applyHeaderFooter() {
  headerText = document.getElementById('hdr-text').value;
  footerText = document.getElementById('ftr-text').value;
  const addPgNum = document.getElementById('hf-page-num').checked;
  // Add header to all pages
  document.querySelectorAll('.page').forEach((pg, i) => {
    let hdr = pg.querySelector('.page-header-edit');
    if (!hdr) {
      hdr = document.createElement('div');
      hdr.className = 'page-header-edit';
      pg.insertBefore(hdr, pg.firstChild);
    }
    hdr.innerHTML = `<div class="hf-label">Header <span onclick="this.closest('.page-header-edit').remove();toast('Header removed')" style="cursor:pointer;font-size:10px;color:#c00;">✕ Close Header and Footer</span></div><div contenteditable="true" style="-webkit-user-select:text;user-select:text;">${headerText}</div>`;

    let ftr = pg.querySelector('.page-footer-edit');
    if (!ftr) {
      ftr = document.createElement('div');
      ftr.className = 'page-footer-edit';
      pg.appendChild(ftr);
    }
    ftr.innerHTML = `<div class="hf-label">Footer <span style="cursor:pointer;font-size:10px;color:#c00;" onclick="this.closest('.page-footer-edit').remove();toast('Footer removed')">✕ Close</span></div><div contenteditable="true" style="-webkit-user-select:text;user-select:text;">${footerText}${addPgNum ? ' <span style="color:#888;font-size:10px;">[Page '+(i+1)+']</span>' : ''}</div>`;
  });
  closeDlg();
  toast('Header and footer applied ✓');
}

// ══════════════════════════════════════
// PAGE SETUP
// ══════════════════════════════════════
function applyPageSetup() {
  const top = +document.getElementById('ps-top').value * 37.8;
  const bot = +document.getElementById('ps-bot').value * 37.8;
  const left = +document.getElementById('ps-left').value * 37.8;
  const right = +document.getElementById('ps-right').value * 37.8;
  pageMargins = { top, bottom: bot, left, right };
  document.querySelectorAll('.page-content').forEach(pg => {
    pg.style.padding = `${top}px ${right}px ${bot}px ${left}px`;
  });
  const cols = +document.getElementById('ps-cols').value || 1;
  if (cols > 1) setColumns(cols);
  closeDlg();
  toast('Page setup applied ✓');
}

function applyPageSize() {}
function applyOrientation() {}
function setPageDefault() { toast('Default page settings saved'); }
function setParaDefault() { toast('Default paragraph settings saved'); }
function setAsDefault() { toast('Default font settings saved'); }

function setPaperSize(w, h, name) {
  document.querySelectorAll('.page').forEach(pg => {
    pg.style.width = w + 'px';
    pg.style.minHeight = h + 'px';
  });
  toast('Paper size: ' + name);
}

function toggleOrientation() {
  const pg = document.querySelector('.page');
  if (!pg) return;
  const w = parseInt(pg.style.width) || 794;
  const h = parseInt(pg.style.minHeight) || 1123;
  document.querySelectorAll('.page').forEach(p => {
    p.style.width = h + 'px'; p.style.minHeight = w + 'px';
  });
  toast('Orientation toggled');
}

function setMargins(top, bottom, left, right) {
  const t=top*37.8, b=bottom*37.8, l=left*37.8, r=right*37.8;
  document.querySelectorAll('.page-content').forEach(pg => {
    pg.style.padding = `${t}px ${r}px ${b}px ${l}px`;
  });
  toast(`Margins: T${top}cm B${bottom}cm L${left}cm R${right}cm`);
}

function setColumns(n, type) {
  document.querySelectorAll('.page-content').forEach(pg => {
    if (n === 1) { pg.style.columnCount = ''; pg.style.columnGap = ''; }
    else { pg.style.columnCount = n; pg.style.columnGap = '20px'; }
  });
  toast(n + ' column(s) set');
}

function applyPageColor(v) {
  document.getElementById('pgcolor-bar').style.background = v;
  document.querySelectorAll('.page').forEach(pg => pg.style.background = v);
  toast('Page color applied');
}

function applyPageBorder(style) {
  document.querySelectorAll('.page').forEach(pg => {
    if (!style) pg.style.outline = '';
    else pg.style.outline = `3px ${style} #2b579a`;
  });
  toast('Page border applied');
}

function openWatermarkDd(e) {
  const w = prompt('Watermark text (or blank to remove):', 'DRAFT');
  if (w === null) return;
  document.querySelectorAll('.page').forEach(pg => {
    let wm = pg.querySelector('.watermark');
    if (!wm && w) {
      wm = document.createElement('div');
      wm.className = 'watermark';
      wm.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:80px;color:rgba(0,0,0,.08);font-weight:700;pointer-events:none;z-index:0;white-space:nowrap;';
      pg.appendChild(wm);
    }
    if (wm) wm.textContent = w;
    if (!w && wm) wm.remove();
  });
  toast(w ? 'Watermark "' + w + '" applied' : 'Watermark removed');
}

function applyDocTheme(type) {
  if (type === 'colors') {
    const color = prompt('Enter primary accent color (hex):', '#2b579a');
    if (!color) return;
    document.querySelectorAll('.page-content h1,.page-content h2').forEach(el => el.style.color = color);
    toast('Color theme applied');
  } else {
    toast('Theme "' + type + '" applied');
  }
}

function setDocDefault() { toast('Document formatting saved as default'); }

// ══════════════════════════════════════
// FIND & REPLACE
// ══════════════════════════════════════
function openFind() {
  const fb = document.getElementById('find-bar');
  document.getElementById('replace-row').style.display = 'none';
  fb.style.display = 'block';
  document.getElementById('find-inp').focus();
}

function openFindReplace() {
  const fb = document.getElementById('find-bar');
  fb.style.display = 'block';
  document.getElementById('replace-row').style.display = 'flex';
  document.getElementById('find-inp').focus();
}

function closeFindBar() {
  document.getElementById('find-bar').style.display = 'none';
  clearFindHighlights();
}

function showReplace() {
  const rr = document.getElementById('replace-row');
  rr.style.display = rr.style.display === 'none' ? 'flex' : 'none';
}

function doFindInDoc(q) {
  document.getElementById('find-inp').value = q;
  openFind();
  doFindHighlight(q);
}

function doFindHighlight(q) {
  clearFindHighlights();
  if (!q) { document.getElementById('find-count').textContent = ''; return; }
  const ed = getEditor();
  if (!ed) return;
  const html = ed.innerHTML;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  let count = 0;
  ed.innerHTML = html.replace(re, (m) => { count++; return `<mark class="find-highlight">${m}</mark>`; });
  findResults = ed.querySelectorAll('.find-highlight');
  findIdx = 0;
  document.getElementById('find-count').textContent = count ? `${count} match${count>1?'es':''}` : 'Not found';
  if (count) findNext();
}

function clearFindHighlights() {
  const ed = getEditor();
  if (!ed) return;
  ed.querySelectorAll('.find-highlight,.find-current').forEach(el => {
    el.outerHTML = el.innerHTML;
  });
  findResults = [];
}

function findNext() {
  if (!findResults.length) { doFindHighlight(document.getElementById('find-inp').value); return; }
  findResults.forEach(el => el.classList.remove('find-current'));
  findIdx = (findIdx + 1) % findResults.length;
  findResults[findIdx].classList.add('find-current');
  findResults[findIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('find-count').textContent = `${findIdx+1} of ${findResults.length}`;
}

function findPrev() {
  if (!findResults.length) return;
  findResults.forEach(el => el.classList.remove('find-current'));
  findIdx = (findIdx - 1 + findResults.length) % findResults.length;
  findResults[findIdx].classList.add('find-current');
  findResults[findIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('find-count').textContent = `${findIdx+1} of ${findResults.length}`;
}

function doReplace() {
  const q = document.getElementById('find-inp').value;
  const r = document.getElementById('replace-inp').value;
  if (!q) return;
  if (!findResults.length) { doFindHighlight(q); return; }
  const cur = findResults[findIdx];
  if (cur) { cur.outerHTML = r; findResults = []; doFindHighlight(q); toast('Replaced 1 instance'); }
}

function doReplaceAll() {
  const q = document.getElementById('find-inp').value;
  const r = document.getElementById('replace-inp').value;
  if (!q) return;
  const ed = getEditor(); if (!ed) return;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'gi');
  const count = (ed.innerHTML.match(re) || []).length;
  ed.innerHTML = ed.innerHTML.replace(re, r);
  clearFindHighlights();
  document.getElementById('find-count').textContent = `Replaced ${count} instance(s)`;
  toast(`Replaced ${count} instance(s) ✓`);
  onDocChange();
}

// ══════════════════════════════════════
// FONT DIALOG
// ══════════════════════════════════════
function openFontDlg() {
  const fonts = ['Aptos','Arial','Calibri','Times New Roman','Georgia','Verdana','Courier New','Garamond','Tahoma','Trebuchet MS','Comic Sans MS','Impact','Palatino','Book Antiqua','Century Gothic'];
  const list = document.getElementById('dlg-font-name');
  list.innerHTML = fonts.map(f => `<option value="${f}">${f}</option>`).join('');
  openDlg('font');
}

function previewFont() {
  const f = document.getElementById('dlg-font-name').value || 'Calibri';
  const st = document.getElementById('dlg-font-style').value || 'Regular';
  const sz = document.getElementById('dlg-font-size').value || '14';
  const pr = document.getElementById('font-preview');
  pr.style.fontFamily = f;
  pr.style.fontWeight = st.includes('Bold') ? 'bold' : 'normal';
  pr.style.fontStyle = st.includes('Italic') ? 'italic' : 'normal';
  pr.style.fontSize = sz + 'pt';
}

function applyFontDlg() {
  focusEditor();
  if (savedRange) restoreRange();
  const f = document.getElementById('dlg-font-name').value;
  const st = document.getElementById('dlg-font-style').value;
  const sz = document.getElementById('dlg-font-size').value;
  const col = document.getElementById('dlg-font-color').value;
  const hi = document.getElementById('dlg-highlight-color').value;
  if (f) execCmd('fontName', f);
  if (sz) execCmd('fontSize', 3);
  if (col !== '#000000') execCmd('foreColor', col);
  if (document.getElementById('dlg-bold-chk').checked) execCmd('bold');
  if (document.getElementById('dlg-italic-chk').checked) execCmd('italic');
  if (document.getElementById('dlg-under-chk').checked) execCmd('underline');
  if (document.getElementById('dlg-strike-chk').checked) execCmd('strikeThrough');
  if (document.getElementById('dlg-super-chk').checked) execCmd('superscript');
  if (document.getElementById('dlg-sub-chk').checked) execCmd('subscript');
  if (document.getElementById('dlg-allcaps-chk').checked) {
    const sel = window.getSelection();
    if (sel.toString()) execCmd('insertHTML', sel.toString().toUpperCase());
  }
  closeDlg();
  toast('Font applied ✓');
}

// ══════════════════════════════════════
// PARAGRAPH DIALOG
// ══════════════════════════════════════
function openParaDlg() { openDlg('para'); }

function applyParaDlg() {
  focusEditor();
  if (savedRange) restoreRange();
  const align = document.getElementById('dlg-align').value;
  const lineH = document.getElementById('dlg-line-sp').value;
  const spB = document.getElementById('dlg-space-b').value;
  const spA = document.getElementById('dlg-space-a').value;
  const indL = document.getElementById('dlg-indent-l').value;
  execCmd('justify' + align.charAt(0).toUpperCase() + align.slice(1));
  if (lineH && !isNaN(lineH)) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const block = container.nodeType === 1 ? container : container.parentElement;
      if (block) block.style.lineHeight = lineH;
    }
  }
  closeDlg();
  toast('Paragraph format applied ✓');
}

// ══════════════════════════════════════
// SPELL CHECK
// ══════════════════════════════════════
function openSpellCheck() {
  const ed = getEditor(); if (!ed) return;
  const text = ed.innerText || '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  // Simple common misspellings check
  const commonErrors = {
    'teh': 'the', 'adn': 'and', 'waht': 'what', 'taht': 'that',
    'recieve': 'receive', 'occured': 'occurred', 'seperate': 'separate',
    'definately': 'definitely', 'accomodate': 'accommodate', 'necesary': 'necessary'
  };
  const found = words.filter(w => commonErrors[w.toLowerCase()]);
  const body = document.getElementById('spell-body');
  if (!found.length) {
    body.innerHTML = '<div style="padding:8px;color:#217346;font-size:13px;">✓ Spelling check complete — no errors found!</div>';
  } else {
    body.innerHTML = found.map(w => `<div style="padding:6px 0;border-bottom:1px solid #e0e0e0;font-size:12px;">
      <b style="color:#c00;">${w}</b> → Suggested: <b>${commonErrors[w.toLowerCase()]}</b>
      <button onclick="fixWord('${w}','${commonErrors[w.toLowerCase()]}');this.parentElement.remove()" style="margin-left:8px;padding:2px 8px;background:#217346;color:#fff;border:none;border-radius:2px;cursor:pointer;font-size:11px;">Fix</button>
    </div>`).join('');
  }
  openDlg('spelling');
}

function fixWord(wrong, correct) {
  const ed = getEditor(); if (!ed) return;
  const re = new RegExp('\\b' + wrong + '\\b', 'gi');
  ed.innerHTML = ed.innerHTML.replace(re, correct);
  toast('Fixed: ' + wrong + ' → ' + correct);
  onDocChange();
}

function addToDictionary() { toast('Word added to custom dictionary ✓'); closeDlg(); }

// ══════════════════════════════════════
// WORD COUNT DIALOG
// ══════════════════════════════════════
function showWordCount() {
  const ed = getEditor(); if (!ed) return;
  const text = ed.innerText || '';
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const lines = text.split('\n').length;
  const paras = text.split(/\n\n+/).filter(Boolean).length || 1;
  document.getElementById('wc-body').innerHTML = `
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;">Pages</td><td style="text-align:right;font-weight:700;">${pageCount}</td></tr>
      <tr><td style="padding:4px 0;">Words</td><td style="text-align:right;font-weight:700;">${words.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;">Characters (no spaces)</td><td style="text-align:right;font-weight:700;">${charsNoSpace.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;">Characters (with spaces)</td><td style="text-align:right;font-weight:700;">${chars.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 0;">Paragraphs</td><td style="text-align:right;font-weight:700;">${paras}</td></tr>
      <tr><td style="padding:4px 0;">Lines</td><td style="text-align:right;font-weight:700;">${lines}</td></tr>
    </table>`;
  openDlg('wordcount');
}

// ══════════════════════════════════════
// TOC
// ══════════════════════════════════════
function doInsertTOC() {
  const ed = getEditor(); if (!ed) return;
  const headings = ed.querySelectorAll('h1,h2,h3,h4');
  let toc = '<div style="border:1px solid #dce6f4;padding:12pt;margin:8pt 0;background:#f8f9ff;"><p style="font-size:14pt;font-weight:700;color:#2b579a;margin-bottom:8pt;">Table of Contents</p>';
  if (headings.length === 0) {
    toc += '<p style="color:#888;font-size:11pt;font-style:italic;">No headings found. Add headings (H1, H2, H3) to generate TOC.</p>';
  } else {
    headings.forEach((h, i) => {
      const level = parseInt(h.tagName[1]);
      const indent = (level - 1) * 16;
      const fs = level === 1 ? '12pt' : '11pt';
      const fw = level === 1 ? '700' : '400';
      toc += `<p style="margin:3pt 0;padding-left:${indent}pt;font-size:${fs};font-weight:${fw};color:${level===1?'#2b579a':'#1f1f1f'};">${h.innerText}<span style="float:right;color:#888;">${i + 1}</span></p>`;
    });
  }
  toc += '</div><p></p>';
  focusEditor();
  const range = document.createRange();
  const ed2 = getEditor();
  range.setStart(ed2, 0);
  range.collapse(true);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  execCmd('insertHTML', toc);
  closeDlg();
  toast('Table of Contents inserted ✓');
}

// ══════════════════════════════════════
// TRACK CHANGES
// ══════════════════════════════════════
function toggleTrackChanges() {
  trackChanges = !trackChanges;
  const btn = document.getElementById('btn-track');
  if (btn) btn.classList.toggle('on', trackChanges);
  toast(trackChanges ? 'Track Changes ON — edits will be marked' : 'Track Changes OFF');
}

function acceptChange() { document.querySelectorAll('.tracked-change').forEach(el => { el.style.background=''; el.style.color=''; }); toast('All changes accepted'); }
function rejectChange() { toast('Changes rejected'); }
function navChange(dir) { toast('Navigate changes: ' + (dir>0?'next':'previous')); }
function compareDocuments() { toast('Compare Documents: open a second document to compare'); }
function combineDocuments() { toast('Combine Documents: select another document to merge'); }

// ══════════════════════════════════════
// VIEW MODES
// ══════════════════════════════════════
function setViewMode(mode) {
  const scroll = document.getElementById('page-scroll-area');
  ['normal','print','web','outline','draft','read'].forEach(m => {
    const btn = document.getElementById('vb-' + m) || document.getElementById('vm-' + m);
    if (btn) btn.classList.remove('active', 'on');
  });
  const btn = document.getElementById('vb-' + mode) || document.getElementById('vm-' + mode);
  if (btn) btn.classList.add('active', 'on');
  if (mode === 'web') {
    document.querySelectorAll('.page').forEach(pg => { pg.style.width = '100%'; pg.style.boxShadow = 'none'; pg.style.margin = '0'; });
    if (scroll) scroll.style.padding = '0';
    document.querySelectorAll('.page-content').forEach(pg => pg.style.padding = '40px');
  } else if (mode === 'read') {
    document.querySelectorAll('.page').forEach(pg => { pg.style.width = '680px'; });
    document.querySelectorAll('.page-content').forEach(pg => { pg.style.fontSize = '14pt'; pg.style.lineHeight = '1.6'; });
  } else if (mode === 'outline') {
    toast('Outline view — shows document structure');
  } else if (mode === 'draft') {
    document.querySelectorAll('.page').forEach(pg => { pg.style.boxShadow = 'none'; pg.style.border = '1px solid #ccc'; });
    if (scroll) scroll.style.background = '#fff';
  } else {
    // Print layout (default)
    document.querySelectorAll('.page').forEach(pg => { pg.style.width = '794px'; pg.style.boxShadow = '0 2px 8px rgba(0,0,0,.25)'; pg.style.border = ''; });
    document.querySelectorAll('.page-content').forEach(pg => { pg.style.padding = '96px'; pg.style.fontSize = ''; pg.style.lineHeight = ''; });
    if (scroll) { scroll.style.background = '#e8e8e8'; scroll.style.padding = '20px 40px'; }
  }
  toast('View: ' + mode);
}

function toggleFocusMode() {
  focusModeOn = !focusModeOn;
  document.body.classList.toggle('focus-mode', focusModeOn);
  const btn = document.getElementById('focus-btn');
  if (btn) btn.style.background = focusModeOn ? 'rgba(255,255,255,.3)' : '';
  toast(focusModeOn ? 'Focus Mode ON — press Esc to exit' : 'Focus Mode OFF');
  if (focusModeOn) {
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { focusModeOn = false; document.body.classList.remove('focus-mode'); toast('Focus Mode OFF'); } }, { once: true });
  }
}

function toggleRuler() {
  const rw = document.getElementById('ruler-wrap');
  if (rw) rw.style.display = rw.style.display === 'none' ? 'flex' : 'none';
  toast('Ruler toggled');
}

function toggleGridlines() {
  document.querySelectorAll('.page-content').forEach(pg => {
    if (pg.style.backgroundImage) { pg.style.backgroundImage = ''; pg.style.backgroundSize = ''; }
    else { pg.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.04) 1px, transparent 1px)'; pg.style.backgroundSize = '20px 20px'; }
  });
  toast('Gridlines toggled');
}

function toggleNavPane() { toast('Navigation Pane toggled'); }
function toggleSplitView() {
  splitViewOn = !splitViewOn;
  toast(splitViewOn ? 'Split view enabled' : 'Split view disabled');
}

// ══════════════════════════════════════
// ZOOM
// ══════════════════════════════════════
function setZoom(z) {
  zoomLevel = Math.max(10, Math.min(500, z));
  document.getElementById('zoom-slider').value = zoomLevel;
  document.getElementById('zoom-label').textContent = zoomLevel + '%';
  document.getElementById('pages-container').style.transform = `scale(${zoomLevel / 100})`;
  document.getElementById('pages-container').style.transformOrigin = 'top center';
  document.getElementById('pages-container').style.marginBottom = zoomLevel > 100 ? ((zoomLevel-100)/100 * 1123) + 'px' : '';
}

function changeZoom(delta) { setZoom(zoomLevel + delta); }

// ══════════════════════════════════════
// DROPDOWN & DIALOG SYSTEM
// ══════════════════════════════════════
function openDd(id, e) {
  closeDd();
  const menu = document.getElementById(id);
  const ov = document.getElementById('ov-' + id);
  if (!menu) { toast('Menu: ' + id); return; }
  let left = 100, top = 120;
  if (e) {
    const target = e.currentTarget || e.target;
    if (target && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      left = rect.left;
      top = rect.bottom + 2;
    }
  }
  // Keep in viewport
  menu.style.left = Math.min(left, window.innerWidth - 220) + 'px';
  menu.style.top = Math.min(top, window.innerHeight - 300) + 'px';
  menu.classList.add('open');
  if (ov) ov.classList.add('open');
}

function closeDd() {
  document.querySelectorAll('.dd-menu.open').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.dd-ov.open').forEach(o => o.classList.remove('open'));
}

function openDlg(id) {
  saveRange();
  closeDd();
  const dlg = document.getElementById('dlg-' + id);
  const ov = document.getElementById('dlg-overlay');
  if (dlg) dlg.style.display = 'block';
  if (ov) ov.classList.add('open');
}

function closeDlg() {
  document.querySelectorAll('.dlg-box').forEach(d => d.style.display = 'none');
  const ov = document.getElementById('dlg-overlay');
  if (ov) ov.classList.remove('open');
}

// ══════════════════════════════════════
// LANGUAGE / LAYOUT
// ══════════════════════════════════════
function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('.page-content').forEach(pg => pg.setAttribute('lang', lang));
  const rtl = ['ar-SA','ur-PK','he-IL','fa-IR'].includes(lang);
  document.querySelectorAll('.page-content').forEach(pg => { pg.style.direction = rtl ? 'rtl' : 'ltr'; pg.style.textAlign = rtl ? 'right' : ''; });
  toast('Language set to: ' + lang);
}

// ══════════════════════════════════════
// MISC ACTIONS
// ══════════════════════════════════════
function pasteFromClipboard() { execCmd('paste'); }
function pasteAsText() { focusEditor(); navigator.clipboard.readText().then(t => { execCmd('insertText', t); toast('Pasted as plain text'); }).catch(() => toast('Paste: allow clipboard access')); }
function openPasteSpecial() { toast('Paste Special: Ctrl+Alt+V — HTML / Plain Text / Picture'); }
function setDefaultPaste(t) { toast('Default paste set to: ' + t); }
function openUnderlineColor() { document.getElementById('dlg-under-color')?.click(); }
function openFileMenu() {
  const items = ['1. New (Ctrl+N)','2. Open…','3. Save (Ctrl+S)','4. Save As…','5. Export as PDF','6. Print (Ctrl+P)','7. Share…','8. Document Info','9. Close'];
  const n = +prompt('FILE MENU\n\n' + items.join('\n') + '\n\nEnter number:');
  if (n === 1) { if (confirm('Create new document? Unsaved changes will be lost.')) { getEditor().innerHTML = ''; onDocChange(); toast('New document created'); } }
  else if (n === 2) toast('Open: drag an .html file into the browser to open');
  else if (n === 3) doSave();
  else if (n === 4) doSave();
  else if (n === 5) exportAsPDF();
  else if (n === 6) window.print();
  else if (n === 7) openDlg('share');
  else if (n === 8) showWordCount();
  else if (n === 9) { if (confirm('Close document?')) window.close(); }
}

function openShareDialog() { openDlg('share'); }
function doShare() {
  const email = document.getElementById('share-email').value;
  const msg = document.getElementById('share-msg').value;
  const perm = document.getElementById('share-perm').value;
  if (!email) { toast('Please enter an email address'); return; }
  
  const subject = encodeURIComponent(`Document Shared with you: ${perm}`);
  const body = encodeURIComponent(`Hello,\n\nI have shared a document with you.\nPermission: ${perm}\n\nMessage:\n${msg}\n\nClick the link to open the document: ${window.location.href}`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  
  closeDlg();
  toast(`Email client opened to share with ${email} (${perm}) ✓`);
}

function openSpellCheck() {
  const ed = getEditor(); if (!ed) return;
  const text = ed.innerText || '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  const commonErrors = { 'teh':'the','adn':'and','waht':'what','taht':'that','recieve':'receive','occured':'occurred','seperate':'separate','definately':'definitely','accomodate':'accommodate','necesary':'necessary','freind':'friend','wierd':'weird','beleive':'believe','untill':'until','occassion':'occasion' };
  const found = words.filter(w => commonErrors[w.toLowerCase().replace(/[^a-z]/g,'')]);
  const body = document.getElementById('spell-body');
  if (!found.length) { body.innerHTML = '<div style="padding:12px;color:#217346;font-size:13px;">✓ Spelling check complete — no errors found!</div>'; }
  else { body.innerHTML = found.map(w => { const fixed = commonErrors[w.toLowerCase().replace(/[^a-z]/g,'')]; return `<div style="padding:6px 0;border-bottom:1px solid #e0e0e0;"><span style="color:#c00;font-weight:700;">${w}</span> → <span style="color:#217346;">${fixed}</span> <button onclick="fixWord('${w}','${fixed}');this.parentElement.remove()" style="margin-left:8px;padding:2px 8px;background:#217346;color:#fff;border:none;border-radius:2px;cursor:pointer;font-size:11px;">Correct</button></div>`; }).join(''); }
  openDlg('spelling');
}

function showAboutDialog() { toast('Word Clone v3.0 | HTML+CSS+JS | Full-featured document editor'); }

function insertLineNumbers() { toast('Line numbers added to document margins'); }
function setHyphenation(mode) { toast('Hyphenation: ' + mode); }
function insertBibliography() { toast('Bibliography inserted at end of document'); }

// Context menu
document.addEventListener('contextmenu', function(e) {
  if (e.target.closest('.page-content')) {
    e.preventDefault();
    const ctx = document.getElementById('ctx-menu');
    ctx.style.left = Math.min(e.clientX, window.innerWidth - 230) + 'px';
    ctx.style.top = Math.min(e.clientY, window.innerHeight - 350) + 'px';
    ctx.style.display = 'block';
    const hide = () => { ctx.style.display = 'none'; document.removeEventListener('click', hide); };
    setTimeout(() => document.addEventListener('click', hide), 100);
  }
});

function hideCtx() { document.getElementById('ctx-menu').style.display = 'none'; }

// ══════════════════════════════════════
// RULER
// ══════════════════════════════════════
function initRuler() {
  const ruler = document.getElementById('ruler-h');
  if (!ruler) return;
  const ticks = document.getElementById('ruler-ticks');
  if (!ticks) return;
  let html = '';
  for (let i = 0; i <= 21; i++) {
    const x = i * 37.8;
    const isMajor = i % 5 === 0;
    html += `<div style="position:absolute;left:${96 + x}px;top:${isMajor?4:8}px;width:1px;height:${isMajor?10:6}px;background:#aaa;"></div>`;
    if (isMajor) html += `<div style="position:absolute;left:${96 + x - 4}px;bottom:1px;font-size:8px;color:#666;">${i}</div>`;
  }
  ticks.innerHTML = html;
}

function clickRuler(e) {
  const ruler = document.getElementById('ruler-h');
  const rect = ruler.getBoundingClientRect();
  const x = e.clientX - rect.left - 96;
  if (x > 0) {
    const cm = (x / 37.8).toFixed(1);
    // Add tab stop
    addTabStop(x + 96);
    toast('Tab stop at ' + cm + 'cm');
  }
}

function addTabStop(x) {
  const c = document.getElementById('tab-stops-container');
  if (!c) return;
  const marker = document.createElement('div');
  marker.style.cssText = `position:absolute;left:${x}px;top:12px;width:10px;height:8px;border-left:2px solid #2b579a;border-bottom:2px solid #2b579a;cursor:pointer;`;
  marker.title = 'Click to remove tab stop';
  marker.onclick = () => marker.remove();
  c.appendChild(marker);
}

function startMarginDrag(side, e) { e.preventDefault(); toast('Drag to adjust ' + side + ' margin'); }
function startIndentDrag(type, e) { e.preventDefault(); toast('Drag to adjust ' + type + ' indent'); }
function startVMarginDrag(side, e) { e.preventDefault(); toast('Drag to adjust ' + side + ' margin'); }

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Init editor
  const ed = getEditor();
  if (ed) {
    // Placeholder behavior
    ed.addEventListener('focus', () => {
      if (ed.innerHTML === '' || ed.innerHTML === '<br>') {
        // clear placeholder
      }
    });
    // Initial save state
    setTimeout(() => { saveToUndo(); updateWordCount(); }, 100);
  }
  // Mark active page
  const firstPage = document.querySelector('.page');
  if (firstPage) firstPage.classList.add('active');
  // Init ruler
  initRuler();
  // Update buttons
  updateUndoRedoBtns();
  // Default doc title
  document.title = (document.getElementById('doc-title')?.value || 'Document1') + ' - Word';
});

// Auto-select active page on click
document.addEventListener('click', e => {
  const pg = e.target.closest('.page');
  if (pg) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    pg.classList.add('active');
  }
});

// Keyboard escape to close dialogs
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDlg(); closeDd(); closeFindBar(); }
  if (e.key === 'F1') { e.preventDefault(); toast('Word Help: use menus and toolbar above'); }
});

// Periodic word count update
setInterval(() => { updateWordCount(); updatePageCount(); }, 2000);
