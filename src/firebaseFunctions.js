import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const getUserProfile = async (userId) => {
  const userDoc = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDoc);
  return userSnapshot.exists() ? userSnapshot.data() : null;
};

export const saveUserProfile = async (userId, profileData) => {
  const userDoc = doc(db, 'users', userId);
  await setDoc(userDoc, profileData, { merge: true });
};