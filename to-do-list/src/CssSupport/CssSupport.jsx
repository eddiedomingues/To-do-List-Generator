/* CSS Compatibility Script */

// -- fieldSizing support
const isFieldSizingSupported = typeof window !== 'undefined' &&
  window.CSS &&
  CSS.supports('field-sizing', 'content');

export default { isFieldSizingSupported };