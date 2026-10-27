/**
 * Utilitários de segurança para validação e mitigação de riscos no cadastro de usuários.
 */

// 1. Domínios de e-mails temporários/descartáveis conhecidos
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwawaymail.com',
  'trashmail.com',
  'sharklasers.com',
  'yopmail.com',
  'getnada.com',
  'dispostable.com',
  'mohmal.com',
  'temp-mail.org',
  'fakemailgenerator.com',
  'crazymailing.com',
  'nada.ltd',
]);

export function isDisposableEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

// 2. Sanitização de inputs para prevenir XSS e injeções
export function sanitizeInput(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/[<>]/g, '') // remove tags html básicas
    .trim();
}

// 3. Indicador de força e entropia da senha (NIST SP 800-63B)
export interface PasswordStrength {
  score: number; // 0 a 4
  label: 'Muito fraca' | 'Fraca' | 'Média' | 'Forte' | 'Excelente';
  color: string;
  feedback: string[];
}

const COMMON_PASSWORDS = new Set([
  '12345678',
  '123456789',
  'password',
  'senha123',
  'qwertyuiop',
  'admin123',
  'brasil123',
  'seguranca',
  'administrador',
]);

export function evaluatePasswordStrength(password: string, username = ''): PasswordStrength {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, label: 'Muito fraca', color: 'bg-zinc-300 dark:bg-zinc-700', feedback: [] };
  }

  const clean = password.toLowerCase();
  if (COMMON_PASSWORDS.has(clean)) {
    return {
      score: 1,
      label: 'Muito fraca',
      color: 'bg-red-500',
      feedback: ['Esta senha é muito comum e fácil de adivinhar.'],
    };
  }

  if (username && clean.includes(username.toLowerCase())) {
    return {
      score: 1,
      label: 'Muito fraca',
      color: 'bg-red-500',
      feedback: ['A senha não deve conter o seu nome de usuário.'],
    };
  }

  let score = 0;

  // Comprimento
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Variedade de caracteres
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (varietyCount >= 3) score += 1;
  if (varietyCount === 4 && password.length >= 10) score += 1;

  if (password.length < 8) {
    feedback.push('Use pelo menos 8 caracteres.');
  }
  if (!hasDigit && !hasSpecial) {
    feedback.push('Adicione números ou símbolos (@, #, $...).');
  }
  if (!hasUpper) {
    feedback.push('Inclua letras maiúsculas.');
  }

  score = Math.min(score, 4);

  const levels: Record<number, { label: PasswordStrength['label']; color: string }> = {
    0: { label: 'Muito fraca', color: 'bg-red-500' },
    1: { label: 'Fraca', color: 'bg-orange-500' },
    2: { label: 'Média', color: 'bg-amber-500' },
    3: { label: 'Forte', color: 'bg-emerald-500' },
    4: { label: 'Excelente', color: 'bg-emerald-600' },
  };

  return {
    score,
    label: levels[score].label,
    color: levels[score].color,
    feedback,
  };
}
