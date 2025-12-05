import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, Camera, LogOut, Save, ArrowLeft, KeyRound } from 'lucide-react';
// ThemeToggle removed: app forced to light mode
import { useTheme } from '../context/ThemeContext';
import Alert from '../components/Alert';
import { auth, db, storage } from '../services/firebase'; 
import { updatePassword, signOut, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Perfil() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [fotoURL, setFotoURL] = useState(null);
  const [novaFotoFile, setNovaFotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) { navigate('/login'); return; }
      
      setNome(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      
      // Prioridade: 1. Foto do Auth (Microsoft/Google), 2. Null
      let initialPhoto = currentUser.photoURL;
      
      if (currentUser.displayName) setPrimeiroNome(currentUser.displayName.split(' ')[0]);
      
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCelular(data.celular || '');
          if (!currentUser.displayName && data.nome) { setNome(data.nome); setPrimeiroNome(data.nome.split(' ')[0]); }
          
          // Se tiver foto salva no Firestore (upload manual), ela tem prioridade sobre a do Auth
          if (data.fotoURL) initialPhoto = data.fotoURL;
        }
      } catch (error) { console.error(error); } 
      
      setFotoURL(initialPhoto);
      setLoading(false);
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setAlertInfo(null);
    try {
      const currentUser = auth.currentUser;
      let downloadURL = fotoURL;
      
      // Se selecionou arquivo, faz upload
      if (novaFotoFile) {
        const storageRef = ref(storage, `users/${currentUser.uid}/profile.jpg`);
        await uploadBytes(storageRef, novaFotoFile);
        downloadURL = await getDownloadURL(storageRef);
      }

      // Atualiza Auth
      if (nome !== currentUser.displayName || (downloadURL && downloadURL !== currentUser.photoURL)) {
        await updateProfile(currentUser, { displayName: nome, photoURL: downloadURL });
        setPrimeiroNome(nome.split(' ')[0]);
      }
      
      // Atualiza Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), { nome, celular, fotoURL: downloadURL, updatedAt: new Date() });
      
      if (novaSenha) {
        if (!senhaAtual) throw new Error('senha-atual-vazia');
        if (novaSenha !== confirmarSenha) throw new Error('senhas-nao-batem');
        if (novaSenha.length < 6) throw new Error('senha-curta');
        const credential = EmailAuthProvider.credential(currentUser.email, senhaAtual);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, novaSenha);
        setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      }
      setAlertInfo({ message: 'Perfil atualizado!', type: 'success' });
      setNovaFotoFile(null);
    } catch (error) {
      let msg = "Erro ao atualizar.";
      if (error.message === 'senha-atual-vazia') msg = "Digite a senha atual.";
      if (error.message === 'senhas-nao-batem') msg = "As senhas não conferem.";
      if (error.code === 'auth/wrong-password') msg = "Senha atual incorreta.";
      setAlertInfo({ message: msg, type: 'error' });
    } finally { setSaving(false); }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setNovaFotoFile(file); setFotoURL(URL.createObjectURL(file)); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div></div>;

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50 transition-colors duration-200 relative text-black">
      {alertInfo && <Alert message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo(null)} />}
      {/* ThemeToggle removed */}
      <header className="relative w-full flex items-center justify-between py-6 px-4 md:px-8 bg-white shadow-sm border-b border-gray-200 h-20">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm flex items-center gap-1"><ArrowLeft size={18} /> <span className="hidden sm:inline">Voltar</span></button>
        <Link to="/" className="flex items-center justify-center absolute left-1/2 transform -translate-x-1/2"><img src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} alt="Logo" className="h-8 md:h-10 w-auto object-contain" /></Link>
        <div className="flex items-center gap-3"><span className="text-sm font-medium text-gray-700 hidden md:block">Olá, {primeiroNome}</span><div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#57B952] bg-gray-200 flex items-center justify-center">{fotoURL ? <img src={fotoURL} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />}</div></div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-start p-4 md:p-8 relative z-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-10">
            <div className="h-32 bg-gradient-to-r from-[#57B952] to-green-600 relative"></div>
            <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6 flex justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg group relative">
                        {fotoURL ? <img src={fotoURL} className="w-full h-full object-cover" /> : <User size={48} className="text-gray-400" />}
                        <label htmlFor="foto-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"><Camera size={24} /></label>
                        <input type="file" id="foto-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </div>
                </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">{nome || 'Usuário'}</h1>
            <p className="text-sm text-center text-gray-500 mb-8">{email}</p>
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 ml-1">Nome</label><input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" placeholder="Seu Nome" /></div>
                <div><label className="block text-sm font-medium text-gray-700 ml-1">Celular</label><input type="tel" value={celular} onChange={e=>setCelular(e.target.value)} className="w-full pl-4 py-2 bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" placeholder="(00) 00000-0000" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 ml-1">Email</label><input type="email" value={email} disabled className="w-full pl-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" /></div>
                    </div>
                    <div className="md:col-span-2 pt-6 border-t border-gray-100 border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><KeyRound size={18} className="text-[#57B952]" /> Alterar Senha</h3>
                        <div className="grid gap-4">
                  <div><label className="block text-xs font-medium text-gray-500 ml-1">Senha Atual</label><input type="password" value={senhaAtual} onChange={e=>setSenhaAtual(e.target.value)} className="w-full pl-4 py-2 bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" placeholder="Senha atual" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-gray-500 ml-1">Nova Senha</label><input type="password" value={novaSenha} onChange={e=>setNovaSenha(e.target.value)} className="w-full pl-4 py-2 bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" placeholder="Nova senha" /></div>
                    <div><label className="block text-xs font-medium text-gray-500 ml-1">Confirmar</label><input type="password" value={confirmarSenha} onChange={e=>setConfirmarSenha(e.target.value)} className="w-full pl-4 py-2 bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" placeholder="Repetir senha" /></div>
                  </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 border-gray-700">
                <button type="submit" disabled={saving} className="flex-1 bg-[#57B952] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md">{saving?'Salvando...':'Salvar Alterações'}</button>
                <button type="button" onClick={handleLogout} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-lg border border-red-100">Sair da Conta</button>
                    </div>
                </form>
            </div>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-400 text-xs">&copy; 2025 Normatel Engenharia</footer>
    </div>
  );
}

export default Perfil;