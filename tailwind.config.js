/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideUpMobile: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        slideUpMobile: "slideUpMobile 0.3s ease-out",
      },
      colors: {
        overlay: "rgba(0, 0, 0, 0.4)",
        brand: {
          primary: "#09345B",
          secondary: "#0F4C81",
          first: "#002D62",
          gradientFrom: "#2D9CDB",
          gradientTo: "#0F4C81",
          soft: "#EBF5FF",
        },
        status: {
          success: "#16A34A",
          warning: "#FACC15",
          danger: "#DC2626",
          info: "#2563EB",
          active: "#A3D977",
          warnexp: "#EDD967",
          expired: "#E66C63",
          drag: "rgba(191, 219, 254, 0.4)",
          type: "#FAF5FF",
          typebutton: "#7E22CE",
          status: "#FEFCE8"
        },
        surface: {
          card: "#FFFFFF",
          background: "#F9FBFF",
          border: "#E5E7EB",
        },
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          light: "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
};
