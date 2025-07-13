// -- Dynamic Title -- \\
/*
  This script translates the title to the appropriate language that the user is using
*/

// -- Imports --
import { useEffect } from 'react';

// -- Translation Library
import { useTranslation } from 'react-i18next';

const DynamicTitle = () => {
  // Transation namespace
  const { t, i18n } = useTranslation("main");

  useEffect(() => {
    document.title = t('title');
  }, [t, i18n.language]); // Rerun the effect when the translation function or language changes

  return null; // This component does not render anything
};

export default DynamicTitle;