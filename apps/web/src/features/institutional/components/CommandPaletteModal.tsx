/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, FileText, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { sanitizeTextInput } from '../utils/sstCalculations';
import { useModalEscape } from '../hooks/useInteractiveHooks';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

interface SearchItem {
  id: string;
  category: 'eSocial' | 'GRO & Normas' | 'TI & Operações' | 'Jurídico';
  title: string;
  code: string;
  summary: string;
  tags: readonly string[];
  latencyMs: number;
}

const KNOWLEDGE_BASE: readonly SearchItem[] = [
  {
    id: 's2210',
    category: 'eSocial',
    title: 'Comunicação de Acidente de Trabalho (CAT)',
    code: 'Evento S-2210',
    summary:
      'Transmissão obrigatória até o primeiro dia útil seguinte ao da ocorrência. Em caso de morte, comunicação imediata ao e-CAC.',
    tags: ['CAT', 'Acidente Típico', 'Trajeto', 'eSocial S-2210', 'Prazo Legal'],
    latencyMs: 3.2,
  },
  {
    id: 's2220',
    category: 'eSocial',
    title: 'Monitoramento da Saúde do Trabalhador (ASO)',
    code: 'Evento S-2220',
    summary:
      'Detalhamento de exames clínicos, complementares (admissional, periódico, retorno, demissional) e CRM do médico coordenador.',
    tags: ['ASO', 'PCMSO', 'Exames Complementares', 'S-2220', 'NR-07'],
    latencyMs: 2.8,
  },
  {
    id: 's2221',
    category: 'eSocial',
    title: 'Exame Toxicológico do Motorista Profissional',
    code: 'Evento S-2221',
    summary:
      'Registro do exame toxicológico com janela de detecção mínima de 90 dias para categorias C, D e E (Portaria MTE nº 612/2024).',
    tags: ['Toxicológico', 'Motorista C/D/E', 'Janela 90 dias', 'S-2221'],
    latencyMs: 3.5,
  },
  {
    id: 's2240',
    category: 'eSocial',
    title: 'Condições Ambientais do Trabalho - Fatores de Risco',
    code: 'Evento S-2240',
    summary:
      'Mapeamento de agentes nocivos físicos, químicos e biológicos conforme Tabela 24 do eSocial e código GFIP para aposentadoria especial.',
    tags: ['Tabela 24', 'Fatores de Risco', 'LTCAT', 'PPP Eletrônico', 'S-2240'],
    latencyMs: 4.1,
  },
  {
    id: 'pgr-ltcat',
    category: 'GRO & Normas',
    title: 'Diferenciação Técnica: PGR vs. LTCAT',
    code: 'GRO / NR-01 & Lei 8.213',
    summary:
      'PGR foca em gestão contínua e prevenção trabalhista (NR-01). LTCAT possui finalidade exclusivamente previdenciária para caracterização do PPP.',
    tags: ['PGR', 'LTCAT', 'NR-01', 'Inventário de Riscos', 'Previdenciário'],
    latencyMs: 3.1,
  },
  {
    id: 'insalubridade-periculosidade',
    category: 'GRO & Normas',
    title: 'Matriz Comparativa: Insalubridade (NR-15) vs Periculosidade (NR-16)',
    code: 'NR-15 / NR-16 / CLT',
    summary:
      'Insalubridade: 10%, 20% ou 40% sobre o salário mínimo. Periculosidade: 30% sobre o salário base. Regras de cumulatividade e laudos específicos.',
    tags: ['NR-15', 'NR-16', 'Adicional 30%', 'Grau Máximo 40%', 'CLT Art. 192'],
    latencyMs: 2.9,
  },
  {
    id: 'xml-protocol',
    category: 'TI & Operações',
    title: 'Estrutura XML de Mensageria & Códigos de Retorno e-CAC',
    code: 'Schemas XSD & Webservices',
    summary:
      'Tratativa de erros comuns de recepção e processamento (Código 401, 403, 162), assinatura digital via certificado A1/A3 e regras de lote.',
    tags: ['XML', 'XSD', 'Erro 401', 'Assinatura Digital', 'SOAP e-CAC'],
    latencyMs: 3.9,
  },
  {
    id: 'aposentadoria-especial',
    category: 'Jurídico',
    title: 'Aposentadoria Especial & Enquadramento INSS',
    code: 'Art. 57 Lei 8.213/91',
    summary:
      'Critérios de nocividade contínua, eficácia dos EPIs/EPCs no PPP e jurisprudência pacificada do Tema 555 do STF.',
    tags: ['Tema 555 STF', 'EPI Eficaz', 'Ruído NHO-01', 'PPP', 'INSS'],
    latencyMs: 4.3,
  },
] as const;

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenRegister,
}) => {
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<SearchItem>(KNOWLEDGE_BASE[0]);

  useModalEscape(isOpen, onClose);

  const filteredItems = useMemo(() => {
    const cleanQuery = sanitizeTextInput(query, 100).toLowerCase();
    if (!cleanQuery) return KNOWLEDGE_BASE;
    return KNOWLEDGE_BASE.filter(
      (item) =>
        item.title.toLowerCase().includes(cleanQuery) ||
        item.code.toLowerCase().includes(cleanQuery) ||
        item.summary.toLowerCase().includes(cleanQuery) ||
        item.tags.some((t) => t.toLowerCase().includes(cleanQuery))
    );
  }, [query]);

  useEffect(() => {
    if (filteredItems.length > 0) {
      setSelectedItem(filteredItems[0]);
    }
  }, [filteredItems]);

  if (!isOpen) return null;

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredItems.length === 0) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem?.id);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIndex + 1) % filteredItems.length;
      setSelectedItem(filteredItems[nextIdx]);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
      setSelectedItem(filteredItems[prevIdx]);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06090E]/75 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-3xl rounded-2xl atelier-glass-pill overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Busca Instantânea de Normas e eSocial"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3.5 border-b border-[var(--border-hairline)] bg-[var(--bg-glass)]">
          <Search className="w-5 h-5 text-[var(--accent-ochre)] shrink-0" />
          <input
            type="search"
            inputMode="search"
            aria-label="Buscar normas, eventos do eSocial ou pareceres técnicos"
            maxLength={100}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder="Buscar normas, eventos do eSocial (ex: S-2240, CAT, NR-15)..."
            className="w-full min-h-[44px] bg-transparent text-base sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca instantânea"
            className="min-h-[44px] min-w-[44px] px-3 py-1 text-[10px] font-mono tracking-wider uppercase border border-[var(--border-hairline)] rounded-full hover:border-[var(--accent-ochre)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Latency Strip */}
        <div className="px-6 py-2.5 border-b border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span>
              Documentos filtrados:{' '}
              <strong className="font-tabular text-[var(--text-primary)]">
                {filteredItems.length}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-tabular text-[#68B2A0] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Indexado em memória (&lt; 4ms)
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            Selecione um tópico para inspecionar a ementa
          </span>
        </div>

        {/* Split Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1 min-h-[340px]">
          {/* Left Column */}
          <div
            role="listbox"
            aria-label="Resultados da pesquisa normativa"
            className="md:col-span-6 border-b md:border-b-0 md:border-r border-[var(--border-hairline)] p-3 space-y-1.5 overflow-y-auto max-h-[360px] md:max-h-[440px]"
          >
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-[var(--text-secondary)] text-xs sm:text-sm">
                Nenhum resultado encontrado para &quot;{query}&quot;.
                <p className="mt-1 text-[var(--text-muted)]">
                  Tente buscar por S-2210, S-2240, PGR, ou NR-01.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-ochre-muted)] border-[var(--accent-ochre)]'
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-tabular tracking-wider font-semibold text-[var(--accent-ochre)]">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">{item.category}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column */}
          <div className="md:col-span-6 p-6 flex flex-col justify-between">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--accent-ochre)] font-tabular font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {selectedItem.code}
                  </span>
                  <span className="text-[var(--text-muted)]">{selectedItem.category}</span>
                </div>

                <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)] leading-snug">
                  {selectedItem.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {selectedItem.summary}
                </p>

                <div className="pt-2 text-xs text-[var(--text-muted)] font-tabular">
                  {selectedItem.tags.join(' · ')}
                </div>

                <div className="mt-4 p-4 rounded-xl border border-[#5B8FB9]/25 bg-[#5B8FB9]/[0.06] flex items-start gap-3">
                  <Lock className="w-4 h-4 text-[#5B8FB9] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--text-primary)]">
                      Artigo Completo Protegido
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      Matrizes integrais de risco, modelos de XML e scripts de atendimento
                      exclusivos para membros autenticados.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3 mt-4">
              <span className="text-[11px] text-[var(--text-muted)]">
                Acesso institucional corporativo
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-spectral-gradient rounded-full shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>Desbloquear Acesso</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
