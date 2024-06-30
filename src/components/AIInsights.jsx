import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AIInsights = ({ userId }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const functions = getFunctions();

  useEffect(() => {
    if (!userId) return;
    console.log('User ID:', userId);

    const q = query(collection(db, 'insights'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const insightsArray = [];
      querySnapshot.forEach((doc) => {
        insightsArray.push({ ...doc.data(), id: doc.id });
      });
      setInsights(insightsArray);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching insights:", error);
    });
    return () => unsubscribe();
  }, [userId]);

  const triggerInsightGeneration = async () => {
    if (!userId) return;

    const generateInsightsNow = httpsCallable(functions, 'generateInsightsNowHttp');
    try {
      await generateInsightsNow({ userId });
      console.log('Insights generation triggered successfully.');
    } catch (error) {
      console.error('Error triggering insights generation:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      triggerInsightGeneration();
    }
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Your AI-Generated Insights</h1>
      {insights.length === 0 ? (
        <p className="text-gray-600">No insights available.</p>
      ) : (
        <ul className="space-y-4 customlist">
          {insights.map((insight) => (
            <li key={insight.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
              <p className="text-gray-600 mb-2">{insight.summary}</p>
              <p className="text-gray-400 text-sm">Generated on: {new Date(insight.createdAt.toDate()).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIInsights;