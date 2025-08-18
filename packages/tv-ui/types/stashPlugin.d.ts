import { PluginApi } from "stash-ui/dist/src/pluginApi.js"

declare global {
  interface Window {
    PluginApi: typeof PluginApi & {
      patch: {
        instead: typeof PluginApi["patch"]["instead"] | ((
          component: "MainNavBar.MenuItems",
          fn: (
            props: React.PropsWithChildren<{}>,
            _: object,
            Original: React.JSX
          ) => React.JSX.Element[]
        ) => void);
      }
    }
  }
}