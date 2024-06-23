import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import PostMessage from './components/PostMessage';
import PostDetail from './components/PostDetail';
import SignIn from './components/SignIn'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, logOut as firebaseLogOut } from './firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPenToSquare, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './App.css';

import { useLocation } from 'react-router-dom';

const App = () => {
  const [user, loading, error] = useAuthState(auth);
    const location = useLocation();
  console.log(user, 'yes');
  const navigate = useNavigate();
  
  const handleLogOut = () => {
    firebaseLogOut();
    navigate('/');
  };

  return (
      <div className="container items-center mx-auto bg-slate-25 p-4">
      
       
        <nav className="mb-4 p-2 flex justify-between items-center border-black border-b ">
          <ul className="flex space-x-4 items-center">
            <li>
              <Link to="/" className="text-black rounded-full p-1 hover:shadow-lg">
              <img src='replybot.png' className='w-10 h-10 object-cover rounded-full shadow-lg ' />
              </Link>
            </li>
            {user && (
              <>
              
                <li className="flex items-center space-x-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-black font-semibold">{user.displayName}</span>
                </li>

              </>
              
            )}
             {user && location.pathname !== '/post' && (
            <li>
              <Link to="/post" className="text-black rounded-full p-1 hover:shadow-lg">
                <FontAwesomeIcon icon={faPenToSquare} />
              </Link>
            </li>
          )}
            {!user && !loading && (
              <li>
                <Link to="/signin" className="text-black rounded-full p-1 hover:shadow-lg">
                  <FontAwesomeIcon icon={faRightFromBracket}/>
                </Link>
              </li>
            )}
          </ul>
          {user && (
            <button
              onClick={handleLogOut}
              className="text-black hover:shadow-lg signout "
            >
              <FontAwesomeIcon icon={faRightFromBracket}/>
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