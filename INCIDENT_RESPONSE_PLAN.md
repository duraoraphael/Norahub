# 🚨 Plano de Resposta a Incidentes de Segurança

## 1. CLASSIFICAÇÃO DE INCIDENTES

### Severidade Crítica (P0)
- Vazamento de credenciais ou tokens
- Acesso não autorizado ao banco de dados
- Comprometimento de contas administrativas
- Data breach confirmado
- Ransomware ou malware
- DDoS que derruba completamente o serviço

**Tempo de resposta**: Imediato (< 15 minutos)

### Severidade Alta (P1)
- Múltiplas tentativas de acesso não autorizado
- Exploração de vulnerabilidade conhecida
- Anomalias suspeitas em logs
- Falha em sistema de autenticação
- XSS ou SQL Injection detectado

**Tempo de resposta**: < 1 hora

### Severidade Média (P2)
- Rate limiting sendo atingido frequentemente
- Padrões suspeitos de tráfego
- Erros de validação em massa
- Tentativas de brute force bloqueadas

**Tempo de resposta**: < 4 horas

### Severidade Baixa (P3)
- Alertas de segurança isolados
- Tentativas de acesso bloqueadas pelo WAF
- Logs de auditoria incomuns

**Tempo de resposta**: < 24 horas

---

## 2. PROCEDIMENTOS DE RESPOSTA

### 2.1 DETECÇÃO

#### Fontes de Alerta
- [ ] CloudWatch WAF logs (`/aws/waf/norahub`)
- [ ] Firestore `security_logs` collection
- [ ] Firebase Authentication logs
- [ ] Alertas do Google Cloud Console
- [ ] Relatórios de usuários
- [ ] Sistemas de monitoramento externos

#### Checklist de Detecção
1. Identificar tipo de incidente
2. Classificar severidade (P0-P3)
3. Registrar timestamp inicial
4. Documentar evidências imediatas
5. Notificar equipe apropriada

### 2.2 CONTENÇÃO

#### Contenção Imediata (< 15 min para P0)

**Comprometimento de Conta:**
```bash
# Desabilitar usuário no Firebase Auth
firebase auth:users:delete USER_UID

# Ou via Console Firebase
# Authentication → Users → [Usuário] → Disable Account
```

**Ataque DDoS:**
```bash
# Bloquear IP no WAF
aws wafv2 update-ip-set \
  --name NoraHubBlockedIPs \
  --scope CLOUDFRONT \
  --id IP_SET_ID \
  --addresses "IP_ATACANTE/32"
```

**Vazamento de Credenciais:**
```bash
# Revogar API keys
firebase functions:config:unset resend.key
firebase functions:config:unset gemini.key

# Gerar novas keys e reconfigurar
firebase functions:config:set resend.key="NOVA_KEY"
firebase deploy --only functions
```

**Vulnerabilidade Crítica Descoberta:**
```bash
# Pausar temporariamente o site (modo manutenção)
# Criar index.html simples
echo "<html><body><h1>Manutenção</h1></body></html>" > dist/index.html
firebase deploy --only hosting
```

#### Contenção Estendida (< 1 hora)

**Isolar Sistemas Afetados:**
- [ ] Desativar Cloud Functions comprometidas
- [ ] Revogar tokens de acesso suspeitos
- [ ] Bloquear IPs maliciosos no WAF
- [ ] Desabilitar features vulneráveis
- [ ] Ativar modo read-only no Firestore (se necessário)

**Preservar Evidências:**
```bash
# Exportar logs do CloudWatch
aws logs create-export-task \
  --log-group-name /aws/waf/norahub \
  --from 1234567890000 \
  --to 1234567890000 \
  --destination norahub-security-evidence

# Backup Firestore security_logs
gcloud firestore export gs://norahub-security-backup/$(date +%Y%m%d)
```

### 2.3 ERRADICAÇÃO

#### Remover Causa Raiz

**Vulnerabilidade no Código:**
1. Identificar código vulnerável
2. Desenvolver patch
3. Testar em ambiente de staging
4. Deploy urgente
5. Verificar correção

