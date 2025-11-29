import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; // ADICIONADO
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD1qsxYzwNwo5iz7IkWkhpJv-QxmbwSibk",
  authDomain: "volei-hub-f6a39.firebaseapp.com",
  projectId: "volei-hub-f6a39",
  storageBucket: "volei-hub-f6a39.firebasestorage.app",
  messagingSenderId: "844364057290",
  appId: "1:844364057290:web:eb8b93159afc2582cd4233",
  measurementId: "G-YS3L6PEWCV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configurar provider do Google para pedir nome e escolher conta
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore - ADICIONADO
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);