import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UserCheck, BookOpen, LogIn, Building2, HardHat, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function Capa() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20 bg-white dark:bg-gray-800 transition-colors duration-200">
        <button onClick={() => navigate('/login')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
            <LogIn size={18} /> <span className="hidden sm:inline">Login Admin</span>
        </button>
        <div className="flex items-center gap-4">
            <img src="/img/petrobras.jpg" alt="Logo Petrobras" className="h-8 md:h-10 w-auto object-contain" />
            <span className="text-gray-300 dark:text-gray-600 text-2xl font-light">|</span>
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-5xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Bem-vindo ao Portal Integrado</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Selecione sua organização para acessar os serviços.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
                {/* Card PETROBRAS */}
                <Link to="/tutoriais" className="group relative w-full md:w-96 bg-gradient-to-br from-[#008542] to-[#005c2e] p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white overflow-hidden no-underline">
                    <div className="bg-[#008542] h-full rounded-xl p-8 flex flex-col items-center text-center relative z-10">
                        <div className="bg-white/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform"><HardHat size={48} className="text-white" /></div>
                        <h2 className="text-3xl font-bold mb-2 text-white">Sou Petrobras</h2>
                        <p className="text-white/80 mb-8">Acesso à base de conhecimento e tutoriais.</p>
                        <div className="mt-auto flex items-center gap-2 font-bold bg-white/20 px-6 py-3 rounded-full group-hover:bg-white group-hover:text-[#008542] transition-colors">Acessar Tutoriais <ChevronRight size={20} /></div>
                    </div>
                </Link>

                {/* Card NORMATEL */}
                {/* Link para a rota protegida -> Vai forçar o Login */}
                <Link to="/selecao-projeto" className="group relative w-full md:w-96 bg-gradient-to-br from-[#57B952] to-[#3d8c38] p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 text-white overflow-hidden text-left">
                    <div className="bg-[#57B952] h-full rounded-xl p-8 flex flex-col items-center text-center relative z-10">
                        <div className="bg-white/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform"><Building2 size={48} className="text-white" /></div>
                        <h2 className="text-3xl font-bold mb-2 text-white">Sou Normatel</h2>
                        <p className="text-white/80 mb-8">Gestão de compras e solicitações por projeto.</p>
                        <div className="mt-auto flex items-center gap-2 font-bold bg-white/20 px-6 py-3 rounded-full group-hover:bg-white group-hover:text-[#57B952] transition-colors">Selecionar Projeto <ChevronRight size={20} /></div>
                    </div>
                </Link>
            </div>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0">&copy; 2025 Parceria Petrobras & Normatel Engenharia</footer>
    </div>
  );
}
export default Capa;