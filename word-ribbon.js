// ══════════════════════════════════════
// RIBBON DEFINITIONS
// ══════════════════════════════════════
const RIBBONS = {

home: `<div class="rb-panel" id="rb-home">
  <!-- Clipboard -->
  <div class="rb-grp">
    <div class="rb-top" style="gap:3px;">
      <div class="rbb" onclick="openDd('dd-paste',event)" title="Paste (Ctrl+V)"><span class="ico">📋</span>Paste▾</div>
      <div style="display:flex;flex-direction:column;gap:1px;padding-bottom:16px;">
        <div class="rbl" onclick="execCmd('cut')" title="Cut Ctrl+X"><span>✂</span> Cut</div>
        <div class="rbl" onclick="execCmd('copy')" title="Copy Ctrl+C"><span>⎘</span> Copy</div>
        <div class="rbl" onclick="doFormatPainter()" title="Format Painter"><span>🖌</span> Format Painter</div>
      </div>
    </div>
    <div class="rb-glbl">Clipboard</div>
  </div>
  <!-- Font -->
  <div class="rb-grp">
    <div class="rb-top" style="gap:2px;flex-wrap:wrap;max-width:230px;">
      <select class="rbdrop" id="font-family" style="width:130px;" onchange="execCmd('fontName',this.value)">
        <option value="Aptos (Body)" selected>Aptos (Body)</option>
        <option value="Arial">Arial</option><option value="Calibri">Calibri</option>
        <option value="'Times New Roman'">Times New Roman</option>
        <option value="Georgia">Georgia</option><option value="Verdana">Verdana</option>
        <option value="'Courier New'">Courier New</option><option value="'Comic Sans MS'">Comic Sans MS</option>
        <option value="Impact">Impact</option><option value="Garamond">Garamond</option>
        <option value="Tahoma">Tahoma</option><option value="'Trebuchet MS'">Trebuchet MS</option>
      </select>
      <select class="rbdrop" id="font-size" style="width:44px;" onchange="execCmd('fontSize',this.value)">
        <option>8</option><option>9</option><option>10</option><option>11</option>
        <option value="3" selected>12</option><option>14</option><option>16</option>
        <option>18</option><option>20</option><option>22</option><option>24</option>
        <option>28</option><option>32</option><option>36</option><option>48</option><option>72</option>
      </select>
      <div class="rbs" onclick="changeFontSize(1)" title="Increase Font Size (Ctrl+>)">A↑</div>
      <div class="rbs" onclick="changeFontSize(-1)" title="Decrease Font Size (Ctrl+<)">A↓</div>
      <div class="rbs" onclick="execCmd('removeFormat')" title="Clear All Formatting">Aa✕</div>
    </div>
    <div class="rb-bot" style="gap:2px;">
      <div class="rbs xb" id="btn-bold" onclick="toggleCmd('bold')" title="Bold (Ctrl+B)" style="font-weight:900;font-size:14px;">B</div>
      <div class="rbs" id="btn-italic" onclick="toggleCmd('italic')" title="Italic (Ctrl+I)" style="font-style:italic;font-size:14px;">I</div>
      <div class="rbs" id="btn-underline" onclick="openDd('dd-underline',event)" title="Underline (Ctrl+U)"><u>U</u>▾</div>
      <div class="rbs" id="btn-strike" onclick="toggleCmd('strikeThrough')" title="Strikethrough"><s>ab</s></div>
      <div class="rbs" onclick="toggleCmd('subscript')" title="Subscript">x₂</div>
      <div class="rbs" onclick="toggleCmd('superscript')" title="Superscript">x²</div>
      <div class="rbsep"></div>
      <div class="rb-colorwrap" title="Text Highlight Color" onclick="document.getElementById('inp-highlight').click()">
        <span style="font-size:12px;">🖍</span>
        <div class="rb-colorbar" id="highlight-bar" style="background:#ffff00;"></div>
        <input type="color" id="inp-highlight" value="#ffff00" onchange="applyHighlight(this.value)"/>
      </div>
      <div class="rbs" onclick="openDd('dd-highlight',event)" title="Text Highlight Color">▾</div>
      <div class="rb-colorwrap" title="Font Color" onclick="document.getElementById('inp-fontcolor').click()">
        <span style="font-weight:700;font-size:13px;">A</span>
        <div class="rb-colorbar" id="fontcolor-bar" style="background:#c00000;"></div>
        <input type="color" id="inp-fontcolor" value="#c00000" onchange="applyFontColor(this.value)"/>
      </div>
      <div class="rbs" onclick="openDd('dd-fontcolor',event)" title="Font Color">▾</div>
    </div>
    <div class="rb-glbl">Font</div>
  </div>
  <!-- Paragraph -->
  <div class="rb-grp">
    <div class="rb-top" style="gap:2px;">
      <div class="rbs" onclick="execCmd('insertUnorderedList')" title="Bullets" id="btn-ul">≡•</div>
      <div class="rbs" onclick="openDd('dd-bullets',event)" title="Bullet Library">▾</div>
      <div class="rbs" onclick="execCmd('insertOrderedList')" title="Numbering" id="btn-ol">≡1</div>
      <div class="rbs" onclick="openDd('dd-numbering',event)" title="Numbering Library">▾</div>
      <div class="rbs" onclick="execCmd('outdent')" title="Decrease Indent">⇤</div>
      <div class="rbs" onclick="execCmd('indent')" title="Increase Indent">⇥</div>
      <div class="rbs" onclick="openDd('dd-sort',event)" title="Sort">🔃</div>
      <div class="rbs" onclick="togglePilcrow()" title="Show/Hide Formatting Marks" id="btn-pilcrow" style="font-size:14px;">¶</div>
    </div>
    <div class="rb-bot" style="gap:2px;">
      <div class="rbs" id="btn-al" onclick="execCmd('justifyLeft')" title="Align Left (Ctrl+L)">⬛L</div>
      <div class="rbs" id="btn-ac" onclick="execCmd('justifyCenter')" title="Center (Ctrl+E)">☰</div>
      <div class="rbs" id="btn-ar" onclick="execCmd('justifyRight')" title="Align Right (Ctrl+R)">⬛R</div>
      <div class="rbs" id="btn-aj" onclick="execCmd('justifyFull')" title="Justify (Ctrl+J)">≡≡</div>
      <div class="rbsep"></div>
      <div class="rbs" onclick="openDd('dd-linespace',event)" title="Line and Paragraph Spacing">↕⬛▾</div>
      <div class="rb-colorwrap" title="Shading" onclick="document.getElementById('inp-shading').click()">
        <span>🎨</span>
        <div class="rb-colorbar" id="shading-bar" style="background:#ffd700;"></div>
        <input type="color" id="inp-shading" value="#ffd700" onchange="applyShading(this.value)"/>
      </div>
      <div class="rbs" onclick="openDd('dd-borders',event)" title="Borders">▦▾</div>
    </div>
    <div class="rb-glbl">Paragraph</div>
  </div>
  <!-- Styles -->
  <div class="rb-grp" style="min-width:300px;">
    <div class="rb-top" style="padding-bottom:16px;">
      <div class="styles-row" id="styles-row">
        <div class="style-card active" onclick="applyStyle('p')" style="font-size:11px;">¶ Normal</div>
        <div class="style-card" onclick="applyStyle('h1')" style="font-size:11px;color:#2e74b5;font-weight:700;">H1 Head 1</div>
        <div class="style-card" onclick="applyStyle('h2')" style="font-size:10px;color:#2e74b5;font-weight:700;">H2 Head 2</div>
        <div class="style-card" onclick="applyStyle('h3')" style="font-size:10px;color:#1f3864;">H3 Head 3</div>
        <div class="style-card" onclick="applyStyle('h4')" style="font-size:10px;color:#2e74b5;font-style:italic;">H4</div>
        <div class="style-card" onclick="applyStyle('title-style')" style="font-size:16px;font-weight:700;">Title</div>
        <div class="style-card" onclick="applyStyle('subtitle-style')" style="font-size:10px;color:#666;font-style:italic;">Subtitle</div>
        <div class="style-card" onclick="applyStyle('subtle-em')" style="font-size:10px;font-style:italic;">Subtle Em</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:2px;margin-left:4px;padding-bottom:16px;">
        <div class="rbs" onclick="scrollStyles(-1)" title="More styles up">▲</div>
        <div class="rbs" onclick="scrollStyles(1)" title="More styles down">▼</div>
        <div class="rbs" onclick="openStylesPane()" title="Styles pane">▾</div>
      </div>
    </div>
    <div class="rb-glbl">Styles</div>
  </div>
  <!-- Editing -->
  <div class="rb-grp">
    <div class="rb-top" style="gap:2px;">
      <div class="rbb" onclick="openFind()" title="Find (Ctrl+F)"><span class="ico">🔍</span>Find▾</div>
      <div class="rbb" onclick="openFindReplace()" title="Replace (Ctrl+H)"><span class="ico">🔄</span>Replace</div>
      <div class="rbb" onclick="openDd('dd-select',event)" title="Select"><span class="ico">☐</span>Select▾</div>
    </div>
    <div class="rb-glbl">Editing</div>
  </div>
  <!-- Add-ins -->
  <div class="rb-grp">
    <div class="rb-top">
      <div class="rbb" onclick="toast('Add-ins gallery opened')"><span class="ico">🔌</span>Add-ins</div>
    </div>
    <div class="rb-glbl">Add-ins</div>
  </div>
</div>`,

insert: `<div class="rb-panel" id="rb-insert">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openDd('dd-pages',event)"><span class="ico">📄</span>Pages▾</div>
    <div class="rbb" onclick="openTablePicker(event)"><span class="ico">🗃</span>Table▾</div>
    <div class="rbb" onclick="openDlg('image')"><span class="ico">🖼</span>Pictures▾</div>
    <div class="rbb" onclick="openDd('dd-shapes',event)"><span class="ico">🔷</span>Shapes▾</div>
    <div class="rbb" onclick="toast('Icons gallery opened')"><span class="ico">⭐</span>Icons</div>
    <div class="rbb" onclick="toast('3D Models opened')"><span class="ico">🧊</span>3D Models</div>
    <div class="rbb" onclick="toast('SmartArt gallery opened')"><span class="ico">📊</span>SmartArt</div>
    <div class="rbb" onclick="toast('Chart wizard opened')"><span class="ico">📈</span>Chart</div>
    <div class="rbb" onclick="toast('Screenshot captured')"><span class="ico">📷</span>Screenshot▾</div>
  </div><div class="rb-glbl">Illustrations</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openDlg('headfoot')"><span class="ico">📑</span>Header▾</div>
    <div class="rbb" onclick="openDlg('headfoot')"><span class="ico">📑</span>Footer▾</div>
    <div class="rbb" onclick="insertPageNumber()"><span class="ico">#</span>Page Number▾</div>
  </div><div class="rb-glbl">Header & Footer</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="insertTextBox()"><span class="ico">Aa</span>Text Box▾</div>
    <div class="rbb" onclick="insertWordArt()"><span class="ico">✨</span>WordArt▾</div>
    <div class="rbb" onclick="insertDropCap()"><span class="ico">A</span>Drop Cap▾</div>
    <div class="rbb" onclick="insertDateField()"><span class="ico">📅</span>Date & Time</div>
    <div class="rbb" onclick="insertFieldCode()"><span class="ico">{ }</span>Field</div>
  </div><div class="rb-glbl">Text</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openDlg('link')"><span class="ico">🔗</span>Link▾</div>
    <div class="rbb" onclick="insertBookmark()"><span class="ico">🔖</span>Bookmark</div>
    <div class="rbb" onclick="insertCrossRef()"><span class="ico">🔁</span>Cross-reference</div>
    <div class="rbb" onclick="insertComment()"><span class="ico">💬</span>Comment</div>
    <div class="rbb" onclick="insertFootnote()"><span class="ico">¹</span>Footnote</div>
    <div class="rbb" onclick="insertEndnote()"><span class="ico">ⁱ</span>Endnote</div>
  </div><div class="rb-glbl">Links & Notes</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="insertEquation()"><span class="ico">π</span>Equation▾</div>
    <div class="rbb" onclick="insertSymbol()"><span class="ico">Ω</span>Symbol▾</div>
  </div><div class="rb-glbl">Symbols</div></div>
</div>`,

design: `<div class="rb-panel" id="rb-design">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="applyDocTheme('default')"><span class="ico">🎨</span>Themes▾</div>
    <div class="rbb" onclick="applyDocTheme('colors')"><span class="ico">🌈</span>Colors▾</div>
    <div class="rbb" onclick="applyDocTheme('fonts')"><span class="ico">Aa</span>Fonts▾</div>
    <div class="rbb" onclick="applyDocTheme('effects')"><span class="ico">✨</span>Effects▾</div>
    <div class="rbb" onclick="setDocDefault()"><span class="ico">📌</span>Set as Default</div>
  </div><div class="rb-glbl">Document Formatting</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openWatermarkDd(event)"><span class="ico">🏷</span>Watermark▾</div>
    <div class="rb-colorwrap" title="Page Color" onclick="document.getElementById('inp-pgcolor').click()" style="width:50px;height:56px;border:1px solid transparent;border-radius:3px;" onmouseover="this.style.background='#d5e3f7'" onmouseout="this.style.background=''">
      <span style="font-size:20px;line-height:1;">🖌</span>
      <div class="rb-colorbar" id="pgcolor-bar" style="background:#fff;"></div>
      <span style="font-size:10px;">Page Color▾</span>
      <input type="color" id="inp-pgcolor" value="#ffffff" onchange="applyPageColor(this.value)"/>
    </div>
    <div class="rbb" onclick="openDd('dd-pageborder',event)"><span class="ico">▦</span>Page Borders</div>
  </div><div class="rb-glbl">Page Background</div></div>
</div>`,

layout: `<div class="rb-panel" id="rb-layout">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openDd('dd-margins',event)"><span class="ico">📏</span>Margins▾</div>
    <div class="rbb" onclick="toggleOrientation()"><span class="ico">📐</span>Orientation▾</div>
    <div class="rbb" onclick="openDd('dd-papersize',event)"><span class="ico">📄</span>Size▾</div>
    <div class="rbb" onclick="openDd('dd-columns',event)"><span class="ico">⫴</span>Columns▾</div>
    <div class="rbb" onclick="insertPageBreak()"><span class="ico">⊟</span>Breaks▾</div>
    <div class="rbb" onclick="openDd('dd-linenumbers',event)"><span class="ico">1▾</span>Line Numbers▾</div>
    <div class="rbb" onclick="openDd('dd-hyphenation',event)"><span class="ico">⁻</span>Hyphenation▾</div>
  </div><div class="rb-glbl">Page Setup</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openParaDlg()"><span class="ico">¶</span>Paragraph</div>
    <div class="rbb" onclick="openDd('dd-indent',event)"><span class="ico">⇥</span>Indent</div>
    <div class="rbb" onclick="openDd('dd-spacing',event)"><span class="ico">↕</span>Spacing</div>
  </div><div class="rb-glbl">Paragraph</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openDd('dd-position',event)"><span class="ico">📌</span>Position▾</div>
    <div class="rbb" onclick="openDd('dd-textwrap',event)"><span class="ico">≡</span>Wrap Text▾</div>
    <div class="rbb" onclick="openDd('dd-bringforward',event)"><span class="ico">⬆</span>Bring Forward▾</div>
    <div class="rbb" onclick="openDd('dd-sendbehind',event)"><span class="ico">⬇</span>Send Backward▾</div>
    <div class="rbb" onclick="toast('Selection Pane opened')"><span class="ico">☐</span>Selection Pane</div>
    <div class="rbb" onclick="toast('Objects aligned')"><span class="ico">⊞</span>Align▾</div>
    <div class="rbb" onclick="toast('Objects grouped')"><span class="ico">⊡</span>Group▾</div>
    <div class="rbb" onclick="toast('Object rotated')"><span class="ico">↻</span>Rotate▾</div>
  </div><div class="rb-glbl">Arrange</div></div>
</div>`,

references: `<div class="rb-panel" id="rb-references">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openDlg('toc')"><span class="ico">📋</span>Table of Contents▾</div>
    <div class="rbb" onclick="updateTOC()"><span class="ico">🔄</span>Update Table</div>
  </div><div class="rb-glbl">Table of Contents</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="insertFootnote()"><span class="ico">¹</span>Insert Footnote<span style="font-size:9px;">Ctrl+Alt+F</span></div>
    <div class="rbb" onclick="insertEndnote()"><span class="ico">ⁱ</span>Insert Endnote</div>
    <div class="rbb" onclick="navFootnote(-1)"><span class="ico">◀</span>Previous Footnote</div>
    <div class="rbb" onclick="navFootnote(1)"><span class="ico">▶</span>Next Footnote</div>
    <div class="rbb" onclick="openDd('dd-shownotes',event)"><span class="ico">👁</span>Show Notes</div>
  </div><div class="rb-glbl">Footnotes</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Citation inserted')"><span class="ico">📜</span>Insert Citation▾</div>
    <div class="rbb" onclick="toast('Source manager opened')"><span class="ico">📚</span>Manage Sources</div>
    <div class="rbb" onclick="openDd('dd-bibstyle',event)"><span class="ico">🎓</span>Style▾</div>
    <div class="rbb" onclick="insertBibliography()"><span class="ico">📗</span>Bibliography▾</div>
  </div><div class="rb-glbl">Citations & Bibliography</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="insertCaption()"><span class="ico">🖼</span>Insert Caption</div>
    <div class="rbb" onclick="toast('Table of figures inserted')"><span class="ico">📊</span>Insert Table of Figures</div>
    <div class="rbb" onclick="toast('Cross-reference dialog')"><span class="ico">🔁</span>Cross-reference</div>
  </div><div class="rb-glbl">Captions</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="insertMarkEntry()"><span class="ico">🏷</span>Mark Entry</div>
    <div class="rbb" onclick="toast('Index inserted')"><span class="ico">📑</span>Insert Index</div>
    <div class="rbb" onclick="toast('Index updated')"><span class="ico">🔄</span>Update Index</div>
  </div><div class="rb-glbl">Index</div></div>
</div>`,

mailings: `<div class="rb-panel" id="rb-mailings">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Envelopes dialog opened')"><span class="ico">✉</span>Envelopes</div>
    <div class="rbb" onclick="toast('Labels dialog opened')"><span class="ico">🏷</span>Labels</div>
  </div><div class="rb-glbl">Create</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Mail Merge wizard started')"><span class="ico">📧</span>Start Mail Merge▾</div>
    <div class="rbb" onclick="toast('Recipients selected')"><span class="ico">👥</span>Select Recipients▾</div>
    <div class="rbb" onclick="toast('Recipient list edited')"><span class="ico">✏</span>Edit Recipient List</div>
  </div><div class="rb-glbl">Start Mail Merge</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Address block inserted')"><span class="ico">📬</span>Address Block</div>
    <div class="rbb" onclick="toast('Greeting line inserted')"><span class="ico">👋</span>Greeting Line</div>
    <div class="rbb" onclick="toast('Merge field inserted')"><span class="ico">{ }</span>Insert Merge Field▾</div>
  </div><div class="rb-glbl">Write & Insert Fields</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Results preview showing')"><span class="ico">👁</span>Preview Results</div>
    <div class="rbb" onclick="toast('Error check complete')"><span class="ico">✅</span>Check for Errors</div>
    <div class="rbb" onclick="toast('Merge completed')"><span class="ico">✔</span>Finish & Merge▾</div>
  </div><div class="rb-glbl">Preview & Finish</div></div>
</div>`,

review: `<div class="rb-panel" id="rb-review">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="openSpellCheck()"><span class="ico">📝</span>Spelling & Grammar<span style="font-size:9px;">F7</span></div>
    <div class="rbb" onclick="toast('Thesaurus opened: select a word first')"><span class="ico">📖</span>Thesaurus<span style="font-size:9px;">Shift+F7</span></div>
    <div class="rbb" onclick="showWordCount()"><span class="ico">🔢</span>Word Count</div>
    <div class="rbb" onclick="toast('Accessibility check complete')"><span class="ico">♿</span>Check Accessibility</div>
  </div><div class="rb-glbl">Proofing</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Translation service opened')"><span class="ico">🌐</span>Translate▾</div>
    <div class="rbb" onclick="openDd('dd-language',event)"><span class="ico">🗣</span>Language▾</div>
  </div><div class="rb-glbl">Language</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="insertComment()"><span class="ico">💬</span>New Comment</div>
    <div class="rbb" onclick="deleteComment()"><span class="ico">🗑</span>Delete Comment▾</div>
    <div class="rbb" onclick="navComment(-1)"><span class="ico">◀</span>Previous Comment</div>
    <div class="rbb" onclick="navComment(1)"><span class="ico">▶</span>Next Comment</div>
    <div class="rbb" onclick="toggleShowComments()"><span class="ico">👁</span>Show Comments</div>
  </div><div class="rb-glbl">Comments</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toggleTrackChanges()" id="btn-track"><span class="ico">📋</span>Track Changes▾</div>
    <div class="rbb" onclick="toast('All markup showing')"><span class="ico">👁</span>Show Markup▾</div>
    <div class="rbb" onclick="openDd('dd-reviewing-pane',event)"><span class="ico">📋</span>Reviewing Pane▾</div>
  </div><div class="rb-glbl">Tracking</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="acceptChange()"><span class="ico">✔</span>Accept▾</div>
    <div class="rbb" onclick="rejectChange()"><span class="ico">✕</span>Reject▾</div>
    <div class="rbb" onclick="navChange(-1)"><span class="ico">◀</span>Previous</div>
    <div class="rbb" onclick="navChange(1)"><span class="ico">▶</span>Next</div>
  </div><div class="rb-glbl">Changes</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="compareDocuments()"><span class="ico">🔀</span>Compare▾</div>
    <div class="rbb" onclick="combineDocuments()"><span class="ico">⊞</span>Combine</div>
  </div><div class="rb-glbl">Compare</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Document protected')"><span class="ico">🔒</span>Protect Document▾</div>
    <div class="rbb" onclick="toast('Editing restricted')"><span class="ico">🛡</span>Restrict Editing</div>
  </div><div class="rb-glbl">Protect</div></div>
</div>`,

view: `<div class="rb-panel" id="rb-view">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" id="vb-print" onclick="setViewMode('print')" class="rbb on"><span class="ico">📄</span>Print Layout</div>
    <div class="rbb" id="vb-web" onclick="setViewMode('web')"><span class="ico">🌐</span>Web Layout</div>
    <div class="rbb" id="vb-outline" onclick="setViewMode('outline')"><span class="ico">☰</span>Outline</div>
    <div class="rbb" id="vb-draft" onclick="setViewMode('draft')"><span class="ico">📝</span>Draft</div>
    <div class="rbb" id="vb-read" onclick="setViewMode('read')"><span class="ico">📖</span>Read Mode</div>
    <div class="rbb" onclick="toggleFocusMode()"><span class="ico">🔲</span>Focus</div>
  </div><div class="rb-glbl">Views</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div style="display:flex;flex-direction:column;gap:4px;padding-bottom:16px;">
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" id="chk-ruler" checked onchange="toggleRuler()"/> Ruler</label>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" id="chk-gridlines" onchange="toggleGridlines()"/> Gridlines</label>
      <label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" id="chk-navpane" onchange="toggleNavPane()"/> Navigation Pane</label>
    </div>
  </div><div class="rb-glbl">Show</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="setZoom(100)"><span class="ico">🔍</span>Zoom</div>
    <div class="rbb" onclick="setZoom(100)"><span class="ico">1:1</span>100%</div>
    <div class="rbb" onclick="setZoom(150)"><span class="ico">🔎</span>One Page</div>
    <div class="rbb" onclick="setZoom(75)"><span class="ico">⊞</span>Multiple Pages</div>
    <div class="rbb" onclick="setZoom(100)"><span class="ico">↔</span>Page Width</div>
  </div><div class="rb-glbl">Zoom</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('New window opened')"><span class="ico">🗗</span>New Window</div>
    <div class="rbb" onclick="toast('All windows arranged')"><span class="ico">⊞</span>Arrange All</div>
    <div class="rbb" onclick="toggleSplitView()"><span class="ico">⊟</span>Split</div>
    <div class="rbb" onclick="toast('Documents switched')"><span class="ico">🔄</span>Switch Windows▾</div>
  </div><div class="rb-glbl">Window</div></div>
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Macro recorded/run')"><span class="ico">⏺</span>Macros▾</div>
  </div><div class="rb-glbl">Macros</div></div>
</div>`,

help: `<div class="rb-panel" id="rb-help">
  <div class="rb-grp"><div class="rb-top" style="gap:3px;">
    <div class="rbb" onclick="toast('Word Help opened (F1)')"><span class="ico">❓</span>Help</div>
    <div class="rbb" onclick="toast('Contact Support')"><span class="ico">📞</span>Contact Support</div>
    <div class="rbb" onclick="toast('Feedback sent — thank you!')"><span class="ico">📣</span>Feedback</div>
    <div class="rbb" onclick="showAboutDialog()"><span class="ico">ℹ</span>About</div>
    <div class="rbb" onclick="toast('What\\'s New in Word')"><span class="ico">🆕</span>What\\'s New</div>
  </div><div class="rb-glbl">Help</div></div>
</div>`
};

