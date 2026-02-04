# 🚨 Guia Rápido de Segurança - NoraHub

## ⚡ Deploy em 5 Passos

### 1. Configure Variáveis de Ambiente
```bash
cp .env.example .env
# Editar .env com suas credenciais
```

### 2. Build e Deploy Firebase
```bash
npm run build
firebase deploy
```

### 3. Deploy AWS WAF
```bash
# Windows
.\deploy-waf.bat

# Linux/Mac
./deploy-waf.sh
```

### 4. Configure CloudFront
- Origin: seu-app.web.app
- Associe o WAF criado
- Configure domínio personalizado

### 5. Teste
- [ ] HTTPS funcionando
- [ ] Headers de segurança ativos
- [ ] Rate limiting funcionando
- [ ] Logs sendo gerados

## 🔐 Recursos de Segurança

### Headers HTTP Seguros
✅ HSTS com preload  
✅ CSP rigoroso  
✅ X-Frame-Options (anti-clickjacking)  
✅ X-Content-Type-Options (anti-MIME sniffing)  

### AWS WAF
✅ Proteção OWASP Top 10  
✅ Rate limiting (2000 req/min por IP)  
✅ Geo-blocking  
✅ Bloqueio de padrões maliciosos  
✅ SQL Injection prevention  
✅ XSS protection  

### Cloud Functions
✅ Rate limiting por função  
✅ Validação e sanitização de entrada  
✅ Logging de segurança  
✅ Verificação de permissões  

## 📊 Monitoramento

### CloudWatch
- **Log Group**: `/aws/waf/norahub`
- **Métricas**: Bloqueios, rate limits, ataques

### Firestore
- **Coleção**: `security_logs`
- **Tipos**: auth, authorization, suspicious_activity

## 🆘 Troubleshooting Rápido

### CSP Bloqueando Recursos
1. Abra DevTools Console
2. Veja erro CSP
3. Adicione fonte em firebase.json

### WAF Bloqueando Legítimos
1. AWS Console → WAF
2. CloudWatch Logs
3. Ajuste regra ou adicione exceção

### Rate Limit Muito Baixo
1. Edite functions/index.js
2. Aumente `maxRequests`
3. Redeploy: `firebase deploy --only functions`

## 📚 Documentação Completa

Ver [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) para detalhes.

## ✅ Checklist Pré-Deploy

- [ ] .env configurado e no .gitignore
- [ ] npm run build sem erros
- [ ] Headers testados localmente
- [ ] Firestore rules validadas
- [ ] WAF CloudFormation pronto

## ⚠️ NUNCA Commitar

- ❌ .env
- ❌ *.pem, *.key, *.cert
- ❌ Credenciais AWS
- ❌ Tokens de API

---

💡 **Dica**: Execute `firebase deploy --only hosting,functions,firestore:rules` para deploy completo.
