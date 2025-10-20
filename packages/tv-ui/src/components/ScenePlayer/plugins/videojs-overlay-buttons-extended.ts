import "videojs-overlay-buttons/dist/videojs-overlay-buttons.css";
import "./videojs-overlay-buttons-extended.scss";
import videojs from "video.js";

export async function registerVideojsOverlayButtonsExtendedPlugin() {
    const { pluginName, plugin } = await getOriginalPlugin();
    videojs.registerPlugin(pluginName, plugin);
}

export async function getOriginalPlugin() {
    const originalRegisterPlugin = videojs.registerPlugin
    let pluginName
    let plugin
    // @ts-expect-error - We have to hook into the internals for video.js in order to capture the plugin being registered
    videojs.registerPlugin = (pluginNameToBeRegistered, pluginToBeRegistered) => {
        pluginName = pluginNameToBeRegistered
        plugin = pluginToBeRegistered
    }
    // @ts-expect-error - There's no types for this 3rd party module
    await import('videojs-overlay-buttons');
    // @ts-expect-error - Restore the original registerPlugin function
    videojs.registerPlugin = originalRegisterPlugin
    if (!pluginName || !plugin) {
        throw new Error(`Failed to load original videojs-overlay-buttons plugin`);
    }
    return {
        pluginName,
        plugin
    }
}