
import { PLUGIN_NAMESPACE } from '../constants';
import { getApolloClient } from '../hooks/getApolloClient';
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

const graphqlClient = getApolloClient()

export const stashConfigStorage = {
  getItem: async (key: string) => await getStashTvConfig()
    // Fallback to loading from localStorage if no config in stash yet. We won't need this after everyone has upgrade to
    // the version of Stash TV that saves config in stash but this is needed for now to avoid breaking changes for users
    // upgrading from older versions of Stash TV.
    .then(config => config[key] || localStorage.getItem(key))
    .catch(console.error),
  setItem: async (key: string, value: string) => await updateTvConfig(config => ({...config, [key]: value}))
    .catch(console.error),
  removeItem: async (key: string) => {
    await updateTvConfig(
      config => {
        const {[key]: _, ...rest} = config;
        return rest
      }
    )
  },
}

async function getStashTvConfig() {
  const result = await graphqlClient.query({
    query: GQL.ConfigurationDocument,
  });
  return result.data?.configuration.plugins[PLUGIN_NAMESPACE];
}

async function updateTvConfig(
  configUpdate: (tvConfig: Record<string, unknown>) => Record<string, unknown>
) {
  getStashTvConfig()
    .then(config => {
      return graphqlClient.mutate({
        mutation: GQL.ConfigurePluginDocument,
        variables: {
          plugin_id: PLUGIN_NAMESPACE,
          input: configUpdate(config),
        }
      })
    })
}
