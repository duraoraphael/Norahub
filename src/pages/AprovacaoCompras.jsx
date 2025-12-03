import { useEffect } from 'react';

function AprovacaoCompras() {
  useEffect(() => {
    // Redireciona para o link SAML da Microsoft fornecido
    window.location.href = "https://normatelce.sharepoint.com/:l:/s/Projeto743-FacilitiesMultiserviosCabinas/JACsQKjPAViPSbfkQUOC15tGAd2cfqyNH50fZdhoUaX5HG0?e=AdKqXJ";
  }, []);

  // Interface de carregamento enquanto redireciona
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 font-[Inter]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952] mx-auto mb-4"></div>
        <p>Redirecionando para Login Microsoft...</p>
      </div>
    </div>
  );
}

export default AprovacaoCompras;