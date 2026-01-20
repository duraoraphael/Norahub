#!/bin/bash
# Script para copiar conteúdo das Firestore Rules para clipboard

cat firestore.rules | xclip -selection clipboard

echo "✅ Conteúdo de firestore.rules copiado para o clipboard!"
echo ""
echo "Próximos passos:"
echo "1. Acesse https://console.firebase.google.com"
echo "2. Projeto: norahub-2655f"
echo "3. Firestore Database > Rules"
echo "4. Cole o conteúdo (Ctrl+V)"
echo "5. Clique em Publish"
