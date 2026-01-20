# Instruções de Deploy das Firestore Rules

## Problema Encontrado
O erro "Missing or insufficient permissions" ocorreu porque as Firestore Rules não permitiam acesso à coleção `usuarios` (que é a nova coleção padrão).

## Solução
As Firestore Rules foram atualizadas para suportar ambas as coleções (`usuarios` e `users`).

## Como fazer Deploy

### Opção 1: Usar Firebase CLI (Recomendado)

```bash
# Se ainda não tem firebase-tools instalado:
npm install -g firebase-tools

# Fazer login no Firebase
firebase login

# Deploy apenas das Firestore Rules
firebase deploy --only firestore:rules

# Ou fazer deploy completo
firebase deploy
```

### Opção 2: Usar Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `norahub-2655f`
3. Vá para **Firestore Database**
4. Clique em **Rules**
5. Cole o conteúdo do arquivo `firestore.rules`
6. Clique em **Publish**

### Opção 3: Copiar e Colar no Console (Mais Rápido)

1. Abra o arquivo [firestore.rules](../firestore.rules)
2. Copie TODO o conteúdo
3. Acesse o Firebase Console conforme acima
4. Cole no editor de Rules
5. Clique em **Publish**

## Teste Após Deploy

1. Acesse a página de **Gestão de Usuários**
2. Clique no botão **"Importar Usuários do Firebase"**
3. Confirme a migração
4. Os usuários devem aparecer normalmente

## Mudanças nas Firestore Rules

As seguintes mudanças foram feitas:

✅ Função `isAdmin()` - agora verifica em ambas as coleções (`usuarios` e `users`)
✅ Função `isManager()` - agora verifica em ambas as coleções
✅ Nova seção `match /usuarios/{userId}` - regras para a coleção padrão
✅ Seção `match /users/{userId}` - mantida para compatibilidade

## Se o Erro Persistir

Se ainda receber erro de permissão após fazer o deploy:

1. **Verifique se você é Admin**: O usuário logado precisa ter `funcao: 'admin'` para executar a migração
2. **Limpe o cache do navegador**: F12 > Application > Clear Site Data
3. **Faça logout e login novamente**: Isso força o carregamento das novas permissões
4. **Teste em uma aba anônima**: Para eliminar cache do navegador

## Arquivos Modificados

- `firestore.rules` - Regras de segurança atualizadas
- `src/pages/GerenciaUsuarios.jsx` - Melhor tratamento de erros
