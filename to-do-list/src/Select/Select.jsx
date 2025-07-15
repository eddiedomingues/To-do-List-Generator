/* Select component script */
import React, { useState, useEffect, useRef , useLayoutEffect, useCallback} from "react";
import { createPortal } from 'react-dom'; // 👈 Import createPortal

// Custom click outside function
import useClickOutside from '../CustomFunctions/ClickOutside.jsx';

// Styles for this component
import styles from './Select.module.css';

// SVG Imports
import UpImage from './up.svg?react';
import DownImage from './down.svg?react';

// Custom html tag component for options for the select
const SelectOption = ({ children, className, value, onClick}) => (
    <div data-value={value} className={`${styles.option} ${className || ''}`} onClick={onClick}>
        {children}
    </div>
);

function Select({style, children, defaultValue, placeholder, onChange, className, contentClassName, toggleButtonClassName, headerClassName, contentWrapperClassName, optionClassName, width}) {
    /* -- Main variables --*/
    const [currentVal, setCurrentValue] = useState(defaultValue || "");
    const [isOpen, setIsOpen] = useState(false);

    // Shadow styles for the custom shadow
    const [shadowStyles, setShadowStyles] = useState({"--height" : "0px", "--width" : "0px"})

 
    // Synchronised with variable
    const [syncedWidth, setSyncedWidth] = useState(width ? {width: width, customWidth: true} : {width: "fit-content", customWidth: false});
    
    // Position for the options portal
    const [portalPosition, setPortalPosition] = useState({ top: 0, left: 0});

    // Option styles
    const [optionsStyles, setOptionsStyles] = useState({})

    // Direction of dropdown
    const [dropdownDirection, setDropdownDirection] = useState('--down');

    // Main references
    const selectRef = useRef(null);
    const optionsRef = useRef(null);
    const optionsWrapperRef = useRef(null);

    // Resize select function
    const resizeSelect = useCallback(() => {
        // --- 1. Measure Everything ---
                const selectRect = selectRef.current.getBoundingClientRect();
                const optionsHeight = optionsRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;

                var newShadowStyles = {}

                // --- 2. Detect Collision ---
                const spaceBelow = viewportHeight - selectRect.bottom;
                const willOverflow = spaceBelow < optionsHeight;

                // --- 3. Calculate Position ---
                const selectStyles = window.getComputedStyle(selectRef.current);
                const optionsStyles = window.getComputedStyle(optionsRef.current);
                
                // Local variables
                // Top Position for the options
                let topPosition;

                // Current direction of the select to use for the shadow
                let currentDirection = ""

                // If it will overflow
                if (willOverflow) {
                    // Position above
                    topPosition = selectRect.top + window.scrollY - optionsHeight;
                    setDropdownDirection('--up');
                    currentDirection = "up"
                    // Set the custom shadow styles in accordance with the options direction, this is the borders
                    newShadowStyles = {
                        "--border-top-right-radius" : optionsStyles.borderTopRightRadius,
                    "--border-top-left-radius" : optionsStyles.borderTopLeftRadius,
                    "--border-bottom-right-radius" : selectStyles.borderBottomRightRadius,
                        "--border-bottom-left-radius" : selectStyles.borderBottomLeftRadius
                }
                // Position
                newShadowStyles = {...newShadowStyles, "--bottom": `${selectRect.bottom}px`}
                } else {
                    // Down direction
                    currentDirection = "down"
                    // Measure the height that the options will fit into down
                    const newHeight = `${viewportHeight - (selectRect.y + selectRect.height)}px`
                                                           newShadowStyles = {
                        "--border-top-right-radius" : selectStyles.borderTopRightRadius,
                    "--border-top-left-radius" : selectStyles.borderTopLeftRadius,
                    "--border-bottom-right-radius" : optionsStyles.borderBottomRightRadius,
                        "--border-bottom-left-radius" : optionsStyles.borderBottomLeftRadius
                }
                // Set a max height to allow scroll
                    setOptionsStyles({maxHeight: newHeight})
                    // Set the top position for the options
                    topPosition = selectRect.bottom + window.scrollY;
                    //Set dropdown direction to allow user to change styles
                    setDropdownDirection('--down');
                    // Set the custom shadow styles in accordance with the options direction, this is the borders
                    newShadowStyles = {...newShadowStyles, "--top": `${selectRect.top}px`}
                }
                // Set the position of the custom shadow
                newShadowStyles = {...newShadowStyles, left: `${(selectRect.left + window.scrollX)}px`}
                    setPortalPosition({
                    top: topPosition,
                    left: selectRect.left + window.scrollX,
                });
                // Width resizing
                // React of the options wrapper
                const wrapperRect = optionsWrapperRef.current.getBoundingClientRect();
                // Main styles of the select ref
                const mainStyles = window.getComputedStyle(selectRef.current)
                // Main options node
                const optionsNode = optionsRef.current
                // Check if it has a scroll bar and measure that width and put it onto the width calculation
                const hasScrollbar = optionsNode.scrollHeight > optionsNode.clientHeight;
                const scrollbarWidth = hasScrollbar ? (optionsNode.offsetWidth - optionsNode.clientWidth) : 0;
                    const optionsContentWidth = wrapperRect.width;
                const headerWidth = selectRef.current.offsetWidth;
                // The final width required
            const requiredOptionsWidth = optionsContentWidth + scrollbarWidth;

            console.log(`Width: ${width}`)
            // Check if the width prop was passed down in the props of this component
            if (width === undefined) {
                // If there is no width variable resize the width to fit content
                // Set shadow
                const maxWidth = Math.max(headerWidth, requiredOptionsWidth);
                // Set the custom shadow's styles
                newShadowStyles = {...newShadowStyles, "--width" : `${maxWidth}px`}
                setShadowStyles((v) => {return{...v, ...newShadowStyles}})
                setSyncedWidth({width: maxWidth+"px", customWidth: false});
                // Resize observer to add a custom class defining if it has a scrollbar or not
  const observer = new ResizeObserver(() => {
    const hasScrollbar = optionsNode.scrollHeight > optionsNode.clientHeight;
    if (hasScrollbar) {
      optionsNode.classList.add('has-scrollbar');
    } else {
      optionsNode.classList.remove('has-scrollbar');
    }
  });
  observer.observe(optionsNode);

  return () => observer.disconnect();
    setPortalPosition((v) => {return {...v, minWidth: `${selectRect.width}px`}})
} else {
    // If there is a custom width set by the prop set it to that width
                    newShadowStyles = {...newShadowStyles, "--width" : `${headerWidth}px`}
                setShadowStyles((v) => {return{...v, ...newShadowStyles}})
    setSyncedWidth({width: `${headerWidth}px`, customWidth: true})
}
    }, [optionsRef, selectRef, window, optionsWrapperRef, width, isOpen])

    /* Handle on change */
    useEffect(() => {
        if (onChange) {
            setIsOpen(false)
            onChange(currentVal);
        }
    }, [currentVal, onChange]);

    // Handle when user scrolls
      useEffect(() => {

        const handleScroll = (event) => {
            if (isOpen) {
            if (!(optionsRef.current.contains(event.target))) {
                resizeSelect()
            }
        }
        }

    // Add the event listener when the component mounts
    window.addEventListener('scroll', handleScroll);
     window.addEventListener('touchstart', handleScroll);
    window.addEventListener('touchend', handleScroll);

    // Clean up the event listener when the component unmounts
    // This is crucial to prevent memory leaks
    return () => {
      window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchstart', handleScroll);
      window.removeEventListener('touchend', handleScroll);
    };
  }, []); // The empty dependency array ensures this effect runs only once



    useLayoutEffect(() => {

            if (selectRef.current && optionsRef.current) {
                            if (!isOpen) {
                setShadowStyles
            }
            }
            if (isOpen) {
                resizeSelect();
                // Create the ResizeObserver
                const observer = new ResizeObserver(entries => {
                // The callback gives us an array of entries, but we only need the first one
                if (entries[0]) {
                    if (isOpen) {
                    const { width, height} = entries[0].contentRect;
                    const selectStyles = window.getComputedStyle(selectRef.current)
                    const newStyles = window.getComputedStyle(entries[0].target)
                    const newHeight = (selectRef.current.getBoundingClientRect().height + optionsRef.current.getBoundingClientRect().height)
                    setShadowStyles((v) => {return{...v, "--height": `${newHeight}px`,
                    "--opacity": newStyles.opacity,
                    "--background-color": newStyles.backgroundColor,
                    "--box-shadow": selectStyles.getPropertyValue("--box-shadow").trim()
                }});
                } else {
                    setShadowStyles((v) => {return{...v, "--height" : "0px"}})
                }
                }
                });

                // Start observing the element
                observer.observe(optionsRef.current);

                // Cleanup: disconnect the observer when the component unmounts
                return () => observer.disconnect();
            }
    }, [isOpen, window]); // Re-run only when the dropdown opens or closes


    // Resize select when width prop changes
    useEffect(() => {
        console.log("Got")
        resizeSelect()
    }, [width])

    /* Toggling on change */
    const toggleDropDown = () => {
        setIsOpen(prev => !prev);
    }

    /* Display of the option value */
    let displayElement = <span className={styles.placeholder}>{placeholder || "Select..."}</span>;
    
    // Using .map to create the option elements
    const optionElements = React.Children.map(children, child => {
        if (child.type === SelectOption) {
            // Find the display content for the header
            if (child.props.value === currentVal) {
                displayElement = child.props.children;
            }
            
            // --- On click for the options to change value
            const handleOptionClick = () => {
                setCurrentValue(child.props.value);
                setIsOpen(false);
            };

            // Clone the child to modify it's values
            return React.cloneElement(child, {
                key: child.props.value,
                onClick: handleOptionClick,
                className: `${child.props.className || ''} ${currentVal === child.props.value ? styles.selected : ''} ${optionClassName ? optionClassName : ""}`
            });
        }
        return null;
    });

    /* Custom select classes */
    const selectClasses = `${styles['container']} ${className ? className : "" } ${dropdownDirection} ${isOpen ? `--selected ${styles['noShadow']}` : ""}`

    const contentClasses = `${styles['options']} ${dropdownDirection} ${!isOpen ? "" : styles['expanded']} ${contentClassName ? contentClassName : ""} ${isOpen ? "--selected" : ""}`

    const toggleButtonClasses = `${styles['toggleButton']} ${toggleButtonClassName ? toggleButtonClassName : ""}`

    const headerClasses = `${styles['header']} ${headerClassName ? headerClassName : "" } ${isOpen ? "--selected" : ""}`

    const optionsWrapperClasses = ` ${contentWrapperClassName ? contentWrapperClassName : "" } ${styles['optionsWrapper']} ${isOpen ? "--selected" : ""}`

    // Resize when window resizes
    useEffect(() => {
          // Add the event listener when the component mounts
    window.addEventListener('resize', resizeSelect);

    // ❗ Important: Return a cleanup function to remove the listener
    // This prevents memory leaks when the component unmounts
    resizeSelect();
    return () => {
      window.removeEventListener('resize', resizeSelect);
    }
    }, [window, optionsRef, selectRef])


    // When user clicks outside hide select
          useClickOutside([optionsRef, selectRef], () => {
    if (isOpen == true) {
      setIsOpen(false);
    }
  });

  // Set custom width of options if there is a custom width
  let customOptionsWidth = {}
  if (syncedWidth.customWidth === true) {
    customOptionsWidth = {minWidth: (isOpen ? syncedWidth.width : "0"), maxWidth: (isOpen ? syncedWidth.width : "0")}
  } else {
    customOptionsWidth = {minWidth: (isOpen ? syncedWidth.width : "0")}
  }

  
  // Set the css variable of the shadow zIndex and options zIndex,
  // The shadow zIndex is behind the zIndex of the select whilst the options is in front of the select
    let newStyles = {}
    if (style){
    if (style.zIndex) {
        const zIndex = parseInt(style.zIndex)
        newStyles = {shadowZIndex: style.zIndex, optionsZIndex: parseFloat((zIndex+2))}
    }
}


// Options
// Create a portal for the options to allow it to not overflow the page or container that the options is in
    const DropdownPortal = createPortal(
        <>
        <div style={{...shadowStyles, zIndex: (newStyles.shadowZIndex ? newStyles.shadowZIndex : "")}} className={`${styles['shadow']} ${!isOpen ? styles['noShadow']: ""}`}></div>
        <div 
            className={contentClasses} 
style={{
    // Set the position and zIndex of style and other styles
    zIndex: (newStyles.optionsZIndex ? newStyles.optionsZIndex : ""),
                position: 'absolute',
                top: `${portalPosition.top}px`,
                left: `${portalPosition.left}px`,
                // ✅ Apply the synchronized width to the dropdowns
                ...customOptionsWidth,
                ...optionsStyles,
            }}
            ref={optionsRef}
        >
            <div ref={optionsWrapperRef} className={optionsWrapperClasses}>
                {optionElements}
            </div>
        </div></>,
        document.body // Render directly into the body
    );

    // Set the select width

    let selectWidth = {}
    if (syncedWidth.customWidth === true) {
        // If there is a custom width, set it to that,
        // Note: I am using minWidth and maxWidth because it is animatable with the transition property of css
        selectWidth = {minWidth: width, maxWidth: width}
    } else {
        selectWidth = {minWidth: syncedWidth.width}
    }


    // Select styles
    // Set the zIndex to the zIndex higher than the of the zIndex provided
    let selectStyles = {}
    if (style) {
    if (style.zIndex) {
        const zIndex = parseInt(style.zIndex)
        selectStyles = {...styles, zIndex: (parseFloat((zIndex+1)))}
    }
}

// Main Select component
    return (
        <div onClick={toggleDropDown}  style={{...selectWidth, ...selectStyles}} ref={selectRef} className={selectClasses}>
            <div className={headerClasses}>
                <div  className={styles.headerContent}>{displayElement}</div>
                <button className={toggleButtonClasses}>
                    {isOpen ? 
                        <UpImage className={styles['toggleImage']} /> :
                        <DownImage className={styles['toggleImage']} />
                    }
                </button>
            </div>
            <div className={`${styles['optionsContainer']}`}>
                {DropdownPortal} 
            </div>
        </div>
    );
}

Select.Option = SelectOption;

export default Select;