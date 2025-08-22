import { EnumType, jsonToGraphQLQuery } from "json-to-graphql-query";
import { useWindowSize } from "../hooks";
import { PLUGIN_NAMESPACE } from "../constants";
import { GenderEnum, Maybe, SaveFilterInput } from "stash-ui/dist/src/core/generated-graphql";
import { PluginConfig } from "../../types/stash-tv";

/** Fetch data from Stash via GQL. */
export const fetchData = async (query: string) => {
  try {
    const res = await fetch(
      // @ts-expect-error This will throw an error until we move modules in tsconfig.json to esm
      !import.meta.env.DEV
        ? "/graphql"
        // @ts-expect-error
        : import.meta.env.STASH_ADDRESS + "/graphql",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }
    );
    return await res.json();
  } catch (err) {
    return console.log(err);
  }
};

export const fetchPluginConfig = () => {
  const query = jsonToGraphQLQuery({
    query: {
      configuration: {
        plugins: true,
      },
    },
  });

  return fetchData(query) as Promise<IfetchPluginConfigResults>;
};

/** Fetch all scene filter data from Stash via GQL. Also fetches the user's
 * config. */
export const fetchSceneFilters = () => {
  const query = jsonToGraphQLQuery({
    query: {
      configuration: {
        plugins: true,
        ui: true,
      },
      findSavedFilters: {
        __args: {
          mode: new EnumType("SCENES"),
        },
        id: true,
        name: true,
      },
    },
  });

  return fetchData(query) as Promise<IfetchSceneFiltersResult>;
};

interface IfetchSceneFiltersResult {
  data: {
    configuration: {
      plugins: {
        [plugin: string]: {
          [property: string]: string | number | boolean;
        };
      };
      ui?: {
        defaultFilters?: {
          scenes?: SaveFilterInput;
        };
      };
    };
    findSavedFilters: { id: string; name: string }[];
  };
}

interface IfetchPluginConfigResults {
  data: {
    configuration: {
      plugins: {
        [plugin: string]: {
          [property: string]: string | number | boolean;
        };
      };
    };
  };
}

// Converts seconds to a hh:mm:ss timestamp.
// A negative input will result in a -hh:mm:ss or -mm:ss output.
// Fractional inputs are truncated.
export const secondsToTimestamp = (seconds: number) => {
  let neg = false;
  if (seconds < 0) {
    neg = true;
    seconds = -seconds;
  }
  seconds = Math.trunc(seconds);

  const s = seconds % 60;
  seconds = (seconds - s) / 60;

  const m = seconds % 60;
  seconds = (seconds - m) / 60;

  const h = seconds;

  let ret = String(s).padStart(2, "0");
  ret = String(m).padStart(2, "0") + ":" + ret;
  ret = String(h).padStart(2, "0") + ":" + ret;
  if (neg) {
    return "-" + ret;
  } else {
    return ret;
  }
};

/** Function for setting the --vsr-vh CSS variable used in video items. */
export const setCssVH = () => {
  const windowSize = useWindowSize();
  let vh = windowSize.height * 0.01;
  document.documentElement.style.setProperty("--vsr-vh", `${vh}px`);
};

/** Sort performers by gender then alphabetically. */
export function sortPerformers<T extends IPerformerFragment>(performers: T[]) {
  const ret = performers.slice();
  ret.sort((a, b) => {
    if (a.gender === b.gender) {
      // sort by name
      return (a.name ?? "").localeCompare(b.name ?? "");
    }

    // TODO - may want to customise gender order
    const aIndex = a.gender ? GENDERS.indexOf(a.gender) : GENDERS.length;
    const bIndex = b.gender ? GENDERS.indexOf(b.gender) : GENDERS.length;
    return aIndex - bIndex;
  });

  return ret;
}

/** Update the user's plugin config for Stash TV. NOTE: This overwrites the
 * entire plugin config, not just the updated properties. Be sure to pass the
 * entire config object. */
export const updateUserConfig = async (config: PluginConfig) => {
  const mutation = jsonToGraphQLQuery({
    mutation: {
      configurePlugin: {
        __args: {
          plugin_id: PLUGIN_NAMESPACE,
          input: config,
        },
      },
    },
  });
  const f = fetchData(mutation);
  console.log(f);
  return f;
};

interface IPerformerFragment {
  name?: Maybe<string>;
  gender?: Maybe<GenderEnum>;
}

/** `enum GenderEnum` as an array. */
export const GENDERS = [
  "FEMALE",
  "TRANSGENDER_FEMALE",
  "MALE",
  "TRANSGENDER_MALE",
  "INTERSEX",
  "NON_BINARY",
] as GenderEnum[];
