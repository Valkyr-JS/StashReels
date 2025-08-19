import ScenePlayerOriginal from "stash-ui/dist/src/components/ScenePlayer/ScenePlayer"
import "./ScenePlayer.scss";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { default as cx } from "classnames";
import videojs, { type VideoJsPlayer } from "video.js";

videojs.hook('setup', (player) => {
    // Stop ScenePlayer from stealing focus on mount
    player.focus = () => {}
    
    // We manually trigger toggle play/pause on click so we don't want the poster image also doing the same
    // and cancelling our change out.
    player.getChild('posterImage')?.off('click');
    player.getChild('posterImage')?.off('tap');

    // Enable tap events since iOS Safari doesn't report click events when tapped
    player.emitTapEvents();
    
    const originalDuration = player.duration;
    player.duration = () => {
        const scene: any = '_scene' in player && player._scene;
        return scene?.files[0]?.duration || originalDuration();
    }
    
    player.vrMenu = (() => {}) as any
    player.skipButtons = (() => {
        return {
            setForwardHandler: () => {},
            setBackwardHandler: () => {}
        }
    }) as any
});

videojs.hook('beforesetup', function(videoEl, options) {
    // We want to manage play/pause ourselves so we can handle taps as well
    options.userActions.click = false;
    options.userActions.doubleClick = false;
    options.inactivityTimeout = 0;
    options.controlBar.children = [
        'progressControl',
        'currentTimeDisplay',
        'customControlSpacer',
        'durationDisplay',
        // The fullscreen button is expected to exist by the sourceSelector plugin but we don't
        // want to show it so we hide in css
        'fullscreenToggle', 
    ]
    options.controlBar.volumePanel = false;
    // Hack to allow removal of plugins
    // Video.js doesn't replace the options object with the one we return, it merges our updated options
    // object back into the original options object. Since a plugin is loaded based purely on the presence 
    // of a key in the options.plugins object simply deleting the key won't remove the plugin since it will
    // still be present in the original options object. To get around this we replace the whole plugins
    // object with a string which can't be merged and so will wipe out the original plugins object. In a second
    // beforesetup hook below we return the plugins property back to an object and there we can add back all plugins
    // minus any we want to remove.
    options._originalPlugins = options.plugins;
    options.plugins = "clear"
  return options;
});


videojs.hook('beforesetup', function(videoEl, options) {
    const {
        sourceSelector,
        bigButtons,
        seekButtons,
        skipButtons,
        ...pluginsToKeep
    } = options._originalPlugins
    options.plugins = {
        ...pluginsToKeep,
    }
    delete options._originalPlugins;
  return options;
});
ScenePlayerOriginal.displayName = "ScenePlayerOriginal";

export type ScenePlayerProps = React.ComponentProps<typeof ScenePlayerOriginal> & {
    className?: string;
    onTimeUpdate?: (event: Event) => void;
    onEnded?: (event: Event) => void;
    hideControls?: boolean;
    hideProgressBar?: boolean;
    muted?: boolean;
    onClick?: (event: MouseEvent) => void;
    onVideojsPlayerReady?: (player: VideoJsPlayer) => void;
}
const ScenePlayer = forwardRef<
    HTMLVideoElement,
    ScenePlayerProps
>(({ className, onTimeUpdate, hideControls, hideProgressBar, muted, onClick, onEnded, onVideojsPlayerReady, ...otherProps }: ScenePlayerProps, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const [videoElm, setVideoElm] = useState<HTMLVideoElement | null>(null);
    const [videojsPlayer, setVideojsPlayer] = useState<VideoJsPlayer | null>(null);
    useEffect(() => {
        videojsPlayer && onVideojsPlayerReady?.(videojsPlayer);
    }, [videojsPlayer, onVideojsPlayerReady]);
    
    
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
    
    useEffect(() => {
        if (!videojsPlayer || typeof muted !== 'boolean') return;
        videojsPlayer.muted(muted);
    }, [videojsPlayer, muted]);

    return (
        <div
            className={cx(['ScenePlayer', className, {'hide-controls': hideControls, 'hide-progress-bar': hideProgressBar}])}
            ref={containerRef}
        >
            <ScenePlayerOriginal
                {...otherProps}
            />
        </div>
    )
});

ScenePlayer.displayName = "ScenePlayer";
export default ScenePlayer;