import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FileText, CheckCircle, ArrowLeft, ExternalLink, User, Sparkles, Settings, X, Save, Plus, Trash2 } from 'lucide-react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // Importar Auth
import { db } from '../services/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

function PainelProjeto() {
  const { theme } = useTheme();
  const { currentUser, userProfile } = useAuth(); // Pegar usuário
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  
  const projeto = location.state?.projeto;

  // Dados Perfil
  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';
  const fotoURL = currentUser?.photoURL || userProfile?.fotoURL;
  const isAdmin = userProfile?.funcao === 'admin';
  
  // Estado para permissões
  const [canEdit, setCanEdit] = useState(false);
  const [canEditCards, setCanEditCards] = useState(false);

  // Estado do modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedUrlForms, setEditedUrlForms] = useState('');
  const [editedUrlSharePoint, setEditedUrlSharePoint] = useState('');
  const [editedExtras, setEditedExtras] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, cardIndex: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Verificar permissões do usuário
  useEffect(() => {
    const checkPermissions = async () => {
      if (!userProfile || !projeto) return;
      
      // Admin sempre pode editar
      if (isAdmin) {
        setCanEdit(true);
        setCanEditCards(true);
        return;
      }
      
      // Gerente de projeto sempre pode editar
      if (userProfile.funcao === 'gerente-projeto') {
        setCanEdit(true);
        setCanEditCards(true);
        return;
      }
      
      // Verificar se o cargo do usuário tem permissão para este projeto
      try {
        const cargosQuery = query(
          collection(db, 'cargos'),
          where('nome', '==', userProfile.funcao)
        );
        const cargosSnapshot = await getDocs(cargosQuery);
        
        if (!cargosSnapshot.empty) {
          const cargoData = cargosSnapshot.docs[0].data();
          const projetosPermitidos = cargoData.projetos || [];
          
          // Verificar se o projeto atual está na lista de projetos permitidos
          if (projetosPermitidos.includes(projeto.id)) {
            setCanEdit(true);
            // Pode editar cards se tiver permissão específica
            setCanEditCards(cargoData.canEditCardsProjetos || false);
          } else {
            setCanEdit(false);
            setCanEditCards(false);
          }
        } else {
          setCanEdit(false);
          setCanEditCards(false);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setCanEdit(false);
        setCanEditCards(false);
      }
    };
    
    checkPermissions();
  }, [userProfile, projeto, isAdmin]);

  if (!projeto) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <button onClick={() => navigate('/selecao-projeto')} className="text-[#57B952]">Voltar para Seleção</button>
        </div>
      );
  }

  // Fallback seguro
  const linkSolicitacao = projeto.urlForms || projeto.url || '#';
  const linkAprovacao = projeto.urlSharePoint || 'https://normatelce.sharepoint.com/';
    const extras = Array.isArray(projeto.extras)
        ? projeto.extras
            .map((e, originalIndex) => ({ ...e, originalIndex }))
            .filter((e) => e?.name?.trim() && e?.url?.trim())
        : [];

  const openEditModal = () => {
    setEditedName(projeto.nome || '');
    setEditedUrlForms(projeto.urlForms || '');
    setEditedUrlSharePoint(projeto.urlSharePoint || '');
    setEditedExtras(
      projeto.extras && projeto.extras.length > 0
        ? projeto.extras.map((e) => ({ name: e.name || '', description: e.description || '', url: e.url || '' }))
        : [{ name: '', description: '', url: '' }]
    );
    setIsEditModalOpen(true);
  };

  const addExtraField = () => {
    setEditedExtras((prev) => [...prev, { name: '', description: '', url: '' }]);
  };

  const updateExtraField = (index, key, newValue) => {
    setEditedExtras((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: newValue } : item))
    );
  };

  const removeExtraField = (index) => {
    setEditedExtras((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExtraCard = async (e, cardIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({ open: true, cardIndex });
  };

  const confirmDeleteCard = async () => {
    try {
      const cardIndex = confirmDelete.cardIndex;
      // Pega todos os extras originais do projeto
      const allExtras = Array.isArray(projeto.extras) ? projeto.extras : [];
      // Remove o card pelo índice
      const updatedExtras = allExtras.filter((_, idx) => idx !== cardIndex);
      
      // Atualiza no Firebase
      await updateDoc(doc(db, 'projetos', projeto.id), {
        extras: updatedExtras,
        updatedAt: new Date(),
      });
      
      // Atualiza o projeto local imediatamente
      projeto.extras = updatedExtras;
      showToast('Card removido com sucesso!', 'success');
      setConfirmDelete({ open: false, cardIndex: null });
      // Renderização atualiza automaticamente via React
    } catch (error) {
      console.error('Erro ao excluir card:', error);
      showToast('Erro ao excluir card: ' + error.message, 'error');
      setConfirmDelete({ open: false, cardIndex: null });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editedName || !editedUrlForms || !editedUrlSharePoint) return;
    setSaving(true);
    try {
      const filteredExtras = editedExtras
        .filter((f) => f.name.trim() && f.url.trim())
        .map((f) => ({ name: f.name.trim(), description: f.description.trim(), url: f.url.trim() }));

      await updateDoc(doc(db, 'projetos', projeto.id), {
        nome: editedName,
        urlForms: editedUrlForms,
        urlSharePoint: editedUrlSharePoint,
        extras: filteredExtras,
        updatedAt: new Date(),
      });

      // Atualizar o projeto local
      projeto.nome = editedName;
      projeto.urlForms = editedUrlForms;
      projeto.urlSharePoint = editedUrlSharePoint;
      projeto.extras = filteredExtras;
      
      setIsEditModalOpen(false);
      showToast('Alterações salvas com sucesso!', 'success');
      // Renderização atualiza automaticamente via React
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showToast('Erro ao salvar alterações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 transition-colors duration-200 text-black">
    {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 h-20 bg-white">
        <button onClick={() => navigate('/selecao-projeto')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Trocar Projeto</span>
        </button>
        
        <div className="flex items-center gap-4">
                <img src="/img/NoraHub.png" alt="Logo Nora" className="h-8 md:h-10 w-auto object-contain" />
            <span className="text-gray-600 text-2xl font-light">|</span>
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo Normatel" className="h-8 md:h-10 w-auto object-contain" />
        </div>

        {/* PERFIL NO CANTO DIREITO */}
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

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
            
            <div className="text-center mb-12">
                <h2 className="text-sm font-bold text-[#57B952] uppercase tracking-widest mb-2">
                    Ambiente de Trabalho
                </h2>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {projeto.nome}
                </h1>
                <p className="text-gray-500 mt-2">Selecione a operação desejada para esta base.</p>
                {canEdit && (
                  <button
                    onClick={openEditModal}
                    className="mt-4 inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm border border-blue-200 transition-colors shadow-sm"
                  >
                    <Settings size={16} /> Editar Base
                  </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center">
                
                {/* Card 1: Solicitação */}
                <a 
                    href={linkSolicitacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2 cursor-pointer h-[320px]"
                >
                    <div className="bg-green-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-green-600">
                        <FileText size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Nova Solicitação</h2>
                    <p className="text-gray-500 mb-6">
                        Preencher formulário de requisição para {projeto.nome}.
                    </p>
                    <div className="mt-auto flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                        Acessar Formulário <ExternalLink size={16} />
                    </div>
                </a>

                {/* Card 2: Aprovação */}
                <a 
                    href={linkAprovacao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 w-full md:w-1/2 cursor-pointer h-[320px]"
                >
                    <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-blue-600">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Aprovação / Painel</h2>
                    <p className="text-gray-500 mb-6">
                        Acessar lista de pedidos e aprovações desta base.
                    </p>
                    <div className="mt-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                        Acessar Painel <ExternalLink size={16} />
                    </div>
                </a>

            </div>

            {extras.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {extras.map((extra, idx) => (
                        <div key={idx} className="relative">
                            {(canEdit || canEditCards) && (
                                <button 
                                    onClick={(e) => handleDeleteExtraCard(e, extra.originalIndex)}
                                    className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-md bg-white"
                                    title="Excluir Card"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <a 
                                href={extra.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl border border-gray-200 flex flex-col items-center text-center transition-all transform hover:-translate-y-2 cursor-pointer h-[320px] block w-full"
                            >
                                <div className="bg-purple-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform text-purple-600">
                                    <Sparkles size={48} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-3">{extra.name}</h2>
                                <p className="text-gray-500 mb-6">
                                    {extra.description || 'Acesse este recurso adicional.'}
                                </p>
                                <div className="mt-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-md">
                                    Acessar <ExternalLink size={16} />
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
      
      <footer className="w-full py-6 text-center text-gray-500 text-xs shrink-0 border-t border-gray-200 bg-white">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Editar Base</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Projeto 743 - Facilities"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FileText size={14} /> Link do Forms (Solicitação)
                </label>
                <input
                  type="url"
                  placeholder="https://forms..."
                  value={editedUrlForms}
                  onChange={(e) => setEditedUrlForms(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <CheckCircle size={14} /> Link do SharePoint (Aprovação)
                </label>
                <input
                  type="url"
                  placeholder="https://sharepoint..."
                  value={editedUrlSharePoint}
                  onChange={(e) => setEditedUrlSharePoint(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cards adicionais (opcional)
                  </label>
                  <button
                    type="button"
                    onClick={addExtraField}
                    className="text-sm text-[#57B952] hover:text-green-700 font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> Adicionar card
                  </button>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {editedExtras.map((field, idx) => (
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeExtraField(idx);
                        }}
                        className="w-full py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                      >
                        <Trash2 size={14} className="inline mr-1" /> Remover Card
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Cards com nome e URL preenchidos aparecerão no painel do projeto.
                </p>
              </div>
              </div>
              <div className="p-6 pt-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-[#57B952] hover:bg-green-600 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? 'Salvando...' : (
                    <>
                      <Save size={18} /> Salvar Alterações
                    </>
                  )}
                </button>
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
                <CheckCircle size={24} className="text-[#57B952]" />
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
            <p className="text-sm text-gray-600 mb-6">Tem certeza que deseja remover este card adicional? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, cardIndex: null })}
                className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCard}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PainelProjeto;