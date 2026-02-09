import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PLUGIN_NAMESPACE } from "../tv-ui/src/constants/index.js";
import { StashTvConfig } from "../tv-ui/src/hooks/useStashTvConfig"
import { ConfigDataFragment, ConfigInterfaceResult } from "stash-ui/dist/src/core/generated-graphql.js";
import type { CheckboxGroup } from "stash-ui/stash/ui/v2.5/src/components/Settings/SettingsInterfacePanel/CheckboxGroup";

const { PluginApi } = window;
const { React } = PluginApi;

const graphqlClient = PluginApi.utils.StashService.getClient()

// Run setup if first time the plugin is loaded
updateTvConfig(
  async (tvConfig) => {
    if (tvConfig?.initialSetupComplete) return null;
    await setupPlugin()
    return {
      ...tvConfig,
      initialSetupComplete: true,
    }
  }
)

// Show Stash TV in the menu bar if it's been enabled in the plugin config
PluginApi.patch.instead(
  "PluginSettings",
  function (props, _, Original) {
    const [settingResetComplete, setSettingResetComplete] = React.useState(false);

    if (props.pluginID !== PLUGIN_NAMESPACE) return <Original {...props} />;

    const resetStashTvSettings = async () => {
      setSettingResetComplete(false);
      await updateTvConfig(() => ({}))
      setSettingResetComplete(true);
    }

    // Add the button to the navbar
    return [
      <Original {...props} />,
      <div className="plugin-settings">
        <div className="setting"></div> {/* Dummy setting to force line between settings */}
        <div className="setting">
          <div>
            <h3>Reset all Stash TV settings</h3>
            <div className="sub-heading">
              Stash TV has its own settings which are configurable from the settings panel in the
              Stash TV interface. This resets those settings to default.
            </div>
          </div>
          <div>
            <PluginApi.libraries.Bootstrap.Button onClick={resetStashTvSettings} variant="warning">
              {settingResetComplete && <>
                <FontAwesomeIcon
                  icon={PluginApi.libraries.FontAwesomeSolid.faCheck}
                />
                {" "}
              </>}
              Reset
            </PluginApi.libraries.Bootstrap.Button>
          </div>
        </div>
      </div>
    ];
  }
);

// Show Stash TV in the menu bar if it's been enabled in the plugin config
PluginApi.patch.instead(
  "MainNavBar.MenuItems",
  function ({ children, ...props }, _, Original) {
    const { data: stashConfig, loading: stashConfigLoading } = PluginApi.GQL.useConfigurationQuery();
    const showNavButton = stashConfig?.configuration?.interface?.menuItems?.includes('tv')

    // Add the button to the navbar
    return [
      <Original {...props}>
        {children}
        {(!stashConfigLoading && showNavButton) && <StashTVButtonInner />}
      </Original>,
    ];
  }
);

type CheckboxGroupProps = React.ComponentProps<typeof CheckboxGroup>

// Include Stash TV in the settings under the list of possible menu bar items to show
PluginApi.patch.before(
  "CheckboxGroup",
  function (...args: [CheckboxGroupProps]) {
    const [props, ...otherArgs] = args;
    if (props.groupId !== "menu-items") return [props, ...otherArgs];

    return [
      {
        ...props,
        items: [
          ...props.items,
          { id: "tv", headingID: "TV" },
        ],
      },
      ...otherArgs
    ];
  }
);

const StashTVButtonInner = () => {
  const link = "/plugin/" + PLUGIN_NAMESPACE + "/assets/app/";

  return (
    <div
      data-rb-event-key={link}
      className="col-4 col-sm-3 col-md-2 col-lg-auto nav-link"
      id="StashTVButton"
    >
      <a
        href={link}
        className="minimal p-4 p-xl-2 d-flex d-xl-inline-block flex-column justify-content-between align-items-center btn btn-primary"
        target="_blank"
      >
        <FontAwesomeIcon
          className="fa-icon nav-menu-icon d-block d-xl-inline mb-2 mb-xl-0"
          icon={PluginApi.libraries.FontAwesomeSolid.faTelevision}
        />
        <span>TV</span>
      </a>
    </div>
  );
};

type Config = ConfigDataFragment & { plugins: { [PLUGIN_NAMESPACE]: StashTvConfig } }

async function updateTvConfig(
  configUpdate: Partial<StashTvConfig> | (
    (tvConfig: StashTvConfig, allStashConfig: Config) => StashTvConfig | null | Promise<StashTvConfig | null>
  )
) {
  getStashConfig()
    .then(async config => typeof configUpdate === "function"
          ? await configUpdate(config.plugins[PLUGIN_NAMESPACE], config)
          : {...config.plugins[PLUGIN_NAMESPACE], ...configUpdate}
    )
    .then(newConfig => {
      if (!newConfig) return;
      return graphqlClient.mutate({
        mutation: PluginApi.GQL.ConfigurePluginDocument,
        variables: {
          plugin_id: PLUGIN_NAMESPACE,
          input: newConfig,
        }
      })
    })
}

async function updateInterfaceConfig(configUpdate: Partial<ConfigInterfaceResult> | (
  (interfaceConfig: ConfigInterfaceResult) => ConfigInterfaceResult
)) {
  getStashConfig()
    .then(allStashConfig => typeof configUpdate === "function"
      ? configUpdate(allStashConfig.interface)
      : {...allStashConfig.interface, ...configUpdate}
    )
    .then(newInterfaceConfig => {
      return graphqlClient.mutate({
        mutation: PluginApi.GQL.ConfigureInterfaceDocument,
        variables: {
          input: newInterfaceConfig,
        }
      })
    })
}

async function getStashConfig() {
  const result = await graphqlClient.query({
    query: PluginApi.GQL.ConfigurationDocument,
  });
  return result.data?.configuration as Config;
}

async function setupPlugin() {
  // Add Stash TV to nav bar menu items
  updateInterfaceConfig(
    (interfaceConfig) => ({
      ...interfaceConfig,
      menuItems: Array.from(new Set([...(interfaceConfig.menuItems || []), 'tv'])),
    })
  )
}
