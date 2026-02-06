import type { ActionButtonConfig } from "../components/slide/ActionButtons"
import {
  faExpand,
  faRepeat,
  faStar,
  faVolumeHigh as faVolume,
  faEllipsisVertical,
  faCircleInfo,
  faClosedCaptioning,
  faGear,
  IconDefinition,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import VolumeMuteOutlineIcon from '../assets/volume-mute-outline.svg?react';
import ExpandOutlineIcon from '../assets/expand-outline.svg?react';
import ContainIcon from '../assets/contain.svg?react';
import CoverOutlineIcon from '../assets/cover-outline.svg?react';
import PortraitOutlineIcon from '../assets/portrait-rotation-outline.svg?react';
import LandscapeIcon from '../assets/landscape-rotation.svg?react';
import LoopOutlineIcon from '../assets/loop-outline.svg?react';
import InfoOutlineIcon from '../assets/info-outline.svg?react';
import StarOutlineIcon from '../assets/star-outline.svg?react';
import SplashIcon from '../assets/splash.svg?react';
import SplashOutlineIcon from '../assets/splash-outline.svg?react';
import CogOutlineIcon from '../assets/cog-outline.svg?react';
import AddTagOutlineIcon from '../assets/add-tag-outline.svg?react';
import ClosedCaptioningOutline from '../assets/closed-captioning-outline.svg?react';
import VerticalEllipsisOutlineIcon from '../assets/vertical-ellipsis-outline.svg?react';

type Icon = React.FunctionComponent<React.SVGProps<SVGSVGElement>> | IconDefinition;
type ActionButtonDetails = {
  activeIcon: Icon;
  inactiveIcon: Icon;
  activeText: string;
  inactiveText: string;
}

export const actionButtonsDetails: Record<ActionButtonConfig["type"], ActionButtonDetails> = {
  "ui-visibility": {
    activeIcon: faEllipsisVertical,
    inactiveIcon: VerticalEllipsisOutlineIcon,
    activeText: "Hide UI",
    inactiveText: "Show UI",
  },
  "settings": {
    activeIcon: faGear,
    inactiveIcon: CogOutlineIcon,
    activeText: "Close settings",
    inactiveText: "Show settings",
  },
  "show-scene-info": {
    activeIcon: faCircleInfo,
    inactiveIcon: InfoOutlineIcon,
    activeText: "Close scene info",
    inactiveText: "Show scene info"
  },
  "rate-scene": {
    activeIcon: faStar,
    inactiveIcon: StarOutlineIcon,
    activeText: "Rate scene",
    inactiveText: "Rate scene"
  },
  "o-counter": {
    activeIcon: SplashIcon,
    inactiveIcon: SplashOutlineIcon,
    activeText: "Undo Orgasm Mark",
    inactiveText: "Mark Orgasm"
  },
  "force-landscape": {
    activeIcon: LandscapeIcon,
    inactiveIcon: PortraitOutlineIcon,
    activeText: "Landscape",
    inactiveText: "Portrait"
  },
  "fullscreen": {
    activeIcon: faExpand,
    inactiveIcon: ExpandOutlineIcon,
    activeText: "Close fullscreen",
    inactiveText: "Open fullscreen"
  },
  "mute": {
    activeIcon: faVolume,
    inactiveIcon: VolumeMuteOutlineIcon,
    activeText: "Mute",
    inactiveText: "Unmute"
  },
  "letterboxing": {
    activeIcon: ContainIcon,
    inactiveIcon: CoverOutlineIcon,
    activeText: "Fit to screen",
    inactiveText: "Fill screen",
  },
  "loop": {
    activeIcon: faRepeat,
    inactiveIcon: LoopOutlineIcon,
    activeText: "Stop looping scene",
    inactiveText: "Loop scene"
  },
  "subtitles": {
    activeIcon: faClosedCaptioning,
    inactiveIcon: ClosedCaptioningOutline,
    activeText: "Hide subtitles",
    inactiveText: "Show subtitles"
  },
  "quick-tag": {
    activeIcon: faTag,
    inactiveIcon: AddTagOutlineIcon,
    activeText: "Remove tag from scene",
    inactiveText: "Add tag to scene"
  },
}

export function getActionButtonDetails(config: ActionButtonConfig, options?: { tagName?: string }): ActionButtonDetails {
  const details = actionButtonsDetails[config.type];
  if (!details) {
    throw new Error(`No details found for action button type: ${config.type}`)
  }
  if (config.type === "quick-tag" && options?.tagName) {
    return {
      ...details,
      activeText: `Remove "${options.tagName}" from scene`,
      inactiveText: `Add "${options.tagName}" to scene`,
    }
  }
  return details
}
