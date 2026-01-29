import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, User, Briefcase, CheckCircle, Crown, Users, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

function AdminCargos() {
  const { currentUser, userProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [cargos, setCargos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [novoCargo, setNovoCargo] = useState('');
  const [tipoCargo, setTipoCargo] = useState('colaborador');
  const [projetosSelecionados, setProjetosSelecionados] = useState([]);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canManagePermissions, setCanManagePermissions] = useState(false);
  const [canCreateCargos, setCanCreateCargos] = useState(false);
  const [canCreateProjetos, setCanCreateProjetos] = useState(false);
  const [canEditCardsProjetos, setCanEditCardsProjetos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, cargoId: null, cargoNome: '' });

  const TIPOS_CARGO = {
    admin: { label: 'Administrador', color: 'bg-red-100 text-red-700', icon: Crown },
    'gerente-usuario': { label: 'Gerente de Usuário', color: 'bg-purple-100 text-purple-700', icon: Users },
    'gerente-projeto': { label: 'Gerente de Projeto', color: 'bg-blue-100 text-blue-700', icon: FolderOpen },
    colaborador: { label: 'Colaborador', color: 'bg-gray-700 text-gray-200', icon: User }
  };

  const PERMISSOES = [
    { id: 'canManageUsers', label: 'Gerenciar Usuários', description: 'Criar, editar e remover usuários' },
    { id: 'canManagePermissions', label: 'Atribuir Projetos', description: 'Atribuir e revogar acesso a projetos' },
    { id: 'canCreateCargos', label: 'Criar Cargos', description: 'Criar e editar novos cargos' },
    { id: 'canCreateProjetos', label: 'Criar Projetos', description: 'Criar novos projetos' },
    { id: 'canEditCardsProjetos', label: 'Editar Cards de Projetos', description: 'Editar cards adicionais nos projetos' }
  ];

  const fotoURL = currentUser?.photoURL || userProfile?.fotoURL;
  const isAdmin = userProfile?.funcao === 'admin';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const canEditCargo = (cargo) => {
    if (isAdmin) return true;
    if (userProfile?.funcao !== 'gerente-usuario') return false;
    // Gerente de usuário não pode modificar admin
    if (cargo.tipo === 'admin') return false;
    return true;
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!userProfile) {
        navigate('/');
        return;
      }

      // Admin tem acesso total
      if (isAdmin) {
        fetchData();
        return;
      }

      // Verificar se tem permissão canCreateCargos
      try {
        const cargosQuery = query(
          collection(db, 'cargos'),
          where('nome', '==', userProfile.funcao)
        );
        const cargosSnapshot = await getDocs(cargosQuery);
        
        if (!cargosSnapshot.empty && cargosSnapshot.docs[0].data().canCreateCargos) {
          fetchData();
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        navigate('/');
      }
    };

    checkAccess();
  }, [isAdmin, userProfile, navigate]);

  const initializeDefaultCargos = async () => {
    try {
      const cargosSnapshot = await getDocs(collection(db, 'cargos'));
      
      // Se não houver nenhum cargo, criar os cargos padrão
      if (cargosSnapshot.empty) {
        const cargosDefault = [
          {
            nome: 'Administrador Geral',
            tipo: 'admin',
            projetos: [],
            canManageUsers: true,
            canManagePermissions: true,
            canCreateCargos: true,
            canCreateProjetos: true,
            canEditCardsProjetos: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nome: 'Gerente Geral',
            tipo: 'colaborador',
            projetos: [],
            canManageUsers: true,
            canManagePermissions: true,
            canCreateCargos: true,
            canCreateProjetos: true,
            canEditCardsProjetos: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nome: 'Gerente de Usuários',
            tipo: 'colaborador',
            projetos: [],
            canManageUsers: true,
            canManagePermissions: true,
            canCreateCargos: false,
            canCreateProjetos: false,
            canEditCardsProjetos: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nome: 'Gerente de Projetos 741',
            tipo: 'colaborador',
            projetos: [],
            canManageUsers: false,
            canManagePermissions: false,
            canCreateCargos: false,
            canCreateProjetos: true,
            canEditCardsProjetos: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nome: 'Gerente de Projetos 740',
            tipo: 'colaborador',
            projetos: [],
            canManageUsers: false,
            canManagePermissions: false,
            canCreateCargos: false,
            canCreateProjetos: true,
            canEditCardsProjetos: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nome: 'Gerente de Cargos',
            tipo: 'colaborador',
            projetos: [],
            canManageUsers: false,
            canManagePermissions: false,
            canCreateCargos: true,
            canCreateProjetos: false,
            canEditCardsProjetos: false,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            nome: 'Colaborador',
            tipo: 'colaborador',
            projetos: [],
            canManageUsers: false,
            canManagePermissions: false,
            canCreateCargos: false,
            canCreateProjetos: false,
            canEditCardsProjetos: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        for (const cargo of cargosDefault) {
          await addDoc(collection(db, 'cargos'), cargo);
        }

        showToast('Cargos padrão criados com sucesso!', 'success');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao inicializar cargos:', error);
      showToast('Erro ao inicializar cargos padrão.', 'error');
      return false;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Verificar e criar cargos padrão se necessário
      await initializeDefaultCargos();

      // Buscar cargos
      const cargosSnapshot = await getDocs(collection(db, 'cargos'));
      const cargosList = cargosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCargos(cargosList);

      // Buscar projetos
      const projetosSnapshot = await getDocs(collection(db, 'projetos'));
      const projetosList = projetosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjetos(projetosList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCargo(null);
    setNovoCargo('');
    setProjetosSelecionados([]);
    setCanManageUsers(false);
    setCanManagePermissions(false);
    setCanCreateCargos(false);
    setCanCreateProjetos(false);
    setCanEditCardsProjetos(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cargo) => {
    setEditingCargo(cargo);
    setNovoCargo(cargo.nome);
    setProjetosSelecionados(cargo.projetos || []);
    setCanManageUsers(cargo.canManageUsers || false);
    setCanManagePermissions(cargo.canManagePermissions || false);
    setCanCreateCargos(cargo.canCreateCargos || false);
    setCanCreateProjetos(cargo.canCreateProjetos || false);
    setCanEditCardsProjetos(cargo.canEditCardsProjetos || false);
    setIsModalOpen(true);
  };

  const handleSaveCargo = async (e) => {
    e.preventDefault();
    if (!novoCargo.trim()) return;

    setSaving(true);
    try {
      const cargoData = {
        nome: novoCargo.trim(),
        tipo: 'colaborador',
        projetos: projetosSelecionados,
        canManageUsers: canManageUsers,
        canManagePermissions: canManagePermissions,
        canCreateCargos: canCreateCargos,
        canCreateProjetos: canCreateProjetos,
        canEditCardsProjetos: canEditCardsProjetos,
        updatedAt: new Date()
      };

      if (editingCargo) {
        await updateDoc(doc(db, 'cargos', editingCargo.id), cargoData);
        showToast('Cargo atualizado com sucesso!', 'success');
      } else {
        await addDoc(collection(db, 'cargos'), {
          ...cargoData,
          createdAt: new Date()
        });
        showToast('Cargo criado com sucesso!', 'success');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      showToast('Erro ao salvar cargo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCargo = (cargo) => {
    setConfirmDelete({ open: true, cargoId: cargo.id, cargoNome: cargo.nome });
  };

  const confirmDeleteCargo = async () => {
    try {
      // Verificar se há usuários com este cargo
      const usersQuery = query(collection(db, 'usuarios'), where('funcao', '==', confirmDelete.cargoNome));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        showToast(`Não é possível excluir: ${usersSnapshot.size} usuário(s) possui(em) este cargo.`, 'error');
        setConfirmDelete({ open: false, cargoId: null, cargoNome: '' });
        return;
      }

      await deleteDoc(doc(db, 'cargos', confirmDelete.cargoId));
      showToast('Cargo excluído com sucesso!', 'success');
      setConfirmDelete({ open: false, cargoId: null, cargoNome: '' });
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      showToast('Erro ao excluir cargo.', 'error');
      setConfirmDelete({ open: false, cargoId: null, cargoNome: '' });
    }
  };

  const toggleProjeto = (projetoId) => {
    setProjetosSelecionados(prev => 
      prev.includes(projetoId) 
        ? prev.filter(id => id !== projetoId)
        : [...prev, projetoId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <p className="text-gray-300">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col font-[Outfit,Poppins] overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-colors duration-200 relative text-white">
      <header className="w-full flex items-center justify-between py-3 md:py-6 px-3 md:px-8 bg-gray-900/50 shadow-sm border-b border-gray-700 min-h-[56px]">
        <Link to="/admin">
          <img 
            src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} 
            alt="Logo" 
            className="h-6 sm:h-8 md:h-10 w-auto object-contain drop-shadow-lg" 
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            onClick={(e) => e.preventDefault()} 
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#57B952] transition-all bg-gray-100 flex items-center justify-center"
          >
            {fotoURL ? <img src={fotoURL} className="w-full h-full object-cover" alt="Avatar" /> : <User size={20} className="text-gray-500" />}
          </Link>
        </div>
      </header>

      <main className="flex-grow p-3 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-8 gap-4">
            <div>
              <Link 
                to="/admin" 
                className="inline-flex items-center gap-2 text-gray-300 hover:text-[#57B952] mb-4 transition-colors text-sm"
              >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
                Voltar
              </Link>
              <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
                <Briefcase size={32} className="text-purple-600" />
                Gerenciar Cargos
              </h1>
              <p className="text-gray-200 mt-2">Crie e gerencie cargos com permissões por projeto</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => initializeDefaultCargos().then(() => fetchData())}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
              >
                <Plus size={20} />
                Carregar Cargos Padrão
              </button>
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
              >
                <Plus size={20} />
                Novo Cargo
              </button>
            </div>
          </div>

          {/* Lista de Cargos */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Cargo</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Tipo</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Projetos com Acesso</th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-300">Permissões</th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cargos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Nenhum cargo cadastrado. Clique em "Novo Cargo" para começar.
                      </td>
                    </tr>
                  ) : (
                    cargos.map(cargo => {
                      const tipoInfo = TIPOS_CARGO[cargo.tipo || 'colaborador'];
                      const IconComponent = tipoInfo.icon;
                      return (
                      <tr key={cargo.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-4">
                          <span className="font-semibold text-white">{cargo.nome}</span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-xs font-medium ${tipoInfo.color}`}>
                            <IconComponent size={14} />
                            {tipoInfo.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {cargo.projetos && cargo.projetos.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {cargo.projetos.map(projetoId => {
                                const projeto = projetos.find(p => p.id === projetoId);
                                return projeto ? (
                                  <span key={projetoId} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                    {projeto.nome}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-sm">Nenhum projeto atribuído</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {cargo.canManageUsers && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Usuários</span>
                            )}
                            {cargo.canManagePermissions && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">Projetos</span>
                            )}
                            {cargo.canCreateCargos && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">Cargos</span>
                            )}
                            {cargo.canCreateProjetos && (
                              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-medium">+Proj</span>
                            )}
                            {cargo.canEditCardsProjetos && (
                              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-medium">Cards</span>
                            )}
                            {!cargo.canManageUsers && !cargo.canManagePermissions && !cargo.canCreateCargos && !cargo.canCreateProjetos && !cargo.canEditCardsProjetos && (
                              <span className="text-gray-600 text-xs">Nenhuma</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(cargo)}
                              disabled={!canEditCargo(cargo)}
                              className={`p-2 rounded-lg transition-colors ${
                                canEditCargo(cargo)
                                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                                  : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              }`}
                              title={canEditCargo(cargo) ? 'Editar' : 'Você não pode editar este cargo'}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCargo(cargo)}
                              disabled={!canEditCargo(cargo)}
                              className={`p-2 rounded-lg transition-colors ${
                                canEditCargo(cargo)
                                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                  : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              }`}
                              title={canEditCargo(cargo) ? 'Excluir' : 'Você não pode deletar este cargo'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL CREATE/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Briefcase size={24} className="text-purple-600" />
                {editingCargo ? 'Editar Cargo' : 'Novo Cargo'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveCargo} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cargo Pré-Pronto</label>
                  <select
                    onChange={(e) => {
                      const cargoSelecionado = e.target.value;
                      if (cargoSelecionado === '') return;
                      
                      // Define as configurações baseadas no cargo selecionado
                      const configs = {
                        'Administrador Geral': {
                          nome: 'Administrador Geral',
                          canManageUsers: true,
                          canManagePermissions: true,
                          canCreateCargos: true,
                          canCreateProjetos: true,
                          canEditCardsProjetos: true
                        },
                        'Gerente Geral': {
                          nome: 'Gerente Geral',
                          canManageUsers: true,
                          canManagePermissions: true,
                          canCreateCargos: true,
                          canCreateProjetos: true,
                          canEditCardsProjetos: true
                        },
                        'Gerente de Usuários': {
                          nome: 'Gerente de Usuários',
                          canManageUsers: true,
                          canManagePermissions: true,
                          canCreateCargos: false,
                          canCreateProjetos: false,
                          canEditCardsProjetos: false
                        },
                        'Gerente de Projetos': {
                          nome: 'Gerente de Projetos',
                          canManageUsers: false,
                          canManagePermissions: false,
                          canCreateCargos: false,
                          canCreateProjetos: true,
                          canEditCardsProjetos: true
                        },
                        'Gerente de Cargos': {
                          nome: 'Gerente de Cargos',
                          canManageUsers: false,
                          canManagePermissions: false,
                          canCreateCargos: true,
                          canCreateProjetos: false,
                          canEditCardsProjetos: false
                        },
                        'Colaborador': {
                          nome: 'Colaborador',
                          canManageUsers: false,
                          canManagePermissions: false,
                          canCreateCargos: false,
                          canCreateProjetos: false,
                          canEditCardsProjetos: false
                        }
                      };
                      
                      const config = configs[cargoSelecionado];
                      if (config) {
                        setNovoCargo(config.nome);
                        setCanManageUsers(config.canManageUsers);
                        setCanManagePermissions(config.canManagePermissions);
                        setCanCreateCargos(config.canCreateCargos);
                        setCanCreateProjetos(config.canCreateProjetos);
                        setCanEditCardsProjetos(config.canEditCardsProjetos);
                      }
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                  >
                    <option value="">Selecione um cargo pré-pronto...</option>
                    <option value="Administrador Geral">Administrador Geral (Acesso Total)</option>
                    <option value="Gerente Geral">Gerente Geral (Gerencia Tudo)</option>
                    <option value="Gerente de Usuários">Gerente de Usuários (Usuários + Projetos)</option>
                    <option value="Gerente de Projetos">Gerente de Projetos (Criar Projetos + Cards)</option>
                    <option value="Gerente de Cargos">Gerente de Cargos (Criar/Editar Cargos)</option>
                    <option value="Colaborador">Colaborador (Sem Permissões)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">Selecione um cargo pré-configurado ou personalize abaixo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Cargo *</label>
                  <input
                    type="text"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    placeholder="Ex: Gerente, Coordenador, etc."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-[#57B952] focus:border-transparent placeholder-gray-400"
                    required
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Projetos com Permissão de Edição ({projetosSelecionados.length} selecionados)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Usuários com este cargo poderão modificar apenas os projetos selecionados abaixo
                  </p>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {projetos.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">Nenhum projeto disponível</p>
                    ) : (
                      projetos.map(projeto => (
                        <label 
                          key={projeto.id} 
                          className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={projetosSelecionados.includes(projeto.id)}
                            onChange={() => toggleProjeto(projeto.id)}
                            className="w-4 h-4 text-[#57B952] border-gray-300 rounded focus:ring-[#57B952]"
                          />
                          <span className="text-white font-medium">{projeto.nome}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-300 mb-3">Permissões Customizáveis</p>
                    <p className="text-xs text-gray-500 mb-4">Selecione as permissões específicas que este cargo terá no sistema:</p>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {PERMISSOES.map(perm => {
                      const value = eval(perm.id);
                      const colorMap = {
                        'canManageUsers': 'bg-blue-50 border-blue-200',
                        'canManagePermissions': 'bg-green-50 border-green-200',
                        'canCreateCargos': 'bg-purple-50 border-purple-200',
                        'canCreateProjetos': 'bg-indigo-50 border-indigo-200',
                        'canEditCardsProjetos': 'bg-amber-50 border-amber-200'
                      };

                      return (
                        <label 
                          key={perm.id} 
                          className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:opacity-80 transition-colors ${colorMap[perm.id]}`}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => {
                              switch(perm.id) {
                                case 'canManageUsers': setCanManageUsers(e.target.checked); break;
                                case 'canManagePermissions': setCanManagePermissions(e.target.checked); break;
                                case 'canCreateCargos': setCanCreateCargos(e.target.checked); break;
                                case 'canCreateProjetos': setCanCreateProjetos(e.target.checked); break;
                                case 'canEditCardsProjetos': setCanEditCardsProjetos(e.target.checked); break;
                                default: break;
                              }
                            }}
                            className="w-4 h-4 border-gray-300 rounded focus:ring-2"
                          />
                          <div>
                            <p className="font-medium text-white">{perm.label}</p>
                            <p className="text-xs text-gray-600">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex gap-3 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
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
                      <Save size={18} />
                      {editingCargo ? 'Salvar Alterações' : 'Criar Cargo'}
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
          <div className={`border-l-4 ${toast.type === 'error' ? 'bg-red-500/20 border-red-500' : 'bg-green-500/20 border-[#57B952]'} rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px] text-white`}>
            <div className={`${toast.type === 'error' ? 'bg-red-100' : 'bg-green-100'} p-2 rounded-full`}>
              {toast.type === 'error' ? (
                <X size={24} className="text-red-500" />
              ) : (
                <CheckCircle size={24} className="text-[#57B952]" />
              )}
            </div>
            <div>
              <p className="font-bold text-white">{toast.type === 'error' ? 'Erro!' : 'Sucesso!'}</p>
              <p className="text-sm text-gray-600">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300]">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-700 text-white">
            <h3 className="text-lg font-bold text-white mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja remover o cargo <span className="font-semibold">{confirmDelete.cargoNome}</span>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete({ open: false, cargoId: null, cargoNome: '' })}
                className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCargo}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full py-6 text-center text-gray-300 text-xs shrink-0 border-t border-gray-700 bg-gray-900/50">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default AdminCargos;
