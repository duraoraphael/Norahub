import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, X, FileText, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { summarizeDocument, performOCR, analyzeSpreadsheet, extractTextFromPDF } from '../services/documentAnalysis';
import { useAuth } from '../context/AuthContext';

function VisualizadorArquivo() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { fileUrl, fileName } = location.state || {};
  
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getFileExtension = (name) => {
    if (typeof name !== 'string') return '';
    const parts = name.split('.');
    if (!parts || parts.length < 2) return '';
    const ext = parts.pop();
    return typeof ext === 'string' ? ext.toLowerCase() : '';
  };
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
    if (!fileUrl) return;
    navigator.clipboard.writeText(fileUrl);
    alert('Link copiado!');
    setShowShareModal(false);
  };

  const handleSummarize = async () => {
    console.log('Botão RESUMIR clicado!');
    if (!currentUser) {
      alert('Você precisa estar logado para usar esta funcionalidade.');
      return;
    }
    
    setIsAnalyzing(true);
    console.log('Iniciando resumo do arquivo:', fileName);
    try {
      // Para PDF, evitar tentar ler como texto bruto
      if (isPdf) {
        const pdfExtraction = await extractTextFromPDF(fileUrl);
        if (!pdfExtraction.success) {
          alert(pdfExtraction.message || 'Este tipo de arquivo requer extração específica para resumo. Converta para texto ou use OCR.');
          return;
        }
      }
      const response = await fetch(fileUrl);
      const text = await response.text();
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('API Key presente:', !!apiKey);
      
      const result = await summarizeDocument(text, fileName, apiKey);
      if (result.success) {
        setAnalysisResult({ type: 'summary', data: result.summary });
      } else {
        const errorMsg = result.error.includes('429') 
          ? '⏳ Muitas requisições! Aguarde 1 minuto e tente novamente.\n\n💡 Dica: A API gratuita tem limite de requisições por minuto.'
          : 'Erro ao gerar resumo: ' + result.error;
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('❌ Erro ao processar arquivo: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOCR = async () => {
    console.log('Botão OCR clicado!');
    if (!currentUser) {
      alert('Você precisa estar logado para usar esta funcionalidade.');
      return;
    }
    
    setIsAnalyzing(true);
    console.log('Iniciando OCR na imagem:', fileName);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('API Key presente:', !!apiKey);
      const result = await performOCR(fileUrl, apiKey);
      console.log('Resultado OCR:', result);
      
      if (result.success) {
        setAnalysisResult({ type: 'ocr', data: result.text });
      } else {
        const errorMsg = result.error.includes('429')
          ? '⏳ Limite atingido! Aguarde 1 minuto.\n\n💡 A API tem limite de requisições. Tente novamente em instantes.'
          : 'Erro ao extrair texto: ' + result.error;
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('❌ Erro ao processar imagem: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeSpreadsheet = async () => {
    if (!currentUser) {
      alert('Você precisa estar logado para usar esta funcionalidade.');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      let text = '';
      if (extension === 'csv') {
        const response = await fetch(fileUrl);
        text = await response.text();
      } else if (['xls', 'xlsx'].includes(extension)) {
        alert('Para analisar XLS/XLSX, converta a planilha para CSV antes.');
        return;
      } else {
        const response = await fetch(fileUrl);
        text = await response.text();
      }
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      const result = await analyzeSpreadsheet(text, fileName, apiKey);
      if (result.success) {
        setAnalysisResult({ type: 'analysis', data: result.analysis });
      } else {
        const errorMsg = result.error.includes('429')
          ? '⏳ Limite de requisições! Aguarde 1 minuto.\n\n💡 Tente processar arquivos menores ou aguarde alguns minutos.'
          : 'Erro ao analisar dados: ' + result.error;
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Erro ao processar planilha:', error);
      alert('❌ Erro ao processar planilha: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
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
        
        <div className="flex items-center gap-2">
          {/* Botões de análise inteligente */}
          {isPdf && (
            <button
              onClick={handleSummarize}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              title="Resumir documento com IA"
            >
              <FileText size={16} />
              {isAnalyzing ? 'Processando...' : 'Resumir'}
            </button>
          )}
          
          {isImage && (
            <button
              onClick={handleOCR}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              title="Extrair texto da imagem com OCR"
            >
              <ImageIcon size={16} />
              {isAnalyzing ? 'Processando...' : 'OCR'}
            </button>
          )}
          
          {['csv', 'xls', 'xlsx'].includes(extension) && (
            <button
              onClick={handleAnalyzeSpreadsheet}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              title="Analisar dados com IA"
            >
              <BarChart3 size={16} />
              {isAnalyzing ? 'Analisando...' : 'Analisar'}
            </button>
          )}

          <a
            href={fileUrl}
            download
            className="flex items-center gap-2 bg-[#57B952] hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <Download size={16} /> Baixar
          </a>
        </div>
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

      {/* Modal de Resultados */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {analysisResult.type === 'summary' && '📄 Resumo do Documento'}
                {analysisResult.type === 'ocr' && '🔍 Texto Extraído (OCR)'}
                {analysisResult.type === 'analysis' && '📊 Análise de Dados'}
              </h2>
              <button
                onClick={() => setAnalysisResult(null)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                {analysisResult.data}
              </pre>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(analysisResult.data);
                  alert('Resultado copiado!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copiar
              </button>
              <button
                onClick={() => setAnalysisResult(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualizadorArquivo;
