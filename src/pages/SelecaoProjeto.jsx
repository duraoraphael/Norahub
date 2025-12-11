import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Plus, Briefcase, X, Save, FileText, Share, Trash2, User, Shield } from 'lucide-react'; // Adicionado Shield
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';

function SelecaoProjeto() {
  const { theme } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variáveis de perfil
  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';
  const fotoURL = currentUser?.photoURL || userProfile?.fotoURL;
  const isAdmin = userProfile?.funcao === 'admin'; // Verifica se é admin
  const [projetosPermitidos, setProjetosPermitidos] = useState([]);
  const [canManageProjects, setCanManageProjects] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);

  // Estados para o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [urlForms, setUrlForms] = useState(''); 
  const [urlSharePoint, setUrlSharePoint] = useState(''); 
  const [saving, setSaving] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [extraFields, setExtraFields] = useState([{ label: '', value: '' }]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, projetoId: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchProjetos();
    checkPermissions();
  }, [userProfile]);

  const checkPermissions = async () => {
    if (!userProfile) return;
    
    // Admin pode acessar tudo
    if (isAdmin) {
      setCanManageProjects(true);
      setCanAccessAdmin(true);
      return;
    }
    
    // Todos os gerentes (qualquer cargo que começa com "gerente") têm acesso ao admin
    if (typeof userProfile.funcao === 'string' && userProfile.funcao.toLowerCase().includes('gerente')) {
      setCanManageProjects(true);
      setCanAccessAdmin(true);
      return;
    }
    
    // Verificar se o cargo do usuário tem permissões para algum projeto
    try {
      const cargosQuery = query(
        collection(db, 'cargos'),
        where('nome', '==', userProfile.funcao)
      );
      const cargosSnapshot = await getDocs(cargosQuery);
      
      if (!cargosSnapshot.empty) {
        const cargoData = cargosSnapshot.docs[0].data();
        const projetos = cargoData.projetos || [];
        setProjetosPermitidos(projetos);
        
        // Pode criar projetos se tiver permissão canCreateProjetos ou tiver projetos atribuídos
        const canCreate = cargoData.canCreateProjetos || projetos.length > 0;
        setCanManageProjects(canCreate);
        
        // Permitir acesso ao admin se tiver qualquer permissão de gerenciamento
        const temPermissaoAdmin = cargoData.canManageUsers || cargoData.canManagePermissions;
        setCanAccessAdmin(temPermissaoAdmin);
      } else {
        setCanManageProjects(false);
        setCanAccessAdmin(false);
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setCanManageProjects(false);
      setCanAccessAdmin(false);
    }
  };

  const fetchProjetos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projetos'));
      let listaDoBanco = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Admin e todos os gerentes veem todos os projetos
      if (userProfile && (userProfile.funcao === 'admin' || (typeof userProfile.funcao === 'string' && userProfile.funcao.toLowerCase().includes('gerente')))) {
        // Mostrar todos os projetos
      } else if (userProfile && userProfile.funcao !== 'admin') {
        const projetosDoUsuario = userProfile.projetos || [];
        if (projetosDoUsuario.length > 0) {
          // Filtra apenas os projetos atribuídos ao usuário
          listaDoBanco = listaDoBanco.filter(proj => projetosDoUsuario.includes(proj.id));
        } else {
          // Se não tem projetos atribuídos, mostra lista vazia
          listaDoBanco = [];
        }
      }
      
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
                const extras = extraFields
                    .filter(f => f.name.trim() && f.url.trim())
                    .map(f => ({ name: f.name.trim(), description: f.description.trim(), url: f.url.trim() }));

                if (editingProject) {
                    await updateDoc(doc(db, 'projetos', editingProject.id), {
                        nome: newProjectName,
                        urlForms,
                        urlSharePoint,
                        descricao: editingProject.descricao || 'Base ativa',
                        extras,
                        updatedAt: new Date()
                    });
                } else {
                    await addDoc(collection(db, 'projetos'), {
                            nome: newProjectName,
                            urlForms,
                            urlSharePoint,
                            descricao: 'Base ativa',
                            extras,
                            createdAt: new Date()
                    });
                }

                setNewProjectName('');
                setUrlForms('');
                setUrlSharePoint('');
                setExtraFields([{ name: '', description: '', url: '' }]);
                setEditingProject(null);
                setIsModalOpen(false);
                fetchProjetos(); 
    } catch (e) { showToast('Erro ao salvar projeto.', 'error'); } finally { setSaving(false); }
  };

    const addExtraField = () => {
        setExtraFields(prev => [...prev, { name: '', description: '', url: '' }]);
    };

    const updateExtraField = (index, key, newValue) => {
        setExtraFields(prev => prev.map((item, i) => i === index ? { ...item, [key]: newValue } : item));
    };

    const removeExtraField = (index) => {
        setExtraFields(prev => prev.filter((_, i) => i !== index));
    };

  const canEditProject = (projetoId) => {
    if (isAdmin) return true;
    // Todos os gerentes podem editar projetos
    if (typeof userProfile?.funcao === 'string' && userProfile.funcao.toLowerCase().includes('gerente')) return true;
    return projetosPermitidos.includes(projetoId);
  };

  const handleDeleteProject = async (e, projetoId) => {
    e.stopPropagation();
    setConfirmDelete({ open: true, projetoId });
  };

  const confirmDeleteProject = async () => {
    try {
      await deleteDoc(doc(db, 'projetos', confirmDelete.projetoId));
      setProjetos(prev => prev.filter(p => p.id !== confirmDelete.projetoId));
      setConfirmDelete({ open: false, projetoId: null });
      showToast('Projeto excluído com sucesso!', 'success');
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showToast('Erro ao excluir projeto.', 'error');
      setConfirmDelete({ open: false, projetoId: null });
    }
  };

  const handleSelectProject = (projeto) => {
    navigate('/painel-projeto', { state: { projeto } });
  };

    const openCreateModal = () => {
        setEditingProject(null);
        setNewProjectName('');
        setUrlForms('');
        setUrlSharePoint('');
        setExtraFields([{ name: '', description: '', url: '' }]);
        setIsModalOpen(true);
    };

    const openEditModal = (projeto) => {
        setEditingProject(projeto);
        setNewProjectName(projeto.nome || '');
        setUrlForms(projeto.urlForms || '');
        setUrlSharePoint(projeto.urlSharePoint || '');
        setExtraFields(projeto.extras && projeto.extras.length > 0 ? projeto.extras.map(e => ({ name: e.name || '', description: e.description || '', url: e.url || '' })) : [{ name: '', description: '', url: '' }]);
        setIsModalOpen(true);
    };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200 text-black">
    {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 h-20 bg-white">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
            <div className="flex items-center gap-4">
            <img src="/img/NoraHub.png" alt="Logo Nora" className="h-8 md:h-10 w-auto object-contain" />
            <span className="text-gray-600 text-2xl font-light">|</span>
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
        </div>
        
        {currentUser && (
            <div className="absolute right-4 md:right-8 flex items-center gap-3">
                <button 
                    onClick={() => navigate('/perfil')} 
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#57B952] bg-gray-200 flex items-center justify-center hover:border-green-600 transition-colors cursor-pointer"
                >
                    {fotoURL ? <img src={fotoURL} className="w-full h-full object-cover" alt="Avatar" /> : <User size={20} className="text-gray-500" />}
                </button>
                <span className="text-base md:text-lg font-semibold text-gray-800">Olá, {primeiroNome}</span>
            </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center p-8">
        <div className="w-full max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Seleção de projetos</h1>
                    <p className="text-gray-500 mt-2">Escolha o projeto para acessar o ambiente de trabalho.</p>
                </div>
                
                <div className="flex gap-3">
                    {/* BOTÃO ADMIN - Apenas para Administrador */}
                    {isAdmin && (
                        <Link 
                            to="/admin" 
                            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-transform hover:scale-105 text-sm border border-purple-200"
                        >
                            <Shield size={18} /> Admin
                        </Link>
                    )}

                    {/* BOTÃO GERÊNCIA */}
                    {(isAdmin || canAccessAdmin) && (
                        <Link 
                            to="/gerencia" 
                            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-transform hover:scale-105 text-sm border border-orange-200"
                        >
                            <Shield size={18} /> Gerência
                        </Link>
                    )}

                    {/* Botão Novo Projeto */}
                    {canManageProjects && (
                        <button onClick={openCreateModal} className="bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-transform hover:scale-105 text-sm">
                            <Plus size={18} /> Novo Projeto
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Carregando bases...</div>
            ) : projetos.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-200">
                    <p className="text-gray-500 mb-4">Nenhuma base cadastrada ainda.</p>
                    {canManageProjects && (
                        <button onClick={() => setIsModalOpen(true)} className="text-[#57B952] font-bold hover:underline">
                            + Adicionar primeira base
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projetos.map((projeto) => (
                        <div 
                            key={projeto.id} 
                            onClick={() => handleSelectProject(projeto)} 
                            className="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl border border-gray-200 text-left transition-all hover:-translate-y-1 flex flex-col h-full relative cursor-pointer"
                        >
                            {canEditProject(projeto.id) && (
                                <button 
                                    onClick={(e) => handleDeleteProject(e, projeto.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:bg-red-900/20 rounded-full transition-colors z-10"
                                    title="Excluir Base"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-green-100 p-3 rounded-lg text-[#57B952]"><Briefcase size={24} /></div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Ativa</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#57B952] transition-colors">{projeto.nome}</h3>
                            <p className="text-sm text-gray-500 mb-6 flex-grow">{projeto.descricao || 'Acesso ao portal.'}</p>
                            <div className="mt-auto w-full py-2 rounded-lg bg-gray-50 text-center text-sm font-medium text-gray-400 group-hover:bg-[#57B952] group-hover:text-white transition-colors">Acessar Projeto</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>

      {/* MODAL (criar/editar base) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingProject ? 'Editar Base' : 'Adicionar Nova Base'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveProject} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
                        <input type="text" placeholder="Ex: Projeto 743 - Facilities" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><FileText size={14} /> Link do Forms (Solicitação)</label>
                        <input type="url" placeholder="https://forms..." value={urlForms} onChange={(e) => setUrlForms(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><Share size={14} /> Link do SharePoint (Aprovação)</label>
                        <input type="url" placeholder="https://sharepoint..." value={urlSharePoint} onChange={(e) => setUrlSharePoint(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none" required />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Cards adicionais (opcional)</label>
                            <button type="button" onClick={addExtraField} className="text-sm text-[#57B952] hover:text-green-700 font-semibold flex items-center gap-1">
                                <Plus size={14} /> Adicionar card
                            </button>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                            {extraFields.map((field, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                                    <input
                                        type="text"
                                        placeholder="Nome do Card"
                                        value={field.name}
                                        onChange={(e) => updateExtraField(idx, 'name', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Descrição (opcional)"
                                        value={field.description}
                                        onChange={(e) => updateExtraField(idx, 'description', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none"
                                    />
                                    <input
                                        type="url"
                                        placeholder="URL (https://...)"
                                        value={field.url}
                                        onChange={(e) => updateExtraField(idx, 'url', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExtraField(idx)}
                                        className="w-full py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                                    >
                                        <Trash2 size={14} className="inline mr-1" /> Remover Card
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Cards com nome e URL preenchidos aparecerão no painel do projeto.</p>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors">Cancelar</button>
                        
                        <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-[#57B952] hover:bg-green-600 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70">{saving ? 'Salvando...' : <><Save size={18} /> {editingProject ? 'Salvar Alterações' : 'Salvar Base'}</>}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[200] animate-fade-in">
          <div className={`border-l-4 ${toast.type === 'error' ? 'bg-white border-red-500' : 'bg-white border-[#57B952]'} rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px]`}>
            <div className={`${toast.type === 'error' ? 'bg-red-100' : 'bg-green-100'} p-2 rounded-full`}>
              {toast.type === 'error' ? (
                <X size={24} className="text-red-500" />
              ) : (
                <Building2 size={24} className="text-[#57B952]" />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{toast.type === 'error' ? 'Erro!' : 'Sucesso!'}</p>
              <p className="text-sm text-gray-600">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-600 mb-6">Tem certeza que deseja remover esta base? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, projetoId: null })}
                className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteProject}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 bg-white">&copy; 2025 Parceria Petrobras & Normatel Engenharia</footer>
    </div>
  );
}
export default SelecaoProjeto;