/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'uv-blue': '#1e4b8f',
                'uv-green': '#009642',
            },
        },
    },
    plugins: [],
}