/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Minus, ArrowUpRight, Search, Copy, Check, X, BookOpen } from 'lucide-react';
import { SplitTextReveal } from './AwwwardsMotion';
import { SunburstEmblem } from './SunburstEmblem';
import {
  PREVENCE_FAQ_CATEGORIES,
  PREVENCE_FAQ_ITEMS,
  SstFaqCategory,
  filterFaqItems,
  toggleFaqAccordionItem,
  formatNormativeCitation,
} from '../utils/sstCalculations';
import { useCardSpotlight, useClipboardCopy } from '../hooks/useInteractiveHooks';

interface FaqAccordionSectionProps {
  onOpenCommandPalette: () => void;
  onSelectLabTab?: (tab: 'esocial' | 'gro' | 'ti' | 'juridico') => void;
}

export const FaqAccordionSection: React.FC<FaqAccordionSectionProps> = ({
  onOpenCommandPalette,
  onSelectLabTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<SstFaqCategory>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<string[]>([PREVENCE_FAQ_ITEMS[0].id]);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(false);

  const handleCardSpotlightMove = useCardSpotlight(false);
  const { copiedKey: copiedId, copyText } = useClipboardCopy(2500);

  const filteredItems = useMemo(
    () => filterFaqItems(activeCategory, searchQuery),
    [activeCategory, searchQuery]
  );

  const categoryCounts = useMemo(
    () =>
      PREVENCE_FAQ_CATEGORIES.reduce<Record<SstFaqCategory, number>>(
        (acc, cat) => ({
          ...acc,
          [cat.id]: filterFaqItems(cat.id).length,
        }),
        { todos: 0, esocial: 0, laudos: 0, previdenciario: 0, governanca: 0 }
      ),
    []
  );

  const allFilteredOpen =
    filteredItems.length > 0 && filteredItems.every((item) => openIds.includes(item.id));

  const handleToggleItem = (id: string) => {
    setOpenIds((prev) => toggleFaqAccordionItem(prev, id, allowMultiple));
  };

  const handleToggleAll = () => {
    if (allFilteredOpen) {
      setOpenIds([]);
    } else {
      setAllowMultiple(true);
      setOpenIds(filteredItems.map((item) => item.id));
    }
  };

  const handleCategoryChange = (category: SstFaqCategory) => {
    setActiveCategory(category);
    const nextFiltered = filterFaqItems(category, searchQuery);
    if (nextFiltered.length > 0 && !nextFiltered.some((item) => openIds.includes(item.id))) {
      setOpenIds([nextFiltered[0].id]);
    }
  };

  const handleActionClick = (itemCategory: SstFaqCategory, href: string) => {
    if (!onSelectLabTab || href !== '#laboratorio-normativo') return;
    if (itemCategory === 'esocial') onSelectLabTab('esocial');
    else if (itemCategory === 'laudos') onSelectLabTab('gro');
    else if (itemCategory === 'previdenciario') onSelectLabTab('juridico');
  };

  const handleCopyFaqCitation = (id: string, code: string, question: string, ref: string) => {
    const citation = formatNormativeCitation(`Parecer ${code}`, question, ref);
    void copyText(citation, id);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <section
      id="faq"
      data-testid="faq-accordion-section"
      className="relative border-b border-[var(--border-hairline)] mesh-gradient-bento py-24 lg:py-32 2xl:py-40 overflow-hidden"
    >
      {/* Subtle Ambient Orbs for Depth */}
      <div
        aria-hidden="true"
        className="ambient-glass-orb-sage absolute top-12 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full pointer-events-none opacity-40"
      />

      <div className="relative z-10 w-full max-w-4xl 2xl:max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* =================================================================== */}
        {/* Centered Editorial Header: Balanced, Elegant & Informative          */}
        {/* =================================================================== */}
        <div className="gsap-faq-left text-center space-y-4 mb-10 sm:mb-12">
          {/* Subtle Archival Emblem & Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-glass)] text-[var(--accent-ochre)] text-xs font-medium tracking-widest uppercase">
            <SunburstEmblem size={18} strokeColor="currentColor" dotColor="currentColor" />
            <span>Base Normativa &middot; eSocial S-1.3 &middot; NRs</span>
          </div>

          <SplitTextReveal
            as="h2"
            text="Perguntas"
            highlightText="frequentes."
            className="font-editorial text-4xl sm:text-5xl 2xl:text-6xl font-normal text-[var(--text-primary)] leading-[1.1]"
          />

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Orientações objetivas fundamentadas na legislação previdenciária, nas Normas
            Regulamentadoras e no Manual de Orientação do eSocial (S-1.3).
          </p>
        </div>

        {/* =================================================================== */}
        {/* Usability & Navigation Bar: Live Search + Command Palette Shortcut  */}
        {/* =================================================================== */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar dúvida, norma (ex: NR-15, S-2240, ruído, insalubridade)..."
              aria-label="Pesquisar perguntas frequentes"
              className="w-full min-h-[48px] pl-11 pr-24 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-glass)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-ochre)] focus:ring-1 focus:ring-[var(--accent-ochre)] transition-all shadow-sm"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Limpar pesquisa"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onOpenCommandPalette}
                title="Abrir índice completo (⌘K)"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-full bg-black/5 dark:bg-white/10 border border-[var(--border-hairline)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <span>⌘K</span>
              </button>
            </div>
          </div>

          {/* =================================================================== */}
          {/* Horizontal Topic Filter Pills: Balanced & Touch-Friendly           */}
          {/* =================================================================== */}
          <div
            role="tablist"
            aria-label="Filtrar perguntas frequentes por domínio"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 sm:flex-wrap justify-start sm:justify-center -mx-2 px-2"
          >
            {PREVENCE_FAQ_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="faq-accordion-list"
                  onMouseMove={handleCardSpotlightMove}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`min-h-[42px] px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all duration-200 flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-[var(--accent-ochre)] text-white shadow-sm font-semibold'
                      : 'bg-[var(--bg-glass)] border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-ochre)]/40'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`font-tabular text-[11px] px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-black/5 dark:bg-white/10 text-[var(--text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* Accordion Controls Bar: Count & Expand/Collapse Toggle             */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>
              Mostrando <strong className="text-[var(--text-primary)] font-medium">{filteredItems.length}</strong>{' '}
              {filteredItems.length === 1 ? 'parecer técnico' : 'pareceres técnicos'}
            </span>
            {searchQuery && (
              <span className="text-[var(--accent-ochre)]">
                para &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {filteredItems.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              {allFilteredOpen ? 'Recolher todas' : 'Expandir todas'}
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* Accordion Items List: Centered, Harmonious, Tactile Ergonomics     */}
        {/* =================================================================== */}
        <div id="faq-accordion-list" className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-[var(--border-hairline)] bg-[var(--bg-glass)] space-y-3">
              <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-60" />
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Nenhum parecer encontrado para os critérios selecionados.
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Tente buscar por outro termo ou selecione &ldquo;Todos os Domínios&rdquo; para ver todo o acervo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('todos');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-hairline)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-ochre)] transition-colors cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openIds.includes(item.id);
              const panelId = `${item.id}-panel`;
              const buttonId = `${item.id}-trigger`;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  data-testid={`faq-item-${item.indexCode}`}
                  data-glass-active={isOpen}
                  onMouseMove={handleCardSpotlightMove}
                  className="gsap-faq-row rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-glass)] transition-all duration-300 hover:border-[var(--accent-ochre)]/50 shadow-sm overflow-hidden"
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => handleToggleItem(item.id)}
                      className="w-full py-5 sm:py-6 px-5 sm:px-7 text-left flex items-start justify-between gap-4 group focus-visible:outline-none cursor-pointer"
                    >
                      {/* Left Roman Numeral Tag */}
                      <div className="flex items-baseline gap-2 w-10 sm:w-12 shrink-0 pt-0.5">
                        <span
                          className={`font-editorial text-2xl sm:text-3xl font-light transition-colors ${
                            isOpen
                              ? 'text-[var(--accent-ochre)] font-normal'
                              : 'text-[var(--accent-editorial)]'
                          }`}
                        >
                          {item.roman}.
                        </span>
                      </div>

                      {/* Center Metadata & Question Headline */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
                          <span className="text-[var(--text-secondary)] font-medium">
                            {item.categoryLabel}
                          </span>
                          <span aria-hidden="true">&middot;</span>
                          <span>{item.normativeRef}</span>
                        </div>

                        <div className="font-editorial text-xl sm:text-2xl font-normal text-[var(--text-primary)] leading-snug">
                          {item.question}
                        </div>
                      </div>

                      {/* Right Disclosure Affordance (+/- Pill) */}
                      <span
                        aria-hidden="true"
                        className={`mt-1 w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition-all duration-200 ${
                          isOpen
                            ? 'border-[var(--accent-ochre)] bg-[var(--accent-ochre)] text-white shadow-sm'
                            : 'border-[var(--border-hairline)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--accent-ochre)]'
                        }`}
                      >
                        {isOpen ? (
                          <Minus className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 pt-1 px-5 sm:px-7 sm:pl-16 sm:pr-8 space-y-4">
                          {/* Editorial Pull-Quote with Ochre Accent */}
                          <div className="py-3.5 px-4 border-l-2 border-[var(--accent-ochre)] bg-[var(--accent-ochre-muted)]/15 rounded-r-lg my-1">
                            <p className="font-editorial italic text-base sm:text-lg text-[var(--text-primary)] leading-relaxed">
                              &ldquo;{item.editorialPullQuote}&rdquo;
                            </p>
                          </div>

                          {/* Primary Normative Prose */}
                          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                            {item.answer}
                          </p>

                          {/* Technical Audit Note & Contextual Action */}
                          <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xl">
                              <strong className="text-[var(--text-primary)] font-medium">
                                Nota prática:{' '}
                              </strong>
                              {item.technicalNote}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyFaqCitation(
                                    item.id,
                                    item.indexCode,
                                    item.question,
                                    item.normativeRef
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-ochre)] transition-colors whitespace-nowrap cursor-pointer"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[var(--accent-ochre)]" />
                                    <span className="text-[var(--accent-ochre)] font-medium">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar citação</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={item.actionHref}
                                onClick={() => handleActionClick(item.category, item.actionHref)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent-ochre)] underline underline-offset-4 shrink-0 whitespace-nowrap"
                              >
                                <span>{item.actionLabel}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
