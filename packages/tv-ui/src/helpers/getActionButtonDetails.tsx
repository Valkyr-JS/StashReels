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
  Asterisk,
  BackpackFill,
  Backpack,
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
  CardList
} from "react-bootstrap-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";

type IconProps = {className?: string, size?: string | number}
type Icon = React.FunctionComponent<IconProps>
export type ActionButtonDetails = {
  activeIcon: Icon;
  inactiveIcon: Icon;
  activeText: string;
  inactiveText: string;
}

function renderIcon(Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | IconDefinition | BootstrapIcon, {className, size}: IconProps) {
  if ('icon' in Icon) {
    return <FontAwesomeIcon icon={Icon} />
  } else {
    let props = {}
    if (size) {
      props = { size, width: `${size}px`, height: `${size}px` }
    }
    return <Icon className={cx("icon", `icon-${className}`)} {...props}/>
  }
}

export const actionButtonCustomIcons = {
  "heart": {
    active: (props: IconProps) => renderIcon(HeartFill, props),
    inactive: (props: IconProps) => renderIcon(Heart, props)
  },
  "bookmark": {
    active: (props: IconProps) => renderIcon(BookmarkFill, props),
    inactive: (props: IconProps) => renderIcon(Bookmark, props)
  },
  "pin": {
    active: (props: IconProps) => renderIcon(PinFill, props),
    inactive: (props: IconProps) => renderIcon(Pin, props)
  },
  "list": {
    active: (props: IconProps) => renderIcon(CardList, props),
    inactive: (props: IconProps) => renderIcon(ListUl, props)
  },
  "star": {
    active: (props: IconProps) => renderIcon(StarFill, props),
    inactive: (props: IconProps) => renderIcon(Star, props)
  },
  "tag": {
    active: (props: IconProps) => renderIcon(faTag, props),
    inactive: (props: IconProps) => renderIcon(AddTagOutlineIcon, props)
  },
  "thumbs-up": {
    active: (props: IconProps) => renderIcon(HandThumbsUpFill, props),
    inactive: (props: IconProps) => renderIcon(HandThumbsUp, props)
  },
  "thumbs-down": {
    active: (props: IconProps) => renderIcon(HandThumbsDownFill, props),
    inactive: (props: IconProps) => renderIcon(HandThumbsDown, props)
  },
  "0-circle": {
    active: (props: IconProps) => renderIcon(Icon0CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon0Circle, props)
  },
  "1-circle": {
    active: (props: IconProps) => renderIcon(Icon1CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon1Circle, props)
  },
  "2-circle": {
    active: (props: IconProps) => renderIcon(Icon2CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon2Circle, props)
  },
  "3-circle": {
    active: (props: IconProps) => renderIcon(Icon3CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon3Circle, props)
  },
  "4-circle": {
    active: (props: IconProps) => renderIcon(Icon4CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon4Circle, props)
  },
  "5-circle": {
    active: (props: IconProps) => renderIcon(Icon5CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon5Circle, props)
  },
  "6-circle": {
    active: (props: IconProps) => renderIcon(Icon6CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon6Circle, props)
  },
  "7-circle": {
    active: (props: IconProps) => renderIcon(Icon7CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon7Circle, props)
  },
  "8-circle": {
    active: (props: IconProps) => renderIcon(Icon8CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon8Circle, props)
  },
  "9-circle": {
    active: (props: IconProps) => renderIcon(Icon9CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Icon9Circle, props)
  },
  "archive": {
    active: (props: IconProps) => renderIcon(ArchiveFill, props),
    inactive: (props: IconProps) => renderIcon(Archive, props)
  },
  "backpack": {
    active: (props: IconProps) => renderIcon(Backpack3Fill, props),
    inactive: (props: IconProps) => renderIcon(Backpack3, props)
  },
  "bag": {
    active: (props: IconProps) => renderIcon(BagFill, props),
    inactive: (props: IconProps) => renderIcon(Bag, props)
  },
  "basket": {
    active: (props: IconProps) => renderIcon(Basket2Fill, props),
    inactive: (props: IconProps) => renderIcon(Basket2, props)
  },
  "bell": {
    active: (props: IconProps) => renderIcon(BellFill, props),
    inactive: (props: IconProps) => renderIcon(Bell, props)
  },
  "check": {
    active: (props: IconProps) => renderIcon(CheckCircleFill, props),
    inactive: (props: IconProps) => renderIcon(CheckCircle, props)
  },
  "circle": {
    active: (props: IconProps) => renderIcon(CircleFill, props),
    inactive: (props: IconProps) => renderIcon(Circle, props)
  },
  "clipboard": {
    active: (props: IconProps) => renderIcon(ClipboardFill, props),
    inactive: (props: IconProps) => renderIcon(Clipboard, props)
  },
  "clock": {
    active: (props: IconProps) => renderIcon(ClockFill, props),
    inactive: (props: IconProps) => renderIcon(Clock, props)
  },
  "collection": {
    active: (props: IconProps) => renderIcon(CollectionFill, props),
    inactive: (props: IconProps) => renderIcon(Collection, props)
  },
  "collection-play": {
    active: (props: IconProps) => renderIcon(CollectionPlayFill, props),
    inactive: (props: IconProps) => renderIcon(CollectionPlay, props)
  },
  "droplet": {
    active: (props: IconProps) => renderIcon(DropletFill, props),
    inactive: (props: IconProps) => renderIcon(Droplet, props)
  },
  "flag": {
    active: (props: IconProps) => renderIcon(FlagFill, props),
    inactive: (props: IconProps) => renderIcon(Flag, props)
  },
  "floppy": {
    active: (props: IconProps) => renderIcon(FloppyFill, props),
    inactive: (props: IconProps) => renderIcon(Floppy, props)
  },
  "folder": {
    active: (props: IconProps) => renderIcon(FolderFill, props),
    inactive: (props: IconProps) => renderIcon(Folder, props)
  },
  "inbox": {
    active: (props: IconProps) => renderIcon(InboxFill, props),
    inactive: (props: IconProps) => renderIcon(Inbox, props)
  },
  "lightbulb": {
    active: (props: IconProps) => renderIcon(LightbulbFill, props),
    inactive: (props: IconProps) => renderIcon(Lightbulb, props)
  },
  "lock": {
    active: (props: IconProps) => renderIcon(LockFill, props),
    inactive: (props: IconProps) => renderIcon(Lock, props)
  },
  "suit-club": {
    active: (props: IconProps) => renderIcon(SuitClubFill, props),
    inactive: (props: IconProps) => renderIcon(SuitClub, props)
  },
  "telephone": {
    active: (props: IconProps) => renderIcon(TelephoneFill, props),
    inactive: (props: IconProps) => renderIcon(Telephone, props)
  },
  "trash": {
    active: (props: IconProps) => renderIcon(Trash3Fill, props),
    inactive: (props: IconProps) => renderIcon(Trash3, props)
  },
} satisfies Record<string, {active: Icon, inactive: Icon}>

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
    activeIcon: actionButtonCustomIcons["tag"].active,
    inactiveIcon: actionButtonCustomIcons["tag"].inactive,
    activeText: "Remove tag from scene",
    inactiveText: "Add tag to scene"
  },
}
export type ActionButtonCustomIcons = keyof typeof actionButtonCustomIcons

export function getActionButtonDetails(config: ActionButtonConfig, options?: { tagName?: string }): ActionButtonDetails {
  const details = actionButtonsDetails[config.type];
  if (!details) {
    throw new Error(`No details found for action button type: ${config.type}`)
  }
  const customIcon = ('iconId' in config && config.iconId) ? actionButtonCustomIcons[config.iconId] : undefined;
  if (config.type === "quick-tag") {
    return {
      ...details,
      ...(options?.tagName ? {
        activeText: `Remove "${options.tagName}" from scene`,
        inactiveText: `Add "${options.tagName}" to scene`,
      } : {}),
      ...(customIcon ? {
        activeIcon: customIcon.active,
        inactiveIcon: customIcon.inactive,
      } : {})
    }
  }
  return details
}
