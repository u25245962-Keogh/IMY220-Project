/** @type {import { tailwindcss }.Config} */

module.exports = {
    content: ["./index.html", "./frontend/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            backgroundImage: {
                "orangeNote" : "url('/orangeNote.png')"
            }
        }
    }
};