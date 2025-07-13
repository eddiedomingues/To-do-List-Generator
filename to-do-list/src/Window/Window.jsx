// -- Main Window component script -- \\
import React, { useState, useEffect, useRef, useCallback } from "react";

// -- Imports --

// Window CSS Module
import styles from "./Window.module.css";

// Window Close Button SVG
import CloseImage from "./close.svg?react";

// -- Variable Declerations --
// -- Custom Element Tags for this component
const WindowHeader = ({ children, className }) => (
  <div className={`${styles.header} ${className || ""}`}>
    <div className={styles.headerContent}>{children}</div>
  </div>
);

const WindowContent = ({ children, className }) => (
  <div className={`${styles.content} ${className || ""}`}>{children}</div>
);

const WindowFooter = ({ children, className }) => (
  <div className={`${styles.footer} ${className || ""}`}>{children}</div>
);

// -- Main Component Function --
function Window({
  children,
  visible,
  initialWidth,
  initialHeight,
  onClose,
  zIndex,
  maxWidth,
  className,
}) {
  // -- Main Variables
  const windowRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(visible);
  const [isActive, setIsActive] = useState(false);

  // -- Other variable declerations

  // Find sub custom elements within the children of the component
  let headerElement = null;
  let contentElement = null;
  let footerElement = null;

  React.Children.forEach(children, (child) => {
    if (child.type === WindowHeader) {
      headerElement = child;
    } else if (child.type === WindowContent) {
      contentElement = child;
    } else if (child.type === WindowFooter) {
      footerElement = child;
    }
  });

  // Dynamic Classes
  const containerClasses = `${styles.container} ${
    isActive ? styles["is-active"] : ""
  }`;
  const backdropClasses = `${styles.backdrop} ${
    isActive ? styles["is-active"] : ""
  }`;
  const windowClasses = `${styles.window} ${
    isActive ? styles["is-active"] : ""
  }`;

  // Custom Window styles passed from props
  const windowStyle = {
    width: initialWidth != null ? initialWidth : "",
    height: initialHeight != null ? initialHeight : "",
    maxWidth: maxWidth != null ? maxWidth : "inherit",
  };

  // -- Events and callbacks

  // Managing Rending in and out
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      const timeoutId = setTimeout(() => {
        setIsActive(true);
      }, 10);
      return () => clearTimeout(timeoutId);
    } else {
      setIsActive(false);
    }
  }, [visible]);

  // This callback handles unmounting AFTER the 'out' animation finishes
  const handleTransitionEnd = useCallback(() => {
    if (!visible) {
      setShouldRender(false);
    }
  }, [visible]);

  // Handle On Close
  const handleCloseClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // -- Main Code

  // Make Window disapear from HTML if hidden
  if (!shouldRender) {
    return null;
  }

  // Main Element
  return (
    <div className={containerClasses} style={{ zIndex: zIndex || 1000 }}>
      <div className={backdropClasses} onClick={handleCloseClick}></div>
      <div
        ref={windowRef}
        style={windowStyle}
        className={`${windowClasses} ${className || ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {/* Header Element */}
            {headerElement}
          </div>
          <div className={styles.nav}>
            <button onClick={handleCloseClick} className={styles.closeButton}>
              <CloseImage className={styles.closeImage} />
            </button>
          </div>
        </div>

        {/* Content Element */}
        {contentElement}

        {/* Footer Element */}
        {footerElement}
      </div>
    </div>
  );
}

// --- Assign the stable sub-components to the main component ---
Window.Header = WindowHeader;
Window.Content = WindowContent;
Window.Footer = WindowFooter;

export default Window;