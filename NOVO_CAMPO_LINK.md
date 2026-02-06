# 🔗 Novo Campo de Link - Construtor de Formulário

## ✅ O Que Foi Adicionado

Agora você pode adicionar campos de **Link com texto customizável** ao seu formulário!

**Antes**: Você precisava adicionar apenas URLs (https://exemplo.com)
**Agora**: Você pode adicionar URL + texto do link (ex: "Clique aqui", "Ver mais", etc.)

---

## 📋 Como Usar

### 1. **Criar um Novo Campo de Link**

1. Acesse o Construtor de Formulário
2. Clique em **"Adicionar Campo"**
3. Configure:
   - **Rótulo/Pergunta**: "Qual seu site preferido?" ou "Compartilhe o link"
   - **Tipo de Campo**: Selecione **"Link (com texto customizável)"**
   - **Obrigatório**: Marque se necessário

### 2. **Preencher o Campo**

Quando o formulário for preenchido, o usuário verá:

#### Campo URL
- Aceita: URLs completas (`https://www.exemplo.com`)
- Aceita: Links relativos (`/minha-pagina`)
- Aceita: Qualquer endereço válido

#### Campo Texto do Link
- Texto que aparecerá clicável
- Exemplos:
  - "Clique aqui"
  - "Ver documentação"
  - "Acessar portal"
  - "Abrir planilha"

#### Prévia do Link
- Aparece em tempo real enquanto digita
- Mostra exatamente como ficará no documento final

---

## 🎯 Exemplos de Uso

### Exemplo 1: Formulário de Pesquisa
```
Pergunta: "Qual site você recomendaria?"

URL: https://www.microsoft.com
Texto: Acesse Microsoft

Resultado: Acesse Microsoft (clicável)
```

### Exemplo 2: Gerenciamento de Projetos
```
Pergunta: "Documentação do projeto"

URL: /documentacao/projeto-xyz
Texto: Ir para documentação

Resultado: Ir para documentação (clicável)
```

### Exemplo 3: Solicitação de Informações
```
Pergunta: "Compartilhe o link do seu trabalho"

URL: https://portfolio.com/usuario123
Texto: Meu Portfólio

Resultado: Meu Portfólio (clicável)
```

---

## 🔍 Características

✅ **URL Flexível**
- Aceita URLs absolutas: `https://exemplo.com`
- Aceita URLs relativas: `/pagina`, `../outra`
- Aceita mailto: `mailto:email@exemplo.com`
- Aceita tel: `tel:+5511999999999`

✅ **Texto Customizável**
- Qualquer texto pode ser usado
- Sem limite de caracteres
- Renderiza como link clicável

✅ **Prévia em Tempo Real**
- Vê como ficará enquanto escreve
- Atualiza automaticamente
- Link é testável (clicável mesmo na prévia)

✅ **Armazenamento**
- URL e texto são salvos separadamente
- Exportação CSV mantém ambas informações
- Respostas são rastreáveis

---

## 📊 Dados Salvos

Quando o usuário submete o formulário com um link, é salvo como:

```json
{
  "url": "https://www.exemplo.com",
  "text": "Clique aqui"
}
```

### Na Exportação CSV
A coluna mostrará como: `{"url":"https://...", "text":"..."}` ou pode ser renderizada como um link clicável no seu programa de planilhas.

---

## 💡 Dicas

1. **Deixe claro o que espera**
   - Use rótulos como: "Compartilhe o link do seu site"
   - Não: "Link" (muito vago)

2. **Use texto amigável**
   - Não é obrigatório digitar URL novamente no texto
   - Deixe para o usuário decidir como apresentar
   - Exemplo: URL=google.com, Texto="Meu site favorito"

3. **Para Links Internos**
   - Use `/pagina` sem domínio
   - Exemplo: `/documentacao`, `/relatorio`
   - Mais fácil para redirecionar

4. **Email e Telefone**
   - Email: `mailto:usuario@example.com`
   - Telefone: `tel:+5511999999999`
   - Texto: "Enviar email" ou "Ligar"

---

## ❓ Dúvidas Frequentes

**P: Posso deixar URL ou Texto vazios?**  
R: Sim, mas a prévia só aparece se pelo menos um dos dois estiver preenchido.

**P: O link abre em nova aba?**  
R: Sim, automaticamente (target="_blank").

**P: Funciona com redirecionadores?**  
R: Sim, qualquer URL válida funciona.

**P: Posso validar se a URL é válida?**  
R: Atualmente não há validação, então o usuário pode digitar qualquer texto na URL. Valide no seu sistema se necessário.

---

## 🔧 Para Desenvolvedores

### Campo no Formulário
```javascript
{
  id: 1234567890,
  label: "Qual seu site preferido?",
  type: "link",        // ← Novo tipo
  required: false,
  options: []          // Não usada para link
}
```

### Resposta Salva
```javascript
currentResponse[fieldId] = {
  url: "https://www.exemplo.com",
  text: "Clique aqui para acessar"
}
```

### Validação (Recomendado)
```javascript
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

---

**Última atualização**: 5 de fevereiro de 2026  
**Status**: ✅ Funcional
