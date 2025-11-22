import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Paperclip, Upload, ArrowLeft, User, List, AlertTriangle } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function SolicitacaoCompras() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({ item: '', quantidade: '', unidade: '', fornecedor: '', justificativa: '' });
  const [arquivo, setArquivo] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [fotoURL, setFotoURL] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (location.state?.editData) {
        const data = location.state.editData;
        setEditData(data);
        setFormData({ item: data.item, quantidade: data.quantidade, unidade: data.unidade, fornecedor: data.fornecedor, justificativa: data.justificativa });
    }
  }, [location.state]);

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

  const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleFileChange = (e) => { if (e.target.files[0]) setArquivo(e.target.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoadingSubmit(true); setAlertInfo(null);
    try {
        const user = auth.currentUser;
        let arquivoURL = editData?.arquivoURL || "";
        if (arquivo) {
            const storageRef = ref(storage, `solicitacoes/${user.uid}/${Date.now()}_${arquivo.name}`);
            await uploadBytes(storageRef, arquivo);
            arquivoURL = await getDownloadURL(storageRef);
        }
        if (editData?.id) {
            await updateDoc(doc(db, 'solicitacoes', editData.id), { ...formData, arquivoURL, status: 'Pendente', updatedAt: new Date() });
            setAlertInfo({ message: 'Solicitação corrigida!', type: 'success' });
        } else {
            await addDoc(collection(db, 'solicitacoes'), { ...formData, arquivoURL, userId: user.uid, userName: primeiroNome || 'Solicitante', userEmail: user.email, status: 'Pendente', dataSolicitacao: new Date().toLocaleDateString('pt-BR'), createdAt: new Date() });
            setAlertInfo({ message: 'Solicitação enviada!', type: 'success' });
        }
        setTimeout(() => { navigate('/minhas-solicitacoes'); }, 2000);
    } catch (error) { setAlertInfo({ message: "Erro ao salvar.", type: 'error' }); } finally { setLoadingSubmit(false); }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden relative">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      <div className="relative z-50"><ThemeToggle /></div>

      <header className="relative w-full flex items-center justify-center py-6 px-8 border-b border-gray-200 dark:border-gray-700 h-20">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-8 flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm">
             <ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span>
        </button>
        <Link to="/" className="flex items-center justify-center">
            <img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>
        <div className="absolute right-4 md:right-8 flex items-center gap-3 mr-16">
            <Link to="/minhas-solicitacoes" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-[#57B952] mr-2 transition-colors font-medium text-sm"><List size={20} /> Meus Pedidos</Link>
            {!loadingUser && <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block fade-in">Olá, {primeiroNome}</span>}
            <Link to="/perfil" className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-[#57B952] transition-all bg-gray-100 dark:bg-gray-700 flex items-center justify-center">{fotoURL ? <img src={fotoURL} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500 dark:text-gray-400" />}</Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {editData && (
                <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-md flex items-center gap-2">
                    <AlertTriangle size={20} className="text-orange-500" />
                    <div><p className="font-bold text-orange-700 dark:text-orange-300">Corrigindo Solicitação</p><p className="text-sm text-orange-600 dark:text-orange-400">Faça as alterações necessárias e reenvie.</p></div>
                </div>
            )}
            <div className="mb-10 text-center md:text-left border-b border-gray-100 dark:border-gray-700 pb-4"><h1 className="text-3xl font-bold text-gray-800 dark:text-white uppercase tracking-wide">Suprimentos</h1><h2 className="text-xl text-[#57B952] font-semibold mt-1">{editData ? 'Corrigir Solicitação' : 'Solicitação de Compras'}</h2></div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item</label><input type="text" name="item" value={formData.item} onChange={handleChange} placeholder="Descreva o item..." className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" required /></div>
                    <div className="md:col-span-1"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qtd</label><input type="text" name="quantidade" value={formData.quantidade} onChange={handleChange} placeholder="0" className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" required /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidade</label><input type="text" name="unidade" value={formData.unidade} onChange={handleChange} placeholder="Caixa, Unidade..." className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fornecedor</label><input type="text" name="fornecedor" value={formData.fornecedor} onChange={handleChange} placeholder="Opcional" className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" /></div>
                </div>
                <div className="relative"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Justificativa</label><textarea name="justificativa" rows="3" value={formData.justificativa} onChange={handleChange} placeholder="Justifique sua compra..." className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#57B952] placeholder-gray-500" required></textarea><Paperclip className="absolute right-3 bottom-3 text-gray-400" size={20} /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anexo</label><div className="relative group"><input type="file" id="file" className="hidden" onChange={handleFileChange} /><label htmlFor="file" className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer ${arquivo ? 'border-[#57B952] bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-[#57B952]'}`}><Upload className="size={24} text-gray-500 dark:text-gray-300" />{arquivo ? <p className="text-sm font-bold text-[#57B952]">{arquivo.name}</p> : <p className="text-sm text-gray-500">Clique para upload</p>}</label></div></div>
                
                <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button type="button" onClick={() => navigate('/')} className="w-full md:w-auto px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" disabled={loadingSubmit}>CANCELAR</button>
                    <button type="submit" className="w-full md:w-auto px-8 py-3 bg-[#57B952] text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transform hover:scale-105 transition-all" disabled={loadingSubmit}>{loadingSubmit ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}</button>
                </div>
            </form>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-400 text-xs">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}
export default SolicitacaoCompras;