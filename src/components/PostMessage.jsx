import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PostMessage = () => {
  const [content, setContent] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        // Check if the user is recognized before adding the post
        if (postData.userName ) {
          postsArray.push(postData);
          console.log('Post Data:', );
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

      <div className="timeline" >
      
        {posts.map((post, index ) => (
              
          <div key={index} className="bg-white shadow-md rounded-lg p-6 mb-4">
            
            <div className="flex items-center">
              {console.log("User Photo URL: ", post.userPhoto)}
              {post.userPhoto && (
                <img src={post.userPhoto} alt="User" className="w-10 h-10 rounded-full mr-4" />
              )}
              <p className="text-gray-800"><strong>{post.userName}</strong></p>
            </div>
            <p className="text-gray-800 mt-2"> {post.content}</p>
            {post.reply && (
              <div className="mt-4 text-gray-600"><strong>AI:</strong> {renderReplyWithLinks(post.reply)}</div>
            )}
            <Link to={`/post/${index}`} className="text-blue-500 hover:underline mt-2 block">
              View Post Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostMessage;

