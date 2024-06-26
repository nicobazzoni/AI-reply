import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserProfile, saveUserProfile } from '../firebaseFunctions';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Profile = () => {
  const { userId } = useParams();
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (userId) {
      getUserProfile(userId).then((data) => {
        console.log('User data:', data);
        setProfileData(data || {});
        setBio(data?.bio || '');
      }).catch((error) => {
        console.error('Error fetching user profile:', error);
      });
    }
  }, [userId]);

  const handleSave = async () => {
    if (user && user.uid === userId) {
      await saveUserProfile(userId, { bio });
      setIsEditing(false);
      getUserProfile(userId).then((data) => setProfileData(data));
    }
  };

  



  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex items-center space-x-4">
        {profileData.photoURL ? (
          <img className="w-24 h-24 rounded-full object-cover" src={profileData.photoURL} alt="Profile" />
        ) : (
          <p>No profile image</p>
        )}
        <div>
          <h3 className="text-2xl font-bold">{profileData.displayName || 'No display name'}</h3>
          {isEditing ? (
            <div className="mt-4">
              <textarea
                className="p-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <button
                onClick={handleSave}
                className="mt-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-gray-700">{profileData.bio || 'No bio available'}</p>
              {user && user.uid === userId && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 p-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                >
                  Edit Bio
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;