import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, File, Trash2, Download, Eye, Folder, FolderPlus, Edit2, ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../services/firebase';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { notifyFileUpload } from '../services/notifications';
import ActivityLogger from '../services/activityLogger';

function GerenciamentoArquivos() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card, projeto } = location.state || {};
  const { userProfile, currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState({ show: false, type: '', item: null });

  useEffect(() => {
    if (!card || !projeto) {
      navigate(-1);
      return;
    }
    loadFilesAndFolders();
  }, [card, projeto, currentPath]);

  const loadFilesAndFolders = async () => {
    setLoading(true);
    try {
      const storagePath = `projetos/${projeto.id}/cards/${card.name}${currentPath ? '/' + currentPath : ''}`;
      const storageRef = ref(storage, storagePath);
      const result = await listAll(storageRef);
      
      // Carregar arquivos
      const filesData = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            fullPath: item.fullPath,
            url,
            type: 'file',
            uploadedAt: new Date()
          };
        })
      );
      
      // Carregar pastas
      const foldersData = result.prefixes.map((folderRef) => {
        const folderName = folderRef.name;
        return {
          name: folderName,
          fullPath: folderRef.fullPath,
          type: 'folder'
        };
      });
      
      setFiles(filesData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Erro ao carregar arquivos e pastas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast('Digite um nome para a pasta', 'error');
      return;
    }

    try {
      // Criar um arquivo .placeholder para forçar a criação da pasta no Firebase Storage
      const folderPath = `projetos/${projeto.id}/cards/${card.name}${currentPath ? '/' + currentPath : ''}/${newFolderName}/.placeholder`;
      const folderRef = ref(storage, folderPath);
      const placeholderBlob = new Blob([''], { type: 'text/plain' });
      await uploadBytes(folderRef, placeholderBlob);
      
      setNewFolderName('');
      setIsCreatingFolder(false);
      await loadFilesAndFolders();
      showToast('Pasta criada com sucesso!', 'success');
      
      // Registrar atividade
      const userName = userProfile?.nome || currentUser?.displayName || 'Usuário';
      await ActivityLogger.folderCreated(newFolderName, card.name, projeto.nome, currentUser?.uid, userName);
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      showToast('Erro ao criar pasta', 'error');
    }
  };

  const handleNavigateToFolder = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const handleNavigateToRoot = () => {
    setCurrentPath('');
  };

  const handleNavigateToBreadcrumb = (index) => {
    const pathParts = currentPath.split('/');
    const newPath = pathParts.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/');
  };

  const openDeleteConfirm = (type, item) => {
    setConfirmDelete({ show: true, type, item });
  };

  const closeDeleteConfirm = () => {
    setConfirmDelete({ show: false, type: '', item: null });
  };

  const confirmDeleteAction = async () => {
    const { type, item } = confirmDelete;
    closeDeleteConfirm();
    
    if (type === 'file') {
      await handleDeleteFile(item);
    } else if (type === 'folder') {
      await handleDeleteFolder(item);
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

        const storagePath = `projetos/${projeto.id}/cards/${card.name}${currentPath ? '/' + currentPath : ''}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
      }
      
      await loadFilesAndFolders();
      showToast('Arquivo(s) enviado(s) com sucesso!', 'success');
      
      // Registrar atividade no dashboard
      const userName = userProfile?.nome || currentUser?.displayName || 'Usuário';
      for (const file of selectedFiles) {
        await ActivityLogger.fileUploaded(file.name, card.name, projeto.nome, currentUser?.uid, userName);
      }
      
      // Notificar gerentes do projeto sobre o upload
      try {
        const usersQuery = query(collection(db, 'usuarios'), where('funcao', '==', 'gerente'));
        const usersSnapshot = await getDocs(usersQuery);
        const managerIds = usersSnapshot.docs.map(doc => doc.id);
        
        if (managerIds.length > 0) {
          const uploaderName = userProfile?.nome || 'Um usuário';
          await notifyFileUpload(managerIds, selectedFiles[0].name, uploaderName, projeto.id);
        }
      } catch (notifError) {
        console.error('Erro ao enviar notificação:', notifError);
      }
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
    try {
      const fileName = filePath.split('/').pop();
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      await loadFilesAndFolders();
      showToast('Arquivo excluído com sucesso!', 'success');
      
      // Registrar atividade
      const userName = userProfile?.nome || currentUser?.displayName || 'Usuário';
      await ActivityLogger.fileDeleted(fileName, card.name, projeto.nome, currentUser?.uid, userName);
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      showToast('Erro ao excluir arquivo.', 'error');
    }
  };

  const handleDeleteFolder = async (folderPath) => {
    try {
      console.log('🗑️ Iniciando exclusão da pasta:', folderPath);
      const deletedCount = await handleDeleteFolderRecursive(folderPath);
      console.log(`✅ Total de arquivos excluídos: ${deletedCount}`);
      
      // Aguarda um momento antes de recarregar
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadFilesAndFolders();
      
      if (deletedCount > 0) {
        showToast(`Pasta excluída com sucesso! (${deletedCount} arquivo(s))`, 'success');
      } else {
        showToast('Pasta vazia foi removida.', 'success');
      }
    } catch (error) {
      console.error('❌ Erro ao excluir pasta:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem:', error.message);
      
      let errorMessage = 'Erro ao excluir pasta.';
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Sem permissão para excluir. Verifique as regras do Firebase Storage.';
      } else if (error.code === 'storage/object-not-found') {
        errorMessage = 'Pasta não encontrada.';
      }
      
      showToast(errorMessage, 'error');
      await loadFilesAndFolders(); // Recarrega mesmo com erro
    }
  };

  const handleDeleteFolderRecursive = async (folderPath) => {
    let totalDeleted = 0;
    
    try {
      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      
      console.log(`📂 Pasta ${folderPath}: ${result.items.length} arquivo(s), ${result.prefixes.length} subpasta(s)`);
      
      // Excluir todos os arquivos
      for (const item of result.items) {
        console.log(`🗑️ Tentando excluir: ${item.fullPath}`);
        try {
          await deleteObject(item);
          totalDeleted++;
          console.log(`✅ Excluído: ${item.name}`);
        } catch (err) {
          console.error(`❌ Erro ao excluir ${item.name}:`, err);
          console.error('Detalhes do erro:', {
            code: err.code,
            message: err.message,
            path: item.fullPath
          });
        }
      }
      
      // Excluir subpastas recursivamente
      for (const prefix of result.prefixes) {
        console.log(`📁 Entrando na subpasta: ${prefix.fullPath}`);
        const subCount = await handleDeleteFolderRecursive(prefix.fullPath);
        totalDeleted += subCount;
      }
      
      console.log(`✅ Pasta ${folderPath} processada - ${totalDeleted} arquivo(s) excluído(s)`);
      return totalDeleted;
    } catch (error) {
      console.error(`❌ Erro ao processar pasta ${folderPath}:`, error);
      throw error;
    }
  };

  const startRename = (item) => {
    setRenamingItem(item);
    setRenameValue(item.name);
  };

  const handleRename = async () => {
    if (!renameValue.trim() || renameValue === renamingItem.name) {
      setRenamingItem(null);
      return;
    }

    try {
      if (renamingItem.type === 'file') {
        // Para arquivos, precisamos copiar e depois deletar
        const oldRef = ref(storage, renamingItem.fullPath);
        const url = await getDownloadURL(oldRef);
        const response = await fetch(url);
        const blob = await response.blob();
        
        const pathParts = renamingItem.fullPath.split('/');
        pathParts[pathParts.length - 1] = renameValue;
        const newPath = pathParts.join('/');
        
        const newRef = ref(storage, newPath);
        await uploadBytes(newRef, blob);
        await deleteObject(oldRef);
        
        showToast('Arquivo renomeado com sucesso!', 'success');
      } else {
        // Para pastas, copiar todo o conteúdo
        await renameFolderRecursive(renamingItem.fullPath, renameValue);
        showToast('Pasta renomeada com sucesso!', 'success');
      }
      
      setRenamingItem(null);
      await loadFilesAndFolders();
    } catch (error) {
      console.error('Erro ao renomear:', error);
      showToast('Erro ao renomear.', 'error');
    }
  };

  const renameFolderRecursive = async (oldFolderPath, newFolderName) => {
    const oldRef = ref(storage, oldFolderPath);
    const result = await listAll(oldRef);
    
    // Determinar novo caminho base
    const pathParts = oldFolderPath.split('/');
    pathParts[pathParts.length - 1] = newFolderName;
    const newBasePath = pathParts.join('/');
    
    // Copiar todos os arquivos
    for (const item of result.items) {
      const url = await getDownloadURL(item);
      const response = await fetch(url);
      const blob = await response.blob();
      
      const relativePath = item.fullPath.replace(oldFolderPath, '');
      const newPath = newBasePath + relativePath;
      const newRef = ref(storage, newPath);
      await uploadBytes(newRef, blob);
      await deleteObject(item);
    }
    
    // Copiar subpastas
    for (const prefix of result.prefixes) {
      const subFolderName = prefix.name;
      const newSubPath = `${newBasePath}/${subFolderName}`;
      await renameFolderRecursive(prefix.fullPath, subFolderName);
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
    <div className="min-h-screen w-full flex flex-col font-[Outfit,Poppins] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="w-full flex items-center justify-between py-3 md:py-6 px-3 md:px-8 border-b border-gray-700 bg-gray-900/50 backdrop-blur-md min-h-[56px] md:h-20">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> 
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <h1 className="text-base md:text-2xl font-bold text-gray-800 truncate px-2">{card.name}</h1>
        <div className="w-12 md:w-20 shrink-0"></div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 md:p-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 md:p-8 border border-white/20">
          {/* Breadcrumb Navigation */}
          <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleNavigateToRoot}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm ${!currentPath ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100'}`}
                title="Voltar para raiz"
              >
                <Home size={16} />
                <span className="hidden sm:inline">Raiz</span>
              </button>
              {getBreadcrumbs().map((folder, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-gray-400" />
                  <button
                    onClick={() => handleNavigateToBreadcrumb(index)}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${index === getBreadcrumbs().length - 1 ? 'bg-[#57B952]/20 text-[#6BC962]' : 'text-gray-300 hover:bg-gray-700/50'}`}
                  >
                    {folder}
                  </button>
                </div>
              ))}
            </div>
            
            {currentPath && (
              <button
                onClick={handleNavigateUp}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-sm font-medium text-gray-300"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Voltar</span>
              </button>
            )}
          </div>

          {/* Actions Bar */}
          <div className="mb-6 md:mb-8 flex flex-wrap gap-3">
            <label className="flex-1 min-w-[200px] flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-[#57B952] transition-colors bg-white/5 hover:bg-[#57B952]/10">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Upload de Arquivos</span>
                </p>
                <p className="text-[10px] text-gray-400">Máx. 10MB por arquivo</p>
              </div>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            <div className="flex-1 min-w-[200px] h-32 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50">
              {!isCreatingFolder ? (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="w-full h-full flex flex-col items-center justify-center hover:bg-blue-100 transition-colors"
                >
                  <FolderPlus className="w-8 h-8 mb-2 text-blue-600" />
                  <p className="text-xs text-blue-600 font-semibold">Nova Pasta</p>
                </button>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                  <input
                    type="text"
                    placeholder="Nome da pasta"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                    className="w-full px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleCreateFolder}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-semibold"
                    >
                      Criar
                    </button>
                    <button
                      onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                      className="flex-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {uploading && (
            <div className="mb-4 text-center text-[#57B952] font-semibold">
              Enviando arquivo(s)...
            </div>
          )}

          {/* Files and Folders List */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {currentPath ? `Pasta: ${currentPath.split('/').pop()}` : 'Todos os arquivos'} ({folders.length + files.length} itens)
            </h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">Carregando...</div>
            ) : folders.length === 0 && files.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <File size={48} className="mx-auto mb-3 opacity-30" />
                <p>Pasta vazia</p>
                <p className="text-xs mt-2">Crie uma pasta ou faça upload de arquivos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {/* Folders First */}
                {folders.map((folder, idx) => (
                  <div 
                    key={`folder-${idx}`}
                    className="border-2 border-blue-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  >
                    {renamingItem?.fullPath === folder.fullPath ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                          className="w-full px-2 py-1 rounded border border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleRename}
                            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setRenamingItem(null)}
                            className="flex-1 px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div 
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => handleNavigateToFolder(folder.name)}
                          >
                            <Folder className="w-8 h-8 text-blue-600" />
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                startRename(folder); 
                              }}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 shadow-sm backdrop-blur-sm"
                              title="Renomear pasta"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                openDeleteConfirm('folder', folder.fullPath); 
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center bg-white/10 shadow-sm hover:shadow-md backdrop-blur-sm"
                              title="Excluir pasta e todo conteúdo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p 
                          className="text-sm font-medium text-blue-800 truncate cursor-pointer"
                          title={folder.name}
                          onClick={() => handleNavigateToFolder(folder.name)}
                        >
                          📁 {folder.name}
                        </p>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Files */}
                {files.map((file, idx) => (
                  <div 
                    key={`file-${idx}`} 
                    className="border border-white/20 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow bg-white/10 backdrop-blur-xl"
                  >
                    {renamingItem?.fullPath === file.fullPath ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                          className="w-full px-2 py-1 rounded border border-gray-400 focus:ring-2 focus:ring-[#57B952] outline-none text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleRename}
                            className="flex-1 px-2 py-1 bg-[#57B952] text-white rounded text-xs font-semibold"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setRenamingItem(null)}
                            className="flex-1 px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="text-2xl md:text-3xl">{getFileIcon(file.name)}</div>
                          <div className="flex gap-1.5">
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
                              onClick={() => startRename(file)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Renomear"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm('file', file.fullPath)}
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Confirmar Exclusão
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {confirmDelete.type === 'folder' 
                ? 'Deseja realmente excluir esta pasta e todo seu conteúdo? Esta ação não pode ser desfeita.'
                : 'Deseja realmente excluir este arquivo? Esta ação não pode ser desfeita.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GerenciamentoArquivos;
