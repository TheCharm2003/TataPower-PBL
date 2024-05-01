import { createContext, useState, useMemo } from "react";
import { colors, createTheme } from "@mui/material";

/* Color Design Tokens*/
export const tokens = (mode) => ({
  ...(mode === "light"
    ? {
      primary: {
        main: "#ffffff",
        light: "#ffffff",

        dark: "#2C2C2C",
        black: "#000000",
        transparent: "#ffffff00",
        ecolor:"#eeeeee",
        fillcolor:"#ABFFBE"
      },
      shadow:{
        100:'#DEE6ED66',
        200:'#FFE6E633 ',
        300:'#D1D1D166',
        400:"#F6E5D466",
        500:'#E0DFF466'
      },
      linechart:{
        100:'#FFFFFF',
        200:'#E07001',
        300:"#7A73DE",
        400:'#2C2C2C',
      
      },
      tableborder:{
        100: "#44444466"
      },
      sidebar:{
        100:"#2C2C2C",
        200:"#ffffff"
      },
      grey: {
        100: "#F7F7F7",
        200: "#F4F4F4",
        300: "#F2F2F2",
        400: "#EBEBEB",
        450: "#E3E3E3",
        480: "#D1D1D1",
        500: "#9C9C9C",
        600: "#9B9B9B",
        650: "#919191",
        680: "#4D4D4D",
        700: "#4A4A4A",
        750: "#4A4A4AB2",
        800: "#494949",
        850: "#444444",
        880: "#44444480",
        900: "#2C2C2C",
      },
      orange: {
        main: "#E07001",
        100: "#F6E5D4",
        200: "#F6E5D480",
        300: "#F3C699",
        900: "#E07001",
      },
      purple: {
        main: "#7A73DE",
        100: "#EEEDF6",
        200: "#E0DFF4",
        300: "#CAC7F2",
        400: "#E0DFF480",
        900: "#7A73DE",
      },
      green: {
        main: "#ABFFBE",
        500: "#ABFFBE",
        600: "#D5FFDE80"
      },
      red: {
        main: "#FF8080",
        100: "#FFE6E6",
        200: "#FFE6E6CC",
        500: "#FF8080",
      },
      error: {
        main: "#FF8080",
        500: "#FF8080",
      },
      background:{
        default:'#f7f7f7'
      },
    }
    : {
      primary: {
        main: "#2C2C2C",
        light: "#4a4a4a",
        dark: "#ffffff",
        black: "#ffffff",
        transparent: "        ",
        ecolor:"#949494",
        fillcolor:"#65ff89",

        background:{
          default:'#2c2c2c'
        },
       
        
      

      },
      shadow:{
        100:'#211912',
        200:'#00191933',
        300:'#2E2E2E66',
        400:'#091A2B66',
        500:'#1F200B66'
      },
      linechart: {
        100: '#000000',    // Adjusted to black for better visibility in dark mode
        200: '#FFA530',    // Adjusted to a lighter shade of orange for contrast
        300: '#B8B5FF',    // Adjusted to a lighter shade of purple for contrast
        400: '#F2F2F2'     // Adjusted to a lighter shade of gray for contrast
    },
    tableborder: {
      100: '#CCCCCC66', // Adjusted to a lighter shade of gray with some transparency
  },
  
      sidebar:{
        100:"#2C2C2C",
        200:"#ffffff"
      },
      grey: {
        100: "#2C2C2C",
        200: "#444444",
        300: "#4A4A4A",
        400: "#4D4D4D",
        450: "#494949",
        480: "#4a4a4a",
        500: "#919191",
        600: "#9B9B9B",
        650: "#9C9C9C",
        680: "#E3E3E3",
        700: "#EBEBEB",
        750: "#EBEBEBB2",
        800: "#F2F2F2",
        850: "#F4F4F4",
        880: "#F4F4F430",
        900: "#F7F7F7",
      },
      orange: {
        main: "#F3C699",
        100: "#E07001",
        200: "#E07001",
        300: "#F6E5D480",
        900: "#F6E5D4",
      },
      purple: {
        main: "#CAC7F2",
        100: "#E0DFF480",
        200: "#7A73DE",
        300: "#CAC7F2",
        400: "#7A73DE",
        900: "#EEEDF6",
      },
      green: {
        main: "#D5FFDE",
        500: "#D5FFDE80",
        600: "#00d090",
      },
      red: {
        main: "#FF8080",
        100: "#FF8080",
        200: "#FF8080",
        500: "#FFE6E6",
      },
      error: {
        main: "#FF8080",
        500: "#FF8080",
      },
    }),
});

// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    palette: {
      mode: mode,
      ...colors, // Spread the colors directly
     
    },
    typography: {
      // fontFamily: ["Poppins", "sans-serif"].join(","),
      // fontSize: 16,
      h1: {
        // fontFamily: ["Poppins", "sans-serif"].join(","),
        // fontSize: 32,
      },
      h2: {
        // fontFamily: ["Poppins", "sans-serif"].join(","),
        // fontSize: 28,
      },
      h3: {
        // fontFamily: ["Poppins", "sans-serif"].join(","),
        // fontSize: 24,
      },
      h4: {
        // fontFamily: ["Poppins", "sans-serif"].join(","),
        // fontSize: 18,
      },
      h5: {
        // fontFamily: ["Poppins", "sans-serif"].join(","),
        // fontSize: 16,
      },
      h6: {
        // fontFamily: ["Poppins", "sans-serif"].join(","),
        // fontSize: 14,
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => { },
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
