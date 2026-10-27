/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Unified pure numeric clamp utility [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Alias preserved for <ScrollExpand /> compatibility.
 */
export const clampScrollExpand = clamp;

export interface ParallaxLayerOffset {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
}

/**
 * Computes damped parallax translation (px) and subtle 3D rotation (deg)
 * for a given normalized mouse coordinate [-1, 1] and depth factor.
 */
export function calculateParallaxOffset(
  normX: number,
  normY: number,
  depthFactor: number,
  reducedMotion = false
): ParallaxLayerOffset {
  if (reducedMotion) {
    return { x: 0, y: 0, rotateX: 0, rotateY: 0 };
  }
  const clampedX = clamp(normX, -1, 1);
  const clampedY = clamp(normY, -1, 1);

  return {
    x: Number((clampedX * depthFactor * 28).toFixed(2)),
    y: Number((clampedY * depthFactor * 22).toFixed(2)),
    rotateX: Number((-clampedY * depthFactor * 6).toFixed(2)),
    rotateY: Number((clampedX * depthFactor * 8).toFixed(2)),
  };
}

/**
 * Computes magnetic pull displacement for a button when cursor is inside its attraction radius.
 */
export function calculateMagneticPull(
  cursorX: number,
  cursorY: number,
  centerX: number,
  centerY: number,
  strength = 0.28
): { x: number; y: number } {
  return {
    x: Number(((cursorX - centerX) * strength).toFixed(2)),
    y: Number(((cursorY - centerY) * strength).toFixed(2)),
  };
}

export interface AdditionCalculationResult {
  insalubrityAmount: number;
  periculosityAmount: number;
  recommendedOption: 'insalubridade' | 'periculosidade';
  legalDifference: number;
}

/**
 * Calculates comparative values between Insalubridade (NR-15: 10%, 20%, 40% over minimum wage)
 * and Periculosidade (NR-16: 30% over base salary), per CLT Art. 192 & 193.
 */
export function calculateOccupationalAddition(
  baseSalary: number,
  insalubrityGrade: 10 | 20 | 40,
  minimumWage = 1518
): AdditionCalculationResult {
  const safeBase = Math.max(minimumWage, baseSalary);
  const insalubrityAmount = Number(((minimumWage * insalubrityGrade) / 100).toFixed(2));
  const periculosityAmount = Number((safeBase * 0.3).toFixed(2));
  const recommendedOption =
    periculosityAmount >= insalubrityAmount ? 'periculosidade' : 'insalubridade';
  const legalDifference = Number(Math.abs(periculosityAmount - insalubrityAmount).toFixed(2));

  return {
    insalubrityAmount,
    periculosityAmount,
    recommendedOption,
    legalDifference,
  };
}

export interface SplitCharToken {
  char: string;
  globalIndex: number;
  isHighlight: boolean;
}

export interface SplitWordToken {
  word: string;
  isHighlight: boolean;
  chars: SplitCharToken[];
}

/**
 * Splits a title and optional highlighted suffix into words and individual character tokens
 * with deterministic global indices using immutable high-order array methods.
 */
export function tokenizeSplitText(text: string, highlightText?: string): SplitWordToken[] {
  const normalWords = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, isHighlight: false }));

  const highlightWords = (highlightText ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, isHighlight: true }));

  const allWords = [...normalWords, ...highlightWords];

  const { tokens } = allWords.reduce<{
    cursor: number;
    tokens: SplitWordToken[];
  }>(
    (acc, entry) => {
      const wordChars = Array.from(entry.word);
      const chars: SplitCharToken[] = wordChars.map((char, idx) => ({
        char,
        globalIndex: acc.cursor + idx,
        isHighlight: entry.isHighlight,
      }));
      return {
        cursor: acc.cursor + wordChars.length,
        tokens: [
          ...acc.tokens,
          {
            word: entry.word,
            isHighlight: entry.isHighlight,
            chars,
          },
        ],
      };
    },
    { cursor: 0, tokens: [] }
  );

  return tokens;
}

export type GsapSectionId =
  | 'hero'
  | 'ideia'
  | 'ensaio'
  | 'modulos'
  | 'tecnologia'
  | 'criadores'
  | 'sobre';

export type GsapAnimationArchetype =
  | 'radial-divergent-plates-and-spine-draw'
  | 'alternating-rule-draw-and-curtain-clip-wipe'
  | 'differential-3col-scrub-and-vertical-spine-glide'
  | 'diptych-plate-separation-and-roman-parallax'
  | 'counter-marquee-and-2d-center-grid-wave'
  | 'aperture-clip-expansion-and-index-tick-cascade'
  | 'split-axis-convergence-and-blueprint-line-draw';

export interface SectionGsapChoreography {
  sectionId: GsapSectionId;
  archetype: GsapAnimationArchetype;
  triggerSelector: string;
  scrub: boolean | number;
  description: string;
}

/**
 * Defines a strictly unique GSAP ScrollTrigger animation behavior for each of the 7 sections
 * so no two sections share the same entry or scrub mechanics.
 */
export const SECTION_GSAP_CHOREOGRAPHIES: Record<GsapSectionId, SectionGsapChoreography> = {
  hero: {
    sectionId: 'hero',
    archetype: 'radial-divergent-plates-and-spine-draw',
    triggerSelector: '#hero',
    scrub: 1.1,
    description:
      'Barragán Monograph: 4 plates diverge outward along 4 distinct diagonal vectors while the center spine draws vertically.',
  },
  ideia: {
    sectionId: 'ideia',
    archetype: 'alternating-rule-draw-and-curtain-clip-wipe',
    triggerSelector: '#ideia',
    scrub: false,
    description:
      'Quiet Refinement & SHAYE: Alternating left/right horizontal hairline draws and orthogonal clip-path curtain wipes.',
  },
  ensaio: {
    sectionId: 'ensaio',
    archetype: 'differential-3col-scrub-and-vertical-spine-glide',
    triggerSelector: '#ensaio',
    scrub: 0.9,
    description:
      'Gleam* Essay: Differential 3-column vertical velocity scrub paired with counter-gliding vertical rotated spine.',
  },
  modulos: {
    sectionId: 'modulos',
    archetype: 'diptych-plate-separation-and-roman-parallax',
    triggerSelector: '#modulos',
    scrub: 1.0,
    description:
      'MZIA Gallery: Overlapping dual plates separate diagonally on scroll while Roman numerals float in counter-parallax.',
  },
  tecnologia: {
    sectionId: 'tecnologia',
    archetype: 'counter-marquee-and-2d-center-grid-wave',
    triggerSelector: '#tecnologia',
    scrub: 1.0,
    description:
      'Plura Part Two: Opposing horizontal boundary typography scrub + 2D radial wave stagger across the 12-tile matrix.',
  },
  criadores: {
    sectionId: 'criadores',
    archetype: 'aperture-clip-expansion-and-index-tick-cascade',
    triggerSelector: '#criadores',
    scrub: 1.05,
    description:
      'Etienne Panorama: Panoramic aperture clip-path expansion with diagonal shadow sweep and 4-column signature strip reveal.',
  },
  sobre: {
    sectionId: 'sobre',
    archetype: 'split-axis-convergence-and-blueprint-line-draw',
    triggerSelector: '#sobre',
    scrub: false,
    description:
      'Credentialing: Opposing horizontal column convergence paired with sequential blueprint input hairline drawing.',
  },
};

/**
 * Returns the 2D radial divergence vector (x, y, scale) for each of the 4 Barragán Hero plates
 * so they drift outward along unique quadrants during scroll scrubbing.
 */
export function getHeroPlateDivergenceVector(plateIndex: number): {
  x: number;
  y: number;
  scale: number;
} {
  const vectors = [
    { x: 28, y: -44, scale: 1.04 },
    { x: -32, y: -28, scale: 1.05 },
    { x: -24, y: 34, scale: 1.03 },
    { x: 30, y: 38, scale: 1.04 },
  ] as const;
  const safeIdx = ((plateIndex % vectors.length) + vectors.length) % vectors.length;
  return vectors[safeIdx];
}

