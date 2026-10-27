/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Design System Tokens
 * Extraído da identidade visual editorial & minimalista contemporânea
 * (Permanent Collection + Posty UX + Mzia Editorial Guidelines).
 */

export const DESIGN_TOKENS = {
  colors: {
    // Tela neutra (60% do espaço)
    canvas: {
      alabaster: '#F4F2ED',
      alabasterWarm: '#EAE7DF',
      alabasterSurface: '#FAF9F6',
      obsidian: '#0E1210',
      obsidianElevated: '#161B18',
      obsidianSurface: '#1F2622',
    },
    // Tipografia & Tinta
    ink: {
      primaryLight: '#16181A',
      secondaryLight: '#4E5358',
      mutedLight: '#767B82',
      primaryDark: '#F4F2ED',
      secondaryDark: '#A3A9B2',
      mutedDark: '#6E7680',
    },
    // Paleta de Destaque Editorial (10% Accent Budget)
    accent: {
      // Dijon / Ochre (Inspirado no carimbo histórico e nós de fluxo)
      ochre: '#C8943F',
      ochreLight: '#E8BF74',
      ochreMuted: 'rgba(200, 148, 63, 0.14)',
      
      // Terracota / Laranja Queimado (Ações primárias e destaques)
      terracotta: '#E26237',
      terracottaHover: '#CD542B',
      terracottaMuted: 'rgba(226, 98, 55, 0.12)',

      // Lavanda Suave / Lilás (Pastel de conexão do flowchart e categorização)
      lilac: '#D8B4E2',
      lilacMuted: 'rgba(216, 180, 226, 0.16)',

      // Verde Pinho / Sálvia Mineral (Autoridade institucional)
      sage: '#234F46',
      sageLight: '#356B5F',
      sageMuted: 'rgba(35, 79, 70, 0.12)',
    },
    // Bordas de precisão (1px hairline)
    border: {
      hairlineLight: 'rgba(22, 24, 26, 0.08)',
      hairlineLightHover: 'rgba(22, 24, 26, 0.16)',
      hairlineDark: 'rgba(244, 242, 237, 0.10)',
      hairlineDarkHover: 'rgba(244, 242, 237, 0.20)',
    },
  },
  typography: {
    fontFamilies: {
      serif: 'var(--font-serif, "Cormorant Garamond", Georgia, serif)',
      sans: 'var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif)',
      mono: 'var(--font-mono, "JetBrains Mono", monospace)',
    },
    hierarchy: {
      hero: 'clamp(2.5rem, 5vw, 4.5rem)',
      h1: 'clamp(2.25rem, 4vw, 3.5rem)',
      h2: 'clamp(1.75rem, 3vw, 2.5rem)',
      h3: 'clamp(1.25rem, 2vw, 1.75rem)',
      bodyLarge: '1.125rem',
      body: '1rem',
      bodySmall: '0.875rem',
      caption: '0.75rem',
    },
  },
  radii: {
    pill: '9999px',
    card: '1.25rem',
    tile: '0.875rem',
    input: '9999px',
    sharp: '0px',
  },
  shadows: {
    soft: '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
    elevated: '0 20px 40px -15px rgba(0, 0, 0, 0.16)',
    innerGlowLight: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.92)',
    innerGlowDark: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
  },
} as const;
