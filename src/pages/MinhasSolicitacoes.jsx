import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Clock, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

function MinhasSolicitacoes() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [meusPedidos, setMeusPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Busca pedidos onde userId == meu ID
    const q = query(collection(db, 'solicitacoes'), where("userId", "==", currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => {
        const data = doc.data();
        // Converte Timestamps para strings/números para evitar erros de serialização
        return { 
            id: doc.id, 
            ...data,
            // Se tiver createdAt como Timestamp do Firebase, converte para milissegundos para ordenação
            createdAtMillis: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        };
      });
      
      // Ordena do mais novo para o mais antigo
      lista.sort((a, b) => b.createdAtMillis - a.createdAtMillis);
      
      setMeusPedidos(lista);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch(status) {
        case 'Aprovado': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
        case 'Reprovado': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
        case 'Ajustes Solicitados': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
        case 'Aprovado': return <CheckCircle size={16} />;
        case 'Reprovado': return <XCircle size={16} />;
        case 'Ajustes Solicitados': return <AlertTriangle size={16} />;
        default: return <Clock size={16} />;
    }
  };

  const handleEdit = (pedido) => {
    // Prepara um objeto limpo para enviar via navegação
    // Removemos campos complexos se houver, mantendo apenas os dados do formulário e IDs
    const dadosParaEdicao = {
        id: pedido.id,
        item: pedido.item,
        quantidade: pedido.quantidade,
        unidade: pedido.unidade,
        fornecedor: pedido.fornecedor,
        justificativa: pedido.justificativa,
        arquivoURL: pedido.arquivoURL
    };

    navigate('/solicitacao-compras', { state: { editData: dadosParaEdicao } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 dark:bg-[#111827] transition-colors duration-200">
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="w-full flex items-center justify-between py-6 px-8 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 h-20">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors">
             <ArrowLeft size={18} /> <span>Voltar</span>
        </Link>
        <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-8 w-auto" />
        <div className="w-20"></div> 
      </header>

      <main className="flex-grow flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Minhas Solicitações</h1>
                <Link to="/solicitacao-compras" className="bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow transition-transform hover:scale-105">
                    <Plus size={20} /> Nova
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Carregando...</div>
            ) : meusPedidos.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow">
                    <p className="text-gray-500">Você ainda não fez nenhuma solicitação.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {meusPedidos.map((pedido) => (
                        <div key={pedido.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{pedido.item}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(pedido.status)}`}>
                                        {getStatusIcon(pedido.status)} {pedido.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Data: {pedido.dataSolicitacao} • Qtd: {pedido.quantidade} {pedido.unidade}
                                </p>
                                {pedido.status === 'Ajustes Solicitados' && (
                                    <p className="mt-2 text-sm text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                                        ⚠️ Ação necessária: Verifique e corrija o pedido.
                                    </p>
                                )}
                            </div>

                            {/* Botão de Editar (Só aparece se pedir ajuste) */}
                            {pedido.status === 'Ajustes Solicitados' && (
                                <button 
                                    onClick={() => handleEdit(pedido)} // Usando a função segura
                                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                                >
                                    <Edit size={18} /> Corrigir
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default MinhasSolicitacoes;