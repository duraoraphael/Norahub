import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UserCheck, BookOpen, LogIn } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function Capa() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // URL Microsoft para Compradores
  const MICROSOFT_LOGIN_URL = "https://login.microsoftonline.com/5b6f6241-9a57-4be4-8e50-1dfa72e79a57/saml2?client-request-id=a11f5aa4-04c4-4636-a676-e0909d6469bf&sso_nonce=AwABEgEAAAADAOz_BQD0_5AoZcZFSs3IJIr88ty4A03F6joxCtuYVTBLqhabT1TpC7k_J5yFrmxOd8DeZrIIhvkJySQcC6EKypB3Qrh4cLogAA&mscrid=a11f5aa4-04c4-4636-a676-e0909d6469bf";

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20">
        <button 
            onClick={() => navigate('/login')} 
            className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm"
        >
            <LogIn size={18} /> <span className="hidden sm:inline">Login Admin</span>
        </button>

        <img 
            src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
            alt="Logo Normatel" 
            className="h-8 md:h-10 w-auto object-contain" 
        />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 md:gap-8 w-full max-w-7xl">
            
            {/* Card Comprador - Link Externo Direto */}
            <a 
                href={MICROSOFT_LOGIN_URL}
                className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 text-center transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 no-underline w-full md:w-80 lg:w-72 border border-gray-200 dark:border-gray-700"
            >
                <div className="h-32 flex items-center justify-center">
                    <img src="/img/Comprador.png" alt="Comprador" className="max-h-full w-auto object-contain" />
                </div>
                <ShoppingCart className="w-12 h-12 text-blue-500 dark:text-blue-400 transition-transform group-hover:scale-110" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sou Comprador</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Acesse o portal Microsoft.</p>
                </div>
            </a>

            {/* Card Solicitante - Link Interno Direto (Sem Login) */}
            <Link 
                to="/solicitacao-compras" 
                className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 text-center transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 no-underline w-full md:w-80 lg:w-72 border border-gray-200 dark:border-gray-700"
            >
                <div className="h-32 flex items-center justify-center">
                    <img src="/img/Solicitante.png" alt="Solicitante" className="max-h-full w-auto object-contain" />
                </div>
                <UserCheck className="w-12 h-12 text-green-500 dark:text-green-400 transition-transform group-hover:scale-110" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sou Solicitante</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Faça novas solicitações.</p>
                </div>
            </Link>

            {/* Card Tutoriais */}
            <Link 
                to="/tutoriais" 
                className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 text-center transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 no-underline w-full md:w-80 lg:w-72 border border-gray-200 dark:border-gray-700"
            >
                <div className="h-32 flex items-center justify-center">
                    <img src="/img/Tutoriais.png" alt="Tutoriais" className="max-h-full w-auto object-contain" />
                </div>
                <BookOpen className="w-12 h-12 text-yellow-500 dark:text-yellow-400 transition-transform group-hover:scale-110" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ver Tutoriais</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Aprenda a usar a plataforma.</p>
                </div>
            </Link>
        </div>
      </main>
      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}
export default Capa;