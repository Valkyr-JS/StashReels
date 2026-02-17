import React from "react";
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
  faLocationDot,
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
import AddMarkerOutlineIcon from '../assets/add-marker-outline.svg?react';
import ClosedCaptioningOutline from '../assets/closed-captioning-outline.svg?react';
import VerticalEllipsisOutlineIcon from '../assets/vertical-ellipsis-outline.svg?react';
import {
  Heart,
  HeartFill,
  Bookmark,
  BookmarkFill,
  Pin,
  PinFill,
  ListUl,
  Star,
  StarFill,
  Icon0Circle,
  Icon0CircleFill,
  Icon1Circle,
  Icon1CircleFill,
  Icon2Circle,
  Icon2CircleFill,
  Icon3Circle,
  Icon3CircleFill,
  Icon4Circle,
  Icon4CircleFill,
  Icon5Circle,
  Icon5CircleFill,
  Icon6Circle,
  Icon6CircleFill,
  Icon7Circle,
  Icon7CircleFill,
  Icon8Circle,
  Icon8CircleFill,
  Icon9Circle,
  Icon9CircleFill,
  HandThumbsUp,
  HandThumbsUpFill,
  HandThumbsDown,
  HandThumbsDownFill,
  Icon as BootstrapIcon,
  ArchiveFill,
  Archive,
  Backpack3,
  Backpack3Fill,
  BagFill,
  Bag,
  Basket2Fill,
  Basket2,
  BellFill,
  Bell,
  CheckCircleFill,
  CheckCircle,
  CircleFill,
  Circle,
  ClipboardFill,
  Clipboard,
  ClockFill,
  Clock,
  CollectionFill,
  Collection,
  CollectionPlayFill,
  CollectionPlay,
  DropletFill,
  Droplet,
  Flag,
  FlagFill,
  Floppy,
  FloppyFill,
  FolderFill,
  Folder,
  Inbox,
  InboxFill,
  LightbulbFill,
  Lightbulb,
  LockFill,
  Lock,
  SuitClubFill,
  SuitClub,
  TelephoneFill,
  Telephone,
  Trash3Fill,
  Trash3,
  CardList,
  Tag,
  TagFill,
  TagsFill,
  Tags,
} from "react-bootstrap-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { getLogger } from "@logtape/logtape";

type IconProps = {className?: string, size?: string | number}
export type ActionButtonIconComponent = React.FunctionComponent<IconProps>
export type ActionButtonDetails = {
  activeIcon: ActionButtonIconComponent;
  inactiveIcon: ActionButtonIconComponent;
  activeText: string;
  inactiveText: string;
  repeatable?: boolean; // Whether the action can be added to the action stack multiple times
  hasSettings?: boolean;
}

function renderIcon(Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | IconDefinition | BootstrapIcon, {className, size}: IconProps) {
  if ('icon' in Icon) {
    return <FontAwesomeIcon icon={Icon} />
  } else {
    let props = {}
    if (size) {
      props = { size, width: size, height: size }
    }
    return <Icon className={cx("icon", `icon-${className}`)} {...props}/>
  }
}

type ActionButtonIconDetails = {
  active: ActionButtonIconComponent,
  inactive: ActionButtonIconComponent,
  category: ("general" | "tag" | "marker")[]
}

