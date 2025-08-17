import ScenePlayerOriginal from "../../../vendor/stash/ui/v2.5/build/src/components/ScenePlayer/ScenePlayer"
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
    
    // console.log("ScenePlayer: setup", player.el(), player.el().querySelector('video'));
    
    // player.el().addEventListener('click', (event) => {event.stopPropagation(); event.preventDefault()});
    // player.el().querySelector('video')?.addEventListener('click', (event) => {event.stopPropagation(); event.preventDefault()});
    
    // player.on('loadeddata', function () {
    //     if (player.paused()) {
    //         // force the poster back on top
    //         const posterComp = player.getChild('posterImage');
    //         console.log("ScenePlayer: loadeddata", posterComp);
    //         if (posterComp) {
    //             posterComp.show();
    //             posterComp.el().style.display = 'block';
    //         }
    //     }
    // });

    // // Once the video is actually playing, hide the poster normally
    // player.on('playing', function () {
    //     const posterComp = player.getChild('posterImage');
    //     console.log("ScenePlayer: play", posterComp);
    //     if (posterComp) {
    //         posterComp.hide();
    //         posterComp.el().style.display = 'none';
    //     }
    // });

});

videojs.hook('beforesetup', function(videoEl, options) {
    // We want to manage play/pause ourselves so we can handle taps as well
    options.userActions.click = false;
    options.userActions.doubleClick = false;
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
}
const ScenePlayer = forwardRef<
    HTMLVideoElement,
    ScenePlayerProps
>(({ className, onTimeUpdate, hideControls, hideProgressBar, muted, onClick, onEnded, ...otherProps }: ScenePlayerProps, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    
    const [videoElm, setVideoElm] = useState<HTMLVideoElement | null>(null);
    const [videojsPlayer, setVideojsPlayer] = useState<VideoJsPlayer | null>(null);

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

    useEffect(() => {
        if (!videojsPlayer || !onClick) return;
        videojsPlayer.on('click', onClick);
        videojsPlayer.on('tap', onClick);
        return () => {
            videojsPlayer.off('click', onClick);
            videojsPlayer.off('tap', onClick);
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