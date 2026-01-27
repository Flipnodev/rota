/**
 * ROTA App Theme
 * Colors matched to the landing page design (dark theme)
 */

import { Platform } from "react-native";

// Core colors matching the web landing page
export const colors = {
  // Backgrounds
  black: "#000000",
  zinc950: "#09090b",
  zinc900: "#18181b",
  zinc800: "#27272a",
  zinc700: "#3f3f46",

  // Light mode backgrounds
  zinc100: "#f4f4f5",
  zinc200: "#e4e4e7",

  // Text
  white: "#ffffff",
  zinc300: "#d4d4d8",
  zinc400: "#a1a1aa",
  zinc500: "#71717a",
  zinc600: "#52525b",

  // Accent
  emerald500: "#10b981",
  emerald400: "#34d399",
  emerald600: "#059669",

  // Semantic
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",

  // Premium/Gold
  amber500: "#f59e0b",
  amber400: "#fbbf24",

  // Transparency helpers
  whiteAlpha5: "rgba(255, 255, 255, 0.05)",
  whiteAlpha10: "rgba(255, 255, 255, 0.10)",
  emeraldAlpha10: "rgba(16, 185, 129, 0.10)",
  emeraldAlpha20: "rgba(16, 185, 129, 0.20)",
};

// Theme object for light/dark mode (we primarily use dark)
export const Colors = {
  light: {
    text: colors.zinc900,
    textSecondary: colors.zinc600,
    background: colors.white,
    card: colors.zinc100,
    border: colors.zinc200,
    tint: colors.emerald500,
    icon: colors.zinc500,
    tabIconDefault: colors.zinc500,
    tabIconSelected: colors.emerald500,
  },
  dark: {
    text: colors.white,
    textSecondary: colors.zinc400,
    background: colors.black,
    card: colors.zinc900,
    border: colors.zinc800,
    tint: colors.emerald500,
    icon: colors.zinc500,
    tabIconDefault: colors.zinc500,
    tabIconSelected: colors.emerald500,
  },
} as const;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

// Border radius
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
} as const;

// Font weights
export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// Font families
export const Fonts = Platform.select({
  ios: {
    sans: "System",
    mono: "Menlo",
  },
  android: {
    sans: "Roboto",
    mono: "monospace",
  },
  default: {
    sans: "System",
    mono: "monospace",
  },
});
