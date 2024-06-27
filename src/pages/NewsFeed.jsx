import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
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
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4  bg-black text-white p-1 rounded-md"> Ai Opinion</h1>
      {news.length === 0 ? (
        <p className="text-gray-600">No news articles available.</p>
      ) : (
        <ul className="space-y-4">
              {user && (
        <button
          onClick={triggerNewsGeneration}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Generate News
        </button>
      )}
          {news.map((article) => (
            <li key={article.id} className="bg-white shadow-lg rounded-lg p-6 mb-4">
              <h2 className="text-2xl font-semibold mb-2">{article.topic}</h2>
              <p className="text-gray-600 mb-2">{article.comment}</p>
              {article.urlToImage && (
                <img src={article.urlToImage} alt={article.topic} className="w-full h-auto rounded-lg mb-4" />
              )}
              <p className="text-gray-400 text-sm">Published on: {new Date(article.createdAt.toDate()).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    
    </div>
  );
};

export default NewsFeed;