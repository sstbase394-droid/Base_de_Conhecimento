/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp,
  calculateParallaxOffset,
  calculateOccupationalAddition,
  calculateMagneticPull,
  tokenizeSplitText,
  SECTION_GSAP_CHOREOGRAPHIES,
  getHeroPlateDivergenceVector,
  PREVENCE_SST_IMAGE_ASSETS,
  PREVENCE_FAQ_ITEMS,
  filterFaqItems,
  toggleFaqAccordionItem,
  PROJECT_TITLE,
  calculateReadingProgress,
  formatNormativeCitation,
  HERO_ARCHITECTURAL_PLATES,
  NORMATIVE_DOSSIERS,
  getNormativeDossierByCode,
  CINEMA_BREAKPOINTS,
  INSTITUTIONAL_FOOTER_LINKS,
  INSTITUTIONAL_SOCIAL_CHANNELS,
  formatFooterCopyright,
  calculateCardSpotlightCoords,
  getEsocialComplianceDataset,
  calculateEsocialComplianceSummary,
  ESOCIAL_EVENT_BREAKDOWNS,
  clampScrollExpand,
  smoothstepScrollExpand,
  calculateScrollExpandFrameState,
  ARCHITECTURE_SCROLL_EXPAND_PLATES,
  resolveScrollStackOffset,
  calculateScrollStackCardTransform,
  sanitizeTextInput,
  isValidCorporateEmail,
  isValidCnpjFormat,
  validateImageUploadFile,
  evaluateSmartNavbarScroll,
  resolveInstitutionalRoute,
} from './sstCalculations';

test('calculateParallaxOffset computes proportional offsets and respects reducedMotion', () => {
  const active = calculateParallaxOffset(0.5, -0.5, 1.0, false);
  assert.equal(active.x, 14);
  assert.equal(active.y, -11);
  assert.equal(active.rotateX, 3);
  assert.equal(active.rotateY, 4);

  const reduced = calculateParallaxOffset(0.8, 0.8, 1.5, true);
  assert.deepEqual(reduced, { x: 0, y: 0, rotateX: 0, rotateY: 0 });
});

test('calculateMagneticPull computes proportional button attraction offset', () => {
  const pull = calculateMagneticPull(120, 80, 100, 60, 0.25);
  assert.deepEqual(pull, { x: 5, y: 5 });
});

test('calculateOccupationalAddition compares NR-15 insalubrity and NR-16 periculosity accurately', () => {
  const result = calculateOccupationalAddition(4000, 20, 1500);
  assert.equal(result.insalubrityAmount, 300);
  assert.equal(result.periculosityAmount, 1200);
  assert.equal(result.recommendedOption, 'periculosidade');
  assert.equal(result.legalDifference, 900);
});

test('tokenizeSplitText wraps every character with sequential global indices', () => {
  const tokens = tokenizeSplitText('SST &', 'eSocial.');
  assert.equal(tokens.length, 3);
  assert.equal(tokens[0].word, 'SST');
  assert.equal(tokens[0].chars.length, 3);
  assert.equal(tokens[0].chars[0].char, 'S');
  assert.equal(tokens[0].chars[0].globalIndex, 0);
  assert.equal(tokens[0].chars[0].isHighlight, false);

  assert.equal(tokens[2].word, 'eSocial.');
  assert.equal(tokens[2].isHighlight, true);
  assert.equal(tokens[2].chars.length, 8);
  assert.equal(tokens[2].chars[0].globalIndex, 4);
});

test('SECTION_GSAP_CHOREOGRAPHIES assigns a strictly unique animation archetype to all 7 sections', () => {
  const entries = Object.values(SECTION_GSAP_CHOREOGRAPHIES);
  assert.equal(entries.length, 7);
  const archetypes = new Set(entries.map((e) => e.archetype));
  assert.equal(archetypes.size, 7, 'Every section must have a distinct GSAP archetype');
});

test('getHeroPlateDivergenceVector returns 4 distinct quadrant vectors for Barragán Hero plates', () => {
  const v0 = getHeroPlateDivergenceVector(0);
  const v1 = getHeroPlateDivergenceVector(1);
  const v2 = getHeroPlateDivergenceVector(2);
  const v3 = getHeroPlateDivergenceVector(3);

  assert.ok(v0.x > 0 && v0.y < 0);
  assert.ok(v1.x < 0 && v1.y < 0);
  assert.ok(v2.x < 0 && v2.y > 0);
  assert.ok(v3.x > 0 && v3.y > 0);
});

