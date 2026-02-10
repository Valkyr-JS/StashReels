import videoJsNamespace from "video.js";

/**
 * Hack to work around https://github.com/cladera/videojs-offset/issues/42
 */

export function fixVideojsOffsetMultiPlayerBug(videojs: typeof videoJsNamespace) {
  const Player = videojs.getComponent('player') as any
  if (!Player) throw Error("Could not find video.js player class")
  const originalOffsetPlugin = Player.prototype.offset
  if (!originalOffsetPlugin) return {}


  Player.prototype.offset = function() {
    const { start, end } = arguments[0] || {}
    if (typeof start === "number" && typeof end === "number" && end < start) {
      console.warn(`Invalid offset plugin configuration with start (${start}) greater than end (${end}). This may cause playback issues.`, this);
    }
    const originalConstructor = Object.getPrototypeOf(this).constructor;
    this.constructor = this
    this.constructor.prototype = this
    const response = originalOffsetPlugin.call(this, ...arguments)
    this.constructor = originalConstructor
    return response;
  }
}