**Malware ou Backdoor:**
1. Escanear todo o código fonte
2. Revisar todos os deployments recentes
3. Verificar integridade de arquivos
4. Remover código malicioso
5. Redeployar versão limpa

**Credenciais Comprometidas:**
1. Revogar todas as credenciais
2. Gerar novas credenciais
3. Atualizar em todos os ambientes
4. Forçar logout de todos os usuários
5. Forçar reset de senhas (se necessário)

### 2.4 RECUPERAÇÃO

#### Retorno Gradual ao Normal

**Fase 1: Validação (30 min - 2 horas)**
- [ ] Verificar que vulnerabilidade foi corrigida
- [ ] Testar todos os sistemas críticos
- [ ] Validar logs de segurança
- [ ] Confirmar que ataque cessou

**Fase 2: Reativação (1-4 horas)**
- [ ] Reativar sistemas em modo monitorado
- [ ] Liberar gradualmente o tráfego
- [ ] Monitorar métricas de segurança
- [ ] Estar pronto para reverter

**Fase 3: Normalização (4-24 horas)**
- [ ] Restaurar operação completa
- [ ] Remover restrições temporárias
- [ ] Continuar monitoramento intensivo
- [ ] Comunicar resolução aos stakeholders

### 2.5 POST-MORTEM

#### Análise Pós-Incidente (Dentro de 48h)

**Documentar:**
1. **Timeline completo**
   - Quando foi detectado
   - Ações tomadas e horários
   - Quando foi resolvido

2. **Causa raiz**
   - Como o ataque ocorreu
   - Qual vulnerabilidade foi explorada
   - Por que não foi detectado antes

3. **Impacto**
   - Sistemas afetados
   - Dados comprometidos (se houver)
   - Usuários impactados
   - Tempo de inatividade
   - Custo financeiro

4. **Resposta**
   - O que funcionou bem
   - O que poderia ter sido melhor
   - Tempo de resposta vs. SLA

5. **Ações Corretivas**
   - Mudanças de código necessárias
   - Melhorias em processos
   - Treinamento necessário
   - Ferramentas adicionais

**Template de Relatório:**
```markdown
# Relatório de Incidente - [ID] - [DATA]

## Resumo Executivo
[Descrição breve do incidente]

## Timeline
- HH:MM - Incidente detectado
- HH:MM - Equipe notificada
- HH:MM - Contenção iniciada
- HH:MM - Causa raiz identificada
- HH:MM - Correção aplicada
- HH:MM - Sistema restaurado
- HH:MM - Incidente encerrado

## Detalhes Técnicos
[Descrição detalhada técnica]

## Impacto
- Usuários afetados: X
- Dados comprometidos: Sim/Não
- Downtime: X minutos
- Custo estimado: R$ X

## Causa Raiz
[Análise da causa raiz]

## Ações Tomadas
1. [Ação 1]
2. [Ação 2]

## Lições Aprendidas
[O que aprendemos]

## Ações Preventivas
1. [Ação preventiva 1] - Responsável: [Nome] - Prazo: [Data]
2. [Ação preventiva 2] - Responsável: [Nome] - Prazo: [Data]
```

---

## 3. COMUNICAÇÃO

### 3.1 Comunicação Interna

**Canal Primário**: Grupo de segurança (WhatsApp/Slack)

**Formato de Alerta:**
```
🚨 INCIDENTE DE SEGURANÇA - [SEVERIDADE]
Tipo: [Tipo de incidente]
Detectado: [HH:MM]
Status: [DETECTADO/CONTIDO/RESOLVIDO]
Responsável: [Nome]
Próxima atualização: [+30min]
```

### 3.2 Comunicação Externa

**Quando Comunicar Usuários:**
- Data breach confirmado
- Credenciais podem ter sido comprometidas
- Serviço indisponível > 1 hora
- Ação necessária por parte dos usuários

**Canais:**
- Email para usuários afetados
- Aviso no site/app
- Redes sociais (se aplicável)

