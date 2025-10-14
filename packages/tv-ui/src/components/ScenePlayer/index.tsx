import ScenePlayerOriginal from "stash-ui/dist/src/components/ScenePlayer/ScenePlayer"
import "./ScenePlayer.scss";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { default as cx } from "classnames";
import videojs, { VideoJsPlayerOptions, type VideoJsPlayer } from "video.js";
import { allowPluginRemoval } from "./hooks/allow-plugin-removal";
import { registerVideojsOverlayButtonsExtendedPlugin } from "./plugins/videojs-overlay-buttons-extended";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { getSceneIdForVideoJsPlayer } from "../../helpers";

registerVideojsOverlayButtonsExtendedPlugin();

const videoJsOptionsOverride: Record<string, VideoJsPlayerOptions> = {}
const videoJsSetupCallbacks: Record<string, (player: VideoJsPlayer) => void> = {}

videojs.hook('setup', (player) => {
    // Stop ScenePlayer from stealing focus on mount
    player.focus = () => {}

    // For some reason videojs doesn't always get the correct video duration so this is a workaround
    const originalDuration = player.duration;
    player.duration = () => {
        const scene: any = '_scene' in player && player._scene;
        return scene?.files[0]?.duration || originalDuration();
    }
});

videojs.hook('setup', function(player) {
    let sceneId
    try {
        sceneId = getSceneIdForVideoJsPlayer(player.el());
    } catch (error) {
        console.error(error)
        return;
    }
    videoJsSetupCallbacks[sceneId]?.(player)
})

videojs.hook('beforesetup', function(videoEl, options) {
    // Will be merged in with existing options
    return {
        userActions: {
            click: false,
            doubleClick: false
        },
        inactivityTimeout: 5000,
        controlBar: {
            children: [ 
                'progressControl',
                'currentTimeDisplay',
                'customControlSpacer',
                'durationDisplay',
                // The fullscreen button is expected to exist by the sourceSelector plugin but we don't
                // want to show it so we hide in css
                'fullscreenToggle', 
            ],
            volumePanel: false,
        },
        plugins: {
            sourceSelector: undefined,
            bigButtons: undefined,
            seekButtons: undefined,
            skipButtons: undefined,
            persistVolume: undefined,
            vrMenu: undefined,
            touchOverlay: {
                seekLeft: {},
                play: {},
                seekRight: {},
            },
        },
        // Override defaults found here:
        // https://github.com/videojs/video.js/blob/7c3d3f4479ba3dd572ac28082ee6e660e4c4e912/src/js/player.js#L5271
        // Removes:
        //   bigPlayButton
        children: [
            'mediaLoader',
            'posterImage',
            'textTrackDisplay',
            'loadingSpinner',
            'liveTracker',
            'controlBar',
            'errorDisplay',
            'textTrackSettings',
            'resizeManager',
        ]
    }
});

// Merge in any option overrides set by this component
videojs.hook('beforesetup', function(videoEl, options) {
    let sceneId
    try {
        sceneId = getSceneIdForVideoJsPlayer(videoEl);
    } catch (error) {
        console.error(error)
        return {};
    }
    return videoJsOptionsOverride[sceneId] || {}
})

allowPluginRemoval(videojs);


ScenePlayerOriginal.displayName = "ScenePlayerOriginal";

export type ScenePlayerProps = Omit<React.ComponentProps<typeof ScenePlayerOriginal>, 'scene'> & {
    className?: string;
    onTimeUpdate?: (event: Event) => void;
    onEnded?: (event: Event) => void;
    hideControls?: boolean;
    hideProgressBar?: boolean;
    onClick?: (event: MouseEvent) => void;
    onVideojsPlayerReady?: (player: VideoJsPlayer) => void;
    optionsToMerge?: VideoJsPlayerOptions;
    scene: GQL.TvSceneDataFragment;
    muted?: boolean;
    loop?: boolean;
    trackActivity?: boolean;
    scrubberThumbnail?: boolean;
    markers?: boolean;
}
const ScenePlayer = forwardRef<
    HTMLVideoElement,
    ScenePlayerProps
