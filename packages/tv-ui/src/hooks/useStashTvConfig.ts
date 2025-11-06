import { PLUGIN_NAMESPACE } from "../constants";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { ConfigurationContext } from "stash-ui/dist/src/hooks/Config";
import { useContext } from "react";
import { ApolloCache, StoreObject, useMutation } from "@apollo/client";

/** Config saved in Stash but managed and only use by Stash TV */
export type StashTvConfig = {
  /** The ID of the default filter to be loaded on startup. */
  defaultFilterId?: string,
  /** Hide the main navigation link to Stash TV. */
  hideNavButton?: boolean,
  /** The subtitle language code to be used when available. */
  subtitleLanguage?: string;
}

export default function useStashTvConfig() {
  const {
    configuration: {
      plugins: {
        [PLUGIN_NAMESPACE as string]: stashTvConfig = {}
      } = {},
    } = {},
    loading
  } = useContext(ConfigurationContext)

  const [mutatePlugin] = useMutation<GQL.ConfigurePluginMutation, GQL.ConfigurePluginMutationVariables>(
    GQL.ConfigurePluginDocument,
    {
      update: (cache, result) => updateStashTvPluginConfig(cache, result.data?.configurePlugin),
    }
  )

  function updateStashTvPluginConfig(
    cache: ApolloCache<Record<string, StoreObject>>,
    result: GQL.ConfigurePluginMutation["configurePlugin"] | undefined
  ) {
    if (!result) return;

    const existing = cache.readQuery<GQL.ConfigurationQuery>({
      query: GQL.ConfigurationDocument,
    });

    cache.writeQuery({
      query: GQL.ConfigurationDocument,
      data: {
        configuration: {
          ...existing?.configuration,
          plugins: {
            ...existing?.configuration?.plugins,
            [PLUGIN_NAMESPACE]: result,
          },
        },
      },
    });
  }

  function update(config: Partial<StashTvConfig>) {
    return mutatePlugin({
      variables: {
          plugin_id: PLUGIN_NAMESPACE,
          input: {
            ...stashTvConfig,
            ...config,
          }
      }
    })
  }

  return {
    data: stashTvConfig as StashTvConfig,
    loading,
    update,
  }
}
