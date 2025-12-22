# 📝 Guia de Configuração do Chatbot NoraHub

## 🎯 Visão Geral

O chatbot agora é totalmente configurável através do arquivo **`src/config/chatbotConfig.js`**. Você pode personalizar o tom, estilo, mensagens e comportamento sem precisar editar o código do componente.

---

## 🔧 Como Configurar

### 1. Abra o arquivo de configuração

Localize o arquivo: **`src/config/chatbotConfig.js`**

### 2. Edite as configurações desejadas

Todas as configurações estão documentadas no próprio arquivo. Veja as seções principais:

---

## 📋 Seções de Configuração

### 🎯 CONFIGURAÇÕES GERAIS

```javascript
assistantName: 'Nora',           // Nome da assistente
systemName: 'NoraHub',           // Nome do sistema
domain: 'www.norahub.com.br',    // Domínio
organization: 'Normatel/Petrobras', // Empresa
```

**Como usar:**
- Altere `assistantName` para mudar o nome da assistente virtual
- `systemName` aparece no cabeçalho do chat
- `organization` é mencionado nas respostas

---

### 💬 TOM E ESTILO DE COMUNICAÇÃO

```javascript
communicationStyle: {
  tone: 'profissional',          // 'formal' | 'profissional' | 'amigavel' | 'casual'
  formalityLevel: 4,             // 1-5 (5 = muito formal)
  useEmojis: false,              // true = usa emojis nas respostas
  maxEmojisPerMessage: 1,        // Quantidade máxima de emojis
  beObjective: true,             // true = respostas diretas e curtas
  maxResponseWords: 150,         // Limite de palavras por resposta
  useTechnicalLanguage: true,    // true = usa termos técnicos
  useGreetings: false,           // true = adiciona cumprimentos
}
```

**Exemplos de configuração:**

#### Chatbot Formal e Objetivo (Configuração Atual)
```javascript
tone: 'profissional',
formalityLevel: 4,
useEmojis: false,
beObjective: true,
maxResponseWords: 150,
useTechnicalLanguage: true,
useGreetings: false
```

Resultado: Respostas diretas, sem emojis, linguagem técnica.

#### Chatbot Amigável e Descontraído
```javascript
tone: 'amigavel',
formalityLevel: 2,
useEmojis: true,
maxEmojisPerMessage: 3,
beObjective: false,
maxResponseWords: 250,
useTechnicalLanguage: false,
useGreetings: true
```

Resultado: Respostas calorosas com emojis, linguagem simples.

#### Chatbot Extremamente Formal
```javascript
tone: 'formal',
formalityLevel: 5,
useEmojis: false,
beObjective: true,
maxResponseWords: 100,
useTechnicalLanguage: true,
useGreetings: false
```

Resultado: Respostas extremamente concisas e formais.

---

### 📝 MENSAGENS PERSONALIZÁVEIS

Você pode editar todas as mensagens do chatbot:

```javascript
messages: {
  welcomeMessage: `Bem-vindo ao NoraHub. Como posso auxiliá-lo?`,
  errorMessage: `Ocorreu um erro de conexão. Por favor, tente novamente.`,
  inputPlaceholder: 'Digite sua pergunta...',
  // ... outras mensagens
}
```

**Dica:** Use `\n\n` para quebras de linha nas mensagens.

---

### 🎬 AÇÕES RÁPIDAS

Personalize os botões de ações rápidas:

```javascript
quickActions: [
  { label: 'Criar Projeto', query: 'Como criar um novo projeto?' },
  { label: 'Upload de Arquivos', query: 'Como fazer upload de arquivos?' },
  // Adicione quantos quiser
]
```

**Como adicionar nova ação:**
```javascript
{ 
  label: 'Ver Relatórios',           // Texto do botão
  query: 'Como acessar relatórios?'  // Pergunta enviada ao clicar
}
```

---

### 🤖 COMPORTAMENTO DA IA

Configure parâmetros técnicos da IA:

