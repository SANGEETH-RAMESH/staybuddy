// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDCYd0DaIOuLEDDXoIHAqi-XB_v-eDtwIs",
    authDomain: "olx-clone-7c576.firebaseapp.com",
    projectId: "olx-clone-7c576",
    storageBucket: "olx-clone-7c576.appspot.com",
    messagingSenderId: "239567904317",
    appId: "1:239567904317:web:51eed1f1d39c1c69005454"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
