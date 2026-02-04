# 🔒 Arquitetura de Segurança - NoraHub

## Visão Geral

Este documento descreve a arquitetura de segurança completa implementada no NoraHub, incluindo proteções contra ataques comuns, criptografia, WAF e monitoramento.

## 📊 Camadas de Segurança

### 1. Headers de Segurança HTTP

Configurados em [firebase.json](firebase.json) e [vite.config.js](vite.config.js):

#### HSTS (HTTP Strict Transport Security)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
- Força HTTPS por 2 anos
- Inclui todos os subdomínios
- Elegível para HSTS preload list

#### Content Security Policy (CSP)
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;
```
- Previne XSS attacks
- Controla fontes de conteúdo permitidas
- Permite APIs necessárias do Firebase/Google

#### Outros Headers Críticos
- **X-Content-Type-Options**: nosniff (previne MIME sniffing)
- **X-Frame-Options**: DENY (previne clickjacking)
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Desabilita APIs perigosas

### 2. AWS WAF (Web Application Firewall)

Configurado em [aws-waf-cloudformation.json](aws-waf-cloudformation.json):

#### Regras Implementadas

##### a) AWS Managed Rule Sets
- **Common Rule Set**: Proteção contra OWASP Top 10
- **Known Bad Inputs**: Bloqueia padrões de ataque conhecidos
- **SQL Injection Rule Set**: Previne SQLi attacks

##### b) Rate Limiting
```json
{
  "Limit": 2000,
  "AggregateKeyType": "IP"
}
```
- Máximo de 2000 requisições por IP por janela de 5 minutos
- Resposta: HTTP 429 (Too Many Requests)

##### c) Geo Blocking
Países permitidos:
- Brasil (BR)
- América do Norte: US, CA
- Europa: GB, DE, FR, ES, PT
- América Latina: AR, CL, CO, MX

##### d) Bloqueio de Padrões Maliciosos
- Path traversal (`../`)
- Tentativas de XSS (`<script`)
- Funções perigosas (`eval(`)

#### Deployment do WAF

**Windows:**
```bash
.\deploy-waf.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-waf.sh
./deploy-waf.sh
```

### 3. Cloud Functions Security

Implementado em [functions/securityMiddleware.js](functions/securityMiddleware.js):

#### Rate Limiting Inteligente
```javascript
// Exemplo de uso
exports.myFunction = functions.https.onCall(
  secureFunction(handler, {
    rateLimit: {
      windowMs: 60000,    // 1 minuto
      maxRequests: 100    // 100 requisições
    }
  })
);
```

#### Validação e Sanitização
```javascript
InputValidator.sanitizeString(input)     // Remove XSS
InputValidator.validateEmail(email)      // Valida formato
InputValidator.validateUid(uid)          // Valida ID seguro
```

#### Logging de Segurança
Todos os eventos são registrados em `security_logs`:
- Tentativas de autenticação
- Acessos não autorizados
- Atividades suspeitas
- Erros de função

#### Verificação de Permissões
```javascript
// Requer admin
{ requireAdmin: true }

// Requer autenticação
{ requireAuth: true }

// Requer role específica
{ requireRole: ['admin', 'gerente'] }
```

### 4. Firestore Security Rules

Configurado em [firestore.rules](firestore.rules):

Princípios aplicados:
- Autenticação obrigatória para leitura/escrita
- Validação de tipos de dados
- Limitação de tamanho de documentos
- Controle granular por coleção

### 5. Storage Security Rules

Configurado em [storage.rules](storage.rules):

Proteções:
- Upload apenas para usuários autenticados
- Limite de tamanho de arquivo (10MB)
- Validação de tipo MIME
- Segregação por usuário

### 6. Variáveis de Ambiente

#### Arquivo .env (local - NÃO commitar)
```env
VITE_FIREBASE_API_KEY=sua_key_aqui
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_GEMINI_API_KEY=sua_gemini_key
```

#### Produção (Firebase)
```bash
# Configurar variáveis no Firebase
firebase functions:config:set resend.key="sua_key"
firebase functions:config:set gemini.key="sua_key"
```

## 🚀 Procedimentos de Deploy Seguro

### 1. Preparação

```bash
# Instalar dependências
npm install

# Verificar variáveis de ambiente
cp .env.example .env
# Editar .env com valores reais
```

### 2. Build de Produção

```bash
# Build otimizado
npm run build

# Verificar CSP e headers
# Testar localmente
npm run preview
```

### 3. Deploy Firebase

```bash
# Deploy hosting + functions + rules
firebase deploy

# Ou deploy seletivo
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### 4. Deploy AWS WAF

```bash
# Windows
.\deploy-waf.bat

# Linux/Mac
./deploy-waf.sh

# Anotar WebACL ARN gerado
```

### 5. Configurar CloudFront + WAF

1. Criar distribuição CloudFront:
   - Origin: Firebase Hosting domain
   - Alternate domain: seu-dominio.com
   - SSL Certificate: Request/Import certificado
   
2. Associar WAF:
   - Web ACLs → Selecionar NoraHubSecurityWAF
   - Associated AWS resources → Add
   - Resource type: CloudFront
   - Selecionar sua distribuição

3. DNS Configuration:
   - Criar CNAME apontando para CloudFront

## 📈 Monitoramento

### CloudWatch Logs

#### WAF Logs
```
Log Group: /aws/waf/norahub
Retention: 30 dias
```

Métricas disponíveis:
- Requisições bloqueadas
- Rate limit hits
- SQL injection attempts
- XSS attempts

#### Security Logs (Firestore)

Coleção: `security_logs`

Campos:
```javascript
{
  timestamp: Timestamp,
  type: 'authentication' | 'authorization' | 'suspicious_activity',
  severity: 'info' | 'warning' | 'high' | 'critical',
  userId: string,
  action: string,
  success: boolean,
  details: object
}
```

### Alertas Recomendados

Configure alertas para:
- Taxa de bloqueios WAF > 100/min
- Tentativas de autenticação falhadas > 50/min
- Acessos não autorizados > 10/min
- Erros de função > 5% das chamadas

## 🛡️ Checklist de Segurança

### Antes do Deploy

- [ ] Todas as credenciais em variáveis de ambiente
- [ ] .env e .env.local no .gitignore
- [ ] Headers de segurança configurados
- [ ] CSP testado e funcional
- [ ] Firestore rules validadas
- [ ] Storage rules validadas
- [ ] Rate limiting testado
- [ ] Validação de entrada implementada

### Após o Deploy

- [ ] WAF ativo e associado ao CloudFront
- [ ] HTTPS forçado (HSTS)
- [ ] Certificado SSL válido
- [ ] DNS configurado corretamente
- [ ] Logs do WAF funcionando
- [ ] Security logs sendo gerados
- [ ] Alertas configurados
- [ ] Backup automático ativo

### Manutenção Regular

- [ ] Revisar logs de segurança semanalmente
- [ ] Atualizar dependências mensalmente
- [ ] Testar rules do Firestore após mudanças
- [ ] Revisar permissões de usuários
- [ ] Verificar certificados SSL (renovação)
- [ ] Auditar access logs
- [ ] Testar disaster recovery

## 🔧 Troubleshooting

### CSP Bloqueando Recursos

Se recursos legítimos estiverem sendo bloqueados:

1. Verifique o console do browser
2. Identifique a fonte bloqueada
3. Adicione ao CSP em firebase.json:
```json
"script-src 'self' https://nova-fonte.com"
```

### WAF Bloqueando Usuários Legítimos

1. Acesse AWS WAF Console
2. CloudWatch Logs → /aws/waf/norahub
3. Identifique a regra que bloqueou
4. Ajuste a regra ou adicione exceção:

```json
"Statement": {
  "NotStatement": {
    "Statement": {
      "ByteMatchStatement": {
        "SearchString": "user-agent-legitimo"
      }
    }
  }
}
```

### Rate Limiting Muito Restritivo

Ajustar em [functions/index.js](functions/index.js):

```javascript
rateLimit: {
  windowMs: 60000,
  maxRequests: 200  // Aumentar limite
}
```

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [HSTS Preload List](https://hstspreload.org/)

## 🆘 Suporte e Incidentes

### Em Caso de Incidente de Segurança

1. **Contenção Imediata**
   - Desativar WAF rule afetada temporariamente
   - Revogar tokens comprometidos
   - Bloquear IPs maliciosos

2. **Investigação**
   - Revisar security_logs no Firestore
   - Analisar CloudWatch WAF logs
   - Verificar Firebase Authentication logs

3. **Remediação**
   - Aplicar patches de segurança
   - Atualizar rules comprometidas
   - Forçar reset de senhas se necessário

4. **Comunicação**
   - Notificar usuários afetados
   - Documentar incidente
   - Atualizar procedimentos

### Contatos de Emergência

- AWS Support: Console → Support Center
- Firebase Support: firebase.google.com/support
- CERT.br: cert.br (incidentes em infraestrutura brasileira)

## 📝 Changelog de Segurança

### v1.0.0 - 2026-02-04
- ✅ Implementação inicial de headers de segurança
- ✅ Configuração AWS WAF com rules OWASP
- ✅ Rate limiting nas Cloud Functions
- ✅ Sistema de validação e sanitização
- ✅ Logging de segurança completo
- ✅ Variáveis de ambiente protegidas
- ✅ Documentação de segurança

---

**Última atualização**: 4 de fevereiro de 2026  
**Responsável**: Equipe NoraHub Security  
**Próxima revisão**: Abril de 2026
