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
      // `MultiCriterionInput`
      case "performers":
        updatedFilter[filterType] = {
          modifier: new EnumType(objectFilter[filterType].modifier),
          value: objectFilter[filterType].value.items.map((i: any) => i.id),
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

      // `StringCriterionInput`
      case "title":
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
