import React, { useEffect, useState } from "react";
import FeedPage from "../pages/Feed";
import {
  fetchData,
  fetchSceneFilters,
  setCssVH,
  updateUserConfig,
} from "../helpers";
import { jsonToGraphQLQuery, EnumType } from "json-to-graphql-query";
import {
  DEFAULT_FILTER,
  DEFAULT_MAXIMUM_SCENES,
  FALLBACK_FILTER,
  PLUGIN_CONFIG_PROPERTY,
  PLUGIN_NAMESPACE,
} from "../constants";
import * as GQL from "../../vendor/stash/ui/v2.5/build/src/core/generated-graphql";
import { type ScenesQueryOptions } from "../pages/Feed/index";
import { ListFilterModel } from "../../vendor/stash/ui/v2.5/build/src/models/list-filter/filter";

const App = () => {
  setCssVH();

  const [allFilters, setAllFilters] = useState<
    { label: string; value: string }[]
  >([]);
  const [currentFilter, setCurrentFilter] = useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [scenesQueryOptions, setScenesQueryOptions] = useState<ScenesQueryOptions | undefined>(undefined);
  const [stashConfiguration, setStashConfiguration] = useState<
    ConfigResult | undefined
  >();

  /* ------------------------------ Initial load ------------------------------ */

  useEffect(() => {
    // Fetch all scene filters from Stash.
    fetchSceneFilters().then((res) => {
      setStashConfiguration(res.data.configuration as ConfigResult);
      // Set the config in the state
      setPluginConfig(
        res.data.configuration.plugins[
          PLUGIN_NAMESPACE
        ] as unknown as PluginConfig
      );

      const filters = res.data.findSavedFilters.map((f) => ({
        label: f.name,
        value: f.id,
      }));

      // If there are no saved filters but there is a default scene filter, try
      // fetching the default filter from the config
      if (
        !filters.length &&
        !!res.data.configuration.ui?.defaultFilters?.scenes
      ) {
        setAllFilters([DEFAULT_FILTER]);
        setCurrentFilter(DEFAULT_FILTER);
      }

      // If there are no filters at all, create a fallback filter and set it as
      // the current in the settings tab.
      else if (!filters.length) {
        setAllFilters([FALLBACK_FILTER]);
        setCurrentFilter(FALLBACK_FILTER);
        return null;
      } else {
        setAllFilters(filters);

        // If there are filters, check the user's plugin config to see if a
        // default plugin filter has been set.
        const userPluginConfig =
          res.data.configuration.plugins[PLUGIN_NAMESPACE];

        // If a filter has been set, set it as the current in the settings tab.
        if (
          !!userPluginConfig &&
          !!userPluginConfig[PLUGIN_CONFIG_PROPERTY.DEFAULT_FILTER_ID]
        ) {
          const current = filters.find(
            (f) =>
              f.value ===
              userPluginConfig[PLUGIN_CONFIG_PROPERTY.DEFAULT_FILTER_ID]
          );
          console.log("current: ", current);
          setCurrentFilter(current);
        }

        // TODO - Check that the first filter returns at least one scene. If
        // not, move on to the next until all are depleted, at which point
        // return to the default filter then fallback filter

        // If one hasn't been set, or the default is no longer available, use
        // the first one.
        else {
          setCurrentFilter(filters[0]);
        }
      }
    });
  }, []);

  /* ------------------------------ Update plugin ----------------------------- */

  // Handle all plugin updates here for consistency

  const [pluginConfig, setPluginConfig] = useState<PluginConfig | null>(null);

  const handlePluginUpdate = (partialConfig: PluginConfig) => {
    // Update the config
    const updatedConfig = { ...pluginConfig, ...partialConfig };
    updateUserConfig(updatedConfig)
      .then(() => {
        // Update the state
        setPluginConfig(updatedConfig);
      })
      .catch((err) => console.log(err));
  };

  /* ----------------------------- Update playlist ---------------------------- */

  useEffect(() => {
    console.log("change", currentFilter);

    // Fetch the current filter data.
    if (!currentFilter || currentFilter.value === FALLBACK_FILTER.value) {
      // Create a playlist as a fallback
      console.log("no filter");
      setScenesQueryOptions({
        variables: {
          filter: {
            per_page: pluginConfig?.maximumScenes ?? DEFAULT_MAXIMUM_SCENES,
          },
        }
      });
    } else if (
      currentFilter.value === DEFAULT_FILTER.value &&
      stashConfiguration?.ui?.defaultFilters?.scenes
    ) {
      console.log("default filter");
      setScenesQueryOptions({
        variables: {
          filter: {
            ...processFilter(
              stashConfiguration?.ui?.defaultFilters?.scenes ??
                {},
              pluginConfig ?? {},
            ),
          },
          scene_filter: processObjectFilter(
            stashConfiguration?.ui?.defaultFilters?.scenes
          ),
        },
      });
    } else {
      fetchData(
        jsonToGraphQLQuery({
          query: {
            findSavedFilter: {
              __args: {
                id: currentFilter?.value,
              },
              id: true,
              name: true,
              mode: true,
              find_filter: {
                sort: true,
                direction: true,
              },
              object_filter: true,
            },
          },
        })
      ).then((fil) => {
        console.log("change playlist: ", fil);

        // Set the filter data
        setScenesQueryOptions({
          variables: {
            filter: {
              ...processFilter(
                fil.data.findSavedFilter,
                pluginConfig ?? {}
              ),
            },
            scene_filter: processObjectFilter(
              fil.data.findSavedFilter
            ),
          }
        });
      });
    }
  }, [currentFilter]);

  if (!scenesQueryOptions) return <div>Fetching scene data...</div>;

  return (
    <FeedPage
      currentFilter={currentFilter}
      filterList={allFilters}
      pluginConfig={pluginConfig as PluginConfig}
      pluginUpdateHandler={handlePluginUpdate}
      setFilterHandler={setCurrentFilter}
      queryOptions={scenesQueryOptions}
    />
  );
};

export default App;

/** Process the raw `filter` data from Stash into GQL.  */
const processFilter = (savedFilter: any, pluginConfig: PluginConfig) => {
  const filter = new ListFilterModel(GQL.FilterMode.Scenes)
  const sortBy = savedFilter?.find_filter?.sort;
  if (sortBy) {
    let seed = Math.round(Math.random() * 1000000)
    savedFilter.find_filter.sort = sortBy.replace(/^random_\d*$/, `random_${seed}`)
  }
  filter.configureFromSavedFilter(savedFilter);
  const updatedFilter = { ...filter.makeFindFilter() };

  // Always get the set number of scenes, irrelevant of what the original filter
  // states.
  updatedFilter.per_page =
    pluginConfig?.maximumScenes ?? DEFAULT_MAXIMUM_SCENES;

  return updatedFilter;
};

/** Process the raw `object_filter` data from Stash into GQL. */
const processObjectFilter = (savedFilter: any) => {
  const filter = new ListFilterModel(GQL.FilterMode.Scenes)
  filter.configureFromSavedFilter(savedFilter);

  return filter.makeFilter();
};
