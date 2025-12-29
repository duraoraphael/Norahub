const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

admin.initializeApp();

// Instância do Resend (usa variável de ambiente RESEND_API_KEY ou functions config resend.key)
const resendApiKey = process.env.RESEND_API_KEY || functions.config().resend?.key;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Cloud Function para enviar e-mail via Resend
// Região: São Paulo (southamerica-east1) para evitar latência/CORS em projetos nessa região
exports.sendEmailResend = functions.region('southamerica-east1').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  if (!resend) {
    throw new functions.https.HttpsError('failed-precondition', 'RESEND_API_KEY não configurada. Defina em env ou functions:config:set resend.key=...');
  }

  const { to, subject, html, from } = data || {};

  if (!to || !subject || !html) {
    throw new functions.https.HttpsError('invalid-argument', 'Parâmetros obrigatórios: to, subject, html');
  }

  // Defina um remetente verificado no Resend (ajuste conforme seu domínio)
  const fromAddress = from || process.env.RESEND_FROM || 'NoraHub <notificacoes@noreply.norahub.com>';

  try {
    const response = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html
    });
    return { success: true, id: response?.id || null };
  } catch (error) {
    console.error('Erro ao enviar e-mail via Resend:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Falha ao enviar e-mail');
  }
});

// Cloud Function para deletar usuário (Auth + Firestore)
exports.deleteUser = functions.region('southamerica-east1').https.onCall(async (data, context) => {
  // Verifica se quem está chamando é admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  // Busca o perfil do usuário que está chamando
  const callerProfile = await admin.firestore().collection('users').doc(context.auth.uid).get();
  
  if (!callerProfile.exists || callerProfile.data().funcao !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem deletar usuários');
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError('invalid-argument', 'userId é obrigatório');
  }

  try {
    // 1. Deleta a conta do Authentication
    await admin.auth().deleteUser(userId);
    
    // 2. Deleta o documento do Firestore
    await admin.firestore().collection('users').doc(userId).delete();

    return { success: true, message: 'Usuário deletado com sucesso' };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao deletar usuário: ' + error.message);
  }
});
