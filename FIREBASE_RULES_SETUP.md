# 🔐 Configuração de Regras do Firebase

## ⚠️ ERRO: Missing or insufficient permissions

Esse erro acontece porque as regras de segurança do Firestore estão bloqueando as operações.

---

## 📋 Passo a Passo para Corrigir

### 1️⃣ Acesse o Console do Firebase
1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto **norahub-2655f**

### 2️⃣ Configure as Regras do Firestore

1. No menu lateral, clique em **"Firestore Database"**
2. Clique na aba **"Regras"** (Rules)
3. **COPIE E COLE** o conteúdo do arquivo `firestore.rules` deste projeto
4. Clique em **"Publicar"** (Publish)

**Atalho direto:**
https://console.firebase.google.com/project/norahub-2655f/firestore/rules

### 3️⃣ Configure as Regras do Storage

1. No menu lateral, clique em **"Storage"**
2. Clique na aba **"Regras"** (Rules)
3. Cole as regras abaixo:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    match /projetos/{projectId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && 
                     request.resource.size < 10 * 1024 * 1024; // Máx 10MB
    }
    
    match /perfis/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() && 
                     request.auth.uid == userId &&
                     request.resource.size < 5 * 1024 * 1024; // Máx 5MB
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn();
    }
  }
}
```

4. Clique em **"Publicar"** (Publish)

**Atalho direto:**
https://console.firebase.google.com/project/norahub-2655f/storage/rules

---

## 🎯 O que as Regras Permitem

### Firestore Database:

#### ✅ **Projetos** (`/projetos/{projectId}`)
- **Ler**: Todos os usuários autenticados
- **Criar**: Admin e gerentes
- **Atualizar**: **TODOS os usuários autenticados** (para respostas de formulários)
- **Deletar**: Apenas admin

#### ✅ **Usuários** (`/usuarios/{userId}`)
- **Ler**: Todos os usuários autenticados
- **Criar**: O próprio usuário
- **Atualizar**: O próprio usuário, admin ou gerentes
- **Deletar**: Apenas admin

#### ✅ **Notificações** (`/notifications/{notificationId}`)
- **Ler**: Apenas as próprias notificações
- **Criar**: Todos os usuários autenticados
- **Atualizar**: Apenas as próprias (para marcar como lida)
- **Deletar**: Apenas admin

#### ✅ **Cargos** (`/cargos/{cargoId}`)
- **Ler**: Todos os usuários autenticados
- **Criar/Atualizar/Deletar**: Apenas admin

### Storage:

#### ✅ **Projetos** (`/projetos/{projectId}/`)
- **Ler**: Todos os usuários autenticados
- **Upload**: Todos os usuários autenticados (máx 10MB)

#### ✅ **Perfis** (`/perfis/{userId}/`)
- **Ler**: Todos (público)
- **Upload**: Apenas o próprio usuário (máx 5MB)

---

## 🚨 Solução TEMPORÁRIA (Apenas para Desenvolvimento)

**⚠️ NÃO USE EM PRODUÇÃO!**

Se precisar testar rapidamente, pode usar estas regras abertas:

### Firestore (TEMPORÁRIO):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage (TEMPORÁRIO):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ IMPORTANTE:** Essas regras permitem que QUALQUER usuário autenticado faça QUALQUER coisa. Use apenas para testes!

---

## ✅ Verificação

Após configurar as regras:

1. **Limpe o cache do navegador** (Ctrl + Shift + Delete)
2. **Recarregue a página** (Ctrl + F5)
3. **Teste enviar uma resposta de formulário**

Se o erro persistir:
- Verifique no console do Firebase se as regras foram publicadas
- Verifique se o usuário está autenticado (currentUser não é null)
- Abra o DevTools (F12) e verifique o erro exato no console

---

## 📧 Suporte

Se ainda tiver problemas, verifique:
1. Console do navegador (F12) → Aba "Console"
2. Firebase Console → Firestore → Aba "Uso" (para ver tentativas bloqueadas)
3. Se o usuário tem o campo `funcao` definido na coleção `usuarios`

---

## 📝 Notas Importantes

- As regras do Firebase são **sempre verificadas no servidor**
- Mesmo que você tenha permissões no código, o Firebase bloqueia no servidor
- A regra `allow update: if isSignedIn();` em projetos **é necessária** para formulários funcionarem
- Usuários sem a propriedade `funcao` podem ter problemas - certifique-se de que todos têm

---

**Criado em:** 16/12/2025  
**Projeto:** NoraHub  
**Firebase Project ID:** norahub-2655f
