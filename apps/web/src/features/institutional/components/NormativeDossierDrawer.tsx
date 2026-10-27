/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  NORMATIVE_DOSSIERS,
  getNormativeDossierByCode,
  formatNormativeCitation,
} from '../utils/sstCalculations';
import { useClipboardCopy, useModalEscape } from '../hooks/useInteractiveHooks';

interface NormativeDossierDrawerProps {
  dossierCode: string | null;
  onClose: () => void;
  onSelectDossierCode: (code: string) => void;
  onOpenCommandPalette: () => void;
}

export const NormativeDossierDrawer: React.FC<NormativeDossierDrawerProps> = ({
  dossierCode,
  onClose,
  onSelectDossierCode,
  onOpenCommandPalette,
}) => {
  const [largeReadingMode, setLargeReadingMode] = useState(false);
  const [checkedAuditIndices, setCheckedAuditIndices] = useState<number[]>([0]);
  const { copiedKey, copyText } = useClipboardCopy(2600);

  useEffect(() => {
    setCheckedAuditIndices([0]);
  }, [dossierCode]);

  useModalEscape(Boolean(dossierCode), onClose);

  if (!dossierCode) return null;

  const dossier = getNormativeDossierByCode(dossierCode);
  const currentIndex = NORMATIVE_DOSSIERS.findIndex((d) => d.code === dossier.code);
  const prevDossier =
    NORMATIVE_DOSSIERS[(currentIndex - 1 + NORMATIVE_DOSSIERS.length) % NORMATIVE_DOSSIERS.length];
  const nextDossier = NORMATIVE_DOSSIERS[(currentIndex + 1) % NORMATIVE_DOSSIERS.length];
  const copiedCitation = copiedKey === dossier.code;

  const handleCopyCitation = () => {
    const text = formatNormativeCitation(dossier.code, dossier.title, dossier.normativeRef);
    void copyText(text, dossier.code);
  };

  const handleToggleChecklist = (idx: number) => {
    setCheckedAuditIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex justify-end bg-[#080C11]/70 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={`Dossiê Normativo ${dossier.code} — ${dossier.title}`}
        data-testid="normative-dossier-drawer"
      >
        <motion.div
          initial={{ x: '100%', opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl h-full bg-[var(--bg-canvas)] border-l border-[var(--border-hairline)] flex flex-col justify-between overflow-y-auto shadow-2xl"
        >
          {/* Top Curatorial Utility Bar */}
          <div className="sticky top-0 z-20 bg-[var(--bg-canvas)]/95 backdrop-blur-md border-b border-[var(--border-hairline)] px-4 sm:px-10 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-tabular text-[var(--text-secondary)] min-w-0">
              <span className="text-[#68B2A0] font-semibold truncate">BASE DE CONHECIMENTO</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{dossier.accessionNumber}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-pressed={largeReadingMode}
                onClick={() => setLargeReadingMode((prev) => !prev)}
                className="min-h-[44px] px-3.5 py-2 rounded-lg text-[10px] font-tabular uppercase tracking-[0.16em] border border-[var(--border-hairline)] hover:border-[#68B2A0] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap cursor-pointer"
              >
                {largeReadingMode ? 'Tipografia Padrão' : 'Ampliar Leitura'}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar dossiê normativo"
                className="min-w-[44px] min-h-[44px] rounded-lg border border-[var(--border-hairline)] hover:border-[#68B2A0] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Monograph Content */}
          <div className="p-6 sm:p-10 space-y-8 flex-1">
            {/* Editorial Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-tabular text-[var(--text-muted)]">
                <span className="text-[#68B2A0] uppercase tracking-[0.18em]">{dossier.domain}</span>
                <span aria-hidden="true">·</span>
                <span>{dossier.normativeRef}</span>
                <span aria-hidden="true">·</span>
                <span>{dossier.readingTime}</span>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-editorial text-3xl sm:text-4xl font-normal text-[var(--text-primary)] leading-[1.12] [text-wrap:balance]">
                  {dossier.title}
                </h2>
                <span className="font-editorial text-3xl sm:text-4xl font-light text-[#68B2A0] shrink-0">
                  {dossier.code}
                </span>
              </div>
            </div>

            {/* Archival Plate Image */}
            <div className="aspect-[16/9] w-full overflow-hidden border border-[var(--border-hairline)] bg-[#0A0F15] relative">
              <img
                src={dossier.imageSrc}
                alt={`${dossier.code} — ${dossier.title}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover editorial-photo"
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] font-tabular uppercase tracking-[0.2em] text-slate-200 bg-[#080C11]/75 px-3 py-1.5 border border-white/10">
                <span>FIG. {String(currentIndex + 1).padStart(2, '0')} · ACERVO TÉCNICO SST</span>
                <span className="text-[#68B2A0]">{dossier.code}</span>
              </div>
            </div>

            {/* Museum Accession Metadata Grid (dl) */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 border-t border-b border-[var(--border-hairline)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-hairline)] text-xs">
              <div className="py-3 pr-3 space-y-1">
                <dt className="text-[10px] font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  CÓDIGO
                </dt>
                <dd className="font-tabular font-semibold text-[var(--text-primary)]">
                  {dossier.code}
                </dd>
              </div>
              <div className="py-3 sm:px-3 space-y-1">
                <dt className="text-[10px] font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  DOMÍNIO
                </dt>
                <dd className="text-[#68B2A0] font-medium">{dossier.domain}</dd>
              </div>
              <div className="py-3 sm:px-3 space-y-1">
                <dt className="text-[10px] font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  CURADORIA
                </dt>
                <dd className="text-[var(--text-primary)]">Guilherme &amp; Victor</dd>
              </div>
              <div className="py-3 sm:pl-3 space-y-1">
                <dt className="text-[10px] font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  STATUS
                </dt>
                <dd className="font-tabular text-[#7AA6C7]">Homologado S-1.3</dd>
              </div>
            </dl>

            {/* Pull Quote */}
            <div className="py-4 border-b border-[var(--border-hairline)]">
              <p className="font-editorial italic text-xl sm:text-2xl text-[var(--text-primary)] leading-relaxed [text-wrap:balance]">
                &ldquo;{dossier.pullQuote}&rdquo;
              </p>
            </div>

            {/* Drop-Cap Synthesis Prose */}
            <div className="space-y-4">
              <div className="text-[10px] font-tabular uppercase tracking-[0.22em] text-[#68B2A0]">
                SÍNTESE NORMATIVA &amp; ENGENHARIA DE CONFORMIDADE
              </div>
              <p
                className={`${
                  largeReadingMode ? 'text-base leading-[1.9]' : 'text-xs sm:text-sm leading-[1.85]'
                } text-[var(--text-secondary)] max-w-prose first-letter:text-4xl first-letter:font-editorial first-letter:text-[var(--text-primary)] first-letter:float-left first-letter:mr-3 first-letter:leading-none`}
              >
                {dossier.synthesis}
              </p>
            </div>

            {/* Interactive Technical Audit Checklist */}
            <div className="border border-[var(--border-hairline)] bg-[var(--bg-elevated)]/60 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-tabular uppercase tracking-[0.22em] text-[#68B2A0]">
                  PROTOCOLO DE VERIFICAÇÃO EM AUDITORIA ({checkedAuditIndices.length}/
                  {dossier.auditChecklist.length})
                </span>
                <span className="text-[10px] font-tabular text-[var(--text-muted)]">
                  INTERATIVO
                </span>
              </div>

              <div className="space-y-2.5" role="group" aria-label="Checklist de auditoria normativa">
                {dossier.auditChecklist.map((point, idx) => {
                  const isChecked = checkedAuditIndices.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => handleToggleChecklist(idx)}
                      className="w-full text-left flex items-start gap-3 py-1.5 group"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#68B2A0] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#68B2A0] shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs leading-relaxed transition-colors ${
                          isChecked
                            ? 'text-[var(--text-primary)] font-medium'
                            : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {point}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Citation & Cross-Search Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCitation}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-tabular uppercase tracking-[0.16em] border border-[var(--border-hairline)] hover:border-[#68B2A0] text-[var(--text-primary)] hover:text-[#68B2A0] transition-colors whitespace-nowrap"
              >
                {copiedCitation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#68B2A0]" />
                    <span className="text-[#68B2A0]">Citação Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#68B2A0]" />
                    <span>Copiar Citação Normativa</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCommandPalette();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-tabular uppercase tracking-[0.16em] text-[#7AA6C7] hover:text-[#68B2A0] underline underline-offset-4 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pesquisar no Acervo Geral (⌘K)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Prev / Next Dossier Navigation Bar */}
          <div className="sticky bottom-0 z-20 bg-[var(--bg-canvas)]/95 backdrop-blur-md border-t border-[var(--border-hairline)] grid grid-cols-2 divide-x divide-[var(--border-hairline)]">
            <button
              type="button"
              onClick={() => onSelectDossierCode(prevDossier.code)}
              className="p-4 text-left hover:bg-[var(--bg-elevated)] transition-colors flex items-center gap-3 group"
            >
              <ChevronLeft className="w-4 h-4 text-[#68B2A0] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  ANTERIOR · {prevDossier.code}
                </div>
                <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {prevDossier.title}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSelectDossierCode(nextDossier.code)}
              className="p-4 text-right hover:bg-[var(--bg-elevated)] transition-colors flex items-center justify-end gap-3 group"
            >
              <div className="overflow-hidden">
                <div className="text-[10px] font-tabular uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  PRÓXIMO · {nextDossier.code}
                </div>
                <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {nextDossier.title}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#68B2A0] shrink-0" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
