import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from '../firebase';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');

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

  const generateNews = async (topic) => {
    const functions = getFunctions();
    const callGenerateNews = httpsCallable(functions, 'generateNews');
    try {
      await callGenerateNews({ topic });
    } catch (error) {
      console.error('Error generating news:', error);
    }
  };

  const handleGenerateNews = (e) => {
    e.preventDefault();
    generateNews(newTopic);
    setNewTopic('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>News Feed</h1>
      <form onSubmit={handleGenerateNews}>
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter a news topic"
        />
        <button type="submit">Generate News</button>
      </form>
      <ul>
        {news.map((article) => (
          <li key={article.id}>
            <h2>{article.topic}</h2>
            <p>{article.article}</p>
            <p>Published on: {article.createdAt.toDate().toDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsFeed;