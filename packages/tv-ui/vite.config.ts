import { defineConfig, loadEnv } from "vite";

export default defineConfig( ({mode}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    root: "src",
    envDir: "..",
    server: {
      port: env.VITE_APP_PLATFORM_PORT ? parseInt(env.VITE_APP_PLATFORM_PORT) : undefined,
      // proxy: {
      //   // Proxy all requests starting with /graphql to the target server
      //   '/graphql': {
      //     target: env.STASH_ADDRESS,
      //     changeOrigin: true,
      //   }
      // }
    },
    envPrefix: ["VITE_", "STASH_ADDRESS"],
  }
})