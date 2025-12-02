import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, HardHat, ChevronRight, ArrowLeft, LogIn, ShoppingCart, UserCheck } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function Capa() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Estado para controlar se mostrou as opções da Normatel
  const [showNormatelOptions, setShowNormatelOptions] = useState(false);

  // URL Microsoft para Compradores
  const MICROSOFT_LOGIN_URL = "https://normatelce.sharepoint.com/:l:/s/UTGC/JAAr4HTyoKL1Q6Yo4WZ0snOqAQcc4lds9n17S8FtSmrXL-0?e=cL1VPK";


  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20 bg-white dark:bg-gray-800 transition-colors duration-200">
        
        {/* Botão de Login Admin (Discreto no canto) */}
        <button 
            onClick={() => navigate('/login')} 
            className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm"
        >
            <LogIn size={18} /> <span className="hidden sm:inline">Acesso Administrativo</span>
        </button>

        {/* Logos (Conceito de Parceria) */}
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
                
                <div className="flex items-center gap-3">
                    <img 
                        src={isDark ? "/img/petrobras.jpg" : "/img/petrobras.jpg"}
                        alt="Logo Normatel" 
                        className="h-6 md:h-8 w-auto object-contain" 
                    />
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <img 
                        src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
                        alt="Logo Normatel" 
                        className="h-6 md:h-8 w-auto object-contain" 
                    />
                </div>
            </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-5xl">
            
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                    Bem-vindo ao Portal Integrado
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Selecione sua organização para acessar os serviços e ferramentas disponíveis.
                </p>
            </div>

            {!showNormatelOptions ? (
                // TELA INICIAL: ESCOLHA A EMPRESA
                <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
                    
                    {/* Card PETROBRAS -> Vai para Tutoriais */}
                    <Link 
                        to="/tutoriais" 
                        className="group relative w-full md:w-96 bg-gradient-to-br from-[#008542] to-[#005c2e] p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white overflow-hidden no-underline"
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="bg-[#008542] h-full rounded-xl p-8 flex flex-col items-center text-center relative z-10">
                            <div className="bg-white/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                                <HardHat size={48} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-white">Sou Petrobras</h2>
                            <p className="text-white/80 mb-8">Acesso à base de conhecimento, tutoriais e guias operacionais.</p>
                            <div className="mt-auto flex items-center gap-2 font-bold bg-white/20 px-6 py-3 rounded-full group-hover:bg-white group-hover:text-[#008542] transition-colors">
                                Acessar Tutoriais <ChevronRight size={20} />
                            </div>
                        </div>
                    </Link>

                    {/* Card NORMATEL -> Abre opções */}
                    <button 
                        onClick={() => setShowNormatelOptions(true)}
                        className="group relative w-full md:w-96 bg-gradient-to-br from-[#57B952] to-[#3d8c38] p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white overflow-hidden text-left"
                    >
                         <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="bg-[#57B952] h-full rounded-xl p-8 flex flex-col items-center text-center relative z-10">
                            <div className="bg-white/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                                <Building2 size={48} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-white">Sou Normatel</h2>
                            <p className="text-white/80 mb-8">Gestão de compras, solicitações internas e área administrativa.</p>
                            <div className="mt-auto flex items-center gap-2 font-bold bg-white/20 px-6 py-3 rounded-full group-hover:bg-white group-hover:text-[#57B952] transition-colors">
                                Selecionar Perfil <ChevronRight size={20} />
                            </div>
                        </div>
                    </button>

                </div>
            ) : (
                // TELA SECUNDÁRIA: OPÇÕES NORMATEL (Aparece ao clicar no card verde claro)
                <div className="animate-fade-in w-full flex flex-col items-center">
                    <button 
                        onClick={() => setShowNormatelOptions(false)}
                        className="mb-8 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-[#57B952] transition-colors font-medium self-start md:self-center"
                    >
                        <ArrowLeft size={20} /> Voltar para seleção de empresa
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                        
                        {/* Opção Solicitante */}
                        <Link 
                            to="/solicitacao-compras" 
                            className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-6 hover:border-[#57B952] transition-all hover:shadow-xl no-underline"
                        >
                            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full text-[#57B952]">
                                <UserCheck size={32} />
                            </div>
                            <div className="text-left flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#57B952] transition-colors">Sou Solicitante</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fazer novas solicitações de compras.</p>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-[#57B952]" />
                        </Link>

                        {/* Opção Comprador (Link Externo) */}
                        <a 
                            href={MICROSOFT_LOGIN_URL}
                            className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-6 hover:border-[#57B952] transition-all hover:shadow-xl no-underline"
                        >
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full text-blue-600 dark:text-blue-400">
                                <ShoppingCart size={32} />
                            </div>
                            <div className="text-left flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#57B952] transition-colors">Sou Comprador</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Acessar painel Microsoft.</p>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-[#57B952]" />
                        </a>

                    </div>
                </div>
            )}

        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 dark:border-gray-800 mt-auto bg-white dark:bg-gray-900">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default Capa;