// ── DROPDOWN MENUS HTML ──
const DD_HTML = `
<div class="dd-ov" id="ov-dd-paste" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-paste">
  <div class="ddi" onclick="execCmd('paste');closeDd()"><span class="di">📋</span>Paste<span class="ds">Ctrl+V</span></div>
  <div class="ddi" onclick="pasteAsText();closeDd()"><span class="di">📄</span>Paste as Text Only</div>
  <div class="ddi" onclick="pasteFromClipboard();closeDd()"><span class="di">📋</span>Keep Source Formatting</div>
  <div class="ddi" onclick="openPasteSpecial();closeDd()"><span class="di">🔧</span>Paste Special…<span class="ds">Ctrl+Alt+V</span></div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="setDefaultPaste('text');closeDd()">Set Default Paste…</div>
</div>
<div class="dd-ov" id="ov-dd-underline" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-underline" style="min-width:180px;">
  <div class="ddi" onclick="execCmd('underline');closeDd()">─ Single<span class="ds">Ctrl+U</span></div>
  <div class="ddi" onclick="applyUnderlineStyle('double');closeDd()">═ Double</div>
  <div class="ddi" onclick="applyUnderlineStyle('dotted');closeDd()">... Dotted</div>
  <div class="ddi" onclick="applyUnderlineStyle('dashed');closeDd()">- - Dashed</div>
  <div class="ddi" onclick="applyUnderlineStyle('wavy');closeDd()">~ Wavy</div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="openUnderlineColor();closeDd()">Underline Color▾</div>
</div>
<div class="dd-ov" id="ov-dd-highlight" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-highlight" style="min-width:160px;padding:8px;">
  <div style="display:grid;grid-template-columns:repeat(5,24px);gap:3px;margin-bottom:6px;">
    ${['#ffff00','#00ff00','#00ffff','#ff00ff','#0000ff','#ff0000','#ff8c00','#ffffff','#808080','#000000'].map(c=>`<div style="width:24px;height:24px;background:${c};border:1px solid #ccc;border-radius:2px;cursor:pointer;" onclick="applyHighlight('${c}');closeDd()"></div>`).join('')}
  </div>
  <div class="ddi" onclick="applyHighlight('');closeDd()">No Color</div>
</div>
<div class="dd-ov" id="ov-dd-fontcolor" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-fontcolor" style="min-width:160px;padding:8px;">
  <div style="font-size:11px;color:#555;margin-bottom:4px;">Theme Colors</div>
  <div style="display:grid;grid-template-columns:repeat(10,20px);gap:2px;margin-bottom:6px;">
    ${['#000000','#ffffff','#ee1111','#ff6600','#ffcc00','#33aa33','#3377cc','#993399','#996633','#666666'].map(c=>`<div style="width:20px;height:20px;background:${c};border:1px solid #ccc;border-radius:1px;cursor:pointer;" onclick="applyFontColor('${c}');closeDd()"></div>`).join('')}
  </div>
  <div class="ddi" onclick="document.getElementById('inp-fontcolor').click();closeDd()">More Colors…</div>
</div>
<div class="dd-ov" id="ov-dd-bullets" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-bullets" style="min-width:200px;padding:8px;">
  <div style="font-size:11px;color:#555;margin-bottom:6px;font-weight:700;">Bullet Library</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px;">
    <div onclick="applyBulletStyle('disc');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:12px;text-align:center;">● Filled</div>
    <div onclick="applyBulletStyle('circle');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:12px;text-align:center;">○ Open</div>
    <div onclick="applyBulletStyle('square');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:12px;text-align:center;">■ Square</div>
    <div onclick="execCmd('insertUnorderedList');document.execCommand('styleWithCSS',false,false);closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:12px;text-align:center;">— Dash</div>
  </div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="openDlg('bullets');closeDd()">Define New Bullet…</div>
</div>
<div class="dd-ov" id="ov-dd-numbering" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-numbering" style="min-width:200px;padding:8px;">
  <div style="font-size:11px;color:#555;margin-bottom:6px;font-weight:700;">Numbering Library</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px;">
    <div onclick="applyNumberStyle('decimal');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:11px;text-align:center;">1. 2. 3.</div>
    <div onclick="applyNumberStyle('lower-alpha');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:11px;text-align:center;">a) b) c)</div>
    <div onclick="applyNumberStyle('upper-alpha');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:11px;text-align:center;">A) B) C)</div>
    <div onclick="applyNumberStyle('lower-roman');closeDd()" style="border:1px solid #ccc;padding:6px;cursor:pointer;border-radius:2px;font-size:11px;text-align:center;">i. ii. iii.</div>
  </div>
  <div class="ddi" onclick="openDlg('bullets');closeDd()">Define New Number Format…</div>
</div>
<div class="dd-ov" id="ov-dd-linespace" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-linespace">
  <div class="ddi" onclick="setLineHeight(1);closeDd()">1.0</div>
  <div class="ddi" onclick="setLineHeight(1.15);closeDd()">1.15 ✓</div>
  <div class="ddi" onclick="setLineHeight(1.5);closeDd()">1.5</div>
  <div class="ddi" onclick="setLineHeight(2);closeDd()">2.0</div>
  <div class="ddi" onclick="setLineHeight(2.5);closeDd()">2.5</div>
  <div class="ddi" onclick="setLineHeight(3);closeDd()">3.0</div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="addSpaceBefore();closeDd()">Add Space Before Paragraph</div>
  <div class="ddi" onclick="addSpaceAfter();closeDd()">Add Space After Paragraph</div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="openParaDlg();closeDd()">Line Spacing Options…</div>
</div>
<div class="dd-ov" id="ov-dd-borders" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-borders">
  <div class="ddi" onclick="applyParaBorder('bottom');closeDd()">⬇ Bottom Border</div>
  <div class="ddi" onclick="applyParaBorder('top');closeDd()">⬆ Top Border</div>
  <div class="ddi" onclick="applyParaBorder('left');closeDd()">⬅ Left Border</div>
  <div class="ddi" onclick="applyParaBorder('right');closeDd()">➡ Right Border</div>
  <div class="ddi" onclick="applyParaBorder('all');closeDd()">▦ All Borders</div>
  <div class="ddi" onclick="applyParaBorder('box');closeDd()">□ Outside Borders</div>
  <div class="ddi" onclick="applyParaBorder('none');closeDd()">✕ No Border</div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="toast('Horizontal line inserted');insertHorizontalLine();closeDd()">— Horizontal Line</div>
  <div class="ddi" onclick="toast('Border dialog');closeDd()">Borders and Shading…</div>
</div>
<div class="dd-ov" id="ov-dd-select" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-select">
  <div class="ddi" onclick="execCmd('selectAll');closeDd()">Select All<span class="ds">Ctrl+A</span></div>
  <div class="ddi" onclick="selectCurrentLine();closeDd()">Select Current Line</div>
  <div class="ddi" onclick="selectCurrentPara();closeDd()">Select Current Paragraph</div>
  <div class="ddi" onclick="toast('Select all with similar formatting');closeDd()">Select All with Similar Formatting</div>
</div>
<div class="dd-ov" id="ov-dd-sort" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-sort">
  <div class="ddi" onclick="sortSelection('az');closeDd()">Sort A to Z</div>
  <div class="ddi" onclick="sortSelection('za');closeDd()">Sort Z to A</div>
</div>
<div class="dd-ov" id="ov-dd-pages" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-pages">
  <div class="ddi" onclick="insertPageBreak();closeDd()">Page Break<span class="ds">Ctrl+Enter</span></div>
  <div class="ddi" onclick="insertBlankPage();closeDd()">Blank Page</div>
  <div class="ddi" onclick="insertCoverPage();closeDd()">Cover Page▾</div>
</div>
<div class="dd-ov" id="ov-dd-shapes" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-shapes" style="padding:8px;min-width:200px;">
  <div style="font-size:11px;color:#555;margin-bottom:6px;">Recently Used Shapes</div>
  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">
    ${['▭','○','△','▷','◇','☆','⬡','✦'].map(s=>`<div style="width:28px;height:28px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:2px;font-size:16px;" onclick="insertShape('${s}');closeDd()">${s}</div>`).join('')}
  </div>
  <div class="ddi" onclick="insertShape('line');closeDd()">— Line</div>
  <div class="ddi" onclick="insertShape('arrow');closeDd()">→ Arrow</div>
  <div class="ddi" onclick="insertShape('textbox');closeDd()">□ Text Box</div>
</div>
<div class="dd-ov" id="ov-dd-margins" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-margins">
  <div class="ddi" onclick="setMargins(2.54,2.54,2.54,2.54);closeDd()">Normal (2.54cm all)</div>
  <div class="ddi" onclick="setMargins(1.27,1.27,1.27,1.27);closeDd()">Narrow (1.27cm all)</div>
  <div class="ddi" onclick="setMargins(2.54,2.54,3.81,3.81);closeDd()">Moderate</div>
  <div class="ddi" onclick="setMargins(2.54,2.54,5.08,5.08);closeDd()">Wide</div>
  <div class="ddi" onclick="setMargins(2.54,2.54,1.27,1.27);closeDd()">Mirrored</div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="openDlg('pagesetup');closeDd()">Custom Margins…</div>
</div>
<div class="dd-ov" id="ov-dd-papersize" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-papersize">
  <div class="ddi" onclick="setPaperSize(794,1123,'A4');closeDd()">A4 (21 × 29.7cm)</div>
  <div class="ddi" onclick="setPaperSize(816,1056,'Letter');closeDd()">Letter (8.5 × 11in)</div>
  <div class="ddi" onclick="setPaperSize(816,1344,'Legal');closeDd()">Legal (8.5 × 14in)</div>
  <div class="ddi" onclick="setPaperSize(1123,1587,'A3');closeDd()">A3 (29.7 × 42cm)</div>
  <div class="ddi" onclick="setPaperSize(595,842,'A5');closeDd()">A5 (14.8 × 21cm)</div>
</div>
<div class="dd-ov" id="ov-dd-columns" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-columns">
  <div class="ddi" onclick="setColumns(1);closeDd()">⬜ One</div>
  <div class="ddi" onclick="setColumns(2);closeDd()">⬜⬜ Two</div>
  <div class="ddi" onclick="setColumns(3);closeDd()">⬜⬜⬜ Three</div>
  <div class="ddi" onclick="setColumns(2,'left');closeDd()">◫ Left</div>
  <div class="ddi" onclick="setColumns(2,'right');closeDd()">◨ Right</div>
  <div class="dd-sep"></div>
  <div class="ddi" onclick="openDlg('pagesetup');closeDd()">More Columns…</div>
</div>
<div class="dd-ov" id="ov-dd-language" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-language">
  <div class="ddi" onclick="setLanguage('en-US');closeDd()">English (US)</div>
  <div class="ddi" onclick="setLanguage('en-GB');closeDd()">English (UK)</div>
  <div class="ddi" onclick="setLanguage('fr-FR');closeDd()">French (France)</div>
  <div class="ddi" onclick="setLanguage('de-DE');closeDd()">German (Germany)</div>
  <div class="ddi" onclick="setLanguage('es-ES');closeDd()">Spanish (Spain)</div>
  <div class="ddi" onclick="setLanguage('ar-SA');closeDd()">Arabic</div>
  <div class="ddi" onclick="setLanguage('ur-PK');closeDd()">Urdu</div>
  <div class="ddi" onclick="setLanguage('zh-CN');closeDd()">Chinese Simplified</div>
</div>
<div class="dd-ov" id="ov-dd-pageborder" onclick="closeDd()"></div>
<div class="dd-menu" id="dd-pageborder">
  <div class="ddi" onclick="applyPageBorder('solid');closeDd()">Solid Border</div>
  <div class="ddi" onclick="applyPageBorder('dashed');closeDd()">Dashed Border</div>
  <div class="ddi" onclick="applyPageBorder('double');closeDd()">Double Border</div>
  <div class="ddi" onclick="applyPageBorder('');closeDd()">No Border</div>
</div>
<!-- Table picker popup -->
<div id="table-picker" style="display:none;">
  <div class="tp-grid" id="tp-grid"></div>
  <div id="tp-label">0 × 0 Table</div>
</div>
`;