export const PREVENCE_SST_IMAGE_ASSETS = [
  '/images/institutional/ambiente-fabril-manutencao.webp',
  '/images/institutional/analise-metricas-indicadores.webp',
  '/images/institutional/canteiro-obras-engenharia.webp',
  '/images/institutional/consultoria-auditoria-sst.webp',
  '/images/institutional/equipamentos-protecao-individual.webp',
  '/images/institutional/gestao-estoque-logistica.webp',
  '/images/institutional/inspecao-seguranca-trabalho.webp',
  '/images/institutional/operacao-industrial-maquinario.webp',
  '/images/institutional/profissional-saude-ocupacional.webp',
  '/images/institutional/reuniao-corporativa-alinhamento.webp',
  '/images/institutional/trabalhador-epi-construcao.webp',
  '/images/institutional/trabalho-em-altura-ferramentas.webp',
  '/images/institutional/treinamento-instrucao-equipe.webp',
] as const;

export type SstFaqCategory =
  | 'todos'
  | 'esocial'
  | 'laudos'
  | 'previdenciario'
  | 'governanca';

export interface SstFaqItem {
  id: string;
  roman: string;
  indexCode: string;
  category: Exclude<SstFaqCategory, 'todos'>;
  categoryLabel: string;
  normativeRef: string;
  question: string;
  editorialPullQuote: string;
  answer: string;
  technicalNote: string;
  actionLabel: string;
  actionHref: string;
}

export const PREVENCE_FAQ_CATEGORIES: ReadonlyArray<{
  id: SstFaqCategory;
  label: string;
}> = [
  { id: 'todos', label: 'Todos os Domínios' },
  { id: 'esocial', label: 'Mensageria eSocial' },
  { id: 'laudos', label: 'GRO & Laudos Técnicos' },
  { id: 'previdenciario', label: 'Previdenciário & STF' },
  { id: 'governanca', label: 'Governança & Acesso' },
] as const;

export const PREVENCE_FAQ_ITEMS: readonly SstFaqItem[] = [
  {
    id: 'faq-pgr-vs-ltcat',
    roman: 'I',
    indexCode: '01',
    category: 'esocial',
    categoryLabel: 'Mensageria eSocial',
    normativeRef: 'Evento S-2240 · NR-01 (GRO) · Lei nº 8.213/91 · Tabela 24',
    question:
      'Qual a diferença prática entre o PGR (NR-01) e o LTCAT na alimentação do evento S-2240 do eSocial?',
    editorialPullQuote:
      'O PGR governa a prevenção contínua no ambiente de trabalho; o LTCAT fundamenta a verdade previdenciária transmitida ao eSocial.',
    answer:
      'Embora ambos analisem o meio ambiente laboral, possuem naturezas jurídicas distintas. O Programa de Gerenciamento de Riscos (PGR), regido pela NR-01, tem caráter trabalhista e preventivo, abrangendo riscos físicos, químicos, biológicos, ergonômicos e de acidentes. Já o LTCAT (Laudo Técnico das Condições Ambientais do Trabalho) é estritamente previdenciário (Lei 8.213/91) e serve como documento-base para declarar no evento S-2240 a exposição a agentes nocivos da Tabela 24 que ensejam ou não a Aposentadoria Especial.',
    technicalNote:
      'Divergências quantitativas de dosimetria ou avaliação química entre o Inventário de Riscos do PGR e o LTCAT geram malha fina imediata no cruzamento com o e-CAC.',
    actionLabel: 'Inspecionar Schema XML S-2240',
    actionHref: '#laboratorio-normativo',
  },
  {
    id: 'faq-prazos-eventos-sst',
    roman: 'II',
    indexCode: '02',
    category: 'esocial',
    categoryLabel: 'Mensageria eSocial',
    normativeRef: 'Eventos S-2210 · S-2220 · S-2221 · S-2240 · Manual S-1.3',
    question:
      'Quais são os prazos improrrogáveis de envio dos eventos S-2210, S-2220 e S-2240 e como evitar multas automáticas?',
    editorialPullQuote:
      'Na arquitetura da mensageria digital, a tempestividade do envio tem o mesmo peso probatório que a precisão do laudo.',
    answer:
      'O evento S-2210 (CAT) deve ser transmitido até o primeiro dia útil seguinte à ocorrência do acidente — ou imediatamente em caso de óbito. Já os eventos S-2220 (Monitoramento da Saúde / ASO), S-2221 (Exame Toxicológico) e S-2240 (Condições Ambientais do Trabalho) devem ser enviados até o dia 15 do mês subsequente à realização do exame, à admissão do colaborador ou à alteração do fator de risco.',
    technicalNote:
      'Na admissão, o prazo do S-2220 e do S-2240 acompanha o dia 15 do mês seguinte ao ingresso, desde que o registro preliminar ou o evento S-2200 esteja devidamente recepcionado.',
    actionLabel: 'Testar Diagnóstico de Protocolos e-CAC',
    actionHref: '#laboratorio-normativo',
  },
  {
    id: 'faq-tema-555-stf-ruido',
    roman: 'III',
    indexCode: '03',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário & STF',
    normativeRef: 'STF ARE 664.335 (Tema 555) · NHO-01 Fundacentro · NR-15 Anexo 1',
    question:
      'O fornecimento de protetor auricular com CA válido descaracteriza a Aposentadoria Especial por ruído (Tema 555 do STF)?',
    editorialPullQuote:
      'Para o agente físico ruído acima de 85 dB(A), a simples declaração de EPI eficaz não afasta o enquadramento especial nem o adicional do RAT.',
    answer:
      'Não. Conforme tese firmada pelo Supremo Tribunal Federal em sede de repercussão geral (Tema 555 / ARE 664.335), quando a exposição ao ruído ultrapassa os limites legais de tolerância (85 dB(A) ponderados em NEN pela NHO-01), a declaração de eficácia do Equipamento de Proteção Individual (EPI) não elide o direito à Aposentadoria Especial em 25 anos, tampouco isenta a empresa do recolhimento da alíquota suplementar do GILRAT/SAT (6%).',
    technicalNote:
      'A neutralização só é reconhecida juridicamente para o ruído mediante medidas de proteção coletiva (EPC) ou enclausuramento acústico na fonte que reduzam o nível ambiental abaixo do limite de ação.',
    actionLabel: 'Consultar Diretriz STF Tema 555',
    actionHref: '#laboratorio-normativo',
  },
  {
    id: 'faq-insalubridade-vs-periculosidade',
    roman: 'IV',
    indexCode: '04',
    category: 'laudos',
    categoryLabel: 'GRO & Laudos Técnicos',
    normativeRef: 'CLT Art. 192 & 193 § 2º · NR-15 · NR-16 · Tema 17 IRR TST',
    question:
      'É permitido acumular os adicionais de Insalubridade (NR-15) e Periculosidade (NR-16) na folha de pagamento?',
    editorialPullQuote:
      'A legislação veda a cumulatividade, cabendo ao diagnóstico técnico demonstrar com transparência a opção mais benéfica ao trabalhador.',
    answer:
      'Não há acumulação. O Art. 193, § 2º da CLT e a jurisprudência vinculante do TST determinam que, na presença simultânea de agentes insalubres (calculados em 10%, 20% ou 40% sobre o salário mínimo) e periculosos (30% sobre o salário-base contratual), o empregado deve optar pelo adicional que lhe for financeiramente mais vantajoso.',
    technicalNote:
      'A Base de Conhecimento inclui simuladores comparativos instantâneos para orientar o RH e a Engenharia antes do fechamento da folha (evento S-1200).',
    actionLabel: 'Simular Comparativo NR-15 vs NR-16',
    actionHref: '#laboratorio-normativo',
  },
  {
    id: 'faq-ppp-eletronico-passivo',
    roman: 'V',
    indexCode: '05',
    category: 'previdenciario',
    categoryLabel: 'Previdenciário & STF',
    normativeRef: 'Portaria MTP nº 313/2021 · IN PRES/INSS nº 128/2022 · PPP Digital',
    question:
      'Como o PPP Eletrônico consolida os dados enviados pela empresa e qual seu impacto sobre o FAP e o passivo trabalhista?',
    editorialPullQuote:
      'Desde janeiro de 2023, cada XML transmitido ao eSocial escreve em tempo real o histórico previdenciário visível ao segurado no Meu INSS.',
    answer:
      'A partir de 01/01/2023, o Perfil Profissiográfico Previdenciário passou a ser emitido exclusivamente em meio eletrônico para os períodos posteriores a essa data, alimentado diretamente pelos eventos S-2240 e S-2210. Qualquer inconsistência no código da Tabela 24, na intensidade/concentração do agente ou no registro de CA de EPI fica imediatamente exposta no aplicativo Meu INSS do trabalhador, impactando o Fator Acidentário de Prevenção (FAP) e eventuais reclamatórias.',
    technicalNote:
      'Nossa matriz de governança audita preventivamente os campos de EPC/EPI (hierarquia administrativa e coletiva) antes da assinatura digital ICP-Brasil.',
    actionLabel: 'Explorar Matriz de 12 Domínios',
    actionHref: '#tecnologia',
  },
  {
    id: 'faq-governanca-credenciamento-prevence',
    roman: 'VI',
    indexCode: '06',
    category: 'governanca',
    categoryLabel: 'Governança & Acesso',
    normativeRef: 'ICP-Brasil A1/A3 · Curadoria 24h · Acesso Credenciado',
    question:
      'Como funciona a curadoria técnica, o sigilo documental e o credenciamento institucional na Base de Conhecimento?',
    editorialPullQuote:
      'Uma Base de Conhecimento viva, revisada por pares em até 24 horas e desenhada sob o princípio do silêncio visual.',
    answer:
      'Idealizada por Guilherme e Victor, a Base de Conhecimento opera como um acervo privado de inteligência normativa. Organizações e profissionais credenciados têm acesso a árvores decisórias, modelos de pareceres, scripts de diagnóstico de mensageria e-CAC (erros SOAP/TLS e lotes XML) e atualizações contínuas de NRs e portarias do MTE, com ciclo de revisão técnica em até 24 horas.',
    technicalNote:
      'Todos os cadernos operacionais internos são protegidos por autenticação corporativa verificada para preservar a propriedade intelectual e a segurança jurídica das equipes.',
    actionLabel: 'Solicitar Credenciamento Institucional',
    actionHref: '#sobre',
  },
] as const;

