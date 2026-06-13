import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCOZFOxp787VQCuMUMSeoVbSVrH34jOZ68',
  authDomain: 'naforex-b26f3.firebaseapp.com',
  projectId: 'naforex-b26f3',
  storageBucket: 'naforex-b26f3.firebasestorage.app',
  messagingSenderId: '899409926663',
  appId: '1:899409926663:web:0603c91896c75b1c2168a2'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const saveDataToFirebase = async (data) => {
  try {
    await setDoc(doc(db, 'naforex', 'data'), data);
    return true;
  } catch (e) {
    console.error('Firebase save error:', e);
    return false;
  }
};

export const loadDataFromFirebase = async () => {
  try {
    const snap = await getDoc(doc(db, 'naforex', 'data'));
    if (snap.exists()) return snap.data();
    return null;
  } catch (e) {
    console.error('Firebase load error:', e);
    return null;
  }
};

export const saveAuthToFirebase = async (auth) => {
  try {
    await setDoc(doc(db, 'naforex', 'auth'), auth);
    return true;
  } catch (e) {
    console.error('Firebase auth save error:', e);
    return false;
  }
};

export const loadAuthFromFirebase = async () => {
  try {
    const snap = await getDoc(doc(db, 'naforex', 'auth'));
    if (snap.exists()) return snap.data();
    return null;
  } catch (e) {
    console.error('Firebase auth load error:', e);
    return null;
  }
};

export const subscribeToData = (callback) => {
  return onSnapshot(doc(db, 'naforex', 'data'), (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};
