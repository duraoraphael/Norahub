import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, requiredRole }) {
  const { currentUser, userProfile, loading } = useAuth();

  // Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-[#111827]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div>
      </div>
    );
  }

  // Não logado -> Login
  if (!currentUser) {
    console.log("PrivateRoute: Usuário não logado. Redirecionando para login.");
    return <Navigate to="/login" replace />;
  }

  // Verificação de Papel (Role)
  // Se a rota exige um papel, o usuário tem perfil, mas o papel não bate...
  if (requiredRole && userProfile && userProfile.funcao !== requiredRole && userProfile.funcao !== 'admin') {
     console.warn(`Acesso negado. Rota exige '${requiredRole}', usuário é '${userProfile.funcao}'.`);
     
     // Redirecionamento inteligente para a "casa" do usuário
     if (userProfile.funcao === 'admin') return <Navigate to="/admin-selection" replace />;
     if (userProfile.funcao === 'comprador') return <Navigate to="/aprovacao-compras" replace />;
     if (userProfile.funcao === 'solicitante') return <Navigate to="/solicitacao-compras" replace />;
     
     return <Navigate to="/" replace />;
  }

  // Se o usuário está logado mas o perfil ainda não carregou (caso raro de delay do Firestore), 
  // podemos optar por mostrar um loading ou deixar passar (arriscado) ou mandar pra home.
  // Aqui vamos assumir que se loading=false e currentUser=true, o userProfile deveria estar lá.
  // Se não estiver, pode ser um erro de cadastro.
  if (!userProfile && currentUser) {
      console.warn("Usuário sem perfil no banco. Contate o suporte.");
      // Opcional: Deixar renderizar para não travar, ou mandar para uma tela de "Complete seu cadastro"
  }

  return children;
}

export default PrivateRoute;