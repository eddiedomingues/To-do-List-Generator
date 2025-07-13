// Script to manage notification states
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Libaries
import { TransitionGroup } from 'react-transition-group';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// Notification component
import Notification from './Notification.jsx';
import styles from './Notifications.module.css';

/**
 * A component that renders notifications as a portal directly in the document body.
 * It manages its own state and exposes a global function (`window.addAppNotification`)
 * for other components to easily trigger new notifications.
 *
 * @param {object} props - The component props.
 * @param {number|string} props.zIndex - The z-index for the notification container.
 */
const Notifications = ({ zIndex, className, id, maxNotifications}) => {
    // --- STATE MANAGEMENT ---

    // `notifications` holds the array of notification objects to be displayed.
    const [notifications, setNotifications] = useState([]);
    // `parent` is the ref provided by auto-animate for the container element.
    const [parent] = useAutoAnimate();
    // `nextId` is a ref to keep track of the next unique ID for a notification.
    // Using useRef ensures the value persists across re-renders without causing them.
    const nextId = useRef(0);

    // --- HANDLERS ---

    /**
     * Adds a new notification to the state.
     * Memoized with useCallback to ensure a stable function reference.
     */
    const addNotification = useCallback((notification) => {
        // Create a new notification object with a unique ID.
        const newNotification = { ...notification, id: nextId.current++ };
        // Add the new notification to the existing array.
        setNotifications((prevNotifications) => [
            ...prevNotifications,
            newNotification,
        ]);
    }, []); // Empty dependency array means this function is created only once.

    /**
     * Removes a notification from the state by its ID.
     * Memoized with useCallback for a stable function reference.
     */
    const dismissNotification = useCallback((idToDismiss) => {
        setNotifications((prevNotifications) =>
            prevNotifications.filter(
                (notification) => notification.id !== idToDismiss
            )
        );
    }, []); // Empty dependency array means this function is created only once.

        // Handling the dismissal of notifications
    useEffect(() => {
        // Check if the prop of "maxNotifications" exists
        if (maxNotifications) {
            // Check if the number of notifications exceeds the limit
            if (maxNotifications < notifications.length) {
                // Calculate the number of notifications to dismiss
                // I am doing this to only dismiss the oldest notifications
                let numToDismiss = notifications.length - maxNotifications;
                notifications.map((notification, index) => {
                    if (numToDismiss != 0) {
                        dismissNotification(notification.id)
                        numToDismiss --
                    }
                })
            }
        }
    }, [maxNotifications, notifications]) // Rerun this every time the notifications change or when the maxNotifications variable changes

    // --- SIDE EFFECTS ---

    /**
     * Attaches the `addNotification` function to the global `window` object
     * when the component mounts, and cleans it up when it unmounts.
     * This creates a global API for other parts of the app to use.
     */
    useEffect(() => {
        // Expose the function globally.
        window.addAppNotification = addNotification;

        // Cleanup function: remove the global function when the component unmounts.
        return () => {
            delete window.addAppNotification;
        };
    }, [addNotification]); // Re-run the effect only if `addNotification` changes.

    // --- STYLES ---

    // Define inline styles for the container, primarily for z-index.
    const containerStyles = {
        zIndex: zIndex ? zIndex : '1000',
    };

    // --- RENDER ---

    // Use createPortal to render the notifications outside the main component tree,
    // directly into the document.body. This is ideal for modals and notifications.
    return createPortal(
        <div id={id ? id : ""} ref={parent} style={containerStyles} className={`${styles['container']} ${className ? className : ""}`}>
            <TransitionGroup component={null}>
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        onDismiss={dismissNotification}
                        notification={notification}
                        className={notification.className ? notification.className : ""}
                        closeButtonClassName={notification.closeButtonClassName ? notification.closeButtonClassName : ""}
                        contentContainerClassName={notification.contentContainerClassName ? notification.contentContainerClassName : ""}
                        iconContainerClassName={notification.iconContainerClassName ? notification.iconContainerClassName : ""}
                        timerClassName={notification.timerClassName}
                        closeContainerClassName={notification.closeContainerClassName ? notification.closeContainerClassName : ""}
                    />
                ))}
            </TransitionGroup>
        </div>,
        document.body
    );
};

export default Notifications;