/**
 * reCAPTCHA Wrapper Component
 * Carrega o script do reCAPTCHA e fornece função para executar
 */
import { useEffect, useState } from 'react';

export const RecaptchaLoader = ({ children }) => {
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    // Carrega script do reCAPTCHA v3
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setRecaptchaReady(true);
    };

    script.onerror = () => {
      console.error('Falha ao carregar reCAPTCHA');
      setRecaptchaReady(true); // Continua mesmo sem reCAPTCHA
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      {children}
      {/* Nota de crédito do reCAPTCHA (conforme termos de uso do Google) */}
      <div className="recaptcha-credit" style={{ display: recaptchaReady ? 'block' : 'none' }}>
        Protected by reCAPTCHA
      </div>
    </>
  );
};

/**
 * Hook para usar reCAPTCHA
 */
export const useRecaptcha = () => {
  const executeRecaptcha = async (action = 'submit') => {
    if (!window.grecaptcha) {
      console.warn('reCAPTCHA não carregado');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, {
        action
      });
      return token;
    } catch (error) {
      console.error('Erro ao executar reCAPTCHA:', error);
      return null;
    }
  };

  return { executeRecaptcha };
};

export default RecaptchaLoader;