test('PREVENCE_SST_IMAGE_ASSETS registers all 13 local .webp SST images without external URLs', () => {
  assert.equal(PREVENCE_SST_IMAGE_ASSETS.length, 13);
  const uniquePaths = new Set(PREVENCE_SST_IMAGE_ASSETS);
  assert.equal(uniquePaths.size, 13);
  for (const path of PREVENCE_SST_IMAGE_ASSETS) {
    assert.ok(path.startsWith('/images/institutional/'));
    assert.ok(path.endsWith('.webp'));
  }
});

test('filterFaqItems filters SST compliance questions by category and search query accurately', () => {
  assert.equal(PREVENCE_FAQ_ITEMS.length, 6);
  const allItems = filterFaqItems('todos');
  assert.equal(allItems.length, 6);

  const esocialItems = filterFaqItems('esocial');
  assert.equal(esocialItems.length, 2);
  assert.ok(esocialItems.every((item) => item.category === 'esocial'));

  const stfQuery = filterFaqItems('todos', 'Tema 555');
  assert.equal(stfQuery.length, 1);
  assert.equal(stfQuery[0].id, 'faq-tema-555-stf-ruido');

  for (const item of PREVENCE_FAQ_ITEMS) {
    assert.equal(item.question.includes('Prevence'), false);
    assert.equal(item.answer.includes('Prevence'), false);
    assert.equal(item.technicalNote.includes('Prevence'), false);
  }
});

test('toggleFaqAccordionItem handles single and multi-item disclosure transitions deterministically', () => {
  const singleNext = toggleFaqAccordionItem(['faq-pgr-vs-ltcat'], 'faq-prazos-eventos-sst', false);
  assert.deepEqual(singleNext, ['faq-prazos-eventos-sst']);

  const closed = toggleFaqAccordionItem(['faq-prazos-eventos-sst'], 'faq-prazos-eventos-sst', false);
  assert.deepEqual(closed, []);

  const multiNext = toggleFaqAccordionItem(['faq-pgr-vs-ltcat'], 'faq-tema-555-stf-ruido', true);
  assert.deepEqual(multiNext, ['faq-pgr-vs-ltcat', 'faq-tema-555-stf-ruido']);
});

test('PROJECT_TITLE, calculateReadingProgress, formatNormativeCitation, and NORMATIVE_DOSSIERS work deterministically', () => {
  assert.equal(PROJECT_TITLE, 'Base de Conhecimento');
  assert.equal(calculateReadingProgress(0, 1000), 0);
  assert.equal(calculateReadingProgress(500, 1000), 50);
  assert.equal(calculateReadingProgress(1500, 1000), 100);

  const citation = formatNormativeCitation('S-2240', 'Fatores de Risco', 'Tabela 24');
  assert.ok(citation.includes('BASE DE CONHECIMENTO SST & ESOCIAL'));
  assert.ok(citation.includes('[S-2240]'));

  assert.equal(HERO_ARCHITECTURAL_PLATES.length, 3);
  assert.equal(NORMATIVE_DOSSIERS.length, 12);

  const stfDossier = getNormativeDossierByCode('STF 555');
  assert.equal(stfDossier.code, 'STF 555');
  assert.equal(stfDossier.domain, 'Jurisprudência');
  assert.ok(stfDossier.auditChecklist.length >= 3);

  assert.equal(CINEMA_BREAKPOINTS['2xl'], 1536);
  assert.equal(CINEMA_BREAKPOINTS['3xl'], 1920);
  assert.equal(CINEMA_BREAKPOINTS['4xl'], 2560);

  assert.equal(INSTITUTIONAL_FOOTER_LINKS.length, 8);
  assert.equal(INSTITUTIONAL_SOCIAL_CHANNELS.length, 4);
  assert.equal(
    formatFooterCopyright(2026),
    '© 2026 Base de Conhecimento · Idealizado por Guilherme & Victor. Todos os direitos reservados.'
  );

  const spotlight = calculateCardSpotlightCoords(
    150,
    100,
    { left: 100, top: 50, width: 200, height: 100 },
    false
  );
  assert.equal(spotlight.xPct, 25);
  assert.equal(spotlight.yPct, 50);
  assert.equal(spotlight.tiltX, 0);
  assert.equal(spotlight.tiltY, -1.4);
});