// Inject dropdowns into body
document.body.insertAdjacentHTML('beforeend', DD_HTML);

// ── INIT RIBBON ──
function switchTab(tab) {
  document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
  const el = document.getElementById('rtab-' + tab);
  if (el) el.classList.add('active');
  const ribbon = document.getElementById('ribbon');
  ribbon.innerHTML = RIBBONS[tab] || `<div class="rb-panel"><div style="padding:20px;color:#888;">Coming soon…</div></div>`;
  syncRibbonState();
}

function syncRibbonState() {
  try {
    const cmds = [['bold','btn-bold'],['italic','btn-italic'],['underline','btn-underline'],['strikeThrough','btn-strike'],['insertUnorderedList','btn-ul'],['insertOrderedList','btn-ol'],['justifyLeft','btn-al'],['justifyCenter','btn-ac'],['justifyRight','btn-ar'],['justifyFull','btn-aj']];
    cmds.forEach(([cmd, id]) => {
      const el = document.getElementById(id);
      if (el) {
        if (document.queryCommandState(cmd)) el.classList.add('on');
        else el.classList.remove('on');
      }
    });
  } catch(e) {}
}

// Load Home ribbon by default
document.addEventListener('DOMContentLoaded', () => {
  switchTab('home');
  initTablePicker();
});
