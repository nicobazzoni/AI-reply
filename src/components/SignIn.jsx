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
    <div className="flex items-center justify-center min-h-screen">
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button
            onClick={handleLogOut}
            className="bg-red-500 text-white p-4 rounded"
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