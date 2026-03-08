import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyCCBwc-21TFjVPbawSKhxDLOXpnLnXMeGo",
  authDomain: "webconnecta-81bb3.firebaseapp.com",
  projectId: "webconnecta-81bb3",
  storageBucket: "webconnecta-81bb3.firebasestorage.app",
  messagingSenderId: "39889881942",
  appId: "1:39889881942:web:d3269c3f1825e7e7fd64f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 