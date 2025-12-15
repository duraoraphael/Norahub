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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
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
    <div className="min-h-screen w-full flex flex-col font-[Inter] bg-gray-50 text-black">
      {/* Header */}
      <header className="w-full flex items-center justify-between py-3 md:py-6 px-3 md:px-8 border-b border-gray-200 bg-white min-h-[56px]">
        <button
          onClick={() => navigate('/selecao-projeto')}
          className="flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Voltar</span>
        </button>

        <div className="text-center flex-1">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Área de Gerência</h1>
          <p className="text-gray-500 text-sm mt-1">Bem-vindo, {primeiroNome}!</p>
        </div>

        <div className="w-16"></div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-3 md:p-8">
        <div className="w-full max-w-6xl">
          <div className="mb-4 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              {userProfile.funcao}
            </h2>
            <p className="text-gray-500">
              Selecione a área que deseja gerenciar:
            </p>
          </div>

          {opcoes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-200">
              <p className="text-gray-500 mb-4">Você não tem permissões para gerenciar nada.</p>
              <button
                onClick={() => navigate('/selecao-projeto')}
                className="text-[#57B952] font-bold hover:underline"
              >
                Voltar para Projetos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opcoes.map((opcao) => {
                const Icon = opcao.icon;
                const isDisabled = opcao.permissao === false;

                return (
                  <button
                    key={opcao.id}
                    onClick={() => !isDisabled && navigate(opcao.path)}
                    disabled={isDisabled}
                    className={`p-6 rounded-xl shadow border transition-all transform ${
                      isDisabled
                        ? 'bg-gray-100 opacity-50 cursor-not-allowed border-gray-200'
                        : 'bg-white border-gray-200 hover:-translate-y-2 hover:shadow-lg cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${opcao.cor}`}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-left mb-1">
                      {opcao.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm text-left">
                      {opcao.descricao}
                    </p>
                    {isDisabled && (
                      <p className="text-xs text-red-500 mt-3 text-left font-medium">
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
      <footer className="w-full py-4 text-center text-gray-500 text-xs border-t border-gray-200 bg-white">
        &copy; 2025 Parceria Petrobras & Normatel Engenharia
      </footer>
    </div>
  );
}

export default Gerencia;
