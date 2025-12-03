import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, FileText, Briefcase, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert'; 
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Cadastro() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpfMatricula, setCpfMatricula] = useState('');
  
  // Corrigido: 'cargo' armazena o texto livre (Ex: Eletricista)
  const [cargo, setCargo] = useState(''); 
  // Corrigido: 'perfilAcesso' armazena a regra do sistema (comprador/solicitante)
  const [perfilAcesso, setPerfilAcesso] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertInfo(null);

    if (!email.endsWith('@normatel.com.br')) {
        setAlertInfo({ message: "Email deve ser corporativo (@normatel.com.br).", type: 'error' });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salva no Firestore com os nomes de campos corretos
      await setDoc(doc(db, 'users', user.uid), {
        nome: nome,
        email: email,
        cpfMatricula: cpfMatricula,
        cargo: cargo,        // Salva o cargo digitado (Texto)
        funcao: perfilAcesso, // Salva a função do sistema (Select)
        statusAcesso: 'pendente',
        uid: user.uid,
        createdAt: new Date()
      });

      setAlertInfo({ message: "Cadastro solicitado! Aguarde aprovação.", type: 'success' });

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

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      
      <ThemeToggle />

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20">
        <button 
            onClick={() => navigate('/')} 
            className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm"
        >
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>

        {/* LOGO DA PETROBRAS (Corrigido) */}
        <img 
            src="/img/petrobras.png"
            alt="Logo Petrobras" 
            className="h-10 md:h-12 w-auto object-contain" 
        />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <form onSubmit={handleRegisterSubmit} className="w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Criar Conta</h2>

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
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
                        value={cargo} 
                        onChange={e=>setCargo(e.target.value)} 
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
                        {/* Removi 'Solicitante' se o acesso for público, mas mantive caso queira cadastro interno */}
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
      </main>
      
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        &copy; 2025 Normatel Engenharia
      </footer>
    </div>
  );
}

export default Cadastro;