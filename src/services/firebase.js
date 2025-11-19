// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Seu objeto de configuração do Firebase (SUBSTITUA PELO SEU)
const firebaseConfig = {
  apiKey: "AIzaSyCem70AILpaNNyWWFJgEm5RzDDFxyOVJUA",
  authDomain: "norahub-2655f.firebaseapp.com",
  projectId: "norahub-2655f",
  storageBucket: "norahub-2655f.firebasestorage.app",
  messagingSenderId: "827808998482",
  appId: "1:827808998482:web:8c6d7aa175fa3aee1aeb8b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };