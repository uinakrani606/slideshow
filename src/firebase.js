import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "slideshow-98aa3.firebaseapp.com",
  projectId: "slideshow-98aa3",
  storageBucket: "slideshow-98aa3.appspot.com",
  messagingSenderId: "238641277993",
  appId: "1:238641277993:web:01aeb92a6b00cc5be70038",
  measurementId: "G-LTEZDCQFKH"
};
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
