import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    important: ".tailwind", // Tailwind styles will apply only inside .tailwind
    theme: {
        extend: {
            colors: {
                // Add custom colors here
            },
            fontFamily: {
                // Add custom fonts here
            },
        },
    },
    // corePlugins: {
    //     preflight: false, // disables Tailwind's base reset
    // },
    plugins: [
        // Add your custom plugins here
    ],
};

export default config;