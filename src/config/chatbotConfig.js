// 🤖 Configuração do Chatbot NoraHub
// Edite as configurações abaixo para personalizar o comportamento da assistente virtual

export const chatbotConfig = {
  // ═══════════════════════════════════════════════════════════════
  // 🎯 CONFIGURAÇÕES GERAIS
  // ═══════════════════════════════════════════════════════════════
  
  // Nome da assistente virtual
  assistantName: 'Nora',
  
  // Nome do sistema
  systemName: 'NoraHub',
  
  // Domínio do sistema
  domain: 'www.norahub.com.br',
  
  // Empresa/Organização
  organization: 'Normatel/Petrobras',
  
  // ═══════════════════════════════════════════════════════════════
  // 💬 TOM E ESTILO DE COMUNICAÇÃO
  // ═══════════════════════════════════════════════════════════════
  
  communicationStyle: {
    // Tom de voz: 'formal' | 'profissional' | 'amigavel' | 'casual'
    tone: 'formal',
    
    // Nível de formalidade (1-5, sendo 5 muito formal)
    formalityLevel: 4,
    
    // Usar emojis nas respostas
    useEmojis: false,
    
    // Quantidade máxima de emojis por mensagem (se useEmojis = true)
    maxEmojisPerMessage: 1,
    
    // Ser objetivo e direto
    beObjective: true,
    
    // Tamanho máximo da resposta em palavras
    maxResponseWords: 150,
    
    // Usar linguagem técnica
    useTechnicalLanguage: true,
    
    // Adicionar cumprimentos nas respostas
    useGreetings: false,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 📝 MENSAGENS PERSONALIZÁVEIS
  // ═══════════════════════════════════════════════════════════════
  
  messages: {
    // Mensagem de boas-vindas inicial
    welcomeMessage: `Bem-vindo ao ${this?.systemName || 'NoraHub'}. Como posso auxiliá-lo?

Estou disponível para:
• Orientação sobre funcionalidades do sistema
• Navegação entre módulos
• Procedimentos de upload de arquivos
• Criação e gestão de projetos
• Esclarecimento de dúvidas técnicas

Digite sua solicitação.`,
    
    // Mensagem de erro de conexão
    errorMessage: `Ocorreu um erro de conexão. Por favor, tente novamente.

Se o problema persistir, contate o suporte técnico.`,
    
    // Mensagem de processamento
    processingMessage: 'Processando sua solicitação...',
    
    // Mensagem quando não entende a pergunta
    clarificationMessage: 'Não compreendi sua solicitação. Poderia reformular de forma mais específica?',
    
    // Placeholder do campo de input
    inputPlaceholder: 'Digite sua pergunta...',
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 🎬 AÇÕES RÁPIDAS
  // ═══════════════════════════════════════════════════════════════
  
  quickActions: [
    { 
      label: 'Criar Projeto', 
      query: 'Como criar um novo projeto?' 
    },
    { 
      label: 'Upload de Arquivos', 
      query: 'Como fazer upload de arquivos?' 
    },
    { 
      label: 'Busca Global', 
      query: 'Como usar a busca global?' 
    },
    { 
      label: 'Visualizar Dashboard', 
      query: 'Como acessar o dashboard?' 
    }
  ],
  
  // ═══════════════════════════════════════════════════════════════
  // 🤖 COMPORTAMENTO DA IA
  // ═══════════════════════════════════════════════════════════════
  
  aiSettings: {
    // Temperatura da IA (0-1, sendo 0 mais determinístico e 1 mais criativo)
    temperature: 0.4,
    
    // Máximo de tokens de resposta
    maxTokens: 800,
    
    // Número de mensagens anteriores para contexto
    historyContext: 4,
    
    // Instruções de comportamento personalizadas
    customInstructions: `Você é uma assistente virtual corporativa profissional.

DIRETRIZES DE COMUNICAÇÃO:
• Mantenha um tom formal e objetivo em todas as respostas
• Seja direto e evite informações desnecessárias
• Use linguagem técnica adequada ao ambiente corporativo
• Forneça respostas estruturadas com passos numerados quando apropriado
• Não use emojis ou linguagem coloquial
• Mantenha as respostas concisas, com no máximo 150 palavras

ESTRUTURA DE RESPOSTA:
1. Confirme a solicitação do usuário
2. Forneça as informações necessárias de forma direta
3. Indique os próximos passos, se aplicável

PRIORIDADES:
• Precisão sobre quantidade de informação
• Clareza sobre elaboração
• Ação sobre explicação`,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // 🎨 PERSONALIZAÇÃO VISUAL
  // ═══════════════════════════════════════════════════════════════
  
  visual: {
    // Cor principal (hexadecimal)
    primaryColor: '#57B952',
    
    // Mostrar status online
    showOnlineStatus: true,
    
    // Texto do status
    onlineStatusText: 'Disponível',
    
    // Mostrar timestamp nas mensagens
    showTimestamp: true,
    
    // Posição do chat: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    position: 'bottom-right',
    
    // Tamanho do ícone flutuante (pixels)
    floatingIconSize: 64,
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ⚙️ RECURSOS AVANÇADOS
  // ═══════════════════════════════════════════════════════════════
  
  features: {
    // Permitir navegação automática
    allowAutoNavigation: true,
    
    // Adaptar respostas baseado no cargo do usuário
    roleBasedResponses: true,
    
    // Manter histórico entre sessões
    persistHistory: false,
    
    // Sugerir ações relacionadas
    suggestRelatedActions: true,
    
    // Permitir upload via chat
    allowFileUpload: false,
  }
};

// ═══════════════════════════════════════════════════════════════
// 📋 TEMPLATES DE RESPOSTA
// ═══════════════════════════════════════════════════════════════

export const responseTemplates = {
  // Template para procedimentos
  procedure: (steps) => `PROCEDIMENTO:

${steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
  
  // Template para informações
  information: (title, content) => `${title.toUpperCase()}

${content}`,
  
  // Template para navegação
  navigation: (page, path) => `Redirecionando para ${page}.

[NAVIGATE:${path}]`,
  
  // Template para erros
  error: (type, suggestion) => `ERRO: ${type}

Sugestão: ${suggestion}`,
};

export default chatbotConfig;
