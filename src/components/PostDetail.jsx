import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, doc, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [user] = useAuthState(auth);

    useEffect(() => {
        const postRef = doc(db, 'posts', postId);
        const unsubscribePost = onSnapshot(postRef, (doc) => {
            setPost(doc.data());
        });

        const repliesRef = collection(db, 'posts', postId, 'replies');
        const unsubscribeReplies = onSnapshot(repliesRef, (querySnapshot) => {
            const repliesArray = [];
            querySnapshot.forEach((doc) => {
                repliesArray.push(doc.data());
            });
            setReplies(repliesArray);
        });

        return () => {
            unsubscribePost();
            unsubscribeReplies();
        };
    }, [postId]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent || !user) return;

        const replyRef = collection(db, 'posts', postId, 'replies');
        await addDoc(replyRef, {
            content: replyContent,
            userId: user.uid,
            userName: user.displayName,
            userPhoto: user.photoURL, // Ensure userPhoto is included
            createdAt: serverTimestamp(),
        });
        setReplyContent('');
    };

    return (
        <div className="container mx-auto p-4">
            {post && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-4">
                    <h2 className="text-2xl font-bold mb-2">{post.content}</h2>
                    <div className="flex items-center">
                        {post.userPhoto && (
                            <img src={post.userPhoto} alt="User" className="w-10 h-10 rounded-full mr-4" />
                        )}
                        <p className="text-gray-800"><strong>{post.userName}</strong></p>
                    </div>
                </div>
            )}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4">Replies</h3>
                {replies.map((reply, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex items-center mb-2">
                            {reply.userPhoto && (
                                <img src={reply.userPhoto} alt="User" className="w-8 h-8 rounded-full mr-2" />
                            )}
                            <p className="text-gray-800"><strong>{reply.userName}</strong></p>
                        </div>
                        <p className="text-gray-800">{reply.content}</p>
                    </div>
                ))}
            </div>
            {user ? (
                <form onSubmit={handleReplySubmit} className="bg-white shadow-md rounded-lg p-6">
                    <textarea
                        className="p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        required
                    />
                    <button
                        type="submit"
                        className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-4"
                        style={{
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            transition: 'box-shadow 0.3s ease-in-out',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.boxShadow = '0px 8px 12px rgba(0, 0, 0, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)'}
                    >
                        Reply
                    </button>
                </form>
            ) : (
                <p className="text-red-500 mt-4">You must be signed in to post a reply.</p>
            )}
        </div>
    );
};

export default PostDetail;