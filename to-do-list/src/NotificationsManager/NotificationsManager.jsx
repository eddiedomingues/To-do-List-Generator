// -- Main Notification Script -- \\
/*
    This script builds upon the notifications component that I made and 
    adds custom notification functions
*/

// -- Imports --

import React, { useCallback } from "react";

// -- Notifications Component
import Notifications from "../Notifications/Notifications.jsx";


// -- SVGs necessary for the notifications
import InfoImage from './info.svg?react';
import WarningImage from './warning.svg?react';
import ErrorImage from './error.svg?react';
import SuccessImage from './success.svg?react';

function NotificationsManager() {
     // Notification Functions
     // Single variable for more readable code

        const notificationClasses = {
            className: "appNotification",
                    closeButtonClassName: "appNotification-closeButton",
                    iconContainerClassName: "appNotification-iconContainer",
                    contentContainerClassName: "appNotification-contentContainer",
                    timerClassName: "appNotification-timer",
                    closeContainerClassName: "appNotification-closeContainer"
        }
        const info = useCallback((heading, text) => {
                window.addAppNotification({footer: <h3 className="notificationHeading">{heading}</h3>,
                    content: <><span className="notificationContent">{text}</span></>,
                    icon: <InfoImage className={"notification-info"}></InfoImage>,
                    autoDismiss: true,
                    ...notificationClasses
                });
        }, [window.addAppNotification])

                const warning = useCallback((heading, text) => {
                window.addAppNotification({footer: <h3 className="notificationHeading">{heading}</h3>,
                    content: <><span className="notificationContent">{text}</span></>,
                    icon: <WarningImage className={"notification-warning"}></WarningImage>,
                    backgroundColor: "rgba(105, 86, 0, 0.22)",
                    autoDismiss: true,
                    autoDismissTimer: 5000,
                    ...notificationClasses
                });
        }, [window.addAppNotification])

                const error = useCallback((heading, text) => {
               window.addAppNotification({footer: <h3 className="notificationHeading">{heading}</h3>,
                    content: <><span className="notificationContent">{text}</span></>,
                    icon: <ErrorImage className={"notification-error"}></ErrorImage>,
                    backgroundColor: "rgba(105, 0, 0, 0.22)",
                    autoDismiss: true,
                    autoDismissTimer: 10000,
                    ...notificationClasses
                });
        }, [window.addAppNotification])
                const success = useCallback((heading, text) => {
               window.addAppNotification({footer: <h3 className="notificationHeading">{heading}</h3>,
                    content: <><span className="notificationContent">{text}</span></>,
                    icon: <SuccessImage className={"notification-error"}></SuccessImage>,
                    backgroundColor: "rgba(0, 105, 0, 0.22)",
                    autoDismiss: true,
                    autoDismissTimer: 7000,
                    ...notificationClasses
                });
        }, [window.addAppNotification])

        // Attach it to the 'window' variable for global access through usage of 'window.app'
            React.useEffect(() => {
                window.notificationManager = {
                    error: error,
                    info: info,
                    success: success,
                    warning: warning
                }
                return () => {
                    delete window.notificationManager;
                };
            }, [info, warning, success, error, window.addAppNotification]);
}
export default NotificationsManager;