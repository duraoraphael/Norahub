import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Users, FolderOpen, FileText, TrendingUp, 
  Activity, Clock, CheckCircle, XCircle, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import NotificationCenter from '../components/NotificationCenter';

function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalForms: 0,
    totalFiles: 0,
    activeProjects: 0,
    pendingApprovals: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const primeiroNome = userProfile?.nome?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'Usuário';
  const fotoURL = currentUser?.photoURL || userProfile?.fotoURL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários
      const usersSnapshot = await getDocs(collection(db, 'usuarios'));
      const totalUsers = usersSnapshot.size;
      
      // Buscar projetos
      const projectsSnapshot = await getDocs(collection(db, 'projetos'));
      const totalProjects = projectsSnapshot.size;
      const activeProjects = projectsSnapshot.docs.filter(doc => doc.data().ativa).length;
      
      // Buscar formulários (assumindo que existem na coleção 'formularios')
      const formsSnapshot = await getDocs(collection(db, 'formularios'));
      const totalForms = formsSnapshot.size;
      
      // Buscar arquivos (assumindo que existem na coleção 'arquivos')
      const filesSnapshot = await getDocs(collection(db, 'arquivos'));
      const totalFiles = filesSnapshot.size;
      
      // Buscar notificações recentes
      const notificationsQuery = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const activities = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStats({
        totalUsers,
        totalProjects,
        totalForms,
        totalFiles,
        activeProjects,
        pendingApprovals: 0 // Implementar lógica de aprovações se necessário
      });
      
      setRecentActivity(activities);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Data desconhecida';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${bgColor} p-3 md:p-4 rounded-xl`}>
          <Icon size={24} className={`md:w-8 md:h-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col font-[Inter] overflow-x-hidden bg-gray-50">
      {/* Header */}
      <header className="relative w-full flex items-center justify-center py-3 md:py-6 px-3 md:px-8 border-b border-gray-200 min-h-[56px] md:h-20 bg-white">
        <button 
          onClick={() => navigate('/selecao-projeto')} 
          className="absolute left-3 md:left-8 flex items-center gap-1 md:gap-2 text-gray-500 hover:text-[#57B952] transition-colors font-medium text-xs md:text-sm shrink-0 z-10"
        >
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> 
          <span className="hidden sm:inline">Voltar</span>
        </button>
        
        <div className="flex items-center gap-2 md:gap-4">
          <img src="/img/NoraHub.png" alt="Logo Nora" className="h-6 md:h-10 w-auto object-contain" />
          <span className="text-gray-600 text-lg md:text-2xl font-light">|</span>
          <img 
            src={isDark ? "/img/Normatel Engenharia_BRANCO.png" : "/img/Normatel Engenharia_PRETO.png"} 
            alt="Logo Normatel" 
            className="h-6 md:h-10 w-auto object-contain" 
          />
        </div>
        
        {currentUser && (
          <div className="absolute right-3 md:right-8 flex items-center gap-2 md:gap-3 shrink-0">
            <NotificationCenter />
            <button 
              onClick={() => navigate('/perfil')} 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[#57B952] bg-gray-200 flex items-center justify-center hover:border-green-600 transition-colors cursor-pointer shrink-0"
            >
              {fotoURL ? (
                <img src={fotoURL} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <User size={16} className="md:w-5 md:h-5 text-gray-500" />
              )}
            </button>
            <span className="text-xs md:text-base lg:text-lg font-semibold text-gray-800 truncate max-w-[60px] sm:max-w-[100px] md:max-w-none">
              <span className="hidden md:inline">Olá, </span>{primeiroNome}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow p-3 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Título */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 size={32} className="md:w-10 md:h-10 text-[#57B952]" />
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              Visão geral das estatísticas do sistema
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57B952] mx-auto"></div>
              <p className="text-gray-500 mt-4">Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatCard 
                  icon={Users}
                  label="Total de Usuários"
                  value={stats.totalUsers}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                />
                <StatCard 
                  icon={FolderOpen}
                  label="Total de Projetos"
                  value={stats.totalProjects}
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
                <StatCard 
                  icon={Activity}
                  label="Projetos Ativos"
                  value={stats.activeProjects}
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                />
                <StatCard 
                  icon={FileText}
                  label="Total de Formulários"
                  value={stats.totalForms}
                  color="text-orange-600"
                  bgColor="bg-orange-100"
                />
                <StatCard 
                  icon={FolderOpen}
                  label="Total de Arquivos"
                  value={stats.totalFiles}
                  color="text-indigo-600"
                  bgColor="bg-indigo-100"
                />
                <StatCard 
                  icon={TrendingUp}
                  label="Taxa de Atividade"
                  value={`${stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0}%`}
                  color="text-[#57B952]"
                  bgColor="bg-green-100"
                />
              </div>

              {/* Atividade Recente */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="md:w-6 md:h-6" />
                  Atividade Recente
                </h2>
                
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div 
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'form_response' ? 'bg-blue-100' :
                          activity.type === 'file_upload' ? 'bg-green-100' :
                          activity.type === 'approval' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          {activity.type === 'form_response' ? <FileText size={18} className="text-blue-600" /> :
                           activity.type === 'file_upload' ? <FolderOpen size={18} className="text-green-600" /> :
                           activity.type === 'approval' ? <CheckCircle size={18} className="text-purple-600" /> :
                           <Activity size={18} className="text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatTimestamp(activity.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nota sobre Recharts */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  📊 <strong>Nota:</strong> Para visualizar gráficos avançados, instale a biblioteca Recharts: 
                  <code className="ml-2 bg-yellow-100 px-2 py-1 rounded">npm install recharts</code>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
