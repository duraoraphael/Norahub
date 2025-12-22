import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, ZoomIn, ZoomOut, RotateCw, X, ExternalLink } from 'lucide-react';

function VisualizadorArquivo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileUrl, fileName } = location.state || {};
  
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const getFileExtension = (name) => name?.split('.').pop().toLowerCase();
  const extension = getFileExtension(fileName);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
  const isPdf = extension === 'pdf';
  const isVideo = ['mp4', 'webm', 'ogg'].includes(extension);
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => { setZoom(100); setRotation(0); };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(fileUrl);
    alert('Link copiado!');
    setShowShareModal(false);
  };

  if (!fileUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhum arquivo para visualizar</p>
          <button 
            onClick={() => navigate(-1)} 
            className="text-[#57B952] hover:underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-3 px-8 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-white hover:text-[#57B952] transition-colors font-medium text-sm"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        
        <h1 className="text-white font-semibold text-lg truncate max-w-md" title={fileName}>
          {fileName || 'Visualizador de Arquivo'}
        </h1>
        
        <a
          href={fileUrl}
          download
          className="flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
        >
          <Download size={16} /> Baixar
        </a>
      </header>

      {/* Viewer */}
      <div className="flex-1 w-full h-full overflow-hidden">
        <iframe
          src={fileUrl}
          className="w-full h-full border-0"
          title={fileName || 'Arquivo'}
          style={{ minHeight: '100%' }}
        />
      </div>
    </div>
  );
}

export default VisualizadorArquivo;
