// -- Themes Script for export document -- \\
import { useTranslation } from "react-i18next";

function Themes() {
  // Translation for the theme names using i18next
  const { t: themeT } = useTranslation("themes");

  // The themes
  const Themes = {
    exportDocThemes: {
      dark: {
        colorText: "9D9D9D",
        colorTextSecondary: "FFFFFF",
        colorHeadingPrimary: "DCDCDC",
        bodyBackgroundColor: "242424",
        taskOddColor: "333333",
        seperatorColor: "FFFFFF",
        themeColor: "4A90E2",
        svgFillColor: "DCDCDC",
      },
      light: {
        colorText: "495057",
        colorTextSecondary: "212529",
        colorHeadingPrimary: "000000",
        bodyBackgroundColor: "FFFFFF",
        taskOddColor: "F8F9FA",
        seperatorColor: "DEE2E6",
        themeColor: "007BFF",
        svgFillColor: "212529",
      },
      solarizedDark: {
        colorText: "839496",
        colorTextSecondary: "93A1A1",
        colorHeadingPrimary: "FDF6E3",
        bodyBackgroundColor: "002B36",
        taskOddColor: "073642",
        seperatorColor: "586E75",
        themeColor: "268BD2",
        svgFillColor: "93A1A1",
      },
      solarizedLight: {
        colorText: "657B83",
        colorTextSecondary: "586E75",
        colorHeadingPrimary: "002B36",
        bodyBackgroundColor: "FDF6E3",
        taskOddColor: "EEE8D5",
        seperatorColor: "93A1A1",
        themeColor: "2AA198",
        svgFillColor: "586E75",
      },
      dracula: {
        colorText: "F8F8F2",
        colorTextSecondary: "BD93F9",
        colorHeadingPrimary: "50FA7B",
        bodyBackgroundColor: "282A36",
        taskOddColor: "44475A",
        seperatorColor: "6272A4",
        themeColor: "BD93F9",
        svgFillColor: "F8F8F2",
      },
      nord: {
        colorText: "D8DEE9",
        colorTextSecondary: "E5E9F0",
        colorHeadingPrimary: "ECEFF4",
        bodyBackgroundColor: "2E3440",
        taskOddColor: "3B4252",
        seperatorColor: "4C566A",
        themeColor: "88C0D0",
        svgFillColor: "E5E9F0",
      },
      ocean: {
        colorText: "A6ACB9",
        colorTextSecondary: "C0C5CE",
        colorHeadingPrimary: "88C0D0",
        bodyBackgroundColor: "0F1C2B",
        taskOddColor: "1B2B34",
        seperatorColor: "343D46",
        themeColor: "88C0D0",
        svgFillColor: "C0C5CE",
      },
      forest: {
        colorText: "D4D4D4",
        colorTextSecondary: "A6C4A6",
        colorHeadingPrimary: "EFEFEF",
        bodyBackgroundColor: "2A3D2F",
        taskOddColor: "3E5346",
        seperatorColor: "5A7D65",
        themeColor: "A6C4A6",
        svgFillColor: "EFEFEF",
      },
      sunset: {
        colorText: "FAD7A0",
        colorTextSecondary: "F5B7B1",
        colorHeadingPrimary: "FFFFFF",
        bodyBackgroundColor: "2C203E",
        taskOddColor: "4B3B63",
        seperatorColor: "C39BD3",
        themeColor: "F5B7B1",
        svgFillColor: "FFFFFF",
      },
      monochrome: {
        colorText: "AAAAAA",
        colorTextSecondary: "DDDDDD",
        colorHeadingPrimary: "FFFFFF",
        bodyBackgroundColor: "111111",
        taskOddColor: "222222",
        seperatorColor: "444444",
        themeColor: "888888",
        svgFillColor: "DDDDDD",
      },
      rosePine: {
        colorText: "E0DEF4",
        colorTextSecondary: "EB6F92",
        colorHeadingPrimary: "F6C177",
        bodyBackgroundColor: "191724",
        taskOddColor: "1F1D2E",
        seperatorColor: "555169",
        themeColor: "EB6F92",
        svgFillColor: "E0DEF4",
      },
      corporateBlue: {
        colorText: "596C7A",
        colorTextSecondary: "0A2540",
        colorHeadingPrimary: "0A2540",
        bodyBackgroundColor: "F0F4F8",
        taskOddColor: "FFFFFF",
        seperatorColor: "D1D9E0",
        themeColor: "0062D9",
        svgFillColor: "0A2540",
      },
    },

    // A function that returns the names of all the themes as an array
    getExportThemes: () => {
      let themeNames = [];
      for (const [themeName, themeProperties] of Object.entries(
        Themes.exportDocThemes
      )) {
        // Returns the themeName which is translated to the current language and the themeIndex for reference to the variable
        themeNames.push({
          themeName: themeT(themeName),
          themeIndex: themeName,
        });
      }
      return themeNames;
    },
  };
  // Assigns it globally so it can be accessed globally through window.app
  window.app = {};
  window.app.themes = Themes;
}

export default Themes;