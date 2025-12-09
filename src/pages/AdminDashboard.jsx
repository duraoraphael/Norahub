import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Search, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';

import { auth, db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'; 

function AdminDashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState({ open: false, userId: null, userName: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ordena: Pendentes primeiro
        lista.sort((a, b) => (a.statusAcesso === 'pendente' ? -1 : 1));
        
        setUsers(lista);
      } catch (error) {
        console.error("Erro:", error);
        setAlertInfo({ message: "Erro ao carregar usuários.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleApprove = async (user, newRole) => {
    try {
        const userRef = doc(db, 'users', user.id);
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
            await deleteDoc(doc(db, 'users', userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
            setAlertInfo({ message: 'Usuário removido com sucesso.', type: 'success' });
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            setAlertInfo({ message: 'Erro ao remover usuário.', type: 'error' });
        } finally {
            cancelDelete();
        }
    };

  const handleRoleChange = async (userId, newRole) => {
    try {
        await updateDoc(doc(db, 'users', userId), { funcao: newRole });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, funcao: newRole } : u));
        setAlertInfo({ message: "Função alterada.", type: "success" });
    } catch (error) { setAlertInfo({ message: "Erro ao alterar.", type: "error" }); }
  };

  const filteredUsers = users.filter(user => 
    (user.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
        <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 transition-colors duration-200 relative text-black">
            {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
            {confirmDelete.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                                <AlertTriangle size={28} className="text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">Confirmar exclusão</h3>
                                <p className="text-sm text-gray-600 mt-1">Você tem certeza que deseja remover <span className="font-medium text-gray-800">{confirmDelete.userName}</span>? Esta ação não pode ser desfeita.</p>
                                <div className="mt-5 flex gap-3 justify-end">
                                    <button onClick={cancelDelete} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700">Cancelar</button>
                                    <button onClick={() => deleteUser(confirmDelete.userId)} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold">Excluir</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
    {/* ThemeToggle removed */}

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 h-20 bg-white">
        
        {/* Esquerda: Botão Voltar + Badge Admin */}
        <div className="absolute left-4 md:left-8 flex items-center gap-4">
            {/* MUDANÇA AQUI: Link aponta para /selecao-projeto */}
            <Link to="/selecao-projeto" className="flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors">
                <ArrowLeft size={20} />
                <span className="hidden sm:inline font-medium">Voltar</span>
            </Link>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider border border-purple-200">
                Admin
            </span>
        </div>
        
        {/* Centro: Logo */}
        <div className="flex items-center justify-center">
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        </div>

      </header>

      <main className="flex-grow flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
            
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                    <Users size={18} /> Usuários
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-[#57B952]" /> Gestão de Usuários
                    </h1>
                    <p className="text-gray-500 mt-1">Aprove cadastros pendentes e gerencie permissões.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-gray-400" /></span>
                    <input 
                        type="text" 
                        placeholder="Buscar usuário..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#57B952] outline-none shadow-sm placeholder-gray-400" 
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Usuário</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Cargo</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Ações / Permissão</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Carregando...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={`transition-colors ${user.statusAcesso === 'pendente' ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                                        
                                        <td className="p-4">
                                            {user.statusAcesso === 'pendente' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                                                    <AlertTriangle size={12} /> Pendente
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold border border-green-200">
                                                    <CheckCircle size={12} /> Ativo
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 font-medium text-gray-900">{user.nome}</td>
                                        <td className="p-4 text-sm text-gray-600">{user.cargo || '-'}</td>
                                        <td className="p-4 text-sm text-gray-500">{user.email}</td>
                                        
                                        <td className="p-4">
                                            {user.statusAcesso === 'pendente' ? (
                                                <div className="flex items-center gap-2">
                                                    <select 
                                                        defaultValue={user.funcao}
                                                        id={`role-${user.id}`}
                                                        className="text-sm p-1 rounded border border-gray-300 bg-white text-gray-900"
                                                    >
                                                        <option value="solicitante">Solicitante</option>
                                                        <option value="comprador">Comprador</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    
                                                    <button 
                                                        onClick={() => handleApprove(user, document.getElementById(`role-${user.id}`).value)}
                                                        className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600" title="Aprovar"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(user.id)}
                                                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Recusar"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(user.id)}
                                                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative w-40">
                                                    <select 
                                                        value={user.funcao} 
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        className="w-full pl-2 pr-8 py-1 rounded-md text-sm border border-gray-300 bg-transparent outline-none cursor-pointer text-gray-900">
                                                        <option value="solicitante">Solicitante</option>
                                                        <option value="comprador">Comprador</option>
                                                        <option value="admin">Administrador</option>
                                                    </select>
                                                    <div className="absolute right-0 top-0 mt-1">
                                                        <button onClick={() => handleReject(user.id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Excluir">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;