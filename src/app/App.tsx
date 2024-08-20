import React, { useEffect, useState } from "react";
import FeedPage from "../pages/Feed";
import { fetchData, setCssVH } from "../helpers";
import { jsonToGraphQLQuery, EnumType } from "json-to-graphql-query";

const App = () => {
  setCssVH();

  const [filterData, setFilterData] = useState<string | null>(null);
  useEffect(() => {
    // Get the data for the user's chosen filter
    fetchData(
      jsonToGraphQLQuery({
        query: {
          findSavedFilter: {
            __args: {
              id: "29", // ! Hardcoded for dev only
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
    ).then((flt) => {
      // Convert the filter to a GQL query to pass to the Feed page.
      console.log(flt.data.findSavedFilter);
      const query = jsonToGraphQLQuery({
        query: {
          findScenes: {
            __args: {
              filter: processFilter(flt.data.findSavedFilter.find_filter),
              scene_filter: processObjectFilter(
                flt.data.findSavedFilter.object_filter
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
      console.log(query);
      setFilterData(query);
    });
  }, []);

  if (!filterData) return <div>Loading</div>;

  return <FeedPage query={filterData} captionsDefault={undefined} />;
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

      default:
        break;
    }
  }

  return updatedFilter;
};