>(({ 
    className, 
    onTimeUpdate, 
    hideControls, 
    hideProgressBar, 
    onClick, 
    onEnded, 
    onVideojsPlayerReady, 
    optionsToMerge, 
    muted, 
    loop, 
    trackActivity = true,
    scrubberThumbnail = true,
    markers = true,
    ...otherProps
}: ScenePlayerProps, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    import.meta.env.VITE_DEBUG && useEffect(() => {
        console.log(`Mounted ScenePlayer sceneId=${otherProps.scene.id}`);
        return () => console.log(`Unmounted ScenePlayer sceneId=${otherProps.scene.id}`);
    },[]);
    
    const [videoElm, setVideoElm] = useState<HTMLVideoElement | null>(null);
    const [videojsPlayer, setVideojsPlayer] = useState<VideoJsPlayer | null>(null);
    const videojsPlayerRef = useRef<VideoJsPlayer | null>(null);
    
    
    // Stash's ScenePlayer component determines if a stream is direct or not based on the URL path. Since it wouldn't
    // normally play a preview path it doesn't detect this at direct and that breaks how seeking for preview videos.
    // To fix this we temporarily change the preview URL to end with /stream so that ScenePlayer treats it
    // as a direct stream when loading streams. Then we add a wrapper to the Video.js instance to revert any preview
    // urls back to remove the "/stream" suffix before Video.js uses them.
    otherProps.scene = {
        ...otherProps.scene,
        sceneStreams: otherProps.scene.sceneStreams
            .map(
                stream => ({
                    ...stream,
                    url: stream.url.replace(/\/preview$/, '/preview/stream')
                })
            ),
    }
    function addWrapperToRevertPreviewUrlChange(player: VideoJsPlayer) {
        const originalSourceSelector = player.sourceSelector
        player.sourceSelector = function(...args) {
            const sourceSelector = originalSourceSelector.apply(this, args);
            const originalSetSources = sourceSelector.setSources;
            sourceSelector.setSources = function(sources, ...otherArgs) {
                sources.forEach(source => {
                    if (source.src) {
                        source.src = source.src.replace(/\/preview\/stream$/, '/preview');
                    }
                });
                originalSetSources.apply(this, [sources, ...otherArgs]);
            };
            return sourceSelector;
        };
    }
    
    videoJsSetupCallbacks[otherProps.scene.id] = (player) => {
        if (loop !== undefined) {
            // Ideally we wouldn't need this. See comment for "loop" in videoJsOptionsOverride
            setTimeout(() => !player.isDisposed() && player.loop(loop), 100);
        }
        addWrapperToRevertPreviewUrlChange(player);
        onVideojsPlayerReady?.(player);
    }

    videoJsOptionsOverride[otherProps.scene.id] = {
        muted,
        loop: loop, // Unfortunately this doesn't seem to work since the stash ScenePlayer component seems immediately set
        // the loop value itself after initialization so we have to set it the player ready callback
        ...optionsToMerge,
        plugins: {
            ...(!trackActivity ? { trackActivity: undefined } : {}),
            ...(!scrubberThumbnail ? { vttThumbnails: undefined } : {}),
            ...(!markers ? { markers: undefined } : {}),
            ...optionsToMerge?.plugins
        },
    }
    
    useEffect(() => {
        if (muted === undefined) return;
        videojsPlayerRef.current?.muted(muted);
    }, [muted]);
    
    useEffect(() => {
        if (loop === undefined) return;
        videojsPlayerRef.current?.loop(loop);
    }, [loop]);
    
    useEffect(() => {
        return () => {
            const videojsPlayer = videojsPlayerRef.current
            if (videojsPlayer) {
                videojsPlayer.on("dispose", () => {
                    /* Prevent bug in markers plugin where it tries to operate on the player element after it's been disposed */
                    videojsPlayer.markers = () => ({
                        clearMarkers: () => {}
                    })
                })
            }
        }
    }, [])
    
    
    useEffect(() => {
        if (videojsPlayer) {
            (videojsPlayer as any)._scene = otherProps.scene
            
        }
    }, [videojsPlayer, otherProps.scene]);

    useEffect(() => {
        const videoElm = containerRef.current?.querySelector('video')
        if (!videoElm) {
            console.warn("ScenePlayer: No video element found in container");
            return;
        }
        
        // Set the video element to the ref provided by the parent component
        if (ref) {
            if (typeof ref === 'function') {
                ref(videoElm);
            } else if (ref && 'current' in ref) {
                ref.current = videoElm;
            }
        }

        setVideoElm(videoElm);
        
        const player = videojs.getPlayer(videoElm);
        if (player) {
            videojsPlayerRef.current = player;
            setVideojsPlayer(player);
        }
    }, []);

    useEffect(() => {
        if (!videoElm || !onTimeUpdate) return;
        videoElm.addEventListener('timeupdate', onTimeUpdate);
        return () => {
            videoElm.removeEventListener('timeupdate', onTimeUpdate);
        }
    }, [videoElm, onTimeUpdate]);

    useEffect(() => {
        if (!videoElm || !onEnded) return;
        videoElm.addEventListener('ended', onEnded);
        return () => {
            videoElm.removeEventListener('ended', onEnded);
        }
    }, [videoElm, onEnded]);
    
    const lastTouchEndEventRef = useRef<Event | null>(null);

    useEffect(() => {
        if (!videojsPlayer || !onClick) return;
        videojsPlayer.el().addEventListener('touchend', (event) => {lastTouchEndEventRef.current = event}, {capture: true});
        const onTapHandler = (event: TouchEvent) => {
            TouchList
            const touchEvent = lastTouchEndEventRef.current
            const touches = touchEvent && 'changedTouches' in touchEvent && touchEvent.changedTouches instanceof TouchList ? touchEvent.changedTouches : null
            if (!touches || touches.length === 0) {
                console.warn("Tap event detected but no touches found", event, touchEvent);
                return;
            }
            const lastTouch = touches[touches.length - 1];
            const equivalentMouseEvent = new MouseEvent('click', {
                clientX: lastTouch.clientX,
                clientY: lastTouch.clientY,
            });
            event.target?.dispatchEvent(equivalentMouseEvent);
        }
        videojsPlayer.on('click', onClick);
        videojsPlayer.on('tap', onTapHandler);
        return () => {
            videojsPlayer.off('click', onClick);
            videojsPlayer.off('tap', onTapHandler);
        }
    }, [videojsPlayer, onClick]);

    return (
        <div
            className={cx(['ScenePlayer', className, {'hide-controls': hideControls, 'hide-progress-bar': hideProgressBar}])}
            ref={containerRef}
            data-scene-id={otherProps.scene?.id}
        >
            <ScenePlayerOriginal
                {...otherProps}
                permitLoop={true}
                // ScenePlayer only needs a subset of SceneDataFragment so to reduce network request
                // times we only give it the necessary fields
                scene={otherProps.scene as unknown as GQL.SceneDataFragment}
            />
        </div>
    )
});

ScenePlayer.displayName = "ScenePlayer";
export default ScenePlayer;