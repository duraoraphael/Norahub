import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function PainelProjeto() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  
  const projeto = location.state?.projeto;

  if (!projeto) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111827]">
            <button onClick={() => navigate('/selecao-projeto')} className="text-[#57B952]">Voltar para Seleção</button>
        </div>
      );
  }

  // Fallback seguro caso o projeto seja antigo e não tenha os campos novos
  const linkSolicitacao = projeto.urlForms || projeto.url || '#';
  const linkAprovacao = projeto.urlSharePoint || 'https://normatelce.sharepoint.com/';

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 dark:bg-[#111827] transition-colors duration-200">
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20 bg-white dark:bg-gray-800">
        <button onClick={() => navigate('/selecao-projeto')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Trocar Projeto</span>
        </button>
        <div className="flex items-center gap-4">
           <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
            
            <div className="text-center mb-12">
                <h2 className="text-sm font-bold text-[#57B952] uppercase tracking-widest mb-2">Ambiente de Trabalho</h2>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{projeto.nome}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Selecione a operação desejada para esta base.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
                
                {/* Card 1: Solicitação (Link Específico do Projeto) */}
                <a 
                    href={linkSolicitacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2 cursor-pointer"
                >
                    <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-green-600 dark:text-green-400">
                        <FileText size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Nova Solicitação</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Preencher formulário de requisição para {projeto.nome}.</p>
                    <div className="mt-auto flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                        Acessar Formulário <ExternalLink size={16} />
                    </div>
                </a>

                {/* Card 2: Aprovação (Link Específico do Projeto) */}
                <a 
                    href={linkAprovacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2 cursor-pointer"
                >
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-blue-600 dark:text-blue-400">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Aprovação / Painel</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Acessar lista de pedidos e aprovações desta base.</p>
                    <div className="mt-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                        Acessar Painel <ExternalLink size={16} />
                    </div>
                </a>

            </div>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">&copy; 2025 Parceria Petrobras & Normatel Engenharia</footer>
    </div>
  );
}
export default PainelProjeto;