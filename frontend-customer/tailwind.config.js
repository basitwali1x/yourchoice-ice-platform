/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
        extend: {
            colors: {
                yci: {
                    bg0: "var(--bg-0)",
                    bg1: "var(--bg-1)",
                    surface: "var(--surface)",
                    card: "var(--card)",
                    muted: "var(--muted)",
                    accent: "var(--accent)",
                    accent2: "var(--accent-2)",
                    text: "var(--text)",
                    textMuted: "var(--text-muted)",
                },
            },
            boxShadow: {
                yciGlow: "var(--glow)",
                yciGlowStrong: "var(--glow-strong)",
            },
            borderRadius: {
                yci: "var(--radius)",
            },
        },
    },
    plugins: [],
};
