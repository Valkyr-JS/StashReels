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
import ClosedCaptioningOutline from '../assets/closed-captioning-outline.svg?react';
import VerticalEllipsisOutlineIcon from '../assets/vertical-ellipsis-outline.svg?react';

type Icon = React.FunctionComponent<React.SVGProps<SVGSVGElement>> | IconDefinition;
type ActionButtonDetails = {
  activeIcon: Icon;
  inactiveIcon: Icon;
  activeText: string;
  inactiveText: string;
}

export function getActionButtonDetails(config: ActionButtonConfig): ActionButtonDetails {
  const { type: buttonType } = config;
  switch (buttonType) {
    case "ui-visibility":
      return {
        activeIcon: faEllipsisVertical,
        inactiveIcon: VerticalEllipsisOutlineIcon,
        activeText: "Hide UI",
        inactiveText: "Show UI",
      }
    case "settings":
      return {
        activeIcon: faGear,
        inactiveIcon: CogOutlineIcon,
        activeText: "Close settings",
        inactiveText: "Show settings",
      }
    case "show-scene-info":
      return {
        activeIcon: faCircleInfo,
        inactiveIcon: InfoOutlineIcon,
        activeText: "Close scene info",
        inactiveText: "Show scene info"
      }
    case "rate-scene":
      return {
        activeIcon: faStar,
        inactiveIcon: StarOutlineIcon,
        activeText: "Rate scene",
        inactiveText: "Rate scene"
      }
    case "o-counter":
      return {
        activeIcon: SplashIcon,
        inactiveIcon: SplashOutlineIcon,
        activeText: "Undo Orgasm Mark",
        inactiveText: "Mark Orgasm"
      }
    case "force-landscape":
      return {
        activeIcon: LandscapeIcon,
        inactiveIcon: PortraitOutlineIcon,
        activeText: "Landscape",
        inactiveText: "Portrait"
      }
    case "fullscreen":
      return {
        activeIcon: faExpand,
        inactiveIcon: ExpandOutlineIcon,
        activeText: "Close fullscreen",
        inactiveText: "Open fullscreen"
      }
    case "mute":
      return {
        activeIcon: faVolume,
        inactiveIcon: VolumeMuteOutlineIcon,
        activeText: "Mute",
        inactiveText: "Unmute"
      }
    case "letterboxing":
      return {
        activeIcon: ContainIcon,
        inactiveIcon: CoverOutlineIcon,
        activeText: "Fit to screen",
        inactiveText: "Fill screen",
      }
    case "loop":
      return {
        activeIcon: faRepeat,
        inactiveIcon: LoopOutlineIcon,
        activeText: "Stop looping scene",
        inactiveText: "Loop scene"
      }
    case "subtitles":
      return {
        activeIcon: faClosedCaptioning,
        inactiveIcon: ClosedCaptioningOutline,
        activeText: "Hide subtitles",
        inactiveText: "Show subtitles"
      }
    default:
      buttonType satisfies never;
      throw new Error(`Unknown action button type: ${buttonType}`)
  }
}
