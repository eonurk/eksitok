import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "EksiTok",
				short_name: "EksiTok",
				icons: [
					{
						src: "/Eksi-logo.svg",
						sizes: "any",
						type: "image/svg+xml",
					},
				],
				start_url: "/",
				display: "standalone",
				background_color: "#ffffff",
				theme_color: "#000000",
			},
		}),
	],
});
