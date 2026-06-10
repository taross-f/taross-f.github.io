import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// taross-f.github.io/apps/teirei-kaigi/ で配信する前提のbase設定
export default defineConfig({
  plugins: [react()],
  base: "/apps/teirei-kaigi/",
});
