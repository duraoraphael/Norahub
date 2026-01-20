# 🚨 URGENTE: Recuperar Acesso de Admin

Seu acesso de admin foi perdido porque as Firestore Rules agora verificam em **`usuarios`**, mas seus dados ainda estão em **`users`**.

## ✅ SOLUÇÃO RÁPIDA (3 passos):

### 1️⃣ Atualizar as Firestore Rules (AGORA!)

As regras foram atualizadas para verificar **ambas** as coleções.

**Cole no Firebase Console:**
- URL: https://console.firebase.google.com/project/norahub-2655f/firestore/rules
- Abra o arquivo [firestore.rules](firestore.rules)
- Copie TODO o conteúdo
- Cole no editor (Ctrl+A, depois Ctrl+V)
- Clique em **Publish**

Espere aparecer: "Rules published successfully"

---

### 2️⃣ Recarregue o Site

- Abra o site no navegador
- Pressione **F5** ou **Ctrl+Shift+R** (força recarregar)
- Você deve ter acesso de novo!

---

### 3️⃣ Migrar Seus Dados (Automático)

**Agora a página de Gestão de Usuários vai funcionar:**

1. Vá em **Gestão de Usuários**
2. Clique em **"Importar Usuários do Firebase"**
3. Confirme
4. Pronto! Todos os usuários (incluindo você como admin) serão migrados automaticamente

---

## Se ainda não tiver acesso:

### Opção A: Usar Script de Migração

1. Vá para a página de Gestão de Usuários
2. Abra o Console do Navegador (**F12**)
3. Copie TODO o código do arquivo: `SCRIPT_MIGRAR_ADMIN.js`
4. Cole no console
5. Pressione **Enter**
6. Espere a mensagem "✅ SUCESSO!"
7. O site recarrega automaticamente

---

### Opção B: Migração Manual (mais demorada)

1. Abra o Firebase Console: https://console.firebase.google.com
2. Projeto: `norahub-2655f`
3. Firestore Database
4. Collections
5. Procure pela coleção `users`
6. Copie manualmente seus dados para a coleção `usuarios`
7. Certifique-se que tem `funcao: 'admin'`

---

## ⚠️ Resumo do que aconteceu:

| Antes | Depois |
|-------|--------|
| Dados em: `users` | Dados devem estar em: `usuarios` |
| Regras verificam: apenas `users` | Regras verificam: `usuarios` + `users` |
| Admin sem acesso ❌ | Admin com acesso ✅ |

---

## 📋 Checklist de Recuperação:

- [ ] 1. Publicar as novas Firestore Rules
- [ ] 2. Recarregar o site (F5)
- [ ] 3. Verificar acesso de admin
- [ ] 4. Fazer migração dos usuários
- [ ] 5. Verificar se usuários aparecem em "Gestão de Usuários"

---

## Se der erro:

1. **"Permission denied"** → As regras não foram publicadas corretamente. Tente de novo.
2. **"No matching rules"** → Espere 30 segundos para as regras sincronizarem e recarregue.
3. **Não consegue colar no Firebase** → Tente limpar o cache (Ctrl+Shift+Delete)

---

## ✅ Tudo funcionando?

Depois de migrar todos os usuários, você pode desativar as Firestore Rules muito permissivas e usar versão mais restrita (peça ajuda para isso depois).

Por enquanto, foque em recuperar o acesso!
