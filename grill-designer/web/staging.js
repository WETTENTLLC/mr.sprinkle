(function () {
  const local = new Set(['localhost', '127.0.0.1', '[::1]']);
  const raw = window.__API_BASE__ || '';
  const unresolved = raw.startsWith('__PORT_');
  if (unresolved && !local.has(location.hostname)) {
    document.querySelectorAll('.state.loading').forEach(el => { el.className = 'state error'; el.textContent = 'The staging API address was not configured.'; });
    return;
  }
  const API = unresolved ? 'http://localhost:8800' : raw;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = v => v == null ? '<span class="pill warn">Quote</span>' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
  const get = p => fetch(API + p, { credentials: 'same-origin' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const fail = (el, msg) => { el.className = 'state error'; el.textContent = msg; };

  get('/api/health').then(h => {
    $('health').className = '';
    $('health').innerHTML = `<dl class="kv">
      <dt>Environment</dt><dd><span class="pill ok">${esc(h.environment)}</span></dd>
      <dt>Server</dt><dd>${esc(h.status)} (milestone ${esc(h.milestone)})</dd>
      <dt>Database</dt><dd>${esc(h.database.engine)} · ${esc(h.database.file)} · migration ${esc(h.database.migrations.join(', '))}</dd>
      <dt>Tables</dt><dd>${h.database.tables.map(esc).join(', ')}</dd>
      <dt>Notifications</dt><dd>${esc(h.notifications)} (saved as files on the staging server and never sent)</dd></dl>`;
  }).catch(() => fail($('health'), 'Could not reach the staging server.'));

  get('/api/staging/isolation').then(r => {
    $('iso').innerHTML = r.checks.map(c => `<li><span class="mark ${c.pass ? 'ok' : 'bad'}">${c.pass ? 'PASS' : 'FAIL'}</span><span>${esc(c.check)}</span></li>`).join('')
      + (r.findings.length ? r.findings.map(f => `<li><span class="mark bad">FIND</span><span>${esc(f.file)}: ${esc(f.issue)}</span></li>`).join('') : '');
  }).catch(() => { $('iso').innerHTML = '<li class="state error">Could not run the isolation checks.</li>'; });

  get('/api/pricing/catalog').then(c => {
    const m = c.materials_per_tooth, t = c.material_reference_totals, s = c.stones_per_stone_material_only;
    const matRows = Object.entries(m).map(([k, v]) => `<tr><td>${esc(v.label)}</td><td class="num">${money(v.price)}</td><td class="num">${t[k] ? money(t[k]['6']) : money(null)}</td><td class="num">${t[k] ? money(t[k]['12']) : money(null)}</td></tr>`).join('');
    const stoneNames = {naturalDiamond_commercial:'Natural diamond · Commercial',naturalDiamond_si:'Natural diamond · SI',naturalDiamond_vs:'Natural diamond · VS',naturalDiamond_vvs:'Natural diamond · VVS',labGrownDiamond:'Lab-grown diamond',vvsMoissanite:'VVS moissanite',cz:'CZ',coloredCz:'Colored CZ'};
    const stoneRows = Object.keys(stoneNames).map(k => `<tr><td>${stoneNames[k]}</td>${s.sizes_mm.map(z => `<td class="num">${money(s[k][z])}</td>`).join('')}</tr>`).join('');
    const cuts = c.custom_cuts, sh = c.shipping_and_rush;
    $('pricing').className = '';
    $('pricing').innerHTML = `
      <p class="muted">Pricing version <strong>${esc(c.pricing_version)}</strong></p>
      <h3>Metal, per tooth</h3>
      <div class="table-wrap"><table><thead><tr><th>Material</th><th class="num">1 tooth</th><th class="num">6 teeth</th><th class="num">12 teeth</th></tr></thead><tbody>${matRows}</tbody></table></div>
      <h3>Stones: material cost per stone only</h3>
      <div class="table-wrap"><table><thead><tr><th>Stone</th>${s.sizes_mm.map(z => `<th class="num">${z} mm</th>`).join('')}</tr></thead><tbody>${stoneRows}</tbody></table></div>
      <p class="note">${esc(s.note)} Rubies, sapphires, emeralds, and custom stones are quote-required.</p>
      <h3>Setting labor</h3><p>${esc(c.setting_labor.display_text)}. No labor rates have been entered yet.</p>
      <h3>Custom cuts <span class="pill warn">Will not be charged automatically</span></h3>
      <div class="table-wrap"><table><tbody>
        <tr><td>Diamond cut / dust cut</td><td class="num">+${money(cuts.diamondDust)}</td></tr>
        <tr><td>Center cut / split line</td><td class="num">+${money(cuts.centerSplit)}</td></tr>
        <tr><td>Open face / window cut</td><td class="num">+${money(cuts.openFace)}</td></tr>
        <tr><td>Deep cut / bar cut</td><td class="num">+${money(cuts.deepBar)}</td></tr>
        <tr><td>Custom design request</td><td class="num">${money(null)}</td></tr></tbody></table></div>
      <p class="note">Open question: are these charged per tooth or per piece?</p>
      <h3>Shipping and rush <span class="pill warn">Will not be charged automatically</span></h3>
      <div class="table-wrap"><table><tbody>
        <tr><td>Standard shipping (FedEx)</td><td class="num">${money(sh.standardShipping)}</td></tr>
        <tr><td>Rush service</td><td class="num">${money(sh.rushService)}</td></tr>
        <tr><td>Rush shipping</td><td class="num">${money(sh.rushShipping)}</td></tr>
        <tr><td>Pick up at Envy Kutz</td><td class="num"><span class="pill warn">Owner decision</span></td></tr></tbody></table></div>
      <p class="note">${esc(sh.note)}</p>`;
  }).catch(() => fail($('pricing'), 'Could not load the pricing catalog.'));
})();
