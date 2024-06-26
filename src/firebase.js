import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Store user details in Firestore
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, {
      displayName: user.displayName,
      photoURL: user.photoURL,
      email: user.email,
      uid: user.uid
    }, { merge: true });

    return user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.warn('Popup blocked or closed, trying redirect method.');
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error('Error during redirect sign-in:', redirectError.message);
      }
    } else {
      console.error('Error during sign-in:', error.message);
    }
    return null;
  }
};

const logOut = async () => {
  try {
    await signOut(auth);
    console.log('User signed out.');
  } catch (error) {
    console.error('Error during sign-out:', error.message);
  }
};

export {app, auth, db, signInWithGoogle, logOut };