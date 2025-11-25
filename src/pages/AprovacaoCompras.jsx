import { useEffect } from 'react';

function AprovacaoCompras() {
  useEffect(() => {
    // Redireciona imediatamente ao carregar a página
    window.location.href = "https://login.microsoftonline.com/5b6f6241-9a57-4be4-8e50-1dfa72e79a57/saml2?client-request-id=a11f5aa4-04c4-4636-a676-e0909d6469bf&sso_nonce=AwABEgEAAAADAOz_BQD0_5AoZcZFSs3IJIr88ty4A03F6joxCtuYVTBLqhabT1TpC7k_J5yFrmxOd8DeZrIIhvkJySQcC6EKypB3Qrh4cLogAA&mscrid=a11f5aa4-04c4-4636-a676-e0909d6469bf";
  }, []);

  // Retorna uma tela de carregamento simples enquanto redireciona
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#111827] text-gray-500 dark:text-gray-400 font-[Inter]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952] mx-auto mb-4"></div>
        <p>Redirecionando para Microsoft...</p>
      </div>
    </div>
  );
}

export default AprovacaoCompras;