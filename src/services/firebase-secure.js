// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCem70AILpaNNyWWFJgEm5RzDDFxyOVJUA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "norahub-2655f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "norahub-2655f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "norahub-2655f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "827808998482",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:827808998482:web:8c6d7aa175fa3aee1aeb8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Garante que usamos a mesma região do deploy (southamerica-east1 - São Paulo)
const functions = getFunctions(app, 'southamerica-east1');

// Configuração de segurança adicional
if (import.meta.env.VITE_ENVIRONMENT === 'production') {
  // Desabilitar logs de depuração em produção
  console.log = () => {};
  console.debug = () => {};
}

export { auth, db, storage, functions };
