/**
 * Serviço de comandos avançados para o chatbot
 * Permite executar ações complexas através de comandos de texto
 */

// Detectar comandos no texto do usuário
export const detectCommand = (text) => {
  const lowerText = text.toLowerCase().trim();
  
  // Comandos de navegação
  if (lowerText.includes('ir para') || lowerText.includes('abrir') || lowerText.includes('acessar')) {
    if (lowerText.includes('projeto')) return { type: 'navigate', target: 'projects' };
    if (lowerText.includes('perfil')) return { type: 'navigate', target: 'profile' };
    if (lowerText.includes('dashboard')) return { type: 'navigate', target: 'dashboard' };
    if (lowerText.includes('arquivo')) return { type: 'navigate', target: 'files' };
  }

  // Comandos de criação
  if (lowerText.startsWith('criar projeto') || lowerText.startsWith('novo projeto')) {
    const projectName = text.replace(/criar projeto|novo projeto/i, '').trim();
    return { type: 'create', target: 'project', data: { name: projectName } };
  }

  if (lowerText.startsWith('criar card') || lowerText.startsWith('novo card')) {
    const cardName = text.replace(/criar card|novo card/i, '').trim();
    return { type: 'create', target: 'card', data: { name: cardName } };
  }

  // Comandos de busca
  if (lowerText.startsWith('buscar') || lowerText.startsWith('procurar') || lowerText.startsWith('encontrar')) {
    const searchTerm = text.replace(/buscar|procurar|encontrar/i, '').trim();
    return { type: 'search', data: { term: searchTerm } };
  }

  // Comandos de resumo
  if (lowerText.includes('resumir') || lowerText.includes('resumo')) {
    if (lowerText.includes('documento') || lowerText.includes('arquivo') || lowerText.includes('pdf')) {
      return { type: 'summarize', target: 'document' };
    }
  }

  // Comandos de análise
  if (lowerText.includes('analisar') || lowerText.includes('análise')) {
    if (lowerText.includes('planilha') || lowerText.includes('dados') || lowerText.includes('excel')) {
      return { type: 'analyze', target: 'spreadsheet' };
    }
    if (lowerText.includes('projeto')) {
      return { type: 'analyze', target: 'project' };
    }
  }

  // Comandos de favoritos
  if (lowerText.includes('favorit')) {
    if (lowerText.includes('adicionar') || lowerText.includes('salvar')) {
      return { type: 'favorite', action: 'add' };
    }
    if (lowerText.includes('remover') || lowerText.includes('tirar')) {
      return { type: 'favorite', action: 'remove' };
    }
    if (lowerText.includes('mostrar') || lowerText.includes('ver') || lowerText.includes('listar')) {
      return { type: 'favorite', action: 'list' };
    }
  }

  // Comandos de notificação
  if (lowerText.includes('notificaç')) {
    if (lowerText.includes('ativar') || lowerText.includes('ligar')) {
      return { type: 'notification', action: 'enable' };
    }
    if (lowerText.includes('desativar') || lowerText.includes('desligar')) {
      return { type: 'notification', action: 'disable' };
    }
  }

  // Comandos de ajuda
  if (lowerText === 'ajuda' || lowerText === 'help' || lowerText === 'comandos') {
    return { type: 'help' };
  }

  return null;
};

// Executar comando detectado
export const executeCommand = async (command, context) => {
  const { navigate, currentUser, onCreateProject, onSearch, onAnalyze, onSummarize } = context;

  switch (command.type) {
    case 'navigate':
      const routes = {
        projects: '/selecao-projeto',
        profile: '/perfil',
        dashboard: '/dashboard',
        files: '/gerenciamento-arquivos'
      };
      if (navigate && routes[command.target]) {
        setTimeout(() => navigate(routes[command.target]), 1000);
        return `Redirecionando para ${command.target}...`;
      }
      return `Não foi possível navegar para ${command.target}`;

    case 'create':
      if (command.target === 'project' && onCreateProject) {
        const result = await onCreateProject(command.data.name);
        return result.success 
          ? `✅ Projeto "${command.data.name}" criado com sucesso!`
          : `❌ Erro ao criar projeto: ${result.error}`;
      }
      return `Para criar um ${command.target}, use o botão "+ Novo" na tela de seleção de projetos.`;

    case 'search':
      if (onSearch) {
        onSearch(command.data.term);
        return `🔍 Buscando por "${command.data.term}"...`;
      }
      return `Use Ctrl+K para abrir a busca global.`;

    case 'summarize':
      if (command.target === 'document' && onSummarize) {
        return await onSummarize();
      }
      return `Para resumir um documento, primeiro abra o arquivo que deseja resumir.`;

    case 'analyze':
      if (onAnalyze) {
        return await onAnalyze(command.target);
      }
      return `Para análise de dados, acesse o dashboard ou abra uma planilha.`;

    case 'favorite':
      return handleFavoriteCommand(command.action, context);

    case 'notification':
      return handleNotificationCommand(command.action);

    case 'help':
      return getHelpMessage();

    default:
      return null;
  }
};

// Manipular comandos de favoritos
function handleFavoriteCommand(action, context) {
  switch (action) {
    case 'add':
      return `Para adicionar aos favoritos, clique no ícone de estrela ⭐ no projeto ou card desejado.`;
    case 'remove':
      return `Para remover dos favoritos, clique novamente no ícone de estrela ⭐ (ele ficará vazio).`;
    case 'list':
      return `Seus favoritos aparecem no topo da página de seleção de projetos, marcados com ⭐`;
    default:
      return `Use: "adicionar aos favoritos", "remover dos favoritos" ou "mostrar favoritos"`;
  }
}

// Manipular comandos de notificação
function handleNotificationCommand(action) {
  if (action === 'enable') {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          return `✅ Notificações ativadas! Você receberá avisos de atividades importantes.`;
        }
      });
    }
    return `Notificações já estão ativas ou não são suportadas pelo seu navegador.`;
  }
  
  if (action === 'disable') {
    return `Para desativar notificações, vá em Configurações do navegador → Notificações → Bloquear este site.`;
  }

  return `Use "ativar notificações" ou "desativar notificações"`;
}

// Mensagem de ajuda com todos os comandos
function getHelpMessage() {
  return `**📋 COMANDOS DISPONÍVEIS**

**🧭 Navegação:**
• "ir para projetos" / "abrir projetos"
• "ir para perfil"  
• "ir para dashboard"
• "ir para arquivos"

**➕ Criação:**
• "criar projeto [nome]"
• "criar card [nome]"

**🔍 Busca:**
• "buscar [termo]"
• "procurar [termo]"

**📄 Documentos:**
• "resumir documento"
• "resumir este arquivo"

**📊 Análise:**
• "analisar planilha"
• "analisar projeto"
• "análise de dados"

**⭐ Favoritos:**
• "adicionar aos favoritos"
• "remover dos favoritos"
• "mostrar favoritos"

**🔔 Notificações:**
• "ativar notificações"
• "desativar notificações"

**💡 Dica:** Digite naturalmente! Exemplo: "criar projeto Meu Novo Projeto"`;
}