```javascript
aiSettings: {
  temperature: 0.4,          // 0-1 (0=determinístico, 1=criativo)
  maxTokens: 800,            // Máximo de tokens de resposta
  historyContext: 4,         // Número de mensagens anteriores para contexto
  customInstructions: `...`  // Instruções personalizadas para a IA
}
```

**Ajustes recomendados:**

| Objetivo | Temperature | MaxTokens | HistoryContext |
|----------|-------------|-----------|----------------|
| Respostas precisas e técnicas | 0.3-0.5 | 600-800 | 3-4 |
| Respostas criativas | 0.7-0.9 | 1000-1500 | 5-6 |
| Respostas muito curtas | 0.2-0.4 | 400-600 | 2-3 |

---

### 🎨 PERSONALIZAÇÃO VISUAL

```javascript
visual: {
  primaryColor: '#57B952',        // Cor principal (hex)
  showOnlineStatus: true,         // Mostrar "Disponível"
  onlineStatusText: 'Disponível', // Texto do status
  showTimestamp: true,            // Mostrar horário nas mensagens
  position: 'bottom-right',       // Posição do chat
  floatingIconSize: 64,           // Tamanho do ícone (pixels)
}
```

**Posições disponíveis:** `'bottom-right'` | `'bottom-left'` | `'top-right'` | `'top-left'`

---

### ⚙️ RECURSOS AVANÇADOS

```javascript
features: {
  allowAutoNavigation: true,      // Permitir navegação automática
  roleBasedResponses: true,       // Adaptar respostas por cargo
  persistHistory: false,          // Salvar histórico entre sessões
  suggestRelatedActions: true,    // Sugerir ações relacionadas
  allowFileUpload: false,         // Permitir upload via chat
}
```

---

## 🚀 Exemplos Práticos de Configurações

### Exemplo 1: Chatbot para Ambiente Corporativo Formal

```javascript
communicationStyle: {
  tone: 'formal',
  formalityLevel: 5,
  useEmojis: false,
  beObjective: true,
  maxResponseWords: 100,
  useTechnicalLanguage: true,
  useGreetings: false,
},
messages: {
  welcomeMessage: `Assistente Virtual NoraHub.\n\nSelecione sua solicitação.`,
  inputPlaceholder: 'Digite sua consulta...',
},
aiSettings: {
  temperature: 0.3,
  maxTokens: 600,
  historyContext: 3,
}
```

### Exemplo 2: Chatbot Amigável para Suporte

```javascript
communicationStyle: {
  tone: 'amigavel',
  formalityLevel: 2,
  useEmojis: true,
  maxEmojisPerMessage: 2,
  beObjective: false,
  maxResponseWords: 200,
  useTechnicalLanguage: false,
  useGreetings: true,
},
messages: {
  welcomeMessage: `Olá! 👋 Sou a Nora e estou aqui para ajudar!\n\nO que você precisa hoje?`,
  inputPlaceholder: 'Faça sua pergunta aqui...',
},
aiSettings: {
  temperature: 0.7,
  maxTokens: 1000,
  historyContext: 6,
}
```

### Exemplo 3: Chatbot Técnico e Conciso

```javascript
communicationStyle: {
  tone: 'profissional',
  formalityLevel: 4,
  useEmojis: false,
  beObjective: true,
  maxResponseWords: 120,
  useTechnicalLanguage: true,
  useGreetings: false,
},
aiSettings: {
  temperature: 0.4,
  maxTokens: 700,
  historyContext: 4,
  customInstructions: `Forneça instruções técnicas precisas.
  
FORMATO DE RESPOSTA:
1. Identifique a solicitação
2. Liste passos numerados (máx 5)
3. Indique comandos exatos
4. Confirme conclusão

Evite explicações desnecessárias.`,
}
```

---

## 📊 Comparação de Configurações

