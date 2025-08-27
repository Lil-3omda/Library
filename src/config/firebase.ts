import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD5A7Ar0-mvFeLi3FG5P8ySbo5MFsAt1yc",
  authDomain: "library-management-system-1010.firebaseapp.com",
  projectId: "library-management-system-1010",
  storageBucket: "library-management-system-1010.appspot.com", 
  messagingSenderId: "886380871455",
  appId: "1:886380871455:web:b6728613ddddf97fb6ba2a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
