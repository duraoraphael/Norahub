import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Função para migrar usuários da coleção 'users' para 'usuarios'
 * Apenas administradores podem executar essa ação
 */
export const migrateUsersCollection = async () => {
  try {
    const migrateFunction = httpsCallable(functions, 'migrateUsersCollection');
    const result = await migrateFunction();
    return result.data;
  } catch (error) {
    console.error('Erro ao migrar usuários:', error);
    throw error;
  }
};
