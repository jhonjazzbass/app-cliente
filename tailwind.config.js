/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ¡Esto escanea todos tus componentes de React!
  ],
  theme: {
    extend: {
      // Aquí puedes extender la paleta de colores, fuentes, etc. si lo necesitas en el futuro.
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
