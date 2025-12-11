# Configuração do Firebase Storage

## Problema Identificado
O upload de fotos está falhando porque as regras de segurança do Firebase Storage não estão configuradas corretamente.

## Solução

### 1. Configurar Regras no Console do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto: **norahub-2655f**
3. No menu lateral, clique em **Storage**
4. Clique na aba **Rules** (Regras)
5. Substitua as regras existentes pelo conteúdo do arquivo `storage.rules` deste projeto
6. Clique em **Publicar** (Publish)

### 2. Verificar se o Storage está ativado

1. No Console do Firebase, vá em **Storage**
2. Se ainda não estiver ativado, clique em **Começar** (Get Started)
3. Escolha a localização do servidor (recomendado: us-central1 ou southamerica-east1 para Brasil)
4. Clique em **Concluído**

### 3. Testar o Upload

Depois de configurar as regras:

1. Faça login na aplicação
2. Vá para a página de Perfil
3. Clique no ícone da câmera para selecionar uma foto
4. Clique em "Salvar Alterações"
5. A foto deve ser enviada com sucesso

## Regras Implementadas

- ✅ Qualquer pessoa pode **ler** fotos de perfil (são públicas)
- ✅ Apenas o **próprio usuário** pode fazer upload/atualizar sua foto
- ✅ Limite de **5MB por arquivo**
- ✅ Apenas arquivos de **imagem** são aceitos
- ✅ Fotos são salvas em: `users/{userId}/profile.jpg`

## Códigos de Erro Comuns

- `storage/unauthorized` - Usuário não tem permissão (verifique se está autenticado)
- `storage/quota-exceeded` - Cota de armazenamento excedida (plano gratuito tem limite)
- `storage/retry-limit-exceeded` - Muitas tentativas falhadas
- `storage/canceled` - Upload cancelado

## Melhorias Implementadas no Código

1. **Metadata no upload** - Adiciona informações sobre quem e quando fez upload
2. **Validação de arquivo** - Verifica se é realmente uma imagem
3. **Tratamento de erro específico** - Mensagens claras para cada tipo de erro
4. **Não salvar null no Firestore** - Evita sobrescrever foto existente com null
5. **Revogação de blob URLs** - Evita vazamento de memória

## Estrutura de Pastas no Storage

```
storage/
└── users/
    ├── {userId1}/
    │   └── profile.jpg
    ├── {userId2}/
    │   └── profile.jpg
    └── ...
```

Cada usuário tem sua própria pasta identificada pelo UID do Firebase Auth.
