# 📧 Template EmailJS - Configuração Correta

## Erro 422? Siga este passo a passo!

O erro 422 significa que o template não está configurado corretamente. Siga exatamente este guia:

---

## 1. Acesse o Dashboard do EmailJS

- Vá em: https://dashboard.emailjs.com/
- Faça login
- Vá em **"Email Templates"**

---

## 2. Edite ou Crie o Template

- Se já existe `template_wg87jtj`, clique em **EDIT**
- Se não existe, clique em **"Create New Template"**

---

## 3. Configure o Template EXATAMENTE assim:

### **Subject (Assunto):**
```
Nova resposta: {{form_name}}
```

### **Content (Corpo):**
```
Olá!

Nova resposta recebida no formulário "{{form_name}}" do projeto {{project_name}}.

Enviado por: {{user_name}}
Data/Hora: {{submission_date}}

=== RESPOSTAS ===
{{response_data}}

==================

Acesse o sistema NoraHub para mais detalhes.
```

### **To Email:**
```
{{to_email}}
```

### **From Name:**
```
NoraHub - Sistema de Formulários
```

---

## 4. Variáveis Obrigatórias

Certifique-se que estas variáveis estão no template:

- `{{to_email}}` ← Destinatário
- `{{form_name}}` ← Nome do formulário
- `{{user_name}}` ← Quem respondeu
- `{{project_name}}` ← Nome do projeto
- `{{response_data}}` ← Respostas
- `{{submission_date}}` ← Data/hora

---

## 5. Salvar

1. Clique em **"Save"**
2. Anote o **Template ID** (deve ser `template_wg87jtj`)

---

## 6. Verificar Service

1. Vá em **"Email Services"**
2. Certifique-se que `service_q1o252g` está **CONECTADO** (ícone verde)
3. Se não estiver conectado:
   - Clique em **"Connect"**
   - Autorize o acesso ao seu Gmail/Outlook
   - Teste a conexão

---

## 7. Testar

Depois de configurar:

1. Volte ao sistema NoraHub
2. Abra o Console do navegador (F12)
3. Responda um formulário
4. Verifique os logs no console:
   - Deve mostrar "Template params:" com todos os dados
   - Se der erro, copie a mensagem completa

---

## ⚠️ Problemas Comuns

### Erro 422:
- Template não tem as variáveis corretas
- Template ID errado
- Service desconectado

### Erro 403:
- Service ID errado
- Public Key errada
- Service não autorizado

### Email não chega:
- Verifique SPAM
- Verifique se o "To Email" está configurado como `{{to_email}}`
- Teste com outro email

---

## 📋 Resumo das Credenciais

Suas credenciais atuais no código:

```javascript
publicKey: 'HIafSr02lXJ1nR3TQ'
serviceId: 'service_q1o252g'
templateId: 'template_wg87jtj'
```

Verifique se estes valores existem no seu dashboard do EmailJS!

---

## 🆘 Ainda com erro?

1. Copie TODO o console de erro (F12)
2. Me envie a mensagem completa
3. Tire print do seu template no EmailJS
4. Verifique se o service está conectado (ícone verde)
