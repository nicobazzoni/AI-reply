import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signin');
    } else {
      navigate('/profile'); // Adjust the route based on where you want to take the user
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* Video background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="https://www.w3schools.com/howto/rain.mp4" // Replace with your techno-future video URL
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay with landing graphic */}
      <div className="relative z-10 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
        <div className="text-center text-white p-4 md:p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome  </h1>
          <h1 className='font-bold text-4xl md:text-6xl text-black tracking-widest'>AI Reply</h1>
          <p className="text-xl md:text-2xl mb-8">Your AI-powered communication and research assistant</p>
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;