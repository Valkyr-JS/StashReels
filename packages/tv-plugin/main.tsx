import { faTelevision } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchPluginConfig } from "../tv-ui/src/helpers/index.js";
import { PLUGIN_NAMESPACE } from "../tv-ui/src/constants/index.js";
import { PluginConfig } from "../tv-ui/types/stash-tv.js";

const { PluginApi } = window;
const { React } = PluginApi;

// Wait for the navbar to load, as this contains the
PluginApi.patch.instead(
  "MainNavBar.MenuItems",
  function ({ children, ...props }, _, Original) {
    const [showButton, setShowButton] = React.useState(true);

    fetchPluginConfig().then((res) => {
      // Check if plugin config exists
      if (res?.data && res.data.configuration.plugins[PLUGIN_NAMESPACE]) {
        const pluginConfig: PluginConfig | undefined =
          res.data.configuration.plugins[PLUGIN_NAMESPACE];

        setShowButton(!pluginConfig.hideNavButton);
      }
    });

    // If data isn't yet available or the user has hidden the button, return the
    // original component
    if (!showButton) return [<Original {...props} children={children} />];

    // Add the button to the navbar
    return [
      <Original {...props}>
        {children}
        <StashTVButtonInner />
      </Original>,
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
          icon={faTelevision}
        />
        <span>TV</span>
      </a>
    </div>
  );
};
