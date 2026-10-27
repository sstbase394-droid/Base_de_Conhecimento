"use client";
import React, { useMemo, useRef, useState } from 'react';
import { AuthSplitLayout } from '@/features/auth/components/AuthSplitLayout';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  register,
  type ProfessionalArea,
} from '@/features/auth/client';
import { displayNameProblem, isValidUsername, normalizeUsername, USERNAME_RULES } from '@/features/auth/identity';
import { useUsernameAvailability } from '@/features/auth/use-username-availability';
import { IdentityFields } from '@/features/auth/components/IdentityFields';
import { ProfileFields } from '@/features/auth/components/ProfileFields';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { TermsConsent } from '@/features/auth/components/TermsConsent';
import {
  signupMessage,
  TERMS_REQUIRED,
  USERNAME_RESERVED,
  USERNAME_TAKEN,
} from '@/features/auth/signup-messages';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/features/legal/documents';
import { hardNavigate } from '@/lib/navigation';
import { evaluatePasswordStrength, isDisposableEmail, sanitizeInput } from '@/features/auth/security';

const LENGTH_MESSAGE = `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres.`;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function RegisterForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [organization, setOrganization] = useState('');
  const [professionalArea, setProfessionalArea] = useState<ProfessionalArea | ''>('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Honeypot anti-bot (invisível para humanos, mas preenchido por robôs)
  const [honeypot, setHoneypot] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const usernameStatus = useUsernameAvailability(username);

  // Análise de força da senha em tempo real
  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(password, username),
    [password, username]
  );

  // Validação do e-mail
  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError('Informe seu email.');
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError('Informe um formato de email válido (ex: seu.nome@empresa.com.br).');
      return false;
    }
    if (isDisposableEmail(trimmed)) {
      setEmailError('Emails temporários ou descartáveis não são permitidos.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Honeypot check
    if (honeypot) {
      return;
    }

    // 1. Validação de Email
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      emailRef.current?.focus();
      return;
    }

    // 2. Validação de Usuário
    const cleanUser = normalizeUsername(username);
    let isUserValid = true;
    if (!cleanUser) {
      setUsernameError('Informe um nome de usuário.');
      isUserValid = false;
    } else if (!isValidUsername(cleanUser)) {
      setUsernameError(USERNAME_RULES);
      isUserValid = false;
    } else if (usernameStatus === 'taken') {
      setUsernameError(USERNAME_TAKEN);
      isUserValid = false;
    } else if (usernameStatus === 'reserved') {
      setUsernameError(USERNAME_RESERVED);
      isUserValid = false;
    }

    // 3. Validação de Nome de Exibição
    const cleanDisplayName = sanitizeInput(displayName);
    const nameProblem = displayNameProblem(cleanDisplayName);
    setDisplayNameError(nameProblem);

    // 4. Validação de Senha
    let isPasswordValid = true;
    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(LENGTH_MESSAGE);
      isPasswordValid = false;
    } else if (passwordStrength.score < 2) {
      setPasswordError('A senha é muito fraca. Adicione números, símbolos ou mais caracteres.');
      isPasswordValid = false;
    } else {
      setPasswordError(null);
    }

    if (password !== confirm) {
      setConfirmError('A confirmação não confere com a senha.');
      isPasswordValid = false;
    } else {
      setConfirmError(null);
    }

    // 5. Termos
    const hasTerms = acceptTerms;
    setTermsError(hasTerms ? null : TERMS_REQUIRED);

    if (!isUserValid || nameProblem || !isPasswordValid || !hasTerms) {
      setError('Por favor, corrija os campos destacados abaixo.');
      if (!isUserValid) usernameRef.current?.focus();
      else if (!isPasswordValid) passwordRef.current?.focus();
      else if (!hasTerms) termsRef.current?.focus();
      return;
    }

    setIsSaving(true);
    const result = await register({
      email: email.trim().toLowerCase(),
      password,
      username: cleanUser,
      displayName: cleanDisplayName,
      acceptTerms,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      organization: sanitizeInput(organization),
      professionalArea: sanitizeInput(professionalArea) as ProfessionalArea,
    });

    if (result.ok) {
      hardNavigate(next);
      return;
    }

    setIsSaving(false);
    if (result.reason === 'username_taken' || result.reason === 'username_reserved') {
      setUsernameError(result.reason === 'username_taken' ? USERNAME_TAKEN : USERNAME_RESERVED);
      usernameRef.current?.focus();
      return;
    }
    if (result.reason === 'email_taken') {
      setEmailError('Já existe uma conta cadastrada com este email.');
      emailRef.current?.focus();
      return;
    }
    setError(signupMessage(result));
  };

  const inputClass = 'ui-input';
  const labelClass = 'text-xs font-bold uppercase tracking-wider text-text-muted';
  const primaryButton = 'ui-btn ui-btn--primary';
  const loginHref = `/login?${new URLSearchParams({ next })}`;

  const alert = error && (
    <div role="alert" data-tone="danger" className="ui-alert justify-center">
      {error}
    </div>
  );

  return (
    <AuthSplitLayout>
      <div className="w-full">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-[color:var(--mesh-1)] bg-[color:var(--tone-info-bg)]">
            <UserPlus className="text-text-main" size={24} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-serif text-text-main">Criar sua conta</h1>
          <p className="text-text-muted mt-1 text-sm">
            Preencha seus dados para acessar a Base de Conhecimento SST.
          </p>
        </div>

        <SocialLoginButtons next={next} mode="signup" />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {alert}

          {/* Campo Honeypot Oculto (Anti-Bot) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="register-website">Não preencha este campo</label>
            <input
              id="register-website"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="register-email" className={labelClass}>
              Email corporativo ou pessoal
            </label>
            <input
              id="register-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              required
              maxLength={254}
              placeholder="ex: voce@empresa.com.br"
              className={`${inputClass} ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
              aria-invalid={Boolean(emailError)}
            />
            {emailError && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle size={14} aria-hidden="true" />
                {emailError}
              </p>
            )}
          </div>

          {/* Identidade: Usuário e Nome Completo */}
          <IdentityFields
            idPrefix="register"
            username={username}
            displayName={displayName}
            onUsernameChange={(value) => {
              setUsername(value);
              setUsernameError(null);
            }}
            onDisplayNameChange={(value) => {
              setDisplayName(value);
              setDisplayNameError(null);
            }}
            usernameStatus={usernameStatus}
            usernameError={usernameError}
            displayNameError={displayNameError}
            usernameRef={usernameRef}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          {/* Senha e Confirmação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="register-password" className={labelClass}>
                Senha
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-describedby="register-password-hint"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  className={`${inputClass} pr-10 ${passwordError ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>

              {/* Medidor visual de força da senha */}
              {password.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted flex items-center gap-1">
                      <ShieldCheck size={12} aria-hidden="true" /> Força da senha:
                    </span>
                    <span className="font-semibold">{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                    <div className={`h-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                    <div className={`h-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                    <div className={`h-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                  </div>
                </div>
              )}

              {passwordError ? (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordError}</p>
              ) : (
                <p id="register-password-hint" className="text-xs text-text-muted">
                  Mínimo {PASSWORD_MIN_LENGTH} caracteres com variedade.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="register-confirm" className={labelClass}>
                Confirme a senha
              </label>
              <div className="relative">
                <input
                  id="register-confirm"
                  ref={confirmRef}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (confirmError) setConfirmError(null);
                  }}
                  required
                  className={`${inputClass} pr-10 ${confirmError ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors focus:outline-none"
                  aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                >
                  {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {confirmError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{confirmError}</p>
              )}
            </div>
          </div>

          {/* Perfil Opcional */}
          <ProfileFields
            idPrefix="register"
            organization={organization}
            professionalArea={professionalArea}
            onOrganizationChange={setOrganization}
            onProfessionalAreaChange={setProfessionalArea}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          {/* Consentimento Termos */}
          <TermsConsent
            id="register-terms"
            checked={acceptTerms}
            onChange={(value) => {
              setAcceptTerms(value);
              if (value) setTermsError(null);
            }}
            error={termsError}
            inputRef={termsRef}
          />

          <button type="submit" disabled={isSaving} className={`w-full mt-4 py-3 ${primaryButton}`}>
            {isSaving ? 'Criando conta…' : 'Criar conta'}
          </button>

          <p className="text-sm text-text-muted text-center pt-2">
            Já tem uma conta?{' '}
            <Link href={loginHref} className="underline text-text-main font-semibold">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
