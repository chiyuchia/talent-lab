import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0.88" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0.88", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0.88", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          from: { opacity: "0.9", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          from: { opacity: "0.9", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "login-hero-enter": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "login-form-enter": {
          from: { opacity: "0.88", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-in": {
          from: { opacity: "0.88", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "shimmer": {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "fade-in-up": "fade-in-up 0.22s ease-out both",
        "fade-in-down": "fade-in-down 0.2s ease-out both",
        "fade-in-left": "fade-in-left 0.22s ease-out both",
        "fade-in-right": "fade-in-right 0.22s ease-out both",
        "login-hero-enter": "login-hero-enter 0.48s ease-out both",
        "login-form-enter": "login-form-enter 0.28s ease-out both",
        "scale-in": "scale-in 0.22s ease-out both",
        "slide-up": "slide-up 0.4s ease-out both",
        "shimmer": "shimmer 2s linear infinite",
        // Alias that CandidateDetailPage already uses
        fadeIn: "fade-in 0.18s ease-out both",
      },
    },
  },
};

export default config;
