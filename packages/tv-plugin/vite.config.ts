import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const __dirname = dirname(fileURLToPath(import.meta.url))

const definedEnvVars = {
  FA_VERSION: "sss",
  NODE_ENV: process.env.NODE_ENV,
}

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'main.tsx'),
      name: 'Stash TV',
      fileName: 'stash-tv',
    },
  },
  define: {
    ...Object.fromEntries(
      Object.entries(definedEnvVars)
        .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
    )
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'source.yml',
          dest: '.',
          rename: 'stash-tv.yml'
        },
        {
          src: '../tv-ui/dist/app',
          dest: '.'
        }
      ]
    }),
    {
      // Throw an error if any process.env variables are not replaced
      name: 'forbid-unreplaced-process-env',
      generateBundle(_, bundle) {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk') {
            const code = chunk.code
            const matches = code.match(/(?<=process\.env\.)[A-Z0-9_]+/g)
            if (matches) {
              const envVars = [...new Set(matches)]
              const unreplacedEnvVars = envVars.filter(envVar => !Object.keys(definedEnvVars).includes(envVar))
              if (unreplacedEnvVars.length > 0) {
                throw new Error(
                  `Unreplaced process.env variables in ${fileName}: ${unreplacedEnvVars.join(', ')}`
                )
              }
            }
          }
        }
      },
    },
  ]
})
