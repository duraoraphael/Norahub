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

  // Redirecionamento Automático se já logado
  useEffect(() => {
    if (!authLoading && currentUser && userProfile) {
        if (userProfile.statusAcesso === 'pendente') {
             // Não faz nada, deixa o handle bloquear ou mostra tela de espera
        }
        else if (userProfile.funcao === 'admin') navigate('/admin-selection');
        else if (userProfile.funcao === 'comprador') navigate('/aprovacao-compras');
        else if (userProfile.funcao === 'solicitante') navigate('/solicitacao-compras');
        else navigate('/');
    }
  }, [authLoading, currentUser, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    if (!email.endsWith('@normatel.com.br')) {
        setAlertInfo({ message: "Use seu e-mail corporativo (@normatel.com.br).", type: 'error' });
        setLoading(false);
        return; 
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.statusAcesso === 'pendente') {
            await signOut(auth);
            setAlertInfo({ message: "Conta em análise. Aguarde aprovação do administrador.", type: 'error' });
            setLoading(false);
            return;
        }
        
        // O useEffect vai cuidar do redirecionamento agora que o AuthContext vai atualizar
      } else {
        setAlertInfo({ message: "Perfil não encontrado.", type: 'error' });
        await signOut(auth);
      }

    } catch (error) {
      console.error("Erro:", error);
      setAlertInfo({ message: "Email ou senha incorretos.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div></div>;

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      <div className="relative z-50"><ThemeToggle /></div>
      
      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <Link to="/">
          <img 
              src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
              alt="Logo" 
              className="h-8 w-auto object-contain" 
          />
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Login</h2>
          
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
                    placeholder="seu.nome@normatel.com.br" // Placeholder voltou
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" 
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
                    placeholder="••••••••" // Placeholder voltou
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" 
                    required 
                />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#57B952] text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">
            {loading ? '...' : <><LogIn size={20} /> Entrar</>}
          </button>

          <div className="flex justify-between items-center mt-6 text-sm">
            <Link to="/esqueceu-senha" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952]">Esqueceu senha?</Link>
            <Link to="/cadastro" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952]">Criar conta</Link>
          </div>
        </form>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}
export default Login;