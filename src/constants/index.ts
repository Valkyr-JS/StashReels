/** The React Select-formatted filter info used as a fallback if no filters are
 * available. */
export const FALLBACK_FILTER = {
  label: "All portrait scenes",
  value: "A",
} as const;

/** The number of items to fetch data for. */
export const ITEM_BUFFER_EACH_SIDE = 5 as const;

/** The number of items remaining in the queue before new item data is fetched.
 * */
export const ITEMS_BEFORE_END_ON_FETCH = 2 as const;

export const PLUGIN_CONFIG_PROPERTY = {
  DEFAULT_FILTER_ID: "defaultFilterID",
  SUBTITLE_LANGUAGE: "subtitleLanguage",
} as const;

export const PLUGIN_NAMESPACE = "StashReels" as const;

/** The time it takes in milliseconds for a transition to complete. */
export const TRANSITION_DURATION = 150 as const;
