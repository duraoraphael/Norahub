import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Plus, Briefcase, X, Save, FileText, Share, Trash2, User, Shield, Upload, FolderOpen, FileSpreadsheet, File, BarChart3 } from 'lucide-react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import NotificationCenter from '../components/NotificationCenter';

// Verificar se recharts está disponível
let rechartsAvailable = false;
try {
  require('recharts');
  rechartsAvailable = true;
} catch (e) {
  rechartsAvailable = false;
}

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
                    .map(f => ({ name: f.name.trim(), description: f.description.trim(), url: f.url.trim(), type: f.type || 'link' }));

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
                setExtraFields([{ name: '', description: '', url: '', type: 'link' }]);
                setEditingProject(null);
                setIsModalOpen(false);
                fetchProjetos(); 
    } catch (e) { showToast('Erro ao salvar projeto.', 'error'); } finally { setSaving(false); }
  };

    const addExtraField = () => {
        setExtraFields(prev => [...prev, { name: '', description: '', url: '', type: 'link' }]);
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
        setExtraFields([{ name: '', description: '', url: '', type: 'link' }]);
        setIsModalOpen(true);
    };

    const openEditModal = (projeto) => {
        setEditingProject(projeto);
        setNewProjectName(projeto.nome || '');
        setUrlForms(projeto.urlForms || '');
        setUrlSharePoint(projeto.urlSharePoint || '');
        setExtraFields(projeto.extras && projeto.extras.length > 0 ? projeto.extras.map(e => ({ name: e.name || '', description: e.description || '', url: e.url || '', type: e.type || 'link' })) : [{ name: '', description: '', url: '', type: 'link' }]);
        setIsModalOpen(true);
    };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative bg-gray-50 transition-colors duration-200 text-black">
    {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-3 md:py-6 px-3 md:px-8 border-b border-gray-200 min-h-[56px] md:h-20 bg-white">
        <button onClick={() => navigate('/')} className="absolute left-3 md:left-8 flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0 z-10">
             <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Voltar</span>
        </button>
            <div className="flex items-center gap-2 md:gap-4">
            <img src="/img/NoraHub.png" alt="Logo Nora" className="h-6 md:h-10 w-auto object-contain" />
            <span className="text-gray-600 text-lg md:text-2xl font-light">|</span>
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-6 md:h-10 w-auto object-contain" />
        </div>
        
        {currentUser && (
            <div className="absolute right-3 md:right-8 flex items-center gap-2 md:gap-3 shrink-0">
                <NotificationCenter />
                <button 
                    onClick={() => navigate('/perfil')} 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#57B952] bg-gray-200 flex items-center justify-center hover:border-green-600 transition-colors cursor-pointer shrink-0"
                >
                    {fotoURL ? <img src={fotoURL} className="w-full h-full object-cover" alt="Avatar" /> : <User size={16} className="md:w-5 md:h-5 text-gray-500" />}
                </button>
                <span className="text-xs md:text-base lg:text-lg font-semibold text-gray-800 truncate max-w-[60px] sm:max-w-[100px] md:max-w-none"><span className="hidden md:inline">Olá, </span>{primeiroNome}</span>
            </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center p-3 md:p-8">
        <div className="w-full max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 md:mb-8 gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900">Seleção de projetos</h1>
                    <p className="text-sm md:text-base text-gray-500 mt-2">Escolha o projeto para acessar o ambiente de trabalho.</p>
                </div>
                
                <div className="flex gap-3 flex-wrap">
                    {/* BOTÃO DASHBOARD */}
                    {(isAdmin || canAccessAdmin) && (
                        rechartsAvailable ? (
                            <Link 
                                to="/dashboard" 
                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-transform hover:scale-105 text-sm border border-blue-200"
                            >
                                <BarChart3 size={18} /> Dashboard
                            </Link>
                        ) : (
                            <div className="relative group">
                                <button 
                                    disabled
                                    className="bg-gray-200 text-gray-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow text-sm border border-gray-300 cursor-not-allowed opacity-60"
                                >
                                    <BarChart3 size={18} /> Dashboard
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Instale o recharts: npm install recharts
                                </div>
                            </div>
                        )
                    )}
                
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {projetos.map((projeto) => (
                        <div 
                            key={projeto.id} 
                            onClick={() => handleSelectProject(projeto)} 
                            className="group bg-white p-4 md:p-8 rounded-xl shadow-md hover:shadow-xl border border-gray-200 text-left transition-all hover:-translate-y-1 flex flex-col h-full relative cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                                <div className="bg-green-100 p-2 md:p-3 rounded-lg text-[#57B952]"><Briefcase size={20} className="md:w-6 md:h-6" /></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">Base Ativa</span>
                                    {canEditProject(projeto.id) && (
                                        <button 
                                            onClick={(e) => handleDeleteProject(e, projeto.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Excluir Base"
                                        >
                                            <Trash2 size={14} className="md:w-4 md:h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#57B952] transition-colors">{projeto.nome}</h3>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 animate-fade-in my-8 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingProject ? 'Editar Base' : 'Adicionar Nova Base'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                                    />
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Card</label>
                                        <select
                                            value={field.type || 'link'}
                                            onChange={(e) => updateExtraField(idx, 'type', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                                        >
                                            <option value="link">🔗 Link Externo</option>
                                            <option value="documents">📁 Pasta de Documentos</option>
                                            <option value="reports">📊 Relatórios e Dashboards</option>
                                            <option value="files">📄 Arquivos PDF</option>
                                            <option value="spreadsheets">📈 Planilhas Excel</option>
                                            <option value="forms">📝 Formulários</option>
                                            <option value="approvals">✅ Centro de Aprovações</option>
                                            <option value="inventory">📦 Controle de Estoque</option>
                                            <option value="financial">💰 Financeiro</option>
                                            <option value="hr">👥 Recursos Humanos</option>
                                        </select>
                                    </div>
                                    
                                    <input
                                        type="text"
                                        placeholder="Descrição (opcional)"
                                        value={field.description}
                                        onChange={(e) => updateExtraField(idx, 'description', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                                    />
                                    <input
                                        type="url"
                                        placeholder="URL (https://...)"
                                        value={field.url}
                                        onChange={(e) => updateExtraField(idx, 'url', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-blue-700 font-semibold mb-1">💡 Dicas de uso:</p>
                            <ul className="text-xs text-blue-600 space-y-1 ml-4 list-disc">
                                <li><strong>Documentos:</strong> Link para OneDrive, SharePoint ou pasta compartilhada</li>
                                <li><strong>Relatórios:</strong> Link para Power BI, Tableau ou dashboards</li>
                                <li><strong>Planilhas:</strong> Excel Online, Google Sheets</li>
                                <li><strong>Formulários:</strong> Microsoft Forms, Google Forms</li>
                                <li><strong>Estoque:</strong> Sistema de controle de inventário</li>
                                <li><strong>Financeiro:</strong> Sistema de gestão financeira/orçamento</li>
                            </ul>
                        </div>
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