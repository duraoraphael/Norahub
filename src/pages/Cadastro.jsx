  const handleMicrosoftRegister = async () => {
    setLoading(true);
    setAlertInfo(null);
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verifica se o usuário já existe
      const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
      
      if (userDoc.exists()) {
        setAlertInfo({ message: 'Este usuário já está cadastrado.', type: 'error' });
        await signOut(auth);
        setLoading(false);
        return;
      }

      // Cria novo usuário no Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome: user.displayName || '',
        email: user.email,
        cpfMatricula: '',
        cargo: '',
        funcao: 'colaborador',
        statusAcesso: 'ativo',
        uid: user.uid,
        createdAt: new Date()
      });

      setLoading(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro Microsoft:', error);
      
      // Fallback para redirect se COOP bloquear popup
      const coopBlocked = error?.message?.includes('window.closed');
      if (coopBlocked) {
        try {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          console.error('Erro Microsoft (redirect):', redirectError);
          setAlertInfo({ message: 'Erro ao redirecionar para login Microsoft.', type: 'error' });
        }
      } else {
        setAlertInfo({ message: 'Erro ao cadastrar com Microsoft.', type: 'error' });
      }
      setLoading(false);
    }
  };
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, FileText, Briefcase, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
// import Alert from '../components/Alert'; 
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

  const formatCPF = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 6);
    const part3 = digits.slice(6, 9);
    const part4 = digits.slice(9, 11);
    let result = part1;
    if (part2) result += `.${part2}`;
    if (part3) result += `.${part3}`;
    if (part4) result += `-${part4}`;
    return result;
  };
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

    try {
      // Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const userId = user?.uid;

      if (!userId) {
        throw new Error('Usuario nao autenticado apos cadastro.');
      }

      try {
        // Dados do usuário
        const userData = {
          nome,
          email,
          cpfMatricula,
          cargo: funcao,
          funcao: 'colaborador',
          statusAcesso: 'ativo',
          uid: userId,
          createdAt: new Date()
        };

        let success = false;
        let lastError = null;

        // Tenta até 3 vezes gravar no Firestore
        for (let i = 0; i < 3; i++) {
          try {
            await setDoc(doc(db, 'usuarios', userId), userData);
            success = true;
            console.log('Documento criado com sucesso!');
            break;
          } catch (err) {
            console.log(`Tentativa ${i + 1} falhou:`, err.message);
            lastError = err;
            if (i < 2) {
              await new Promise(resolve => setTimeout(resolve, 800));
            }
          }
        }

        if (!success) {
          throw lastError;
        }

        // Sucesso! Desloga e redireciona para login
        await signOut(auth);
        setLoading(false);
        setAlertInfo({ message: 'Cadastro realizado com sucesso! Redirecionando...', type: 'success' });
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1200);

      } catch (firestoreError) {
        // Se falhou ao criar documento, remove o usuário criado
        console.error('Erro ao criar documento no Firestore:', firestoreError);
        try {
          await signOut(auth);
        } catch (e) {
          console.error('Erro ao fazer signOut:', e);
        }
        setLoading(false);
        setAlertInfo({ 
          message: 'Erro ao salvar dados. Tente novamente ou faça login para continuar.', 
          type: 'error' 
        });
      }

    } catch (error) {
      console.error('Erro no cadastro:', error);
      setLoading(false);
      
      // Trata erros específicos do Firebase Auth
      if (error.code === 'auth/email-already-in-use') {
        setAlertInfo({ message: 'Este e-mail já está cadastrado.', type: 'error' });
      } else if (error.code === 'auth/weak-password') {
        setAlertInfo({ message: 'A senha deve ter pelo menos 6 caracteres.', type: 'error' });
      } else if (error.code === 'auth/invalid-email') {
        setAlertInfo({ message: 'E-mail inválido.', type: 'error' });
      } else {
        setAlertInfo({ message: 'Erro ao criar conta. Tente novamente.', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200 text-black">
      {alertInfo && (
        <div className={`fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg ${
          alertInfo.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-medium text-xs sm:text-sm max-w-xs sm:max-w-sm`}>
          {alertInfo.message}
        </div>
      )}
    <header className="relative w-full flex items-center justify-center py-2 sm:py-3 md:py-6 px-2 sm:px-4 md:px-8 border-b border-gray-200 min-h-[48px] sm:min-h-[56px] md:h-20 bg-white">
      <button onClick={() => navigate('/')} className="absolute left-2 sm:left-4 md:left-8 flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs sm:text-sm shrink-0 z-10">
           <ArrowLeft size={14} className="sm:w-[16px] sm:h-[16px] md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Voltar</span>
      </button>
      <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-5 sm:h-6 md:h-10 w-auto object-contain" />
    </header>
    <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 min-h-screen">
      <div className="w-full max-w-xs sm:max-w-sm bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl border border-gray-200 p-3 sm:p-4 md:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3 sm:mb-4 md:mb-6">Criar Conta</h2>
        <button type="button" onClick={handleMicrosoftRegister} disabled={loading} className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#2F2F2F] hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-md transition-colors mb-4 sm:mb-6 border border-gray-600 text-xs sm:text-sm">
          {loading ? (
            <>
              <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processando...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="sm:w-[21px] sm:h-[21px]" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
              <span>Cadastrar com Microsoft</span>
            </>
          )}
        </button>
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6"><div className="h-px bg-gray-300 flex-1"></div><span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">ou manual</span><div className="h-px bg-gray-300 flex-1"></div></div>
        <form onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <div className="sm:col-span-2"><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full pl-3 sm:pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900 text-sm" placeholder="Ex: João Silva" required /></div>
               <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-3 sm:pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900 text-sm" placeholder="email@exemplo.com" required /></div>
               <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Senha</label><input type="password" value={senha} onChange={e=>setSenha(e.target.value)} className="w-full pl-3 sm:pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900 text-sm" placeholder="******" required /></div>
               <div><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">CPF</label><input type="text" value={cpfMatricula} onChange={e=>setCpfMatricula(formatCPF(e.target.value))} className="w-full pl-3 sm:pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900 text-sm" placeholder="000.000.000-00" required /></div>
               <div className="sm:col-span-2"><label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Cargo</label><input type="text" value={funcao} onChange={e=>setFuncao(e.target.value)} className="w-full pl-3 sm:pl-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 text-gray-900 text-sm" placeholder="Ex: Analista" required /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#57B952] text-white font-bold py-2 sm:py-2.5 mt-4 sm:mt-6 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cadastrando...</span>
                </span>
              ) : (
                'Cadastrar'
              )}
            </button>
        </form>
        <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm"><Link to="/login" className="text-gray-500 hover:text-[#57B952]">Já tem conta? Fazer Login</Link></div>
      </div>
    </main>
    <footer className="w-full py-3 sm:py-4 text-center text-gray-500 text-xs shrink-0 bg-white border-t border-gray-200 px-2">&copy; 2025 Normatel Engenharia</footer>
  </div>
  );
}

export default Cadastro;