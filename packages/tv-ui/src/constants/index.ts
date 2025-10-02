/** The React Select-formatted filter info used as a fallback if no saved
 * filters are available. */
export const DEFAULT_FILTER = {
  label: "Default",
  value: "default",
} as const;

/** The React Select-formatted filter info used as a fallback if no default
 * filter is available. */
export const FALLBACK_FILTER = {
  label: "All portrait scenes",
  value: "portrait",
} as const;

/** The number of items remaining in the queue before new item data is fetched.
 * */
export const ITEMS_BEFORE_END_ON_FETCH = 2 as const;

export const PLUGIN_CONFIG_PROPERTY = {
  DEFAULT_FILTER_ID: "defaultFilterID",
  SUBTITLE_LANGUAGE: "subtitleLanguage",
} as const;

export const PLUGIN_NAMESPACE = "stash-tv" as const;

/** The time it takes in milliseconds for a transition to complete. */
export const TRANSITION_DURATION = 150 as const;

export const DEFAULT_MAXIMUM_SCENES = 500 as const;
