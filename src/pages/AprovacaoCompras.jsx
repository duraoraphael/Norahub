import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, AlertCircle, LogOut, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert'; // 1. Importar o Alerta

function AprovacaoCompras() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const navigate = useNavigate();

  // 2. Estado para o alerta
  const [alertInfo, setAlertInfo] = useState(null);

  const handleAction = (action) => {
    // Define a mensagem e o tipo baseados na ação
    let message = `Pedido ${action} com sucesso!`;
    let type = 'success';

    if (action === 'Reprovado') {
        type = 'error'; // Fica vermelho se reprovar
    } else if (action === 'Solicitado Ajuste') {
        message = 'Solicitação de ajuste enviada.';
        type = 'success'; // Ou poderia criar um tipo 'warning' no componente Alert
    }

    // 3. Mostra o alerta
    setAlertInfo({ message, type });

    // Espera 2 segundos para o usuário ler antes de sair
    setTimeout(() => {
        navigate('/'); 
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 dark:bg-[#111827] transition-colors duration-200 relative">
      
      {/* 4. Renderizar o Alerta */}
      {alertInfo && (
        <Alert 
          message={alertInfo.message} 
          type={alertInfo.type} 
          onClose={() => setAlertInfo(null)} 
        />
      )}

      <div className="relative z-50">
        <ThemeToggle />
      </div>

      <header className="relative w-full flex items-center justify-center py-6 px-4 md:px-8 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-20">
        
        <button 
            onClick={() => navigate('/')} 
            className="absolute left-4 md:left-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 font-semibold text-sm border border-red-100 dark:border-red-900/30 shadow-sm"
        >
             <LogOut size={18} /> 
             <span>Sair</span>
        </button>

        <Link to="/" className="flex items-center justify-center">
            <img 
                src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
                alt="Logo Normatel" 
                className="h-8 md:h-10 w-auto object-contain" 
            />
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            
            <div className="mb-10 text-center md:text-left">
                <h2 className="text-sm font-bold text-[#57B952] uppercase tracking-widest mb-2">
                    Painel do Comprador
                </h2>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                    Aprovação de Compras
                </h1>
            </div>

            <div className="space-y-4">
                
                <div className="bg-gray-100 dark:bg-gray-700/40 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Solicitante</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">João Silva</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Data</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">23/10/2024</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700/40 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Setor / Departamento</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">Administrativo</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Item Solicitado</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">30 Caixas de Papel A4</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-700/40 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Fornecedor Sugerido</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">Kalunga Papelaria</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1">Valor Estimado</p>
                            <p className="text-xl font-bold text-[#57B952]">R$ 230,00</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-center">
                
                <button 
                    onClick={() => handleAction('Aprovado')}
                    className="flex-1 bg-[#57B952] hover:bg-green-600 text-white font-bold py-4 px-6 rounded shadow hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <Check size={20} /> APROVAR
                </button>

                <button 
                    onClick={() => handleAction('Reprovado')}
                    className="flex-1 bg-gray-800 dark:bg-gray-900 hover:bg-gray-900 dark:hover:bg-black text-white font-bold py-4 px-6 rounded shadow hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <X size={20} /> REPROVAR
                </button>

                <button 
                    onClick={() => handleAction('Solicitado Ajuste')}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-4 px-6 rounded shadow hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <AlertCircle size={20} /> SOLICITAR AJUSTES
                </button>

            </div>

        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-gray-400 text-xs">
        &copy; 2025 Normatel Engenharia
      </footer>
    </div>
  );
}

export default AprovacaoCompras;