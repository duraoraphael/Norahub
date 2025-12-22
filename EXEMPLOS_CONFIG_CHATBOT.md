# 🎨 Exemplos Visuais de Configuração do Chatbot

## 📊 Configuração Atual (Formal e Objetivo)

### Como está configurado:
```javascript
communicationStyle: {
  tone: 'profissional',
  formalityLevel: 4,
  useEmojis: false,
  beObjective: true,
  maxResponseWords: 150,
  useTechnicalLanguage: true,
  useGreetings: false,
}
```

### Exemplo de conversa:

```
👤 Usuário: Como criar um projeto?

🤖 Nora: PROCEDIMENTO PARA CRIAÇÃO DE PROJETO:

1. Acesse a rota /selecao-projeto
2. Clique no botão "Novo Projeto" (canto superior direito)
3. Preencha os campos obrigatórios: Nome e Descrição
4. Selecione cor e ícone
5. Confirme com o botão "Salvar"

O projeto será criado e ficará disponível na lista principal.
```

---

## 😊 Exemplo: Configuração Amigável

### Configuração:
```javascript
communicationStyle: {
  tone: 'amigavel',
  formalityLevel: 2,
  useEmojis: true,
  maxEmojisPerMessage: 3,
  beObjective: false,
  maxResponseWords: 200,
  useTechnicalLanguage: false,
  useGreetings: true,
}

messages: {
  welcomeMessage: `Olá! 👋 Sou a Nora e estou super animada em te ajudar hoje! 

Posso te auxiliar com:
• Navegação pelo sistema
• Dúvidas sobre qualquer funcionalidade
• Upload de arquivos
• Criação de projetos e cards
• E muito mais!

O que você gostaria de fazer? 😊`,
}
```

### Exemplo de conversa:

```
👤 Usuário: Como criar um projeto?

🤖 Nora: Oba! 🎉 Vou te ajudar a criar um projeto novo! É bem simples:

1. Primeiro, vá para a página "Seleção de Projetos" 📁
2. Você vai ver um botão verde "Novo Projeto" no canto superior direito
3. Clique nele e preencha o nome do seu projeto e uma descrição legal
4. Escolha uma cor e um ícone que combinem com o projeto
5. Clica em "Salvar" e pronto! ✨

Seu projeto vai aparecer na lista e você já pode começar a adicionar cards nele! 
Quer que eu te mostre como adicionar cards também? 😊
```

---

## 🎯 Exemplo: Configuração Extremamente Formal

### Configuração:
```javascript
communicationStyle: {
  tone: 'formal',
  formalityLevel: 5,
  useEmojis: false,
  beObjective: true,
  maxResponseWords: 80,
  useTechnicalLanguage: true,
  useGreetings: false,
}

messages: {
  welcomeMessage: `Sistema de Assistência Virtual NoraHub.

Funcionalidades disponíveis:
- Consulta de procedimentos operacionais
- Orientação técnica
- Navegação entre módulos

Especifique sua solicitação.`,
  inputPlaceholder: 'Informe sua consulta',
}

aiSettings: {
  customInstructions: `Assistente virtual corporativa.

DIRETRIZES:
- Linguagem institucional
- Respostas objetivas
- Máximo de 80 palavras
- Nomenclatura técnica
- Sem cumprimentos ou informalidades

ESTRUTURA:
1. Confirme solicitação
2. Liste procedimento
3. Indique conclusão`,
}
```

### Exemplo de conversa:

```
👤 Usuário: Como criar um projeto?

🤖 Sistema: PROCEDIMENTO - CRIAÇÃO DE PROJETO

Requisitos:
1. Acesso à rota /selecao-projeto
2. Permissão de criação ativa

Etapas:
1. Selecione botão "Novo Projeto"
2. Informe: nome, descrição
3. Defina: cor, ícone
4. Execute: "Salvar"

Status: Procedimento concluído.
```

---

## 💼 Exemplo: Configuração Profissional Técnica

### Configuração:
```javascript
communicationStyle: {
  tone: 'profissional',
  formalityLevel: 4,
  useEmojis: false,
  beObjective: true,
  maxResponseWords: 120,
  useTechnicalLanguage: true,
  useGreetings: false,
}

messages: {
  welcomeMessage: `Assistente Técnica NoraHub.

Suporte disponível para:
• Operações do sistema
• Procedimentos técnicos
• Troubleshooting
• Navegação entre módulos

