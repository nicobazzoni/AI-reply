import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const functions = getFunctions();

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newsArray = [];
      querySnapshot.forEach((doc) => {
        newsArray.push({ ...doc.data(), id: doc.id });
      });
      setNews(newsArray);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerNewsGeneration = async () => {
    const generateNewsNow = httpsCallable(functions, 'generateNewsNowHttp');
    try {
      await generateNewsNow();
      console.log('News generation triggered successfully.');
    } catch (error) {
      console.error('Error triggering news generation:', error);
    }
  };

  useEffect(() => {
    triggerNewsGeneration();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>News Feed</h1>
      <ul>
        {news.map((article) => (
          <li key={article.id} className="mb-4">
            <h2 className="text-xl font-bold">{article.title}</h2>
            <p className="text-gray-600">{article.commentary}</p>
            <p className="text-gray-400 text-sm">Published on: {new Date(article.createdAt.toDate()).toLocaleDateString()}</p>
            {article.urlToImage && <img src={article.urlToImage} alt={article.title} className="w-full h-auto" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsFeed;