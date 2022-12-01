import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/components/index.ts"),
      name: "RafflesCrud",
      // the proper extensions will be added
      fileName: "raffles-crud",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "axios", "dayjs", "vue-i18n", "ant-design-vue"],
    },
  },
});
