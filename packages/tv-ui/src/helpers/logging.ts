import { configure, getConsoleSink, LogLevel } from "@logtape/logtape";

const consoleSink = getConsoleSink()

export const defaultLogLevel: LogLevel = import.meta.env.DEV ? "info" : "warning";

export const setupLogging = async ({logLevel = defaultLogLevel}: {logLevel?: LogLevel} = {}) => {
  await configure({
    reset: true, // Allows us to call this whenever logLevel changes and rewrite any existing config
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
      { category: "stash-tv", lowestLevel: logLevel, sinks: ["console"] },
      // Disables notification from logtape suggesting to set an additional chanel for logging logger failures. Since
      // we're only really using logging in the development stage we don't really care enough about log fails in
      // production to worry about this.
      { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console"] },
    ]
  });
}
