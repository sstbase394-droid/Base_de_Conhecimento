/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import {
  isValidCorporateEmail,
  isValidCnpjFormat,
  sanitizeTextInput,
} from '../utils/sstCalculations';
import { useModalEscape } from '../hooks/useInteractiveHooks';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const timersRef = useRef<number[]>([]);

  const clearPendingTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
    return () => clearPendingTimers();
  }, [initialMode, isOpen]);

  useModalEscape(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const sanitizedEmail = sanitizeTextInput(email, 160);
    const sanitizedCompany = sanitizeTextInput(company, 140);

    if (!isValidCorporateEmail(sanitizedEmail)) {
      setErrorMsg('Por favor, informe um e-mail corporativo válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    if (mode === 'register') {
      if (!sanitizedCompany) {
        setErrorMsg('Por favor, preencha a razão social ou consultoria.');
        return;
      }
      if (!isValidCnpjFormat(cnpj)) {
        setErrorMsg('Informe um CNPJ válido com 14 dígitos (ex: 12.345.678/0001-90).');
        return;
      }
    }

    setIsSubmitting(true);
    clearPendingTimers();

    const stepOneTimer = window.setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(
        mode === 'login'
          ? 'Autenticação autorizada com sucesso! Redirecionando...'
          : 'Credenciamento corporativo concluído! Bem-vindo à Base de Conhecimento.'
      );
      const stepTwoTimer = window.setTimeout(() => {
        onSuccess(sanitizedEmail);
        onClose();
      }, 900);
      timersRef.current.push(stepTwoTimer);
    }, 450);

    timersRef.current.push(stepOneTimer);
  };

  const handleQuickDemo = () => {
    setEmail('gestor.sst@corporativo.com.br');
    setPassword('senha_segura_2026');
    setCompany('Engenharia & Saúde Ocupacional S.A.');
    setCnpj('12.345.678/0001-90');
    setErrorMsg('');
    setSuccessMsg('Credenciais de demonstração preenchidas.');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06090E]/75 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl atelier-glass-pill overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta Corporativa'}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 border-b border-[var(--border-hairline)]">
          <div
            role="tablist"
            aria-label="Modo de autenticação"
            className="flex items-center gap-1 p-1 rounded-full border border-[var(--border-hairline)] overflow-x-auto max-w-full"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#3D9488] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Entrar (/login)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#3D9488] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Criar Conta (/cadastro)
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de autenticação"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-8 space-y-5 overflow-y-auto max-h-[80vh]">
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl font-medium text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#68B2A0] shrink-0" />
              <span>
                {mode === 'login' ? 'Acesso ao Ecossistema SST' : 'Credenciamento Corporativo'}
              </span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {mode === 'login'
                ? 'Insira suas credenciais corporativas ou utilize o Certificado Digital ICP-Brasil.'
                : 'Acesso integral às trilhas de mensageria eSocial, matrizes do GRO e suporte técnico.'}
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 text-xs text-[#7AA6C7] bg-[#4E81A8]/15 border border-[#4E81A8]/35 rounded-xl"
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 text-xs text-[#68B2A0] bg-[#3D9488]/15 border border-[#3D9488]/35 rounded-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#68B2A0] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label
                    htmlFor="auth-company-input"
                    className="block text-[10px] font-tabular uppercase tracking-widest text-[var(--text-muted)] mb-1.5"
                  >
                    Razão Social ou Consultoria
                  </label>
                  <input
                    id="auth-company-input"
                    type="text"
                    autoComplete="organization"
                    maxLength={140}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="SegurPrev Engenharia Ocupacional S.A."
                    className="w-full min-h-[44px] py-2 text-base sm:text-xs text-[var(--text-primary)] bg-transparent border-b border-[var(--border-hairline)] focus:border-[#68B2A0] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-cnpj-input"
                    className="block text-[10px] font-tabular uppercase tracking-widest text-[var(--text-muted)] mb-1.5"
                  >
                    CNPJ Corporativo
                  </label>
                  <input
                    id="auth-cnpj-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={18}
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full min-h-[44px] py-2 text-base sm:text-xs text-[var(--text-primary)] bg-transparent border-b border-[var(--border-hairline)] focus:border-[#68B2A0] focus:outline-none font-tabular transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="auth-email-input"
                className="block text-[10px] font-tabular uppercase tracking-widest text-[var(--text-muted)] mb-1.5"
              >
                E-mail Corporativo
              </label>
              <input
                id="auth-email-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="diretoria@empresa.com.br"
                className="w-full min-h-[44px] py-2 text-base sm:text-xs text-[var(--text-primary)] bg-transparent border-b border-[var(--border-hairline)] focus:border-[#68B2A0] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password-input"
                  className="text-[10px] font-tabular uppercase tracking-widest text-[var(--text-muted)]"
                >
                  Senha de Acesso
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() =>
                      setSuccessMsg(
                        'Instruções de redefinição enviadas para o seu e-mail corporativo.'
                      )
                    }
                    className="min-h-[36px] px-1 text-[10px] text-[#68B2A0] hover:underline cursor-pointer"
                  >
                    Recuperar acesso
                  </button>
                )}
              </div>
              <input
                id="auth-password-input"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] py-2 text-base sm:text-xs text-[var(--text-primary)] bg-transparent border-b border-[var(--border-hairline)] focus:border-[#68B2A0] focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3 px-5 text-xs font-medium text-white bg-spectral-gradient hover:opacity-95 rounded-full shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>
                {mode === 'login' ? 'Entrar no Ambiente Seguro' : 'Concluir Credenciamento'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="min-h-[44px] text-[11px] text-[var(--text-secondary)] hover:text-[#68B2A0] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#68B2A0] shrink-0" />
              <span>Preencher com credenciais de demonstração</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
