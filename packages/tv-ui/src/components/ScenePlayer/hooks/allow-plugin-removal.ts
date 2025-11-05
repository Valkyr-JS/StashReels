import videoJsNamespace, { VideoJsPlayer } from "video.js";

/**
 * Hack to allow removal of plugins.
 *
 * Video.js doesn't replace the options object with the one we return, it merges our updated options
 * object back into the original options object. Since a plugin is loaded based purely on the presence
 * of a key in the options.plugins object simply deleting the key won't remove the plugin since it will
 * still be present in the original options object. To get around this we replace the whole plugins
 * object with a string which can't be merged and so will wipe out the original plugins object. In a second
 * beforesetup hook below we return the plugins property back to an object and there we can add back all plugins
 * minus any we want to remove.
 *
 * Another issue is that Stash's ScenePlayer which we're extending is written to assume various plugins are added and
 * removing them can cause errors. To get around this we only add stub implementations of the plugins we want to remove.
 */

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

    // Add plugin stubs so that ScenePlayer doesn't error when trying to use them
    videojs.hook('setup', (player) => {
        const plugins = player.toJSON().plugins || {};

        if (!('vrMenu' in plugins)) {
            player.vrMenu = (() => {
                return {
                    setShowButton: () => {}
                }
            }) as unknown as VideoJsPlayer["vrMenu"];
        }

        if (!('skipButtons' in plugins)) {
            player.skipButtons = (() => {
                return {
                    setForwardHandler: () => {},
                    setBackwardHandler: () => {}
                }
            }) as unknown as VideoJsPlayer["skipButtons"];
        }

        if (!('trackActivity' in plugins)) {
            player.trackActivity = (() => {
                return {
                    reset: () => {},
                    setEnabled: () => {}
                }
            }) as unknown as VideoJsPlayer["trackActivity"];
        }

        if (!('vttThumbnails' in plugins)) {
            player.vttThumbnails = (() => {
                return {
                    src: () => {},
                }
            }) as unknown as VideoJsPlayer["vttThumbnails"];
        }

        if (!('markers' in plugins)) {
            player.markers = (() => {
                return {
                    findColors: () => {},
                    addDotMarkers: () => {},
                    addRangeMarkers: () => {},
                    clearMarkers: () => {},
                }
            }) as unknown as VideoJsPlayer["markers"]
        }
    });
}
