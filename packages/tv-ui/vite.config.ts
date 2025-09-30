import { defineConfig, loadEnv } from "vite";
import svgr from 'vite-plugin-svgr';

export default defineConfig( ({mode}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  const port = env.DEV_PORT ? parseInt(env.DEV_PORT) : undefined;
  const host = env.DEV_HOST?.toLowerCase() === "true" ? true : env.DEV_HOST
  const allowedHosts = env.DEV_ALLOWED_HOSTS?.toLowerCase() === "true" ? true : env.DEV_ALLOWED_HOSTS?.split(",");

  return {
    root: "src",
    envDir: "..",
    server: {
      port,
      host,
      allowedHosts,
      // proxy: {
      //   // Proxy all requests starting with /graphql to the target server
      //   '/graphql': {
      //     target: env.STASH_ADDRESS,
      //     changeOrigin: true,
      //   }
      // }
    },
    envPrefix: ["VITE_", "STASH_ADDRESS"],
    plugins: [svgr()]
  }
})