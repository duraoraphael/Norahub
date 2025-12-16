import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut, OAuthProvider, signInWithPopup, signInWithRedirect, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

function Login() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Removido signOut automático para não desconectar o usuário após um login
  // useEffect intentionally left empty

  // Redirecionamento Automático
  useEffect(() => {
    // Se já carregou e tem usuário válido
    if (!authLoading && currentUser && userProfile) {
        if (userProfile.statusAcesso === 'pendente') return;
        
        // TODOS (Inclusive Admin) vão para a seleção de projeto
        navigate('/selecao-projeto');
    }
  }, [authLoading, currentUser, userProfile, navigate]);

    const checkUserProfile = async (user) => {
      // Normaliza email vindo do auth ou dos dados do provedor
      const providerEmail = user.providerData?.[0]?.email;
      const effectiveEmail = user.email || providerEmail || null;

      // Se for login Microsoft, garanta que exista email e que seja do domínio esperado
      if (user.providerData[0]?.providerId === 'microsoft.com') {
        if (!effectiveEmail) {
          await signOut(auth);
          throw new Error('email-indisponivel');
        }
        if (!effectiveEmail.endsWith('@normatel.com.br')) {
          await signOut(auth);
          throw new Error('dominio-invalido');
        }
      }
      
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.statusAcesso === 'pendente') { 
            // Se for Microsoft, atualiza para ativo automaticamente para não travar
            if (user.providerData[0]?.providerId === 'microsoft.com') {
                await updateDoc(doc(db, 'users', user.uid), { statusAcesso: 'ativo', fotoURL: user.photoURL || null });
                // Força atualização do Auth com a foto
                if (user.photoURL) {
                  await updateProfile(user, { photoURL: user.photoURL });
                }
                navigate('/selecao-projeto');
                return;
            }
            await signOut(auth); 
            throw new Error("pendente"); 
        }
        
        // Se for Microsoft e ativo, atualiza foto
        if (user.providerData[0]?.providerId === 'microsoft.com' && user.photoURL) {
          await updateDoc(doc(db, 'users', user.uid), { fotoURL: user.photoURL });
          await updateProfile(user, { photoURL: user.photoURL });
        }
        
        // Redireciona para seleção
        navigate('/selecao-projeto');
        
      } else { 
        // Cria perfil se não existir (Primeiro acesso Microsoft -> Ativo)
        await setDoc(doc(db, 'users', user.uid), {
          nome: user.displayName || 'Usuário Microsoft',
          email: effectiveEmail,
          cargo: 'Colaborador',
          funcao: 'colaborador', // Padrão seguro
          statusAcesso: 'ativo', // Já entra aprovado
          uid: user.uid,
          fotoURL: user.photoURL || null, // Salva a foto da conta Microsoft
          createdAt: new Date()
        });
        // Força atualização do Auth com a foto
        if (user.photoURL) {
          await updateProfile(user, { photoURL: user.photoURL });
        }
        navigate('/selecao-projeto');
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setAlertInfo(null);
    if (!email.endsWith('@normatel.com.br')) { setAlertInfo({ message: "Use email corporativo.", type: 'error' }); setLoading(false); return; }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      
      // Verificação específica para senha (mantém a regra de pendente)
      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (docSnap.exists()) {
         if (docSnap.data().statusAcesso === 'pendente') {
            await signOut(auth);
            throw new Error("pendente");
         }
         // Se ativo, o useEffect lá em cima redireciona
      } else {
         // Criar perfil básico caso não exista (usuário legado)
         await setDoc(doc(db, 'users', userCredential.user.uid), {
           nome: userCredential.user.displayName || email.split('@')[0],
           email: userCredential.user.email,
           funcao: 'usuario',
           statusAcesso: 'ativo',
           fotoURL: userCredential.user.photoURL || null,
           createdAt: new Date()
         });
         // Continua o login normalmente
      }
    } catch (error) {
      console.error("Erro:", error);
      if (error.message === 'pendente') setAlertInfo({ message: "Conta em análise. Aguarde aprovação.", type: 'error' });
      else if (error.code === 'auth/user-not-found') setAlertInfo({ message: "Usuário não encontrado. Faça o cadastro primeiro.", type: 'error' });
      else if (error.code === 'auth/wrong-password') setAlertInfo({ message: "Senha incorreta.", type: 'error' });
      else setAlertInfo({ message: "Email ou senha incorretos.", type: 'error' });
    } finally { setLoading(false); }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true); setAlertInfo(null);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await signInWithPopup(auth, provider);
        await checkUserProfile(result.user);
    } catch (error) {
        console.error("Erro Microsoft:", error);
      // Alguns navegadores com COOP/COEP bloqueiam o polling do popup; usamos redirect como fallback seguro
      const coopBlocked = error?.message?.includes('window.closed');
      if (coopBlocked) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('Erro Microsoft (redirect):', redirectError);
          setAlertInfo({ message: 'Erro ao redirecionar para login Microsoft.', type: 'error' });
          return;
        }
      }
      if (error?.message === 'dominio-invalido') {
        setAlertInfo({ message: "Acesso restrito a @normatel.com.br", type: 'error' });
      } else if (error?.message === 'email-indisponivel') {
        setAlertInfo({ message: "A Microsoft não retornou seu e-mail. Verifique as permissões da conta.", type: 'error' });
      } else if (error?.message === 'pendente') {
        setAlertInfo({ message: "Conta em análise.", type: 'error' });
      } else if (error?.code === 'auth/account-exists-with-different-credential') {
        setAlertInfo({ message: "E-mail já existe com senha.", type: 'warning' });
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setAlertInfo({ message: "Login cancelado.", type: 'error' });
      } else {
        const fallback = error?.code || error?.message || 'Erro desconhecido.';
        setAlertInfo({ message: `Erro: ${fallback}`, type: 'error' });
      }
    } finally { setLoading(false); }
  };

  if (authLoading) return <div className="min-h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div></div>;

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      {/* ThemeToggle removed */}
      <header className="relative w-full flex items-center justify-center py-3 md:py-6 px-3 md:px-8 border-b border-gray-200 min-h-[56px] md:h-20 bg-white">
        <button onClick={() => navigate('/')} className="absolute left-3 md:left-8 flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0 z-10">
             <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <img src="/img/Normatel Engenharia_PRETO.png" alt="Logo" className="h-6 md:h-10 w-auto object-contain" />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-3 md:p-4">
        <div className="w-full max-w-sm bg-white p-4 md:p-8 rounded-xl shadow-2xl border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-8">Acessar Sistema</h2>
          <button type="button" onClick={handleMicrosoftLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white font-medium py-3 px-4 rounded-md transition-colors mb-6 border border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>Entrar com Microsoft
          </button>
          <div className="flex items-center gap-4 mb-6"><div className="h-px bg-gray-300 flex-1"></div><span className="text-sm text-gray-500">ou use seu e-mail</span><div className="h-px bg-gray-300 flex-1"></div></div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="seu.nome@normatel.com.br" required /></div>
            <div className="mb-6"><label className="block text-sm font-medium text-gray-700">Senha</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="••••••" required /></div>
            <button type="submit" disabled={loading} className="w-full bg-[#57B952] text-white font-bold py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">{loading ? '...' : 'Entrar'}</button>
          </form>
          
          {/* ÁREA DE LINKS DESTACADA */}
          <div className="mt-8 space-y-4">
            
            <Link 
              to="/esqueceu-senha" 
              className="block text-center text-sm font-medium text-[#57B952] hover:text-green-700 hover:underline transition-colors"
            >
                Esqueceu sua senha?
            </Link>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Novo por aqui?</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <Link 
                to="/cadastro" 
                className="flex items-center justify-center w-full py-2 px-4 border-2 border-[#57B952] text-[#57B952] rounded-lg font-bold hover:bg-[#57B952] hover:text-white transition-all text-sm"
            >
                Criar Nova Conta
            </Link>
          </div>

        </div>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0 bg-white border-t border-gray-200">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}
export default Login;