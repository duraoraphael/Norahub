import { Link } from 'react-router-dom';
import { ShoppingCart, UserCheck, BookOpen } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

function Capa() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden">
      
      <ThemeToggle />

      <header className="w-full flex justify-center py-8 md:py-12 shrink-0">
        <img 
            src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
            alt="Logo Normatel" 
            className="w-40 md:w-48 h-auto object-contain" 
        />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-6 md:gap-8 w-full max-w-7xl">
        
            {/* Card 1 - Comprador */}
            {/* Passamos state={{ tipo: 'comprador' }} */}
            <Link 
                to="/login" 
                state={{ tipo: 'comprador' }} 
                className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 text-center transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl transform hover:-translate-y-2 no-underline w-full md:w-80 lg:w-72 border border-gray-200 dark:border-gray-700"
            >
                <div className="h-32 flex items-center justify-center">
                    <img src="/img/Comprador.png" alt="Comprador" className="max-h-full w-auto object-contain" />
                </div>
                <ShoppingCart className="w-12 h-12 text-blue-500 dark:text-blue-400 transition-transform group-hover:scale-110" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sou Comprador</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Acesse o portal de compras, acompanhe pedidos e gerencie fornecedores.</p>
                </div>
            </Link>

            {/* Card 2 - Solicitante */}
            {/* Passamos state={{ tipo: 'solicitante' }} para saber que devemos redirecionar para o formulário */}
            <Link 
                to="/login" 
                state={{ tipo: 'solicitante' }}
                className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 text-center transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl transform hover:-translate-y-2 no-underline w-full md:w-80 lg:w-72 border border-gray-200 dark:border-gray-700"
            >
                <div className="h-32 flex items-center justify-center">
                    <img src="/img/Solicitante.png" alt="Solicitante" className="max-h-full w-auto object-contain" />
                </div>
                <UserCheck className="w-12 h-12 text-green-500 dark:text-green-400 transition-transform group-hover:scale-110" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sou Solicitante</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Faça novas solicitações de forma rápida.</p>
                </div>
            </Link>

            {/* Card 3 - Tutoriais */}
            <Link to="/tutoriais" className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center gap-4 text-center transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl transform hover:-translate-y-2 no-underline w-full md:w-80 lg:w-72 border border-gray-200 dark:border-gray-700">
                <div className="h-32 flex items-center justify-center">
                    <img src="/img/Tutoriais.png" alt="Tutoriais" className="max-h-full w-auto object-contain" />
                </div>
                <BookOpen className="w-12 h-12 text-yellow-500 dark:text-yellow-400 transition-transform group-hover:scale-110" />
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ver Tutoriais</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Aprenda a usar a plataforma Fracttal com os nossos Tutoriais.</p>
                </div>
            </Link>

        </div>
      </main>

      <footer className="w-full py-4 text-center text-gray-500 text-xs shrink-0">
        &copy; 2025 Normatel Engenharia
      </footer>
    </div>
  );
}

export default Capa;