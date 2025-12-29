import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Serviço de gerenciamento de favoritos
 * Suporta favoritar: projetos, cards, arquivos
 */

// Adicionar item aos favoritos
export const addFavorite = async (userId, itemId, itemType, itemData) => {
  try {
    const favoriteRef = doc(db, 'favorites', userId);
    const favoriteDoc = await getDoc(favoriteRef);

    const favoriteItem = {
      id: itemId,
      type: itemType, // 'project', 'card', 'file'
      name: itemData.name || itemData.nome,
      addedAt: new Date().toISOString(),
      ...itemData
    };

    if (favoriteDoc.exists()) {
      await updateDoc(favoriteRef, {
        items: arrayUnion(favoriteItem)
      });
    } else {
      await setDoc(favoriteRef, {
        userId,
        items: [favoriteItem],
        createdAt: new Date().toISOString()
      });
    }

    return { success: true, message: 'Adicionado aos favoritos' };
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    return { success: false, error: error.message };
  }
};

// Remover item dos favoritos
export const removeFavorite = async (userId, itemId) => {
  try {
    const favoriteRef = doc(db, 'favorites', userId);
    const favoriteDoc = await getDoc(favoriteRef);

    if (!favoriteDoc.exists()) {
      return { success: false, error: 'Nenhum favorito encontrado' };
    }

    const items = favoriteDoc.data().items || [];
    const updatedItems = items.filter(item => item.id !== itemId);

    await updateDoc(favoriteRef, {
      items: updatedItems
    });

    return { success: true, message: 'Removido dos favoritos' };
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return { success: false, error: error.message };
  }
};

// Verificar se item está nos favoritos
export const isFavorite = async (userId, itemId) => {
  try {
    const favoriteRef = doc(db, 'favorites', userId);
    const favoriteDoc = await getDoc(favoriteRef);

    if (!favoriteDoc.exists()) return false;

    const items = favoriteDoc.data().items || [];
    return items.some(item => item.id === itemId);
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
};

// Buscar todos os favoritos do usuário
export const getFavorites = async (userId, filterByType = null) => {
  try {
    const favoriteRef = doc(db, 'favorites', userId);
    const favoriteDoc = await getDoc(favoriteRef);

    if (!favoriteDoc.exists()) {
      return { success: true, favorites: [] };
    }

    let items = favoriteDoc.data().items || [];

    if (filterByType) {
      items = items.filter(item => item.type === filterByType);
    }

    // Ordenar por data de adição (mais recente primeiro)
    items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return { success: true, favorites: items };
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return { success: false, error: error.message, favorites: [] };
  }
};

// Toggle favorito (adiciona se não existe, remove se existe)
export const toggleFavorite = async (userId, itemId, itemType, itemData) => {
  const isAlreadyFavorite = await isFavorite(userId, itemId);
  
  if (isAlreadyFavorite) {
    return await removeFavorite(userId, itemId);
  } else {
    return await addFavorite(userId, itemId, itemType, itemData);
  }
};
