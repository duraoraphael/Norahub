# 🚦 Informações sobre Rate Limiting da API Gemini

## ❗ O que é Erro 429?

**Erro 429 "Too Many Requests"** significa que você atingiu o limite de requisições permitido pela API do Google Gemini.

## 📊 Limites da API

### API Gratuita:
- **15 requisições por minuto (RPM)**
- **1.500 requisições por dia (RPD)**
- **32.000 tokens por minuto**

### API Paga (Pay-as-you-go):
- **360 RPM** (muito mais flexível)
- **30.000 RPD**
- **4.000.000 tokens por minuto**

## ✅ Soluções Implementadas

### 1. **Retry Automático com Backoff**
O sistema agora tenta automaticamente 3 vezes:
- 1ª tentativa: imediata
- 2ª tentativa: aguarda 1 segundo
- 3ª tentativa: aguarda 2 segundos
- 4ª tentativa: aguarda 4 segundos

### 2. **Fallback de Endpoints**
Se um modelo falhar, tenta outro automaticamente:
- `gemini-1.5-flash` (v1)
- `gemini-1.5-flash` (v1beta)

### 3. **Mensagens Claras**
Agora você vê mensagens específicas:
- ⏳ "Limite de requisições atingido. Aguarde 1 minuto."
- ✅ "Processando..." com feedback visual
- 🔄 Logs no console para debug

## 💡 Dicas para Evitar Erro 429

### ⏱️ Espaçamento
**Aguarde alguns segundos entre requisições:**
- ✅ Resumir → Aguardar 5s → OCR → Aguardar 5s → Analisar
- ❌ Clicar em RESUMIR 5 vezes seguidas

### 📦 Tamanho dos Arquivos
**Arquivos grandes consomem mais tokens:**
- PDFs: Limite de ~8.000 caracteres (truncado automaticamente)
- Planilhas: Limite de ~10.000 caracteres
- Imagens: Tamanho não importa muito (base64)

### 🕐 Horário
**API gratuita compartilha limite global:**
- Melhor desempenho: Madrugada
- Maior congestionamento: Horário comercial

### 🎯 Teste Gradual
**Não teste todas as funções de uma vez:**
1. Teste RESUMIR em 1 arquivo
2. Aguarde 10 segundos
3. Teste OCR em 1 imagem
4. Aguarde 10 segundos
5. Teste ANALISAR em 1 planilha

## 🔧 Verificar Status da API

### No Console do Navegador (F12):
```javascript
// Você verá logs como:
🔄 Tentando endpoint: https://...gemini-1.5-flash...
⏳ Rate limit atingido. Aguardando 1s antes de tentar novamente...
✅ Resumo gerado com sucesso!
❌ Falha no endpoint: API retornou 429
```

### Informações Úteis:
- ✅ **"API Key presente: true"** → Chave configurada
- ❌ **"API retornou 429"** → Limite atingido
- ❌ **"API retornou 403"** → Chave inválida
- ❌ **"API retornou 404"** → Modelo não encontrado

## 🚀 Upgrade para API Paga

Se você precisa processar muitos arquivos:

1. **Acesse:** https://ai.google.dev/pricing
2. **Ative:** Billing no Google Cloud
3. **Vantagens:**
   - 360 RPM (24x mais requisições)
   - Sem fila de espera
   - Prioridade no processamento
4. **Custo:** ~$0.50 por 1 milhão de tokens

## 📈 Monitoramento

### Quantas requisições você fez hoje?
**Não há contador oficial**, mas você pode:
1. Contar manualmente (cada botão clicado = 1 requisição)
2. Ver logs no Console (F12)
3. Aguardar mensagem de erro 429

### O que conta como requisição?
- ✅ Cada clique em "RESUMIR" = 1 requisição
- ✅ Cada clique em "OCR" = 1 requisição
- ✅ Cada clique em "ANALISAR" = 1 requisição
- ❌ Abrir arquivo = 0 requisições (só visualiza)
- ❌ Favoritar projeto = 0 requisições (só Firebase)

## ⚠️ Situações de Emergência

### Se o erro persistir depois de 1 minuto:

**1. Verifique a API Key:**
```env
VITE_GEMINI_API_KEY=AIzaSyBAmKqsF3yAWyQ4WHCCANW73TKOhB5Fk2M
```

**2. Teste a API manualmente:**
```bash
curl "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=SUA_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Olá"}]}]}'
```

**3. Verifique status do Google:**
https://status.cloud.google.com/

**4. Use arquivo menor:**
- PDF < 50 páginas
- Imagem < 5MB
- CSV < 1000 linhas

## 🎓 Boas Práticas

### ✅ Faça:
- Aguarde entre requisições
- Use arquivos pequenos para testes
- Verifique console antes de reportar erro
- Leia a mensagem de erro completa

### ❌ Evite:
- Clicar múltiplas vezes seguidas
- Processar arquivos enormes
- Ignorar mensagens de "aguarde"
- Fazer refresh repetido

## 📞 Suporte

Se o problema persistir:
1. Abra Console (F12)
2. Tire screenshot do erro
3. Copie logs completos
4. Informe:
   - Tipo de arquivo testado
   - Tamanho do arquivo
   - Horário do erro
   - Quantas tentativas fez

---

**Última atualização:** 22/12/2025  
**Sistema de Retry:** ✅ Ativo  
**Mensagens Amigáveis:** ✅ Implementado  
**Fallback Automático:** ✅ Funcionando
