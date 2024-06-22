import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PostMessage from './components/PostMessage';
import PostDetail from './components/PostDetail';
import SignIn from './components/SignIn'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, logOut } from './firebase';
import './App.css';

const App = () => {
  const [user, loading, error] = useAuthState(auth);

  return (
   
      <div className="container mx-auto bg-slate-25 p-4">
        <nav className="mb-4 flex justify-between items-center">
          <img className="rounded-full h-10 cursor-pointer hover:shadow-lg " src='/aireplylogo.png' />
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-black  hover:shadow-lg">Home</Link>
            </li>
            {user && (
              <li>
                <Link to="/post" className="text-black  hover:shadow-lg">Post Message</Link>
              </li>
            )}
            {!user && !loading && (
              <li>
                <Link to="/signin" className="text-black  hover:shadow-lg">Sign In</Link>
              </li>
            )}
          </ul>
          {user && (
            <button
              onClick={logOut}
              className="text-black hover:shadow-lg signout "
            >
              Sign Out
            </button>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          {user && <Route path="/post" element={<PostMessage userId={user.uid} />} />}
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </div>
   
  );
};

export default App;