# Configurar CORS no Firebase Storage

## O que está acontecendo?
Erro de CORS bloqueando o upload de arquivos do localhost para o Firebase Storage.

## Solução Rápida

### Via Google Cloud Console (Recomendado):

1. Acesse: https://console.cloud.google.com/storage/browser
2. Faça login com a mesma conta do Firebase
3. Clique no bucket: **norahub-2655f.appspot.com**
4. Clique nos 3 pontinhos (⋮) no lado direito
5. Selecione **"Edit CORS configuration"**
6. Cole o JSON abaixo e salve:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

### Via gsutil (Terminal):

Se você tem o gsutil instalado:

```bash
gsutil cors set cors.json gs://norahub-2655f.appspot.com
```

## Depois de configurar:

1. Aguarde 1-2 minutos para propagar
2. Atualize a página da aplicação (F5)
3. Teste o upload novamente

## Verificar se funcionou:

Execute no PowerShell:
```bash
gsutil cors get gs://norahub-2655f.appspot.com
```

Deve retornar a configuração CORS que você aplicou.
