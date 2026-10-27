import { useState, useMemo, useRef, useCallback } from 'react';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  register,
  type ProfessionalArea,
} from '@/features/auth/client';
import {
  displayNameProblem,
  isValidUsername,
  normalizeUsername,
  USERNAME_RULES,
} from '@/features/auth/identity';
import { useUsernameAvailability } from '@/features/auth/use-username-availability';
import {
  signupMessage,
  TERMS_REQUIRED,
  USERNAME_RESERVED,
  USERNAME_TAKEN,
} from '@/features/auth/signup-messages';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/features/legal/documents';
import { hardNavigate } from '@/lib/navigation';
import {
  evaluatePasswordStrength,
  isDisposableEmail,
  sanitizeInput,
} from '@/features/auth/security';

const LENGTH_MESSAGE = `A senha deve ter entre ${PASSWORD_MIN_LENGTH} e ${PASSWORD_MAX_LENGTH} caracteres.`;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function useRegisterForm(next: string) {
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
  const [honeypot, setHoneypot] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  const usernameStatus = useUsernameAvailability(username);

  const passwordStrength = useMemo(
    () => evaluatePasswordStrength(password, username),
    [password, username]
  );

  const validateEmail = useCallback((val: string) => {
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Honeypot check anti-bot
    if (honeypot) {
      return;
    }

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      emailRef.current?.focus();
      return;
    }

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

    const cleanDisplayName = sanitizeInput(displayName);
    const nameProblem = displayNameProblem(cleanDisplayName);
    setDisplayNameError(nameProblem);

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

  return {
    email,
    setEmail,
    emailError,
    validateEmail,
    emailRef,
    password,
    setPassword,
    confirm,
    setConfirm,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    passwordStrength,
    passwordError,
    setPasswordError,
    confirmError,
    setConfirmError,
    passwordRef,
    confirmRef,
    username,
    setUsername,
    usernameError,
    setUsernameError,
    usernameStatus,
    usernameRef,
    displayName,
    setDisplayName,
    displayNameError,
    setDisplayNameError,
    organization,
    setOrganization,
    professionalArea,
    setProfessionalArea,
    acceptTerms,
    setAcceptTerms,
    termsError,
    setTermsError,
    termsRef,
    error,
    isSaving,
    honeypot,
    setHoneypot,
    handleSubmit,
  };
}