/**
 * Pure helper to filter FAQ items by category and optional text query.
 */
export function filterFaqItems(
  category: SstFaqCategory,
  searchQuery = ''
): SstFaqItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return PREVENCE_FAQ_ITEMS.filter((item) => {
    const matchesCategory = category === 'todos' || item.category === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery) ||
      item.normativeRef.toLowerCase().includes(normalizedQuery) ||
      item.categoryLabel.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Pure state transition helper for accordion disclosure items.
 */
export function toggleFaqAccordionItem(
  openIds: readonly string[],
  targetId: string,
  allowMultiple = false
): string[] {
  if (openIds.includes(targetId)) {
    return openIds.filter((id) => id !== targetId);
  }
  return allowMultiple ? [...openIds, targetId] : [targetId];
}

export const PROJECT_TITLE = 'Base de Conhecimento';

/**
 * Computes clamped [0, 100] reading progress percentage from scroll position.
 */
export function calculateReadingProgress(scrollTop: number, maxScroll: number): number {
  if (maxScroll <= 0 || scrollTop <= 0) return 0;
  const pct = (scrollTop / maxScroll) * 100;
  return Number(clamp(pct, 0, 100).toFixed(1));
}

/**
 * Formats an institutional normative citation string for one-click archival copy.
 */
export function formatNormativeCitation(
  code: string,
  title: string,
  normativeRef: string
): string {
  return `BASE DE CONHECIMENTO SST & ESOCIAL — [${code.trim()}] ${title.trim()}. Fundamento Legal: ${normativeRef.trim()}. Curadoria Técnica: Guilherme & Victor (2026).`;
}

export interface HeroArchitecturalPlate {
  id: string;
  index: string;
  accessionCode: string;
  label: string;
  caption: string;
  normativeAnchor: string;
  imageSrc: string;
}

export const HERO_ARCHITECTURAL_PLATES: readonly HeroArchitecturalPlate[] = [
  {
    id: 'plate-fabril',
    index: '01',
    accessionCode: 'ACC. 2026.01 · NHO-01 / NR-12',
    label: 'Manutenção & Operação Fabril',
    caption: 'Controle de fontes de ruído contínuo, bloqueio LOTO e rastreabilidade ambiental para o evento S-2240.',
    normativeAnchor: 'S-2240 · Tabela 24',
    imageSrc: '/images/institutional/ambiente-fabril-manutencao.webp',
  },
  {
    id: 'plate-engenharia',
    index: '02',
    accessionCode: 'ACC. 2026.02 · NR-18 / NR-35',
    label: 'Canteiro de Engenharia & Altura',
    caption: 'Projetos de proteção coletiva (EPC), linhas de vida certificadas e inventário dinâmico do PGR.',
    normativeAnchor: 'NR-01 · GRO & PGR',
    imageSrc: '/images/institutional/canteiro-obras-engenharia.webp',
  },
  {
    id: 'plate-auditoria',
    index: '03',
    accessionCode: 'ACC. 2026.03 · LEI 8.213/91',
    label: 'Auditoria & Diagnóstico em Campo',
    caption: 'Coerência estrita entre o levantamento quantitativo em campo, o LTCAT e a transmissão e-CAC.',
    normativeAnchor: 'PPP Eletrônico · IN 128',
    imageSrc: '/images/institutional/consultoria-auditoria-sst.webp',
  },
] as const;

export interface NormativeDossier {
  code: string;
  accessionNumber: string;
  domain: string;
  title: string;
  normativeRef: string;
  readingTime: string;
  imageSrc: string;
  pullQuote: string;
  synthesis: string;
  auditChecklist: readonly string[];
}

export const NORMATIVE_DOSSIERS: readonly NormativeDossier[] = [
  {
    code: 'S-2210',
    accessionNumber: 'DOC. 01 · ESOCIAL S-1.3',
    domain: 'eSocial',
    title: 'Comunicação de Acidente de Trabalho (CAT Eletrônica)',
    normativeRef: 'Art. 22 da Lei nº 8.213/91 · Leiaute S-1.3 · Tabelas 13 a 17',
    readingTime: '4 min de leitura',
    imageSrc: '/images/institutional/trabalhador-epi-construcao.webp',
    pullQuote:
      'A tempestividade na emissão da CAT protege o segurado e preserva a fidedignidade estatística do FAP empresarial.',
    synthesis:
      'O evento S-2210 substitui integralmente o antigo formulário físico da CAT para fins de comunicação ao INSS. Deve ser enviado pelo empregador até o primeiro dia útil seguinte ao da ocorrência e, em caso de morte, de imediato. Exige cruzamento rigoroso entre o código CID-10 informado pelo médico assistente, a parte do corpo atingida (Tabela 13) e o agente causador (Tabela 14).',
    auditChecklist: [
      'Validação prévia do vínculo ativo (S-2200) ou preliminar (S-2190) na base nacional.',
      'Conferência de compatibilidade entre natureza da lesão (Tabela 17) e código CID-10.',
      'Protocolo de envio imediato em ocorrências graves com guarda do recibo XML assinado.',
    ],
  },
  {
    code: 'S-2220',
    accessionNumber: 'DOC. 02 · MEDICINA OCUPACIONAL',
    domain: 'Saúde',
    title: 'Monitoramento da Saúde do Trabalhador (ASO & Exames)',
    normativeRef: 'NR-07 (PCMSO) · Tabela 27 do eSocial · Portaria MTP nº 671',
    readingTime: '5 min de leitura',
    imageSrc: '/images/institutional/profissional-saude-ocupacional.webp',
    pullQuote:
      'O ASO digitalizado no evento S-2220 espelha a vigilância epidemiológica prevista no PCMSO sem violar o sigilo médico.',
    synthesis:
      'Registra as avaliações clínicas ocupacionais (admissional, periódico, retorno ao trabalho, mudança de riscos e demissional) e todos os exames complementares vinculados à Tabela 27. Não expõe diagnósticos clínicos sigilosos, mas exige a indicação precisa de aptidão e a identificação do médico coordenador ou examinador (CRM/UF).',
    auditChecklist: [
      'Sincronismo entre os riscos declarados no S-2240 e a grade de exames da Tabela 27.',
      'Transmissão até o dia 15 do mês subsequente ao da realização do ASO.',
      'Auditoria de validade dos exames audiométricos, espirométricos e laboratoriais.',
    ],
  },
  {
    code: 'S-2221',
    accessionNumber: 'DOC. 03 · TRANSPORTE RODOVIÁRIO',
    domain: 'Rodoviário',
    title: 'Exame Toxicológico do Motorista Profissional',
    normativeRef: 'CLT Art. 168 §§ 6º e 7º · Portaria MTE nº 612/2024',
    readingTime: '3 min de leitura',
    imageSrc: '/images/institutional/gestao-estoque-logistica.webp',
    pullQuote:
      'A rastreabilidade laboratorial de 90 dias fortalece a segurança viária e a conformidade trabalhista nas frotas.',
    synthesis:
      'Obrigatório para empregados motoristas profissionais do transporte rodoviário coletivo de passageiros e de cargas (categorias C, D e E). O evento S-2221 exige o CNPJ do laboratório credenciado pelo SENATRAN, o código sequencial do exame (formato alfanumérico padrão) e a identificação do médico revisor.',
    auditChecklist: [
      'Verificação da janela de detecção mínima de 90 dias em amostra queratínica.',
      'Envio até o dia 15 do mês subsequente à realização do exame pré-admissional ou periódico.',
      'Monitoramento do ciclo periódico a cada 2 anos e 6 meses.',
    ],
  },
  {
    code: 'S-2240',
    accessionNumber: 'DOC. 04 · HIGIENE OCUPACIONAL',
    domain: 'Agentes',
    title: 'Condições Ambientais do Trabalho — Fatores de Risco',
    normativeRef: 'Tabela 24 do eSocial · Lei nº 8.213/91 Art. 58 · IN INSS nº 128/2022',
    readingTime: '6 min de leitura',
    imageSrc: '/images/institutional/analise-metricas-indicadores.webp',
    pullQuote:
      'O evento S-2240 é a espinha dorsal do PPP Eletrônico: cada código da Tabela 24 define o futuro previdenciário do trabalhador.',
    synthesis:
      'Retrata a exposição do trabalhador aos agentes nocivos físicos, químicos e biológicos previstos na Tabela 24 do eSocial, bem como a presença de EPC e EPI com respectivos Certificados de Aprovação (CA). Exige discriminação entre avaliação qualitativa e quantitativa, intensidade/concentração medida e técnica de medição (ex.: NHO-01 para ruído).',
    auditChecklist: [
      'Coerência absoluta entre o LTCAT vigente, a GFIP/FAP e o código da Tabela 24.',
      'Preenchimento dos requisitos de eficácia do EPI (hierarquia de medidas coletivas, validade do CA e higienização).',
      'Registro de nova condição ambiental sempre que houver alteração de layout ou GHE.',
    ],
  },
  {
    code: 'NR-01',
    accessionNumber: 'DOC. 05 · DISPOSIÇÕES GERAIS',
    domain: 'Prevenção',
    title: 'Gerenciamento de Riscos Ocupacionais (GRO) & PGR',
    normativeRef: 'Portaria SEPRT nº 6.730/2020 · NR-01.5',
    readingTime: '5 min de leitura',
    imageSrc: '/images/institutional/reuniao-corporativa-alinhamento.webp',
    pullQuote:
      'O PGR substitui documentos estáticos por um ciclo vivo de identificação de perigos e controle de riscos.',
    synthesis:
      'O Gerenciamento de Riscos Ocupacionais (GRO) materializa-se no Programa de Gerenciamento de Riscos (PGR), composto no mínimo pelo Inventário de Riscos e pelo Plano de Ação. Diferente do antigo PPRA, o PGR abrange todas as cinco famílias de riscos ocupacionais: físicos, químicos, biológicos, ergonômicos (NR-17) e mecânicos/acidentes.',
    auditChecklist: [
      'Matriz de severidade × probabilidade documentada por Grupo Homogêneo de Exposição (GHE).',
      'Plano de ação com cronograma, responsáveis e aferição de eficácia das medidas.',
      'Integração formal com o PCMSO (NR-07) e Análise Ergonômica do Trabalho (NR-17).',
    ],
  },
  {
    code: 'NR-07',
    accessionNumber: 'DOC. 06 · SAÚDE OCUPACIONAL',
    domain: 'Medicina',
    title: 'Programa de Controle Médico de Saúde Ocupacional (PCMSO)',
    normativeRef: 'Portaria SEPRT nº 6.734/2020 · NR-07',
    readingTime: '4 min de leitura',
    imageSrc: '/images/institutional/profissional-saude-ocupacional.webp',
    pullQuote:
      'O PCMSO atua como sentinela clínica: detecta precocemente qualquer agravo relacionado ao trabalho.',
    synthesis:
      'Diretriz médica estruturada a partir dos riscos mapeados no PGR. O PCMSO planeja os exames clínicos e complementares obrigatórios por função e GHE, além de exigir a elaboração do Relatório Analítico Anual com indicadores epidemiológicos de exames alterados e afastamentos.',
    auditChecklist: [
      'Alinhamento estrito com o Inventário de Riscos do PGR da unidade operacional.',
      'Emissão do Relatório Analítico Anual assinado pelo médico responsável.',
      'Guarda segura de prontuários médicos por no mínimo 20 anos após o desligamento.',
    ],
  },
  {
    code: 'NR-15',
    accessionNumber: 'DOC. 07 · LIMITES DE TOLERÂNCIA',
    domain: 'Tolerância',
    title: 'Atividades e Operações Insalubres (Anexos 1 a 14)',
    normativeRef: 'CLT Art. 189 a 192 · NR-15 Portaria MTb nº 3.214/1978',
    readingTime: '5 min de leitura',
    imageSrc: '/images/institutional/equipamentos-protecao-individual.webp',
    pullQuote:
      'A caracterização da insalubridade exige perícia quantitativa ou qualitativa estritamente vinculada aos anexos da NR-15.',
    synthesis:
      'Estabelece os limites de tolerância para ruído contínuo/intermitente, ruído de impacto, calor (IBUTG), radiações ionizantes, agentes químicos e biológicos. Quando superados os limites sem neutralização eficaz por EPC/EPI, assegura ao trabalhador adicional de 10% (grau mínimo), 20% (grau médio) ou 40% (grau máximo) sobre o salário mínimo.',
    auditChecklist: [
      'Calibração rastreável RBC dos dosímetros de ruído, bombas gravimétricas e medidores térmicos.',
      'Comprovação documental de entrega, treinamento e troca periódica de EPIs.',
      'Distinção técnica entre limite de tolerância trabalhista (NR-15) e previdenciário (Decreto 3.048/99).',
    ],
  },
  {
    code: 'NR-16',
    accessionNumber: 'DOC. 08 · RISCO ACENTUADO',
    domain: 'Risco Acentuado',
    title: 'Atividades e Operações Perigosas (Adicional de 30%)',
    normativeRef: 'CLT Art. 193 · NR-16 Anexos 1 a 5',
    readingTime: '4 min de leitura',
    imageSrc: '/images/institutional/trabalho-em-altura-ferramentas.webp',
    pullQuote:
      'Na periculosidade, o foco recai sobre a exposição ao risco acentuado de inflamáveis, explosivos, energia elétrica ou segurança.',
    synthesis:
      'Regulamenta o enquadramento de periculosidade para operações com explosivos, inflamáveis líquidos ou gasosos liquefeitos, radiações ionizantes, segurança pessoal/patrimonial e sistema elétrico de potência (SEP). Garante adicional de 30% incidente sobre o salário-base contratual, vedada a acumulação com insalubridade.',
    auditChecklist: [
      'Delimitação física de áreas de risco conforme memoriais descritivos da NR-16 e NR-20.',
      'Avaliação do tempo de exposição (permanente, intermitente ou eventual conforme Súmula 364 do TST).',
      'Simulação comparativa financeira entre NR-15 e NR-16 para opção do colaborador.',
    ],
  },
  {
    code: 'LTCAT',
    accessionNumber: 'DOC. 09 · LAUDO PREVIDENCIÁRIO',
    domain: 'Previdência',
    title: 'Laudo Técnico das Condições Ambientais do Trabalho',
    normativeRef: 'Lei nº 8.213/91 Art. 58 § 1º · Decreto nº 3.048/99 Anexo IV',
    readingTime: '6 min de leitura',
    imageSrc: '/images/institutional/inspecao-seguranca-trabalho.webp',
    pullQuote:
      'O LTCAT é o documento soberano para comprovar a efetiva exposição a agentes nocivos ensejadores de Aposentadoria Especial.',
    synthesis:
      'Expedição privativa de Engenheiro de Segurança do Trabalho ou Médico do Trabalho, com registro de ART (CREA) ou RQE (CRM). Fundamenta o preenchimento do PPP Eletrônico e do evento S-2240, analisando a nocividade e a permanência da exposição segundo o Anexo IV do Regulamento da Previdência Social.',
    auditChecklist: [
      'Assinatura por Engenheiro de Segurança (com ART) ou Médico do Trabalho habilitado.',
      'Adoção das metodologias da Fundacentro (NHO-01 para ruído em NEN com q=3).',
      'Histórico cronológico de alterações de layout fabril e medidas de controle coletivo.',
    ],
  },
  {
    code: 'PPP',
    accessionNumber: 'DOC. 10 · HISTÓRICO LABORAL',
    domain: 'Histórico',
    title: 'Perfil Profissiográfico Previdenciário Eletrônico',
    normativeRef: 'Portaria MTP nº 313/2021 · IN PRES/INSS nº 128/2022',
    readingTime: '5 min de leitura',
    imageSrc: '/images/institutional/consultoria-auditoria-sst.webp',
    pullQuote:
      'O PPP Eletrônico consolida a biografia laboral e ambiental do segurado diretamente na plataforma Meu INSS.',
    synthesis:
      'Documento histórico-laboral individual do trabalhador que reúne dados administrativos, registros ambientais (extraídos do LTCAT via S-2240) e resultados de monitoração biológica. Desde janeiro de 2023, sua emissão ocorre em formato exclusivamente eletrônico para fatos geradores contemporâneos.',
    auditChecklist: [
      'Auditoria de consistência entre o profissiograma da função e o código CBO.',
      'Rastreabilidade do responsável técnico pelos registros ambientais de cada período.',
      'Validação prévia antes do envio para evitar retificações em massa no eSocial.',
    ],
  },
  {
    code: 'e-CAC',
    accessionNumber: 'DOC. 11 · INFRAESTRUTURA XML',
    domain: 'Webservice',
    title: 'Mensageria TLS/SOAP, Schemas XSD & Certificação ICP-Brasil',
    normativeRef: 'Manual de Orientação do Desenvolvedor eSocial v1.12 · ICP-Brasil',
    readingTime: '5 min de leitura',
    imageSrc: '/images/institutional/treinamento-instrucao-equipe.webp',
    pullQuote:
      'A integridade criptográfica do XML garante que o laudo de engenharia chegue ao ambiente nacional sem distorções.',
    synthesis:
      'A transmissão dos lotes de eventos SST ao ambiente nacional do eSocial requer comunicação mTLS com certificados digitais ICP-Brasil (A1 ou A3), assinatura XMLDSig (SHA-256) e validação prévia contra os schemas XSD vigentes (S-1.3), tratando códigos de retorno como 200 (Sucesso), 401 (Falha de Regra) e 162 (Duplicidade).',
    auditChecklist: [
      'Monitoramento proativo de vencimento do Certificado Digital A1 e cadeia ICP-Brasil v5.',
      'Validação sintática XSD local antes do disparo para o webservice de recepção.',
      'Guarda indexada do número de recibo (nrRecibo) para eventuais retificações (indRetif=2).',
    ],
  },
  {
    code: 'STF 555',
    accessionNumber: 'DOC. 12 · JURISPRUDÊNCIA SUPREMA',
    domain: 'Jurisprudência',
    title: 'Tema 555 do STF (ARE 664.335): Ruído e Eficácia do EPI',
    normativeRef: 'STF Repercussão Geral Tema 555 · Súmula 9 da TNU',
    readingTime: '6 min de leitura',
    imageSrc: '/images/institutional/operacao-industrial-maquinario.webp',
    pullQuote:
      'Na exposição ao ruído acima de 85 dB(A), a proteção individual auricular não afasta a contagem de tempo especial.',
    synthesis:
      'A Suprema Corte fixou duas teses fundamentais no ARE 664.335: (I) o fornecimento de EPI eficaz descaracteriza o tempo especial para a maioria dos agentes, mas (II) na hipótese de exposição ao agente nocivo ruído acima dos limites legais de tolerância, a declaração do empregador no PPP sobre a eficácia do EPI não descaracteriza o tempo de serviço especial para aposentadoria.',
    auditChecklist: [
      'Priorização de enclausuramento acústico e barreiras físicas (EPC) na fonte geradora.',
      'Atenção ao reflexo tributário do adicional de SAT/GILRAT (6%) sobre funções expostas a ruído > 85 dB(A).',
      'Documentação rigorosa de NEN (NHO-01) separada de medições pontuais.',
    ],
  },
] as const;

/**
 * Pure lookup helper to retrieve a Normative Dossier by its matrix code (defaults to first dossier).
 */
export function getNormativeDossierByCode(code: string): NormativeDossier {
  const normalized = code.trim().toUpperCase();
  const found = NORMATIVE_DOSSIERS.find((d) => d.code.toUpperCase() === normalized);
  return found ?? NORMATIVE_DOSSIERS[0];
}

export const CINEMA_BREAKPOINTS = {
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
  maxCeiling: 2400,
} as const;

export interface FooterInstitutionalLink {
  id: string;
  label: string;
  href: string;
  indexCode: string;
}

export interface FooterSocialChannel {
  id: 'linkedin' | 'github' | 'instagram' | 'youtube';
  label: string;
  handle: string;
  href: string;
}

export const INSTITUTIONAL_FOOTER_LINKS: readonly FooterInstitutionalLink[] = [
  { id: 'hero', label: 'Visão Geral', href: '#hero', indexCode: '01' },
  { id: 'ideia', label: 'A Ideia & Manifesto', href: '#ideia', indexCode: '02' },
  { id: 'ensaio', label: 'Cadernos Editoriais', href: '#ensaio', indexCode: '03' },
  { id: 'modulos', label: 'Os 4 Pilares do Acervo', href: '#modulos', indexCode: '04' },
  { id: 'tecnologia', label: 'Engenharia & Pesquisa', href: '#tecnologia', indexCode: '05' },
  { id: 'criadores', label: 'Os Criadores', href: '#criadores', indexCode: '06' },
  { id: 'faq', label: 'Perguntas Frequentes', href: '#faq', indexCode: '07' },
  { id: 'sobre', label: 'Credenciamento Técnico', href: '#sobre', indexCode: '08' },
] as const;

export const INSTITUTIONAL_SOCIAL_CHANNELS: readonly FooterSocialChannel[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: '/in/base-de-conhecimento-sst',
    href: '#sobre',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: 'github.com/base-sst-esocial',
    href: '#tecnologia',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@basedeconhecimento.sst',
    href: '#ensaio',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: 'Canal Técnico SST & eSocial',
    href: '#modulos',
  },
] as const;

