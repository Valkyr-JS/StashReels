import { GenderEnum, Maybe } from "stash-ui/dist/src/core/generated-graphql";

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

export function clamp(min: number, num: number, max: number) {
  return Math.min(Math.max(num, min), max);
}