import React, { useState, useEffect } from 'react';
import { signInWithGoogle, auth } from '../firebase';
import { getRedirectResult } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

const SignIn = () => {
  const [user] = useAuthState(auth);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      navigate('/');
    } else {
      setError('Sign-in failed. Please try again.');
    }
  };

  const handleLogOut = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center ">
      {user ? (
        <div className='space-y-2'>
          <p className='bg-slate-50 p-1 font-semibold top-0 rounded '>Welcome, <span className='text-lg'>{user.displayName}</span> </p>
          <img src={user.photoURL} alt="User" className="mx-auto w-full rounded-lg shadow-lg" />
          <button
            onClick={handleLogOut}
            className="bg-red-500 text-white p-4 rounded-md w-full"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleSignIn}
            className="bg-blue-500 text-white p-4 rounded"
          >
            Sign in with Google
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default SignIn;