/**
 * Formats the institutional copyright notice deterministically.
 */
export function formatFooterCopyright(year: number = new Date().getFullYear()): string {
  const safeYear = Number.isFinite(year) && year >= 2024 ? Math.floor(year) : 2026;
  return `© ${safeYear} ${PROJECT_TITLE} · Idealizado por Guilherme & Victor. Todos os direitos reservados.`;
}

export interface CardSpotlightCoords {
  xPct: number;
  yPct: number;
  tiltX: number;
  tiltY: number;
}

/**
 * Computes normalized percentage coordinates [0, 100] and subtle 3D tilt angles
 * for cursor-reactive frosted glass cards.
 */
export function calculateCardSpotlightCoords(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  reducedMotion = false
): CardSpotlightCoords {
  const safeWidth = Math.max(1, rect.width);
  const safeHeight = Math.max(1, rect.height);
  const rawXPct = ((clientX - rect.left) / safeWidth) * 100;
  const rawYPct = ((clientY - rect.top) / safeHeight) * 100;
  const xPct = Number(clamp(rawXPct, 0, 100).toFixed(1));
  const yPct = Number(clamp(rawYPct, 0, 100).toFixed(1));

  if (reducedMotion) {
    return { xPct, yPct, tiltX: 0, tiltY: 0 };
  }

  const normX = (xPct - 50) / 50;
  const normY = (yPct - 50) / 50;

  return {
    xPct,
    yPct,
    tiltX: Number((-normY * 2.4).toFixed(2)),
    tiltY: Number((normX * 2.8).toFixed(2)),
  };
}

