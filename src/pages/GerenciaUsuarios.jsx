import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, MoreVertical, ChevronDown, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

function GerenciaUsuarios() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [editingCargo, setEditingCargo] = useState({ userId: null, cargo: '' });

  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    try {
      // Buscar usuários
      const usuariosSnapshot = await getDocs(collection(db, 'users'));
      let usuariosList = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Usuários carregados:', usuariosList);
      console.log('Função do usuário logado:', userProfile?.funcao);

      // Se NÃO é admin, filtrar para não mostrar admins e administrador geral
      const isAdmin = userProfile?.funcao === 'admin';
      if (!isAdmin) {
        usuariosList = usuariosList.filter(u => {
          const funcao = u.funcao?.toLowerCase();
          return funcao !== 'admin' && funcao !== 'administrador geral';
        });
        console.log('Usuários após filtro (sem admins):', usuariosList);
      }

      setUsuarios(usuariosList);

      // Buscar cargos
      const cargosSnapshot = await getDocs(collection(db, 'cargos'));
      let cargosList = cargosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Se NÃO é admin, filtrar para não mostrar cargo 'admin' e 'administrador geral'
      if (!isAdmin) {
        cargosList = cargosList.filter(c => {
          const nome = c.nome?.toLowerCase();
          return nome !== 'admin' && nome !== 'administrador geral';
        });
      }
      
      setCargos(cargosList);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'ativo'
      });
      showToast('Usuário aprovado com sucesso!', 'success');
      fetchData();
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      showToast('Erro ao aprovar usuário!', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        showToast('Usuário deletado com sucesso!', 'success');
        fetchData();
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        showToast('Erro ao deletar usuário!', 'error');
      }
    }
  };

  const handleUpdateCargo = async (userId, novoCargo) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        funcao: novoCargo
      });
      showToast('Cargo alterado com sucesso!', 'success');
      setEditingCargo({ userId: null, cargo: '' });
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      showToast('Erro ao atualizar cargo!', 'error');
    }
  };

  const startEditingCargo = (userId, currentCargo) => {
    setEditingCargo({ userId, cargo: currentCargo });
  };

  const cancelEditingCargo = () => {
    setEditingCargo({ userId: null, cargo: '' });
  };

  const saveCargoChange = async (userId) => {
    if (!editingCargo.cargo) {
      showToast('Selecione um cargo!', 'error');
      return;
    }
    await handleUpdateCargo(userId, editingCargo.cargo);
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
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
        </div>

        <div className="w-16"></div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-8">
        <div className="w-full max-w-6xl">
          <div className="mb-8">
            <p className="text-gray-500">
              Total de usuários: <span className="font-bold text-gray-900">{usuarios.length}</span>
            </p>
          </div>

          {usuarios.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-200">
              <p className="text-gray-500">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                >
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedUser(expandedUser === usuario.id ? null : usuario.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[#57B952] flex items-center justify-center text-white font-bold">
                        {usuario.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{usuario.nome}</h3>
                        <p className="text-sm text-gray-500">{usuario.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                          {usuario.funcao}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {usuario.status === 'ativo' ? '✓ Ativo' : '⏳ Pendente'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${expandedUser === usuario.id ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {expandedUser === usuario.id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="space-y-4">
                        {/* Alterar Cargo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alterar Cargo
                          </label>
                          {(usuario.funcao === 'admin' || usuario.funcao?.toLowerCase() === 'administrador geral') && userProfile?.funcao !== 'admin' ? (
                            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-between">
                              <span>{usuario.funcao}</span>
                              <span className="text-xs text-gray-500">🔒 Apenas admins podem alterar</span>
                            </div>
                          ) : (
                            <select
                              value={editingCargo.userId === usuario.id ? editingCargo.cargo : usuario.funcao || ''}
                              onChange={(e) => setEditingCargo({ userId: usuario.id, cargo: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#57B952] focus:border-transparent"
                            >
                              <option value="">Selecione um cargo</option>
                              {cargos.map((cargo) => (
                                <option key={cargo.id} value={cargo.nome}>
                                  {cargo.nome}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Botões Salvar/Cancelar */}
                        {editingCargo.userId === usuario.id && editingCargo.cargo !== usuario.funcao && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => saveCargoChange(usuario.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <Check size={18} /> Salvar Alteração
                            </button>
                            <button
                              onClick={cancelEditingCargo}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <X size={18} /> Cancelar
                            </button>
                          </div>
                        )}

                        {/* Aprovar/Rejeitar */}
                        {usuario.status === 'pendente' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApproveUser(usuario.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <Check size={18} /> Aprovar
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usuario.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <X size={18} /> Rejeitar
                            </button>
                          </div>
                        )}

                        {/* Deletar */}
                        {usuario.status === 'ativo' && (
                          <button
                            onClick={() => handleDeleteUser(usuario.id)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Deletar Usuário
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-500 text-xs border-t border-gray-200 bg-white">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <span className="text-2xl">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GerenciaUsuarios;
