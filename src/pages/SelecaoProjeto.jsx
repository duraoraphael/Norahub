import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Plus, Briefcase, X, Save, FileText, Share, Trash2 } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

function SelecaoProjeto() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [urlForms, setUrlForms] = useState(''); 
  const [urlSharePoint, setUrlSharePoint] = useState(''); 
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjetos();
  }, []);

  const fetchProjetos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projetos'));
      const listaDoBanco = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Lista puramente do banco de dados
      setProjetos(listaDoBanco);

    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!newProjectName || !urlForms || !urlSharePoint) return;

    setSaving(true);
    try {
        await addDoc(collection(db, 'projetos'), {
            nome: newProjectName,
            urlForms: urlForms,
            urlSharePoint: urlSharePoint,
            descricao: 'Base ativa',
            createdAt: new Date()
        });
        
        setNewProjectName('');
        setUrlForms('');
        setUrlSharePoint('');
        setIsModalOpen(false);
        fetchProjetos(); 
        
    } catch (e) {
        alert("Erro ao salvar projeto.");
    } finally {
        setSaving(false);
    }
  };

  const handleDeleteProject = async (e, projetoId) => {
    e.stopPropagation(); 
    
    if (window.confirm("Tem certeza que deseja excluir esta base?")) {
        try {
            await deleteDoc(doc(db, 'projetos', projetoId));
            setProjetos(prev => prev.filter(p => p.id !== projetoId));
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir projeto.");
        }
    }
  };

  const handleSelectProject = (projeto) => {
    navigate('/painel-projeto', { state: { projeto } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 dark:bg-[#111827] transition-colors duration-200">
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20 bg-white dark:bg-gray-800">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <div className="flex items-center gap-4">
        <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-8">
        <div className="w-full max-w-6xl">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seleção de Base</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Escolha o projeto para acessar o ambiente de trabalho.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-transform hover:scale-105 text-sm">
                    <Plus size={18} /> Novo Projeto
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Carregando bases...</div>
            ) : projetos.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma base cadastrada ainda.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-[#57B952] font-bold hover:underline">
                        + Adicionar primeira base
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projetos.map((projeto) => (
                        <div 
                            key={projeto.id} 
                            onClick={() => handleSelectProject(projeto)} 
                            className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 text-left transition-all hover:-translate-y-1 flex flex-col h-full relative cursor-pointer"
                        >
                            <button 
                                onClick={(e) => handleDeleteProject(e, projeto.id)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors z-10"
                                title="Excluir Base"
                            >
                                <Trash2 size={18} />
                            </button>

                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-[#57B952]"><Briefcase size={24} /></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Ativa</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#57B952] transition-colors">{projeto.nome}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">{projeto.descricao || 'Acesso ao portal.'}</p>
                            <div className="mt-auto w-full py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:bg-[#57B952] group-hover:text-white transition-colors">Acessar Projeto</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adicionar Nova Base</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveProject} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Projeto</label>
                        <input type="text" placeholder="Ex: Projeto 743" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><FileText size={14} /> Link do Forms (Solicitação)</label>
                        <input type="url" placeholder="https://forms..." value={urlForms} onChange={(e) => setUrlForms(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><Share size={14} /> Link do SharePoint (Aprovação)</label>
                        <input type="url" placeholder="https://sharepoint..." value={urlSharePoint} onChange={(e) => setUrlSharePoint(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] outline-none" required />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors">Cancelar</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-[#57B952] hover:bg-green-600 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70">{saving ? 'Salvando...' : <><Save size={18} /> Salvar Base</>}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">&copy; 2025 Parceria Petrobras & Normatel Engenharia</footer>
    </div>
  );
}
export default SelecaoProjeto;