export type EsocialCompliancePeriod = '6m' | '12m' | 'ytd';
export type EsocialEventFilter = 'ALL' | 'S-2210' | 'S-2220' | 'S-2221' | 'S-2240';

export interface EsocialMonthlyMetric {
  month: string;
  s2210Cat: number;
  s2220Aso: number;
  s2221Tox: number;
  s2240Risco: number;
  conformidadePct: number;
  rejeicoesPrevenidas: number;
  slaTempestividadePct: number;
}

export interface EsocialEventBreakdown {
  code: Exclude<EsocialEventFilter, 'ALL'>;
  name: string;
  normativeRef: string;
  slaDeadline: string;
  compliancePct: number;
  volume: number;
  preventedDivergences: number;
  color: string;
}

export const ESOCIAL_MONTHLY_METRICS_12M: readonly EsocialMonthlyMetric[] = [
  {
    month: 'Nov/25',
    s2210Cat: 18,
    s2220Aso: 410,
    s2221Tox: 64,
    s2240Risco: 520,
    conformidadePct: 95.8,
    rejeicoesPrevenidas: 42,
    slaTempestividadePct: 94.2,
  },
  {
    month: 'Dez/25',
    s2210Cat: 15,
    s2220Aso: 385,
    s2221Tox: 58,
    s2240Risco: 495,
    conformidadePct: 96.3,
    rejeicoesPrevenidas: 39,
    slaTempestividadePct: 95.0,
  },
  {
    month: 'Jan/26',
    s2210Cat: 14,
    s2220Aso: 460,
    s2221Tox: 72,
    s2240Risco: 590,
    conformidadePct: 96.9,
    rejeicoesPrevenidas: 47,
    slaTempestividadePct: 95.8,
  },
  {
    month: 'Fev/26',
    s2210Cat: 12,
    s2220Aso: 445,
    s2221Tox: 69,
    s2240Risco: 575,
    conformidadePct: 97.4,
    rejeicoesPrevenidas: 51,
    slaTempestividadePct: 96.4,
  },
  {
    month: 'Mar/26',
    s2210Cat: 11,
    s2220Aso: 490,
    s2221Tox: 76,
    s2240Risco: 630,
    conformidadePct: 97.8,
    rejeicoesPrevenidas: 56,
    slaTempestividadePct: 97.1,
  },
  {
    month: 'Abr/26',
    s2210Cat: 10,
    s2220Aso: 515,
    s2221Tox: 81,
    s2240Risco: 660,
    conformidadePct: 98.2,
    rejeicoesPrevenidas: 62,
    slaTempestividadePct: 97.6,
  },
  {
    month: 'Mai/26',
    s2210Cat: 9,
    s2220Aso: 530,
    s2221Tox: 84,
    s2240Risco: 695,
    conformidadePct: 98.6,
    rejeicoesPrevenidas: 68,
    slaTempestividadePct: 98.1,
  },
  {
    month: 'Jun/26',
    s2210Cat: 8,
    s2220Aso: 555,
    s2221Tox: 88,
    s2240Risco: 720,
    conformidadePct: 98.9,
    rejeicoesPrevenidas: 73,
    slaTempestividadePct: 98.5,
  },
  {
    month: 'Jul/26',
    s2210Cat: 7,
    s2220Aso: 580,
    s2221Tox: 92,
    s2240Risco: 760,
    conformidadePct: 99.1,
    rejeicoesPrevenidas: 79,
    slaTempestividadePct: 98.9,
  },
  {
    month: 'Ago/26',
    s2210Cat: 7,
    s2220Aso: 605,
    s2221Tox: 95,
    s2240Risco: 790,
    conformidadePct: 99.3,
    rejeicoesPrevenidas: 84,
    slaTempestividadePct: 99.2,
  },
  {
    month: 'Set/26',
    s2210Cat: 6,
    s2220Aso: 625,
    s2221Tox: 99,
    s2240Risco: 825,
    conformidadePct: 99.5,
    rejeicoesPrevenidas: 91,
    slaTempestividadePct: 99.4,
  },
  {
    month: 'Out/26',
    s2210Cat: 5,
    s2220Aso: 650,
    s2221Tox: 104,
    s2240Risco: 860,
    conformidadePct: 99.7,
    rejeicoesPrevenidas: 96,
    slaTempestividadePct: 99.6,
  },
] as const;

