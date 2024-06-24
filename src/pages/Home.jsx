import React, { useRef, useState, useEffect } from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Video from "/rain.mp4";

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("safari") > -1 && ua.indexOf("chrome") < 0;
};

const Home = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const videoParentRef = useRef();
  const [shouldUseImage, setShouldUseImage] = useState(false);

  useEffect(() => {
    // check if user agent is safari and we have the ref to the container <div />
    if (isSafari() && videoParentRef.current) {
      // obtain reference to the video element
      const player = videoParentRef.current.children[0];

      // if the reference to video player has been obtained
      if (player) {
        // set the video attributes using javascript as per the
        // webkit Policy
        player.controls = false;
        player.playsInline = true;
        player.muted = true;
        player.setAttribute("muted", ""); // leave no stones unturned :)
        player.autoplay = true;

        // Let's wait for an event loop tick and be async.
        setTimeout(() => {
          // player.play() might return a promise but it's not guaranteed crossbrowser.
          const promise = player.play();
          // let's play safe to ensure that if we do have a promise
          if (promise.then) {
            promise
              .then(() => {})
              .catch(() => {
                // if promise fails, hide the video and fallback to <img> tag
                videoParentRef.current.style.display = "none";
                setShouldUseImage(true);
              });
          }
        }, 0);
      }
    }
  }, []);

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signin');
    } else {
      navigate('/profile');
    }
  };

  return shouldUseImage ? (
    <img src={mainVideo} alt="Muted Video" />
  ) : (
    <div className="relative h-screen overflow-hidden bg-black">
      <div
        ref={videoParentRef}
        className="absolute top-0 left-0 w-full h-full"
        dangerouslySetInnerHTML={{
          __html: `
          <video style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;" autoplay loop muted playsinline preload="metadata">
            <source src="${Video}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>`
        }}
      />

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