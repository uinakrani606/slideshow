"use client";
import { getApps, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { Firestore } from "firebase/firestore";

// Get firebase config from firebase project settings
const firebaseConfig = {
    apiKey: "AIzaSyAfMBAqlIvx3RdGqboFFvqbBdnr7qcizoo",
    authDomain: "slideshow-98aa3.firebaseapp.com",
    projectId: "slideshow-98aa3",
    storageBucket: "slideshow-98aa3.appspot.com",
    messagingSenderId: "238641277993",
    appId: "1:238641277993:web:01aeb92a6b00cc5be70038",
    measurementId: "G-LTEZDCQFKH"
  };

const currentApps = getApps();

let auth: Auth | undefined = undefined;

if (currentApps.length <= 0) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    if (
        process.env.NEXT_PUBLIC_APP_ENV === "emulator" &&
        process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH
    ) {
        connectAuthEmulator(
            auth,
            `http://${process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH}`
        );
    }
} else {
    auth = getAuth(currentApps[0]);
    if (
        process.env.NEXT_PUBLIC_APP_ENV === "emulator" &&
        process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH
    ) {
        connectAuthEmulator(
            auth,
            `http://${process.env.NEXT_PUBLIC_EMULATOR_AUTH_PATH}`
        );
    }
}

export { auth };
