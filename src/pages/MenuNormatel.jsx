import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, ShoppingCart, ArrowLeft, User, LogOut, ChevronRight } from 'lucide-react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

function MenuNormatel() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // Links
  const LINK_COMPRADOR_DESTINO = "https://normatelce.sharepoint.com/"; 
  const LINK_SOLICITANTE = "https://normatelce.sharepoint.com/:l:/s/Projeto743-FacilitiesMultiserviosCabinas/JACsQKjPAViPSbfkQUOC15tGARSUJt6NWklSnGKDPKx3DUA?nav=MjcyYzUzOTAtZTkzYi00Y2I1LTg1MDMtMDFkMWQwZmU1MGE4";

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200 text-black">
      {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 h-20 bg-white">
        <button onClick={handleLogout} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm">
             <LogOut size={18} /> <span className="hidden sm:inline">Sair</span>
        </button>
        
        <div className="flex items-center gap-4">
        <img src="/img/Noralogoo.jpg" alt="Logo Petrobras" className="h-8 md:h-10 w-auto object-contain" />
        <span className="text-gray-600 text-2xl font-light">|</span>
        <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
      </div>

        <div className="absolute right-4 md:right-8 flex items-center gap-3 mr-16">
             <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#57B952] transition-all bg-gray-100 flex items-center justify-center">{userProfile?.fotoURL ? <img src={userProfile.fotoURL} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />}</Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Principal</h1>
              <p className="text-gray-500">Selecione seu perfil de acesso.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Solicitante */}
                <a 
                    href={LINK_SOLICITANTE}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group bg-white bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 border-gray-700 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 cursor-pointer"
                >
                    <div className="bg-green-100 bg-green-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-[#57B952]">
                        <UserCheck size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sou Solicitante</h3>
                    <p className="text-gray-500 mb-6">Fazer novas solicitações.</p>
                    <span className="text-[#57B952] font-bold flex items-center gap-1">Acessar <ChevronRight size={16} /></span>
                </a>

                {/* Card Comprador */}
                <a 
                    href={LINK_COMPRADOR_DESTINO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 border-gray-700 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 cursor-pointer"
                >
                    <div className="bg-blue-100 bg-blue-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-blue-600 text-blue-400">
                        <ShoppingCart size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sou Comprador</h3>
                    <p className="text-gray-500 mb-6">Painel de aprovação.</p>
                    <span className="text-blue-600 text-blue-400 font-bold flex items-center gap-1">Acessar <ChevronRight size={16} /></span>
                </a>
            </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 border-gray-800 bg-white bg-gray-900">&copy; 2025 Parceria Petrobras & Normatel Engenharia</footer>
    </div>
  );
}

export default MenuNormatel;