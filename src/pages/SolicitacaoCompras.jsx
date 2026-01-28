import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SolicitacaoCompras() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pega a URL enviada pela página de Seleção de Projeto
  const targetUrl = location.state?.targetUrl;

  // URL de fallback caso acessem direto (pode deixar vazio ou usar a do 743)
  const DEFAULT_URL = "https://normatelce.sharepoint.com/:l:/s/Projeto743-FacilitiesMultiserviosCabinas/JACsQKjPAViPSbfkQUOC15tGARSUJt6NWklSnGKDPKx3DUA?nav=MjcyYzUzOTAtZTkzYi00Y2I1LTg1MDMtMDFkMWQwZmU1MGE4";

  useEffect(() => {
    if (targetUrl) {
        window.location.href = targetUrl;
    } else {
        // Se não tiver URL específica, usa a padrão ou volta pra seleção
        window.location.href = DEFAULT_URL;
    }
  }, [targetUrl]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 font-[Inter]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952] mx-auto mb-4"></div>
        <p>Redirecionando para o SharePoint do Projeto...</p>
      </div>
    </div>
  );
}

export default SolicitacaoCompras;