import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Replace the following with your app's Firebase project configuration
// You can find this in the Firebase Console -> Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
    apiKey: "AIzaSyDCPiLUxT2C2xiTDhVNcROK9gA5ODOpVDU",
    authDomain: "weldora-8a40e.firebaseapp.com",
    projectId: "weldora-8a40e",
    storageBucket: "weldora-8a40e.firebasestorage.app",
    messagingSenderId: "250973593485",
    appId: "1:250973593485:web:48779024f27bbd8d12a7c4",
    measurementId: "G-KX0ERN9Y5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
