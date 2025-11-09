import React from "react";
import FeedPage from "../pages/Feed";
import { useAppStateStore } from "../store/appStateStore";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import {ConfigurationProvider} from "stash-ui/dist/src/hooks/Config";
import { useViewportRotate } from "../hooks/useViewportRotate";

const App = () => {
  const { forceLandscape  } = useAppStateStore()

  const stashConfig = GQL.useConfigurationQuery();

  const modifiedStashConfig = {
    ...stashConfig.data?.configuration,
    interface: {
      ...stashConfig.data?.configuration?.interface,
      // Stash TV has it's own autoplay setting so we don't want to have that overridden by Stash settings
      autostartVideo: false,
    }
  } as GQL.ConfigurationQuery["configuration"];

  useViewportRotate(forceLandscape);

  return (
    <ConfigurationProvider
      configuration={modifiedStashConfig}
      loading={stashConfig.loading}
    >
      <FeedPage />
    </ConfigurationProvider>
  );
};

export default App;
