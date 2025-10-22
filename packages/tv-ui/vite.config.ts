import { defineConfig, loadEnv, ProxyOptions } from "vite";
import svgr from 'vite-plugin-svgr';
import pkg from "../../package.json" with { type: "json" };
import { ClientRequest, ServerResponse } from "http";
import { escape } from "@std/regexp/escape";

export default defineConfig(({mode}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the
  // `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  const port = env.DEV_PORT ? parseInt(env.DEV_PORT) : undefined;
  const host = env.DEV_HOST?.toLowerCase() === "true" ? true : env.DEV_HOST
  const allowedHosts = env.DEV_ALLOWED_HOSTS?.toLowerCase() === "true" ? true : env.DEV_ALLOWED_HOSTS?.split(",");
  
  const proxyStash = env.STASH_PROXY?.toLowerCase().trim() === "true";

  // We reuse the code Stash's UI which connects to the Stash server from the client and that expects
  // VITE_APP_PLATFORM_URL to be set to the Stash server address when running in dev mode.
  if (mode === "development" && !proxyStash) {
    process.env.VITE_APP_PLATFORM_URL=env.STASH_ADDRESS
  }

  process.env.VITE_STASH_TV_VERSION = pkg.version;
  
  const stashUrl = env.STASH_ADDRESS ? new URL(env.STASH_ADDRESS) : undefined;
  
  if (proxyStash && !env.STASH_ADDRESS) {
    throw new Error("STASH_PROXY is enabled but STASH_ADDRESS is not set");
  }
  
  const proxyOptions: ProxyOptions = {
    target: env.STASH_ADDRESS,
    changeOrigin: true,
    ws: true,
    rewriteWsOrigin: true,
    configure: (proxy) => {
      const addHeaders = (proxyReq: ClientRequest) => {
        for (const header of env.STASH_PROXY_HEADERS?.split(",").map(h => h.trim()) ?? []) {
          const key = header.slice(0, header.indexOf(":")).trim();
          const value = header.slice(header.indexOf(":") + 1).trim();
          proxyReq.setHeader(key, value);
        }
      }
      proxy.on('proxyReq', addHeaders);
      proxy.on('proxyReqWs', addHeaders);
      proxy.on('proxyRes', (proxyRes, req, res) => {
        const originalWrite = res.write;
        const originalEnd = res.end;

        let body = Buffer.from('');
        
        function shouldRewrite(res: ServerResponse) {
          const contentType = [res.getHeader("content-type") || ""].flat()[0].toString().toLowerCase();
          return contentType.startsWith("text/") || contentType.endsWith("json");
        }
        
        res.write = function(...args) {
          const [chunk] = args;
          if (shouldRewrite(res)) {
            body = Buffer.concat([body, Buffer.from(chunk)]);
          } else {
            // @ts-expect-error - We should see if we can fix this type error
            originalWrite.call(res, ...args);
          }
          return true;
        };
        
        // @ts-expect-error - We should see if we can fix this type error
        res.end = function(...args) {
          const [chunk] = args;
          if (!shouldRewrite(res)) {
            // @ts-expect-error - We should see if we can fix this type error
            originalEnd.call(res, ...args)
            return
          }
          if (chunk) {
            body = Buffer.concat([body, Buffer.from(chunk)]);
          }
          
          let bodyStr = body.toString();
          const stashHost = stashUrl?.host || "";
          if (bodyStr.includes(stashHost)) {
            bodyStr = bodyStr.replace(new RegExp(`(?:(http)s(:\/\/))?${escape(stashHost)}`, "g"), `$1$2${req.headers["host"]}/stash`);
            // @ts-expect-error - We should see if we can fix this type error
            originalWrite.call(res, bodyStr);
          } else {
            // @ts-expect-error - We should see if we can fix this type error
            originalWrite.call(res, body);
          }
          
          // @ts-expect-error - We should see if we can fix this type error
          originalEnd.call(res);
        };
      });
    },
    rewrite: path => path.replace(/^\/stash/, '')
  }

  return {
    root: "src",
    envDir: "..",
    server: {
      port,
      host,
      allowedHosts,
      ...(proxyStash ? {
        proxy: {
          '/graphql': proxyOptions,
          '/stash': proxyOptions
        }
      } : {})
    },
    envPrefix: ["VITE_", "STASH_ADDRESS"],
    plugins: [svgr()]
  }
})