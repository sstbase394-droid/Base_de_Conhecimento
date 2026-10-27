/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EsocialEventCode = 'S-2210' | 'S-2220' | 'S-2221' | 'S-2240';

export interface EsocialEventSchemaSpec {
  code: EsocialEventCode;
  title: string;
  deadline: string;
  tableRef: string;
  description: string;
  xmlPreview: string;
}

export const ESOCIAL_EVENTS: Record<EsocialEventCode, EsocialEventSchemaSpec> = {
  'S-2210': {
    code: 'S-2210',
    title: 'Comunicação de Acidente de Trabalho (CAT)',
    deadline: 'Prazo: 1º dia útil seguinte (imediato em óbito)',
    tableRef: 'Tabelas 13, 14, 15 e 17 do eSocial',
    description:
      'Registra acidentes típicos, de trajeto ou doenças ocupacionais com vinculação direta ao CNIS do segurado e validação automática do CID e CRM.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCAT/v_S_01_03_00">
  <evtCAT Id="ID1123456780001902026102410420000001">
    <ideEvento><indRetif>1</indRetif><tpAmb>1</tpAmb></ideEvento>
    <cat>
      <dtAcid>2026-10-24</dtAcid>
      <tpAcid>1</tpAcid>
      <ultDiaTrab>2026-10-24</ultDiaTrab>
      <atestado><codCID>S62.6</codCID><qtdDiasAfast>15</qtdDiasAfast></atestado>
    </cat>
  </evtCAT>
</eSocial>`,
  },
  'S-2220': {
    code: 'S-2220',
    title: 'Monitoramento da Saúde do Trabalhador (ASO)',
    deadline: 'Prazo: Até o dia 15 do mês subsequente',
    tableRef: 'Tabela 27 (Procedimentos Diagnósticos)',
    description:
      'Rastreia exames admissionais, periódicos, retorno ao trabalho, mudança de riscos ocupacionais e demissionais alinhados ao PCMSO (NR-07).',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtMonit/v_S_01_03_00">
  <evtMonit Id="ID1123456780001902026102410450000002">
    <exMedOcup>
      <tpExameOcup>0</tpExameOcup>
      <aso>
        <dtAso>2026-10-24</dtAso>
        <resAso>1</resAso>
        <exame><dtExm>2026-10-22</dtExm><procRealizado>0295</procRealizado></exame>
      </aso>
    </exMedOcup>
  </evtMonit>
</eSocial>`,
  },
  'S-2221': {
    code: 'S-2221',
    title: 'Exame Toxicológico do Motorista Profissional',
    deadline: 'Prazo: Até o dia 15 do mês subsequente ao exame',
    tableRef: 'Portaria MTE nº 612/2024 · Categorias C, D e E',
    description:
      'Transmissão obrigatória dos exames toxicológicos de larga janela de detecção (90 dias) para motoristas profissionais do transporte rodoviário.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtToxic/v_S_01_03_00">
  <evtToxic Id="ID1123456780001902026102410480000003">
    <toxicologico>
      <dtExame>2026-10-20</dtExame>
      <cnpjLab>04829102000140</cnpjLab>
      <codSeqExame>AA948102938</codSeqExame>
    </toxicologico>
  </evtToxic>
</eSocial>`,
  },
  'S-2240': {
    code: 'S-2240',
    title: 'Condições Ambientais do Trabalho — Fatores de Risco',
    deadline: 'Alimenta em tempo real o PPP Eletrônico',
    tableRef: 'Tabela 24 (Agentes Nocivos e Limites NHO/NR-15)',
    description:
      'Integra o LTCAT ao eSocial declarando exposição a agentes físicos, químicos e biológicos, eficácia de EPC/EPI e enquadramento de aposentadoria especial.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_03_00">
  <evtExpRisco Id="ID1123456780001902026102410500000004">
    <infoExpRisco>
      <dtIniCondicao>2026-01-01</dtIniCondicao>
      <agNoc>
        <codAgNoc>01.01.001</codAgNoc>
        <tpAval>1</tpAval>
        <intConc>87.4</intConc>
        <limTol>85.0</limTol>
      </agNoc>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`,
  },
} as const;

export interface GleamEssayItem {
  index: string;
  total: string;
  dossierCode: string;
  curator: string;
  title: string;
  subtitle: string;
  excerpt: string;
  highlight: string;
  mainImg: string;
  subImg1: string;
  subImg2: string;
  plateCaptions: readonly [string, string, string];
  verticalNote: string;
}

