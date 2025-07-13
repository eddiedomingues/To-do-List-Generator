// This script manages the auth of firebase and can share the environment through all of the scripts, this is for seamless integration of global contexes to all of the scripts
import { createContext, useContext, useState,  useEffect, useCallback} from "react";
import { useTranslation } from "react-i18next";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';

// Create a context
const AuthContext = createContext()

// Define a function to get the context
export const useAuth = () => useContext(AuthContext);

// Auth provider
export const AuthProvider = ({children}) => {
    // Global variables
    const [user, setUser] = useState(null)
    const auth = getAuth();

    
    // Translation Namespace References
  const { t: notificationsT } = useTranslation("notifications");

    // Detect when the auth state changes by attaching a hook and changing the user variable
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return unsubscribe;
    }, [auth])

    // Log Out Function
    const logOut = useCallback(() => {
        signOut(auth);
    }, [auth])

    // Log In function
    const logIn = useCallback((email, password) => {
        setPersistence(auth, browserSessionPersistence).then(() => {
    // Log In with persistence to keep user logged in after refreshing
    return signInWithEmailAndPassword(auth, email, password);
  }).catch((error) => {
    // In case of logIn error
    let message = error.code;
    switch (error.code) {
      case 'auth/user-not-found':
        break;
      case 'auth/wrong-password':
        break;
      case 'auth/invalid-email':
        break;
      case 'auth/too-many-requests':
        break;
      default:
        message = "default";
        break;
    }
    // Notify the user of the error and the reason why of this error
    window.notificationManager.error(notificationsT("login.errors.logInFail.heading"), notificationsT(`login.errors.logInFail.content.${message}`));
  })
    }, [auth, window.notificationManager]);

    const value = {user, logIn, logOut};

    // Share this context with a single Object variable

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}