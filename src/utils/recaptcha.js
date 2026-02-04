/**
 * reCAPTCHA v3 Integration for Bot Protection
 * Google reCAPTCHA v3 returns a score (0.0 - 1.0) for each request
 * Higher score = more likely human
 */

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'your_recaptcha_site_key';
const RECAPTCHA_THRESHOLD = 0.5; // Score mínimo para considerar humano

/**
 * Carrega o script do reCAPTCHA
 */
export const loadRecaptcha = () => {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) {
      resolve(window.grecaptcha);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      window.grecaptcha.ready(() => {
        resolve(window.grecaptcha);
      });
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Executa reCAPTCHA e retorna token
 */
export const executeRecaptcha = async (action = 'submit') => {
  try {
    const grecaptcha = await loadRecaptcha();
    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.error('reCAPTCHA error:', error);
    return null;
  }
};

/**
 * Verifica se token reCAPTCHA é válido (server-side)
 * Esta função deve ser chamada no backend (Cloud Functions)
 */
export const verifyRecaptchaToken = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `secret=${secretKey}&response=${token}`
  });
  
  const data = await response.json();
  
  return {
    success: data.success,
    score: data.score,
    action: data.action,
    timestamp: data.challenge_ts,
    isHuman: data.success && data.score >= RECAPTCHA_THRESHOLD
  };
};

/**
 * Hook React para usar reCAPTCHA
 */
import { useState, useEffect, useCallback } from 'react';

export const useRecaptcha = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecaptcha()
      .then(() => setIsLoaded(true))
      .catch(err => setError(err));
  }, []);

  const execute = useCallback(async (action) => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded yet');
    }
    return executeRecaptcha(action);
  }, [isLoaded]);

  return { isLoaded, error, execute };
};

/**
 * Componente de Badge reCAPTCHA
 * Mostra o badge "Protected by reCAPTCHA" conforme termos de uso
 */
export const RecaptchaBadge = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      fontSize: '10px',
      color: '#999',
      zIndex: 1000
    }}>
      This site is protected by reCAPTCHA and the Google{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>{' '}
      and{' '}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
        Terms of Service
      </a>{' '}
      apply.
    </div>
  );
};

/**
 * Exemplo de uso em formulário de login
 */
export const protectLoginForm = async (email, password) => {
  // Executa reCAPTCHA
  const token = await executeRecaptcha('login');
  
  if (!token) {
    throw new Error('Failed to verify you are human. Please try again.');
  }

  // Envia token junto com as credenciais para o backend validar
  return {
    email,
    password,
    recaptchaToken: token
  };
};

/**
 * Exemplo de uso em formulário de cadastro
 */
export const protectSignupForm = async (formData) => {
  const token = await executeRecaptcha('signup');
  
  if (!token) {
    throw new Error('Failed to verify you are human. Please try again.');
  }

  return {
    ...formData,
    recaptchaToken: token
  };
};

/**
 * Exemplo de uso em ações sensíveis
 */
export const protectSensitiveAction = async (actionName, actionData) => {
  const token = await executeRecaptcha(actionName);
  
  if (!token) {
    throw new Error('Security verification failed. Please try again.');
  }

  return {
    ...actionData,
    recaptchaToken: token
  };
};

export default {
  loadRecaptcha,
  executeRecaptcha,
  verifyRecaptchaToken,
  useRecaptcha,
  RecaptchaBadge,
  protectLoginForm,
  protectSignupForm,
  protectSensitiveAction
};
