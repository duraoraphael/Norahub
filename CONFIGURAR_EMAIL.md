# 📧 Como Configurar Notificações por Email

## Passo 1: Criar Conta no EmailJS

1. Acesse: https://www.emailjs.com/
2. Clique em **"Sign Up"** e crie uma conta gratuita
3. Confirme seu email

## Passo 2: Adicionar Serviço de Email

1. No dashboard do EmailJS, vá em **"Email Services"**
2. Clique em **"Add New Service"**
3. Escolha seu provedor de email:
   - **Gmail** (recomendado para testes)
   - **Outlook/Hotmail**
   - **Yahoo**
   - Ou outro de sua preferência
4. Conecte sua conta de email
5. Anote o **Service ID** (ex: `service_abc123`)

## Passo 3: Criar Template de Email

1. No dashboard, vá em **"Email Templates"**
2. Clique em **"Create New Template"**
3. Configure o template:

### Subject (Assunto):
```
Nova resposta no formulário: {{form_name}}
```

### Content (Corpo do email):
```html
Olá!

Uma nova resposta foi enviada no formulário "{{form_name}}" do projeto {{project_name}}.

Enviado por: {{user_name}}
Data/Hora: {{submission_date}}

=== RESPOSTAS ===
{{response_data}}

==================

Acesse o sistema NoraHub para visualizar todos os detalhes e anexos.

---
Esta é uma notificação automática do NoraHub.
```

### Settings:
- **To Email**: `{{to_email}}`

4. Clique em **"Save"**
5. Anote o **Template ID** (ex: `template_xyz789`)

## Passo 4: Obter Public Key

1. No dashboard, vá em **"Account"** (ícone de perfil)
2. Na seção **"General"**, copie sua **Public Key** (ex: `abcd1234efgh5678`)

## Passo 5: Configurar no Código

Abra o arquivo: `src/pages/ConstrutorFormulario.jsx`

Localize as linhas (próximo ao topo da função):

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'SUA_PUBLIC_KEY_AQUI',
  serviceId: 'SEU_SERVICE_ID_AQUI',
  templateId: 'SEU_TEMPLATE_ID_AQUI'
};
```

Substitua pelos seus valores:

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'abcd1234efgh5678',      // Sua Public Key
  serviceId: 'service_abc123',        // Seu Service ID
  templateId: 'template_xyz789'       // Seu Template ID
};
```

## Passo 6: Testar

1. Salve o arquivo
2. No sistema, edite um formulário
3. Marque ☑️ **"Ativar notificações por email"**
4. Digite seu email no campo
5. Salve o formulário
6. Preencha e envie uma resposta
7. Verifique sua caixa de entrada (e spam)

## ✅ Pronto!

Agora todos os formulários com notificações ativadas enviarão emails automaticamente quando receberem respostas!

## 📝 Observações

- **Limite gratuito**: EmailJS oferece 200 emails/mês grátis
- **Múltiplos emails**: Separe com vírgula: `email1@exemplo.com, email2@exemplo.com`
- **Anexos**: Links dos arquivos enviados são incluídos no email
- **Respostas completas**: Todas as respostas do formulário são enviadas

## 🔒 Segurança

- Nunca compartilhe suas credenciais do EmailJS
- A Public Key pode ficar no código (é segura)
- Para produção, considere usar variáveis de ambiente

## ❓ Problemas Comuns

1. **Email não chega**: Verifique spam/lixo eletrônico
2. **Erro 403**: Confira se as credenciais estão corretas
3. **Template não encontrado**: Verifique o Template ID
4. **Service desconectado**: Reconecte na aba Email Services

## 🆘 Suporte

- Documentação EmailJS: https://www.emailjs.com/docs/
- Dashboard: https://dashboard.emailjs.com/
