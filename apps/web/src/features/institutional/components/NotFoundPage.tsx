/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Search, Compass, BookOpen } from 'lucide-react';
import FuzzyText from './FuzzyText';
import { useCardSpotlight } from '../hooks/useInteractiveHooks';

export interface NotFoundPageProps {
  attemptedPath?: string;
  themeMode: 'alabaster' | 'noir';
  onReturnHome: () => void;
  onOpenSearch?: () => void;
  onSelectDossierCode?: (code: string) => void;
}

const SUGGESTED_NORMATIVE_SHORTCUTS = [
  { code: 'NR-01', label: 'NR-01 · GRO & PGR' },
  { code: 'S-2240', label: 'S-2240 · Fatores de Risco' },
  { code: 'LTCAT', label: 'LTCAT & PPP Digital' },
  { code: 'STF 555', label: 'Tema 555 STF · Ruído' },
] as const;

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  attemptedPath,
  themeMode,
  onReturnHome,
  onOpenSearch,
  onSelectDossierCode,
}) => {
  const handleCardSpotlightMove = useCardSpotlight(false);
  const isAlabaster = themeMode === 'alabaster';
  const fuzzyColor = isAlabaster ? '#16181A' : '#F2F0EB';
  const fuzzyGradient = isAlabaster
    ? ['#16181A', '#234F46', '#36586D']
    : ['#F2F0EB', '#8AB5A8', '#7B9EB5'];

  return (
    <section
      aria-labelledby="not-found-title"
      data-testid="not-found-404-view"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center py-28 sm:py-36 px-4 sm:px-8 lg:px-16 mesh-gradient-hero overflow-hidden border-b border-[var(--border-hairline)]"
    >
      {/* Ambient Architectural Light Washes */}
      <div
        aria-hidden="true"
        className="ambient-glass-orb-sage absolute top-20 left-[10%] w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full"
      />
      <div
        aria-hidden="true"
        className="ambient-glass-orb-fjord absolute bottom-16 right-[10%] w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full"
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div
          onMouseMove={handleCardSpotlightMove}
          className="mzia-frame rounded-3xl p-6 sm:p-12 lg:p-16 text-center space-y-6 sm:space-y-8"
        >
          {/* Editorial Top Metadata */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <Compass className="w-3.5 h-3.5 text-[var(--accent-editorial)] shrink-0" />
            <span>Índice Arquivístico SST &amp; eSocial</span>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--accent-editorial)]">Rota Não Localizada</span>
          </div>

          {/* Interactive Canvas <FuzzyText /> 404 Centerpiece */}
          <div
            data-testid="fuzzy-text-404-container"
            className="py-2 flex items-center justify-center overflow-hidden"
          >
            <FuzzyText
              fontSize="clamp(4.75rem, 18vw, 9.5rem)"
              fontWeight={600}
              fontFamily="Cormorant Garamond, Georgia, serif"
              color={fuzzyColor}
              gradient={fuzzyGradient}
              baseIntensity={0.2}
              hoverIntensity={0.6}
              enableHover={true}
              glitchMode={true}
              glitchInterval={2400}
              glitchDuration={220}
              fuzzRange={28}
            >
              404
            </FuzzyText>
          </div>

          {/* Friendly Title & Explanation Message */}
          <div className="space-y-3 max-w-xl mx-auto">
            <h1
              id="not-found-title"
              className="font-editorial text-[clamp(1.85rem,4vw,3rem)] font-normal text-[var(--text-primary)] leading-[1.12]"
            >
              Ops! Página não encontrada
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              O caminho que você tentou acessar ou o botão clicado aponta para um endereço que não
              existe ou foi movido no acervo normativo.
            </p>
            {attemptedPath && attemptedPath !== '/' && (
              <p className="text-xs font-tabular text-[var(--text-muted)] pt-1 break-all">
                Endereço solicitado:{' '}
                <code className="px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--text-primary)]">
                  {attemptedPath}
                </code>
              </p>
            )}
          </div>

          {/* Primary & Secondary Action Buttons (Mobile-First >= 44px Touch Targets) */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
            <button
              type="button"
              data-testid="btn-return-home-404"
              onClick={onReturnHome}
              className="min-h-[48px] px-7 py-3 rounded-xl bg-spectral-gradient text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Voltar para a Página Inicial</span>
            </button>

            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="min-h-[48px] px-6 py-3 rounded-xl glass-interactive-tile text-xs sm:text-sm font-medium text-[var(--text-primary)] inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4 text-[var(--accent-editorial)] shrink-0" />
                <span>Pesquisar no Acervo (Ctrl+K)</span>
              </button>
            )}
          </div>

          {/* Quick Dossier Shortcuts */}
          {onSelectDossierCode && (
            <div className="pt-6 border-t border-[var(--border-hairline)] space-y-3">
              <div className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent-editorial)]" />
                <span>Ou acesse diretamente um dossiê homologado:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SUGGESTED_NORMATIVE_SHORTCUTS.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onSelectDossierCode(item.code)}
                    className="min-h-[44px] px-4 py-2 rounded-xl glass-interactive-tile text-xs font-tabular text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