export const ESOCIAL_EVENT_BREAKDOWNS: readonly EsocialEventBreakdown[] = [
  {
    code: 'S-2240',
    name: 'Condições Ambientais (Agentes Nocivos)',
    normativeRef: 'Tabela 24 · LTCAT & PGR · PPP Digital',
    slaDeadline: 'Até dia 15 do mês subsequente',
    compliancePct: 99.6,
    volume: 8120,
    preventedDivergences: 418,
    color: '#68B2A0',
  },
  {
    code: 'S-2220',
    name: 'Monitoramento da Saúde (ASO)',
    normativeRef: 'NR-07 (PCMSO) · Tabela 27',
    slaDeadline: 'Até dia 15 do mês subsequente',
    compliancePct: 99.4,
    volume: 6250,
    preventedDivergences: 274,
    color: '#5B8FB9',
  },
  {
    code: 'S-2221',
    name: 'Exame Toxicológico Rodoviário',
    normativeRef: 'CLT Art. 168 · Portaria MTE 612/2024',
    slaDeadline: 'Até dia 15 do mês subsequente',
    compliancePct: 99.2,
    volume: 982,
    preventedDivergences: 64,
    color: '#7AA6C7',
  },
  {
    code: 'S-2210',
    name: 'Comunicação de Acidente (CAT)',
    normativeRef: 'Lei 8.213/91 Art. 22 · Tabelas 13-17',
    slaDeadline: '1º dia útil (imediato em óbito)',
    compliancePct: 99.8,
    volume: 122,
    preventedDivergences: 32,
    color: '#94A3B8',
  },
] as const;

/**
 * Slices the eSocial compliance monthly dataset according to the chosen horizon.
 */
export function getEsocialComplianceDataset(
  period: EsocialCompliancePeriod
): EsocialMonthlyMetric[] {
  if (period === '6m') {
    return ESOCIAL_MONTHLY_METRICS_12M.slice(-6);
  }
  if (period === 'ytd') {
    return ESOCIAL_MONTHLY_METRICS_12M.slice(2);
  }
  return [...ESOCIAL_MONTHLY_METRICS_12M];
}

export interface EsocialComplianceSummary {
  averageCompliancePct: number;
  averageSlaPct: number;
  totalValidatedEvents: number;
  totalPreventedRejections: number;
  complianceDeltaPct: number;
  activeSeriesLabel: string;
}

const getRowEventsByFilter = (
  row: EsocialMonthlyMetric,
  eventFilter: EsocialEventFilter
): number => {
  switch (eventFilter) {
    case 'S-2210':
      return row.s2210Cat;
    case 'S-2220':
      return row.s2220Aso;
    case 'S-2221':
      return row.s2221Tox;
    case 'S-2240':
      return row.s2240Risco;
    default:
      return row.s2210Cat + row.s2220Aso + row.s2221Tox + row.s2240Risco;
  }
};

