import { useEffect } from 'react';

function SolicitacaoCompras() {
  useEffect(() => {
    // Redireciona imediatamente para a URL do SharePoint
    window.location.href = "https://normatelce.sharepoint.com/:l:/s/Projeto743-FacilitiesMultiserviosCabinas/JACsQKjPAViPSbfkQUOC15tGARSUJt6NWklSnGKDPKx3DUA?nav=MjcyYzUzOTAtZTkzYi00Y2I1LTg1MDMtMDFkMWQwZmU1MGE4";
  }, []);

  // Exibe uma tela de carregamento simples enquanto o redirecionamento acontece
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 font-[Inter]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952] mx-auto mb-4"></div>
        <p>Redirecionando para o SharePoint...</p>
      </div>
    </div>
  );
}

export default SolicitacaoCompras;