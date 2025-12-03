import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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

  // Lógica de Redirecionamento Inteligente
  useEffect(() => {
    // Só executa se o carregamento inicial do Auth terminou
    if (!authLoading && currentUser) {
        
        // Se tivermos o perfil completo carregado do banco:
        if (userProfile) {
            if (userProfile.statusAcesso === 'pendente') {
                // Se estiver pendente, não redireciona (o handleLogout/aviso cuida disso)
                return;
            }
            
            if (userProfile.funcao === 'admin') {
                navigate('/admin-selection');
            } else if (userProfile.funcao === 'comprador') {
                navigate('/aprovacao-compras');
            } 
            
        } else {
            // FALLBACK DE SEGURANÇA:
            // Se o usuário está logado (currentUser existe) mas o perfil falhou ou não existe,
            // manda ele para a página de Perfil ou Home para não ficar preso no Login.
            console.warn("Perfil não encontrado, redirecionando para Home...");
            navigate('/');
        }
    }
  }, [authLoading, currentUser, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    // Validação simples de domínio
    if (!email.endsWith('@normatel.com.br')) {
        setAlertInfo({ message: "Use seu e-mail corporativo (@normatel.com.br).", type: 'error' });
        setLoading(false);
        return; 
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      // Verifica o perfil imediatamente para dar feedback rápido se estiver pendente
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.statusAcesso === 'pendente') {
            await signOut(auth);
            setAlertInfo({ message: "Sua conta está em análise. Aguarde aprovação.", type: 'error' });
            setLoading(false);
            return; // Para aqui e não deixa o useEffect redirecionar
        }
      }
      // Se tudo der certo, o useEffect acima vai detectar a mudança de user e redirecionar

    } catch (error) {
      console.error("Erro no login:", error);
      
      let msg = "Falha ao entrar.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/too-many-requests') {
        msg = "Muitas tentativas. Tente mais tarde.";
      }
      
      setAlertInfo({ message: msg, type: 'error' });
      setLoading(false);
    }
  };

  // Tela de carregamento enquanto verifica a sessão
  if (authLoading) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#111827]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      
      <div className="relative z-50"><ThemeToggle /></div>
      
      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20">
        <button 
            onClick={() => navigate('/')} 
            className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm"
        >
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>

        <img 
            src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
            alt="Logo Normatel" 
            className="h-8 md:h-10 w-auto object-contain" 
        />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Acessar Sistema</h2>
          
          {location.state?.tipo && (
            <p className="text-center text-sm text-[#57B952] font-medium mb-4 uppercase tracking-wide">
              Acesso {location.state.tipo}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Corporativo</label>
            <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                </span>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="seu.nome@normatel.com.br"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500"
                    required 
                />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                </span>
                <input 
                    type="password" 
                    value={senha} 
                    onChange={(e) => setSenha(e.target.value)} 
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500"
                    required 
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-2 bg-[#57B952] text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : <><LogIn size={20} /> Entrar</>}
          </button>

          <div className="flex justify-between items-center mt-6 text-sm">
            <Link to="/esqueceu-senha" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952] transition-colors">
              Esqueceu senha?
            </Link>
            <Link to="/cadastro" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952] transition-colors">
              Criar conta
            </Link>
          </div>

        </form>
      </main>

      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0">
        &copy; 2025 Normatel Engenharia
      </footer>
    </div>
  );
}

export default Login;