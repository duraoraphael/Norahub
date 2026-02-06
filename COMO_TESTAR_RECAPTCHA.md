# 🔍 Como Verificar se o reCAPTCHA Está Ativo

## Método 1: DevTools - Network (Mais Confiável)

### Passo a Passo:

1. **Abra a página de login**: `http://localhost:5175/login`

2. **Abra o DevTools**: 
   - Pressione `F12` ou
   - Clique direito → "Inspecionar"

3. **Vá para a aba Network**:
   - Clique em "Network" (Rede)
   - ✅ Certifique-se que está gravando (botão vermelho ativo)

4. **Recarregue a página**: `Ctrl + R`

5. **Procure por**:
   - Digite `recaptcha` no filtro de busca
   - Você deve ver:
     - ✅ `api.js` (script do Google reCAPTCHA)
     - ✅ `anchor` ou `reload` (validações)

6. **Faça login**:
   - Digite email e senha
   - Clique em "Entrar"
   - Procure por: `siteverify` ou `api2/userverify`
   - Status: **200 OK** = reCAPTCHA funcionando ✅

### O Que Você Verá:

```
✅ api.js?render=6LeXa... (200 OK)
✅ recaptcha__pt_BR.js (200 OK)
✅ anchor?... (200 OK)
```

---

## Método 2: Console do Navegador

### Passo a Passo:

1. **Abra o Console**:
   - DevTools → Console (ou `F12` → Console)

2. **Digite e execute**:

```javascript
// Verificar se reCAPTCHA carregou
console.log('reCAPTCHA disponível:', typeof window.grecaptcha !== 'undefined');

// Verificar a versão
console.log('grecaptcha:', window.grecaptcha);
```

**Esperado**: 
```
reCAPTCHA disponível: true
grecaptcha: {execute: ƒ, render: ƒ, reset: ƒ, getResponse: ƒ, ready: ƒ}
```

3. **Gerar token manualmente**:

```javascript
// Executar reCAPTCHA manualmente
window.grecaptcha.execute('6LeXaGAsAAAAAIf0mnktnvv-I-srP8Aak03VzAjv', { 
  action: 'test' 
}).then(token => {
  console.log('✅ Token gerado:', token.substring(0, 50) + '...');
  console.log('Tamanho do token:', token.length, 'caracteres');
}).catch(err => {
  console.error('❌ Erro:', err);
});
```

**Esperado**:
```
✅ Token gerado: 03AIIukzjJz8Fo5xB9h7K2m3Ln4Qp1Rs7Tv9Wx...
Tamanho do token: 350-500 caracteres
```

---

## Método 3: Verificar Script no HTML

### Passo a Passo:

1. **DevTools → Elements** (ou `Ctrl + Shift + C`)

2. **Procure no `<head>`**:
   - `Ctrl + F` para buscar
   - Digite: `recaptcha`

3. **Deve encontrar**:

```html
<script src="https://www.google.com/recaptcha/api.js?render=6LeXa..." async defer></script>
```

✅ Se encontrou = reCAPTCHA carregado

---

## Método 4: Verificar na Página de Login

### Visual:

1. **Nota de Crédito**:
   - Canto inferior direito (muito discreto)
   - Texto: "Protected by reCAPTCHA"
   - ✅ Se aparecer = reCAPTCHA ativo

2. **Badge Oculto**:
   - O badge branco foi ocultado por CSS
   - Mas você pode verificar se existe:

```javascript
// Console do navegador
const badge = document.querySelector('.grecaptcha-badge');
console.log('Badge existe:', badge !== null);
console.log('Badge visível:', badge?.style.visibility);
```

**Esperado**:
```
Badge existe: true
Badge visível: hidden
```

---

## Método 5: Teste Real de Login

### Passo a Passo Completo:

1. **Abra DevTools → Console**

2. **Adicione um listener temporário**:

```javascript
// Interceptar execução do reCAPTCHA
const originalExecute = window.grecaptcha?.execute;
if (originalExecute) {
  window.grecaptcha.execute = function(...args) {
    console.log('🔒 reCAPTCHA EXECUTADO!');
    console.log('Ação:', args[1]?.action);
    console.log('Timestamp:', new Date().toLocaleTimeString());
    return originalExecute.apply(this, args).then(token => {
      console.log('✅ Token recebido:', token.substring(0, 30) + '...');
      return token;
    });
  };
  console.log('✅ Listener de reCAPTCHA ativado');
}
```

3. **Faça login normalmente**

4. **Veja no Console**:

```
🔒 reCAPTCHA EXECUTADO!
Ação: login
Timestamp: 09:30:45
✅ Token recebido: 03AIIukzjJz8Fo5xB9h7K2m3...
```

