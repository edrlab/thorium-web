import ReadiumCSSColors from "@readium/css/css/vars/colors.json";

export enum ThThemeKeys {
  light = "light",
  sepia = "sepia",
  dark = "dark",
  paper = "paper",
  contrast1 = "contrast1",
  contrast2 = "contrast2",
  contrast3 = "contrast3"
}

export const lightTheme = {
  background: ReadiumCSSColors.backgroundColor, // Color of background
  text: ReadiumCSSColors.textColor,    // Color of text
  link: "#0000ee",                // Color of links
  visited: "#551a8b",             // Color of visited links
  subdue: "#808080",              // Color of subdued elements
  disable: "#808080",             // color for :disabled
  hover: "#d9d9d9",               // color of background for :hover
  onHover: ReadiumCSSColors.textColor, // color of text for :hover
  select: "#b4d8fe",              // color of selected background
  onSelect: "inherit",            // color of selected text
  focus: "#0067f4",               // color of :focus-visible
  elevate: "0px 0px 2px #808080", // drop shadow of containers
  immerse: "0.6"                  // opacity of immersive mode
}

export const darkTheme = {
  background: "#000000",
  text: "#FEFEFE",
  link: "#63caff",
  visited: "#0099E5",
  subdue: "#808080",
  disable: "#808080",
  hover: "#404040",
  onHover: "#FEFEFE",
  select: "#b4d8fe",
  onSelect: "inherit",
  focus: "#0067f4",
  elevate: "0px 0px 2px #808080",
  immerse: "0.4"
}

export const paperTheme = {
  background: "#faf4e8",
  text: "#121212",
  link: "#0000EE",
  visited: "#551A8B",
  subdue: "#8c8c8c",
  disable: "#8c8c8c",
  hover: "#edd7ab",
  onHover: "#121212",
  select: "#b4d8fe",
  onSelect: "inherit",
  focus: "#0067f4",
  elevate: "0px 0px 2px #8c8c8c",
  immerse: "0.5"
}

export const sepiaTheme = {
  background: "#e9ddc8",
  text: "#000000",
  link: "#0000EE",
  visited: "#551A8B",
  subdue: "#8c8c8c",
  disable: "#8c8c8c",
  hover: "#ccb07f",
  onHover: "#000000",
  select: "#b4d8fe",
  onSelect: "inherit",
  focus: "#004099",
  elevate: "0px 0px 2px #8c8c8c",
  immerse: "0.45"
}

export const contrast1Theme = {
  background: "#000000",
  text: "#ffff00",
  link: "#63caff",
  visited: "#0099E5",
  subdue: "#808000",
  disable: "#808000",
  hover: "#404040",
  onHover: "#ffff00",
  select: "#b4d8fe",
  onSelect: "inherit",
  focus: "#0067f4",
  elevate: "0px 0px 2px #808000",
  immerse: "0.4"
}

export const contrast2Theme = {
  background: "#181842",
  text: "#ffffff",
  link: "#adcfff",
  visited: "#7ab2ff",
  subdue: "#808080",
  disable: "#808080",
  hover: "#4444bb",
  onHover: "#ffffff",
  select: "#b4d8fe",
  onSelect: "inherit",
  focus: "#6BA9FF",
  elevate: "0px 0px 2px #808080",
  immerse: "0.4"
}

export const contrast3Theme = {
  background: "#c5e7cd",
  text: "#000000",
  link: "#0000EE",
  visited: "#551A8B",
  subdue: "#8c8c8c",
  disable: "#8c8c8c",
  hover: "#6fc383",
  onHover: "#000000",
  select: "#b4d8fe",
  onSelect: "inherit",
  focus: "#004099",
  elevate: "0px 0px 2px #8c8c8c",
  immerse: "0.45"
}