import React, { useEffect, useState } from "react";
import FeedPage from "../pages/Feed";
import { fetchData, fetchSceneFilters, setCssVH } from "../helpers";
import { jsonToGraphQLQuery, EnumType } from "json-to-graphql-query";
import {
  FALLBACK_FILTER,
  PLUGIN_CONFIG_PROPERTY,
  PLUGIN_NAMESPACE,
} from "../constants";

const App = () => {
  setCssVH();

  const [allFilters, setAllFilters] = useState<
    { label: string; value: string }[]
  >([]);
  const [currentFilter, setCurrentFilter] = useState<
    { value: string; label: string } | undefined
  >(undefined);
  const [sceneData, setSceneData] = useState<string | null>(null);
  const [pluginConfig, setPluginConfig] = useState<PluginConfig | null>(null);

  /* ------------------------------ Initial load ------------------------------ */

  useEffect(() => {
    // Fetch all scene filters from Stash.
    fetchSceneFilters().then((res) => {
      console.log(res.data.configuration.plugins);
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

      // If there are no filters, create a fallback filter and set it as the
      // current in the settings tab.
      if (!filters.length) {
        setAllFilters([FALLBACK_FILTER]);
        setCurrentFilter(FALLBACK_FILTER);
        return null;
      } else {
        setAllFilters(filters);

        // If there are filters, check the user's plugin config to see if a default
        // filter has been set.
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

        // If one hasn't been set, or the default is no longer available, use
        // the first one.
        else {
          setCurrentFilter(filters[0]);
        }
      }
    });
  }, []);

  /* ----------------------------- Update playlist ---------------------------- */

  useEffect(() => {
    console.log("change", currentFilter);

    // Fetch the current filter data.
    if (!currentFilter) {
      console.log("no filter");
      const query = `query { findScenes(filter: { per_page: -1 }, scene_filter: { orientation: {value: [PORTRAIT] } }) { scenes { captions { caption_type language_code } date id files { format } paths { caption stream } performers { gender name } studio { name parent_studio { name } } title } } }`;
      setSceneData(query);
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

        const query = jsonToGraphQLQuery({
          query: {
            findScenes: {
              __args: {
                filter: processFilter(fil.data.findSavedFilter.find_filter),
                scene_filter: processObjectFilter(
                  fil.data.findSavedFilter.object_filter
                ),
              },
              scenes: {
                captions: {
                  caption_type: true,
                  language_code: true,
                },
                date: true,
                id: true,
                files: {
                  format: true,
                },
                paths: {
                  caption: true,
                  stream: true,
                },
                performers: {
                  gender: true,
                  name: true,
                },
                studio: {
                  name: true,
                  parent_studio: {
                    name: true,
                  },
                },
                title: true,
              },
            },
          },
        });

        // Set the filter data
        setSceneData(query);
      });
    }
  }, [currentFilter]);

  if (!sceneData) return <div>Fetching scene data...</div>;

  return (
    <FeedPage
      currentFilter={currentFilter}
      filterList={allFilters}
      pluginConfig={pluginConfig as PluginConfig}
      setFilterHandler={setCurrentFilter}
      query={sceneData}
    />
  );
};

export default App;

/** Process the raw `filter` data from Stash into GQL.  */
const processFilter = (filter: any) => {
  const updatedFilter = { ...filter };
  if (filter.direction)
    updatedFilter.direction = new EnumType(filter.direction);

  // Always get all data, irrelevant of what the original filter states.
  updatedFilter.per_page = -1;

  return updatedFilter;
};

