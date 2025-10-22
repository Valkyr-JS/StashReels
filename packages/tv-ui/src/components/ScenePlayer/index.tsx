import ScenePlayerOriginal from "stash-ui/dist/src/components/ScenePlayer/ScenePlayer"
import "stash-ui/dist/src/components/ScenePlayer/styles.css"
import "./ScenePlayer.scss";
import React, { ForwardedRef, forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useUID } from 'react-uid';
import { default as cx } from "classnames";
import videojs, { VideoJsPlayerOptions, type VideoJsPlayer } from "video.js";
import { allowPluginRemoval } from "./hooks/allow-plugin-removal";
import { registerVideojsOverlayButtonsExtendedPlugin } from "./plugins/videojs-overlay-buttons-extended";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { getPlayerIdForVideoJsPlayer } from "../../helpers";
import { useAppStateStore } from "../../store/appStateStore";
import 'videojs-offset'

registerVideojsOverlayButtonsExtendedPlugin();

const videoJsOptionsOverride: Record<string, VideoJsPlayerOptions> = {}
const videoJsSetupCallbacks: Record<string, (player: VideoJsPlayer) => void> = {}

videojs.hook('setup', (player) => {
    // Stop ScenePlayer from stealing focus on mount
    player.focus = () => {}
});

videojs.hook('setup', function(player) {
    let playerId
    try {
        playerId = getPlayerIdForVideoJsPlayer(player.el());
    } catch (error) {
        console.error(error)
        return;
    }
    videoJsSetupCallbacks[playerId]?.(player)
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
    let playerId
    try {
        playerId = getPlayerIdForVideoJsPlayer(videoEl);
    } catch (error) {
        console.error(error)
        return {};
    }
    return videoJsOptionsOverride[playerId] || {}
})

allowPluginRemoval(videojs);


ScenePlayerOriginal.displayName = "ScenePlayerOriginal";

