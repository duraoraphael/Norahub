import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, Save, X, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';

function GerenciaProjetos() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectUrlForms, setNewProjectUrlForms] = useState('');
  const [newProjectUrlSharePoint, setNewProjectUrlSharePoint] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [newCard, setNewCard] = useState({ nome: '', descricao: '', url: '' });

  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';

  useEffect(() => {
    fetchProjetos();
  }, []);

  const fetchProjetos = async () => {
    try {
      const projetosSnapshot = await getDocs(collection(db, 'projetos'));
      const projetosList = projetosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjetos(projetosList);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName || !newProjectUrlForms || !newProjectUrlSharePoint) {
      showToast('Preencha todos os campos!', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'projetos'), {
        nome: newProjectName,
        urlForms: newProjectUrlForms,
        urlSharePoint: newProjectUrlSharePoint,
        criadoEm: new Date(),
      });

      setNewProjectName('');
      setNewProjectUrlForms('');
      setNewProjectUrlSharePoint('');
      setIsCreateModalOpen(false);
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto!');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Tem certeza que deseja deletar este projeto?')) {
      try {
        await deleteDoc(doc(db, 'projetos', projectId));
        fetchProjetos();
      } catch (error) {
        console.error('Erro ao deletar projeto:', error);
        alert('Erro ao deletar projeto!');
      }
    }
  };

  const handleUpdateProject = async (projectId, updatedData) => {
    try {
      await updateDoc(doc(db, 'projetos', projectId), updatedData);
      setEditingProject(null);
      fetchProjetos();
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      alert('Erro ao atualizar projeto!');
    }
  };

  const openCardModal = (projectId) => {
    setSelectedProjectId(projectId);
    setIsCardModalOpen(true);
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCard.nome || !newCard.descricao || !newCard.url) {
      showToast('Preencha todos os campos do card!', 'error');
      return;
    }

    try {
      const projeto = projetos.find(p => p.id === selectedProjectId);
      const extras = projeto.extras || [];
      
      // Criar card no formato compatível com PainelProjeto
      const novoCard = {
        name: newCard.nome,
        description: newCard.descricao,
        url: newCard.url
      };
      
      await updateDoc(doc(db, 'projetos', selectedProjectId), {
        extras: [...extras, novoCard]
      });

      setNewCard({ nome: '', descricao: '', url: '' });
      setIsCardModalOpen(false);
      fetchProjetos();
      showToast('Card adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar card:', error);
      showToast('Erro ao criar card!', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white animate-fade-in`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between py-3 md:py-6 px-3 md:px-8 border-b border-gray-700 bg-gray-900/50 min-h-[56px] text-white">
        <button
          onClick={() => navigate('/gerencia')}
          className="flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Voltar</span>
        </button>

        <div className="text-center flex-1 mx-2">
          <h1 className="text-base md:text-2xl font-bold text-white truncate">Gestão de Projetos</h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#57B952] hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 transition-colors text-xs md:text-sm shrink-0"
        >
          <Plus size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Novo </span>Projeto
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-3 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="mb-4 md:mb-8">
            <p className="text-gray-500">
              Total de projetos: <span className="font-bold text-white">{projetos.length}</span>
            </p>
          </div>

          {projetos.length === 0 ? (
            <div className="text-center py-20 bg-white/10 backdrop-blur-xl rounded-xl shadow-xl border border-white/20">
              <p className="text-gray-500 mb-4">Nenhum projeto cadastrado.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-[#57B952] font-bold hover:underline"
              >
                + Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {projetos.map((projeto) => (
                <div
                  key={projeto.id}
                  className="bg-white/10 backdrop-blur-xl rounded-lg shadow-xl border border-white/20 overflow-hidden"
                >
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedProject(expandedProject === projeto.id ? null : projeto.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        P
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{projeto.nome}</h3>
                        <p className="text-sm text-gray-500">ID: {projeto.id}</p>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${expandedProject === projeto.id ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {expandedProject === projeto.id && (
                    <div className="border-t border-white/10 p-6 bg-white/5 space-y-4">
                      {editingProject === projeto.id ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nome
                            </label>
                            <input
                              type="text"
                              defaultValue={projeto.nome}
                              onChange={(e) => (projeto.nome = e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              URL Forms
                            </label>
                            <input
                              type="text"
                              defaultValue={projeto.urlForms}
                              onChange={(e) => (projeto.urlForms = e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              URL SharePoint
                            </label>
                            <input
                              type="text"
                              defaultValue={projeto.urlSharePoint}
                              onChange={(e) => (projeto.urlSharePoint = e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleUpdateProject(projeto.id, {
                                  nome: projeto.nome,
                                  urlForms: projeto.urlForms,
                                  urlSharePoint: projeto.urlSharePoint,
                                })
                              }
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <Save size={18} /> Salvar
                            </button>
                            <button
                              onClick={() => setEditingProject(null)}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <X size={18} /> Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">URL Forms:</p>
                            <a
                              href={projeto.urlForms}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm break-all"
                            >
                              {projeto.urlForms}
                            </a>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">URL SharePoint:</p>
                            <a
                              href={projeto.urlSharePoint}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm break-all"
                            >
                              {projeto.urlSharePoint}
                            </a>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Cards do Projeto:</p>
                            {projeto.extras && projeto.extras.length > 0 ? (
                              <div className="space-y-2">
                                {projeto.extras.map((card, index) => (
                                  <div key={index} className="bg-white/10 p-3 rounded border border-white/20">
                                    <p className="font-medium text-white">{card.name}</p>
                                    <p className="text-xs text-gray-500">{card.description}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Nenhum card cadastrado</p>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-3 pt-4">
                            <button
                              onClick={() => openCardModal(projeto.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <LayoutGrid size={18} /> Card
                            </button>
                            <button
                              onClick={() => setEditingProject(projeto.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <Edit2 size={18} /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProject(projeto.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <Trash2 size={18} /> Deletar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Criar Projeto */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Novo Projeto</h2>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  placeholder="Digite o nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Forms
                </label>
                <input
                  type="text"
                  value={newProjectUrlForms}
                  onChange={(e) => setNewProjectUrlForms(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  placeholder="Cole a URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL SharePoint
                </label>
                <input
                  type="text"
                  value={newProjectUrlSharePoint}
                  onChange={(e) => setNewProjectUrlSharePoint(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  placeholder="Cole a URL"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Criar Projeto
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Card */}
      {isCardModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Novo Card</h2>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Card
                </label>
                <input
                  type="text"
                  value={newCard.nome}
                  onChange={(e) => setNewCard({ ...newCard, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  placeholder="Digite o nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newCard.descricao}
                  onChange={(e) => setNewCard({ ...newCard, descricao: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  placeholder="Digite a descrição"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={newCard.url}
                  onChange={(e) => setNewCard({ ...newCard, url: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  placeholder="Cole a URL"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Criar Card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCardModalOpen(false);
                    setNewCard({ nome: '', descricao: '', url: '' });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-300 text-xs border-t border-gray-700 bg-gray-900/50">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default GerenciaProjetos;
