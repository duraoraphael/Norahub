import { useState } from 'react';
import { Link } from 'react-router-dom';
import { allTutorials } from '../data';
import { Search, Download, ExternalLink, Lock, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // 1. Importar o hook de Tema
import { ThemeToggle } from '../components/ThemeToggle'; // 2. Importar o Botão de Tema

function Tutoriais() {
  const { theme } = useTheme(); // 3. Usar o hook
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');

  // 4. Lógica para determinar o tema e trocar a logo
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Lógica de Categorias
  const categorias = ['todos', ...new Set(allTutorials.map(t => t.categoria))].sort();

  // Lógica de Filtro
  const tutoriaisFiltrados = allTutorials.filter(tutorial => {
    const matchCategoria = categoriaAtiva === 'todos' || tutorial.categoria.toLowerCase() === categoriaAtiva.toLowerCase();
    const matchBusca = tutorial.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                       tutorial.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  return (
    // Container Principal: Sem cores fixas, deixa o index.css controlar
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden">
      
      <ThemeToggle /> {/* 5. Adicionar o botão de tema */}

      {/* Conteúdo Central que cresce */}
      <div className="container mx-auto px-4 py-6 md:p-8 max-w-7xl flex-grow">
        
        {/* --- CABEÇALHO --- */}
        <div className="relative flex justify-center items-center border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
            
            {/* Logo Dinâmica */}
            <img 
              className="h-10 md:h-12 w-auto object-contain" 
              src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} // <-- LÓGICA DA LOGO
              alt="Logo Normatel" 
            />

            {/* BOTÃO VOLTAR ESTILIZADO (com classes de tema) */}
            <Link 
                to="/" 
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-[#57B952] hover:text-white px-4 py-2 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 hover:border-[#57B952] transition-all duration-300 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline font-semibold text-sm">Voltar</span>
            </Link>
        </div>
        
        {/* Título e Subtítulo (com classes de tema) */}
        <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Central de Tutoriais Fracttal</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8 text-lg">Encontre guias e manuais para todos os processos da equipe.</p>
        </div>

        {/* --- ÁREA DE CONTROLES (com classes de tema) --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            
            {/* Busca */}
            <div className="relative w-full lg:w-1/3">
                <input
                    type="text"
                    placeholder="O que você procura?"
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#57B952] focus:border-transparent transition-all"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                   <Search size={20} />
                </div>
            </div>
            
            {/* Filtros (Botões) (com classes de tema) */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-2/3">
                {categorias.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setCategoriaAtiva(cat.toLowerCase())}
                        className={`py-2 px-5 rounded-full text-sm font-semibold transition-all duration-200 ${
                            categoriaAtiva === cat.toLowerCase() 
                            ? 'bg-[#57B952] text-white shadow-md transform scale-105' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                        }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        {/* --- GRADE DE CARDS --- */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutoriaisFiltrados.length > 0 ? (
                tutoriaisFiltrados.map((tutorial) => {
                    const isEmBreve = tutorial.categoria.toLowerCase() === 'em breve';
                    const isCadastro = tutorial.categoria.toLowerCase() === 'cadastro';

                    return (
                        // Card (com classes de tema)
                        <div key={tutorial.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-gray-200 dark:border-gray-700">
                            
                            {/* Corpo do Card (com classes de tema) */}
                            <div className="bg-white dark:bg-gray-800 p-6 flex-grow relative group">
                                <span className={`inline-block text-white text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded mb-3 ${isEmBreve ? 'bg-gray-500' : 'bg-[#57B952]'}`}>
                                    {tutorial.categoria}
                                </span>
                                
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title={tutorial.titulo}>
                                    {tutorial.titulo}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm h-10 overflow-hidden line-clamp-2">
                                    {tutorial.descricao}
                                </p>
                            </div>
                            
                            {/* Rodapé do Card (com classes de tema) */}
                            <div className="p-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                                    📅 Atualizado: {tutorial.data}
                                </p>
                                
                                <div className="flex gap-3">
                                    {isEmBreve ? (
                                        <button disabled className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 cursor-not-allowed border border-gray-300 dark:border-gray-700 opacity-70">
                                            <Lock size={16} className="mr-2" /> Em breve
                                        </button>
                                    ) : (
                                        <>
                                            <a href={tutorial.url} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#57B952] hover:bg-green-600 transition-colors shadow-sm ${isCadastro ? 'w-full' : ''}`}>
                                                <ExternalLink size={16} className="mr-2" /> Abrir
                                            </a>
                                            
                                            {!isCadastro && (
                                                <a href={tutorial.url} download className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600">
                                                    <Download size={16} className="mr-2" /> Baixar
                                                </a>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                // "Nenhum resultado" (com classes de tema)
                <div className="col-span-full text-center py-20">
                    <div className="bg-gray-200 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Nenhum tutorial encontrado</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Tente buscar por outro termo ou mude o filtro.</p>
                </div>
            )}
        </main>

      </div>
      
      {/* Rodapé Full Width (sempre verde) */}
      <footer className="w-full bg-[#57B952] py-4 mt-auto shadow-inner"> 
            <div className="container mx-auto text-center">
                <p className="text-white text-lg font-medium tracking-wide">
                    Nós fazemos acontecer.
                </p>
            </div>  
      </footer>
    </div>
  );
}

export default Tutoriais;