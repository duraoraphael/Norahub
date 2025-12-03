import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, FileText, Briefcase, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert'; 
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, OAuthProvider, signOut } from 'firebase/auth'; // Adicionados imports
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Adicionado getDoc

function Cadastro() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpfMatricula, setCpfMatricula] = useState('');
  
  const [funcao, setFuncao] = useState(''); 
  const [perfilAcesso, setPerfilAcesso] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Função para Cadastro via E-mail/Senha
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    if (!email.endsWith('@normatel.com.br')) {
        setAlertInfo({ message: "Cadastro permitido apenas para e-mails @normatel.com.br", type: 'error' });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        nome: nome,
        email: email,
        cpfMatricula: cpfMatricula,
        cargo: funcao,
        funcao: perfilAcesso, 
        statusAcesso: 'pendente',
        uid: user.uid,
        createdAt: new Date()
      });

      setAlertInfo({ message: "Solicitação de cadastro enviada! Aguarde a aprovação.", type: 'success' });

      setTimeout(() => {
        navigate('/login'); 
      }, 3000);

    } catch (error) {
      console.error("Erro detalhado:", error);
      let mensagemErro = "Erro ao criar conta.";
      if (error.code === 'auth/email-already-in-use') mensagemErro = "Este e-mail já está cadastrado.";
      if (error.code === 'auth/weak-password') mensagemErro = "A senha deve ter pelo menos 6 caracteres.";
      
      setAlertInfo({ message: mensagemErro, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO: Cadastro com Microsoft
  const handleMicrosoftRegister = async () => {
    setLoading(true);
    setAlertInfo(null);
    const provider = new OAuthProvider('microsoft.com');

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Validação de Domínio
        if (!user.email.endsWith('@normatel.com.br')) {
            await user.delete(); // Opcional: remove o user do Auth se não for corporativo
            await signOut(auth);
            throw new Error("dominio-invalido");
        }

        // Verifica se já existe perfil no banco
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Se já existe, avisa e manda pro login
            setAlertInfo({ message: "Você já possui cadastro! Redirecionando para o login...", type: 'warning' });
            setTimeout(() => navigate('/login'), 2000);
        } else {
            // Se não existe, CRIA O PERFIL PENDENTE
            await setDoc(docRef, {
                nome: user.displayName || 'Usuário Microsoft',
                email: user.email,
                cpfMatricula: '', // Campo em branco pois o Microsoft não fornece
                cargo: 'Colaborador', // Padrão genérico
                funcao: 'solicitante', // Padrão seguro
                statusAcesso: 'pendente',
                uid: user.uid,
                createdAt: new Date()
            });
            
            await signOut(auth); // Desloga para forçar a aprovação
            setAlertInfo({ message: "Cadastro Microsoft solicitado! Aguarde a aprovação.", type: 'success' });
            setTimeout(() => navigate('/login'), 3000);
        }

    } catch (error) {
        console.error("Erro Microsoft:", error);
        if (error.message === 'dominio-invalido') {
            setAlertInfo({ message: "Acesso restrito a contas @normatel.com.br", type: 'error' });
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            setAlertInfo({ message: "E-mail já cadastrado com senha. Faça login.", type: 'warning' });
        } else {
            setAlertInfo({ message: `Erro no cadastro: ${error.code || error.message}`, type: 'error' });
        }
    } finally {
        setLoading(false);
    }
  };

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
            alt="Logo Petrobras" 
            className="h-10 md:h-12 w-auto object-contain" 
        />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Criar Conta</h2>
          
          {/* BOTÃO MICROSOFT PARA CADASTRO */}
          <button 
            type="button" 
            onClick={handleMicrosoftRegister} 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white font-medium py-3 px-4 rounded-md transition-colors mb-6 border border-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21"><path fill="#f25022" d="M1 1h9v9H1z"/><path fill="#00a4ef" d="M1 11h9v9H1z"/><path fill="#7fba00" d="M11 1h9v9h-9z"/><path fill="#ffb900" d="M11 11h9v9h-9z"/></svg>
            Cadastrar com Microsoft
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            <span className="text-sm text-gray-500">ou preencha manualmente</span>
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
          </div>

          <form onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><User className="h-5 w-5 text-gray-400" /></span>
                        <input 
                            type="text" 
                            value={nome} 
                            onChange={e=>setNome(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500" 
                            placeholder="Ex: João da Silva" 
                            required 
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Corporativo</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-5 w-5 text-gray-400" /></span>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e=>setEmail(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500" 
                            placeholder="email@normatel.com.br" 
                            required 
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-5 w-5 text-gray-400" /></span>
                        <input 
                            type="password" 
                            value={senha} 
                            onChange={e=>setSenha(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500" 
                            placeholder="Mínimo 6 caracteres" 
                            required 
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF / Matrícula</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FileText className="h-5 w-5 text-gray-400" /></span>
                        <input 
                            type="text" 
                            value={cpfMatricula} 
                            onChange={e=>setCpfMatricula(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500" 
                            placeholder="000.000.000-00" 
                            required 
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo / Função</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Briefcase className="h-5 w-5 text-gray-400" /></span>
                        <input 
                            type="text" 
                            value={funcao} 
                            onChange={e=>setFuncao(e.target.value)} 
                            placeholder="Ex: Eletricista" 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] placeholder-gray-400 dark:placeholder-gray-500" 
                            required 
                        />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil de Acesso</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Shield className="h-5 w-5 text-gray-400" /></span>
                        <select 
                            value={perfilAcesso} 
                            onChange={e=>setPerfilAcesso(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#57B952] cursor-pointer" 
                            required
                        >
                            <option value="" disabled>Selecionar perfil...</option>
                            <option value="comprador">Comprador (Aprova)</option>
                            <option value="solicitante">Solicitante (Pede)</option>
                        </select>
                    </div>
                 </div>

              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex items-center justify-center gap-2 bg-[#57B952] text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-colors mt-6 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : <><UserPlus size={20} /> Finalizar Cadastro</>}
              </button>

              <div className="text-center mt-6 text-sm">
                <Link to="/login" className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#57B952] transition-colors">
                  Já tem conta? Fazer Login
                </Link>
              </div>

          </form>
        </div>
      </main>
      
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        &copy; 2025 Normatel Engenharia
      </footer>
    </div>
  );
}

export default Cadastro;