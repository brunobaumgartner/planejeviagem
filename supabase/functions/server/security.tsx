/**
 * Security Utilities
 * 
 * Este arquivo contém utilitários de segurança para o backend
 * incluindo validação de input, sanitização e rate limiting
 */

// Rate limiting storage (in-memory - para produção, usar Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiter simples
 * @param key - Identificador único (userId, IP, etc)
 * @param maxRequests - Número máximo de requisições
 * @param windowMs - Janela de tempo em ms
 * @returns true se permitido, false se bloqueado
 */
export function rateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Sanitiza string para prevenir XSS
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida comprimento de string
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  if (!str) return false;
  const len = str.length;
  return len >= min && len <= max;
}

/**
 * Valida senha forte
 */
export function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  if (password.length > 128) {
    errors.push('Senha muito longa');
  }

  // Opcional: adicionar mais requisitos
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Senha deve conter pelo menos uma letra maiúscula');
  // }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza objeto removendo campos sensíveis
 */
export function sanitizeUserObject(user: any): any {
  const { password, access_token, refresh_token, ...safe } = user;
  return safe;
}

/**
 * Valida dados de viagem
 */
export function validateTripData(trip: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!trip.destination || !isValidLength(trip.destination, 2, 100)) {
    errors.push('Destino inválido');
  }

  if (!trip.startDate) {
    errors.push('Data de início obrigatória');
  }

  if (!trip.endDate) {
    errors.push('Data de fim obrigatória');
  }

  if (!trip.budget || !isValidLength(trip.budget, 2, 50)) {
    errors.push('Orçamento inválido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida dados de notificação
 */
export function validateNotificationData(notification: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!notification.title || !isValidLength(notification.title, 1, 200)) {
    errors.push('Título inválido');
  }

  if (!notification.message || !isValidLength(notification.message, 1, 1000)) {
    errors.push('Mensagem inválida');
  }

  const validTypes = ['info', 'success', 'warning', 'error', 'trip_update', 'payment', 'system'];
  if (!notification.type || !validTypes.includes(notification.type)) {
    errors.push('Tipo de notificação inválido');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Previne SQL Injection básico (Supabase já previne, mas adiciona camada extra)
 */
export function sanitizeForDatabase(value: any): any {
  if (typeof value === 'string') {
    // Remove caracteres perigosos
    return value
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }
  return value;
}

/**
 * Limpa periodicamente o rate limit store
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Limpar rate limit store a cada 5 minutos
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Log de segurança
 */
export function securityLog(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'low'): void {
  const log = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
  };

  if (severity === 'high' || severity === 'critical') {
    console.error('[SECURITY]', log);
  } else {
    console.log('[SECURITY]', log);
  }
}
