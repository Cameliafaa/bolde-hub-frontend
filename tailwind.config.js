/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      // =========================
      // ANIMATION
      // =========================
      keyframes: {
        slideUpMobile: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },

      animation: {
        slideUpMobile: "slideUpMobile 0.3s ease-out",
      },

      // =========================
      // BOLDE HUB THEME
      // =========================
      colors: {
        overlay: "rgba(0, 0, 0, 0.4)",

        // BRAND
        brand: {
          // Main BOLDe Hub Pink
          primary: "#DF0067",
          primaryHover: "#C5005B",
          primaryDark: "#8F0046",
          primarySoft: "#FFF0F6",

          // Secondary / supporting pink
          secondary: "#B00057",
          secondaryHover: "#97004B",

          // Accent
          accent: "#FF4F9A",

          // Gradient
          gradientFrom: "#8F0046",
          gradientVia: "#B00057",
          gradientTo: "#F00676",

          // Legacy alias sementara
          // supaya code lama tidak langsung rusak
          first: "#8F0046",
          soft: "#FFF0F6",
        },

        // =========================
        // STATUS
        // =========================
        status: {
          success: "#16A34A",
          warning: "#FACC15",
          danger: "#DC2626",
          info: "#2563EB",

          // Dashboard cards
          active: "#70D45D",
          warnexp: "#F5D241",
          expired: "#FF565D",

          // Drag/drop
          drag: "rgba(223, 0, 103, 0.10)",

          // Additional state
          type: "#FFF0F6",
          typebutton: "#DF0067",
          status: "#FEFCE8",
        },

        // =========================
        // SURFACE / BACKGROUND
        // =========================
        surface: {
          card: "#FFFFFF",
          background: "#F8F8F9",
          soft: "#F4F4F5",
          border: "#E5E7EB",

          // Sidebar Bolde Hub
          sidebar: "#DEDEDE",
          sidebarDark: "#000000",
        },

        // =========================
        // TEXT
        // =========================
        text: {
          primary: "#171717",
          secondary: "#667085",
          light: "#98A2B3",
          disabled: "#B0B4BC",
          inverse: "#FFFFFF",
        },
      },

      // =========================
      // BORDER RADIUS
      // =========================
      borderRadius: {
        "app-sm": "8px",
        "app-md": "12px",
        "app-lg": "16px",
        "app-xl": "20px",
      },

      // =========================
      // BOX SHADOW
      // =========================
      boxShadow: {
        "brand-sm": "0 4px 12px rgba(223, 0, 103, 0.12)",
        brand: "0 8px 24px rgba(223, 0, 103, 0.18)",
        "brand-lg": "0 12px 32px rgba(223, 0, 103, 0.22)",

        card: "0 2px 10px rgba(0, 0, 0, 0.05)",
      },
    },
  },

  plugins: [],
};
