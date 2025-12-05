import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, FileText, Briefcase, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
// ThemeToggle removed: app forced to light mode
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    if (!email) {
        setAlertInfo({ message: "O campo e-mail é obrigatório.", type: 'error' });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        nome, email, cpfMatricula, cargo: funcao, funcao: perfilAcesso, statusAcesso: 'pendente', uid: userCredential.user.uid, createdAt: new Date()
      });
      setAlertInfo({ message: "Solicitado! Aguarde aprovação.", type: 'success' });
      setTimeout(() => { navigate('/login'); }, 3000);
    } catch (error) {
      console.error("Erro:", error);
      let mensagemErro = "Erro ao criar conta.";
      if (error.code === 'auth/email-already-in-use') mensagemErro = "Este e-mail já está cadastrado.";
      if (error.code === 'auth/weak-password') mensagemErro = "A senha deve ter pelo menos 6 caracteres.";
      if (error.code === 'auth/invalid-email') mensagemErro = "O e-mail é inválido.";
      
      setAlertInfo({ message: mensagemErro, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftRegister = async () => {
    setLoading(true); setAlertInfo(null);
    const provider = new OAuthProvider('microsoft.com');
    
    // CORREÇÃO: Adiciona escopos para garantir que o email venha
    provider.addScope('email');
    provider.addScope('openid');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Tenta pegar o email do objeto principal ou dos dados do provedor
        const userEmail = user.email || user.providerData[0]?.email;
        
        if (!userEmail) {
            if (user) await user.delete().catch(()=>{}); 
            await signOut(auth);
            throw new Error("email-indisponivel");
        }
        
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            setAlertInfo({ message: "Conta já existe! Faça Login.", type: 'warning' });
            setTimeout(() => navigate('/login'), 2000);
        } else {
            await setDoc(docRef, { 
                nome: user.displayName || 'Usuário Microsoft', 
                email: userEmail, // Usa o email recuperado com segurança
                cpfMatricula: '', 
                cargo: 'Colaborador', 
                funcao: 'solicitante', 
                statusAcesso: 'ativo', 
                fotoURL: user.photoURL || null,
                uid: user.uid, 
                createdAt: new Date() 
            });
            
            setAlertInfo({ message: "Cadastro realizado! Redirecionando...", type: 'success' });
            setTimeout(() => navigate('/selecao-projeto'), 1500);
        }
    } catch (error) {
        console.error("Erro Microsoft:", error);
        if (error.message === 'email-indisponivel') {
             setAlertInfo({ message: "A Microsoft não forneceu seu e-mail. Verifique as permissões da conta.", type: 'error' });
        } else if (error.code === 'auth/invalid-credential') {
             setAlertInfo({ message: "Credenciais inválidas. Verifique o Client Secret.", type: 'error' });
        } else if (error.code === 'auth/account-exists-with-different-credential') {
             setAlertInfo({ message: "E-mail já cadastrado com senha. Faça login normal.", type: 'warning' });
        } else {
            setAlertInfo({ message: "Erro no cadastro.", type: 'error' });
        }
    } finally { setLoading(false); }
  };

  return (
  <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200 text-black">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      {/* ThemeToggle removed */}
      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 h-20 bg-white">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-10 w-auto object-contain" />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Criar Conta</h2>
          <button type="button" onClick={handleMicrosoftRegister} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white font-medium py-3 px-4 rounded-md transition-colors mb-6 border border-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>Cadastrar com Microsoft
          </button>
          <div className="flex items-center gap-4 mb-6"><div className="h-px bg-gray-300 flex-1"></div><span className="text-sm text-gray-500">ou manual</span><div className="h-px bg-gray-300 flex-1"></div></div>
          <form onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900" placeholder="Ex: João Silva" required /></div>
                 <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900" placeholder="email@exemplo.com" required /></div>
                 <div><label className="block text-sm font-medium text-gray-700">Senha</label><input type="password" value={senha} onChange={e=>setSenha(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900" placeholder="******" required /></div>
                 <div><label className="block text-sm font-medium text-gray-700">CPF</label><input type="text" value={cpfMatricula} onChange={e=>setCpfMatricula(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900" placeholder="000.000.000-00" required /></div>
                 <div><label className="block text-sm font-medium text-gray-700">Cargo</label><input type="text" value={funcao} onChange={e=>setFuncao(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900" placeholder="Ex: Analista" required /></div>
                 <div><label className="block text-sm font-medium text-gray-700">Perfil</label><select value={perfilAcesso} onChange={e=>setPerfilAcesso(e.target.value)} className="w-full pl-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] cursor-pointer" required><option value="" disabled>Selecione...</option><option value="comprador">Comprador</option><option value="solicitante">Solicitante</option></select></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#57B952] text-white font-bold py-2 mt-6 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">{loading ? '...' : 'Cadastrar'}</button>
          </form>
          <div className="text-center mt-6 text-sm"><Link to="/login" className="text-gray-500 hover:text-[#57B952]">Já tem conta? Fazer Login</Link></div>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0 bg-white border-t border-gray-200">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}

export default Cadastro;