Digite sua solicitação.`,
}

quickActions: [
  { label: 'Criar Projeto', query: 'Procedimento para criação de projeto' },
  { label: 'Upload', query: 'Procedimento para upload de arquivo' },
  { label: 'Permissões', query: 'Verificar permissões do usuário' },
  { label: 'Troubleshoot', query: 'Resolver problema técnico' }
]
```

### Exemplo de conversa:

```
👤 Usuário: Como criar um projeto?

🤖 Assistente: PROCEDIMENTO: CRIAÇÃO DE PROJETO

PRÉ-REQUISITOS:
- Permissão de criação habilitada
- Sessão autenticada

PASSOS:
1. Navegue para /selecao-projeto
2. Ative botão "Novo Projeto" (superior direito)
3. Configure parâmetros:
   - Nome (obrigatório)
   - Descrição (obrigatório)
   - Cor/ícone (opcional)
4. Execute função "Salvar"

RESULTADO: Projeto criado e listado em /selecao-projeto

Necessita assistência adicional?
```

---

## 🌟 Comparação Visual

| Aspecto | Amigável 😊 | Profissional 💼 | Formal 🎯 |
|---------|-------------|-----------------|-----------|
| **Saudação** | "Olá! 👋 Sou a Nora..." | "Assistente Virtual NoraHub." | "Sistema de Assistência..." |
| **Emojis** | Sim (2-3) | Não | Não |
| **Tamanho** | 180-250 palavras | 120-150 palavras | 60-80 palavras |
| **Tom** | Caloroso e acolhedor | Direto e técnico | Institucional e conciso |
| **Exemplos** | "É bem simples!" | "Execute os seguintes passos" | "Procedimento:" |
| **Fechamento** | "Quer que eu ajude mais?" | "Operação concluída." | "Status: Concluído." |

---

## 📝 Guia de Escolha

### Use configuração AMIGÁVEL se:
- ✅ Usuários são iniciantes no sistema
- ✅ Precisa de suporte mais empático
- ✅ Quer reduzir barreiras de comunicação
- ✅ Público diversificado

### Use configuração PROFISSIONAL se:
- ✅ Usuários têm conhecimento técnico
- ✅ Precisa de respostas objetivas
- ✅ Ambiente corporativo padrão
- ✅ Equilíbrio entre formalidade e clareza

### Use configuração FORMAL se:
- ✅ Ambiente institucional rígido
- ✅ Documentação oficial
- ✅ Usuários preferem concisão máxima
- ✅ Necessita tom extremamente profissional

---

## 🔄 Como Alternar Entre Configurações

### Opção 1: Editar diretamente o arquivo

Abra `src/config/chatbotConfig.js` e modifique os valores.

### Opção 2: Copiar configuração pronta

Copie um dos exemplos acima e cole no arquivo de configuração.

### Exemplo de mudança rápida para Amigável:

```javascript
// Em src/config/chatbotConfig.js

// Altere apenas estas linhas:
communicationStyle: {
  tone: 'amigavel',           // era 'profissional'
  formalityLevel: 2,          // era 4
  useEmojis: true,            // era false
  maxEmojisPerMessage: 2,     // era 1
  beObjective: false,         // era true
  maxResponseWords: 200,      // era 150
  useTechnicalLanguage: false, // era true
  useGreetings: true,         // era false
}
```

Salve e recarregue a página!

---

## 🎬 Teste suas Configurações

Após fazer alterações, teste com estas perguntas:

1. **"Como criar um projeto?"** - Verifica tom e objetividade
2. **"Não entendi"** - Verifica mensagem de clarificação
3. **"Obrigado"** - Verifica como responde a agradecimentos
4. **"Me ajuda"** - Verifica proatividade

---

## 💡 Dicas Finais

1. **Comece gradualmente:** Faça uma mudança por vez e teste
2. **Considere seu público:** Pense em quem vai usar o sistema
3. **Mantenha consistência:** Não misture tons muito diferentes
4. **Teste extensivamente:** Peça feedback dos usuários reais
5. **Documente suas escolhas:** Anote por que escolheu cada configuração

---

**Configuração recomendada para a maioria dos casos corporativos:**

```javascript
tone: 'profissional',
formalityLevel: 4,
useEmojis: false,
beObjective: true,
maxResponseWords: 150,
useTechnicalLanguage: true,
useGreetings: false
```

Esta é a configuração atual e oferece o melhor equilíbrio entre profissionalismo e clareza! 🎯
