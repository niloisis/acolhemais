import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "tailwindcss";
import {defineConfig} from "vite"

export default defineConfig({
    css: {
        postcss: {
            plugins: [tailwindcss()]
        }
    },
    plugins: [react()],
    server: {
        host: true,
        strictPort: true,
        allowedHosts: ['acolhemais.vombate.com.br'],
        port: 3000
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
