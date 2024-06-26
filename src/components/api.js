// api.js
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const saveArticle = async (article) => {
  try {
    await addDoc(collection(db, 'articles'), article);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export const getArticles = async () => {
  const articles = [];
  const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    articles.push({ id: doc.id, ...doc.data() });
  });
  return articles;
};