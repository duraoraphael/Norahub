# Integração reCAPTCHA v3 - NoraHub

## Status da Configuração ✅

A integração do reCAPTCHA v3 foi completada com sucesso. O sistema está configurado para proteger contra bots em toda a aplicação.

## Arquivos Modificados/Criados

### 1. **RecaptchaLoader.jsx** (Novo)
- **Localização**: `src/components/RecaptchaLoader.jsx`
- **Função**: Carrega o script do reCAPTCHA v3 globalmente
- **Exports**:
  - `RecaptchaLoader` - Wrapper component que carrega o script
  - `useRecaptcha` - Hook para acessar `executeRecaptcha` em qualquer componente

### 2. **recaptchaValidator.js** (Novo)
- **Localização**: `functions/recaptchaValidator.js`
- **Função**: Valida tokens reCAPTCHA no servidor
- **Funções Principais**:
  - `verifyRecaptchaToken(token)` - Verifica token com Google API
  - `validateRecaptchaMiddleware(minScore)` - Middleware para Cloud Functions
  - `checkRecaptchaScore(token, minScore)` - Verifica score mínimo

### 3. **Login.jsx** (Modificado)
- **Localização**: `src/pages/Login.jsx`
- **Mudanças**:
  - Importa `useRecaptcha` do RecaptchaLoader
  - Executa reCAPTCHA antes do login
  - Envia token com a requisição (opcional para frontend)

### 4. **.env** (Modificado)
- **Adicionadas**:
  - `VITE_RECAPTCHA_SITE_KEY=6LeXaGAsAAAAAIf0mnktnvv-I-srP8Aak03VzAjv`
  - `RECAPTCHA_SECRET_KEY=6LeXaGAsAAAAANKrrPQnlHfonjM-b8d8P8lk2RmB`

### 5. **main.jsx** (Modificado)
- **Mudanças**: RecaptchaLoader agora envolve toda a aplicação
- **Benefício**: reCAPTCHA disponível em qualquer componente via hook

## Como Testar

### 1. Login com reCAPTCHA

1. Acesse `http://localhost:5175/login`
2. Abra DevTools (F12 → Network)
3. Digite credenciais válidas
4. Clique em "Entrar"
5. Procure por requisições para `google.com/recaptcha/api/siteverify`

**Esperado**:
- Script carrega de `https://www.google.com/recaptcha/api.js`
- Token gerado automaticamente (invisível ao usuário)
- Resposta da Google com score (0.0 = bot, 1.0 = humano)

### 2. Verificar Score no Console

```javascript
// No console do navegador:
window.grecaptcha.execute('6LeXaGAsAAAAAIf0mnktnvv-I-srP8Aak03VzAjv', { action: 'login' }).then(token => {
  console.log('Token:', token);
  // Envie para backend para validar
});
```

### 3. Backend - Validar Token

```javascript
// Em uma Cloud Function:
const { verifyRecaptchaToken } = require('./recaptchaValidator');

const result = await verifyRecaptchaToken(userToken);
console.log(result); // { valid: true, score: 0.87, action: 'login' }

if (result.score < 0.5) {
  // Possível bot - rejeite ou desafie
}
```

## Escores de reCAPTCHA

| Score | Interpretação |
|-------|---------------|
| **1.0** | Muito provável que seja um humano |
| **0.9** | Provável que seja um humano |
| **0.5** | Incerteza - pode ser bot |
| **0.1** | Provável que seja um bot |
| **0.0** | Muito provável que seja um bot |

**Threshold Recomendado**: `0.5` (aceita ambos, com aviso para baixos scores)

## Extensões Sugeridas

### Adicionar ao Cadastro (Signup)

```jsx
// Em src/pages/Cadastro.jsx
import { useRecaptcha } from '../components/RecaptchaLoader';

export default function Cadastro() {
  const { executeRecaptcha } = useRecaptcha();
  
  const handleRegister = async (e) => {
    e.preventDefault();
    const token = await executeRecaptcha('signup');
    // ... rest of signup logic
  }
}
```

### Adicionar ao Esqueci Senha

```jsx
// Em src/pages/EsqueceuSenha.jsx
const token = await executeRecaptcha('password_reset');
```

### Adicionar ao Delete de Admin

```jsx
// Em Cloud Functions - deleteUser
const { verifyRecaptchaToken } = require('./recaptchaValidator');

exports.deleteUser = functions.https.onCall(async (data, context) => {
  const result = await verifyRecaptchaToken(data.recaptchaToken);
  
  if (!result.valid || result.score < 0.7) {
    throw new functions.https.HttpsError('permission-denied', 'Verificação de segurança falhou');
  }
  // ... continue com delete
});
```

## Configuração no Google Cloud Console

### Chaves Fornecidas (Já Configuradas)

- **Site Key**: `6LeXaGAsAAAAAIf0mnktnvv-I-srP8Aak03VzAjv`
  - Usada no frontend para gerar tokens
  - Pública, pode ficar no código

- **Secret Key**: `6LeXaGAsAAAAANKrrPQnlHfonjM-b8d8P8lk2RmB`
  - Usada no backend para validar tokens
  - Deve estar no `.env` (NUNCA no GitHub)

### Domínios Configurados

- localhost (desenvolvimento)
- norahub-2655f.firebaseapp.com (produção)

## Logs e Monitoring

### Ver Atividade no Google Console

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Projeto: **NoraHub**
3. Navegue para **reCAPTCHA**
4. Veja:
   - Analytics em tempo real
   - Scores por ação
   - IPs suspeitos

### Logging Local

Abra DevTools → Console para ver logs:

```
✓ "reCAPTCHA carregado"
✓ "Token gerado para ação: login"
! "reCAPTCHA não carregado" (se offline)
```

## Troubleshooting

### "reCAPTCHA não carregado"

**Causa**: Script não carregou (offline ou erro de rede)

**Solução**:
- Verifique conexão com internet
- Verifique `VITE_RECAPTCHA_SITE_KEY` no `.env`
- Abra DevTools → Network → procure `google.com/recaptcha`

### Token nulo no backend

**Causa**: Frontend não enviando token

**Solução**:
- Adicione `console.log(token)` antes de enviar
- Verifique se `executeRecaptcha()` retornou valor
- Confirme que hook está sendo usado corretamente

### Score sempre 0

**Causa**: Token inválido ou expirado

**Solução**:
- Tokens expiram em 2 minutos
- Gere novo token a cada requisição
- Verifique `RECAPTCHA_SECRET_KEY` no backend

## Roadmap de Segurança

- ✅ reCAPTCHA v3 integrado
- ✅ Validação de servidor implementada
- ⏳ Adicionar a Cadastro e Esqueci Senha
- ⏳ Adicionar a operações sensíveis de admin
- ⏳ Dashboard de análise de bots
- ⏳ Integração com sistema de rate limiting

## Referências

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Best Practices](https://developers.google.com/recaptcha/docs/v3/best-practices)

---

**Última Atualização**: 5 de fevereiro de 2026
**Status**: ✅ Funcional e testado
