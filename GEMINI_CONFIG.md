# 🧠 Configuração do Gemini Pro - NoraHub

## 🔑 Como Obter sua Chave da API Gemini (GRATUITA)

### Passo 1: Acessar Google AI Studio
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. É **100% GRATUITO** - sem cartão de crédito!

### Passo 2: Criar Chave da API
1. Clique em "**Get API Key**" ou "**Create API Key**"
2. Escolha o projeto ou crie um novo
3. Clique em "**Create API Key in new project**"
4. Copie a chave gerada (começa com `AIza...`)

### Passo 3: Configurar no Sistema

Abra o arquivo: `src/components/Chatbot.jsx`

Na **linha ~495**, substitua a chave pela sua:

```javascript
const API_KEY = 'SUA_CHAVE_AQUI'; // Substitua pela sua chave
```

Por exemplo:
```javascript
const API_KEY = 'AIzaSyBNT9Y3mZFqW8rH5vXkJ4pL2nM6oQ7sR8t';
```

---

## ⚡ Recursos do Gemini Pro

O chatbot agora usa **Gemini Pro** da Google e pode:

✅ **Contexto maior** - Lembra de mais mensagens anteriores  
✅ **Respostas mais naturais** - Linguagem fluente e empática  
✅ **Melhor compreensão** - Entende instruções complexas  
✅ **1024 tokens de resposta** - Respostas mais completas  
✅ **Multimodal pronto** - Pode processar imagens no futuro  

---

## 💰 Limites Gratuitos do Gemini Pro

- **15 requisições por minuto**
- **1 milhão de tokens por mês** (GRÁTIS!)
- **32k tokens de contexto**
- Perfeito para o NoraHub! 🚀

---

## 🔧 Configurações Aplicadas

```javascript
generationConfig: {
  temperature: 0.7,      // Criatividade moderada
  topK: 40,              // Diversidade de respostas
  topP: 0.95,            // Qualidade das respostas
  maxOutputTokens: 1024  // Respostas mais longas
}
```

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: 
- Não compartilhe sua chave da API publicamente
- Não commite a chave no Git
- Em produção, use variáveis de ambiente

### Usando Variável de Ambiente (Recomendado):

1. Crie arquivo `.env` na raiz:
```
VITE_GEMINI_API_KEY=sua_chave_aqui
```

2. No `Chatbot.jsx`:
```javascript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
```

3. Adicione `.env` no `.gitignore`:
```
.env
```

---

## 📊 Comparação: Gemini vs Groq

| Característica | Gemini Pro ✅ | Groq |
|---------------|--------------|------|
| **Velocidade** | Rápido | Muito rápido |
| **Contexto** | 32k tokens | 8k tokens |
| **Resposta** | 1024 tokens | 500 tokens |
| **Naturalidade** | Excelente | Boa |
| **Gratuito** | 1M tokens/mês | 6k tokens/min |
| **Multimodal** | Sim | Não |

---

## 🆘 Troubleshooting

**Erro 400**: Chave da API inválida
- Verifique se copiou corretamente
- Gere nova chave no AI Studio

**Erro 429**: Limite de requisições
- Aguarde 1 minuto
- Você fez mais de 15 requisições no último minuto

**Erro 500**: Problema no servidor Google
- Tente novamente em alguns segundos
- Geralmente é temporário

---

## 📞 Links Úteis

- **AI Studio**: https://makersuite.google.com
- **Documentação**: https://ai.google.dev/docs
- **Preços**: https://ai.google.dev/pricing

---

**Migração concluída!** 🎉  
O NoraHub agora usa Gemini Pro para respostas mais inteligentes!