export const GLEAM_ESSAYS: readonly GleamEssayItem[] = [
  {
    index: '01',
    total: '04',
    dossierCode: 'NR-01',
    curator: 'Guilherme & Victor',
    title: 'Arquitetura da Prevenção',
    subtitle: 'GRO, PGR & Engenharia de Campo',
    excerpt:
      'Inspirado pela precisão editorial das grandes monografias de arquitetura, o projeto trata cada Norma Regulamentadora e cada leiaute do eSocial não como burocracia fria, mas como uma estrutura de proteção à vida humana no trabalho.',
    highlight:
      'Quando o conhecimento técnico é desenhado com clareza e silêncio visual, o erro operacional desaparece.',
    mainImg: '/images/institutional/trabalho-em-altura-ferramentas.webp',
    subImg1: '/images/institutional/canteiro-obras-engenharia.webp',
    subImg2: '/images/institutional/profissional-saude-ocupacional.webp',
    plateCaptions: [
      'I · Operação e Trabalho em Altura',
      'II · Engenharia e Canteiro de Obras',
      'III · Saúde Ocupacional e Clínica',
    ],
    verticalNote: 'ENGENHARIA DE SEGURANÇA & MEDICINA OCUPACIONAL',
  },
  {
    index: '02',
    total: '04',
    dossierCode: 'S-2240',
    curator: 'Guilherme & Victor',
    title: 'A Sintaxe do eSocial',
    subtitle: 'Mensageria XML & Tabela 24',
    excerpt:
      'Eventos como S-2210, S-2220, S-2221 e S-2240 exigem coerência milimétrica entre o que é constatado em campo pelo engenheiro e o arquivo XML assinado digitalmente.',
    highlight:
      'Trilhas visuais que conectam a Tabela 24 diretamente ao PPP Eletrônico sem ruído interpretativo.',
    mainImg: '/images/institutional/analise-metricas-indicadores.webp',
    subImg1: '/images/institutional/reuniao-corporativa-alinhamento.webp',
    subImg2: '/images/institutional/gestao-estoque-logistica.webp',
    plateCaptions: [
      'I · Análise de Indicadores e Schemas',
      'II · Alinhamento Técnico Interdisciplinar',
      'III · Rastreabilidade Logística e Operacional',
    ],
    verticalNote: 'MENSAGERIA E-CAC & CONFORMIDADE XSD S-1.3',
  },
  {
    index: '03',
    total: '04',
    dossierCode: 'e-CAC',
    curator: 'Guilherme & Victor',
    title: 'Memória Institucional',
    subtitle: 'Governança & Cultura 24h',
    excerpt:
      'Organizações perdem décadas de inteligência quando o conhecimento fica disperso em planilhas e PDFs estáticos. Construímos um organismo vivo de documentação técnica.',
    highlight:
      'Cultura de resposta em 24 horas e revisão contínua por pares entre engenheiros, médicos e analistas de TI.',
    mainImg: '/images/institutional/treinamento-instrucao-equipe.webp',
    subImg1: '/images/institutional/reuniao-corporativa-alinhamento.webp',
    subImg2: '/images/institutional/consultoria-auditoria-sst.webp',
    plateCaptions: [
      'I · Instrução e Capacitação de Equipes',
      'II · Revisão por Pares e Governança',
      'III · Auditoria Técnica Documental',
    ],
    verticalNote: 'GOVERNANÇA EDITORIAL & CULTURA DE FEEDBACK',
  },
  {
    index: '04',
    total: '04',
    dossierCode: 'STF 555',
    curator: 'Guilherme & Victor',
    title: 'Jurisprudência & Paz Social',
    subtitle: 'Tema 555 STF & Previdência',
    excerpt:
      'A fronteira entre o Direito Previdenciário e a Higiene Ocupacional define o futuro de milhares de trabalhadores e a sustentabilidade das organizações.',
    highlight:
      'Do Tema 555 do STF ao enquadramento de aposentadoria especial: rigor técnico traduzido com lucidez.',
    mainImg: '/images/institutional/trabalhador-epi-construcao.webp',
    subImg1: '/images/institutional/equipamentos-protecao-individual.webp',
    subImg2: '/images/institutional/operacao-industrial-maquinario.webp',
    plateCaptions: [
      'I · Proteção Individual em Campo',
      'II · Especificação e Eficácia de EPI',
      'III · Controle de Ruído e Maquinário',
    ],
    verticalNote: 'INTELIGÊNCIA PREVIDENCIÁRIA & LEI 8.213/91',
  },
] as const;

export type NormativeLabTabId = 'esocial' | 'gro' | 'ti' | 'juridico';

export interface MziaPillarItem {
  roman: string;
  memoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  imgPrimary: string;
  imgSecondary: string;
  tabTarget: NormativeLabTabId;
}

