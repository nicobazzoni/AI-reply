import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, getDoc, query, where, deleteDoc, orderBy, onSnapshot, serverTimestamp, updateDoc, increment, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import thought from '/surprised-emoji-svgrepo-com.svg';
import meh from '/expressionless-svgrepo-com.svg';
import love from '/in-love-emoji-svgrepo-com.svg';


const PostMessage = () => {
  const [content, setContent] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [user] = useAuthState(auth);
  const functions = getFunctions();



  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        if (postData.userName) {  // Check if the userName exists
          postData.id = doc.id;  // Set the document ID
          postsArray.push(postData);
        }
      });
      setPosts(postsArray);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to post.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://us-central1-ai-reply-fe95c.cloudfunctions.net/postMessage', {
        content,
        userId: user.uid,
      });

      const newPost = {
        content,
        reply: response.data.reply,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
        reactions: {
          thought: 0,
          meh: 0,
          love: 0,
        },
      };

      await addDoc(collection(db, 'posts'), newPost);

      setContent('');
      setReply(response.data.reply);
    } catch (error) {
      setError('Error posting message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (postId, reactionType) => {
    if (!user) {
      setError('You must be signed in to react.');
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
      setError('Error adding or removing reaction. Please try again.');
    }
  };

  const renderReplyWithLinks = (reply) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const parts = reply.split(urlRegex);
    const urls = reply.match(urlRegex);

    if (!urls) return <p>{reply}</p>;

    return (
      <p>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {urls[index] && (
              <a
                className='block w-full mb-2 p-3 border border-gray-300 rounded bg-gray-50 text-gray-700 break-words hover:bg-gray-200'
                href={urls[index]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'blue', textDecoration: 'underline' }}
              >
                {urls[index]}
              </a>
            )}
          </React.Fragment>
        ))}
      </p>
    );
  };

  const handleDelete = async (postId, userId) => {
    const deletePost = httpsCallable(functions, 'deletePost');
    try {
      await deletePost({ postId, userId });
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  

  return (
    <div className="container mx-auto p-4">
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              className="p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post here..."
              required
            ></textarea>
            <button
              type="submit"
              disabled={loading}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              style={{
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.3s ease-in-out',
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0px 8px 12px rgba(0, 0, 0, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)'}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      ) : (
        <p className="text-red-500">You must be signed in to post a message.</p>
      )}
  
      <div className="timeline">
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
            <div className="flex items-center">
              {post.userPhoto && (
                <Link to={`/profile/${post.userId}`}>
                  <img src={post.userPhoto} alt="User" className="w-10 h-10 rounded-full mr-4" />
                </Link>
              )}
              <p className="text-gray-800"><strong>{post.userName}</strong></p>
            </div>
            <p className="text-gray-800 mt-2">{post.content}</p>
            {post.reply && (
              <div className="mt-4 customlist list-disc text-gray-600"><strong>AI:</strong> {renderReplyWithLinks(post.reply)}</div>
            )}
            <div className="flex space-between items-center space-x-4">
              <div className='space-x-3'>
                <button onClick={() => addReaction(post.id, 'thought')} className="p-2 rounded-full bg-gray-50 hover:bg-gray-300">
                  <img src={thought} alt="Thought Emoji" width="24" height="24" />
                  {post.reactions?.thought ?? 0}
                </button>
                <button onClick={() => addReaction(post.id, 'meh')} className="p-2 rounded-full bg-gray-50 hover:bg-gray-300">
                  <img src={meh} alt="Meh Emoji" width="24" height="24" />
                  {post.reactions?.meh ?? 0}
                </button>
                <button onClick={() => addReaction(post.id, 'love')} className="p-2 rounded-full bg-gray-50 hover:bg-gray-300">
                  <img src={love} alt="Love Emoji" width="24" height="24" />
                  {post.reactions?.love ?? 0}
                </button>
              </div>
            </div>
            <Link to={`/post/${post.id}`} className="bg-blue-50 rounded underline-none mt-2 block">
              reply
            </Link>
                        {user && post.userId === user.uid && (
              <button
                onClick={() => handleDelete(post.id, user.uid)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 mt-4"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

}


export default PostMessage 