import React, { useRef, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Video from "/rain.mp4";

const Home = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, []);

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signin');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={Video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
        <div className="text-center text-white p-4 md:p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to AI Reply</h1>
          <p className="text-xl md:text-2xl mb-8">Your AI-powered communication assistant</p>
          {!user && (
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;