// CustomFunctions/useMediaQuery.js
// Custom media query for css detection using the media query 
import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a media query list object
    const media = window.matchMedia(query);

    // Set the initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // A listener function to update state on change
    const listener = () => {
      setMatches(media.matches);
    };

    // Add the listener
    media.addEventListener('change', listener);

    // Cleanup: remove the listener when the component unmounts
    return () => media.removeEventListener('change', listener);
  }, [matches, query]); // Re-run effect if query changes

  return matches;
}

export default useMediaQuery;