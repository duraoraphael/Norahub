import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, ArrowLeft, ExternalLink, User } from 'lucide-react'; // Adicionado User
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // Importar Auth

function PainelProjeto() {
  const { theme } = useTheme();
  const { currentUser, userProfile } = useAuth(); // Pegar usuário
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  
  const projeto = location.state?.projeto;

  // Dados Perfil
  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';
  const fotoURL = userProfile?.fotoURL || currentUser?.photoURL;

  // VALIDAÇÃO: Verifica se o usuário tem acesso a este projeto
  const temAcesso = () => {
    if (!projeto || !userProfile) return false;
    
    // Admin tem acesso a tudo
    if (userProfile.funcao === 'admin') return true;
    
    // Usuário comum: verificar se está em membros ou se o projeto bate com seu projeto
    const membrosDoProjeto = projeto.membros || [];
    const projetoDoProjeto = projeto.projeto || projeto.nome;
    const projetoDoUsuario = userProfile.projeto || userProfile.departamento;
    
    return membrosDoProjeto.includes(currentUser?.uid) || projetoDoProjeto === projetoDoUsuario;
  };

  if (!projeto) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <button onClick={() => navigate('/selecao-projeto')} className="text-[#57B952]">Voltar para Seleção</button>
        </div>
      );
  }

  // Se não tem acesso, redireciona
  if (!temAcesso()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p className="text-gray-600">Você não tem permissão para acessar este projeto.</p>
        <button onClick={() => navigate('/selecao-projeto')} className="px-4 py-2 bg-[#57B952] text-white rounded hover:bg-green-600">Voltar</button>
      </div>
    );
  }

  // Fallback seguro
  const linkSolicitacao = projeto.urlForms || projeto.url || '#';
  const linkAprovacao = projeto.urlSharePoint || 'https://normatelce.sharepoint.com/';

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 transition-colors duration-200 text-black">
    {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 h-20 bg-white">
        <button onClick={() => navigate('/selecao-projeto')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Trocar Projeto</span>
        </button>
        
        <div className="flex items-center gap-4">
                <img src="/img/Noralogoo.jpg" alt="Logo Nora" className="h-8 md:h-10 w-auto object-contain" />
            <span className="text-gray-600 text-2xl font-light">|</span>
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
        </div>

        {/* PERFIL NO CANTO DIREITO */}
        {currentUser && (
            <div className="absolute right-4 md:right-8 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 hidden md:block">Olá, {primeiroNome}</span>
                <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#57B952] transition-all bg-gray-100 flex items-center justify-center">
                    {fotoURL ? <img src={fotoURL} alt="Perfil" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />}
                </Link>
            </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
            
            <div className="text-center mb-12">
                <h2 className="text-sm font-bold text-[#57B952] uppercase tracking-widest mb-2">
                    Ambiente de Trabalho
                </h2>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {projeto.nome}
                </h1>
                <p className="text-gray-500 mt-2">Selecione a operação desejada para esta base.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
                
                {/* Card 1: Solicitação */}
                <a 
                    href={linkSolicitacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2 cursor-pointer"
                >
                    <div className="bg-green-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-green-600">
                        <FileText size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Nova Solicitação</h2>
                    <p className="text-gray-500 mb-6">
                        Preencher formulário de requisição para {projeto.nome}.
                    </p>
                    <div className="mt-auto flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                        Acessar Formulário <ExternalLink size={16} />
                    </div>
                </a>

                {/* Card 2: Aprovação */}
                <a 
                    href={linkAprovacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2 cursor-pointer"
                >
                    <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-blue-600">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Aprovação / Painel</h2>
                    <p className="text-gray-500 mb-6">
                        Acessar lista de pedidos e aprovações desta base.
                    </p>
                    <div className="mt-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                        Acessar Painel <ExternalLink size={16} />
                    </div>
                </a>

            </div>
        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 bg-white">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default PainelProjeto;