| Aspecto | Formal | Profissional (Atual) | Amigável |
|---------|--------|---------------------|----------|
| Tom | Institucional | Objetivo | Caloroso |
| Emojis | Não | Não | Sim (1-3) |
| Formalidade | 5/5 | 4/5 | 2/5 |
| Tamanho resposta | 80-100 palavras | 120-150 palavras | 180-250 palavras |
| Cumprimentos | Não | Não | Sim |
| Linguagem técnica | Sim | Sim | Não |

---

## ✅ Checklist Pós-Configuração

Após editar o arquivo de configuração:

1. ✅ Salve o arquivo `chatbotConfig.js`
2. ✅ Recarregue a aplicação no navegador (F5)
3. ✅ Abra o chatbot e teste a mensagem de boas-vindas
4. ✅ Faça uma pergunta para verificar o tom das respostas
5. ✅ Verifique se os botões de ações rápidas estão corretos
6. ✅ Teste a navegação automática (se habilitada)

---

## 🔍 Dicas de Uso

### Para Respostas Mais Curtas
- Diminua `maxResponseWords` (ex: 80-100)
- Aumente `formalityLevel` (4-5)
- Defina `beObjective: true`
- Reduza `maxTokens` (500-700)

### Para Respostas Mais Detalhadas
- Aumente `maxResponseWords` (ex: 200-300)
- Diminua `formalityLevel` (2-3)
- Defina `beObjective: false`
- Aumente `maxTokens` (1000-1500)

### Para Tom Mais Profissional
- `tone: 'profissional'` ou `'formal'`
- `useEmojis: false`
- `useTechnicalLanguage: true`
- `formalityLevel: 4-5`

### Para Tom Mais Casual
- `tone: 'amigavel'` ou `'casual'`
- `useEmojis: true`
- `useTechnicalLanguage: false`
- `formalityLevel: 1-2`

---

## 🛠️ Solução de Problemas

### O chatbot não está usando as configurações

**Solução:** Certifique-se de que salvou o arquivo e recarregou a página.

### As respostas ainda estão muito longas

**Solução:** Reduza `maxResponseWords` e `maxTokens`, e aumente `formalityLevel`.

### O chatbot não está formal o suficiente

**Solução:** 
```javascript
tone: 'formal',
formalityLevel: 5,
useEmojis: false,
beObjective: true,
useTechnicalLanguage: true
```

### Erro ao carregar o arquivo

**Solução:** Verifique se não há erros de sintaxe no arquivo `.js`. Todos os objetos devem estar fechados corretamente.

---

## 📚 Recursos Adicionais

- **Arquivo de configuração:** `src/config/chatbotConfig.js`
- **Componente do chatbot:** `src/components/Chatbot.jsx`
- **Documentação da API Gemini:** https://ai.google.dev/gemini-api/docs

---

## 💡 Sugestões de Personalização Avançada

### 1. Criar Múltiplos Perfis de Chatbot

Você pode criar múltiplas configurações e alternar entre elas:

```javascript
// Perfil Executivo
export const executiveConfig = {
  communicationStyle: { tone: 'formal', formalityLevel: 5, ... }
};

// Perfil Suporte
export const supportConfig = {
  communicationStyle: { tone: 'amigavel', formalityLevel: 2, ... }
};
```

### 2. Mensagens Específicas por Contexto

Edite `customInstructions` para adicionar regras específicas:

```javascript
customInstructions: `
REGRAS ESPECIAIS:
- Sempre mencione o número do ticket ao falar sobre suporte
- Inclua links para documentação quando aplicável
- Priorize soluções rápidas sobre explicações longas
`
```

### 3. Personalizar Ações Rápidas por Cargo

```javascript
quickActions: userRole === 'admin' ? [
  { label: 'Gerenciar Usuários', query: '...' }
] : [
  { label: 'Ver Meu Perfil', query: '...' }
]
```

---

## 📞 Suporte

Se precisar de ajuda adicional com a configuração do chatbot, consulte:
- Documentação técnica no arquivo `CHATBOT_CONFIG.md`
- Código-fonte em `src/components/Chatbot.jsx`

---

**Última atualização:** Dezembro 2025  
**Versão:** 2.0  
**Autor:** NoraHub Development Team