test('getEsocialComplianceDataset and calculateEsocialComplianceSummary compute eSocial KPIs accurately', () => {
  const sixMonths = getEsocialComplianceDataset('6m');
  assert.equal(sixMonths.length, 6);
  assert.equal(sixMonths[0].month, 'Mai/26');
  assert.equal(sixMonths[5].month, 'Out/26');

  const ytd = getEsocialComplianceDataset('ytd');
  assert.equal(ytd.length, 10);
  assert.equal(ytd[0].month, 'Jan/26');

  const fullYear = getEsocialComplianceDataset('12m');
  assert.equal(fullYear.length, 12);

  const summaryAll = calculateEsocialComplianceSummary(sixMonths, 'ALL');
  assert.ok(summaryAll.averageCompliancePct >= 99.0);
  assert.equal(summaryAll.complianceDeltaPct, 1.1);
  assert.ok(summaryAll.totalValidatedEvents > 7000);
  assert.ok(summaryAll.totalPreventedRejections > 400);

  const summaryS2240 = calculateEsocialComplianceSummary(sixMonths, 'S-2240');
  assert.equal(
    summaryS2240.totalValidatedEvents,
    695 + 720 + 760 + 790 + 825 + 860
  );
  assert.equal(ESOCIAL_EVENT_BREAKDOWNS.length, 4);
});

test('calculateScrollExpandFrameState interpolates frame geometry and caption readiness across scroll progress', () => {
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clampScrollExpand(15, 0, 10), 10);
  assert.equal(smoothstepScrollExpand(0, 1, 0), 0);
  assert.equal(smoothstepScrollExpand(0, 1, 0.5), 0.5);
  assert.equal(smoothstepScrollExpand(0, 1, 1), 1);

  const restState = calculateScrollExpandFrameState(0, {
    startWidth: 46,
    startHeight: 62,
    startRadius: 24,
    endRadius: 0,
    mediaZoom: 1.35,
  });
  assert.equal(restState.expandT, 0);
  assert.equal(restState.widthPct, 46);
  assert.equal(restState.heightPct, 62);
  assert.equal(restState.radiusPx, 24);
  assert.equal(restState.mediaScale, 1.35);
  assert.equal(restState.titleProgress, 1);
  assert.equal(restState.hintProgress, 1);
  assert.equal(restState.isCaptionReady, false);

  const expandedState = calculateScrollExpandFrameState(1, {
    startWidth: 46,
    startHeight: 62,
    startRadius: 24,
    endRadius: 0,
    mediaZoom: 1.35,
  });
  assert.equal(expandedState.expandT, 1);
  assert.equal(expandedState.widthPct, 100);
  assert.equal(expandedState.heightPct, 100);
  assert.equal(expandedState.radiusPx, 0);
  assert.equal(expandedState.mediaScale, 1);
  assert.equal(expandedState.overlayProgress, 1);
  assert.equal(expandedState.titleProgress, 0);
  assert.equal(expandedState.hintProgress, 0);
  assert.equal(expandedState.isCaptionReady, true);

  assert.equal(ARCHITECTURE_SCROLL_EXPAND_PLATES.length, 3);
  assert.ok(ARCHITECTURE_SCROLL_EXPAND_PLATES[0].footerLegendText.length > 30);
});

test('resolveScrollStackOffset and calculateScrollStackCardTransform compute stack geometry accurately', () => {
  assert.equal(resolveScrollStackOffset(80, 1000), 80);
  assert.equal(resolveScrollStackOffset('15%', 1000), 150);
  assert.equal(resolveScrollStackOffset('0%', 1080), 0);

  const topCard = calculateScrollStackCardTransform(0, 0, {
    itemScale: 0.04,
    baseScale: 0.85,
    dimAmount: 0.25,
  });
  assert.equal(topCard.scale, 1);
  assert.equal(topCard.dim, 0);
  assert.equal(topCard.transformCss, 'translate3d(0, 0, 0)');

  const buriedCard = calculateScrollStackCardTransform(2, 1, {
    itemScale: 0.04,
    baseScale: 0.85,
    dimAmount: 0.2,
  });
  assert.equal(buriedCard.scale, 0.92);
  assert.equal(buriedCard.dim, 0.36);
  assert.ok(buriedCard.transformCss.includes('scale3d(0.9200, 0.9200, 1)'));
});

