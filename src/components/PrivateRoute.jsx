import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, requiredRole }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#111827]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div></div>;

  if (!currentUser) return <Navigate to="/login" replace />;

  if (requiredRole && userProfile && userProfile.funcao !== requiredRole && userProfile.funcao !== 'admin') {
     if (userProfile.funcao === 'admin') return <Navigate to="/admin-selection" replace />;
     if (userProfile.funcao === 'comprador') return <Navigate to="/aprovacao-compras" replace />;
     
     // Solicitante não tem mais dashboard específico, então manda para a Home ou Perfil
     return <Navigate to="/" replace />;
  }

  return children;
}
export default PrivateRoute;