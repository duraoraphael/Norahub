# Instruções para Deploy da Cloud Function (Exclusão Completa)

## O que foi implementado

A exclusão de usuário atualmente remove o perfil do **Firestore**, o que já impede o login funcional do usuário no sistema.

## Para excluir também do Firebase Authentication

Criei os arquivos necessários em `/functions`:
- `index.js` - Cloud Function que deleta Auth + Firestore
- `package.json` - Dependências necessárias

### Como fazer o deploy (fora da rede corporativa):

1. Instale o Firebase CLI globalmente:
```bash
npm install -g firebase-tools
```

2. Faça login no Firebase:
```bash
firebase login
```

3. Entre na pasta functions e instale as dependências:
```bash
cd functions
npm install
```

4. Volte à raiz e faça o deploy:
```bash
cd ..
firebase deploy --only functions
```

5. Após o deploy, descomente o código no `AdminDashboard.jsx` que usa a Cloud Function (está comentado como referência).

## Nota Importante

Por enquanto, a exclusão remove apenas o documento do Firestore (perfil do usuário). Isso já é suficiente para:
- Impedir que o usuário faça login
- Remover todos os dados do perfil
- O usuário não consegue acessar o sistema

A conta de autenticação permanece no Firebase Auth, mas sem perfil associado não tem acesso ao sistema.

## Problemas de Rede Corporativa

Se você estiver em uma rede corporativa (Petrobras), pode enfrentar:
- Certificados auto-assinados (SELF_SIGNED_CERT_IN_CHAIN)
- Bloqueio do NPM registry (403 Forbidden)
- Proxy bloqueando conexões

**Solução:** Execute o deploy de uma rede externa ou configure o proxy corporativo no npm.
