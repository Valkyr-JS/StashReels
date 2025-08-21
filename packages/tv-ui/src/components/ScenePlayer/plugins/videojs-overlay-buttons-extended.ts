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
    videojs.registerPlugin = (pluginNameToBeRegistered, pluginToBeRegistered) => {
        pluginName = pluginNameToBeRegistered
        plugin = pluginToBeRegistered
    }
    await import('videojs-overlay-buttons');
    videojs.registerPlugin = originalRegisterPlugin
    if (!pluginName || !plugin) {
        throw new Error(`Failed to load original videojs-overlay-buttons plugin`);
    }
    return {
        pluginName,
        plugin
    }
}