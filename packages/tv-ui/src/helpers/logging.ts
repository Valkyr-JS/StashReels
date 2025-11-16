import { configure, getConsoleSink } from "@logtape/logtape";

const consoleSink = getConsoleSink()

export const setupLogging = async ({debugMode}: {debugMode?: boolean} = {}) => {
  await configure({
    reset: true, // Allows us to call this whenever debugMode changes and rewrite any existing config
    sinks: {
      console (logRecord) {
        // Append properties to message if they exist
        if (Object.keys(logRecord.properties).length) {
          logRecord = {
            ...logRecord,
            message: [...logRecord.message.slice(0,logRecord.message.length-1), [logRecord.message.at(-1), JSON.stringify(logRecord.properties, null, 2)].filter(Boolean).join(' | ')],
          }
        }
        return consoleSink(logRecord);
      }
    },
    loggers: [
      { category: "stash-tv", lowestLevel: debugMode ? "debug" : "warning", sinks: ["console"] },
      { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console"] },
    ]
  });
}