const _actionButtonIcons = {
  "heart": {
    active: (props: IconProps) => renderIcon(HeartFill, props),
    inactive: (props: IconProps) => renderIcon(Heart, props),
    category: ["general"],
  },
  "bookmark": {
    active: (props: IconProps) => renderIcon(BookmarkFill, props),
    inactive: (props: IconProps) => renderIcon(Bookmark, props),
    category: ["general"],
  },
  "pin": {
    active: (props: IconProps) => renderIcon(PinFill, props),
    inactive: (props: IconProps) => renderIcon(Pin, props),
    category: ["general"],
  },
  "list": {
    active: (props: IconProps) => renderIcon(CardList, props),
    inactive: (props: IconProps) => renderIcon(ListUl, props),
    category: ["general"],
  },
  "star": {
    active: (props: IconProps) => renderIcon(StarFill, props),
    inactive: (props: IconProps) => renderIcon(Star, props),
    category: ["general"],
  },
  "add-tag": {
    active: (props: IconProps) => renderIcon(faTag, props),
    inactive: (props: IconProps) => renderIcon(AddTagOutlineIcon, props),
    category: ["tag"],
  },
  "tag": {
    active: (props: IconProps) => renderIcon(TagFill, props),
    inactive: (props: IconProps) => renderIcon(Tag, props),
    category: ["tag"],
  },
  "tags": {
    active: (props: IconProps) => renderIcon(TagsFill, props),
    inactive: (props: IconProps) => renderIcon(Tags, props),
    category: ["tag"],
  },
  "thumbs-up": {
    active: (props: IconProps) => renderIcon(HandThumbsUpFill, props),
    inactive: (props: IconProps) => renderIcon(HandThumbsUp, props),
    category: ["general"],
  },
  "thumbs-down": {
    active: (props: IconProps) => renderIcon(HandThumbsDownFill, props),
    inactive: (props: IconProps) => renderIcon(HandThumbsDown, props),
    category: ["general"],
  },
  "0-circle": {
    active: (props: IconProps) => renderIcon(Icon0CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon0Circle, props),
    category: ["general"],
  },
  "1-circle": {
    active: (props: IconProps) => renderIcon(Icon1CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon1Circle, props),
    category: ["general"],
  },
  "2-circle": {
    active: (props: IconProps) => renderIcon(Icon2CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon2Circle, props),
    category: ["general"],
  },
  "3-circle": {
    active: (props: IconProps) => renderIcon(Icon3CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon3Circle, props),
    category: ["general"],
  },
  "4-circle": {
    active: (props: IconProps) => renderIcon(Icon4CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon4Circle, props),
    category: ["general"],
  },
  "5-circle": {
    active: (props: IconProps) => renderIcon(Icon5CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon5Circle, props),
    category: ["general"],
  },
  "6-circle": {
    active: (props: IconProps) => renderIcon(Icon6CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon6Circle, props),
    category: ["general"],
  },
  "7-circle": {
    active: (props: IconProps) => renderIcon(Icon7CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon7Circle, props),
    category: ["general"],
  },
  "8-circle": {
    active: (props: IconProps) => renderIcon(Icon8CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon8Circle, props),
    category: ["general"],
  },
  "9-circle": {
    active: (props: IconProps) => renderIcon(Icon9CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon9Circle, props),
    category: ["general"],
  },
  "archive": {
    active: (props: IconProps) => renderIcon(ArchiveFill, props),
    inactive: (props: IconProps) => renderIcon(Archive, props),
    category: ["general"],
  },
  "backpack": {
    active: (props: IconProps) => renderIcon(Backpack3Fill, props),
    inactive: (props: IconProps) => renderIcon(Backpack3, props),
    category: ["general"],
  },
  "bag": {
    active: (props: IconProps) => renderIcon(BagFill, props),
    inactive: (props: IconProps) => renderIcon(Bag, props),
    category: ["general"],
  },
  "basket": {
    active: (props: IconProps) => renderIcon(Basket2Fill, props),
    inactive: (props: IconProps) => renderIcon(Basket2, props),
    category: ["general"],
  },
  "bell": {
    active: (props: IconProps) => renderIcon(BellFill, props),
    inactive: (props: IconProps) => renderIcon(Bell, props),
    category: ["general"],
  },
  "check": {
    active: (props: IconProps) => renderIcon(CheckCircleFill, props),
    inactive: (props: IconProps) => renderIcon(CheckCircle, props),
    category: ["general"],
  },
  "circle": {
    active: (props: IconProps) => renderIcon(CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Circle, props),
    category: ["general"],
  },
  "clipboard": {
    active: (props: IconProps) => renderIcon(ClipboardFill, props),
    inactive: (props: IconProps) => renderIcon(Clipboard, props),
    category: ["general"],
  },
  "clock": {
    active: (props: IconProps) => renderIcon(ClockFill, props),
    inactive: (props: IconProps) => renderIcon(Clock, props),
    category: ["general"],
  },
  "collection": {
    active: (props: IconProps) => renderIcon(CollectionFill, props),
    inactive: (props: IconProps) => renderIcon(Collection, props),
    category: ["general"],
  },
  "collection-play": {
    active: (props: IconProps) => renderIcon(CollectionPlayFill, props),
    inactive: (props: IconProps) => renderIcon(CollectionPlay, props),
    category: ["general"],
  },
  "droplet": {
    active: (props: IconProps) => renderIcon(DropletFill, props),
    inactive: (props: IconProps) => renderIcon(Droplet, props),
    category: ["general"],
  },
  "flag": {
    active: (props: IconProps) => renderIcon(FlagFill, props),
    inactive: (props: IconProps) => renderIcon(Flag, props),
    category: ["general"],
  },
  "floppy": {
    active: (props: IconProps) => renderIcon(FloppyFill, props),
    inactive: (props: IconProps) => renderIcon(Floppy, props),
    category: ["general"],
  },
  "folder": {
    active: (props: IconProps) => renderIcon(FolderFill, props),
    inactive: (props: IconProps) => renderIcon(Folder, props),
    category: ["general"],
  },
  "inbox": {
    active: (props: IconProps) => renderIcon(InboxFill, props),
    inactive: (props: IconProps) => renderIcon(Inbox, props),
    category: ["general"],
  },
  "lightbulb": {
    active: (props: IconProps) => renderIcon(LightbulbFill, props),
    inactive: (props: IconProps) => renderIcon(Lightbulb, props),
    category: ["general"],
  },
  "lock": {
    active: (props: IconProps) => renderIcon(LockFill, props),
    inactive: (props: IconProps) => renderIcon(Lock, props),
    category: ["general"],
  },
  "suit-club": {
    active: (props: IconProps) => renderIcon(SuitClubFill, props),
    inactive: (props: IconProps) => renderIcon(SuitClub, props),
    category: ["general"],
  },
  "telephone": {
    active: (props: IconProps) => renderIcon(TelephoneFill, props),
    inactive: (props: IconProps) => renderIcon(Telephone, props),
    category: ["general"],
  },
  "trash": {
    active: (props: IconProps) => renderIcon(Trash3Fill, props),
    inactive: (props: IconProps) => renderIcon(Trash3, props),
    category: ["general"],
  },
  "add-marker": {
    active: (props: IconProps) => renderIcon(faLocationDot, props),
    inactive: (props: IconProps) => renderIcon(AddMarkerOutlineIcon, props),
    category: ["marker"],
  }
} satisfies Record<string, ActionButtonIconDetails>

