/* Card collection and rules are read-only views: they never draw or mutate a duel. */
(function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const templates = [
    ...MONSTER_TEMPLATES.map(card => ({ ...card, type: 'monster' })),
    ...SPELL_TEMPLATES.map(card => ({ ...card, type: 'spell' })),
    ...RELIC_TEMPLATES.map(card => ({ ...card, type: 'relic' }))
  ].sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
  const art = card => window.ShadowCardArt?.src(card) || 'assets/card-back.svg';
  const dialog = document.createElement('dialog');
  dialog.id = 'collection-dialog'; dialog.className = 'duel-dialog';
  dialog.setAttribute('aria-labelledby', 'collection-title');
  dialog.innerHTML = `<header class="dialog-header"><div><span class="eyebrow">THE COMPLETE ARSENAL</span><h2 id="collection-title">Card collection</h2></div><button class="utility-button" type="button" data-close>Close ×</button></header>
    <p class="dialog-intro">Every card is in the shared starter list. Both players receive their own shuffled deck.</p>
    <div class="collection-controls"><label>Find a card<input id="collection-search" type="search" placeholder="Name, ability or element…" /></label><label>Type<select id="collection-type"><option value="">All cards</option><option value="monster">Monsters</option><option value="spell">Spells</option><option value="relic">Relics</option></select></label><label>Element<select id="collection-element"><option value="">All elements</option>${['flame','water','earth','wind','shadow','light','neutral'].map(element => `<option>${element}</option>`).join('')}</select></label><button type="button" class="utility-button" id="collection-reset">Reset</button></div>
    <p id="collection-count" role="status"></p><div class="collection-body"><div id="collection-grid" class="collection-grid"></div><aside id="collection-preview" class="collection-preview" hidden aria-label="Selected card"></aside></div>`;
  document.body.appendChild(dialog);
  const rulesDialog = document.createElement('dialog');
  rulesDialog.id = 'rules-dialog'; rulesDialog.className = 'duel-dialog rules-dialog';
  rulesDialog.setAttribute('aria-labelledby', 'rules-title');
  document.body.appendChild(rulesDialog);
  for (const modal of [dialog, rulesDialog]) {
    modal.addEventListener('click', event => {
      if (event.target.closest('[data-close]')) modal.close();
      if (event.target === modal) {
        const box = modal.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
      }
    });
  }
  function renderCollection() {
    const query = dialog.querySelector('#collection-search').value.trim().toLowerCase();
    const type = dialog.querySelector('#collection-type').value;
    const element = dialog.querySelector('#collection-element').value;
    const cards = templates.filter(card => (!type || card.type === type) && (!element || card.element === element) &&
      `${card.name} ${card.text} ${card.element} ${(card.keywords || []).join(' ')}`.toLowerCase().includes(query));
    dialog.querySelector('#collection-count').textContent = `${cards.length} of ${templates.length} cards · sorted by energy cost`;
    dialog.querySelector('#collection-grid').innerHTML = cards.length ? cards.map(card => `<button type="button" class="collection-card" data-card-name="${escape(card.name)}" data-element="${escape(card.element)}" aria-label="Inspect ${escape(card.name)}"><span class="collection-cost">${card.cost}</span><img src="${escape(art(card))}" alt="" loading="lazy" width="320" height="240" /><span class="collection-card-title">${escape(card.name)}</span><span class="collection-card-meta">${escape(card.element)} · ${escape(card.type)}</span><span class="collection-card-rule">${escape(card.text)}</span><span class="collection-card-stats">${card.type === 'monster' ? `ATK ${card.atk} / DEF ${card.def}` : escape(card.rarity)}</span></button>`).join('') : '<p class="collection-empty">No matching cards. Try another search or reset the filters.</p>';
  }
  function showPreview(card) {
    const preview = dialog.querySelector('#collection-preview');
    const keywords = window.ShadowDuelGame?.rules?.().keywordDescriptions || {};
    preview.innerHTML = `<button class="utility-button" id="collection-preview-close" type="button">Back to collection</button><img src="${escape(art(card))}" alt="${escape(card.name)} artwork" width="320" height="240" /><span class="eyebrow">${escape(card.rarity)} · ${escape(card.type)}</span><h3 tabindex="-1">${escape(card.name)}</h3><p class="preview-cost">${card.cost} energy · ${escape(card.element)}</p>${card.type === 'monster' ? `<p class="preview-stats">${card.atk} ATK <span>/</span> ${card.def} DEF</p>` : ''}<p>${escape(card.text)}</p>${(card.keywords || []).map(keyword => `<p class="keyword-description"><strong>${escape(keyword)}</strong> ${escape((keywords[keyword] || '').replace(/^[^:]+:\s*/, ''))}</p>`).join('')}`;
    preview.hidden = false;
    dialog.querySelector('.collection-body').classList.add('has-selection');
    preview.querySelector('#collection-preview-close').onclick = () => {
      preview.hidden = true;
      dialog.querySelector('.collection-body').classList.remove('has-selection');
      [...dialog.querySelectorAll('[data-card-name]')].find(button => button.dataset.cardName === card.name)?.focus();
    };
    preview.querySelector('h3').focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 700px)').matches) preview.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  dialog.querySelector('#collection-grid').addEventListener('click', event => {
    const button = event.target.closest('[data-card-name]');
    const card = button && templates.find(card => card.name === button.dataset.cardName);
    if (card) showPreview(card);
  });
  for (const id of ['collection-search', 'collection-type', 'collection-element']) dialog.querySelector('#' + id).addEventListener('input', renderCollection);
  dialog.querySelector('#collection-reset').onclick = () => {
    for (const id of ['collection-search', 'collection-type', 'collection-element']) dialog.querySelector('#' + id).value = '';
    renderCollection();
  };
  document.querySelectorAll('[data-open-collection]').forEach(button => button.addEventListener('click', () => {
    renderCollection(); dialog.showModal(); dialog.querySelector('#collection-search').focus();
  }));
  document.querySelectorAll('[data-open-rules]').forEach(button => button.addEventListener('click', () => {
    const rules = window.ShadowDuelGame?.rules?.() || {};
    rulesDialog.innerHTML = `<header class="dialog-header"><div><span class="eyebrow">YOUR FIRST DUEL</span><h2 id="rules-title">Play the field</h2></div><button type="button" class="utility-button" data-close>Close ×</button></header>
      <div class="rules-steps"><article><b>01</b><h3>Build your field</h3><p>Start at ${rules.startingLP || 8000} life. Your turn automatically refreshes energy and draws a card. Play one monster per turn into one of five zones; spells and relics also spend energy.</p></article><article><b>02</b><h3>Choose your attacks</h3><p>Select a ready monster, then an enemy monster. If their field is empty, select the open enemy field to attack directly. Each monster attacks once per turn. New monsters wait a turn unless they have Swift.</p></article><article><b>03</b><h3>Take the win</h3><p>Reduce your rival to zero life, or outlast their deck. End Turn passes play to your rival. Local Duel is pass-the-device play for two people; online play uses a shared room code.</p></article></div>
      <section class="rules-keywords"><h3>Know your abilities</h3>${Object.entries(rules.keywordDescriptions || {}).map(([keyword, text]) => `<p><strong>${escape(keyword)}</strong><span>${escape(text)}</span></p>`).join('')}</section><p class="rules-shortcuts"><strong>Inspect first:</strong> use a card's ⓘ button, right-click it, or focus it and press I. Enter/Space activates a focused card. Escape closes these reference windows.</p><p class="rules-shortcuts"><strong>Online:</strong> the guest marks Ready, then the host starts. A rematch needs both players. A lost connection interrupts the match; it does not award a verified win.</p>`;
    rulesDialog.showModal();
  }));
  const fan = document.getElementById('menu-art');
  if (fan) {
    const names = ['Cinder Wolf', 'Ancient Titan', 'Divine Renewal'];
    fan.innerHTML = names.map((name, index) => {
      const card = templates.find(card => card.name === name) || templates[index];
      return `<div class="menu-art-card" style="--fan-angle:${(index - 1) * 13}deg;--fan-index:${index}"><img src="${escape(art(card))}" alt="" /><span>${escape(card.name)}</span></div>`;
    }).join('');
  }
  const total = document.getElementById('collection-total');
  if (total) total.textContent = templates.length;
})();