/** Process the raw `object_filter` data from Stash into GQL. */
const processObjectFilter = (objectFilter: any) => {
  const updatedFilter = { ...objectFilter };
  console.log(objectFilter);

  // Loop through each property in the object filter
  for (const filterType of Object.keys(objectFilter)) {
    console.log(objectFilter[filterType]);

    switch (filterType) {
      // `Boolean`
      case "interactive":
      case "organized":
      case "performer_favorite":
        updatedFilter[filterType] = objectFilter[filterType].value === "true";
        break;

      // `HierarchicalMultiCriterionInput`
      case "performer_tags":
      case "studios":
      case "tags":
        updatedFilter[filterType] = {
          excludes: objectFilter[filterType].value.excluded.map(
            (i: { id: string; label: string }) => i.id
          ),
          modifier: new EnumType(objectFilter[filterType].modifier),
          value: objectFilter[filterType].value.items.map(
            (i: { id: string; label: string }) => i.id
          ),
        };

        // Only set `depth` if it has been declared
        if (typeof objectFilter[filterType].value.depth !== "undefined") {
          updatedFilter[filterType] = {
            ...updatedFilter[filterType],
            depth: objectFilter[filterType].value.depth,
          };
        }
        break;

      // `DateCriterionInput`
      case "date":
      // `IntCriterionInput`
      case "bitrate":
      case "duration":
      case "file_count":
      case "framerate":
      case "id": // ! Untested
      case "interactive_speed":
      case "o_counter":
      case "performer_age":
      case "performer_count":
      case "play_count":
      case "play_duration":
      case "rating100": // Rating
      case "resume_time":
      case "tag_count":
      // `TimestampCriterionInput`
      case "created_at":
      case "last_played_at":
      case "updated_at":
        // Always update `modifier` and `value`
        updatedFilter[filterType] = {
          modifier: new EnumType(objectFilter[filterType].modifier),
          value: objectFilter[filterType].value.value,
        };

        // Only set `value2` if it has been declared
        if (typeof objectFilter[filterType].value.value2 !== "undefined") {
          updatedFilter[filterType] = {
            ...updatedFilter[filterType],
            value2: objectFilter[filterType].value.value2,
          };
        }
        break;

      // `MultiCriterionInput`
      case "performers":
        updatedFilter[filterType] = {
          excludes: objectFilter[filterType].value.excluded.map(
            (i: { id: string }) => i.id
          ),
          modifier: new EnumType(objectFilter[filterType].modifier),
          value: objectFilter[filterType].value.items.map(
            (i: { id: string }) => i.id
          ),
        };
        break;

      // `OrientationCriterionInput`
      case "orientation":
        updatedFilter[filterType] = {
          value: objectFilter[filterType].value.map(
            (v: string) => new EnumType(v.toUpperCase())
          ),
        };
        break;

      // `PhashDistanceCriterionInput`
      case "phash_distance":
        // Value is either an object or a string
        updatedFilter[filterType] = {
          modifier: new EnumType(objectFilter[filterType].modifier),
          value: objectFilter[filterType].value.value,
        };

        // Only set `distance` if it has been declared
        if (typeof objectFilter[filterType].value.distance !== "undefined") {
          updatedFilter[filterType] = {
            ...updatedFilter[filterType],
            distance: objectFilter[filterType].value.distance,
          };
        }
        break;

      // `PHashDuplicationCriterionInput`
      case "duplicated":
        updatedFilter[filterType] = {
          duplicated: objectFilter[filterType].value === "true",
        };
        break;

      // `ResolutionCriterionInput`
      case "resolution":
        // Get ResolutionEnum from value
        let resEnumString = "";
        switch (objectFilter[filterType].value) {
          case "144p":
            resEnumString = "VERY_LOW";
            break;
          case "240p":
            resEnumString = "LOW";
            break;
          case "360p":
            resEnumString = "R360P";
            break;
          case "480p":
            resEnumString = "STANDARD";
            break;
          case "540p":
            resEnumString = "WEB_HD";
            break;
          case "720p":
            resEnumString = "STANDARD_HD";
            break;
          case "1080p":
            resEnumString = "FULL_HD";
            break;
          case "1440p":
            resEnumString = "QUAD_HD";
            break;
          case "4K":
            resEnumString = "FOUR_K";
            break;
          case "5K":
            resEnumString = "FIVE_K";
            break;
          case "6K":
            resEnumString = "SIX_K";
            break;
          case "7K":
            resEnumString = "SEVEN_K";
            break;
          case "8K":
            resEnumString = "EIGHT_K";
            break;
          case "8K+":
            resEnumString = "HUGE";
            break;
        }

        if (!resEnumString) updatedFilter[filterType] = undefined;
        else
          updatedFilter[filterType] = {
            modifier: new EnumType(objectFilter[filterType].modifier),
            value: new EnumType(resEnumString),
          };
        break;

      // `StashIDCriterionInput`
      case "stash_id_endpoint":
        updatedFilter[filterType] = {
          modifier: new EnumType(updatedFilter[filterType].modifier),
        };

        // Only set `enpoint` if it has been declared
        if (typeof objectFilter[filterType].endpoint !== "undefined") {
          updatedFilter[filterType] = {
            ...updatedFilter[filterType],
            endpoint: objectFilter[filterType].endpoint,
          };
        }

        // Only set `stash_id` if it has been declared
        if (typeof objectFilter[filterType].stashID !== "undefined") {
          updatedFilter[filterType] = {
            ...updatedFilter[filterType],
            stash_id: objectFilter[filterType].stashID,
          };
        }

        break;

      // `String`
      case "has_markers":
      case "is_missing":
        updatedFilter[filterType] = objectFilter[filterType].value;
        break;

      // `StringCriterionInput`
      case "audio_codec":
      case "captions":
      case "checksum": // ! Untested
      case "code": // Studio code
      case "details":
      case "director":
      case "oshash": // Hash
      case "path":
      case "phash": // ! Untested
      case "title":
      case "url":
      case "video_codec":
        updatedFilter[filterType] = {
          modifier: new EnumType(updatedFilter[filterType].modifier),
          value: objectFilter[filterType].value,
        };
        break;

      // OTHER

      // "galleries and "movies" are `MultiCriterionInput` but the output doesn't match.
      case "galleries":
      case "groups": // ! Untested
      case "movies":
        updatedFilter[filterType] = {
          modifier: new EnumType(objectFilter[filterType].modifier),
          value: objectFilter[filterType].value.map(
            (i: { id: string }) => i.id
          ),
        };
        break;

      default:
        break;
    }
  }

  return updatedFilter;
};
