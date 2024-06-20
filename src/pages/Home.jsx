import React from 'react';

const Home = () => {
  return (
    <div className="home-page">
      <div className="hero-section  flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-5xl mt-3  font-bold mb-6">Welcome to Ai Reply</h1>
          <p className="text-xl mb-8">Your personal AI assistant for engaging conversations.</p>
          <img src="/src/assets/ai-reply graphic.png" alt="Ai Reply Graphic" className="mx-auto w-full max-w-3xl rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default Home;