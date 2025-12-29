# 🧪 Guia de Teste - Novas Funcionalidades

## ✅ Checklist de Testes

### 1. ⭐ Botão de Favoritos

**Onde encontrar:**
- Página: `/selecao-projeto`
- Localização: Cards de projetos (lado direito, ao lado de "BASE ATIVA")
- Aparência: ⭐ Estrela cinza (não favoritado) ou ⭐ Estrela amarela (favoritado)

**Como testar:**
1. Faça login no sistema
2. Vá para "Seleção de Projetos"
3. Você DEVE ver uma estrela em cada card de projeto
4. Clique na estrela → Deve ficar amarela e com fundo amarelo claro
5. Clique novamente → Deve voltar a ficar cinza
6. Recarregue a página → Estrela deve manter o estado (amarela se favoritado)

**Se não aparecer:**
- Abra o Console do navegador (F12)
- Verifique se há erros
- Certifique-se de que está logado
- Limpe o cache (Ctrl+Shift+Delete)

---

### 2. 📄 Botão de Resumir (PDFs)

**Onde encontrar:**
- Abra qualquer arquivo PDF
- No cabeçalho superior, ao lado do botão "Baixar"
- Aparência: Botão AZUL com texto "RESUMIR" 📄

**Como testar:**
1. Vá para "Gerenciamento de Arquivos"
2. Faça upload de um PDF (ou abra um existente)
3. Clique no arquivo para abrir o visualizador
4. Você DEVE ver botão azul "RESUMIR" no topo
5. Clique em "RESUMIR"
6. Aguarde processamento (texto muda para "Processando...")
7. Modal deve aparecer com o resumo
8. Teste o botão "Copiar"

**Se não aparecer:**
- Verifique se o arquivo é realmente PDF (.pdf)
- Abra Console (F12) e procure por "Botão RESUMIR clicado!"
- Verifique se a API Key está configurada no .env

---

### 3. 🔍 Botão de OCR (Imagens)

**Onde encontrar:**
- Abra qualquer imagem (JPG, PNG, GIF, WEBP)
- No cabeçalho superior, ao lado do botão "Baixar"
- Aparência: Botão ROXO com texto "OCR" 🖼️

**Como testar:**
1. Vá para "Gerenciamento de Arquivos"
2. Faça upload de uma imagem COM TEXTO (ex: screenshot, foto de documento)
3. Clique na imagem para abrir o visualizador
4. Você DEVE ver botão roxo "OCR" no topo
5. Clique em "OCR"
6. Aguarde processamento
7. Modal deve aparecer com o texto extraído
8. Teste o botão "Copiar"

**Se não aparecer:**
- Verifique se é realmente uma imagem (.jpg, .png, etc)
- Abra Console (F12) e procure por "Botão OCR clicado!"
- Teste com imagem que tenha texto legível

---

### 4. 📊 Botão de Analisar (Planilhas)

**Onde encontrar:**
- Abra qualquer planilha (.csv, .xls, .xlsx)
- No cabeçalho superior, ao lado do botão "Baixar"
- Aparência: Botão ÍNDIGO com texto "ANALISAR" 📊

**Como testar:**
1. Vá para "Gerenciamento de Arquivos"
2. Faça upload de uma planilha CSV ou Excel
3. Clique na planilha para abrir o visualizador
4. Você DEVE ver botão índigo "ANALISAR" no topo
5. Clique em "ANALISAR"
6. Aguarde processamento
7. Modal deve aparecer com análise dos dados
8. Teste o botão "Copiar"

---

### 5. 💬 Histórico do Chatbot

**Como testar:**
1. Abra o chatbot (ícone no canto inferior direito)
2. Envie algumas mensagens
3. Feche o chatbot
4. Reabra o chatbot
5. Você DEVE ver as mensagens anteriores
6. Clique no ícone de lixeira (🗑️) no cabeçalho
7. Confirme a limpeza
8. Histórico deve ser apagado

---

### 6. 🤖 Comandos do Chatbot

**Comandos disponíveis:**
- `comandos` → Mostra lista completa
- `ir para perfil` → Navega para página de perfil
- `ir para projetos` → Navega para seleção de projetos
- `buscar [termo]` → Aciona busca
- `criar projeto [nome]` → Cria novo projeto

**Como testar:**
1. Abra o chatbot
2. Digite: `comandos`
3. Deve aparecer lista completa de comandos
4. Teste: `ir para perfil`
5. Deve navegar automaticamente após 1 segundo

---

## 🔧 Troubleshooting

### Botões não aparecem:
1. Faça hard refresh: `Ctrl + Shift + R`
2. Limpe cache do navegador
3. Verifique se está na página correta
4. Abra Console (F12) e veja erros

### Botões aparecem mas não funcionam:
1. Abra Console (F12)
2. Clique no botão
3. Procure por logs: "Botão X clicado!"
4. Verifique erros de API
5. Confirme que está logado

### Estrela de favoritos não aparece:
1. Certifique-se de estar LOGADO
2. Vá para página "Seleção de Projetos"
3. A estrela aparece em TODOS os cards
4. Se não aparecer, limpe cache e recarregue

---

## 📸 Capturas de Tela Esperadas

### Card de Projeto com Favoritos:
```
┌─────────────────────────────────┐
│  🟢       BASE ATIVA ⭐ 🗑️     │
│                                 │
│  Nome do Projeto                │
│  Descrição do projeto...        │
│                                 │
│  [Acessar Projeto]              │
└─────────────────────────────────┘
```

### Cabeçalho do Visualizador de PDF:
```
┌──────────────────────────────────────────────┐
│ ← Voltar  |  arquivo.pdf  | [RESUMIR] [BAIXAR] │
│                                  AZUL   VERDE  │
└──────────────────────────────────────────────┘
```

### Cabeçalho do Visualizador de Imagem:
```
┌──────────────────────────────────────────────┐
│ ← Voltar  |  imagem.jpg  | [OCR] [BAIXAR]     │
│                             ROXO   VERDE       │
└──────────────────────────────────────────────┘
```

---

## 🐛 Reportar Problemas

Se algo não funcionar:
1. Abra Console do navegador (F12)
2. Tire screenshot do erro
3. Anote os passos que fez
4. Compartilhe:
   - URL da página
   - Tipo de arquivo (se aplicável)
   - Mensagem de erro
   - Logs do console
