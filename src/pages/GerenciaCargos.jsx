import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronDown, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

function GerenciaCargos() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCargo, setExpandedCargo] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [editingCargoData, setEditingCargoData] = useState(null);

  const PERMISSOES = [
    { chave: 'canManageUsers', label: 'Gerenciar Usuários' },
    { chave: 'canManagePermissions', label: 'Gerenciar Permissões' },
    { chave: 'canCreateCargos', label: 'Criar Cargos' },
    { chave: 'canCreateProjetos', label: 'Criar Projetos' },
    { chave: 'canEditCardsProjetos', label: 'Editar Cards dos Projetos' },
  ];

  const [newCargoData, setNewCargoData] = useState({
    nome: '',
    canManageUsers: false,
    canManagePermissions: false,
    canCreateCargos: false,
    canCreateProjetos: false,
    canEditCardsProjetos: false,
  });

  useEffect(() => {
    fetchCargos();
  }, []);

  const fetchCargos = async () => {
    try {
      const cargosSnapshot = await getDocs(collection(db, 'cargos'));
      const cargosList = cargosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCargos(cargosList);
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCargo = async (e) => {
    e.preventDefault();
    if (!newCargoData.nome) {
      alert('Digite um nome para o cargo!');
      return;
    }

    try {
      await addDoc(collection(db, 'cargos'), newCargoData);
      setNewCargoData({
        nome: '',
        canManageUsers: false,
        canManagePermissions: false,
        canCreateCargos: false,
        canCreateProjetos: false,
        canEditCardsProjetos: false,
      });
      setIsCreateModalOpen(false);
      fetchCargos();
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      alert('Erro ao criar cargo!');
    }
  };

  const handleDeleteCargo = async (cargoId) => {
    if (window.confirm('Tem certeza que deseja deletar este cargo?')) {
      try {
        await deleteDoc(doc(db, 'cargos', cargoId));
        fetchCargos();
      } catch (error) {
        console.error('Erro ao deletar cargo:', error);
        alert('Erro ao deletar cargo!');
      }
    }
  };

  const startEditingCargo = (cargo) => {
    setEditingCargo(cargo.id);
    setEditingCargoData({
      nome: cargo.nome,
      canManageUsers: cargo.canManageUsers || false,
      canManagePermissions: cargo.canManagePermissions || false,
      canCreateCargos: cargo.canCreateCargos || false,
      canCreateProjetos: cargo.canCreateProjetos || false,
      canEditCardsProjetos: cargo.canEditCardsProjetos || false,
    });
  };

  const cancelEditingCargo = () => {
    setEditingCargo(null);
    setEditingCargoData(null);
  };

  const handleUpdateCargo = async (cargoId, updatedData) => {
    try {
      await updateDoc(doc(db, 'cargos', cargoId), updatedData);
      setEditingCargo(null);
      setEditingCargoData(null);
      fetchCargos();
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      alert('Erro ao atualizar cargo!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] bg-gray-50 text-black">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-6 px-8 border-b border-gray-200 bg-white">
        <button
          onClick={() => navigate('/gerencia')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Cargos</h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Novo Cargo
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-8">
        <div className="w-full max-w-6xl">
          <div className="mb-8">
            <p className="text-gray-500">
              Total de cargos: <span className="font-bold text-gray-900">{cargos.length}</span>
            </p>
          </div>

          {cargos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-200">
              <p className="text-gray-500 mb-4">Nenhum cargo cadastrado.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-[#57B952] font-bold hover:underline"
              >
                + Criar Primeiro Cargo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cargos.map((cargo) => (
                <div
                  key={cargo.id}
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                >
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedCargo(expandedCargo === cargo.id ? null : cargo.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                        C
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{cargo.nome}</h3>
                        <p className="text-sm text-gray-500">
                          {Object.values(cargo).filter((v) => v === true).length} permissão(ões)
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${expandedCargo === cargo.id ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {expandedCargo === cargo.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
                      {editingCargo === cargo.id ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do Cargo
                            </label>
                            <input
                              type="text"
                              value={editingCargoData.nome}
                              onChange={(e) => setEditingCargoData({ ...editingCargoData, nome: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#57B952] focus:border-transparent"
                            />
                          </div>

                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Permissões
                            </label>
                            {PERMISSOES.map((perm) => (
                              <label key={perm.chave} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingCargoData[perm.chave] || false}
                                  onChange={(e) => setEditingCargoData({ ...editingCargoData, [perm.chave]: e.target.checked })}
                                  className="w-5 h-5 accent-[#57B952]"
                                />
                                <span className="text-gray-700">{perm.label}</span>
                              </label>
                            ))}
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => handleUpdateCargo(cargo.id, editingCargoData)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <Save size={18} /> Salvar
                            </button>
                            <button
                              onClick={cancelEditingCargo}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <X size={18} /> Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Permissões:</p>
                            <div className="space-y-2">
                              {PERMISSOES.map((perm) => (
                                <div key={perm.chave} className="flex items-center gap-2">
                                  <span
                                    className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                                      cargo[perm.chave] ? 'bg-green-600' : 'bg-gray-400'
                                    }`}
                                  >
                                    {cargo[perm.chave] ? '✓' : '✕'}
                                  </span>
                                  <span className="text-sm text-gray-700">{perm.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => startEditingCargo(cargo)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                              <Edit2 size={18} /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCargo(cargo.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
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

      {/* Modal Criar Cargo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Novo Cargo</h2>

            <form onSubmit={handleCreateCargo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cargo
                </label>
                <input
                  type="text"
                  value={newCargoData.nome}
                  onChange={(e) => setNewCargoData({ ...newCargoData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#57B952] focus:border-transparent"
                  placeholder="Digite o nome"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Permissões
                </label>
                {PERMISSOES.map((perm) => (
                  <label key={perm.chave} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCargoData[perm.chave]}
                      onChange={(e) =>
                        setNewCargoData({ ...newCargoData, [perm.chave]: e.target.checked })
                      }
                      className="w-5 h-5 accent-[#57B952]"
                    />
                    <span className="text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Criar Cargo
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-500 text-xs border-t border-gray-200 bg-white">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default GerenciaCargos;