---

## Método 6: Verificar Código no Login.jsx

### Confirmar Integração:

Abra o arquivo: `src/pages/Login.jsx`

Procure por:

```javascript
// Importação
import { useRecaptcha } from '../components/RecaptchaLoader';

// No componente
const { executeRecaptcha } = useRecaptcha();

// No handleSubmit
const recaptchaToken = await executeRecaptcha('login');
```

✅ Se está presente = Integrado corretamente

---

## Método 7: Google reCAPTCHA Admin Console

### Ver Analytics Real:

1. **Acesse**: [Google Cloud Console](https://console.cloud.google.com/)

2. **Vá para**: reCAPTCHA Admin Console

3. **Selecione sua chave**: 6LeXaGAsAAAAAIf0mnktnvv-I-srP8Aak03VzAjv

4. **Visualize**:
   - Gráfico de requisições
   - Scores médios
   - Ações executadas
   - IPs suspeitos

**Se houver dados** = reCAPTCHA funcionando em produção

---

## ⚡ Teste Rápido (30 segundos)

### Copie e cole no Console do navegador:

```javascript
(async function testarRecaptcha() {
  console.log('🔍 TESTE RÁPIDO DO reCAPTCHA\n');
  
  // 1. Verificar disponibilidade
  const disponivel = typeof window.grecaptcha !== 'undefined';
  console.log('1️⃣ reCAPTCHA disponível:', disponivel ? '✅' : '❌');
  
  if (!disponivel) {
    console.log('❌ reCAPTCHA não carregou. Verifique a conexão.');
    return;
  }
  
  // 2. Verificar configuração
  const siteKey = '6LeXaGAsAAAAAIf0mnktnvv-I-srP8Aak03VzAjv';
  console.log('2️⃣ Site Key configurada:', siteKey.substring(0, 20) + '...');
  
  // 3. Executar teste
  console.log('3️⃣ Gerando token de teste...');
  try {
    const token = await window.grecaptcha.execute(siteKey, { action: 'test' });
    console.log('✅ Token gerado com sucesso!');
    console.log('   - Tamanho:', token.length, 'caracteres');
    console.log('   - Primeiros 50:', token.substring(0, 50) + '...');
    console.log('\n🎉 reCAPTCHA ESTÁ FUNCIONANDO PERFEITAMENTE!\n');
  } catch (erro) {
    console.error('❌ Erro ao gerar token:', erro);
  }
})();
```

### Resultado Esperado:

```
🔍 TESTE RÁPIDO DO reCAPTCHA

1️⃣ reCAPTCHA disponível: ✅
2️⃣ Site Key configurada: 6LeXaGAsAAAAAIf0mnk...
3️⃣ Gerando token de teste...
✅ Token gerado com sucesso!
   - Tamanho: 450 caracteres
   - Primeiros 50: 03AIIukzjJz8Fo5xB9h7K2m3Ln4Qp1Rs7Tv9WxYz...

🎉 reCAPTCHA ESTÁ FUNCIONANDO PERFEITAMENTE!
```

---

## 🚨 Sinais de Problema

### ❌ reCAPTCHA NÃO está funcionando se:

1. **Console mostra**:
   ```
   reCAPTCHA não carregado
   grecaptcha is not defined
   ```

2. **Network mostra**:
   ```
   api.js - Failed to load
   Status: 0 (CORS error)
   ```

3. **Teste manual retorna**:
   ```
   ❌ Erro: grecaptcha is not defined
   ```

### ✅ reCAPTCHA ESTÁ funcionando se:

1. ✅ Script `api.js` carrega (Network)
2. ✅ `window.grecaptcha` existe (Console)
3. ✅ Token é gerado ao fazer login
4. ✅ Nota "Protected by reCAPTCHA" aparece

---

## 📊 Resumo - Checklist

Use este checklist para verificar:

- [ ] DevTools → Network → Filtro "recaptcha" → `api.js` carregou
- [ ] Console → `window.grecaptcha` existe
- [ ] Console → Teste manual gera token
- [ ] Login funciona normalmente
- [ ] Sem erros no console
- [ ] Nota "Protected by reCAPTCHA" visível (canto inferior)

**Se todos marcados** = ✅ reCAPTCHA 100% funcional

---

## 💡 Dica Final

O reCAPTCHA v3 é **invisível**. Usuários não veem nem interagem com ele. 

**Isso é normal e esperado!**

A única forma de saber que está ativo é através das ferramentas de desenvolvedor.

---

**Última atualização**: 5 de fevereiro de 2026
