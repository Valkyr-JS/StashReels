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

  // We reuse the code Stash's UI which connects to the Stash server from the client and that expects
  // VITE_APP_PLATFORM_URL to be set to the Stash server address when running in dev mode.
  if (mode === "development") {
    process.env.VITE_APP_PLATFORM_URL=env.STASH_ADDRESS
  }

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