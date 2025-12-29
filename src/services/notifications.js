import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Criar uma notificação
 * @param {string} userId - ID do usuário que receberá a notificação
 * @param {string} type - Tipo: 'form_response', 'file_upload', 'approval', 'comment', 'system'
 * @param {string} title - Título da notificação
 * @param {string} message - Mensagem
 * @param {string} link - Link opcional para redirecionar
 * @param {object} metadata - Dados adicionais (projectId, formId, etc)
 */
export const createNotification = async (userId, type, title, message, link = null, metadata = {}) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
};

// Enviar notificação por e-mail via Resend (Cloud Function)
export const sendEmailNotification = async ({ to, subject, html, from }) => {
  try {
    const sendEmail = httpsCallable(functions, 'sendEmailResend');
    const res = await sendEmail({ to, subject, html, from });
    return res.data;
  } catch (error) {
    console.error('Erro ao enviar notificação por e-mail:', error);
    return { success: false, error: error.message };
  }
};

// Helper simples: enviar e-mail formatado para colaborador (CTA opcional)
export const sendEmailToCollaborator = async ({ email, title, message, actionUrl = null, from = null }) => {
  if (!email || !title || !message) {
    return { success: false, error: 'Parâmetros obrigatórios: email, title, message' };
  }

  const subject = title;
  const safeMessage = String(message);
  const safeTitle = String(title);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
      <h2 style="margin:0 0 12px; color:#111;">${safeTitle}</h2>
      <p style="margin:0 0 16px;">${safeMessage}</p>
      ${actionUrl ? `<a href="${actionUrl}" style="display:inline-block;padding:10px 16px;background:#57B952;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Abrir</a>` : ''}
      <p style="margin:16px 0 0; color:#555; font-size:12px;">Enviado via NoraHub</p>
    </div>
  `;

  return sendEmailNotification({ to: email, subject, html, from });
};

/**
 * Criar notificações para múltiplos usuários
 */
export const createBulkNotifications = async (userIds, type, title, message, link = null, metadata = {}) => {
  try {
    const promises = userIds.map(userId => 
      createNotification(userId, type, title, message, link, metadata)
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao criar notificações em lote:', error);
  }
};

/**
 * Marcar notificação como lida
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
};

/**
 * Marcar todas as notificações como lidas
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true, readAt: serverTimestamp() })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
  }
};

/**
 * Obter notificações em tempo real
 */
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    // Ordenar manualmente no lado do cliente
    const notifications = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    callback(notifications);
  });
};

/**
 * Funções auxiliares para criar notificações em eventos específicos
 */

// Quando alguém responde um formulário
export const notifyFormResponse = async (formOwnerId, formName, responderName, projectId) => {
  await createNotification(
    formOwnerId,
    'form_response',
    'Nova resposta de formulário',
    `${responderName} respondeu ao formulário "${formName}"`,
    `/projeto/${projectId}`,
    { formName, responderName, projectId }
  );
};

// Quando alguém faz upload de arquivo
export const notifyFileUpload = async (projectManagerIds, fileName, uploaderName, projectId) => {
  await createBulkNotifications(
    projectManagerIds,
    'file_upload',
    'Novo arquivo enviado',
    `${uploaderName} enviou o arquivo "${fileName}"`,
    `/projeto/${projectId}`,
    { fileName, uploaderName, projectId }
  );
};

// Quando uma aprovação é solicitada
export const notifyApprovalRequest = async (approverIds, itemName, requesterName, projectId) => {
  await createBulkNotifications(
    approverIds,
    'approval',
    'Nova solicitação de aprovação',
    `${requesterName} solicitou aprovação para "${itemName}"`,
    `/projeto/${projectId}`,
    { itemName, requesterName, projectId }
  );
};

// Quando uma aprovação é concedida/negada
export const notifyApprovalResult = async (requesterId, itemName, approved, approverName, projectId) => {
  await createNotification(
    requesterId,
    'approval',
    approved ? 'Aprovação concedida' : 'Aprovação negada',
    `${approverName} ${approved ? 'aprovou' : 'negou'} "${itemName}"`,
    `/projeto/${projectId}`,
    { itemName, approved, approverName, projectId }
  );
};

// Quando alguém comenta (para implementação futura)
export const notifyComment = async (userIds, commenterName, location, projectId) => {
  await createBulkNotifications(
    userIds,
    'comment',
    'Novo comentário',
    `${commenterName} comentou em ${location}`,
    `/projeto/${projectId}`,
    { commenterName, location, projectId }
  );
};

// Notificações do sistema (atualizações, manutenção, etc)
export const notifySystem = async (userIds, title, message, link = null) => {
  await createBulkNotifications(
    userIds,
    'system',
    title,
    message,
    link,
    {}
  );
};
