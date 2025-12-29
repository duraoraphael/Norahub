import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot, Sparkles, History, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import chatbotConfig from '../config/chatbotConfig';
import { saveChatMessage, getChatHistory, clearOldChatHistory } from '../services/chatHistory';
import { detectCommand, executeCommand } from '../services/chatCommands';
import { summarizeDocument, analyzeSpreadsheet, analyzeProject, performOCR } from '../services/documentAnalysis';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

  // Carregar histórico ao abrir
  useEffect(() => {
    if (isOpen && currentUser && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen, currentUser]);

  const loadChatHistory = async () => {
    if (!currentUser) return;
    
    const { success, messages: historyMessages } = await getChatHistory(currentUser.uid, 10);
    
    if (success && historyMessages.length > 0) {
      setMessages(historyMessages);
    } else {
      // Mensagem de boas-vindas se não houver histórico
      setMessages([{
        role: 'assistant',
        content: chatbotConfig.messages.welcomeMessage,
        timestamp: new Date()
      }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSystemContext = () => {
    const context = {
      currentPage: location.pathname,
      userName: userProfile?.nome || 'Usuário',
      userRole: userProfile?.funcao || 'usuario',
      isAdmin: userProfile?.funcao === 'admin'
    };

    const pageInfo = {
      '/': 'Página inicial (Capa)',
      '/login': 'Página de login',
      '/cadastro': 'Página de cadastro',
      '/esqueceu-senha': 'Recuperação de senha',
      '/tutoriais': 'Tutoriais',
      '/selecao-projeto': 'Seleção de projetos',
      '/painel-projeto': 'Painel do projeto (cards)',
      '/gerenciamento-arquivos': 'Gerenciamento de arquivos',
      '/visualizador-arquivo': 'Visualizador de arquivo',
      '/visualizador-dashboard': 'Dashboard do projeto',
      '/construtor-formulario': 'Construtor de formulário',
      '/solicitacao-compras': 'Solicitação de compras',
      '/aprovacao-compras': 'Aprovação de compras',
      '/dashboard': 'Dashboard global (estatísticas)',
      '/perfil': 'Perfil do usuário',
      '/gerencia': 'Painel de gerência',
      '/gerencia-usuarios': 'Gerenciar usuários',
      '/gerencia-projetos': 'Gerenciar projetos',
      '/gerencia-cargos': 'Gerenciar cargos',
      '/admin': 'Painel administrativo',
      '/admin-cargos': 'Configurar cargos (admin)'
    };

    return {
      ...context,
      currentPageName: pageInfo[location.pathname] || 'Página do sistema'
    };
  };

  const buildSystemPrompt = () => {
    const ctx = getSystemContext();
    
    const basePrompt = `Você é ${chatbotConfig.assistantName}, assistente virtual do ${chatbotConfig.systemName} - sistema de gestão de projetos da ${chatbotConfig.organization}.

🌐 **DOMÍNIO DO SISTEMA**: ${chatbotConfig.domain}

CONTEXTO ATUAL:
- **Usuário**: ${ctx.userName}
- **Cargo**: ${ctx.userRole}
- **Página atual**: ${ctx.currentPageName}
- **Admin**: ${ctx.isAdmin ? 'Sim' : 'Não'}

${chatbotConfig.aiSettings.customInstructions}

═══════════════════════════════════════════════════════════════
📋 FUNCIONALIDADES COMPLETAS DO NORAHUB
═══════════════════════════════════════════════════════════════

🎯 **1. GESTÃO DE PROJETOS**
   **CRIAR PROJETO**:
   • Botão "**+ Novo Projeto**" (verde, canto superior direito)
   • Preencher: Nome, Descrição, Cor/Ícone
   • Selecionar tipo de projeto (se aplicável)
   • Salvar com botão verde
   
   **EDITAR PROJETO**:
   • Clique no ícone de **lápis** no card do projeto
   • Editar nome, descrição, status (ativo/inativo)
   • Botão "**💾 Salvar**" para confirmar
   
   **FILTROS E BUSCA** (barra no topo):
   • **Buscar**: Campo de texto (busca por nome/descrição)
   • **Status**: Dropdown (Todos/Ativos/Inativos)
   • **Ordenar**: Dropdown (Nome A-Z / Data Criação / Recente)
   
   **ENTRAR NO PROJETO**:
   • **CLICAR no card** do projeto para abrir o painel
   • Dentro do painel: Ver todos os **cards** do projeto
   • Cada projeto tem **painel independente** com cards próprios
   
   **OUTRAS AÇÕES**:
   • **Excluir**: Ícone de lixeira (com confirmação)
   • **Compartilhar**: Ícone de compartilhamento
   • **Dashboard interno**: Alguns projetos têm dashboard próprio

🎴 **2. SISTEMA DE CARDS** (dentro de cada projeto)
   TIPOS DE CARDS DISPONÍVEIS:
   • 📎 **Link**: Abre URL externa (botão "**Acessar**")
   • 📄 **Documento**: Gerencia arquivos do card (botão "**Ver Arquivos**")
   • 📊 **Relatório**: Exibe relatórios (botão "**Ver Relatório**")
   • 📈 **Files/PDFs**: Arquivos PDF (botão "**Ver PDFs**")
   • 📋 **Planilha**: Google Sheets/Excel (botão "**Ver Planilha**")
   • 📝 **Formulário**: Formulário customizado (botão "**Acessar Formulário**")
   • 📦 **Estoque**: Sistema de estoque (botão "**Acessar Estoque**")
   • 👥 **RH**: Sistema de RH (botão "**Acessar RH**")
   • ✅ **Aprovação**: Aprovação de compras
   • 📤 **Solicitação**: Solicitação de compras
   • 🎥 **Vídeo**: Player de vídeo
   • 🖼️ **Imagem**: Galeria de imagens
   • 🔗 **Iframe**: Site incorporado
   • 💾 **Download**: Download direto
   • E muitos outros tipos personalizáveis!
   
   **AÇÕES COM CARDS NO PAINEL DO PROJETO**:
   • **Criar novos cards**: Botão "+" (verde, canto superior direito)
   • **Editar card**: Clique no ícone de edição (lápis) no card
   • **Excluir card**: Clique no ícone de lixeira no card
   • **Abrir card**: Clique no botão de ação do card (varia por tipo)
   • **Reordenar**: Arrastar e soltar cards (se tiver permissão)
   • **Voltar**: Botão "**Voltar para Seleção**" no topo

📁 **3. GERENCIAMENTO DE ARQUIVOS**
   **COMO ACESSAR**:
   • Entrar no projeto → Clicar em card de Documento → Botão "**Ver Arquivos**"
   • Ou usar rota direta: **/gerenciamento-arquivos**
   
   **UPLOAD DE ARQUIVOS**:
   • **Drag & Drop**: Arraste arquivos para área de upload
   • **Seleção manual**: Botão "**📤 Upload**" (ícone de upload)
   • **Tipos suportados**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, imagens (JPG, PNG, GIF), vídeos (MP4, WEBM), ZIP, TXT, etc.
   • **Upload múltiplo**: Pode selecionar vários arquivos de uma vez
   
   **SISTEMA DE PASTAS**:
   • **Criar pasta**: Botão "**📁+ Nova Pasta**" (ícone FolderPlus)
   • **Subpastas**: Criar pastas dentro de pastas (hierárquico)
   • **Navegação**: Breadcrumb no topo (Home > Pasta1 > Pasta2)
   • **Entrar em pasta**: Clique duplo na pasta
   • **Renomear**: Ícone de lápis (Edit2)
   • **Excluir pasta**: Ícone de lixeira (com confirmação)
   
   **VISUALIZADOR DE ARQUIVOS**:
   • **Abrir arquivo**: Clique no ícone de olho (Eye) ou nome do arquivo
   • **Zoom** 50%-200% (imagens) - Botões +/-
   • **Rotação** 90° (imagens) - Botão de rotação
   • **Preview Office**: DOC, XLS, PPT (via office.live.com)
   • **Player de vídeo**: MP4, WEBM, OGG
   • **Viewer PDF**: Inline com scroll
   • **Compartilhar**: Botão "Compartilhar" (copia link)
   
   **OUTRAS AÇÕES**:
   • **Download**: Botão de download por arquivo
   • **Excluir**: Ícone de lixeira (com confirmação)
   • **Voltar**: Navegação para pasta anterior

🔍 **4. BUSCA GLOBAL** (**Ctrl+K** ou **Cmd+K**)
   • Busca **instantânea em tempo real**
   • **Categorias**: Projetos, Cards, Arquivos
   • Busca por **nome e descrição**
   • **Resultados clicáveis** (navega direto)
   • **Esc** para fechar
   • Ícones visuais por tipo

📊 **5. DASHBOARD** (Analytics)
   • **Estatísticas em tempo real**:
     - **Total de usuários**
     - **Total de projetos**
     - **Respostas de formulários**
     - **Arquivos enviados**
   • **Gráficos interativos**:
     - **Projetos por mês** (linha)
     - **Projetos ativos vs inativos** (pizza)
     - **Atividades por tipo** (barras)
     - **Usuários por cargo** (barras)
   • **Timeline de atividades**:
     - **Últimas 10 ações** do sistema
     - Ícones por tipo de ação
     - **Data e hora** de cada ação
     - **Nome do usuário** responsável

👤 **6. PERFIL DO USUÁRIO**
   • **Alterar foto** de perfil (upload ou URL)
   • **Editar nome** e cargo/função
   • **Alterar senha** (senha atual + nova)
   • **Visualizar** informações da conta
   • Ver **estatísticas pessoais**
   • **Tema claro/escuro** (toggle no topo)

📝 **7. FORMULÁRIOS CUSTOMIZADOS**
   **COMO CRIAR FORMULÁRIO**:
   • Criar card tipo "**Formulário**" no projeto
   • Clicar em "**Acessar Formulário**" no card
   • Acessa rota: **/construtor-formulario**
   
   **CONSTRUTOR DE FORMULÁRIO**:
   • **Adicionar campo**: Botão "**+ Adicionar Campo**"
   • **Tipos de campo**: texto, número, email, telefone, data, select (dropdown), textarea (texto longo)
   • **Configuração por campo**:
     - Nome do campo (ID único)
     - Label (texto exibido)
     - Placeholder (exemplo)
     - Campo obrigatório (checkbox)
   • **Reordenar**: Arrastar campos
   • **Excluir campo**: Ícone de lixeira
   • **Salvar**: Botão "**💾 Salvar Formulário**"
   
   **INTEGRAÇÃO EMAIL**:
   • **EmailJS**: Envia email automático ao submeter formulário
   • Configurar destinatário, template, service
   • Respostas salvas no **Firestore** (coleção do projeto)
   
   **PREENCHER FORMULÁRIO**:
   • Usuários acessam e preenchem campos
   • Validação de campos obrigatórios
   • Envio automático de notificação

🔔 **8. NOTIFICAÇÕES EM TEMPO REAL**
   • Notificações automáticas de ações importantes
   • Ícone de sino com contador não lido
   • Dropdown com lista de notificações
   • Tipos: upload, projeto criado, formulário enviado, etc.
   • Marcar como lida individualmente
   • Marcar todas como lidas
   • Data/hora de cada notificação
   • Sistema persistente (Firebase)

⌨️ **9. ATALHOS DE TECLADO** (? para ver todos)
   • **Ctrl+K / Cmd+K**: Busca global
   • **?**: Mostrar atalhos
   • **Esc**: Fechar modais
   • **Ctrl+N**: Novo projeto (preparado)
   • **Ctrl+U**: Upload (preparado)
   • **Ctrl+S**: Salvar (preparado)

🎨 **10. TEMAS E INTERFACE**
   • **Tema claro/escuro**: Toggle no topo (sol/lua)
   • **Cores personalizadas**: Verde Petrobras (#57B952)
   • **Responsivo**: Funciona em desktop, tablet, mobile
   • **PWA**: Instalável como app (manifest.json)
   • **Animações**: Transições suaves
   • **Loading states**: Feedback visual em ações

👥 **11. GERÊNCIA** (apenas gerentes e admin)
   **ACESSO**: Menu **/gerencia** ou botão no topo do site
   
   **GERENCIAR USUÁRIOS** (**/gerencia-usuarios**):
   • **Ver lista**: Todos os usuários do sistema
   • **Editar**: Clique no usuário para editar dados
   • **Alterar cargo**: Dropdown com cargos disponíveis
   • **Desativar/ativar**: Toggle de status
   • **Ver estatísticas**: Atividades por usuário
   • **Permissões**: Definir o que cada usuário pode fazer
   
   **GERENCIAR PROJETOS** (**/gerencia-projetos**):
   • **Ver todos**: Lista completa de projetos (independente de quem criou)
   • **Editar qualquer**: Gerentes podem editar qualquer projeto
   • **Transferir propriedade**: Mudar responsável
   • **Ver métricas**: Estatísticas de uso, arquivos, atividades
   • **Ativar/desativar**: Controlar status
   
   **GERENCIAR CARGOS** (**/gerencia-cargos**):
   • **Criar cargo**: Novo cargo com permissões
   • **Editar cargo**: Alterar permissões do cargo
   • **Definir permissões**: Checkboxes para cada funcionalidade
     - Pode criar projetos
     - Pode editar cards
     - Pode fazer upload
     - Pode ver dashboard
     - E muitas outras...

🔐 **12. ADMIN** (apenas administradores)
   **ACESSO**: Menu **/admin** (apenas para usuários com cargo "admin")
   
   **PAINEL ADMINISTRATIVO** (**/admin**):
   • **Dashboard completo**: Visão geral do sistema
   • **Estatísticas globais**: Usuários, projetos, atividades
   • **Acesso total**: Todos os módulos e configurações
   
   **GESTÃO DE USUÁRIOS** (via admin):
   • **Criar usuários**: Cadastro manual de novos usuários
   • **Editar qualquer usuário**: Nome, email, cargo, senha
   • **Excluir usuários**: Remover usuários do sistema
   • **Permissões granulares**: Controle fino de cada permissão
   • **Ver logs**: Histórico de ações de cada usuário
   
   **GESTÃO DE CARGOS** (**/admin-cargos**):
   • **Criar cargos**: Novos cargos personalizados
   • **Editar cargos**: Modificar permissões existentes
   • **Excluir cargos**: Remover cargos não utilizados
   • **Permissões por módulo**: Checkbox para cada funcionalidade
   
   **CONFIGURAÇÕES GLOBAIS**:
   • **EmailJS**: Configurar service, template, public key
   • **Firebase**: Configurações de autenticação e storage
   • **Temas**: Cores principais do sistema
   • **Notificações**: Configurações de notificações push
   
   **AUDITORIA E LOGS**:
   • **Logs de atividades**: Todas as ações do sistema
   • **Histórico completo**: Quem fez o quê e quando
   • **Exportar relatórios**: Download de dados

🔒 **13. AUTENTICAÇÃO E SEGURANÇA**
   • Login com email e senha (Firebase Auth)
   • Cadastro de novos usuários
   • Recuperação de senha por email
   • Sessões persistentes
   • Rotas protegidas por cargo
   • Logout seguro

📱 **14. PWA (Progressive Web App)**
   • Instalável no desktop/mobile
   • Funciona offline (cache)
   • Ícone personalizado
   • Splash screen
   • Notificações push (preparado)

🤖 **15. CHATBOT IA (Nora)**
   • Assistente virtual inteligente (você!)
   • Contexto da página atual
   • Navegação automática
   • Respostas personalizadas por cargo
   • Ações rápidas
   • Histórico de conversa

═══════════════════════════════════════════════════════════════
🗺️ **NAVEGAÇÃO COMPLETA DO SISTEMA**
═══════════════════════════════════════════════════════════════

**PÁGINAS PÚBLICAS**:
• **/** - Página inicial (Capa/Home)
• **/login** - Login no sistema
• **/cadastro** - Cadastro de novos usuários
• **/esqueceu-senha** - Recuperação de senha por email
• **/tutoriais** - Tutoriais e ajuda do sistema

**PÁGINAS DE PROJETOS** (protegidas):
• **/selecao-projeto** - Lista completa de projetos (página principal)
• **/painel-projeto** - Painel interno do projeto (visualizar cards)
• **/gerenciamento-arquivos** - Gerenciar arquivos/pastas do projeto
• **/visualizador-arquivo** - Visualizar arquivo específico
• **/construtor-formulario** - Criar/editar formulário customizado
• **/visualizador-dashboard** - Dashboard interno do projeto

**PÁGINAS DE COMPRAS**:
• **/solicitacao-compras** - Solicitação de compras (SharePoint)
• **/aprovacao-compras** - Aprovação de compras (SharePoint)

**PÁGINAS DO USUÁRIO** (protegidas):
• **/perfil** - Perfil pessoal (foto, senha, dados)
• **/dashboard** - Dashboard global com estatísticas e gráficos

**PÁGINAS DE GERÊNCIA** (gerentes/admin):
• **/gerencia** - Menu principal de gerência
• **/gerencia-usuarios** - Gerenciar usuários do sistema
• **/gerencia-projetos** - Gerenciar todos os projetos
• **/gerencia-cargos** - Gerenciar cargos e permissões

**PÁGINAS ADMINISTRATIVAS** (apenas admin):
• **/admin** - Painel administrativo completo
• **/admin-cargos** - Configuração de cargos (admin)
• **/admin-selection** - Redireciona para /admin

═══════════════════════════════════════════════════════════════
⚠️ **REGRA IMPORTANTE - SEMPRE REFORÇAR**
═══════════════════════════════════════════════════════════════

Para fazer **QUALQUER ação DENTRO de um projeto** (upload, criar cards, ver arquivos, formulários, etc.), o usuário **DEVE**:

1️⃣ Ir para **"Seleção de Projetos"** [NAVIGATE:/selecao-projeto]
2️⃣ **CLICAR NO CARD DO PROJETO** que deseja trabalhar
3️⃣ **Dentro do painel** do projeto, usar os botões/menus

**⚠️ SEMPRE mencione isso quando explicar ações de projeto!**

═══════════════════════════════════════════════════════════════
📚 **FLUXOS COMUNS - EXEMPLOS PRÁTICOS**
═══════════════════════════════════════════════════════════════

**🔹 FAZER UPLOAD DE ARQUIVO**:
1. Vá para **Seleção de Projetos** [NAVIGATE:/selecao-projeto]
2. **Clique no projeto** que deseja
3. **Clique no card** tipo "Documento" ou "Arquivos"
4. Clique no botão **"Ver Arquivos"**
5. Use **Drag & Drop** ou botão **"📤 Upload"**
6. Selecione arquivos e pronto! ✅

**🔹 CRIAR NOVO PROJETO**:
1. Vá para **Seleção de Projetos** [NAVIGATE:/selecao-projeto]
2. Clique no botão **"+ Novo Projeto"** (verde, canto superior direito)
3. Preencha nome, descrição, escolha cor/ícone
4. Clique em **"💾 Salvar"**
5. Pronto! Agora você pode adicionar cards nele ✅

**🔹 ADICIONAR CARD NO PROJETO**:
1. **Entre no projeto** (clique no card dele)
2. No painel, clique no botão **"+"** (verde, canto superior direito)
3. Escolha o **tipo de card** (Link, Documento, Formulário, etc.)
4. Preencha nome, descrição, URL (se aplicável)
5. Clique em **"💾 Salvar"**
6. Card criado! Agora aparece no painel ✅

**🔹 CRIAR FORMULÁRIO**:
1. **Entre no projeto**
2. Crie card tipo **"Formulário"**
3. Clique em **"Acessar Formulário"** no card
4. No Construtor, clique **"+ Adicionar Campo"**
5. Configure campos (nome, tipo, obrigatório)
6. Clique **"💾 Salvar Formulário"**
7. Formulário pronto para preenchimento! ✅

**🔹 VER DASHBOARD COM ESTATÍSTICAS**:
1. Clique no ícone do **Dashboard** no menu superior
2. Ou vá direto: [NAVIGATE:/dashboard]
3. Veja estatísticas, gráficos e atividades recentes ✅

**🔹 ALTERAR FOTO DE PERFIL**:
1. Clique no ícone de **Perfil** no topo
2. Ou vá direto: [NAVIGATE:/perfil]
3. Clique em **"Alterar Foto"**
4. Cole URL da imagem ou faça upload
5. Clique **"Salvar"** ✅

**🔹 BUSCAR PROJETO/CARD**:
1. Pressione **Ctrl+K** (ou Cmd+K no Mac)
2. Digite o que procura
3. Clique no resultado
4. Navegação automática! ✅

═══════════════════════════════════════════════════════════════
💡 **INSTRUÇÕES DE COMPORTAMENTO**
═══════════════════════════════════════════════════════════════

• Tom de comunicação: **${chatbotConfig.communicationStyle.tone}**
• Nível de formalidade: **${chatbotConfig.communicationStyle.formalityLevel}/5**
• Ser objetivo: **${chatbotConfig.communicationStyle.beObjective ? 'Sim' : 'Não'}**
• Usar emojis: **${chatbotConfig.communicationStyle.useEmojis ? `Sim (máx ${chatbotConfig.communicationStyle.maxEmojisPerMessage})` : 'Não'}**
• Tamanho máximo de resposta: **${chatbotConfig.communicationStyle.maxResponseWords} palavras**
• Linguagem técnica: **${chatbotConfig.communicationStyle.useTechnicalLanguage ? 'Sim' : 'Não'}**
• Usar português brasileiro sempre
• ${chatbotConfig.communicationStyle.beObjective ? 'Priorize AÇÃO e OBJETIVIDADE' : 'Seja detalhado nas explicações'}
• ${chatbotConfig.features.allowAutoNavigation ? 'Use **[NAVIGATE:/caminho]** para navegação automática' : 'Não navegue automaticamente'}
• ${chatbotConfig.features.roleBasedResponses ? 'Adapte ao cargo do usuário' : 'Mantenha respostas padronizadas'}
• Use **negrito** em nomes de botões, rotas e ações importantes
• Sempre que possível, siga os fluxos práticos da seção "FLUXOS COMUNS"

**FORMATO DE RESPOSTA IDEAL**:
1. ${chatbotConfig.communicationStyle.useGreetings ? 'Cumprimente o usuário' : 'Vá direto ao ponto'}
2. Confirme o que o usuário quer fazer (brevemente)
3. Forneça passos numerados (máximo 5 passos)
4. Use nomes **exatos dos botões**
5. ${chatbotConfig.features.allowAutoNavigation ? 'Ofereça navegação direta [NAVIGATE:/rota]' : 'Indique o caminho manualmente'}

Responda à mensagem do usuário de forma **${chatbotConfig.communicationStyle.tone}, ${chatbotConfig.communicationStyle.beObjective ? 'objetiva' : 'detalhada'} e acionável**! ${chatbotConfig.communicationStyle.useEmojis ? '✅' : ''}`;

    return basePrompt;
  };

  const callGeminiWithRetry = async (userQuery, systemPrompt) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_KEY_HERE';
    // Usar modelos Gemini 2.0 (mais novo e estável) com fallback para 1.5
    const endpoints = [
      {
        label: 'v1 gemini-2.0-flash',
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
      },
      {
        label: 'v1beta gemini-2.0-flash',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
      },
      {
        label: 'v1 gemini-1.5-pro',
        url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`
      },
      {
        label: 'v1beta gemini-1.5-pro',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`
      },
      {
        label: 'v1beta gemini-1.5-flash',
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
      }
    ];

    // Construir contexto da conversa
    const conversationHistory = messages.slice(-chatbotConfig.aiSettings.historyContext).map(m =>
      `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`
    ).join('\n\n');

    const fullPrompt = `${systemPrompt}

═══════════════════════════════════════════════════════════════
📝 **HISTÓRICO DA CONVERSA**
═══════════════════════════════════════════════════════════════

${conversationHistory || 'Nenhuma mensagem anterior.'}

═══════════════════════════════════════════════════════════════

**Nova pergunta do usuário**: ${userQuery}

**Sua resposta**:`;

    const payload = {
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: chatbotConfig.aiSettings.temperature,
        maxOutputTokens: chatbotConfig.aiSettings.maxTokens,
        topK: 40,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    const delays = [1000, 2000, 4000];

    for (const endpoint of endpoints) {
      console.log(`Tentando endpoint: ${endpoint.label}`);
      console.log(`URL: ${endpoint.url.split('?')[0]}`);
      
      for (let i = 0; i <= delays.length; i++) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          console.log(`[${endpoint.label}] Status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) {
              console.error('Resposta sem conteúdo:', data);
              throw new Error('Resposta vazia da API');
            }
            
            console.log(`✅ Sucesso com ${endpoint.label}`);
            return text;
          }

          // Log da resposta de erro
          const errorText = await response.text();
          console.error(`❌ Erro ${response.status} (${endpoint.label}):`, errorText.substring(0, 200));
          
          if (response.status !== 429 && response.status < 500) {
            try {
              const err = JSON.parse(errorText);
              throw new Error(err.error?.message || `Status ${response.status}`);
            } catch {
              throw new Error(`Status ${response.status}: ${errorText.substring(0, 100)}`);
            }
          }

          console.log(`Tentativa ${i + 1} falhou (${endpoint.label}). Status: ${response.status}`);
          
        } catch (error) {
          console.error(`Erro na tentativa ${i + 1} (${endpoint.label}):`, error.message);
          if (i === delays.length) {
            console.warn(`Endpoint ${endpoint.label} esgotou tentativas (${delays.length + 1} tentativas), tentando próximo...`);
            break;
          }
        }

        if (i < delays.length) {
          console.log(`Aguardando ${delays[i]}ms antes de tentar novamente...`);
          await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
      }
    }

    throw new Error('Falha em todos os endpoints Gemini. Verifique o Console (F12) para detalhes.');
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMessage = {
      role: 'user',
      content: userText,
      timestamp: new Date(),
      sessionId
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Salvar mensagem do usuário no histórico
    if (currentUser) {
      await saveChatMessage(currentUser.uid, userMessage);
    }

    try {
      // Detectar comandos antes de chamar a IA
      const command = detectCommand(userText);
      let botResponse = '';

      if (command) {
        console.log('Comando detectado:', command);
        
        // Executar comando
        const commandResult = await executeCommand(command, {
          navigate,
          currentUser: userProfile,
          onCreateProject: null, // Implementar se necessário
          onSearch: (term) => console.log('Buscar:', term),
          onAnalyze: async (target) => {
            if (target === 'project') {
              const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
              // Pegar dados do projeto atual do contexto (se disponível)
              return "Para analisar um projeto, navegue até ele primeiro.";
            }
            return "Análise não disponível no momento.";
          },
          onSummarize: async () => {
            return "Para resumir um documento, navegue até o arquivo primeiro e use o botão 'Resumir'.";
          }
        });

        botResponse = commandResult || await callGeminiWithRetry(userText, buildSystemPrompt());
      } else {
        // Chamada normal para a IA
        botResponse = await callGeminiWithRetry(userText, buildSystemPrompt());
      }

      // Detectar comandos de navegação na resposta da IA
      const navigateMatch = botResponse.match(/\[NAVIGATE:(.*?)\]/);
      if (navigateMatch) {
        const path = navigateMatch[1];
        botResponse = botResponse.replace(/\[NAVIGATE:.*?\]/g, '').trim();
        setTimeout(() => {
          navigate(path);
          setIsOpen(false);
        }, 1500);
      }

      const assistantMessage = {
        role: 'assistant',
        content: botResponse.trim(),
        timestamp: new Date(),
        sessionId
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Salvar resposta da IA no histórico
      if (currentUser) {
        await saveChatMessage(currentUser.uid, assistantMessage);
      }

    } catch (error) {
      console.error('Erro no chatbot:', error);
      console.error('Detalhes do erro:', error.message);
      
      // Mensagem de erro mais detalhada durante desenvolvimento
      const errorDetail = error.message || 'Erro desconhecido';
      const detailedMessage = `${chatbotConfig.messages.errorMessage}\n\n[DEBUG] Erro: ${errorDetail}`;
      
      const errorMessage = {
        role: 'assistant',
        content: import.meta.env.DEV ? detailedMessage : chatbotConfig.messages.errorMessage,
        timestamp: new Date(),
        sessionId
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!currentUser) return;
    if (confirm('Deseja limpar o histórico de conversas?')) {
      await clearOldChatHistory(currentUser.uid, 0); // Limpar tudo
      setMessages([{
        role: 'assistant',
        content: chatbotConfig.messages.welcomeMessage,
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = chatbotConfig.quickActions;

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-white hover:bg-gray-50 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group p-2 border-2 border-[#57B952]"
          title="Conversar com Nora (assistente virtual)"
        >
          <img src="/img/Simbolo.png" alt="Nora" className="w-full h-full object-contain" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-20 right-6 z-50 bg-white shadow-2xl rounded-2xl border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden ${isMinimized ? 'h-16 w-72' : 'h-[600px] w-[380px] sm:w-[420px]'}`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#57B952] to-[#469e41] p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-white/30 p-1">
            <img src="/img/Simbolo.png" alt="Nora" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none">{chatbotConfig.systemName}</h3>
            {chatbotConfig.visual.showOnlineStatus && (
              <p className="text-[10px] text-green-100 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> {chatbotConfig.visual.onlineStatusText}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {currentUser && (
            <button
              onClick={clearHistory}
              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
              title="Limpar histórico"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 p-1'}`}>
                    {msg.role === 'user' ? <User size={16} /> : <img src="/img/Simbolo.png" alt="Nora" className="w-full h-full object-contain" />}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#57B952] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {chatbotConfig.visual.showTimestamp && (
                      <span className={`text-[9px] mt-2 block opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '75ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setInput(action.query)}
                className="whitespace-nowrap px-4 py-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-700 border border-gray-200 rounded-full text-xs font-medium transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={chatbotConfig.messages.inputPlaceholder}
                className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-700 placeholder:text-gray-400"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-[#57B952] hover:bg-green-600 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
              Powered by {chatbotConfig.assistantName} AI • Google Gemini 1.5 Flash
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Chatbot;
