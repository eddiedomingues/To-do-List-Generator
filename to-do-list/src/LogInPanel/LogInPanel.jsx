// Log In Panel component script
import React, {useState, useEffect, forwardRef, useRef} from 'react';

// Translation library
import { useTranslation } from 'react-i18next';

// Custom click outside function
import useClickOutside from '../CustomFunctions/ClickOutside.jsx';

// Styles
import styles from './LogInPanel.module.css';

// SVG Imports
import AccountImage from './account.svg?react';
import LogInImage from './log_in.svg?react';
import LogOutImage from './log_out.svg?react';

function LogInPanel({email, loggedIn, onRequestLogIn, onSignOut, ref, name}) {
    // Main variables
    const [isLoggedIn, setIsLoggedIn] = useState(loggedIn ? loggedIn : false);
    const [currentEmail, setEmail] = useState(email ? email : "");
    const [currentName, setName] = useState(name ? name : "");
    const [isPanelHidden, setPanelVis] = useState(true);

    // Translation library using default namespace
    const { t: mainT } = useTranslation("");

    // Toggle panel handler function
    const handleTogglePanel = () => {
        setPanelVis(v => !v)
    }

    // Custom hook to close the panel when user clicks outside of dropdown
      useClickOutside(ref, () => {
    if (!isPanelHidden) {
      setPanelVis(true);
    }
  });

  // Change the display of the component every time the user changes
    useEffect(() => {
        setIsLoggedIn(loggedIn);
        setEmail(email);
        setName(name)
    }, [email, loggedIn, name])

    // Handler function when the user signs out
    const handleSignOut = () => {
        onSignOut()
        setPanelVis(true)
    }

    return(
        <div ref={ref} className={styles['container']}>
            {/* Main Component */}
            <div className={"toolbar"}>
                {/* Main toolbar that's on the header, detects if user is logged in */}
                {isLoggedIn ? 
                 <button onClick={handleTogglePanel} className={styles['button']}><AccountImage className={`${styles['image']} ${isPanelHidden ? styles['deactivated'] : ""}`} /></button>
                 : 
                 <button onClick={onRequestLogIn} className={styles['button']}><LogInImage className={styles['image']} /><div className={styles['tooltip']}>{mainT("login_panel.buttonTooltip")}</div></button>
                 }
            </div>
            {/* Main account panel, shows when user is logged in */}
            <div className={styles['accountPanelWrapper']}>
                 <div className={`${styles['accountPanelContainer']} `}>
                <div className={`${styles['accountPanel']} ${isPanelHidden ? styles['hidden'] : ""}`}>
                    <div className={styles['accountPanel-email']}>{currentEmail}</div>
                    <div className={styles['accountPanelSeperator']}></div>
                    <div className={styles['accountPanel-heading']}>{mainT("login_panel.welcomeMessage")} <span className={styles['accountPanel-name']}>{currentName}</span>!</div>
                    <button onClick={handleSignOut} className={styles['logOutButton']}><span>{mainT("login_panel.logOutButton")}</span><LogOutImage className={styles['logOutButtonImage']} /></button>
                </div>
                </div>
            </div>
        </div>
    )
}

export default LogInPanel;