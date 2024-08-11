import { useWindowSize } from "../hooks";

/** Fetch data from Stash via GQL. */
export const fetchData = async (query: string) => {
  try {
    const res = await fetch(
      process.env.NODE_ENV === "production"
        ? "/graphql"
        : process.env.STASH_ADDRESS + "/graphql",
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