**Modelo de Comunicação:**
```
Assunto: Aviso de Segurança - NoraHub

Prezado usuário,

Identificamos e resolvemos um incidente de segurança em [DATA].

O que aconteceu:
[Descrição clara e transparente]

Impacto:
[Quais dados/sistemas foram afetados]

O que fizemos:
[Ações tomadas para resolver]

O que você precisa fazer:
[Ações necessárias pelo usuário, se houver]

Dúvidas:
Contato: seguranca@norahub.com

Pedimos desculpas pelo ocorrido e garantimos que estamos tomando
todas as medidas para prevenir futuros incidentes.

Equipe NoraHub
```

---

## 4. FERRAMENTAS E RECURSOS

### 4.1 Acessos Necessários

**AWS:**
- Console: https://console.aws.amazon.com
- WAF: Console → WAF & Shield
- CloudWatch: Console → CloudWatch

**Firebase:**
- Console: https://console.firebase.google.com
- CLI: `firebase login`

**Comandos Úteis:**
```bash
# Listar logs recentes WAF
aws logs tail /aws/waf/norahub --follow

# Exportar security logs do Firestore
firebase firestore:data --path security_logs > security_logs.json

# Listar usuários Firebase Auth
firebase auth:export users.json --format=JSON

# Verificar status do WAF
aws wafv2 get-web-acl --name NoraHubSecurityWAF --scope CLOUDFRONT

# Monitorar métricas em tempo real
watch -n 5 'firebase hosting:metrics'
```

### 4.2 Contatos de Emergência

**Equipe Interna:**
- Admin Principal: [Nome] - [Telefone]
- Admin Backup: [Nome] - [Telefone]
- Dev Lead: [Nome] - [Telefone]

**Suporte Externo:**
- AWS Support: Via Console
- Firebase Support: https://firebase.google.com/support
- Advogado (LGPD): [Contato]

### 4.3 Checklists Rápidos

**Checklist P0 (Crítico):**
- [ ] Notificar equipe imediatamente
- [ ] Iniciar contenção (< 15 min)
- [ ] Preservar evidências
- [ ] Documentar tudo
- [ ] Ativar comunicação de crise
- [ ] Considerar envolver autoridades

**Checklist P1 (Alto):**
- [ ] Notificar equipe (< 1h)
- [ ] Analisar logs
- [ ] Identificar sistemas afetados
- [ ] Iniciar contenção
- [ ] Documentar incidente
- [ ] Planejar comunicação

---

## 5. PREVENÇÃO

### 5.1 Monitoramento Proativo

**Verificações Diárias:**
- [ ] Revisar CloudWatch WAF metrics
- [ ] Verificar security_logs anomalias
- [ ] Checar Firebase Authentication logs
- [ ] Validar rate limiting funcionando

**Verificações Semanais:**
- [ ] Análise de tendências de segurança
- [ ] Revisar regras do WAF
- [ ] Atualizar lista de IPs bloqueados
- [ ] Verificar certificados SSL

**Verificações Mensais:**
- [ ] Auditoria de permissões
- [ ] Review de Firestore Rules
- [ ] Atualização de dependências
- [ ] Teste de disaster recovery
- [ ] Penetration testing (trimestral)

### 5.2 Treinamento

**Equipe deve saber:**
- Identificar sinais de ataque
- Acessar logs de segurança
- Executar procedimentos de contenção
- Quem notificar e como
- Onde encontrar esta documentação

**Simulações:**
- Realizar drill de incidente P0 trimestralmente
- Testar plano de comunicação
- Validar acessos e permissões
- Atualizar documentação baseado em aprendizados

---

## 6. REFERÊNCIAS

- [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md)
- [SECURITY_QUICKSTART.md](SECURITY_QUICKSTART.md)
- [Firestore Rules](firestore.rules)
- [AWS WAF Config](aws-waf-cloudformation.json)

## 7. REVISÃO

Este documento deve ser revisado:
- Após cada incidente
- Trimestralmente
- Quando houver mudanças significativas na arquitetura

**Última revisão**: 4 de fevereiro de 2026  
**Próxima revisão**: Maio de 2026  
**Responsável**: Equipe de Segurança NoraHub
