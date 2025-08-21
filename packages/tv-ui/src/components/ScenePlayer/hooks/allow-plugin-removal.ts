import videoJsNamespace from "video.js";

// Hack to allow removal of plugins
// Video.js doesn't replace the options object with the one we return, it merges our updated options
// object back into the original options object. Since a plugin is loaded based purely on the presence 
// of a key in the options.plugins object simply deleting the key won't remove the plugin since it will
// still be present in the original options object. To get around this we replace the whole plugins
// object with a string which can't be merged and so will wipe out the original plugins object. In a second
// beforesetup hook below we return the plugins property back to an object and there we can add back all plugins
// minus any we want to remove.
export function allowPluginRemoval(videojs: typeof videoJsNamespace) {
    videojs.hook('beforesetup', function(videoEl, options) {
        return {
            _originalPlugins: options.plugins,
            plugins: "clear"
        };
    });
    
    videojs.hook('beforesetup', function(videoEl, options) {
        const pluginsToKeep: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(options._originalPlugins)) {
            if (value) {
                pluginsToKeep[key] = value;
            }
        }
        return {
            plugins: pluginsToKeep
        };
    });
}