export const MZIA_PILLARS: readonly MziaPillarItem[] = [
  {
    roman: 'I',
    memoryLabel: '( o primeiro pilar · mensageria )',
    title: 'Mensageria eSocial & Eventos SST',
    subtitle: 'S-2210 · S-2220 · S-2221 · S-2240',
    description:
      'Guias avançados sobre integração e-CAC, assinatura ICP-Brasil e validação dos eventos críticos de Saúde e Segurança do Trabalho.',
    imgPrimary: '/images/institutional/analise-metricas-indicadores.webp',
    imgSecondary: '/images/institutional/reuniao-corporativa-alinhamento.webp',
    tabTarget: 'esocial',
  },
  {
    roman: 'II',
    memoryLabel: '( o segundo pilar · higiene ocupacional )',
    title: 'Gestão de Riscos (GRO) & Normas',
    subtitle: 'PGR · PCMSO · LTCAT · LI vs LP',
    description:
      'Base técnica completa sobre PGR, PGRTR, PCMSO, LTCAT, diferenças entre Insalubridade (NR-15) e Periculosidade (NR-16), NRs, PPP e prazos de validade.',
    imgPrimary: '/images/institutional/equipamentos-protecao-individual.webp',
    imgSecondary: '/images/institutional/trabalhador-epi-construcao.webp',
    tabTarget: 'gro',
  },
  {
    roman: 'III',
    memoryLabel: '( o terceiro pilar · infraestrutura )',
    title: 'Operações, Atendimento & TI',
    subtitle: 'Protocolos · XML · SMTP · VPN',
    description:
      'Padronização operacional com scripts de atendimento, tratativa de protocolos, cultura de feedback 24h, análise de arquivos XML, configurações de SMTP e VPN.',
    imgPrimary: '/images/institutional/gestao-estoque-logistica.webp',
    imgSecondary: '/images/institutional/treinamento-instrucao-equipe.webp',
    tabTarget: 'ti',
  },
  {
    roman: 'IV',
    memoryLabel: '( o quarto pilar · jurisprudência )',
    title: 'Inteligência Jurídica & Previdenciária',
    subtitle: 'Aposentadoria Especial · Tema 555 STF',
    description:
      'Documentação clara sobre aposentadoria especial (15, 20 e 25 anos), aposentadoria por invalidez, impacto no FAP/RAT e conformidade legal.',
    imgPrimary: '/images/institutional/operacao-industrial-maquinario.webp',
    imgSecondary: '/images/institutional/inspecao-seguranca-trabalho.webp',
    tabTarget: 'juridico',
  },
] as const;

export interface ResearchMatrixTile {
  code: string;
  label: string;
  domain: string;
}

export const RESEARCH_MATRIX_12: readonly ResearchMatrixTile[] = [
  { code: 'S-2210', label: 'CAT & Acidentes', domain: 'eSocial' },
  { code: 'S-2220', label: 'Monitoramento ASO', domain: 'Saúde' },
  { code: 'S-2221', label: 'Exame Toxicológico', domain: 'Rodoviário' },
  { code: 'S-2240', label: 'Fatores de Risco', domain: 'Agentes' },
  { code: 'NR-01', label: 'GRO & PGR', domain: 'Prevenção' },
  { code: 'NR-07', label: 'PCMSO Clínico', domain: 'Medicina' },
  { code: 'NR-15', label: 'Insalubridade (LI)', domain: 'Tolerância' },
  { code: 'NR-16', label: 'Periculosidade (LP)', domain: 'Risco Acentuado' },
  { code: 'LTCAT', label: 'Laudo Técnico INSS', domain: 'Previdência' },
  { code: 'PPP', label: 'Perfil Profissiográfico', domain: 'Histórico' },
  { code: 'e-CAC', label: 'Mensageria TLS/XML', domain: 'Webservice' },
  { code: 'STF 555', label: 'Ruído & EPI Eficaz', domain: 'Jurisprudência' },
] as const;

export interface FoundationThesisItem {
  num: string;
  domain: string;
  dossierCode: string;
  thesis: string;
}

export const FOUNDATION_THESES: readonly FoundationThesisItem[] = [
  {
    num: '01.',
    domain: 'FUNDAÇÃO',
    dossierCode: 'NR-01',
    thesis: 'Democratizar a precisão técnica em SST sem diluir o rigor normativo.',
  },
  {
    num: '02.',
    domain: 'SILÊNCIO VISUAL',
    dossierCode: 'NR-07',
    thesis: 'Eliminar a poluição cognitiva para que engenheiros e médicos decidam com lucidez.',
  },
  {
    num: '03.',
    domain: 'INTERDISCIPLINARIDADE',
    dossierCode: 'S-2240',
    thesis: 'Unir Higiene Ocupacional, Direito Previdenciário e Engenharia de Mensageria XML.',
  },
  {
    num: '04.',
    domain: 'MEMÓRIA VIVA',
    dossierCode: 'PPP',
    thesis: 'Transformar dúvidas operacionais diárias em patrimônio documental auditável.',
  },
  {
    num: '05.',
    domain: 'PROPÓSITO HUMANO',
    dossierCode: 'S-2210',
    thesis: 'Por trás de cada evento S-2210 ou S-2240 existe uma vida e uma história laboral.',
  },
] as const;
