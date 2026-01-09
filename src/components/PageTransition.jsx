import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    // Pequeno delay para garantir que a animação funcione
    const timer = requestAnimationFrame(() => {
      setAnimate(true);
    });

    return () => cancelAnimationFrame(timer);
  }, [location.pathname]);

  return (
    <div className={animate ? 'page-transition' : 'opacity-0'}>
      {children}
    </div>
  );
}
