import React, { useState, useEffect } from 'react';
import { signInWithGoogle, logOut, auth } from '../firebase';
import { getRedirectResult } from 'firebase/auth';


const SignIn = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setUser(result.user);
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
      setUser(result);
      setError('');
    } else {
      setError('Sign-in failed. Please try again.');
    }
  };

  const handleLogOut = () => {
    logOut();
    setUser(null);
  };

  return (
    <div className="flex items-center  justify-center min-h-screen">
      {user ? (
        <div className='space-y-2'>
           <p className='bg-slate-200 p-1 font-semibold rounded m-2'>Welcome, {user.displayName}</p>
            <img src="/ai-reply graphic.png" alt="Ai Reply Graphic" className="mx-auto w-full max-w-3xl h-60 rounded-lg shadow-lg" />
         
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