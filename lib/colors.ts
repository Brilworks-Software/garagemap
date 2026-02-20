/**
 * Centralized Color Constants
 * 
 * This file contains all color values used throughout the application.
 * Update colors here to change them globally across all pages.
 */

export const colors = {
  // Primary Colors
  primary: {
    blue: "#3b82f6",
    cyan: "#22d3ee",
    red: "#ef4444",
  },

  // Background Colors
  background: {
    base: "#1a1c1e",
    surface: "#25282c",
    card: {
      from: "#2a2e33",
      to: "#16181b",
    },
    input: "#1a1c1e",
    sidebar: {
      from: "#25282c",
      to: "#1a1c1e",
    },
  },

  // Text Colors
  text: {
    primary: "#ffffff",
    secondary: "#94a3b8",
    muted: "#94a3b8",
    buttonPrimary: "#ffffff",
    button: {
      light: "#e2e8f0",
      dark: "#0f172a",
    },
  },

  // Border Colors
  border: {
    default: "rgba(255, 255, 255, 0.05)",
    hover: "rgba(255, 255, 255, 0.1)",
    input: "rgba(255, 255, 255, 0.1)",
    divider: "rgba(255, 255, 255, 0.1)",
  },

  // Badge Colors
  badge: {
    success: {
      bg: "rgba(34, 211, 238, 0.2)",
      text: "#22d3ee",
      hover: "rgba(34, 211, 238, 0.3)",
    },
    error: {
      bg: "rgba(239, 68, 68, 0.2)",
      text: "#ef4444",
      hover: "rgba(239, 68, 68, 0.3)",
    },
    warning: {
      bg: "rgba(239, 68, 68, 0.2)",
      text: "#ef4444",
      hover: "rgba(239, 68, 68, 0.3)",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.2)",
      text: "#3b82f6",
      hover: "rgba(59, 130, 246, 0.3)",
    },
    muted: {
      bg: "rgba(148, 163, 184, 0.2)",
      text: "#94a3b8",
      hover: "rgba(148, 163, 184, 0.3)",
    },
  },

  // Button Colors
  button: {
    primary: {
      bg: "#e2e8f0",
      text: "#0f172a",
      hover: "#22d3ee",
      shadow: "rgba(34, 211, 238, 0.4)",
    },
    secondary: {
      bg: "transparent",
      text: "#ffffff",
      border: "rgba(255, 255, 255, 0.2)",
      hover: "rgba(255, 255, 255, 0.1)",
    },
  },

  // Icon Background Colors
  icon: {
    blue: {
      bg: "rgba(59, 130, 246, 0.2)",
      color: "#3b82f6",
    },
    cyan: {
      bg: "rgba(34, 211, 238, 0.2)",
      color: "#22d3ee",
    },
    red: {
      bg: "rgba(239, 68, 68, 0.2)",
      color: "#ef4444",
    },
    muted: {
      bg: "rgba(148, 163, 184, 0.2)",
      color: "#94a3b8",
    },
  },

  // Shadow Colors
  shadow: {
    card: "#0d0e10",
    glow: {
      blue: "rgba(59, 130, 246, 0.4)",
      cyan: "rgba(34, 211, 238, 0.4)",
    },
  },

  // Overlay Colors
  overlay: {
    highlight: "rgba(255, 255, 255, 0.05)",
    subtle: "rgba(255, 255, 255, 0.02)",
    shine: "rgba(255, 255, 255, 0.03)",
  },
} as const;

/**
 * Tailwind CSS class names for common color combinations
 * Use these in className props for consistent styling
 */
export const colorClasses = {
  // Background gradients
  cardGradient: "bg-gradient-to-br from-[#2a2e33] to-[#16181b]",
  sidebarGradient: "bg-gradient-to-b from-[#25282c] to-[#1a1c1e]",
  
  // Text colors
  textPrimary: "text-white",
  textSecondary: "text-[#94a3b8]",
  textBlue: "text-[#3b82f6]",
  textCyan: "text-[#22d3ee]",
  textRed: "text-[#ef4444]",
  
  // Border colors
  borderDefault: "border-white/5",
  borderHover: "border-white/10",
  borderInput: "border-white/10",
  
  // Badge classes
  badgeSuccess: "bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30",
  badgeError: "bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30",
  badgeInfo: "bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30",
  badgeMuted: "bg-[#94a3b8]/20 text-[#94a3b8] hover:bg-[#94a3b8]/30",
  
  // Button classes
  buttonPrimary: "[clip-path:polygon(0_0,90%_0,100%_30%,100%_100%,10%_100%,0_70%)] bg-[#e2e8f0] text-[#0f172a] hover:bg-[#22d3ee] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]",
  buttonSecondary: "border-white/20 bg-transparent hover:bg-white/10",
  
  // Icon background classes
  iconBgBlue: "bg-[#3b82f6]/20 text-[#3b82f6]",
  iconBgCyan: "bg-[#22d3ee]/20 text-[#22d3ee]",
  iconBgRed: "bg-[#ef4444]/20 text-[#ef4444]",
  iconBgMuted: "bg-[#94a3b8]/20 text-[#94a3b8]",
  
  // Background classes
  bgBase: "bg-[#1a1c1e]",
  bgSurface: "bg-[#25282c]",
  bgBlueAlpha20: "bg-[#3b82f6]/20",
  bgRedAlpha20: "bg-[#ef4444]/20",
  textMuted: "text-[#94a3b8]",
} as const;
