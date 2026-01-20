/**
 * Script de Migração Manual de Usuários
 * 
 * Para usar:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este código:
 * 
 * import { migrateUsersManually } from './manualMigration.js'
 * await migrateUsersManually()
 */

import { db } from './firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

export const migrateUsersManually = async () => {
  try {
    console.log('Iniciando migração de usuários...');
    
    const db_firebase = window.firebase.firestore();
    const batch = db_firebase.batch();
    
    // Busca todos os usuários da coleção antiga
    const snapshot = await db_firebase.collection('users').get();
    
    if (snapshot.empty) {
      console.log('Nenhum usuário para migrar');
      return { success: true, count: 0 };
    }

    let count = 0;
    
    // Itera sobre todos os documentos
    snapshot.forEach(doc => {
      const userData = doc.data();
      const newDocRef = db_firebase.collection('usuarios').doc(doc.id);
      batch.set(newDocRef, userData, { merge: true });
      count++;
      console.log(`Preparado para migração: ${userData.nome || doc.id}`);
    });

    // Executa a migração
    await batch.commit();
    
    console.log(`✅ Migração concluída! ${count} usuários foram importados.`);
    console.log('Atualize a página para ver os usuários.');
    
    return { success: true, count };
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
};
