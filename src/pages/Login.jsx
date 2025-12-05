import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, User } from 'lucide-react'; // Adicionado User
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut, OAuthProvider, signInWithPopup } from 'firebase/auth';
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

  // Variáveis para exibição no header
  const fotoURL = currentUser?.photoURL || userProfile?.fotoURL;
  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';

  // CORREÇÃO 1: O signOut roda APENAS UMA VEZ ao montar a página (lista de dependências vazia [])
  useEffect(() => {
    signOut(auth).catch(() => {});
  }, []);

  // Lógica de Redirecionamento Automático (caso o login seja via email/senha ou recuperação de sessão)
  useEffect(() => {
    if (!authLoading && currentUser && userProfile) {
        if (userProfile.statusAcesso === 'pendente') return;
        
        if (userProfile.funcao === 'admin') navigate('/admin-selection');
        else navigate('/selecao-projeto');
    }
  }, [authLoading, currentUser, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setAlertInfo(null);
    if (!email.endsWith('@normatel.com.br')) { setAlertInfo({ message: "Use email corporativo.", type: 'error' }); setLoading(false); return; }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      // Verifica perfil
      const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (docSnap.exists()) {
         if (docSnap.data().statusAcesso === 'pendente') {
            await signOut(auth);
            setAlertInfo({ message: "Conta em análise. Aguarde aprovação.", type: 'error' });
         }
      } else {
         await signOut(auth);
         setAlertInfo({ message: "Perfil não encontrado.", type: 'error' });
      }
    } catch (error) {
      console.error("Erro:", error);
      setAlertInfo({ message: "Email ou senha incorretos.", type: 'error' });
    } finally { setLoading(false); }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true); setAlertInfo(null);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        if (!user.email.endsWith('@normatel.com.br')) {
            await user.delete().catch(()=>{}); 
            await signOut(auth);
            throw new Error("dominio-invalido");
        }

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        // CORREÇÃO 2: Aprovação Automática e Redirecionamento Expresso
        if (docSnap.exists()) {
            // Se já existe mas estava pendente, libera agora
            if (docSnap.data().statusAcesso === 'pendente') {
                await updateDoc(userRef, { statusAcesso: 'ativo' });
            }
            // Verifica cargo para redirecionar certo
            const data = docSnap.data();
            if (data.funcao === 'admin') navigate('/admin-selection');
            else navigate('/selecao-projeto');
        } else {
            // Se é novo, cria como ATIVO e entra
            // ADICIONADO: fotoURL para salvar a foto da Microsoft
            await setDoc(userRef, {
                nome: user.displayName || 'Usuário Microsoft',
                email: user.email,
                fotoURL: user.photoURL, // <--- Salva a foto aqui
                cargo: 'Colaborador',
                funcao: 'solicitante',
                statusAcesso: 'ativo', // <--- IMPORTANTE: Entra direto
                uid: user.uid,
                createdAt: new Date()
            });
            navigate('/selecao-projeto');
        }

    } catch (error) {
        console.error("Erro Microsoft:", error);
        if (error.message === 'dominio-invalido') setAlertInfo({ message: "Acesso restrito a @normatel.com.br", type: 'error' });
        else if (error.code === 'auth/account-exists-with-different-credential') setAlertInfo({ message: "E-mail já existe com senha. Use o login normal.", type: 'warning' });
        else if (error.code === 'auth/popup-closed-by-user') setAlertInfo({ message: "Login cancelado.", type: 'error' });
        else setAlertInfo({ message: `Erro: ${error.code}`, type: 'error' });
    } finally { setLoading(false); }
  };

  if (authLoading) return <div className="min-h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div></div>;

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 dark:bg-[#111827] transition-colors duration-200">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      <div className="relative z-50"><ThemeToggle /></div>
      
      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20 bg-white dark:bg-gray-800">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-10 w-auto object-contain" />
        
        {/* MOSTRAR PERFIL NO CANTO SUPERIOR DIREITO SE LOGADO */}
        {currentUser && (
            <div className="absolute right-4 md:right-8 flex items-center gap-3 mr-16">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block fade-in">Olá, {primeiroNome}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-[#57B952] transition-all bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {fotoURL ? <img src={fotoURL} alt="Perfil" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500 dark:text-gray-400" />}
                </div>
            </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Acessar Sistema</h2>
          <button type="button" onClick={handleMicrosoftLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white font-medium py-3 px-4 rounded-md transition-colors mb-6 border border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>Entrar com Microsoft
          </button>
          <div className="flex items-center gap-4 mb-6"><div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div><span className="text-sm text-gray-500">ou use seu e-mail</span><div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div></div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="seu.nome@normatel.com.br" required /></div>
            <div className="mb-6"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="••••••" required /></div>
            <button type="submit" disabled={loading} className="w-full bg-[#57B952] text-white font-bold py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">{loading ? '...' : 'Entrar'}</button>
          </form>
          <div className="flex justify-between items-center mt-6 text-sm"><Link to="/esqueceu-senha" className="text-gray-500 hover:text-[#57B952]">Esqueceu senha?</Link><Link to="/cadastro" className="text-gray-500 hover:text-[#57B952]">Criar conta</Link></div>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}
export default Login;