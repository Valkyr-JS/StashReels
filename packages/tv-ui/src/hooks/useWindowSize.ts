import { useWindowSize as useWindowSizeReactUse } from "react-use";
import { useAppStateStore } from "../store/appStateStore";

export function useWindowSize() {
    const { forceLandscape } = useAppStateStore();
    let {width, height} = useWindowSizeReactUse();
    if (forceLandscape) {
        const oldHeight = height;
        height = width;
        width = oldHeight;
    }
    let orientation: "landscape" | "portrait" | "square" = "square";
    if (width > height) orientation = "landscape";
    if (height > width) orientation = "portrait";
    return {width, height, orientation};
}