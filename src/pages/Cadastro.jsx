import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert'; 
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, OAuthProvider, signOut } from 'firebase/auth'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext';

function Cadastro() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpfMatricula, setCpfMatricula] = useState('');
  const [funcao, setFuncao] = useState(''); 
  const [perfilAcesso, setPerfilAcesso] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    if (currentUser) {
        signOut(auth).catch(() => {});
    }
  }, [currentUser]);

  // --- CADASTRO MANUAL (COM VALIDAÇÃO DE DOMÍNIO) ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    // Validação estrita
    if (!email || !email.endsWith('@normatel.com.br')) {
        setAlertInfo({ message: "Use email corporativo (@normatel.com.br).", type: 'error' });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nome, 
        email, 
        cpfMatricula, 
        cargo: funcao, 
        funcao: perfilAcesso, 
        statusAcesso: 'pendente', // MANUAL = PENDENTE
        uid: userCredential.user.uid, 
        createdAt: new Date()
      });
      setAlertInfo({ message: "Solicitado! Aguarde aprovação.", type: 'success' });
      setTimeout(() => { navigate('/login'); }, 3000);
    } catch (error) {
      console.error("Erro:", error);
      setAlertInfo({ message: "Erro ao criar conta.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- CADASTRO MICROSOFT (SEM VALIDAÇÃO E ATIVO) ---
  const handleMicrosoftRegister = async () => {
    setLoading(true); 
    setAlertInfo(null);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            setAlertInfo({ message: "Conta já existe! Faça Login.", type: 'warning' });
            setTimeout(() => navigate('/login'), 2000);
        } else {
            // Cria conta NOVA e ATIVA
            await setDoc(docRef, { 
                nome: user.displayName || 'Usuário Microsoft', 
                email: user.email, 
                cpfMatricula: '', 
                cargo: 'Colaborador', 
                funcao: 'solicitante', 
                statusAcesso: 'ativo', // MICROSOFT = ATIVO
                fotoURL: user.photoURL || null, 
                uid: user.uid, 
                createdAt: new Date() 
            });
            
            setAlertInfo({ message: "Cadastro realizado! Redirecionando...", type: 'success' });
            setTimeout(() => navigate('/selecao-projeto'), 1500);
        }
    } catch (error) {
        console.error("Erro Microsoft:", error);
        setAlertInfo({ message: "Erro no cadastro.", type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 dark:bg-[#111827] transition-colors">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      <div className="relative z-50"><ThemeToggle /></div>
      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20 bg-white dark:bg-gray-800">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952]">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>NORMATEL</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Criar Conta</h2>
          
          <button type="button" onClick={handleMicrosoftRegister} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white font-medium py-3 px-4 rounded-md transition-colors mb-6 border border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>Cadastrar com Microsoft
          </button>
          
          <div className="flex items-center gap-4 mb-6"><div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div><span className="text-sm text-gray-500">ou manual</span><div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div></div>
          
          <form onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                 <input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="Ex: João da Silva" required /></div>
                 
                 <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                 <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="exemplo@normatel.com.br" required /></div>
                 
                 <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                 <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="******" required /></div>
                 
                 <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                 <input type="text" value={cpfMatricula} onChange={e=>setCpfMatricula(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="000.000.000-00" required /></div>
                 
                 <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                 <input type="text" value={funcao} onChange={e=>setFuncao(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952]" placeholder="Ex: Analista" required /></div>
                 
                 <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil</label>
                 <select value={perfilAcesso} onChange={e=>setPerfilAcesso(e.target.value)} className="w-full pl-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] cursor-pointer" required>
                    <option value="" disabled>Selecione...</option><option value="comprador">Comprador</option><option value="solicitante">Solicitante</option>
                 </select></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#57B952] text-white font-bold py-2 mt-6 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">{loading ? '...' : 'Cadastrar'}</button>
          </form>
          <div className="text-center mt-6 text-sm"><Link to="/login" className="text-gray-500 hover:text-[#57B952]">Já tem conta? Fazer Login</Link></div>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;