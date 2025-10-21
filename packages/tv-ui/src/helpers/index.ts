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

export function updateReadOnlyProp(obj: any, prop: string, value: any) {
  Object.defineProperty(obj, prop, { value, writable: true, enumerable: isEnumerableIncludingInherited(obj, prop) });
}

export function updateReadOnlyProps(obj: any, props: Record<string, any>) {
  for (const [prop, value] of Object.entries(props)) {
    updateReadOnlyProp(obj, prop, value);
  }
} 

function isEnumerableIncludingInherited(obj: any, prop: string) {
  let current = obj;
  while (current) {
    const desc = Object.getOwnPropertyDescriptor(current, prop);
    if (desc) return !!desc.enumerable;
    current = Object.getPrototypeOf(current);
  }
  return false; // not found anywhere in the chain
}

export function getSceneIdForVideoJsPlayer(videoElm: Element): string {
  let node: Element | null = videoElm;
  while (node !== null) {
    if (node instanceof HTMLElement && 'sceneId' in node.dataset && node.dataset.sceneId) {
      return node.dataset.sceneId;
    }
    node = node.parentElement;
  }
  throw new Error("Could not find sceneId for Video.js player");
}
    
export function getPlayerIdForVideoJsPlayer(videoElm: Element): string {
  let node: Element | null = videoElm;
  while (node !== null) {
    if (node instanceof HTMLElement && 'playerId' in node.dataset && node.dataset.playerId) {
      return node.dataset.playerId;
    }
    node = node.parentElement;
  }
  throw new Error("Could not find playerId for Video.js player");
}
    