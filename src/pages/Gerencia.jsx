import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, Shield, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Gerencia() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [cargoData, setCargoData] = useState(null);
  const [loading, setLoading] = useState(true);

  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';

  useEffect(() => {
    const fetchCargoData = async () => {
      if (!userProfile) return;
      
      try {
        const cargosQuery = query(
          collection(db, 'cargos'),
          where('nome', '==', userProfile.funcao)
        );
        const cargosSnapshot = await getDocs(cargosQuery);
        
        if (!cargosSnapshot.empty) {
          setCargoData(cargosSnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Erro ao buscar dados do cargo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCargoData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952]"></div>
      </div>
    );
  }

  const isGerente = userProfile?.funcao && (
    userProfile.funcao === 'admin' || 
    userProfile.funcao.toLowerCase().includes('gerente')
  );

  if (!isGerente) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-500 mb-8">Apenas administradores e gerentes podem acessar a área de gerência.</p>
          <button
            onClick={() => navigate('/selecao-projeto')}
            className="bg-[#57B952] hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Voltar
          </button>
        </div>
      </div>
    );
  }

  // Definir opções de gerência baseado no tipo de gerente
  const getGerenciaOptions = () => {
    const opcoes = [];

    // Todas as opções para Administrador e Gerente Geral
    if (userProfile.funcao === 'admin' || userProfile.funcao === 'Gerente Geral') {
      return [
        {
          id: 'usuarios',
          titulo: 'Gestão de Usuários',
          descricao: 'Gerenciar usuários, cargos e permissões',
          icon: Users,
          cor: 'bg-blue-100 text-blue-600',
          path: '/gerencia-usuarios',
          permissao: true,
        },
        {
          id: 'cargos',
          titulo: 'Gestão de Cargos',
          descricao: 'Criar e gerenciar cargos e permissões',
          icon: Shield,
          cor: 'bg-purple-100 text-purple-600',
          path: '/gerencia-cargos',
          permissao: true,
        },
        {
          id: 'projetos',
          titulo: 'Gestão de Projetos',
          descricao: 'Criar e gerenciar projetos',
          icon: Briefcase,
          cor: 'bg-green-100 text-green-600',
          path: '/gerencia-projetos',
          permissao: true,
        },
      ];
    }

    // Opções para Gerente de Usuários
    if (userProfile.funcao === 'Gerente de Usuários') {
      return [
        {
          id: 'usuarios',
          titulo: 'Gestão de Usuários',
          descricao: 'Gerenciar usuários e atribuições',
          icon: Users,
          cor: 'bg-blue-100 text-blue-600',
          path: '/gerencia-usuarios',
          permissao: cargoData?.canManageUsers,
        },
      ];
    }

    // Opções para Gerente de Projetos
    if (userProfile.funcao === 'Gerente de Projetos') {
      return [
        {
          id: 'projetos',
          titulo: 'Gestão de Projetos',
          descricao: 'Criar e editar projetos',
          icon: Briefcase,
          cor: 'bg-green-100 text-green-600',
          path: '/gerencia-projetos',
          permissao: cargoData?.canCreateProjetos,
        },
      ];
    }

    // Opções para Gerente de Cargos
    if (userProfile.funcao === 'Gerente de Cargos') {
      return [
        {
          id: 'cargos',
          titulo: 'Gestão de Cargos',
          descricao: 'Criar e gerenciar cargos',
          icon: Award,
          cor: 'bg-yellow-100 text-yellow-600',
          path: '/gerencia-cargos',
          permissao: cargoData?.canCreateCargos,
        },
      ];
    }

    // Para outros gerentes customizados
    return [
      {
        id: 'admin',
        titulo: 'Área de Administração',
        descricao: 'Acesse o painel de controle',
        icon: Shield,
        cor: 'bg-gray-100 text-gray-600',
        path: '/admin',
        permissao: true,
      },
    ];
  };

  const opcoes = getGerenciaOptions();

  return (
    <div className="min-h-screen w-full flex flex-col font-[Outfit,Poppins] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#57B952]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#008542]/10 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="relative w-full flex items-center justify-between py-3 md:py-6 px-2 sm:px-3 md:px-8 border-b border-white/10 bg-gray-900/50 backdrop-blur-md min-h-[56px] z-20">
        <button
          onClick={() => navigate('/selecao-projeto')}
          className="flex items-center gap-1 md:gap-2 text-gray-300 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden xs:inline">Voltar</span>
        </button>

        <div className="text-center flex-1">
          <h1 className="text-base sm:text-lg md:text-2xl font-bold text-white">Área de Gerência</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Bem-vindo, {primeiroNome}!</p>
        </div>

        <div className="w-12 sm:w-16"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center p-2 sm:p-3 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="mb-3 sm:mb-4 md:mb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1.5 sm:mb-2">
              {userProfile.funcao}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Selecione a área que deseja gerenciar:
            </p>
          </div>

          {opcoes.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20 bg-white/10 backdrop-blur-md rounded-xl shadow border border-white/20 px-4">
              <p className="text-gray-400 mb-4 text-sm sm:text-base">Você não tem permissões para gerenciar nada.</p>
              <button
                onClick={() => navigate('/selecao-projeto')}
                className="text-[#57B952] font-bold hover:underline text-sm sm:text-base"
              >
                Voltar para Projetos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {opcoes.map((opcao) => {
                const Icon = opcao.icon;
                const isDisabled = opcao.permissao === false;

                return (
                  <button
                    key={opcao.id}
                    onClick={() => !isDisabled && navigate(opcao.path)}
                    disabled={isDisabled}
                    className={`gerencia-card w-full text-left p-4 sm:p-5 md:p-6 rounded-xl shadow border transition-all transform ${
                      isDisabled
                        ? 'bg-white/5 opacity-50 cursor-not-allowed border-white/10'
                        : 'bg-white/10 backdrop-blur-md border-white/20 hover:-translate-y-2 hover:shadow-lg cursor-pointer hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full justify-start">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${opcao.cor} flex-shrink-0`}
                      >
                        <Icon size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {opcao.titulo}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                          {opcao.descricao}
                        </p>
                      </div>
                    </div>
                    {isDisabled && (
                      <p className="text-xs text-red-400 mt-2 sm:mt-3 text-left font-medium">
                        Sem permissão
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-gray-300 text-xs border-t border-gray-700 bg-gray-900/50">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default Gerencia;
