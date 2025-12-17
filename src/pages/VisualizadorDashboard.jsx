import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Maximize2 } from 'lucide-react';

function VisualizadorDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dashboardUrl, dashboardName, projeto } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);

  if (!dashboardUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Nenhum dashboard selecionado</p>
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
    <div className="min-h-screen w-full flex flex-col font-[Inter] bg-gray-900">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-3 md:py-4 px-3 md:px-8 border-b border-gray-700 bg-gray-800 min-h-[56px]">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 md:gap-2 text-gray-300 hover:text-white transition-colors font-medium text-xs md:text-sm shrink-0"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> 
          <span>Voltar</span>
        </button>
        
        <h1 className="text-sm md:text-lg font-bold text-white truncate px-2 text-center flex-1">
          {dashboardName || 'Dashboard'}
        </h1>
        
        <div className="flex items-center gap-2">
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-xs md:text-sm font-semibold"
            title="Abrir em nova aba"
          >
            <ExternalLink size={14} />
            <span className="hidden md:inline">Nova Aba</span>
          </a>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Carregando dashboard...</p>
            </div>
          </div>
        )}
        <iframe
          src={dashboardUrl}
          className="w-full h-full border-0 absolute inset-0"
          title={dashboardName || 'Dashboard'}
          allowFullScreen
          style={{ minHeight: 'calc(100vh - 56px)' }}
          onLoad={() => setIsLoading(false)}
        />
      </main>

      {/* Info Bar */}
      <div className="w-full py-2 px-4 bg-gray-800 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-400">
          {projeto?.nome && (
            <span className="mr-4">
              📊 Projeto: <span className="text-gray-300 font-semibold">{projeto.nome}</span>
            </span>
          )}
          <span className="text-gray-500">
            Pressione F11 para tela cheia
          </span>
        </p>
      </div>
    </div>
  );
}

export default VisualizadorDashboard;
