import { Link, useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, ArrowLeft, User } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function AdminSelection() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 bg-[#111827] relative">
      <div className="relative z-50"><ThemeToggle /></div>
      <header className="relative w-full flex items-center justify-center py-6 px-8 bg-white bg-gray-800 shadow-sm border-b border-gray-200 border-gray-700 h-20">
        <Link to="/" className="flex items-center justify-center"><img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-8 w-auto object-contain" /></Link>
        <div className="absolute right-4 md:right-8 flex items-center gap-3 mr-16">
            <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 border-gray-600 hover:border-[#57B952] transition-all bg-gray-100 bg-gray-700 flex items-center justify-center">{userProfile?.fotoURL ? <img src={userProfile.fotoURL} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500 text-gray-400" />}</Link>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-900 text-white mb-2">Painel Administrativo</h1>
        <p className="text-gray-500 text-gray-400 mb-12">Selecione o módulo:</p>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
            <Link to="/admin" className="group bg-white bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 border-gray-700 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2">
                <div className="bg-purple-100 bg-purple-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform"><Users size={48} className="text-purple-600 text-purple-400" /></div>
                <h2 className="text-2xl font-bold text-gray-800 text-white mb-3">Gestão de Usuários</h2>
                <p className="text-gray-500 text-gray-400">Aprovar cadastros e gerenciar permissões.</p>
            </Link>
            <Link to="/aprovacao-compras" className="group bg-white bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 border-gray-700 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2">
                <div className="bg-green-100 bg-green-900/30 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform"><ShoppingCart size={48} className="text-green-600 text-green-400" /></div>
                <h2 className="text-2xl font-bold text-gray-800 text-white mb-3">Aprovação de Compras</h2>
                <p className="text-gray-500 text-gray-400">Aprovar e gerenciar pedidos de compra.</p>
            </Link>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}
export default AdminSelection;