/**
 * Enhanced Auth Context with Security Features
 * Token refresh, session validation, and security monitoring
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { sessionSecurity } from '../utils/security';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function EnhancedAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);

  // Valida sessão a cada 5 minutos
  useEffect(() => {
    const validateInterval = setInterval(() => {
      const isValid = sessionSecurity.validateSession();
      if (!isValid) {
        setSessionValid(false);
        // Força logout
        auth.signOut();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(validateInterval);
  }, []);

  // Refresh token automaticamente antes de expirar
  const refreshToken = useCallback(async () => {
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken(true);
        console.log('Token refreshed');
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        // Se falhar, fazer logout
        auth.signOut();
      }
    }
  }, [currentUser]);

  // Refresh token a cada 50 minutos (tokens expiram em 60 minutos)
  useEffect(() => {
    if (currentUser) {
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 3000000); // 50 minutos

      return () => clearInterval(refreshInterval);
    }
  }, [currentUser, refreshToken]);

  useEffect(() => {
    // Inicializa fingerprint da sessão
    sessionSecurity.storeFingerprint();

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // Valida sessão
            const isValid = sessionSecurity.validateSession();
            if (!isValid) {
              setSessionValid(false);
              auth.signOut();
              return;
            }

            setCurrentUser(user);
            let tentativas = 0;
            let perfil = null;
            
            while (tentativas < 5 && !perfil) {
              try {
                // Tenta buscar na coleção 'usuarios' primeiro
                let docRef = doc(db, 'usuarios', user.uid);
                let docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                  // Fallback para 'users'
                  docRef = doc(db, 'users', user.uid);
                  docSnap = await getDoc(docRef);
                }
                
                if (docSnap.exists()) {
                  const userData = docSnap.data();
                  // Adiciona informações de segurança
                  const enhancedProfile = {
                    ...userData,
                    lastTokenRefresh: new Date(),
                    sessionFingerprint: sessionSecurity.getFingerprint()
                  };
                  setUserProfile(enhancedProfile);
                  perfil = enhancedProfile;
                } else {
                  tentativas++;
                  await new Promise(res => setTimeout(res, 1000));
                }
              } catch (error) {
                if (error.code === 'permission-denied' || 
                    error.message?.includes('Missing or insufficient permissions')) {
                  tentativas++;
                  await new Promise(res => setTimeout(res, 1000));
                } else {
                  console.error("Erro ao buscar perfil:", error);
                  break;
                }
              }
            }
          } else {
            setCurrentUser(null);
            setUserProfile(null);
            setSessionValid(true);
          }
          setLoading(false);
        });
        
        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Erro ao configurar persistência:", error);
        setLoading(false);
      });
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    sessionValid,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Wrapper para manter compatibilidade
export function AuthProvider({ children }) {
  return <EnhancedAuthProvider>{children}</EnhancedAuthProvider>;
}
