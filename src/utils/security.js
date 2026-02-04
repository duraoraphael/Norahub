/**
 * Frontend Security Utilities
 * Sanitização e validação no lado do cliente
 */

/**
 * Sanitiza strings removendo conteúdo potencialmente perigoso
 */
export const sanitizeInput = {
  /**
   * Remove tags HTML e scripts
   */
  removeHTML: (input) => {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Remove caracteres perigosos mas mantém acentos
   */
  cleanString: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/eval\(/gi, '') // Remove eval
      .trim();
  },

  /**
   * Sanitiza para uso em URLs
   */
  sanitizeURL: (input) => {
    if (typeof input !== 'string') return '';
    
    try {
      const url = new URL(input);
      // Apenas permite http e https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      return url.href;
    } catch {
      return '';
    }
  },

  /**
   * Sanitiza email
   */
  sanitizeEmail: (email) => {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim().replace(/[<>]/g, '');
  },

  /**
   * Sanitiza para uso em atributos HTML
   */
  sanitizeAttribute: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/["'<>&]/g, (char) => {
        const entities = {
          '"': '&quot;',
          "'": '&#39;',
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;'
        };
        return entities[char] || char;
      });
  }
};

/**
 * Validadores de entrada
 */
export const validators = {
  /**
   * Valida email
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida URL
   */
  isValidURL: (url) => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Valida tamanho de string
   */
  isValidLength: (str, min = 0, max = 1000) => {
    if (typeof str !== 'string') return false;
    return str.length >= min && str.length <= max;
  },

  /**
   * Valida que não contém scripts
   */
  isSafe: (str) => {
    if (typeof str !== 'string') return true;
    
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\(/i,
      /<iframe/i,
      /<embed/i,
      /<object/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(str));
  },

  /**
   * Valida CPF (brasileiro)
   */
  isValidCPF: (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  },

  /**
   * Valida telefone brasileiro
   */
  isValidPhone: (phone) => {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }
};

/**
 * Proteção contra CSRF
 */
export const csrfProtection = {
  /**
   * Gera token CSRF
   */
  generateToken: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Armazena token na sessão
   */
  storeToken: (token) => {
    sessionStorage.setItem('csrf_token', token);
  },

  /**
   * Recupera token da sessão
   */
  getToken: () => {
    return sessionStorage.getItem('csrf_token');
  },

  /**
   * Valida token
   */
  validateToken: (token) => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken;
  }
};

/**
 * Proteção de formulários
 */
export const formProtection = {
  /**
   * Adiciona proteção a um formulário
   */
  protect: (formElement) => {
    // Gera e adiciona token CSRF
    const token = csrfProtection.generateToken();
    csrfProtection.storeToken(token);
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.value = token;
    formElement.appendChild(input);
    
    // Adiciona timestamp para prevenir replay attacks
    const timestamp = document.createElement('input');
    timestamp.type = 'hidden';
    timestamp.name = 'timestamp';
    timestamp.value = Date.now().toString();
    formElement.appendChild(timestamp);
    
    return token;
  },

  /**
   * Valida formulário protegido
   */
  validate: (formData) => {
    const token = formData.get('csrf_token');
    const timestamp = formData.get('timestamp');
    
    // Valida CSRF token
    if (!csrfProtection.validateToken(token)) {
      return { valid: false, error: 'Invalid CSRF token' };
    }
    
    // Valida que não é muito antigo (5 minutos)
    const age = Date.now() - parseInt(timestamp);
    if (age > 300000) {
      return { valid: false, error: 'Form expired. Please refresh.' };
    }
    
    return { valid: true };
  }
};

/**
 * Rate limiting no cliente
 */
export class ClientRateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  /**
   * Verifica se ação é permitida
   */
  check(key) {
    const now = Date.now();
    const record = this.attempts.get(key) || { count: 0, resetTime: now + this.windowMs };
    
    // Reset se janela expirou
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }
    
    // Verifica limite
    if (record.count >= this.maxAttempts) {
      const waitTime = Math.ceil((record.resetTime - now) / 1000);
      return {
        allowed: false,
        retryAfter: waitTime
      };
    }
    
    // Incrementa contador
    record.count++;
    this.attempts.set(key, record);
    
    return {
      allowed: true,
      remaining: this.maxAttempts - record.count
    };
  }

  /**
   * Reset contador para uma chave
   */
  reset(key) {
    this.attempts.delete(key);
  }
}

/**
 * Detecção de Session Hijacking
 */
export const sessionSecurity = {
  /**
   * Cria fingerprint do browser
   */
  getFingerprint: () => {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage
    ].join('|');
    
    // Hash simples
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  },

  /**
   * Armazena fingerprint na sessão
   */
  storeFingerprint: () => {
    const fingerprint = sessionSecurity.getFingerprint();
    sessionStorage.setItem('session_fp', fingerprint);
    return fingerprint;
  },

  /**
   * Valida que a sessão não foi sequestrada
   */
  validateSession: () => {
    const stored = sessionStorage.getItem('session_fp');
    if (!stored) {
      return sessionSecurity.storeFingerprint();
    }
    
    const current = sessionSecurity.getFingerprint();
    if (stored !== current) {
      console.warn('Session fingerprint mismatch - possible hijacking');
      // Limpar sessão
      sessionStorage.clear();
      localStorage.removeItem('auth_token');
      return false;
    }
    
    return true;
  }
};

/**
 * Exportação default com todos os utilitários
 */
export default {
  sanitizeInput,
  validators,
  csrfProtection,
  formProtection,
  ClientRateLimiter,
  sessionSecurity
};
