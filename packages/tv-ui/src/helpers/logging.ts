import { configure, getConsoleSink, Logger, LogLevel } from "@logtape/logtape";

const consoleSink = getConsoleSink()

export const defaultLogLevel: LogLevel = import.meta.env.DEV ? "info" : "warning";

export const setupLogging = async (
  {logLevel = defaultLogLevel, logCategoriesToShow = [], logCategoriesToHide = []}:
    {logLevel?: LogLevel, logCategoriesToShow?: (readonly string[])[], logCategoriesToHide?: (readonly string[])[]} = {}
) => {
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
    filters: {
      categoryFilter: (logRecord) => {
        for (let i = 0; i < logRecord.category.length; i++) {
          const category = logRecord.category.slice(0, logRecord.category.length - i);
          if (logCategoriesToHide.some(hideCategory => (category.length === hideCategory.length) && category.every(
            (part, index) => part === hideCategory[index]
          ))) {
            return false
          }
          if (logCategoriesToShow.some(showCategory => (category.length === showCategory.length) && category.every(
            (part, index) => part === showCategory[index]
          ))) {
            return true
          }
        }
        return logCategoriesToShow.length === 0
      }
    },
    loggers: [
      { category: "stash-tv", lowestLevel: logLevel, sinks: ["console"], filters: ["categoryFilter"] },
      // Disables notification from logtape suggesting to set an additional chanel for logging logger failures. Since
      // we're only really using logging in the development stage we don't really care enough about log fails in
      // production to worry about this.
      { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console"] },
    ]
  });
}

// We need to get loggers from logtape's internal structure until there's an official way to do this:
// https://github.com/dahlia/logtape/issues/62
export function getLoggers(rootLogger?: Logger) {
  if (!rootLogger) {
    const globalSymbol = Object.getOwnPropertySymbols(window).find(sym => sym.description === "logtape.rootLogger")
    if (typeof globalSymbol !== "symbol") {
      throw new Error("No logtape root logger symbol found on window")
    }
    const globalLogger = ((window as unknown) as {[globalSymbol]: Logger | undefined})[globalSymbol]
    if (!globalLogger) {
      throw new Error("No logtape root logger found on window")
    }
    rootLogger = globalLogger
  }
  let loggers = [rootLogger]
  const children = Object
    .values((rootLogger as Logger & {children: Record<string, WeakRef<Logger>>}).children)
    .map(weakRef => weakRef.deref())
    .filter(Boolean)
  for (const child of children) {
    loggers.push(...getLoggers(child))
  }
  return loggers
}
