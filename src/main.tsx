import { faMobile } from "@fortawesome/pro-solid-svg-icons/faMobile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PLUGIN_NAMESPACE } from "./constants";

const { PluginApi } = window;
const { GQL, React } = PluginApi;

// Add a Reels button to the main navigation bar. Uses patch.before to modify
// the props passed to the original component, preserving the React context
// chain (including IntlProvider).
PluginApi.patch.before(
  "MainNavBar.MenuItems",
  function (props: React.PropsWithChildren<{}>) {
    const { data, loading } = GQL.useConfigurationQuery();

    let showButton = true;

    if (!loading && data) {
      const pluginConfig: PluginConfig | undefined =
        data.configuration.plugins[PLUGIN_NAMESPACE];

      if (pluginConfig) {
        showButton = !pluginConfig.hideNavButton;
      }
    }

    if (!showButton) return [props];

    return [
      {
        children: (
          <>
            {props.children}
            <ReelsButtonInner />
          </>
        ),
      },
    ];
  }
);

const ReelsButtonInner = () => {
  const link = "/plugin/" + PLUGIN_NAMESPACE + "/assets/app/";

  return (
    <div
      data-rb-event-key={link}
      className="col-4 col-sm-3 col-md-2 col-lg-auto nav-link"
      id="StashReelsButton"
    >
      <a
        href={link}
        className="minimal p-4 p-xl-2 d-flex d-xl-inline-block flex-column justify-content-between align-items-center btn btn-primary"
        target="_blank"
      >
        <FontAwesomeIcon
          className="fa-icon nav-menu-icon d-block d-xl-inline mb-2 mb-xl-0"
          icon={faMobile}
        />
        <span>Reels</span>
      </a>
    </div>
  );
};
