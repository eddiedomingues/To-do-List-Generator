import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
} from "react";

// Translation Library
import { useTranslation } from "react-i18next";

// Flag Library
import { CircleFlag } from "react-circle-flags";

// Main App CSS
import "./App.css";

// Component Imports

// Main To-Do List
import CssSupportVars from "./CssSupport/CssSupport.jsx";
import ToDoList from "./TodoList/ToDoList.jsx";

// Other Components
import Window from "./Window/Window.jsx";
import Select from "./Select/Select.jsx";
import DynamicTitle from "./DynamicTitle/DynamicTitle.jsx";
import LogInPanel from "./LogInPanel/LogInPanel.jsx";

// Notifications
import Notifications from "./Notifications/Notifications.jsx";
import NotificationsManager from "./NotificationsManager/NotificationsManager.jsx";

// Custom Hooks
import useMediaQuery from './CustomFunctions/useMediaQuery.jsx';

// Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Custom Auth Context Component for Firebase
import { AuthProvider, useAuth } from "./Firebase/AuthContext";

// My web app firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZd9URDIkAB8zFh5JNoHt_PO6ByjR-SG0",
  authDomain: "todo-list-generator.firebaseapp.com",
  projectId: "todo-list-generator",
  storageBucket: "todo-list-generator.firebasestorage.app",
  messagingSenderId: "521455840398",
  appId: "1:521455840398:web:2225eb9c58d656ca5e2ddf",
  measurementId: "G-95X610XD0R"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

function AppContent() {
  // Firebase Auth
  const { user, logIn, logOut } = useAuth();

  // CSS Support Global Vars
  const [isLogInWindowVis, setLogInVis] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(user ? true : false);
  const [email, setEmail] = useState(user ? user.email : "");
  const [name, setName] = useState(user ? user.displayName : "");
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const logginPanelRef = useRef(null);

  // Detect if the device is on mobile
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Translation Namespace References
  const { t: mainT } = useTranslation("");
  const { t: notificationsT } = useTranslation("notifications");
  const { t: windowsT } = useTranslation("windows");

  const handleSignIn = useCallback(() => {
    if (passwordRef === null || emailRef === null) {
      console.log("Error, no password or email detected");
      return;
    }
    logIn(emailRef.current.value, passwordRef.current.value);
  }, [emailRef, passwordRef, logIn, window.notificationManager]);

  useEffect(() => {
    // Expose the function globally.
    window.cssCompatibility = CssSupportVars;

    // Cleanup function: remove the global function when the component unmounts.
    return () => {
      delete window.cssCompatibility;
    };
  }, [window, CssSupportVars]);

  // Handle signout function
  const handleSignOut = useCallback(() => {
    logOut();
  }, [logOut]);

  // Detect when user is changed
  useEffect(() => {
    if (user && user !== null) {
      const lastSignIn = new Date(user.metadata.lastSignInTime);
      const now = new Date();

      // Calculate the difference in seconds
      const timeDifference = (now.getTime() - lastSignIn.getTime()) / 1000;
      // If the last sign-in was less than 5 seconds ago, treat it as a new login
      if (timeDifference < 5) {
        // Notify of successful login
        window.notificationManager.success(
          `${notificationsT("login.successes.loggedIn.heading")} ${
            user.displayName
          }!`,
          `${notificationsT("login.successes.loggedIn.heading")} ${user.email}`
        );
      }
      // Set the display to the user credentials and update the logInPanel
      setEmail(user.email);
      setName(user.displayName);
      setLoggedIn(true);
      setLogInVis(false);
    } else {
      setLoggedIn(false);
    }
  }, [user]);

  // Run translation library
  const { i18n } = useTranslation();

  // Main App Icon (Use public asset folder import)
  const iconImage = `${import.meta.env.BASE_URL}favicon.png`;

  // Handle the language change from the select
  const handleChangeLanguage = useCallback(
    (value) => {
      // Check if the language is actually different to prevent unnecessary changes
      if (i18n.language !== value) {
        i18n.changeLanguage(value);
      }
    },
    [i18n]
  ); // Check for existence

  // Handler functions
  const handleLogInWindowVis = useCallback(() => {
    setLogInVis(true);
  });

  const handleCloseLogInWindow = useCallback(() => {
    setLogInVis(false);
  });

  const handleLoggedIn = useCallback(() => {
    setLogInVis(vis);
  });

  // Main App
  return (
    <>
      <Window
        className="appWindow logInWindow"
        onClose={handleCloseLogInWindow}
        visible={isLogInWindowVis}
      >
        <Window.Header>
          <h2 className="text-heading">{windowsT("logIn.heading")}</h2>
        </Window.Header>
        <Window.Content>
          <form className="logInWindow-Content">
            <div>
              <label htmlFor="email">
                {windowsT("logIn.content.email.label")}
              </label>
              <input
                autoComplete="email"
                name="email"
                ref={emailRef}
                type="text"
                placeholder={windowsT("logIn.content.email.placeholder")}
              ></input>
            </div>
            <div>
              <label htmlFor="password">
                {windowsT("logIn.content.password.label")}{" "}
              </label>
              <input
                autoComplete="current-password"
                name="password"
                ref={passwordRef}
                type="password"
                placeholder={windowsT("logIn.content.password.placeholder")}
              ></input>
            </div>
          </form>
        </Window.Content>
        <Window.Footer>
          <button onClick={handleSignIn} className="logInWindow-button">
            {windowsT("logIn.footer.logInButton")}
          </button>
        </Window.Footer>
      </Window>
      <Notifications maxNotifications={isMobile ? 2 : 8} id="appNotificationsContainer" zIndex={1002}></Notifications>
      <NotificationsManager />
      <DynamicTitle />
      <div className="appHeader">
        <div className="appHeaderContainer">
          <img className="appIcon" src={iconImage} />
          <span className={`mainAppHeading`}>{mainT("title")}</span>
          <Select
            onChange={handleChangeLanguage}
            defaultValue={i18n.language}
            className="select languageSelect"
            contentClassName="selectContent languageSelect-content"
            contentWrapperClassName="selectContentWrapper"
            toggleButtonClassName="selectToggleButton"
            headerClassName="selectHeader"
            optionClassName="selectOption"
          >
            <Select.Option value="en">
              <CircleFlag countryCode="us" height="22" />
            </Select.Option>
            <Select.Option value="es">
              <CircleFlag countryCode="es" height="22" />
            </Select.Option>
            <Select.Option value="pt">
              <CircleFlag countryCode="pt" height="22" />
            </Select.Option>
            <Select.Option value="fr">
              <CircleFlag countryCode="fr" height="22" />
            </Select.Option>
          </Select>
          <LogInPanel
            onSignOut={handleSignOut}
            ref={logginPanelRef}
            email={email}
            onRequestLogIn={handleLogInWindowVis}
            loggedIn={isLoggedIn}
            name={name}
          />
        </div>
      </div>
      <ToDoList />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
