/**
 * Enhanced Private Route with Security Features
 * Token validation, session checking, and activity monitoring
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { sessionSecurity } from '../utils/security';

export function EnhancedPrivateRoute({ children, requireAdmin = false, requireRoles = [] }) {
  const { currentUser, userProfile, loading, sessionValid } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Valida sessão em cada mudança de rota
    if (currentUser) {
      const isValid = sessionSecurity.validateSession();
      if (!isValid) {
        console.warn('Session validation failed on route change');
        // Redirecionar para login será feito pelo Navigate abaixo
      }
    }
  }, [location, currentUser]);

  // Registra acesso à rota para auditoria
  useEffect(() => {
    if (currentUser && userProfile) {
      // Você pode implementar logging aqui se desejar
      const accessLog = {
        userId: currentUser.uid,
        route: location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      // Opcional: enviar para analytics ou firestore
      console.log('Route access:', accessLog);
    }
  }, [location, currentUser, userProfile]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando...</div>
      </div>
    );
  }

  // Verifica se sessão é válida
  if (!sessionValid) {
    return <Navigate to="/login" state={{ 
      from: location,
      reason: 'session_invalid' 
    }} replace />;
  }

  // Verifica autenticação
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Aguarda perfil carregar
  if (!userProfile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Carregando perfil...</div>
      </div>
    );
  }

  // Verifica se requer admin
  if (requireAdmin && userProfile.funcao !== 'admin') {
    return <Navigate to="/dashboard" state={{ 
      from: location,
      reason: 'insufficient_permissions' 
    }} replace />;
  }

  // Verifica roles específicas
  if (requireRoles.length > 0 && !requireRoles.includes(userProfile.funcao)) {
    return <Navigate to="/dashboard" state={{ 
      from: location,
      reason: 'role_not_allowed' 
    }} replace />;
  }

  return children;
}

// Wrapper para manter compatibilidade com código existente
export default function PrivateRoute(props) {
  return <EnhancedPrivateRoute {...props} />;
}
