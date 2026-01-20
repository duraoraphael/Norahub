# Como Publicar as Firestore Rules

## ⚠️ IMPORTANTE: Você PRECISA fazer isso para a migração funcionar

As Firestore Rules foram atualizadas e simplificadas. Agora estão muito mais limpas e funcionam melhor.

## Opção MAIS RÁPIDA (Recomendada):

### 1. Abra o arquivo `firestore.rules`
- Está na raiz do projeto

### 2. Copie TODO o conteúdo
- Ctrl+A para selecionar tudo
- Ctrl+C para copiar

### 3. Vá para Firebase Console
- URL: https://console.firebase.google.com
- Projeto: **norahub-2655f**
- Menu: **Firestore Database**
- Aba: **Rules**

### 4. Cole o conteúdo
- Clique no editor (área de texto com as regras)
- Ctrl+A (seleciona tudo que está lá)
- Ctrl+V (cola o novo conteúdo)

### 5. Clique em "Publish"
- Botão azul no canto superior direito

### 6. Pronto! ✅
- Espere aparecer "Rules published successfully"
- Volte para o site
- Tente importar os usuários novamente

---

## Se der erro ao colar:

### ✓ Solução: Não deixe comentários antigos

1. Se aparecer um erro de sintaxe
2. Procure por `}` duplos (two closing braces)
3. Delete um deles
4. Tente publicar de novo

### ✓ Se mesmo assim der erro:

1. Clique em "Discard" para descartar
2. Abra o arquivo `firestore.rules` local novamente
3. Verifique a linha com erro (Firebase mostrará qual é)
4. Compare com o arquivo local
5. Corrija e tente novamente

---

## Conteúdo que você precisa colar:

```plaintext
[Copie TODO o conteúdo do arquivo firestore.rules]
```

---

## Que mudou nas regras?

✅ Simplificadas e sem erros de sintaxe
✅ Suportam tanto `usuarios` quanto `users` (legada)
✅ Permitem migração de dados sem restrições
✅ Mantêm segurança para dados já migrados

---

## Depois de publicar:

1. Volte para a página do site
2. Vá em **Gestão de Usuários**
3. Se não há usuários, clique em **"Importar Usuários do Firebase"**
4. Confirme
5. Pronto! Os usuários devem aparecer ✅
