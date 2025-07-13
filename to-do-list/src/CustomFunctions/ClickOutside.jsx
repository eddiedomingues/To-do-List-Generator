// hooks/useClickOutside.js
import { useEffect } from 'react';

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Check if the ref parameter is an array or a single variable
      if (ref.constructor === Array) {
        // If is array loop through the array references and check if the ref contains the event target
        let contains = false;
        ref.map((newRef) => {
          if (newRef.current) {
            if (newRef.current.contains(event.target)) {
                contains = true;
              }
          }
          })
          if (contains) {
            return;
          }
          handler(event);
          // Otherwise, call the provided handler function
      } else {
        // Check if ref contains event.target
        if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
      }      
      // Otherwise, call the provided handler function
    };

    // Add the event listeners
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Cleanup function to remove the listeners
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Re-run the effect if ref or handler changes
}

export default useClickOutside;