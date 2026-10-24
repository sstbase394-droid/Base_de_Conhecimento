'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/ui/Logo';
import { Moon, Sun, ArrowRight } from 'lucide-react';

export interface InstitutionalNavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isAuthenticated?: boolean;
}

/**
 * InstitutionalNavbar: Barra de navegação institucional.
 * Utiliza exatamente a classe `.app-header` nativa do projeto (`nav.css`)
 * para manter 100% de consistência de dimensões, altura (--hdr-h: 3.5rem),
 * paddings, raios e efeitos de vidro (Liquid Glass) do restante da aplicação.
 */
export function InstitutionalNavbar({
  isDarkMode,
  onToggleTheme,
  isAuthenticated = false,
}: InstitutionalNavbarProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let lastY = window.scrollY;
    let frame = 0;
    let scrolled = false;
    let hidden = false;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const nextScrolled = y > 24;
      let nextHidden = hidden;

      if (y < 60) {
        nextHidden = false;
      } else if (y > lastY + 6) {
        nextHidden = true; // Rolar para baixo rápido esconde
      } else if (y < lastY - 4) {
        nextHidden = false; // Rolar para cima revela
      }
      lastY = y;

      if (nextScrolled !== scrolled) {
        scrolled = nextScrolled;
        header.toggleAttribute('data-scrolled', scrolled);
      }
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        header.toggleAttribute('data-hidden', hidden);
      }
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={headerRef} className="app-header justify-between" aria-label="Cabeçalho institucional">
      {/* Brand / Logo */}
      <Link href="/" className="app-header-brand" aria-label="Página inicial institucional">
        <LogoMark size={26} className="app-header-brand-mark" />
        <span className="app-header-brand-text">
          Base <span className="app-header-brand-accent">SST</span>
        </span>
      </Link>

      {/* Links Centrais Editoriais */}
      <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-text-muted">
        <Link
          href="/#visao-geral"
          className="px-3.5 py-1.5 rounded-full hover:text-text-main hover:bg-border/30 transition-colors"
        >
          Visão Geral
        </Link>
        <Link
          href="/#demonstracao"
          className="px-3.5 py-1.5 rounded-full hover:text-text-main hover:bg-border/30 transition-colors"
        >
          Demonstração
        </Link>
        <Link
          href="/#recursos"
          className="px-3.5 py-1.5 rounded-full hover:text-text-main hover:bg-border/30 transition-colors"
        >
          Recursos
        </Link>
        <Link
          href="/#planos"
          className="px-3.5 py-1.5 rounded-full hover:text-text-main hover:bg-border/30 transition-colors"
        >
          Planos
        </Link>
        <Link
          href="/sobre"
          className="px-3.5 py-1.5 rounded-full hover:text-text-main hover:bg-border/30 transition-colors"
        >
          Sobre
        </Link>
      </nav>

      {/* Ações Direitas: Tema + Entrar / Cadastro */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="nav-icon-button"
          aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onClick={onToggleTheme}
        >
          {isDarkMode ? <Sun size={18} strokeWidth={1.6} /> : <Moon size={18} strokeWidth={1.6} />}
        </button>

        {isAuthenticated ? (
          <Link
            href="/artigos"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-text-main text-bg-main hover:opacity-90 transition-opacity"
          >
            <span>Acessar Acervo</span>
            <ArrowRight size={13} />
          </Link>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login?next=/artigos"
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-text-muted hover:text-text-main transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro?next=/artigos"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-text-main text-bg-main hover:opacity-90 transition-opacity"
            >
              <span>Experimentar</span>
              <ArrowRight size={13} className="hidden sm:inline" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
