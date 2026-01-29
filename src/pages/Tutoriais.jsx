import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { allTutorials } from '../data';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFavorites } from '../services/favorites';
import { Search, Download, ExternalLink, Lock, ArrowLeft } from 'lucide-react';

function Tutoriais() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const { currentUser } = useAuth();
  const [favIds, setFavIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    async function loadFavs() {
      if (!currentUser) { if (!cancelled) setFavIds(new Set()); return; }
      const res = await getFavorites(currentUser.uid, 'tutorial');
      if (res.success) {
        const ids = new Set(res.favorites.map(f => f.id));
        if (!cancelled) setFavIds(ids);
      }
    }
    loadFavs();
    return () => { cancelled = true; };
  }, [currentUser]);

  // Lógica de Categorias
  const categorias = ['todos', ...new Set(allTutorials.map(t => t.categoria))].sort();

  // Lógica de Filtro
  const tutoriaisFiltrados = allTutorials.filter(tutorial => {
    const matchCategoria = categoriaAtiva === 'todos' || tutorial.categoria.toLowerCase() === categoriaAtiva.toLowerCase();
    const matchBusca = tutorial.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                       tutorial.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  // Ordenar
  const tutoriaisOrdenados = [...tutoriaisFiltrados].sort((a, b) => {
    // ordem por título
    return String(a.titulo).localeCompare(String(b.titulo));
  });

  return (
    <div className="min-h-screen w-full flex flex-col font-[Outfit,Poppins] overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
    {/* ThemeToggle removed */}

      <div className="container mx-auto px-4 py-6 md:p-8 max-w-7xl flex-grow">
        
        {/* --- CABEÇALHO --- */}
        <div className="relative flex justify-center items-center border-b border-gray-700 pb-6 mb-8">
            
            {/* BOTÃO VOLTAR (Agora na Esquerda: left-0) */}
            <Link 
                to="/" 
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-gray-800 text-gray-100 hover:bg-[#57B952] hover:text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 hover:border-[#57B952] transition-all duration-300 group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline font-semibold text-sm">Voltar</span>
            </Link>

            {/* Logo Dinâmica (Centralizada pelo flex justify-center do pai) */}
            {/* Logos Centralizadas (Parceria) */}
        <div className="flex items-center gap-4">
            <img 
                src="/img/Designer BR.png" 
                alt="Logo Petrobras" 
                className="h-10 md:h-12 w-auto object-contain" 
            />
            <span className="text-gray-300 text-2xl font-light">|</span>
            <img 
                src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"}
                alt="Logo Normatel" 
                className="h-6 md:h-8 w-auto object-contain" 
            />
        </div>
     </div>
        {/* Título e Subtítulo */}
        <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Central de Tutoriais</h1>
            <p className="text-gray-300 mt-2 mb-8 text-lg">Encontre guias e manuais para todos os processos da equipe.</p>
        </div>

        {/* --- ÁREA DE CONTROLES --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 p-5 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-white">
            
            {/* Busca */}
            <div className="relative w-full lg:w-1/3">
                <input
                    type="text"
                    placeholder="O que você procura?"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#57B952] focus:border-transparent transition-all"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                   <Search size={20} />
                </div>
            </div>
            
            {/* Filtros e Ordenação */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2 w-full lg:w-2/3">
                {categorias.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setCategoriaAtiva(cat.toLowerCase())}
                        className={`py-2 px-5 rounded-full text-sm font-semibold transition-all duration-200 ${
                            categoriaAtiva === cat.toLowerCase() 
                            ? 'bg-[#57B952] text-white shadow-md transform scale-105' 
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
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
                tutoriaisOrdenados.map((tutorial) => {
                    const isEmBreve = tutorial.categoria.toLowerCase() === 'em breve';
                    const isCadastro = tutorial.categoria.toLowerCase() === 'cadastro';

                    return (
                        <div key={tutorial.id} className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-white/20 text-white">
                            
                            <div className="bg-white/10 p-6 flex-grow relative group">
                                {/* Favoritar */}
                                <div className="absolute top-4 right-4 z-10">
                                    <FavoriteButton
                                        itemId={`tutorial:${tutorial.id}`}
                                        itemType="tutorial"
                                        itemData={{
                                            name: tutorial.titulo,
                                            titulo: tutorial.titulo,
                                            descricao: tutorial.descricao,
                                            categoria: tutorial.categoria,
                                            url: tutorial.url,
                                            data: tutorial.data
                                        }}
                                        size={20}
                                        onChange={(next) => {
                                            const key = `tutorial:${tutorial.id}`;
                                            setFavIds(prev => {
                                                const s = new Set(prev);
                                                if (next) s.add(key); else s.delete(key);
                                                return s;
                                            });
                                        }}
                                    />
                                </div>
                                <span className={`inline-block text-white text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded mb-3 ${isEmBreve ? 'bg-gray-500' : 'bg-[#57B952]'}`}>
                                    {tutorial.categoria}
                                </span>
                                
                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1" title={tutorial.titulo}>
                                    {tutorial.titulo}
                                </h3>
                                <p className="text-gray-300 text-sm h-10 overflow-hidden line-clamp-2">
                                    {tutorial.descricao}
                                </p>
                            </div>
                            
                            <div className="p-5 bg-white/5 border-t border-white/20">
                                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                                    📅 Atualizado: {tutorial.data}
                                </p>
                                
                                <div className="flex gap-3">
                                    {isEmBreve ? (
                                        <button disabled className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-gray-400 bg-white/5 cursor-not-allowed border border-white/20 opacity-70">
                                            <Lock size={16} className="mr-2" /> Em breve
                                        </button>
                                    ) : (
                                        <>
                                            <a href={tutorial.url} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#57B952] hover:bg-green-600 transition-colors shadow-sm ${isCadastro ? 'w-full' : ''}`}>
                                                <ExternalLink size={16} className="mr-2" /> Abrir
                                            </a>
                                            
                                            {!isCadastro && (
                                                <a href={tutorial.url} download className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-colors border border-white/20">
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
                <div className="col-span-full text-center py-20">
                    <div className="bg-white/10 backdrop-blur-xl rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300">Nenhum tutorial encontrado</h3>
                    <p className="mt-2 text-sm text-gray-400">Tente buscar por outro termo ou mude o filtro.</p>
                </div>
            )}
        </main>

      </div>
      
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
