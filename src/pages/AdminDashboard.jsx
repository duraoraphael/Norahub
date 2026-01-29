import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Trash2, X, Briefcase } from 'lucide-react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

import { auth, db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; 

function AdminDashboard() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [users, setUsers] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null, userName: '' });
  const [modalProjetos, setModalProjetos] = useState({ open: false, userId: null, userName: '', projetosAtuais: [] });
  const [searchProjetos, setSearchProjetos] = useState('');
  const [cargoPermitidos, setCargoPermitidos] = useState([]);

  const isAdmin = userProfile?.funcao === 'admin';
  const isGerenteProjeto = userProfile?.funcao === 'gerente-projeto';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Se for gerente de projeto, redireciona (não tem acesso a admin)
        if (userProfile?.funcao === 'gerente-projeto') {
          navigate('/');
          return;
        }

        // Se for gerente de usuário, verifica permissão
        if (userProfile?.funcao === 'gerente-usuario') {
          const cargosQuery = query(
            collection(db, 'cargos'),
            where('nome', '==', userProfile.funcao)
          );
          const cargosSnapshot = await getDocs(cargosQuery);
          if (cargosSnapshot.empty || (!cargosSnapshot.docs[0].data().canManageUsers && !cargosSnapshot.docs[0].data().canManagePermissions)) {
            navigate('/');
            return;
          }
        }

        // Se não for admin e não tiver permissão, redireciona
        if (!isAdmin && userProfile?.funcao !== 'gerente-usuario') {
          navigate('/');
          return;
        }

        // Buscar cargos permitidos para gerente de projeto
        if (userProfile?.funcao === 'gerente-projeto') {
          const cargosQuery = query(
            collection(db, 'cargos'),
            where('nome', '==', userProfile.funcao)
          );
          const cargosSnapshot = await getDocs(cargosQuery);
          if (!cargosSnapshot.empty) {
            const cargoData = cargosSnapshot.docs[0].data();
            setCargoPermitidos(cargoData.projetos || []);
          }
        }

        const userSnapshot = await getDocs(collection(db, 'usuarios'));
        let userLista = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Gerente de usuário só vê usuários que não são admin
        if (userProfile?.funcao === 'gerente-usuario' && !isAdmin) {
          userLista = userLista.filter(u => u.funcao !== 'admin');
        }
        
        userLista.sort((a, b) => (a.statusAcesso === 'pendente' ? -1 : 1));
        setUsers(userLista);

        const projetoSnapshot = await getDocs(collection(db, 'projetos'));
        const projetoLista = projetoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjetos(projetoLista);

        const cargosSnapshot = await getDocs(collection(db, 'cargos'));
        const cargosList = cargosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log('Cargos carregados:', cargosList);
        
        // Garantir que sempre tenha opções de cargo
        if (cargosList.length === 0) {
          setCargos([
            { id: 'default-colaborador', nome: 'Colaborador' },
            { id: 'default-gerente', nome: 'Gerente' }
          ]);
        } else {
          // Ordenar cargos por quantidade de permissões (decrescente)
          const cargosOrdenados = cargosList.sort((a, b) => {
            const permissoesA = [
              a.canManageUsers,
              a.canManagePermissions,
              a.canCreateCargos,
              a.canCreateProjetos,
              a.canEditCardsProjetos
            ].filter(Boolean).length;
            
            const permissoesB = [
              b.canManageUsers,
              b.canManagePermissions,
              b.canCreateCargos,
              b.canCreateProjetos,
              b.canEditCardsProjetos
            ].filter(Boolean).length;
            
            return permissoesB - permissoesA; // Ordem decrescente
          });
          
          setCargos(cargosOrdenados);
        }
      } catch (error) {
        console.error("Erro:", error);
        setAlertInfo({ message: "Erro ao carregar dados.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, userProfile, navigate]);

  const handleApprove = async (user, newRole) => {
    try {
        // Apenas admin pode aprovar como admin
        if (!isAdmin && newRole === 'admin') {
          setAlertInfo({ message: "Você não tem permissão para criar um administrador.", type: "error" });
          return;
        }
        
        const userRef = doc(db, 'usuarios', user.id);
        const finalRole = newRole || user.funcao;
        
        await updateDoc(userRef, { 
            statusAcesso: 'ativo',
            funcao: finalRole 
        });
        
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, statusAcesso: 'ativo', funcao: finalRole } : u));
        setAlertInfo({ message: `Usuário aprovado como ${finalRole}!`, type: "success" });
    } catch (error) {
        setAlertInfo({ message: "Erro ao aprovar.", type: "error" });
    }
  };

  const handleReject = async (userId) => {
        // Abre modal de confirmação mais atraente
        const user = users.find(u => u.id === userId);
        setConfirmDelete({ open: true, userId, userName: user?.nome || user?.email || 'Usuário' });
  };

    const cancelDelete = () => setConfirmDelete({ open: false, userId: null, userName: '' });

    const deleteUser = async (userId) => {
        try {
            // Impedir exclusão de administradores por não-admins
            const user = users.find(u => u.id === userId);
            if (!isAdmin && user?.funcao === 'admin') {
              setAlertInfo({ message: "Você não pode excluir um administrador.", type: "error" });
              cancelDelete();
              return;
            }
            
            // Remove o perfil do Firestore
            await deleteDoc(doc(db, 'usuarios', userId));
            
            setUsers(prev => prev.filter(u => u.id !== userId));
            setAlertInfo({ message: 'Usuário removido do Firebase!', type: 'success' });
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            setAlertInfo({ message: 'Erro ao remover usuário.', type: 'error' });
        } finally {
            cancelDelete();
        }
    };

  const handleRoleChange = async (userId, newRole) => {
    try {
        // Gerente de projeto não pode alterar cargos
        if (isGerenteProjeto) {
          setAlertInfo({ message: "Você não tem permissão para alterar cargos.", type: "error" });
          return;
        }

        // Gerente de usuário não pode alterar para ou de admin
        if (!isAdmin && newRole === 'admin') {
          setAlertInfo({ message: "Você não tem permissão para atribuir cargo de administrador.", type: "error" });
          return;
        }

        const user = users.find(u => u.id === userId);
        if (!isAdmin && user.funcao === 'admin') {
          setAlertInfo({ message: "Você não pode modificar um administrador.", type: "error" });
          return;
        }
        
        await updateDoc(doc(db, 'usuarios', userId), { funcao: newRole });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, funcao: newRole } : u));
        setAlertInfo({ message: "Função alterada.", type: "success" });
    } catch (error) { setAlertInfo({ message: "Erro ao alterar.", type: "error" }); }
  };

  const handleAssignProject = async (userId, projetoId) => {
    try {
        // Gerente de projeto só pode atribuir seus próprios projetos
        if (isGerenteProjeto && !cargoPermitidos.includes(projetoId)) {
          setAlertInfo({ message: "Você não tem permissão para atribuir este projeto.", type: "error" });
          return;
        }

        const user = users.find(u => u.id === userId);
        const projetosPorUsuario = user.projetos || [];
        
        // Se já está na lista, remove; se não, adiciona
        let novosProjetos;
        if (projetosPorUsuario.includes(projetoId)) {
            novosProjetos = projetosPorUsuario.filter(p => p !== projetoId);
        } else {
            novosProjetos = [...projetosPorUsuario, projetoId];
        }
        
        await updateDoc(doc(db, 'usuarios', userId), { projetos: novosProjetos });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, projetos: novosProjetos } : u));
        
        const projeto = projetos.find(p => p.id === projetoId);
        const acao = projetosPorUsuario.includes(projetoId) ? 'removido de' : 'adicionado a';
        setAlertInfo({ message: `Usuário ${acao} "${projeto?.nome}"!`, type: "success" });
    } catch (error) { 
        console.error('Erro:', error);
        setAlertInfo({ message: "Erro ao atribuir projeto.", type: "error" }); 
    }
  };

  const abrirModalProjetos = (userId) => {
    const user = users.find(u => u.id === userId);
    setModalProjetos({
      open: true,
      userId,
      userName: user?.nome || user?.email || 'Usuário',
      projetosAtuais: user?.projetos || []
    });
    setSearchProjetos('');
  };

  const fecharModalProjetos = () => {
    setModalProjetos({ open: false, userId: null, userName: '', projetosAtuais: [] });
    setSearchProjetos('');
  };

  const salvarProjetosModal = async () => {
    try {
      // Gerente de projeto só pode atribuir seus próprios projetos
      if (isGerenteProjeto) {
        const projetosInvalidos = modalProjetos.projetosAtuais.filter(p => !cargoPermitidos.includes(p));
        if (projetosInvalidos.length > 0) {
          setAlertInfo({ message: "Você não tem permissão para atribuir alguns desses projetos.", type: "error" });
          return;
        }
      }

      await updateDoc(doc(db, 'usuarios', modalProjetos.userId), { projetos: modalProjetos.projetosAtuais });
      setUsers(prev => prev.map(u => u.id === modalProjetos.userId ? { ...u, projetos: modalProjetos.projetosAtuais } : u));
      setAlertInfo({ message: `${modalProjetos.userName} agora tem ${modalProjetos.projetosAtuais.length} projeto(s)!`, type: "success" });
      fecharModalProjetos();
    } catch (error) {
      console.error('Erro:', error);
      setAlertInfo({ message: "Erro ao salvar projetos.", type: "error" });
    }
  };

  const toggleProjetoModal = (projetoId) => {
    // Gerente de projeto não pode selecionar projetos que não são seus
    if (isGerenteProjeto && !cargoPermitidos.includes(projetoId)) {
      return;
    }

    const novosProjetos = modalProjetos.projetosAtuais.includes(projetoId)
      ? modalProjetos.projetosAtuais.filter(p => p !== projetoId)
      : [...modalProjetos.projetosAtuais, projetoId];
    
    setModalProjetos({ ...modalProjetos, projetosAtuais: novosProjetos });
  };

  const projetosFiltrados = isGerenteProjeto
    ? projetos.filter(p => 
        cargoPermitidos.includes(p.id) && 
        p.nome?.toLowerCase().includes(searchProjetos.toLowerCase())
      )
    : projetos.filter(p => 
        p.nome?.toLowerCase().includes(searchProjetos.toLowerCase())
      );

  const filteredUsers = users.filter(user => 
    (user.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
        <div className="min-h-screen w-full flex flex-col font-[Outfit,Poppins] overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-colors duration-200 relative text-white">
          {/* Background decorativo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#57B952]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#008542]/10 rounded-full blur-3xl"></div>
          </div>
            {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
            {confirmDelete.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-6 border border-white/20">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-yellow-500/20 rounded-full p-2">
                                <AlertTriangle size={28} className="text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">Confirmar exclusão</h3>
                                <p className="text-sm text-gray-300 mt-1">Você tem certeza que deseja remover <span className="font-medium text-white">{confirmDelete.userName}</span>? Esta ação não pode ser desfeita.</p>
                                <div className="mt-5 flex gap-3 justify-end">
                                    <button onClick={cancelDelete} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 transition-colors">Cancelar</button>
                                    <button onClick={() => deleteUser(confirmDelete.userId)} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Excluir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-3 md:py-6 px-3 md:px-8 border-b border-gray-700 min-h-[56px] md:h-20 bg-gray-900/50 backdrop-blur-md z-20">
        
        {/* Esquerda: Botão Voltar + Badge Admin */}
        <div className="absolute left-3 md:left-8 flex items-center gap-2 md:gap-4">
            {/* MUDANÇA AQUI: Link aponta para /selecao-projeto */}
            <Link to="/selecao-projeto" className="flex items-center gap-1 md:gap-2 text-gray-300 hover:text-[#57B952] hover:bg-white/5 px-4 py-2 rounded-lg transition-all font-semibold text-xs md:text-sm backdrop-blur-sm">
                <ArrowLeft size={16} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Voltar</span>
            </Link>
            <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-purple-500/50">
                Admin
            </span>
        </div>
        
        {/* Centro: Logo */}
        <div className="flex items-center justify-center">
            <img 
              src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} 
              alt="Logo" 
              className="h-6 sm:h-8 md:h-10 w-auto object-contain drop-shadow-lg" 
            />
        </div>

      </header>

      <main className="flex-grow flex flex-col items-center p-3 md:p-8">
        <div className="w-full max-w-6xl">
            
            <div className="mb-4 md:mb-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-semibold transition-colors text-sm md:text-base min-h-[44px] border border-blue-500/30"
                >
                    <Users size={16} className="md:w-[18px] md:h-[18px]" /> Usuários
                </button>
                <button 
                    onClick={() => navigate('/admin-cargos')}
                    className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg font-semibold transition-colors text-sm md:text-base min-h-[44px] border border-purple-500/30"
                >
                    <Briefcase size={16} className="md:w-[18px] md:h-[18px]" /> Gerenciar Cargos
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 md:mb-8 gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2">
                        <Users className="text-[#57B952]" size={20} /> Gestão de Usuários
                    </h1>
                    <p className="text-sm md:text-base text-gray-200 mt-1">Aprove cadastros pendentes e gerencie permissões.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-gray-300" /></span>
                    <input 
                        type="text" 
                        placeholder="Buscar usuário..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#57B952] outline-none backdrop-blur-sm"
                    />
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden -mx-4 md:mx-0">
                <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase">Usuário</th>
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase">Cargo</th>
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase">Projeto</th>
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase">Cargo / Permissão</th>
                                <th className="p-4 text-xs font-bold text-gray-100 uppercase text-right">Excluir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-300">Carregando...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-300">Nenhum usuário encontrado.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={`transition-colors ${user.statusAcesso === 'pendente' ? 'bg-yellow-500/10' : 'hover:bg-white/5'} border-white/5`}>
                                        
                                        <td className="p-4">
                                            {user.statusAcesso === 'pendente' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30">
                                                    <AlertTriangle size={12} /> Pendente
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">
                                                    <CheckCircle size={12} /> Ativo
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 font-medium text-white">{user.nome}</td>
                                        <td className="p-4">
                                          <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                                            user.funcao === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                          }`}>
                                            {user.funcao === 'admin' ? 'Administrador' : user.funcao || 'colaborador'}
                                          </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                          <button 
                                            onClick={() => abrirModalProjetos(user.id)}
                                            className="px-3 py-1 bg-[#57B952]/20 hover:bg-[#57B952]/30 text-[#6BC962] rounded-lg text-xs font-semibold transition-colors border border-[#57B952]/30"
                                          >
                                            {(user.projetos || []).length > 0 ? `${user.projetos.length} projeto(s)` : 'Atribuir'}
                                          </button>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">{user.email}</td>
                                        
                                        <td className="p-4">
                                            {user.statusAcesso === 'pendente' ? (
                                                <div className="flex items-center gap-2">
                                                    <select 
                                                        defaultValue={user.funcao || 'Colaborador'}
                                                        id={`role-${user.id}`}
                                                        className="text-sm p-2 rounded-lg border border-white/20 bg-white/10 text-white font-medium min-w-[160px] focus:ring-2 focus:ring-[#57B952]"
                                                    >
                                                        {cargos.length === 0 ? (
                                                            <option value="Colaborador">Colaborador</option>
                                                        ) : (
                                                            cargos.map(cargo => (
                                                                <option key={cargo.id} value={cargo.nome}>{cargo.nome}</option>
                                                            ))
                                                        )}
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                    
                                                    <button 
                                                        onClick={() => handleApprove(user, document.getElementById(`role-${user.id}`).value)}
                                                        className="p-1.5 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/30" title="Aprovar"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(user.id)}
                                                        className="p-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30" title="Recusar"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <select 
                                                    value={user.funcao || 'Colaborador'} 
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={user.funcao === 'admin' && !isAdmin}
                                                    className={`w-full px-3 py-2 rounded-lg text-sm border ${user.funcao === 'admin' && !isAdmin ? 'bg-gray-700/50 border-gray-600 cursor-not-allowed opacity-50 text-gray-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/15 focus:ring-2 focus:ring-[#57B952] cursor-pointer'} outline-none font-medium transition-colors min-w-[160px]`}>
                                                    {cargos.length === 0 ? (
                                                        <option value="Colaborador">Colaborador</option>
                                                    ) : (
                                                        cargos.map(cargo => (
                                                            <option key={cargo.id} value={cargo.nome}>{cargo.nome}</option>
                                                        ))
                                                    )}
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleReject(user.id)} 
                                                disabled={user.funcao === 'admin' && !isAdmin}
                                                className={`p-1.5 rounded-lg ${user.funcao === 'admin' && !isAdmin ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50 text-gray-600' : 'bg-red-500/20 text-red-700 hover:bg-red-500/30 border border-red-500/30'} transition-colors`} 
                                                title={user.funcao === 'admin' && !isAdmin ? 'Não pode excluir administrador' : 'Excluir'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* MODAL DE ATRIBUIÇÃO DE PROJETOS */}
      {modalProjetos.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col border border-white/20">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Atribuir Projetos</h2>
                <p className="text-sm text-gray-300 mt-1">{modalProjetos.userName}</p>
              </div>
              <button 
                onClick={fecharModalProjetos} 
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Barra de busca */}
            <div className="px-6 pt-4 pb-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-600" />
                </span>
                <input 
                  type="text" 
                  placeholder="Buscar projetos..." 
                  value={searchProjetos} 
                  onChange={(e) => setSearchProjetos(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#57B952] outline-none"
                />
              </div>
            </div>

            {/* Lista de projetos */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {projetosFiltrados.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Nenhum projeto encontrado</p>
                ) : (
                  projetosFiltrados.map(projeto => (
                    <label 
                      key={projeto.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        checked={modalProjetos.projetosAtuais.includes(projeto.id)} 
                        onChange={() => toggleProjetoModal(projeto.id)}
                        className="w-5 h-5 rounded border-white/20 text-[#57B952] focus:ring-[#57B952] accent-[#57B952] bg-white/5"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{projeto.nome}</p>
                        <p className="text-xs text-gray-400">{projeto.descricao || '-'}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-white/10 bg-white/5">
              <button 
                onClick={fecharModalProjetos}
                className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 text-gray-300 font-medium rounded-lg transition-colors border border-white/20"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarProjetosModal}
                className="flex-1 py-2 px-4 bg-[#57B952] hover:bg-[#3d8c38] text-white font-medium rounded-lg transition-colors"
              >
                Salvar ({modalProjetos.projetosAtuais.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
