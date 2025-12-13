import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, File, Trash2, Download, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

function GerenciamentoArquivos() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card, projeto } = location.state || {};
  const { userProfile } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!card || !projeto) {
      navigate(-1);
      return;
    }
    loadFiles();
  }, [card, projeto]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const storagePath = `projetos/${projeto.id}/cards/${card.name}`;
      const storageRef = ref(storage, storagePath);
      const filesList = await listAll(storageRef);
      
      const filesData = await Promise.all(
        filesList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            fullPath: item.fullPath,
            url,
            uploadedAt: new Date()
          };
        })
      );
      
      setFiles(filesData);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        // Validar tamanho do arquivo (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showToast(`Arquivo ${file.name} é muito grande (máx 10MB)`, 'error');
          continue;
        }

        const storagePath = `projetos/${projeto.id}/cards/${card.name}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
      }
      
      await loadFiles();
      showToast('Arquivo(s) enviado(s) com sucesso!', 'success');
    } catch (error) {
      console.error('Erro completo ao fazer upload:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      let errorMessage = 'Erro ao enviar arquivo(s).';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Sem permissão para fazer upload. Configure as regras do Firebase Storage.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload cancelado.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'Erro desconhecido. Verifique sua conexão ou as regras do Firebase.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (filePath) => {
    if (!confirm('Deseja realmente excluir este arquivo?')) return;
    
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      await loadFiles();
      showToast('Arquivo excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      showToast('Erro ao excluir arquivo.', 'error');
    }
  };

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return '📄';
    if (['doc', 'docx'].includes(extension)) return '📝';
    if (['xls', 'xlsx'].includes(extension)) return '📊';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return '🖼️';
    if (['zip', 'rar'].includes(extension)) return '📦';
    return '📁';
  };

  if (!card || !projeto) return null;

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between py-6 px-8 border-b border-gray-200 bg-white">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{card.name}</h1>
        <div className="w-20"></div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Upload Area */}
          <div className="mb-8">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#57B952] transition-colors bg-gray-50 hover:bg-green-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para enviar</span> ou arraste arquivos
                </p>
                <p className="text-xs text-gray-400">PDF, DOC, XLS, imagens (máx. 10MB por arquivo)</p>
              </div>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
            {uploading && (
              <div className="mt-4 text-center text-[#57B952] font-semibold">
                Enviando arquivo(s)...
              </div>
            )}
          </div>

          {/* Files List */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Arquivos ({files.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando arquivos...</div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <File size={48} className="mx-auto mb-3 opacity-30" />
                <p>Nenhum arquivo enviado ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{getFileIcon(file.name)}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/visualizador-arquivo', { state: { fileUrl: file.url, fileName: file.name } })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </button>
                        <a
                          href={file.url}
                          download
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Baixar"
                        >
                          <Download size={16} />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.fullPath)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GerenciamentoArquivos;