/**
 * Computes aggregate KPIs for the eSocial compliance visualization dashboard using immutable reduce.
 */
export function calculateEsocialComplianceSummary(
  dataset: readonly EsocialMonthlyMetric[],
  eventFilter: EsocialEventFilter = 'ALL'
): EsocialComplianceSummary {
  if (dataset.length === 0) {
    return {
      averageCompliancePct: 0,
      averageSlaPct: 0,
      totalValidatedEvents: 0,
      totalPreventedRejections: 0,
      complianceDeltaPct: 0,
      activeSeriesLabel: 'Todos os Eventos SST',
    };
  }

  const totals = dataset.reduce(
    (acc, row) => ({
      sumCompliance: acc.sumCompliance + row.conformidadePct,
      sumSla: acc.sumSla + row.slaTempestividadePct,
      totalPreventedRejections: acc.totalPreventedRejections + row.rejeicoesPrevenidas,
      totalValidatedEvents:
        acc.totalValidatedEvents + getRowEventsByFilter(row, eventFilter),
    }),
    {
      sumCompliance: 0,
      sumSla: 0,
      totalPreventedRejections: 0,
      totalValidatedEvents: 0,
    }
  );

  const averageCompliancePct = Number((totals.sumCompliance / dataset.length).toFixed(1));
  const averageSlaPct = Number((totals.sumSla / dataset.length).toFixed(1));
  const firstCompliance = dataset[0].conformidadePct;
  const lastCompliance = dataset[dataset.length - 1].conformidadePct;
  const complianceDeltaPct = Number((lastCompliance - firstCompliance).toFixed(1));

  const labelMap: Record<EsocialEventFilter, string> = {
    ALL: 'Todos os Eventos SST (S-2210 a S-2240)',
    'S-2210': 'Evento S-2210 · Comunicação de Acidente (CAT)',
    'S-2220': 'Evento S-2220 · Monitoramento da Saúde (ASO)',
    'S-2221': 'Evento S-2221 · Exame Toxicológico Rodoviário',
    'S-2240': 'Evento S-2240 · Condições Ambientais (Tabela 24)',
  };

  return {
    averageCompliancePct,
    averageSlaPct,
    totalValidatedEvents: totals.totalValidatedEvents,
    totalPreventedRejections: totals.totalPreventedRejections,
    complianceDeltaPct,
    activeSeriesLabel: labelMap[eventFilter],
  };
}

/**
 * Pure Hermite smoothstep interpolation [0, 1] for ScrollExpand transitions.
 */
export function smoothstepScrollExpand(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return Number((t * t * (3 - 2 * t)).toFixed(4));
}

export interface ScrollExpandFrameState {
  expandT: number;
  widthPct: number;
  heightPct: number;
  radiusPx: number;
  mediaScale: number;
  scrimAlpha: number;
  overlayProgress: number;
  titleProgress: number;
  hintProgress: number;
  isCaptionReady: boolean;
}

/**
 * Computes deterministic frame geometry and optical overlay states for <ScrollExpand />
 * given normalized scroll progress [0, 1].
 */
export function calculateScrollExpandFrameState(
  progress: number,
  config: {
    startWidth?: number;
    startHeight?: number;
    startRadius?: number;
    endRadius?: number;
    mediaZoom?: number;
    overlayScrim?: number;
    scrollDistance?: number;
    holdDistance?: number;
  } = {}
): ScrollExpandFrameState {
  const startWidth = config.startWidth ?? 42;
  const startHeight = config.startHeight ?? 58;
  const startRadius = config.startRadius ?? 24;
  const endRadius = config.endRadius ?? 0;
  const mediaZoom = config.mediaZoom ?? 1.35;
  const overlayScrim = config.overlayScrim ?? 0.45;
  const scrollDistance = Math.max(0.2, config.scrollDistance ?? 1.2);
  const holdDistance = Math.max(0, config.holdDistance ?? 0.35);

  const clampedP = clamp(progress, 0, 1);
  const totalUnits = scrollDistance + holdDistance;
  const expandRatio = scrollDistance / (totalUnits || 1);
  const expandT = smoothstepScrollExpand(0, expandRatio, clampedP);

  const widthPct = Number((startWidth + (100 - startWidth) * expandT).toFixed(2));
  const heightPct = Number((startHeight + (100 - startHeight) * expandT).toFixed(2));
  const radiusPx = Number((startRadius + (endRadius - startRadius) * expandT).toFixed(2));
  const mediaScale = Number((mediaZoom + (1 - mediaZoom) * expandT).toFixed(4));
  const scrimAlpha = Number(
    (smoothstepScrollExpand(0.35, 0.9, expandT) * overlayScrim).toFixed(4)
  );
  const overlayProgress = smoothstepScrollExpand(0.65, 1, expandT);
  const titleProgress = Number((1 - smoothstepScrollExpand(0.05, 0.55, expandT)).toFixed(4));
  const hintProgress = Number((1 - smoothstepScrollExpand(0, 0.2, expandT)).toFixed(4));

  return {
    expandT,
    widthPct,
    heightPct,
    radiusPx,
    mediaScale,
    scrimAlpha,
    overlayProgress,
    titleProgress,
    hintProgress,
    isCaptionReady: expandT >= 0.25,
  };
}

export interface ArchitectureScrollPlate {
  id: string;
  code: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  footerLegendTitle: string;
  footerLegendText: string;
  normativeAnchor: string;
  technicalSpec: string;
}

export const ARCHITECTURE_SCROLL_EXPAND_PLATES: readonly ArchitectureScrollPlate[] = [
  {
    id: 'arch-auditoria-campo',
    code: 'ARQ · 01',
    src: '/images/institutional/consultoria-auditoria-sst.webp',
    alt: 'Arquitetura documental e auditoria técnica de campo em Saúde e Segurança do Trabalho',
    title: 'Arquitetura para o Conhecimento Humano',
    subtitle: 'Onde o rigor da engenharia ocupacional encontra a clareza jurídica.',
    footerLegendTitle: 'Auditoria Técnica de Campo & Rastreabilidade Documental',
    footerLegendText:
      'Levantamento quantitativo de agentes ambientais integrado nativamente ao Inventário de Riscos do PGR (NR-01), ao LTCAT previdenciário e à mensageria XML do evento S-2240.',
    normativeAnchor: 'NR-01 (GRO) · Lei 8.213/91 Art. 58 · Evento S-2240',
    technicalSpec: 'Curadoria Guilherme & Victor · Conformidade Auditável',
  },
  {
    id: 'arch-inspecao-fabril',
    code: 'ARQ · 02',
    src: '/images/institutional/inspecao-seguranca-trabalho.webp',
    alt: 'Inspeção de segurança do trabalho e rigor técnico no chão de fábrica',
    title: 'Rigor Técnico no Chão de Fábrica',
    subtitle: 'A interseção exata entre a letra da norma e a realidade operacional.',
    footerLegendTitle: 'Inspeção Operacional & Engenharia de Proteção Coletiva (EPC)',
    footerLegendText:
      'Verificação in loco de enclausuramento acústico, bloqueio LOTO (NR-12) e eficácia de EPIs com validação cruzada de Certificados de Aprovação (CA) perante o MTE.',
    normativeAnchor: 'NR-06 · NR-12 · NR-15 · Tema 555 STF',
    technicalSpec: 'Dosimetria NHO-01 Fundacentro · Validação em Tempo Real',
  },
  {
    id: 'arch-canteiro-obras',
    code: 'ARQ · 03',
    src: '/images/institutional/canteiro-obras-engenharia.webp',
    alt: 'Engenharia de segurança em obras e sistemas de proteção coletiva',
    title: 'Memória Técnica & Proteção Coletiva',
    subtitle: 'Projetado como um espaço arquitetônico duradouro para equipes de alta exigência.',
    footerLegendTitle: 'Projetos de Engenharia Civil, Trabalho em Altura & Espaços Confinados',
    footerLegendText:
      'Matrizes de permissão de trabalho, linhas de vida certificadas e prontuários técnicos estruturados para eliminar o retrabalho e blindar a governança institucional.',
    normativeAnchor: 'NR-18 · NR-33 · NR-35 · PPP Eletrônico (IN 128)',
    technicalSpec: 'ART Registrada · Rastreabilidade Histórica 20 Anos',
  },
] as const;

