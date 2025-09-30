import ScenePlayerOriginal from "stash-ui/dist/src/components/ScenePlayer/ScenePlayer"
import "./ScenePlayer.scss";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { default as cx } from "classnames";
import videojs, { VideoJsPlayerOptions, type VideoJsPlayer } from "video.js";
import { addSupportForLandscapeSupport } from "./hooks/force-landscape-support";
import { allowPluginRemoval } from "./hooks/allow-plugin-removal";
import { registerVideojsOverlayButtonsExtendedPlugin } from "./plugins/videojs-overlay-buttons-extended";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

registerVideojsOverlayButtonsExtendedPlugin();

const videoJsOptions: Record<string, VideoJsPlayerOptions> = {}
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
    
    // ScenePlayer calls these functions at some point which causes them to be loaded even though we've attempted to
    // remove them from the player options. To get around this we redefine these functions as stubs.
    player.vrMenu = (() => {
        return {
            setShowButton: () => {}
        }
    }) as any
    player.skipButtons = (() => {
        return {
            setForwardHandler: () => {},
            setBackwardHandler: () => {}
        }
    }) as any
});

videojs.hook('setup', function(player) {
    const sceneId = player.el().parentElement?.parentElement?.parentElement?.dataset.sceneId
    videoJsSetupCallbacks[sceneId || ""]?.(player)
})

addSupportForLandscapeSupport(videojs);

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
            sourceSelector: false,
            bigButtons: false,
            seekButtons: false,
            skipButtons: false,
            vrMenu: false,
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

videojs.hook('beforesetup', function(videoEl, options) {
    const sceneId = videoEl.parentElement?.parentElement?.parentElement?.dataset.sceneId
    if (sceneId) {
        return videoJsOptions[sceneId] || {}
    }
    return {}
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
}
const ScenePlayer = forwardRef<
    HTMLVideoElement,
    ScenePlayerProps
>(({ className, onTimeUpdate, hideControls, hideProgressBar, onClick, onEnded, onVideojsPlayerReady, optionsToMerge, ...otherProps }: ScenePlayerProps, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const [videoElm, setVideoElm] = useState<HTMLVideoElement | null>(null);
    const [videojsPlayer, setVideojsPlayer] = useState<VideoJsPlayer | null>(null);
    const videojsPlayerRef = useRef<VideoJsPlayer | null>(null);
    if (onVideojsPlayerReady) {
        videoJsSetupCallbacks[otherProps.scene.id] = onVideojsPlayerReady;
    }
    
    if (optionsToMerge) {
        videoJsOptions[otherProps.scene.id] = optionsToMerge
    }
    
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
                // ScenePlayer only needs a subset of SceneDataFragment so to reduce network request
                // times we only give it the necessary fields
                scene={otherProps.scene as unknown as GQL.SceneDataFragment}
            />
        </div>
    )
});

ScenePlayer.displayName = "ScenePlayer";
export default ScenePlayer;