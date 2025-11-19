import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';

// Imports do Firebase
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Importamos getDoc para ler o perfil

function Login() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    try {
      // 1. Faz o Login
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      
      // 2. Consulta o Banco de Dados para saber quem é esse usuário
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const perfil = userData.funcao; // 'comprador' ou 'solicitante'

        // 3. Redireciona baseado no que está salvo no banco
        if (perfil === 'comprador') {
            navigate('/aprovacao-compras');
        } else if (perfil === 'solicitante') {
            navigate('/solicitacao-compras');
        } else {
            // Se não tiver perfil definido, vai pra home
            navigate('/');
        }
      } else {
        // Se o usuário existe no Auth mas não no Banco (erro raro)
        console.error("Perfil de usuário não encontrado no banco.");
        navigate('/');
      }

    } catch (error) {
      console.error("Erro no login:", error);
      
      let mensagem = "Falha ao entrar. Tente novamente.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        mensagem = "E-mail ou senha incorretos.";
      } else if (error.code === 'auth/invalid-email') {
        mensagem = "O formato do e-mail é inválido.";
      } else if (error.code === 'auth/too-many-requests') {
        mensagem = "Muitas tentativas. Tente mais tarde.";
      } else if (error.code === 'auth/network-request-failed') {
        mensagem = "Erro de conexão. Verifique sua internet.";
      }
      setAlertInfo({ message: mensagem, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      
      {alertInfo && (
        <Alert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo(null)} 
        />
      )}
      
      <ThemeToggle />
      
      <header className="w-full flex justify-center py-8 md:py-12 shrink-0">
        <Link to="/">
          <img 
              src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
              alt="Logo Normatel" 
              className="w-40 md:w-48 h-auto object-contain"
          />
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Login</h2>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </span>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@normatel.com.br"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#57B952] focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </span>
              <input 
                type="password" 
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#57B952] focus:border-transparent"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#57B952] text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : (
                <>
                    <LogIn size={20} />
                    Entrar
                </>
            )}
          </button>

          <div className="flex justify-between items-center mt-6 text-sm">
            <Link to="/esqueceu-senha" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952] dark:hover:text-[#57B952] transition-colors">
              Esqueceu senha?
            </Link>
            <Link to="/cadastro" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952] dark:hover:text-[#57B952] transition-colors">
              Não tem conta? Cadastre-se
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