export const actionButtonIcons: Record<keyof typeof _actionButtonIcons, ActionButtonIconDetails> = _actionButtonIcons;

export const actionButtonsDetails: Record<ActionButtonConfig["type"], ActionButtonDetails> = {
  "ui-visibility": {
    activeIcon: (props: IconProps) => renderIcon(faEllipsisVertical, props),
    inactiveIcon: (props: IconProps) => renderIcon(VerticalEllipsisOutlineIcon, props),
    activeText: "Hide UI",
    inactiveText: "Show UI",
  },
  "settings": {
    activeIcon: (props: IconProps) => renderIcon(faGear, props),
    inactiveIcon: (props: IconProps) => renderIcon(CogOutlineIcon, props),
    activeText: "Close settings",
    inactiveText: "Show settings",
  },
  "show-scene-info": {
    activeIcon: (props: IconProps) => renderIcon(faCircleInfo, props),
    inactiveIcon: (props: IconProps) => renderIcon(InfoOutlineIcon, props),
    activeText: "Close scene info",
    inactiveText: "Show scene info"
  },
  "rate-scene": {
    activeIcon: (props: IconProps) => renderIcon(faStar, props),
    inactiveIcon: (props: IconProps) => renderIcon(StarOutlineIcon, props),
    activeText: "Rate scene",
    inactiveText: "Rate scene"
  },
  "o-counter": {
    activeIcon: (props: IconProps) => renderIcon(SplashIcon, props),
    inactiveIcon: (props: IconProps) => renderIcon(SplashOutlineIcon, props),
    activeText: "Undo Orgasm Mark",
    inactiveText: "Mark Orgasm"
  },
  "force-landscape": {
    activeIcon: (props: IconProps) => renderIcon(LandscapeIcon, props),
    inactiveIcon: (props: IconProps) => renderIcon(PortraitOutlineIcon, props),
    activeText: "Landscape",
    inactiveText: "Portrait"
  },
  "fullscreen": {
    activeIcon: (props: IconProps) => renderIcon(faExpand, props),
    inactiveIcon: (props: IconProps) => renderIcon(ExpandOutlineIcon, props),
    activeText: "Close fullscreen",
    inactiveText: "Open fullscreen"
  },
  "mute": {
    activeIcon: (props: IconProps) => renderIcon(faVolume, props),
    inactiveIcon: (props: IconProps) => renderIcon(VolumeMuteOutlineIcon, props),
    activeText: "Mute",
    inactiveText: "Unmute"
  },
  "letterboxing": {
    activeIcon: (props: IconProps) => renderIcon(ContainIcon, props),
    inactiveIcon: (props: IconProps) => renderIcon(CoverOutlineIcon, props),
    activeText: "Fit to screen",
    inactiveText: "Fill screen",
  },
  "loop": {
    activeIcon: (props: IconProps) => renderIcon(faRepeat, props),
    inactiveIcon: (props: IconProps) => renderIcon(LoopOutlineIcon, props),
    activeText: "Stop looping scene",
    inactiveText: "Loop scene"
  },
  "subtitles": {
    activeIcon: (props: IconProps) => renderIcon(faClosedCaptioning, props),
    inactiveIcon: (props: IconProps) => renderIcon(ClosedCaptioningOutline, props),
    activeText: "Hide subtitles",
    inactiveText: "Show subtitles"
  },
  "quick-tag": {
    activeIcon: actionButtonIcons["add-tag"].active,
    inactiveIcon: actionButtonIcons["add-tag"].inactive,
    activeText: "Remove single tag",
    inactiveText: "Add single tag",
    repeatable: true,
    hasSettings: true,
  },
  "edit-tags": {
    activeIcon: actionButtonIcons["tags"].active,
    inactiveIcon: actionButtonIcons["tags"].inactive,
    activeText: "Edit tags",
    inactiveText: "Edit tags",
    hasSettings: true,
  },
  "create-marker": {
    activeIcon: actionButtonIcons["add-marker"].active,
    inactiveIcon: actionButtonIcons["add-marker"].inactive,
    activeText: "Create marker",
    inactiveText: "Create marker",
  },
  "quick-create-marker": {
    activeIcon: actionButtonIcons["add-marker"].active,
    inactiveIcon: actionButtonIcons["add-marker"].inactive,
    activeText: "Create preset marker",
    inactiveText: "Create preset marker",
    hasSettings: true,
    repeatable: true,
  },
}
export type ActionButtonIcons = keyof typeof actionButtonIcons