test('security and input validation helpers sanitize and validate emails, CNPJs, and image uploads', () => {
  assert.equal(sanitizeTextInput('  <script>Eng. Roberto</script>  ', 50), 'Eng. Roberto');
  assert.equal(isValidCorporateEmail('diretoria@empresa.com.br'), true);
  assert.equal(isValidCorporateEmail('invalido@'), false);
  assert.equal(isValidCorporateEmail('@dominio.com'), false);

  assert.equal(isValidCnpjFormat('12.345.678/0001-90'), true);
  assert.equal(isValidCnpjFormat('00.000.000/0000-00'), false);
  assert.equal(isValidCnpjFormat('12345'), false);

  assert.deepEqual(
    validateImageUploadFile({ type: 'image/webp', size: 512_000 }),
    { valid: true }
  );
  assert.equal(
    validateImageUploadFile({ type: 'application/x-msdownload', size: 1024 }).valid,
    false
  );
  assert.equal(
    validateImageUploadFile({ type: 'image/png', size: 10 * 1024 * 1024 }).valid,
    false
  );
});

test('evaluateSmartNavbarScroll handles top state, downward hide, upward reveal, threshold tolerance, and mobile menu lock', () => {
  // 1. At top of page (y = 0 or negative iOS bounce)
  const atTopState = evaluateSmartNavbarScroll({
    currentScrollY: -12,
    prevScrollY: 0,
    prevHidden: false,
    mobileMenuOpen: false,
  });
  assert.equal(atTopState.atTop, true);
  assert.equal(atTopState.isHidden, false);
  assert.equal(atTopState.isElevated, false);
  assert.equal(atTopState.lastScrollY, 0);

  // 2. Scrolling down beyond threshold (e.g. 0 -> 120px) hides the navbar
  const downState = evaluateSmartNavbarScroll({
    currentScrollY: 120,
    prevScrollY: 20,
    prevHidden: false,
    mobileMenuOpen: false,
  });
  assert.equal(downState.atTop, false);
  assert.equal(downState.isHidden, true);
  assert.equal(downState.isElevated, false);
  assert.equal(downState.direction, 'down');

  // 3. Micro-scroll oscillation (< 8px threshold) is ignored
  const microJitter = evaluateSmartNavbarScroll({
    currentScrollY: 115,
    prevScrollY: 120,
    prevHidden: true,
    mobileMenuOpen: false,
  });
  assert.equal(microJitter.isHidden, true);
  assert.equal(microJitter.lastScrollY, 120);
  assert.equal(microJitter.direction, 'idle');

  // 4. Scrolling up beyond threshold (e.g. 120 -> 90px) reveals immediately with elevation
  const upState = evaluateSmartNavbarScroll({
    currentScrollY: 90,
    prevScrollY: 120,
    prevHidden: true,
    mobileMenuOpen: false,
  });
  assert.equal(upState.atTop, false);
  assert.equal(upState.isHidden, false);
  assert.equal(upState.isElevated, true);
  assert.equal(upState.direction, 'up');

  // 5. When mobile menu is open, downward scroll NEVER hides the navbar
  const mobileOpenScrollDown = evaluateSmartNavbarScroll({
    currentScrollY: 360,
    prevScrollY: 100,
    prevHidden: false,
    mobileMenuOpen: true,
  });
  assert.equal(mobileOpenScrollDown.isHidden, false);
  assert.equal(mobileOpenScrollDown.isElevated, true);
});

test('resolveInstitutionalRoute maps valid paths/anchors and routes unmapped URLs to 404 Catch-All', () => {
  const rootRoute = resolveInstitutionalRoute('/', '');
  assert.equal(rootRoute.isNotFound, false);

  const sectionAnchor = resolveInstitutionalRoute('/', '#modulos');
  assert.equal(sectionAnchor.isNotFound, false);

  const unknownPath = resolveInstitutionalRoute('/rota-inexistente-404', '');
  assert.equal(unknownPath.isNotFound, true);
  assert.equal(unknownPath.attemptedTarget, '/rota-inexistente-404');

  const unknownHash = resolveInstitutionalRoute('/', '#pagina-nao-encontrada');
  assert.equal(unknownHash.isNotFound, true);
  assert.equal(unknownHash.attemptedTarget, '#pagina-nao-encontrada');
});

