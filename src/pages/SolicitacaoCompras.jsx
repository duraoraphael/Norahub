import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Paperclip, Upload, ArrowLeft, LogOut } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert'; // 1. Importar o Alerta

function SolicitacaoCompras() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    item: '',
    quantidade: '',
    unidade: '',
    fornecedor: '',
    justificativa: '',
    arquivo: null
  });
  
  // 2. Estado para o alerta
  const [alertInfo, setAlertInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Solicitação enviada:', formData);
    
    // 3. Mostrar o alerta personalizado
    setAlertInfo({ message: 'Solicitação de compra enviada com sucesso!', type: 'success' });
    
    // Espera 2 segundos antes de voltar para a home
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
            
            <div className="mb-10 text-center md:text-left border-b border-gray-100 dark:border-gray-700 pb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white uppercase tracking-wide">Suprimentos</h1>
                <h2 className="text-xl text-[#57B952] font-semibold mt-1">Solicitação de Compras</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                        <label htmlFor="item" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-1">Item</label>
                        <select 
                            name="item" 
                            id="item"
                            value={formData.item}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent outline-none transition-all shadow-sm appearance-none"
                        >
                            <option value="" disabled>Selecione um item...</option>
                            <option value="epi">Equipamento de Proteção (EPI)</option>
                            <option value="ferramentas">Ferramentas</option>
                            <option value="material_eletrico">Material Elétrico</option>
                            <option value="material_escritorio">Material de Escritório</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-1">Quantidade</label>
                        <input 
                            type="number" 
                            name="quantidade" 
                            id="quantidade"
                            min="1"
                            value={formData.quantidade}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="unidade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-1">Unidade de Medida</label>
                        <input 
                            type="text" 
                            name="unidade" 
                            id="unidade"
                            placeholder="Ex: Caixa, Unidade, Litro"
                            value={formData.unidade}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="fornecedor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-1">Fornecedor Sugerido</label>
                        <input 
                            type="text" 
                            name="fornecedor" 
                            id="fornecedor"
                            placeholder="Opcional"
                            value={formData.fornecedor}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="relative">
                    <label htmlFor="justificativa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-1">Justificativa</label>
                    <div className="relative">
                        <textarea 
                            name="justificativa" 
                            id="justificativa"
                            rows="3"
                            value={formData.justificativa}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent outline-none transition-all shadow-sm resize-none pr-10"
                        ></textarea>
                        <Paperclip className="absolute right-3 bottom-3 text-gray-400" size={20} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 pl-1">Anexar Documento</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-[#57B952] dark:hover:border-[#57B952] transition-all cursor-pointer group">
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="text-gray-500 dark:text-gray-300 group-hover:text-[#57B952]" size={24} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Clique para fazer upload</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SVG, PNG, JPG ou GIF (max. 800x400px)</p>
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button 
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full md:w-auto px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        CANCELAR
                    </button>
                    
                    <button 
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 bg-[#57B952] text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        <span>ENVIAR SOLICITAÇÃO</span>
                    </button>
                </div>

            </form>
        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-gray-400 text-xs">
        &copy; 2025 Normatel Engenharia
      </footer>
    </div>
  );
}

export default SolicitacaoCompras;