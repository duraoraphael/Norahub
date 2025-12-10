const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function para deletar usuário (Auth + Firestore)
exports.deleteUser = functions.https.onCall(async (data, context) => {
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
