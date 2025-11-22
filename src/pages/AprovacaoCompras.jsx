import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, AlertCircle, LogOut, User, ArrowLeft, Calendar, Paperclip, ExternalLink, Search } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';
import { auth, db } from '../services/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function AprovacaoCompras() {
  const { theme } = useTheme();
  const isDark = theme === 'dark'; // Simplificado
  const navigate = useNavigate();
  // ... (restante dos hooks e estados iguais)
  // (Vou omitir a lógica repetida para focar no return)
  const [alertInfo, setAlertInfo] = useState(null);
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [fotoURL, setFotoURL] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFotoURL(currentUser.photoURL);
        if (currentUser.displayName) setPrimeiroNome(currentUser.displayName.split(' ')[0]);
        try {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.nome) setPrimeiroNome(data.nome.split(' ')[0]);
                if (data.fotoURL) setFotoURL(data.fotoURL);
            }
        } catch (error) { console.error(error); }
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const qPendentes = query(collection(db, 'solicitacoes'), where("status", "==", "Pendente"));
    const unsubPendentes = onSnapshot(qPendentes, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSolicitacoes(lista);
      setLoadingData(false);
    });

    const qHistorico = query(collection(db, 'solicitacoes'), where("status", "in", ["Aprovado", "Reprovado", "Ajustes Solicitados"]));
    const unsubHistorico = onSnapshot(qHistorico, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      lista.sort((a, b) => (b.dataAprovacao || b.dataSolicitacao) > (a.dataAprovacao || a.dataSolicitacao) ? 1 : -1);
      setHistorico(lista);
    });

    return () => { unsubPendentes(); unsubHistorico(); };
  }, []);

  const handleAction = async (id, action) => {
    try {
        const itemRef = doc(db, 'solicitacoes', id);
        await updateDoc(itemRef, {
            status: action,
            dataAprovacao: new Date().toLocaleDateString('pt-BR'),
            aprovador: primeiroNome || 'Comprador'
        });
        let message = `Solicitação ${action} com sucesso!`;
        let type = 'success';
        if (action === 'Reprovado') type = 'error';
        setAlertInfo({ message, type });
    } catch (error) {
        setAlertInfo({ message: "Erro ao processar ação.", type: 'error' });
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Aprovado') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'Reprovado') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  };

  const historicoFiltrado = historico.filter(pedido => 
    pedido.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // REMOVIDO bg-gray-50 etc.
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-4 md:px-8 border-b border-gray-200 dark:border-gray-700 h-20">
        <button onClick={() => navigate(-1)} className="absolute left-4 md:left-8 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:text-[#57B952] hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 font-semibold text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>

        <Link to="/" className="flex items-center justify-center">
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>

        <div className="absolute right-4 md:right-8 flex items-center gap-3 mr-16">
            {!loadingUser && <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block fade-in">Olá, {primeiroNome || 'Comprador'}</span>}
            <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-[#57B952] transition-all bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {fotoURL ? <img src={fotoURL} alt="Perfil" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500 dark:text-gray-400" />}
            </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start p-4 md:p-8 relative z-10">
        {/* ... CONTEÚDO (CARDS/LISTA) MANTÉM IGUAL ... */}
        <div className="w-full max-w-5xl">
            {/* ... (Código dos cards que já está correto) ... */}
            {/* Para economizar espaço, não vou repetir o conteúdo interno dos cards, pois ele não muda, apenas o container principal mudou */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4"><div><h2 className="text-sm font-bold text-[#57B952] uppercase tracking-widest mb-1">Painel do Comprador</h2><h1 className="text-3xl font-bold text-gray-800 dark:text-white">Aprovação de Compras</h1></div><div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-lg"><button onClick={() => setActiveTab('pendentes')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'pendentes' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Fila ({solicitacoes.length})</button><button onClick={() => setActiveTab('historico')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'historico' ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>Histórico ({historico.length})</button></div></div>
            {loadingData ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div></div> : activeTab === 'pendentes' ? ( solicitacoes.length === 0 ? <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700"><div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={40} className="text-[#57B952]" /></div><h3 className="text-xl font-bold text-gray-800 dark:text-white">Tudo Limpo!</h3><p className="text-gray-500 dark:text-gray-400">Não há solicitações pendentes.</p></div> : <div className="grid grid-cols-1 gap-8">{solicitacoes.map((pedido) => (<div key={pedido.id} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl"><div className="flex justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-4"><div className="flex items-center gap-3"><div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full"><User size={20} className="text-gray-500 dark:text-gray-300" /></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Solicitante</p><p className="font-bold text-gray-800 dark:text-white">{pedido.userName}</p></div></div><div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"><Calendar size={16} /> {pedido.dataSolicitacao}</div></div><div className="space-y-4"><div className="bg-gray-100 dark:bg-gray-700/40 p-5 rounded-lg border border-gray-200 dark:border-gray-600"><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Item</p><p className="text-lg font-semibold text-gray-900 dark:text-white">{pedido.item} <span className="text-sm font-normal text-gray-500">({pedido.quantidade} {pedido.unidade})</span></p></div><div className="bg-gray-50 dark:bg-gray-900/30 p-5 rounded-lg border border-gray-200 dark:border-gray-700"><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Justificativa</p><p className="text-gray-700 dark:text-gray-300 italic">"{pedido.justificativa}"</p></div><div className="bg-gray-100 dark:bg-gray-700/40 p-5 rounded-lg border border-gray-200 dark:border-gray-600"><p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fornecedor Sugerido</p><p className="text-base font-medium text-gray-800 dark:text-white">{pedido.fornecedor || 'Não informado'}</p></div>{pedido.arquivoURL && (<div className="flex items-center gap-2 text-[#57B952] font-medium"><Paperclip size={16} /><a href={pedido.arquivoURL} target="_blank" rel="noreferrer" className="hover:underline">Ver Anexo</a></div>)}</div><div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-end"><button onClick={() => handleAction(pedido.id, 'Ajustes Solicitados')} className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded shadow-sm flex gap-2 text-sm"><AlertCircle size={18} /> AJUSTES</button><button onClick={() => handleAction(pedido.id, 'Reprovado')} className="px-6 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold rounded shadow-sm flex gap-2 text-sm"><X size={18} /> REPROVAR</button><button onClick={() => handleAction(pedido.id, 'Aprovado')} className="px-8 py-3 bg-[#57B952] hover:bg-green-600 text-white font-bold rounded shadow-md flex gap-2 text-sm"><Check size={18} /> APROVAR</button></div></div>))}</div>) : (<div className="space-y-6"><div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-5 w-5 text-gray-400" /></span><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] outline-none shadow-sm" /></div>{historicoFiltrado.length === 0 ? <div className="text-center py-10 text-gray-500">Nenhum histórico.</div> : historicoFiltrado.map((pedido) => (<div key={pedido.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center opacity-90 hover:opacity-100 transition-opacity"><div className="flex-1 mb-4 md:mb-0"><div className="flex items-center gap-3 mb-1"><h3 className="font-bold text-gray-800 dark:text-white text-lg">{pedido.item}</h3><span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${getStatusBadge(pedido.status)}`}>{pedido.status}</span></div><p className="text-sm text-gray-500">Solicitante: {pedido.userName} • Data: {pedido.dataSolicitacao}</p></div><div className="text-sm text-gray-400 text-right"><p>Aprovador: {pedido.aprovador}</p><p>{pedido.dataAprovacao}</p></div></div>))}</div>)}
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-400 text-xs">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}

export default AprovacaoCompras;