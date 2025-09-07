import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase'; // Import Firebase Auth service
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Auth listener

// 1. Create the Context object
const AuthContext = createContext();

// 2. Custom hook to easily use the auth context in any component
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. AuthProvider component to wrap your entire application
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Stores the logged-in user object
  const [loading, setLoading] = useState(true);         // Indicates if auth state is still being checked

  useEffect(() => {
    // This function subscribes to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // 'user' will be null if not logged in, or the user object if logged in
      setLoading(false);    // Auth state check is complete
    });

    // Cleanup function: unsubscribe when the component unmounts
    return unsubscribe;
  }, []); // Empty dependency array means this runs only once on mount

  // The value provided to all children components
  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when the auth state check is complete */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};