export type ScenePlayerProps = Omit<React.ComponentProps<typeof ScenePlayerOriginal>, 'scene' | 'onComplete' | 'initialTimestamp'> & {
    className?: string;
    onTimeUpdate?: (event: Event) => void;
    // We define onEnded instead of using wrapped ScenePlayer's onComplete prop so we can make it optional as well as
    // use a name that's more inline with standard HTMLVideoElement event name
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
    refVideo?: ForwardedRef<HTMLVideoElement>
    onPlay?: HTMLVideoElement["onplay"],
    onPause?: HTMLVideoElement["onpause"],
    // Redefine to make optional
    initialTimestamp?: number;
}
const ScenePlayer = forwardRef<
    HTMLDivElement,
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
    refVideo,
    onPlay,
    onPause,
    initialTimestamp,
    ...otherProps
}: ScenePlayerProps, ref) => {
    // We don't use `ref` directly on our root element since `ref` since we also need access to the root element in this
    // file and if we use `ref` it might be a function which once set we don't have access to it's contents. Therefore
    // we use containerRef as an intermediary.
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const rootElm = containerRef.current
        if (!rootElm) {
            console.warn("ScenePlayer: Could not get root elm");
            return;
        }
        
        // Set the video element to the ref provided by the parent component
        if (ref) {
            if (typeof ref === 'function') {
                ref(rootElm);
            } else {
                ref.current = rootElm;
            }
        }
    }, []);

    const { debugMode } = useAppStateStore();
    useEffect(() => {
        debugMode && console.log(`Mounted ScenePlayer sceneId=${otherProps.scene.id}`);
        return () => {
            debugMode && console.log(`Unmounted ScenePlayer sceneId=${otherProps.scene.id}`);
        }
    },[]);
    
    const [videoElm, setVideoElm] = useState<HTMLVideoElement | null>(null);
    const [videojsPlayer, setVideojsPlayer] = useState<VideoJsPlayer | null>(null);
    const videojsPlayerRef = useRef<VideoJsPlayer | null>(null);
    
    // Replace with React's useId when we upgrade to React 18
    const playerId = useUID();
    
    // While a scene wouldn't normally contain a stream for the preview video if the provided for whatever reason then
    // it will be treated as not a direct stream by the wrapped ScenePlayer component. This causes playback issues
    // especially around seeking. The check to determine if a stream is direct or not is hardcoded to recognise certain
    // urls. We can't change this so as a workaround we temporarily change the preview URL to end with /stream which
    // ScenePlayer treats as a direct stream at the point where it processes the streams to load. Then we add a wrapper 
    // to the Video.js instance's sourceSelector function to revert any preview urls back to remove the "/stream" suffix 
    // before Video.js actually uses them.
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
    
    // The wrapped ScenePlayer component has a buggy implementation of onComplete handling that results in all "ended"
    // handlers being removed periodically. So we disable it and reimplement making sure we only remove the onComplete
    // listener when cleaning up.
    function disableBuggyOnEndHandling(player: VideoJsPlayer) {
        const originalOn = player.on;
        player.on = function(...args) {
            const [event, listener] = args;
            if (event === 'ended' && listener === stubOnComplete) {
                return;
            }
            // @ts-expect-error - on has multiple overloads
            return originalOn.apply(this, args);
        };
        const originalOff = player.off;
        player.off = function(...args) {
            const [event, listener] = args;
            if (event === 'ended' && !listener) {
                return;
            }
            // @ts-expect-error - off has multiple overloads
            return originalOff.apply(this, args);
        };
    }
    function stubOnComplete() {}
    useEffect(() => {
        const player = videojsPlayerRef.current
        if (!onEnded || !player || player.isDisposed()) return;

        player.on("ended", onEnded);

        return () => player.off("ended", onEnded);
    }, [onEnded]);

    // Code to be run when wrapped ScenePlayer's Video.js player has been created
    videoJsSetupCallbacks[playerId] = (player) => {
        if (loop !== undefined) {
            // Ideally we wouldn't need this. See comment for "loop" in videoJsOptionsOverride
            setTimeout(() => !player.isDisposed() && player.loop(loop), 100);
        }
        addWrapperToRevertPreviewUrlChange(player);
        disableBuggyOnEndHandling(player);
        onVideojsPlayerReady?.(player);
        videojsPlayerRef.current = player;
        setVideojsPlayer(player);
        
        const videoElm = player.el()?.querySelector('video')
        if (!videoElm) {
            console.warn("ScenePlayer: No video element found in container");
            return;
        }

        setVideoElm(videoElm);
    }

    // Options to inject into wrapped ScenePlayer's Video.js instance when it's being created
    videoJsOptionsOverride[playerId] = {
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

    // Pass muted prop to Video.js player
    useEffect(() => {
        const player = videojsPlayerRef.current
        if (muted === undefined || !player || player.isDisposed()) return;
        player.muted(muted);
    }, [muted]);
    
    // Pass loop prop to Video.js player
    useEffect(() => {
        const player = videojsPlayerRef.current
        if (loop === undefined || !player || player.isDisposed()) return;
        player.loop(loop);
    }, [loop]);
    
    // Fix bug in wrapped ScenePlayer that some times results in an error being thrown on unmount
    useEffect(() => {
        return () => {
            const videojsPlayer = videojsPlayerRef.current
            if (videojsPlayer) {
                videojsPlayer.on("dispose", () => {
                    // Prevent bug in markers plugin where it tries to operate on the player element after it's been
                    // disposed
                    videojsPlayer.markers = () => ({
                        clearMarkers: () => {}
                    } as ReturnType<VideoJsPlayer["markers"]>)
                })
            }
        }
    }, [])

    useEffect(() => {
        if (videojsPlayer) {
            (videojsPlayer as any)._scene = otherProps.scene
        }
    }, [videojsPlayer, otherProps.scene]);

    // Set the `refVideo` prop to the video element
    useEffect(() => {
        if (refVideo) {
            if (typeof refVideo === 'function') {
                refVideo(videoElm);
            } else {
                refVideo.current = videoElm;
            }
        }
    }, [videoElm, refVideo]);

    // Attach the onPlay event handler to the video element
    useEffect(() => {
        if (!videoElm || !onPlay) return;
        videoElm.addEventListener('play', onPlay);
        return () => {
            videoElm.removeEventListener('play', onPlay);
        }
    }, [videoElm, onPlay]);

    // Attach the onPause event handler to the video element
    useEffect(() => {
        if (!videoElm || !onPause) return;
        videoElm.addEventListener('pause', onPause);
        return () => {
            videoElm.removeEventListener('pause', onPause);
        }
    }, [videoElm, onPause]);

    // Attach the onTimeUpdate event handler to the video element
    useEffect(() => {
        if (!videoElm || !onTimeUpdate) return;
        videoElm.addEventListener('timeupdate', onTimeUpdate);
        return () => {
            videoElm.removeEventListener('timeupdate', onTimeUpdate);
        }
    }, [videoElm, onTimeUpdate]);
    
    const scene = useMemo(() => {
        let scene = JSON.parse(JSON.stringify(otherProps.scene));
        
        // Wrapped ScenePlayer will start playback from resume_time even if initialTimestamp is set when it's set to 0. 
        // By making resume_time at least as long as duration we short circuit some of it's logic and cause it to 
        // initialTimestamp.
        if (initialTimestamp !== undefined) {
            scene.resume_time = otherProps.scene.files?.[0]?.duration;
        }
        
        // Wrapped ScenePlayer only needs a subset of SceneDataFragment so to reduce network request
        // times we only give it the necessary fields
        return scene as GQL.SceneDataFragment
    }, [otherProps.scene, initialTimestamp]);
    
    const lastTouchEndEventRef = useRef<Event | null>(null);

    // Attach the onClick event handler to the video element, converting tap event to click events. There might be a 
    // cleaner way of doing this. If not we should document why taps don't trigger clicks.
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
            data-player-id={playerId}
        >
            <ScenePlayerOriginal
                {...otherProps}
                initialTimestamp={initialTimestamp || 0}
                permitLoop={true}
                scene={scene}
                onComplete={stubOnComplete}
            />
        </div>
    )
});

ScenePlayer.displayName = "ScenePlayer";
export default ScenePlayer;