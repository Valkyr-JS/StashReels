import videoJsNamespace from "video.js";

export function addSupportForLandscapeSupport(videojs: typeof videoJsNamespace) {
    videojs.hook('setup', (player) => {
        const seekBar = player.getChild('controlBar')
            ?.getChild('progressControl')
            ?.getChild('seekBar') as videoJsNamespace.SeekBar | undefined;

        if (seekBar) {
            // Based off:
            // https://github.com/videojs/video.js/blob/8e4ec97eb9a38dc1e5571b2b4a996df387139f1f/src/js/slider/slider.js#L292
            seekBar.calculateDistance = function(event: Event) {
                const position = getPointerPosition(this.el_, event);

                if (this.vertical()) {
                return position.y;
                }
                return position.x;
            }
        }
    });
}

// Based off:
// https://github.com/videojs/video.js/blob/7c3d3f4479ba3dd572ac28082ee6e660e4c4e912/src/js/utils/dom.js#L560
function findPosition(el: HTMLElement, rootElm: HTMLElement) {
    if (!el || (el && !el.offsetParent)) {
        return {
            left: 0,
            top: 0,
            width: 0,
        height: 0
        };
    }
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    let left = 0;
    let top = 0;

    while (el.offsetParent && el !== rootElm) {
        left += el.offsetLeft;
        top += el.offsetTop;

        el = el.offsetParent;
    }

    return {
        left,
        top,
        width,
        height
    };
}

// Based off:
// https://github.com/videojs/video.js/blob/7c3d3f4479ba3dd572ac28082ee6e660e4c4e912/src/js/utils/dom.js#L616
function getPointerPosition(el: HTMLElement, event: Event) {
    const rootElm = document.querySelector('.VideoScroller')
    if (!(rootElm instanceof HTMLElement)) {
        throw new Error("Root element not found");
    }
    const targetElm = event.target
    if (!(targetElm instanceof HTMLElement)) {
        throw new Error("Event target not found");
    }
    const isForcedLandscapeMode = rootElm.classList.contains('force-landscape');
    console.log("isForcedLandscapeMode", isForcedLandscapeMode)

    const boxTarget = findPosition(targetElm, rootElm);
    const box = findPosition(el, rootElm);
    let boxW = box.width;
    let boxH = box.height;
    
    let offsetY
    let offsetX
    if ('changedTouches' in event) {
        const touchEvent = event as TouchEvent;
        offsetX = touchEvent.changedTouches[0].pageX - box.left;
        offsetY = touchEvent.changedTouches[0].pageY + box.top;
        if (isForcedLandscapeMode) {
            offsetX = (rootElm.offsetWidth - touchEvent.changedTouches[0].pageY) - box.left;
            offsetY = touchEvent.changedTouches[0].pageX;
        }
    } else if ('offsetY' in event) {
        const mouseEvent = event as MouseEvent;
        offsetY = mouseEvent.offsetY - (box.top - boxTarget.top);
        offsetX = mouseEvent.offsetX - (box.left - boxTarget.left);
    } else {
        console.info("Event: ", event);
        throw new Error("Unsupported event type");
    }

    return {
        y: (1 - Math.max(0, Math.min(1, offsetY / boxH))),
        x: Math.max(0, Math.min(1, offsetX / boxW))
    }
}