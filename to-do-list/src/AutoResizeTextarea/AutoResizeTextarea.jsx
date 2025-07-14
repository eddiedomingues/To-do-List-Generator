/* -- Auto Resize Textarea Component Script-- */
import React, { useEffect, useRef } from 'react';

function AutoResizeTextarea({ style, value, onChange, ...props }) {
  // Global Variables
  const textareaRef = useRef(null);

  // Resize function
  const resize = () => {
  
    const textarea = textareaRef.current;
    /* Detects if browser has "fieldSizing" compatibility using my custom cssCompatibility component */
    if (!textarea || window.cssCompatibility.isFieldSizingSupported) return;

    const computedStyle = window.getComputedStyle(textarea);

    /* Auto resize the width */
    const maxWidth = parseInt(computedStyle.getPropertyValue('max-width'), 10);
    
    textarea.style.whiteSpace = 'pre';
    textarea.style.width = 'auto';
    const scrollWidth = textarea.scrollWidth;
    textarea.style.whiteSpace = 'pre-wrap';

    // Apply the new width, respecting max-width
    if (maxWidth && scrollWidth > maxWidth) {
      textarea.style.width = `${maxWidth}px`;
    } else {
      // Add buffer
      textarea.style.width = `calc(${scrollWidth}px + ${0.9}rem)`;
    }

    /* Modify height */
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Resize on initial render and when value changes
  useEffect(() => {
    resize();
  }, [value]);

  const handleChange = (event) => {
    // Handle on value change
    if (onChange) {
      onChange(event);
    }
  };

  const initialStyles = {
    // These styles are essential for the script to work
    resize: 'none',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap', // Allows text to wrap when width is constrained
    wordWrap: 'break-word',
    boxSizing: 'border-box', // Ensures padding is included in the width
    ...style,
    fieldSizing: window.cssCompatibility.isFieldSizingSupported ? 'content' : []
  };

  return (
    <textarea
      ref={textareaRef}
      style={initialStyles}
      onChange={handleChange}
      value={value}
      rows={1}
      {...props}
    />
  );
}

export default AutoResizeTextarea;