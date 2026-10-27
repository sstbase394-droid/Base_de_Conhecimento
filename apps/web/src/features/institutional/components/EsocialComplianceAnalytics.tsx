/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  EsocialCompliancePeriod,
  EsocialEventFilter,
  ESOCIAL_EVENT_BREAKDOWNS,
  getEsocialComplianceDataset,
  calculateEsocialComplianceSummary,
} from '../utils/sstCalculations';
import { useCardSpotlight } from '../hooks/useInteractiveHooks';

type ChartVisualizationMode = 'area' | 'bars' | 'audit';

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}

const FrostedChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="atelier-glass rounded-xl p-3.5 min-w-[210px] border border-[var(--border-glass)] shadow-xl backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">{label}</span>
        <span>eSocial S-1.3</span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const isPercentage =
            String(entry.dataKey).includes('Pct') || String(entry.name).includes('%');
          return (
            <div
              key={`${entry.dataKey ?? index}`}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <span className="text-[var(--text-secondary)]">{entry.name}</span>
              <strong className="font-tabular text-[var(--text-primary)]">
                {typeof entry.value === 'number'
                  ? isPercentage
                    ? `${entry.value.toFixed(1)}%`
                    : entry.value.toLocaleString('pt-BR')
                  : entry.value}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const EsocialComplianceAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<EsocialCompliancePeriod>('6m');
  const [eventFilter, setEventFilter] = useState<EsocialEventFilter>('ALL');
  const [chartMode, setChartMode] = useState<ChartVisualizationMode>('area');

  const dataset = useMemo(() => getEsocialComplianceDataset(period), [period]);
  const summary = useMemo(
    () => calculateEsocialComplianceSummary(dataset, eventFilter),
    [dataset, eventFilter]
  );

  const handleCardSpotlightMove = useCardSpotlight(false);

  return (
    <div
      id="telemetria-esocial"
      data-testid="esocial-compliance-analytics"
      className="relative space-y-8 2xl:space-y-10 pt-10"
    >
      {/* Top Editorial Header & Segmented Controls */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="font-editorial text-3xl sm:text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] leading-[1.12]">
            Indicadores de conformidade no{' '}
            <span className="italic font-light text-[var(--accent-editorial)]">eSocial.</span>
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose">
            Acompanhamento histórico dos lotes transmitidos ao ambiente nacional (S-2210, S-2220,
            S-2221 e S-2240), prazos regulamentares e consistência entre o PGR e o LTCAT.
          </p>
        </div>

        {/* Clean Segmented Controls (Mobile-First >= 44px Hitboxes) */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Período de análise"
            className="inline-flex flex-wrap items-center p-1 rounded-xl atelier-glass gap-1 max-w-full"
          >
            {(
              [
                { id: '6m', label: '6 meses' },
                { id: 'ytd', label: 'Ano 2026' },
                { id: '12m', label: '12 meses' },
              ] as const
            ).map((item) => {
              const active = period === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  data-testid={`esocial-period-${item.id}`}
                  onClick={() => setPeriod(item.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-spectral-gradient text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Modo de visualização do gráfico"
            className="inline-flex flex-wrap items-center p-1 rounded-xl atelier-glass gap-1 max-w-full"
          >
            {(
              [
                { id: 'area', label: 'Taxa de aceite' },
                { id: 'bars', label: 'Volume por evento' },
                { id: 'audit', label: 'Revisão prévia' },
              ] as const
            ).map((mode) => {
              const active = chartMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={active}
                  data-testid={`esocial-mode-${mode.id}`}
                  onClick={() => setChartMode(mode.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-spectral-gradient text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Filter Bar (Clean Segmented Buttons + Unboxed Metadata) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtro por evento do eSocial">
          {(
            [
              { id: 'ALL', label: 'Todos os eventos' },
              { id: 'S-2240', label: 'S-2240 · Fatores de Risco' },
              { id: 'S-2220', label: 'S-2220 · Saúde (ASO)' },
              { id: 'S-2221', label: 'S-2221 · Toxicológico' },
              { id: 'S-2210', label: 'S-2210 · CAT' },
            ] as const
          ).map((ev) => {
            const isSelected = eventFilter === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                aria-pressed={isSelected}
                data-testid={`esocial-filter-${ev.id}`}
                data-glass-active={isSelected}
                onMouseMove={handleCardSpotlightMove}
                onClick={() => setEventFilter(ev.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-spectral-gradient text-white font-medium'
                    : 'glass-interactive-tile text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {ev.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-[var(--text-muted)]">
          <span>Escopo selecionado</span>
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          <span className="text-[var(--text-primary)] font-medium">
            {summary.activeSeriesLabel}
          </span>
        </div>
      </div>

      {/* 4 Frosted-Glass Summary Cards (Clean Unboxed Metadata, No Pill Sandwiches) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
        <div
          onMouseMove={handleCardSpotlightMove}
          className="glass-interactive-tile p-5 2xl:p-6 flex flex-col justify-between space-y-3"
        >
          <span className="text-xs text-[var(--text-muted)]">
            Aceite no webservice e-CAC
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-average-compliance"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.averageCompliancePct.toFixed(1)}%
            </strong>
            <span className="text-xs font-tabular text-[var(--accent-editorial)]">
              +{summary.complianceDeltaPct.toFixed(1)}% no período
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Proporção de lotes validados na primeira transmissão sem erro de schema.
          </p>
        </div>

        <div
          onMouseMove={handleCardSpotlightMove}
          className="glass-interactive-tile p-5 2xl:p-6 flex flex-col justify-between space-y-3"
        >
          <span className="text-xs text-[var(--text-muted)]">
            Cumprimento do prazo legal
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-average-sla"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.averageSlaPct.toFixed(1)}%
            </strong>
            <span className="text-xs text-[var(--text-muted)]">Dia 15 · 24h CAT</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Envios concluídos antes do fechamento mensal e dentro do prazo da CAT.
          </p>
        </div>

        <div
          onMouseMove={handleCardSpotlightMove}
          className="glass-interactive-tile p-5 2xl:p-6 flex flex-col justify-between space-y-3"
        >
          <span className="text-xs text-[var(--text-muted)]">Eventos homologados</span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-total-events"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.totalValidatedEvents.toLocaleString('pt-BR')}
            </strong>
            <span className="text-xs text-[var(--text-muted)]">ICP-Brasil A1</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Registros assinados digitalmente que compõem o histórico do PPP Eletrônico.
          </p>
        </div>

        <div
          onMouseMove={handleCardSpotlightMove}
          className="glass-interactive-tile p-5 2xl:p-6 flex flex-col justify-between space-y-3"
        >
          <span className="text-xs text-[var(--text-muted)]">
            Inconsistências corrigidas
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-prevented-rejections"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.totalPreventedRejections.toLocaleString('pt-BR')}
            </strong>
            <span className="text-xs text-[var(--text-muted)]">Revisão prévia</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Divergências entre PGR, LTCAT e validade de CA ajustadas antes do envio.
          </p>
        </div>
      </div>

      {/* Main 12-Column Recharts Frosted-Glass Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-stretch">
        {/* Left 8 Columns: Primary Recharts Canvas */}
        <div
          onMouseMove={handleCardSpotlightMove}
          className="lg:col-span-8 mzia-frame p-6 sm:p-8 2xl:p-10 flex flex-col justify-between space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div className="space-y-1">
              <h4 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)]">
                {chartMode === 'area' && 'Evolução da conformidade e tempestividade'}
                {chartMode === 'bars' && 'Volume mensal de eventos transmitidos'}
                {chartMode === 'audit' && 'Inconsistências revisadas versus taxa de aceite'}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {chartMode === 'area' && 'Comparativo mensal entre validação técnica e envio no prazo'}
                {chartMode === 'bars' && 'Distribuição entre S-2240, S-2220, S-2221 e S-2210'}
                {chartMode === 'audit' && 'Impacto da revisão documental prévia na recepção do eSocial'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              {chartMode === 'area' && (
                <>
                  <span>Conformidade (%)</span>
                  <span aria-hidden="true">·</span>
                  <span>Prazo legal (%)</span>
                </>
              )}
              {chartMode === 'bars' && (
                <>
                  <span>S-2240</span>
                  <span aria-hidden="true">·</span>
                  <span>S-2220</span>
                  <span aria-hidden="true">·</span>
                  <span>S-2221 / S-2210</span>
                </>
              )}
              {chartMode === 'audit' && (
                <>
                  <span>Revisões</span>
                  <span aria-hidden="true">·</span>
                  <span>Conformidade (%)</span>
                </>
              )}
            </div>
          </div>

          <div
            className="w-full h-[320px] sm:h-[360px] 2xl:h-[380px]"
            data-testid="recharts-primary-canvas"
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart
                  data={dataset}
                  margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="sageComplianceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E665A" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#2E665A" stopOpacity={0.01} />
                    </linearGradient>
                    <linearGradient id="fjordSlaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A728A" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#4A728A" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(120, 125, 132, 0.14)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'rgba(120, 125, 132, 0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[92, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<FrostedChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="conformidadePct"
                    name="Conformidade (%)"
                    stroke="#2E665A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#sageComplianceGrad)"
                    activeDot={{ r: 5, stroke: '#2E665A', strokeWidth: 2, fill: '#FAF9F6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="slaTempestividadePct"
                    name="No prazo (%)"
                    stroke="#4A728A"
                    strokeWidth={1.75}
                    fillOpacity={1}
                    fill="url(#fjordSlaGrad)"
                    activeDot={{ r: 4, stroke: '#4A728A', strokeWidth: 2, fill: '#FAF9F6' }}
                  />
                </AreaChart>
              ) : chartMode === 'bars' ? (
                <BarChart
                  data={dataset}
                  margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(120, 125, 132, 0.14)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'rgba(120, 125, 132, 0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<FrostedChartTooltip />} />
                  {(eventFilter === 'ALL' || eventFilter === 'S-2240') && (
                    <Bar
                      dataKey="s2240Risco"
                      name="S-2240 (Condições Ambientais)"
                      fill="#2E665A"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {(eventFilter === 'ALL' || eventFilter === 'S-2220') && (
                    <Bar
                      dataKey="s2220Aso"
                      name="S-2220 (Monitoramento ASO)"
                      fill="#4A728A"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {(eventFilter === 'ALL' || eventFilter === 'S-2221') && (
                    <Bar
                      dataKey="s2221Tox"
                      name="S-2221 (Exame Toxicológico)"
                      fill="#6E8A9C"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  {(eventFilter === 'ALL' || eventFilter === 'S-2210') && (
                    <Bar
                      dataKey="s2210Cat"
                      name="S-2210 (CAT)"
                      fill="#94A3B8"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </BarChart>
              ) : (
                <ComposedChart
                  data={dataset}
                  margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(120, 125, 132, 0.14)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={{ stroke: 'rgba(120, 125, 132, 0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[94, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<FrostedChartTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey="rejeicoesPrevenidas"
                    name="Inconsistências corrigidas"
                    fill="#2E665A"
                    radius={[5, 5, 0, 0]}
                    barSize={24}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conformidadePct"
                    name="Conformidade (%)"
                    stroke="#4A728A"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#4A728A' }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span>Referência normativa: Manual de Orientação do eSocial (versão S-1.3) · NR-01 e NR-07</span>
            <span>Dados consolidados por competência</span>
          </div>
        </div>

        {/* Right 4 Columns: Breakdown by eSocial Layout */}
        <div
          onMouseMove={handleCardSpotlightMove}
          className="lg:col-span-4 mzia-frame p-6 sm:p-8 2xl:p-10 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-1 border-b border-[var(--border-hairline)] pb-4">
            <h4 className="font-editorial text-2xl text-[var(--text-primary)]">
              Desempenho por evento
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Selecione um evento abaixo para isolar sua série histórica
            </p>
          </div>

          {/* Horizontal Recharts Bar Comparison */}
          <div className="w-full h-[135px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...ESOCIAL_EVENT_BREAKDOWNS]}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis type="number" domain={[95, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="code"
                  width={54}
                  tick={{ fill: '#767B82', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<FrostedChartTooltip />} />
                <Bar
                  dataKey="compliancePct"
                  name="Conformidade (%)"
                  radius={[0, 6, 6, 0]}
                  barSize={14}
                >
                  {ESOCIAL_EVENT_BREAKDOWNS.map((entry, idx) => {
                    const tones = ['#2E665A', '#4A728A', '#6E8A9C', '#94A3B8'];
                    return <Cell key={entry.code} fill={tones[idx % tones.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Frosted Event Breakdown Cards */}
          <div className="space-y-2.5">
            {ESOCIAL_EVENT_BREAKDOWNS.map((item) => {
              const isSelected = eventFilter === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  data-glass-active={isSelected}
                  onMouseMove={handleCardSpotlightMove}
                  onClick={() =>
                    setEventFilter((prev) => (prev === item.code ? 'ALL' : item.code))
                  }
                  className="w-full text-left glass-interactive-tile p-3.5 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-tabular text-xs font-semibold text-[var(--text-primary)]">
                        {item.code}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]">
                        ·
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] truncate">
                        {item.name}
                      </span>
                    </div>
                    <strong className="font-tabular text-xs text-[var(--text-primary)]">
                      {item.compliancePct.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-1">
                    <span>{item.slaDeadline}</span>
                    <span>{item.preventedDivergences} revisões</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
