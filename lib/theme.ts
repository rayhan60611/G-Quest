export const BRAND_NAVY = "#12142E";

export const NAV_THEME = {
  light: {
    dark: false,
    colors: {
      primary: "#795BF3",
      background: "#F6F4FB",
      card: "#FFFFFF",
      text: "#12142E",
      border: "#DDD9F0",
      notification: "#FF758A",
      foreground: "#12142E",
      popover: "#FFFFFF",
      secondary: "#EDE9FE",
      muted: "#EDE9FE",
      accent: "#FF758A",
      destructive: "#FF758A",
      input: "#DDD9F0",
      ring: "#795BF3",
      radius: 14,
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: "#795BF3",
      background: "#12142E",
      card: "#23264D",
      text: "#F6F4FB",
      border: "#3A3D6B",
      notification: "#FF758A",
      foreground: "#F6F4FB",
      popover: "#23264D",
      secondary: "#3A3D6B",
      muted: "#3A3D6B",
      accent: "#FF758A",
      destructive: "#FF758A",
      input: "#3A3D6B",
      ring: "#795BF3",
      radius: 14,
    },
  },
} as const;
