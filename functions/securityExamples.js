/**
 * Exemplo de implementação de novas Cloud Functions com segurança
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { secureFunction, InputValidator, SecurityLogger } = require('./securityMiddleware');

/**
 * EXEMPLO 1: Função pública com rate limiting
 * Permite chamadas de qualquer usuário, mas com limite de taxa
 */
exports.getPublicData = functions.region('southamerica-east1').https.onCall(
  secureFunction(async (data, context) => {
    // Sua lógica aqui
    const { query } = data;
    
    // Buscar dados públicos
    const snapshot = await admin.firestore()
      .collection('public_data')
      .where('published', '==', true)
      .limit(100)
      .get();
    
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: results };
  }, {
    // Sem requireAuth - função pública
    rateLimit: {
      windowMs: 60000,    // 1 minuto
      maxRequests: 50     // 50 requisições/min
    },
    validate: {
      required: [], // Sem campos obrigatórios
      schema: {}
    },
    functionName: 'getPublicData',
    logAccess: true
  })
);

/**
 * EXEMPLO 2: Função que requer autenticação
 * Usuário precisa estar logado
 */
exports.updateProfile = functions.region('southamerica-east1').https.onCall(
  secureFunction(async (data, context) => {
    const { displayName, bio, avatar } = data;
    
    // Context.auth.uid está garantidamente preenchido por requireAuth
    const userId = context.auth.uid;
    
    // Atualizar perfil
    await admin.firestore()
      .collection('usuarios')
      .doc(userId)
      .update({
        displayName: InputValidator.sanitizeString(displayName),
        bio: InputValidator.sanitizeString(bio),
        avatar,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true, message: 'Perfil atualizado' };
  }, {
    requireAuth: true,  // Requer usuário autenticado
    validate: {
      required: ['displayName'], // displayName obrigatório
      schema: {}
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 20
    },
    functionName: 'updateProfile',
    logAccess: true
  })
);

/**
 * EXEMPLO 3: Função administrativa
 * Apenas admins podem chamar
 */
exports.banUser = functions.region('southamerica-east1').https.onCall(
  secureFunction(async (data, context) => {
    const { userId, reason } = data;
    
    // Validar userId
    const validatedUserId = InputValidator.validateUid(userId);
    
    // Banir usuário
    await admin.auth().updateUser(validatedUserId, {
      disabled: true
    });
    
    // Registrar ban no Firestore
    await admin.firestore()
      .collection('usuarios')
      .doc(validatedUserId)
      .update({
        banned: true,
        bannedAt: admin.firestore.FieldValue.serverTimestamp(),
        bannedBy: context.auth.uid,
        banReason: InputValidator.sanitizeString(reason)
      });
    
    // Log de segurança
    await SecurityLogger.log({
      type: 'user_banned',
      severity: 'warning',
      userId: context.auth.uid,
      action: 'ban_user',
      success: true,
      details: { bannedUserId: validatedUserId, reason }
    });
    
    return { success: true, message: 'Usuário banido' };
  }, {
    requireAdmin: true,  // Apenas admins
    validate: {
      required: ['userId', 'reason'],
      schema: { userId: 'uid' }
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 10
    },
    functionName: 'banUser',
    logAccess: true
  })
);

/**
 * EXEMPLO 4: Função com roles específicas
 * Permite múltiplas roles (admin, gerente, moderador)
 */
exports.approveContent = functions.region('southamerica-east1').https.onCall(
  secureFunction(async (data, context) => {
    const { contentId, approved } = data;
    
    await admin.firestore()
      .collection('content')
      .doc(contentId)
      .update({
        approved,
        approvedBy: context.auth.uid,
        approvedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true };
  }, {
    requireRole: ['admin', 'gerente', 'moderador'],  // Múltiplas roles permitidas
    validate: {
      required: ['contentId', 'approved'],
      schema: {}
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100
    },
    functionName: 'approveContent',
    logAccess: true
  })
);

/**
 * EXEMPLO 5: Função com validação complexa
 * Email, sanitização e múltiplos campos obrigatórios
 */
exports.sendInvite = functions.region('southamerica-east1').https.onCall(
  secureFunction(async (data, context) => {
    const { email, message, projectId } = data;
    
    // Validação adicional
    const validatedEmail = InputValidator.validateEmail(email);
    const sanitizedMessage = InputValidator.sanitizeString(message);
    
    // Verificar se projeto existe
    const projectDoc = await admin.firestore()
      .collection('projetos')
      .doc(projectId)
      .get();
    
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Projeto não encontrado');
    }
    
    // Enviar convite
    // ... lógica de envio
    
    return { success: true, inviteId: 'generated-id' };
  }, {
    requireAuth: true,
    validate: {
      required: ['email', 'message', 'projectId'],
      schema: { 
        email: 'email',
        projectId: 'uid'
      }
    },
    rateLimit: {
      windowMs: 3600000, // 1 hora
      maxRequests: 50     // 50 convites/hora
    },
    functionName: 'sendInvite',
    logAccess: true
  })
);

/**
 * EXEMPLO 6: Função sem rate limiting (use com cuidado!)
 * Para operações que precisam de alta frequência
 */
exports.trackEvent = functions.region('southamerica-east1').https.onCall(
  secureFunction(async (data, context) => {
    const { eventType, eventData } = data;
    
    await admin.firestore()
      .collection('analytics')
      .add({
        userId: context.auth?.uid || 'anonymous',
        eventType,
        eventData,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true };
  }, {
    requireAuth: false,  // Permite anônimos
    // Sem rateLimit - use apenas para tracking
    validate: {
      required: ['eventType'],
      schema: {}
    },
    functionName: 'trackEvent',
    logAccess: false  // Não logar cada evento (muito volumoso)
  })
);

/**
 * DICAS DE USO:
 * 
 * 1. Sempre use secureFunction() wrapper
 * 2. Configure rate limiting apropriado para cada função
 * 3. Use requireAuth, requireAdmin ou requireRole conforme necessário
 * 4. Valide entrada com InputValidator
 * 5. Use SecurityLogger para eventos importantes
 * 6. Teste os limites antes de deploy
 * 
 * CONFIGURAÇÕES TÍPICAS DE RATE LIMIT:
 * 
 * - Operações de leitura pública: 100-200/min
 * - Operações de escrita autenticadas: 20-50/min
 * - Operações administrativas: 5-10/min
 * - Envio de emails: 10-20/min
 * - Uploads de arquivos: 10-20/min
 * - Login/Autenticação: 5/min (prevenir brute force)
 */
