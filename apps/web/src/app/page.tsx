'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Layers,
  CheckCircle2,
  Lock,
  SlidersHorizontal,
  ChevronRight,
  Palette,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ButtonLink } from '@/components/ui/Button';
import { FAQ_DATA } from '@/features/articles/catalog';
import { Category } from '@/features/articles/types';
import { MAINTAINERS } from '@/features/sobre/about-content';
import { MaintainerProfile } from '@/features/sobre/components/People';

// Carregamento sob demanda do 3D contido estritamente em uma vitrine proporcional
const Interactive3DHero = dynamic(
  () => import('@/components/3d/Interactive3DHero').then((m) => m.Interactive3DHero),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center opacity-30">
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-text-muted animate-spin" />
      </div>
    ),
  }
);

// Dados dinâmicos do catálogo de referência
const ARTICLES = FAQ_DATA.filter((item) => item.category !== Category.SOBRE);
const TOTAL_ARTICLES = ARTICLES.length;
const MODULES = Object.values(Category).filter((c) => c !== Category.SOBRE);

export default function HomePage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const revealElements = gsap.utils.toArray<HTMLElement>('.editorial-card');
        revealElements.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: mainRef }
  );

  return (
    <div ref={mainRef} className="w-full flex flex-col gap-24 sm:gap-32 py-6 max-w-6xl mx-auto">
      {/* ── 1. HERO SECTION (Layout Editorial Inspirado na Northline Atelier / Oura) ── */}
      <section id="visao-geral" className="w-full pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Esquerdo: Tipografia Editorial Pura e Firme */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted mb-4 border-b border-border/80 pb-1">
              Plataforma SaaS de Central de Conhecimento
            </span>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-text-main leading-[1.1]">
              Reduza chamados e dê autonomia aos seus clientes.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-text-muted font-light leading-relaxed max-w-xl">
              Crie, personalize e publique bases de conhecimento corporativas. Busca instantânea tolerante a erros, design refinado e leitura limpa em um único ambiente.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink
                href="/artigos"
                variant="primary"
                className="!rounded-full px-7 py-3 text-sm font-semibold shadow-sm group"
              >
                <span>Ver Demonstração Ao Vivo</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </ButtonLink>
              <ButtonLink
                href="/cadastro?next=/artigos"
                variant="secondary"
                className="!rounded-full px-7 py-3 text-sm font-medium"
              >
                <span>Criar Conta Gratuita</span>
              </ButtonLink>
            </div>
          </div>

          {/* Lado Direito: Caixa Gráfica Contida com Objeto 3D Delimitado */}
          <div className="lg:col-span-5 w-full">
            <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl border border-border bg-bg-island overflow-hidden shadow-xs flex items-center justify-center">
              {/* O objeto 3D agora vive dentro da moldura editorial, sem vazar para o fundo */}
              <Interactive3DHero className="w-full h-full" />
              <div className="absolute bottom-3 right-4 text-[10px] font-mono text-text-muted uppercase tracking-widest pointer-events-none">
                WebGL 360º Scrubbing
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Métricas Editoriais (Estilo Linha Northline Atelier) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 border-y border-border py-6 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="px-4 py-3 md:py-0 text-center">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-text-main">-70%</p>
            <p className="text-xs uppercase tracking-wider text-text-muted mt-1 font-mono">Chamados Repetitivos</p>
          </div>
          <div className="px-4 py-3 md:py-0 text-center">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-text-main">&lt; 100ms</p>
            <p className="text-xs uppercase tracking-wider text-text-muted mt-1 font-mono">Busca Instantânea</p>
          </div>
          <div className="px-4 py-3 md:py-0 text-center">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-text-main">100%</p>
            <p className="text-xs uppercase tracking-wider text-text-muted mt-1 font-mono">Conformidade LGPD</p>
          </div>
          <div className="px-4 py-3 md:py-0 text-center">
            <p className="text-3xl sm:text-4xl font-serif font-bold text-text-main">24/7</p>
            <p className="text-xs uppercase tracking-wider text-text-muted mt-1 font-mono">Autoatendimento Ativo</p>
          </div>
        </div>
      </section>

      {/* ── 2. RECURSOS (Grid Reto, Limpo e Proporcional) ─────────────────── */}
      <section id="recursos" className="w-full">
        <div className="mb-12 border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Engenharia de Produto
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-text-main mt-1">
              Recursos construídos para clareza e escala
            </h2>
          </div>
          <p className="text-sm text-text-muted max-w-sm">
            Sem distrações: arquitetura focada em velocidade de recuperação da resposta e segurança de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-border bg-bg-island flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-border/40 flex items-center justify-center text-text-main mb-5">
                <Search size={20} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-text-main">Busca Instantânea Inteligente</h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                Algoritmo tolerante a pequenas falhas de digitação e acentuação, acessível de qualquer tela via atalho global Ctrl + K.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-muted">
              Indexação client-side ultra-rápida
            </div>
          </div>

          {/* Card 2 */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-border bg-bg-island flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-border/40 flex items-center justify-center text-text-main mb-5">
                <Palette size={20} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-text-main">Personalização White-Label</h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                Apresente seu conteúdo com sua identidade visual: configure domínio exclusivo, logotipo, paleta e tipografia da sua marca.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-muted">
              Domínio personalizado com SSL
            </div>
          </div>

          {/* Card 3 */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-border bg-bg-island flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-border/40 flex items-center justify-center text-text-main mb-5">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-text-main">Acessibilidade & Modo Zen</h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                Leitura livre de poluição visual, suporte nativo a temas claro/escuro, ajuste tipográfico e compatibilidade total com leitores de tela.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 text-xs font-mono text-text-muted">
              Padrão WCAG 2.1 AA
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. DEMONSTRAÇÃO VIVA (Módulos do Acervo) ──────────────────────── */}
      <section id="demonstracao" className="w-full">
        <div className="mb-12 border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
              Demonstração ao Vivo
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-text-main mt-1">
              Nosso próprio acervo em funcionamento
            </h2>
          </div>
          <ButtonLink href="/artigos" variant="secondary" className="!rounded-full px-5 py-2 text-xs font-semibold shrink-0">
            <span>Ver Catálogo Completo ({TOTAL_ARTICLES})</span>
            <ChevronRight size={14} className="ml-1" />
          </ButtonLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((module) => {
            const count = ARTICLES.filter((a) => a.category === module).length;
            return (
              <Link
                key={module}
                href={`/artigos?category=${encodeURIComponent(module)}`}
                className="editorial-card p-6 rounded-2xl border border-border bg-bg-island hover:border-text-main/50 transition-colors flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-xl bg-border/40 text-text-main">
                      <Layers size={18} />
                    </span>
                    <span className="text-xs font-mono text-text-muted">{count} artigos</span>
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-text-main group-hover:underline">
                    {module}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                    Orientações, fluxos normativos e respostas fundamentadas para rotinas de {module}.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-text-main">
                  <span>Explorar módulo</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 4. PLANOS E PREÇOS ────────────────────────────────────────────── */}
      <section id="planos" className="w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Transparência
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-text-main mt-1">
            Planos para cada estágio
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Valores acessíveis para pequenas equipes e suporte completo para implementações corporativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Plano Start */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-border bg-bg-island flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-mono text-text-muted">Essencial</p>
              <h3 className="text-2xl font-serif font-bold text-text-main mt-1">Start</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                Ideal para organizar procedimentos básicos com rapidez.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Até 50 procedimentos publicados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Busca instantânea incluída</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Layout responsivo</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-border">
              <ButtonLink href="/cadastro?next=/artigos" variant="secondary" className="w-full justify-center text-xs">
                Começar Grátis
              </ButtonLink>
            </div>
          </div>

          {/* Plano Professional */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border-2 border-text-main bg-bg-island flex flex-col justify-between shadow-sm relative">
            <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-text-main text-bg-main text-[11px] font-semibold uppercase tracking-wider">
              Recomendado
            </span>
            <div>
              <p className="text-xs uppercase font-mono text-text-muted">Escala</p>
              <h3 className="text-2xl font-serif font-bold text-text-main mt-1">Professional</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                Para empresas que querem domínio próprio e identidade customizada.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Procedimentos ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Domínio próprio (ajuda.empresa.com)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Customização visual White-Label</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Múltiplos editores</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-border">
              <ButtonLink href="/cadastro?next=/artigos" variant="primary" className="w-full justify-center text-xs">
                Criar Central Pro
              </ButtonLink>
            </div>
          </div>

          {/* Plano Enterprise */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-border bg-bg-island flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-mono text-text-muted">Corporativo</p>
              <h3 className="text-2xl font-serif font-bold text-text-main mt-1">Enterprise</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">
                Para quem exige migração de dados assistida e suporte prioritário.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Tudo do plano Professional</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>Migração assistida de conteúdo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-text-main shrink-0" />
                  <span>SSO corporativo (SAML/OAuth)</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-border">
              <ButtonLink href="/sobre#contato" variant="secondary" className="w-full justify-center text-xs">
                Falar com Especialistas
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. EQUIPE & ENGENHARIA ────────────────────────────────────────── */}
      <section className="w-full border-t border-border pt-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Equipe Responsável
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-main mt-1">
            Quem Desenvolveu
          </h2>
        </div>

        <div className="space-y-10">
          {MAINTAINERS.map((maintainer, index) => (
            <MaintainerProfile key={maintainer.name} person={maintainer} reverse={index % 2 === 1} />
          ))}
        </div>
      </section>

      {/* ── 6. CTA FINAL LIMPO ────────────────────────────────────────────── */}
      <section className="w-full mb-8">
        <div className="p-8 sm:p-12 rounded-2xl border border-border bg-bg-island text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-main">
            Pronto para transformar sua central de conhecimento?
          </h2>
          <p className="mt-3 text-sm text-text-muted max-w-lg mx-auto">
            Experimente o ambiente completo de leitura e autoatendimento agora mesmo.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <ButtonLink href="/artigos" variant="primary" className="!rounded-full px-7 py-3 text-sm font-semibold">
              <span>Acessar Acervo Demonstrativo</span>
              <ArrowRight size={16} className="ml-2" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
