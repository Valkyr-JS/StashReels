import { PluginApi } from "stash-ui/dist/src/pluginApi.js"
import type { CheckboxGroup } from "stash-ui/dist/src/components/Settings/SettingsInterfacePanel/CheckboxGroup";



declare global {
  interface Window {
    PluginApi: Omit<typeof PluginApi, "patch"> & {
      patch: Omit<typeof PluginApi.patch, "instead"> & {
        instead: {
          (
            component: "CheckboxGroup",
            fn: CheckboxGroup
          ): void,
          (
            component: "PluginSettings",
            fn: (
              props: React.PropsWithChildren<{
                pluginID: string;
                settings: GQL.PluginSetting[];
              }>,
              _: object,
              Original: React.JSX
            ) => React.Node
          ): void,
          (
            component: string,
            fn: (
              props: React.PropsWithChildren<{}>,
              _: object,
              Original: React.JSX
            ) => React.Node
          ): void,
        }
      }
    }
  }
}
