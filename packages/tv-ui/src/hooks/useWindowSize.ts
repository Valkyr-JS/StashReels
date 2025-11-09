import { useWindowSize as useWindowSizeReactUse } from "react-use";

export function useWindowSize() {
    let {width, height} = useWindowSizeReactUse();
    let orientation: "landscape" | "portrait" | "square" = "square";
    if (width > height) orientation = "landscape";
    if (height > width) orientation = "portrait";
    return {width, height, orientation};
}
