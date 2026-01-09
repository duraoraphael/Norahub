import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UserCheck, BookOpen, LogIn, Building2, HardHat, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

function Capa() {
  const navigate = useNavigate();

    // Desloga usuário sempre que entrar na página inicial (Capa)
    useEffect(() => {
        signOut(auth).catch(() => {});
    }, []);

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200">
      
    {/* ThemeToggle removed */}

    <header className="relative w-full flex items-center justify-center py-2 sm:py-3 md:py-6 px-2 sm:px-4 md:px-8 border-b border-gray-200 min-h-[48px] sm:min-h-[56px] md:h-20 bg-white transition-colors duration-200">
        <button 
            onClick={() => navigate('/login')} 
            className="absolute left-2 sm:left-4 md:left-8 flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs sm:text-sm"
        >
            <LogIn size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Login</span>
        </button>

        {/* Logos Centralizadas (Parceria) */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <img src="/img/NoraHub.png" alt="Logo Petrobras" className="h-6 sm:h-8 md:h-10 w-auto object-contain" />
            <span className="text-gray-300 text-lg sm:text-xl md:text-2xl font-light">|</span>
            <img src="/img/Normatel Engenharia_PRETO.png" alt="Logo Normatel" className="h-6 sm:h-8 md:h-10 w-auto object-contain" />
        </div>
      </header>

    <main className="flex-grow flex flex-col items-center justify-center p-3 sm:p-4 md:p-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                Bem-vindo ao Portal
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Selecione sua organização para acessar os serviços.
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-stretch w-full max-w-sm sm:max-w-2xl md:max-w-5xl px-2">
            
            {/* Card PETROBRAS */}
            <Link 
                to="/tutoriais" 
                className="group relative w-full md:w-96 md:h-96 bg-gradient-to-br from-[#008542] to-[#005c2e] p-1 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all transform hover:-translate-y-1 sm:hover:-translate-y-2 text-white overflow-hidden no-underline"
            >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="bg-[#008542] h-full rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center text-center relative z-10">
                    <div className="bg-white/20 p-3 sm:p-4 md:p-6 rounded-full mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                        <HardHat size={32} className="sm:w-[40px] sm:h-[40px] md:w-[48px] md:h-[48px] text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Sou Petrobras</h2>
                    <p className="text-xs sm:text-sm md:text-base text-white/80 mb-4 sm:mb-6 md:mb-8">Acesso à base de conhecimento e tutoriais.</p>
                    <div className="mt-auto flex items-center gap-1 sm:gap-2 font-bold bg-white/20 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full group-hover:bg-white group-hover:text-[#008542] transition-colors text-xs sm:text-sm md:text-base">
                        Acessar Tutoriais <ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
                    </div>
                </div>
            </Link>

            {/* Card NORMATEL -> AGORA VAI PARA O LOGIN */}
            <Link 
                to="/login" 
                className="group relative w-full md:w-96 md:h-96 bg-gradient-to-br from-[#57B952] to-[#3d8c38] p-1 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all transform hover:-translate-y-1 sm:hover:-translate-y-2 text-white overflow-hidden text-left"
            >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="bg-[#57B952] h-full rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center text-center relative z-10">
                    <div className="bg-white/20 p-3 sm:p-4 md:p-6 rounded-full mb-3 sm:mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                        <Building2 size={32} className="sm:w-[40px] sm:h-[40px] md:w-[48px] md:h-[48px] text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Sou Normatel</h2>
                    <p className="text-xs sm:text-sm md:text-base text-white/80 mb-4 sm:mb-6 md:mb-8">Gestão de compras e solicitações por projeto.</p>
                    <div className="mt-auto flex items-center gap-1 sm:gap-2 font-bold bg-white/20 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full group-hover:bg-white group-hover:text-[#57B952] transition-colors text-xs sm:text-sm md:text-base">
                        Fazer Login <ChevronRight size={16} className="sm:w-[20px] sm:h-[20px]" />
                    </div>
                </div>
            </Link>

        </div>
      </main>
        <footer className="w-full py-3 sm:py-4 text-center text-gray-500 text-xs shrink-0 bg-white border-t border-gray-200 transition-colors duration-200 px-2">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}
export default Capa;