const logger = getLogger(["stash-tv", "getActionButtonDetails"])

export function getActionButtonDetails(config: ActionButtonConfig, options?: { tagName?: string }): ActionButtonDetails & { props: ActionButtonDetails } {
  let partialDetails = actionButtonsDetails[config.type]
  if (!partialDetails) {
    logger.error(`No details found for action button type: ${config.type}`)
    partialDetails = {
      activeIcon: () => <>?</>,
      inactiveIcon: () => <>?</>,
      activeText: "?",
      inactiveText: "?",
    }
  }
  const details = {
    ...partialDetails,
    get props(): ActionButtonDetails {
      return {
        activeIcon: this.activeIcon,
        inactiveIcon: this.inactiveIcon,
        activeText: this.activeText,
        inactiveText: this.inactiveText,
      }
    }
  };
  if ('iconId' in config && config.iconId && actionButtonIcons[config.iconId]) {
    details.activeIcon = actionButtonIcons[config.iconId].active;
    details.inactiveIcon = actionButtonIcons[config.iconId].inactive;
  }
  if (config.type === "quick-tag") {
    if (options?.tagName) {
      details.activeText = `Remove "${options.tagName}" from scene`
      details.inactiveText = `Add "${options.tagName}" to scene`
    }
  }
  return details
}
