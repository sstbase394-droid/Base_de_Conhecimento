/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, X, ArrowUpRight, Search } from 'lucide-react';
import { SunburstEmblem } from './SunburstEmblem';
import {
  calculateReadingProgress,
  evaluateSmartNavbarScroll,
} from '../utils/sstCalculations';

export interface InstitutionalNavbarProps {
  activeSection: string;
  themeMode: 'alabaster' | 'noir';
  onToggleTheme: () => void;
  onOpenLogin: () => void;
  onOpenSearch?: () => void;
  isNotFoundView?: boolean;
  onNavigateHome?: (targetHash?: string) => void;
}

const NAV_LINKS = [
  { label: 'A Ideia', href: '#ideia', id: 'ideia' },
  { label: 'Cadernos', href: '#ensaio', id: 'ensaio' },
  { label: 'Acervo SST', href: '#modulos', id: 'modulos' },
  { label: 'Pesquisa', href: '#tecnologia', id: 'tecnologia' },
  { label: 'Dúvidas', href: '#faq', id: 'faq' },
] as const;

export const InstitutionalNavbar: React.FC<InstitutionalNavbarProps> = ({
  activeSection,
  themeMode,
  onToggleTheme,
  onOpenLogin,
  onOpenSearch,
  isNotFoundView = false,
  onNavigateHome,
}) => {
  const [atTop, setAtTop] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const isHiddenRef = useRef(false);
  const atTopRef = useRef(true);
  const isElevatedRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);

  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
    if (mobileMenuOpen && isHiddenRef.current) {
      isHiddenRef.current = false;
      setIsHidden(false);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key or viewport resize to desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpenRef.current) {
        setMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpenRef.current) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const barEl = progressBarRef.current;
    let rafId = 0;

    const updateOnScroll = () => {
      rafId = 0;
      const currentY = window.scrollY;

      const nextState = evaluateSmartNavbarScroll({
        currentScrollY: currentY,
        prevScrollY: lastScrollYRef.current,
        prevHidden: isHiddenRef.current,
        mobileMenuOpen: mobileMenuOpenRef.current,
        threshold: 8,
        topOffset: 16,
      });

      lastScrollYRef.current = nextState.lastScrollY;

      if (nextState.atTop !== atTopRef.current) {
        atTopRef.current = nextState.atTop;
        setAtTop(nextState.atTop);
      }
      if (nextState.isHidden !== isHiddenRef.current) {
        isHiddenRef.current = nextState.isHidden;
        setIsHidden(nextState.isHidden);
      }
      if (nextState.isElevated !== isElevatedRef.current) {
        isElevatedRef.current = nextState.isElevated;
        setIsElevated(nextState.isElevated);
      }

      if (barEl) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = calculateReadingProgress(currentY, maxScroll);
        barEl.style.transform = `scaleX(${(pct / 100).toFixed(4)})`;
      }
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateOnScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateOnScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const isNoir = themeMode === 'noir';
  const effectiveHidden = isHidden && !mobileMenuOpen;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (isNotFoundView && onNavigateHome) {
      e.preventDefault();
      onNavigateHome(href);
    }
  };

  return (
    <header
      data-testid="smart-navbar"
      data-navbar-state={effectiveHidden ? 'hidden' : isElevated ? 'elevated' : 'top'}
      className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-[transform,opacity,background-color,box-shadow,border-color,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-b focus-within:translate-y-0 ${
        effectiveHidden
          ? '-translate-y-full opacity-95 pointer-events-none'
          : 'translate-y-0 opacity-100'
      } ${
        isElevated || mobileMenuOpen
          ? 'bg-[var(--bg-glass-strong)] backdrop-blur-2xl border-[var(--border-hairline)] shadow-[0_14px_34px_-12px_rgba(0,0,0,0.22)] py-2.5 sm:py-3.5 2xl:py-4'
          : atTop
          ? 'bg-[var(--bg-glass)] backdrop-blur-md border-transparent shadow-none py-3.5 sm:py-4.5 2xl:py-5'
          : 'bg-[var(--bg-glass-strong)] backdrop-blur-xl border-[var(--border-hairline)] py-3 sm:py-3.5'
      }`}
    >
      <nav
        role="navigation"
        aria-label="Navegação Institucional"
        className="w-full max-w-[1920px] 3xl:max-w-[2160px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-40 flex items-center justify-between gap-4 lg:gap-8"
      >
        {/* Zone 1: Single-line Editorial Brand Wordmark with Sunburst Emblem */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, '#hero')}
          data-testid="brand-wordmark"
          className="font-editorial text-lg sm:text-2xl 2xl:text-[26px] font-medium tracking-[-0.01em] text-[var(--text-primary)] whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
        >
          <SunburstEmblem size={24} strokeColor="var(--accent-ochre)" dotColor="var(--accent-ochre)" />
          <span>Base de Conhecimento</span>
        </a>

        {/* Zone 2: 5 Clean Single-Line Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 xl:gap-8 2xl:gap-10 text-[13px] 2xl:text-sm font-normal">
          {NAV_LINKS.map((link) => {
            const isActive = !isNotFoundView && activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative min-h-[44px] inline-flex items-center py-1 transition-colors duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1.5 left-0 right-0 h-[1px] bg-[var(--text-primary)]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Zone 3: Minimal Utility Icons + Primary Action (All >= 44x44px Touch Targets) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Pesquisar no Acervo (Ctrl+K)"
              title="Pesquisar no Acervo (Ctrl+K)"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isNoir ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            title={isNoir ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isNoir ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-primary)] glass-interactive-tile hover:opacity-90 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Entrar</span>
          </button>

          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl glass-interactive-tile cursor-pointer"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
            aria-controls="smart-navbar-mobile-drawer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Subtle Reading Progress Hairline */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent overflow-hidden pointer-events-none"
      >
        <div
          ref={progressBarRef}
          style={{
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
          }}
          className="h-full w-full bg-[var(--accent-editorial)] opacity-60 will-change-transform"
        />
      </div>

      {/* Mobile Drawer (Locks Auto-Hide When Open & Ensures >= 44px Hitboxes) */}
      {mobileMenuOpen && (
        <div
          id="smart-navbar-mobile-drawer"
          role="region"
          aria-label="Menu de navegação móvel"
          className="fixed inset-x-3 sm:inset-x-6 top-[4.25rem] p-5 sm:p-6 rounded-2xl atelier-glass-pill lg:hidden flex flex-col gap-3 text-sm z-50 shadow-2xl border border-[var(--border-glass)]"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex flex-col divide-y divide-[var(--border-hairline)]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="flex items-center justify-between min-h-[48px] py-3 px-2 text-[var(--text-primary)] hover:text-[var(--accent-editorial)] transition-colors"
              >
                <span className="font-medium">{link.label}</span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-xl text-center text-xs font-medium glass-interactive-tile text-[var(--text-primary)] inline-flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-[var(--accent-editorial)]" />
                <span>Buscar no Acervo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-xl text-center text-xs font-medium bg-spectral-gradient"
            >
              Entrar na Plataforma
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