/**
 * Pure helper to resolve a numeric or percentage stackPosition offset against viewport height.
 */
export function resolveScrollStackOffset(value: number | string, size: number): number {
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
  return parseFloat(text) || 0;
}

export interface ScrollStackCardVisualState {
  scale: number;
  dim: number;
  tiltDeg: number;
  turnDeg: number;
  transformCss: string;
}

/**
 * Computes deterministic scale, dim opacity, and 3D transform string for a ScrollStack card
 * at a given burial depth [0..N].
 */
export function calculateScrollStackCardTransform(
  depth: number,
  index: number,
  options: {
    itemScale?: number;
    baseScale?: number;
    dimAmount?: number;
    tiltAmount?: number;
    rotationAmount?: number;
  } = {}
): ScrollStackCardVisualState {
  const itemScale = options.itemScale ?? 0.05;
  const baseScale = options.baseScale ?? 0.8;
  const dimAmount = clamp(options.dimAmount ?? 0.2, 0, 1);
  const tiltAmount = options.tiltAmount ?? 0;
  const rotationAmount = options.rotationAmount ?? 0;

  const safeDepth = Math.max(0, depth);
  const lean = Math.min(safeDepth, 1);
  const scale = Number(
    Math.max(Math.min(baseScale, 1), 1 - safeDepth * itemScale).toFixed(4)
  );
  const tiltDeg = Number((-lean * tiltAmount).toFixed(2));
  const turnDeg = Number((lean * rotationAmount * (index % 2 ? -1 : 1)).toFixed(2));
  const dim = Number((1 - Math.pow(1 - dimAmount, safeDepth)).toFixed(3));

  const transformCss =
    safeDepth < 0.0005
      ? 'translate3d(0, 0, 0)'
      : `perspective(1200px) rotateX(${tiltDeg.toFixed(2)}deg) rotate(${turnDeg.toFixed(2)}deg) scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1)`;

  return {
    scale,
    dim,
    tiltDeg,
    turnDeg,
    transformCss,
  };
}

// ============================================================================
// SECURITY & INPUT VALIDATION UTILITIES (CLEAN CODE & DEFENSIVE HARDENING)
// ============================================================================

const EMAIL_RFC_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

/**
 * Sanitizes user text input by stripping ASCII control characters and HTML angle brackets
 * and enforcing a strict character ceiling.
 */
export function sanitizeTextInput(input: string, maxLength = 160): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F<>]/g, '')
    .trim()
    .slice(0, Math.max(1, maxLength));
}

/**
 * Validates whether an email string conforms to corporate/academic address structure.
 */
export function isValidCorporateEmail(email: string): boolean {
  const cleaned = sanitizeTextInput(email, 180);
  return EMAIL_RFC_PATTERN.test(cleaned);
}

/**
 * Validates whether a CNPJ string contains 14 non-repeating numeric digits.
 */
export function isValidCnpjFormat(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  return true;
}

/**
 * Validates an uploaded image file against allowed MIME types and maximum byte size (default 5MB).
 */
export function validateImageUploadFile(
  file: { type: string; size: number },
  maxBytes = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: 'Formato não permitido. Envie uma imagem JPEG, PNG, WebP ou AVIF.',
    };
  }
  if (file.size <= 0 || file.size > maxBytes) {
    return {
      valid: false,
      error: 'O arquivo excede o limite de segurança de 5 MB.',
    };
  }
  return { valid: true };
}

// ============================================================================
// SMART NAVBAR SCROLL DETECTION & CATCH-ALL ROUTE RESOLUTION
// ============================================================================

export interface SmartNavbarScrollInput {
  currentScrollY: number;
  prevScrollY: number;
  prevHidden: boolean;
  mobileMenuOpen: boolean;
  threshold?: number;
  topOffset?: number;
}

export interface SmartNavbarScrollState {
  atTop: boolean;
  isHidden: boolean;
  isElevated: boolean;
  lastScrollY: number;
  direction: 'top' | 'up' | 'down' | 'idle';
}

/**
 * Pure deterministic evaluator for the Auto-Hiding Smart Navbar.
 * - Normalizes negative scroll positions (iOS overscroll bounce) to 0.
 * - Keeps the navbar visible if mobileMenuOpen is true.
 * - Keeps the navbar integrated and visible at the top (scrollY <= topOffset).
 * - Ignores micro-scroll jitter smaller than `threshold` (default 8px).
 * - Hides smoothly on downward scroll and reappears immediately with elevation on upward scroll.
 */
export function evaluateSmartNavbarScroll({
  currentScrollY,
  prevScrollY,
  prevHidden,
  mobileMenuOpen,
  threshold = 8,
  topOffset = 16,
}: SmartNavbarScrollInput): SmartNavbarScrollState {
  const safeCurrentY = Math.max(0, Number.isFinite(currentScrollY) ? currentScrollY : 0);
  const safePrevY = Math.max(0, Number.isFinite(prevScrollY) ? prevScrollY : 0);
  const atTop = safeCurrentY <= topOffset;

  if (mobileMenuOpen) {
    return {
      atTop,
      isHidden: false,
      isElevated: !atTop,
      lastScrollY: safeCurrentY,
      direction: atTop ? 'top' : 'up',
    };
  }

  if (atTop) {
    return {
      atTop: true,
      isHidden: false,
      isElevated: false,
      lastScrollY: safeCurrentY,
      direction: 'top',
    };
  }

  const deltaY = safeCurrentY - safePrevY;

  if (Math.abs(deltaY) < threshold) {
    return {
      atTop: false,
      isHidden: prevHidden,
      isElevated: !prevHidden,
      lastScrollY: safePrevY,
      direction: 'idle',
    };
  }

  if (deltaY > 0) {
    return {
      atTop: false,
      isHidden: true,
      isElevated: false,
      lastScrollY: safeCurrentY,
      direction: 'down',
    };
  }

  return {
    atTop: false,
    isHidden: false,
    isElevated: true,
    lastScrollY: safeCurrentY,
    direction: 'up',
  };
}

export const VALID_INSTITUTIONAL_PATHS = new Set(['', '/', '/index.html']);

export const VALID_INSTITUTIONAL_ANCHORS = new Set([
  '',
  '#',
  '#hero',
  '#ideia',
  '#ensaio',
  '#modulos',
  '#tecnologia',
  '#criadores',
  '#faq',
  '#sobre',
  '#laboratorio-normativo',
  '#telemetria-esocial',
]);

export interface InstitutionalRouteResolution {
  isNotFound: boolean;
  normalizedPath: string;
  normalizedHash: string;
  attemptedTarget: string;
}

/**
 * Evaluates pathname and hash to determine if the route maps to a valid view/section
 * or should trigger the 404 Catch-All page.
 */
export function resolveInstitutionalRoute(
  pathname: string,
  hash = ''
): InstitutionalRouteResolution {
  const rawPath = (pathname || '/').trim();
  const normalizedPath =
    rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
  const normalizedHash = (hash || '').trim();

  const pathValid = VALID_INSTITUTIONAL_PATHS.has(normalizedPath);
  const hashValid = VALID_INSTITUTIONAL_ANCHORS.has(normalizedHash);

  if (!pathValid) {
    return {
      isNotFound: true,
      normalizedPath,
      normalizedHash,
      attemptedTarget: `${normalizedPath}${normalizedHash}`,
    };
  }

  if (!hashValid) {
    return {
      isNotFound: true,
      normalizedPath,
      normalizedHash,
      attemptedTarget: normalizedHash,
    };
  }

  return {
    isNotFound: false,
    normalizedPath: '/',
    normalizedHash,
    attemptedTarget: normalizedHash || '/',
  };
}

