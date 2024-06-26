// ReactionButtons.jsx
import React from 'react';
import { doc, updateDoc, increment, getDocs, deleteDoc, getDoc, addDoc, query, where, collection, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import thought from '/surprised-emoji-svgrepo-com.svg';
import meh from '/expressionless-svgrepo-com.svg';
import love from '/in-love-emoji-svgrepo-com.svg';
import { db, auth } from '../firebase';

const ReactionButtons = ({ postId, reactions }) => {
  const [user] = useAuthState(auth);

  const addReaction = async (reactionType) => {
    if (!user) {
      console.error('You must be signed in to react.');
      return;
    }

    try {
      const reactionQuery = query(
        collection(db, 'reactions'),
        where('postId', '==', postId),
        where('userId', '==', user.uid),
        where('type', '==', reactionType)
      );

      const existingReactions = await getDocs(reactionQuery);
      const reactionExists = !existingReactions.empty;

      const postRef = doc(db, 'posts', postId);
      const postSnapshot = await getDoc(postRef);
      const postData = postSnapshot.data() || {};

      if (!postData.reactions) {
        postData.reactions = { thought: 0, meh: 0, love: 0 };
      }

      const currentReactionCount = postData.reactions[reactionType] || 0;

      if (reactionExists) {
        existingReactions.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'reactions', docSnapshot.id));
        });

        if (currentReactionCount > 0) {
          await updateDoc(postRef, {
            [`reactions.${reactionType}`]: increment(-1),
          });
        }
      } else {
        await updateDoc(postRef, {
          [`reactions.${reactionType}`]: increment(1),
        });
        await addDoc(collection(db, 'reactions'), {
          postId,
          userId: user.uid,
          type: reactionType,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error adding or removing reaction:', error);
    }
  };

  return (
    <div className="flex space-between items-center space-x-4">
      <div className='space-x-3'>
        <button onClick={() => addReaction('thought')} className="p-2 rounded-full bg-gray-50 hover:bg-gray-300">
          <img src={thought} alt="Thought Emoji" width="24" height="24" />
          {reactions?.thought ?? 0}
        </button>
        <button onClick={() => addReaction('meh')} className="p-2 rounded-full bg-gray-50 hover:bg-gray-300">
          <img src={meh} alt="Meh Emoji" width="24" height="24" />
          {reactions?.meh ?? 0}
        </button>
        <button onClick={() => addReaction('love')} className="p-2 rounded-full bg-gray-50 hover:bg-gray-300">
          <img src={love} alt="Love Emoji" width="24" height="24" />
          {reactions?.love ?? 0}
        </button>
      </div>
    </div>
  );
};

export default ReactionButtons;