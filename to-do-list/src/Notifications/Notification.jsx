// Script for each notification
import React, { useRef, useEffect } from 'react';

// library for complex animations
import { CSSTransition } from 'react-transition-group';

import styles from './Notifications.module.css';
import CloseImage from './close.svg?react';
import { useLayoutEffect } from 'react';

/**
 * A single notification component responsible for its own appearance,
 * animations, and dismissal logic.
 *
 * @param {object} props - The component props.
 * @param {object} props.notification - The notification data object.
 * @param {function} props.onDismiss - Callback function to dismiss the notification.
 * @param {boolean} props.in - Prop from TransitionGroup to control the animation state.
 */
const Notification = ({ notification, onDismiss, in: inProp, className, closeButtonClassName, iconContainerClassName, contentContainerClassName, timerClassName}) => {
    // --- REFS ---

    // A ref for the CSS Transition library
    const nodeRef = useRef(null);
    const loaderRef = useRef(null);
    const loaderPathRef = useRef(null);

    // --- SIDE EFFECTS ---

    // This effect handles the auto-dismiss functionality.
    useEffect(() => {
        // Only set up a timer if the autoDismiss flag is true.
        if (notification.autoDismiss) {
            const timer = setTimeout(() => {
                onDismiss(notification.id);
            }, (notification.autoDismissTimer ? notification.autoDismissTimer : 5000));

            // Cleanup function: clear the timer if the component unmounts
            // or if dependencies change before the timer fires.
            return () => clearTimeout(timer);
        }
    }, [notification.id, onDismiss]);

    useLayoutEffect(() => {
        if (loaderRef && loaderPathRef) {
            if (loaderRef.current && loaderPathRef.current) {
                const circumference = loaderPathRef.current.getTotalLength();
                loaderRef.current.style.setProperty('--circumference', circumference);
            }
        }
    }, [])

    // --- HANDLERS ---

    // Handles the click event on the close button.
    const handleCloseClick = () => {
        onDismiss(notification.id);
    }

    // --- STYLES ---

    // Dynamically computes the inline style for the notification's background color.
    const notifStyles = {
        backgroundColor: (notification.backgroundColor ? notification.backgroundColor : "rgb(105 105 105 / 22%)"),
    }

    const notifClasses = `${styles['notification']} ${className ? className : ""}`
    const closeButtonClasses = `${styles['close-button']} ${closeButtonClassName ? closeButtonClassName : ""}`
    const iconClasses = `${styles['notification-icon']} ${iconContainerClassName ? iconContainerClassName : ""}`
    const contentClasses = `${styles['contentContainer']} ${contentContainerClassName ? contentContainerClassName : ""}`
    const timerClasses = `${styles['loaderContainer']} ${timerClassName ? timerClassName : ""}`
    // --- RENDER ---

    return (
        <CSSTransition
            nodeRef={nodeRef}
            timeout={300}
            appear={true}
            unmountOnExit
            in={inProp}
            classNames={{
                appear: styles['notification-enter'],
                appearActive: styles['notification-enter-active'],
                enter: styles['notification-enter'],
                enterActive: styles['notification-enter-active'],
                // THE FIX: Tell React which class defines the component's final, resting state.
                enterDone: styles['notification-enter-done'],
                exit: styles['notification-exit'],
                exitActive: styles['notification-exit-active'],
            }}
        >
            <div style={notifStyles} ref={nodeRef} className={notifClasses}>
                <div className={iconClasses}>{notification.icon}</div>
                <div className={contentClasses}>
                    <div className={styles['footer']}>
                        <div className={styles['footer-content']}>{notification.footer}</div>
                        <div className={styles['closeContainer']}>
                            {
                                notification.autoDismiss ?
                                <div className={timerClasses}>
                                  <svg 
    ref={loaderRef} 
    className={styles['loader']} 
    style={{"--time": `${notification.autoDismissTimer ? notification.autoDismissTimer : 5000}ms`}} 
    viewBox="0 0 48 48"
>
    {/* Add cx, cy, and r to the track circle */}
    <circle 
        className={`${styles["loader-circle"]} ${styles["loader-track"]}`}
        cx="24" 
        cy="24" 
        r="20"
    ></circle>

    {/* Add the same attributes to the path circle */}
    <circle 
        ref={loaderPathRef} 
        className={`${styles["loader-circle"]} ${styles["loader-path"]}`}
        cx="24" 
        cy="24" 
        r="20"
    ></circle>
</svg>
</div>
                                :
                                []
                            }
                            <button onClick={handleCloseClick} className={closeButtonClasses}>
                                <CloseImage className={styles['close-image']} />
                            </button>
                        </div>
                    </div>
                    <div className={styles['content-container']}>{notification.content}</div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default Notification;
