# 🤖 Configuração do Chatbot IA - NoraHub

## 📝 Como Obter sua Chave da API Groq (GRATUITA)

### Passo 1: Criar Conta na Groq
1. Acesse: https://console.groq.com
2. Clique em "Sign Up" (Cadastrar)
3. Use seu email ou GitHub para criar conta
4. É **100% GRATUITO** - não precisa cartão de crédito!

### Passo 2: Gerar Chave da API
1. Após fazer login, vá em "API Keys" no menu
2. Clique em "Create API Key"
3. Dê um nome (ex: "NoraHub Chatbot")
4. Copie a chave gerada (começa com `gsk_...`)

### Passo 3: Configurar no Sistema

Abra o arquivo: `src/components/Chatbot.jsx`

Na **linha 110**, substitua a chave pela sua:

```javascript
'Authorization': `Bearer SUA_CHAVE_AQUI`
```

Por exemplo:
```javascript
'Authorization': `Bearer gsk_abc123xyz456...`
```

---

## ⚡ Recursos da IA

O chatbot usa **Llama 3.1 8B** da Groq e pode:

✅ **Responder dúvidas** sobre qualquer funcionalidade do sistema  
✅ **Navegar** automaticamente para páginas específicas  
✅ **Contextualizar** respostas baseado na página atual  
✅ **Adaptar** explicações ao cargo do usuário (admin, gerente, usuário)  
✅ **Entender** intenções e fornecer passos detalhados  

---

## 🎯 Exemplos de Perguntas

Os usuários podem perguntar coisas como:

- "Como faço para criar um novo projeto?"
- "Onde está o dashboard?"
- "Como faço upload de arquivos?"
- "O que são cards?"
- "Como adiciono um formulário?"
- "Quero ver minhas notificações"
- "Me leve para o perfil"
- "Como funciona a busca global?"

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- Não compartilhe sua chave da API publicamente
- Não commite a chave no Git
- Em produção, use variáveis de ambiente

### Usando Variável de Ambiente (Recomendado):

1. Crie arquivo `.env` na raiz do projeto:
```
VITE_GROQ_API_KEY=sua_chave_aqui
```

2. No `Chatbot.jsx`, linha 110:
```javascript
'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
```

3. Adicione `.env` no `.gitignore`:
```
.env
```

---

## 💰 Limites Gratuitos da Groq

- **30 requisições por minuto**
- **6.000 tokens por minuto**
- Completamente gratuito para sempre!

Perfeito para o NoraHub! 🚀

---

## 🛠️ Personalizar Comportamento

Para mudar o comportamento da Nora, edite a função `buildSystemPrompt()` no arquivo `Chatbot.jsx` (linha 56).

Você pode:
- Mudar o tom de voz
- Adicionar mais funcionalidades
- Personalizar respostas
- Adicionar comandos especiais

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se a chave da API está correta
2. Abra o console do navegador (F12) para ver erros
3. Confirme que tem conexão com internet
4. Teste a chave diretamente: https://console.groq.com

---

**Criado para o NoraHub** 🌟  
Sistema de Gestão de Projetos Normatel/Petrobras
