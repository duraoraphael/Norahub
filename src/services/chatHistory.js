import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';

/**
 * Serviço de histórico de conversas do chatbot
 * Salva e recupera conversas no Firestore
 */

// Salvar mensagem no histórico
export const saveChatMessage = async (userId, message) => {
  try {
    const chatRef = collection(db, 'chatHistory');
    await addDoc(chatRef, {
      userId,
      role: message.role, // 'user' ou 'assistant'
      content: message.content,
      timestamp: message.timestamp || new Date().toISOString(),
      sessionId: message.sessionId || generateSessionId(),
      metadata: message.metadata || {}
    });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar mensagem do chat:', error);
    return { success: false, error: error.message };
  }
};

// Buscar histórico de conversas
export const getChatHistory = async (userId, limitMessages = 50) => {
  try {
    const chatRef = collection(db, 'chatHistory');
    const q = query(
      chatRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitMessages)
    );

    const snapshot = await getDocs(q);
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: new Date(doc.data().timestamp)
      });
    });

    // Reverter para ordem cronológica (mais antiga primeiro)
    messages.reverse();

    return { success: true, messages };
  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    return { success: false, error: error.message, messages: [] };
  }
};

// Buscar conversas por sessão
export const getChatSessionHistory = async (userId, sessionId) => {
  try {
    const chatRef = collection(db, 'chatHistory');
    const q = query(
      chatRef,
      where('userId', '==', userId),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    const messages = [];
    
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: new Date(doc.data().timestamp)
      });
    });

    return { success: true, messages };
  } catch (error) {
    console.error('Erro ao buscar sessão do chat:', error);
    return { success: false, error: error.message, messages: [] };
  }
};

// Limpar histórico antigo (mensagens com mais de X dias)
export const clearOldChatHistory = async (userId, daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const chatRef = collection(db, 'chatHistory');
    const q = query(
      chatRef,
      where('userId', '==', userId),
      where('timestamp', '<', cutoffDate.toISOString())
    );

    const snapshot = await getDocs(q);
    const deletePromises = [];
    
    snapshot.forEach(docSnapshot => {
      deletePromises.push(deleteDoc(doc(db, 'chatHistory', docSnapshot.id)));
    });

    await Promise.all(deletePromises);

    return { success: true, deletedCount: deletePromises.length };
  } catch (error) {
    console.error('Erro ao limpar histórico antigo:', error);
    return { success: false, error: error.message };
  }
};

// Gerar ID de sessão único
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Buscar resumo de conversas recentes
export const getChatSummary = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chatRef = collection(db, 'chatHistory');
    const q = query(
      chatRef,
      where('userId', '==', userId),
      where('timestamp', '>=', startDate.toISOString())
    );

    const snapshot = await getDocs(q);
    const summary = {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      topics: [],
      lastActivity: null
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      summary.totalMessages++;
      
      if (data.role === 'user') {
        summary.userMessages++;
      } else {
        summary.assistantMessages++;
      }

      if (!summary.lastActivity || new Date(data.timestamp) > new Date(summary.lastActivity)) {
        summary.lastActivity = data.timestamp;
      }
    });

    return { success: true, summary };
  } catch (error) {
    console.error('Erro ao buscar resumo do chat:', error);
    return { success: false, error: error.message };
  }
};
