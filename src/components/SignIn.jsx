import React, { useState, useRef, useEffect } from 'react';
import { signInWithGoogle, auth } from '../firebase';
import { getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import Video from '/rain.mp4';

const SignIn = () => {
  const [user] = useAuthState(auth);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, []);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setError('');
        }
      } catch (error) {
        console.error('Error getting redirect result:', error.message);
      }
    };
    checkRedirectResult();
  }, []);

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result) {
      setError('');
      navigate('/post');
    } else {
      setError('Sign-in failed. Please try again.');
    }
  };

  const handleLogOut = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden bg-black">
      {user ? (
        <div className="space-y-2">
          <p className="bg-slate-50 p-1 font-semibold top-0 rounded">Welcome, <span className="text-lg">{user.displayName}</span></p>
          <img src={user.photoURL} alt="User" className="mx-auto w-full rounded-lg shadow-lg" />
          <button
            onClick={handleLogOut}
            className="bg-red-500 text-white p-4 rounded-md w-full"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <button
            onClick={handleSignIn}
            className="bg-blue-500 text-white p-4 rounded"
          >
            Sign in with Google
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={Video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default SignIn;