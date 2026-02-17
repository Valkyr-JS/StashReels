import React, {
  useEffect,
  useMemo,
} from "react";
import cx from "classnames";
import "./ActionButton.css";
import { useUID } from "react-uid";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { create } from "zustand";
import { useAppStateStore } from "../../../store/appStateStore";
import { ActionButtonIcon } from "../../../helpers/getActionButtonDetails";
import { OverlayTriggerProps } from "react-bootstrap/esm/OverlayTrigger";
import { preventMisclickOnMoveModifier } from "../../../helpers/popper-modifiers/preventMisclickOnMove";
import { preventChildOverflowModifier } from "../../../helpers/popper-modifiers/preventChildOverflow";
import { applyArrowHideModifier } from "../../../helpers/popper-modifiers/applyArrowHide";

const useCurrentOpenPopover = create<null | string>(() => (null))

export type SidePanelContent = React.ReactNode | ((props: {isOpen: boolean, close: () => void}) => React.ReactNode)

export type Props = {
  /** Indicates if the buttons associated action is active. */
  active: boolean;
  activeIcon: ActionButtonIcon;
  activeText: string;
  inactiveIcon: ActionButtonIcon;
  inactiveText: string;
  sideInfo?: React.ReactNode;
  sidePanel?: SidePanelContent;
  sidePanelClassName?: string;
  onSidePanelToggle?: (isOpen: boolean) => void,
  size?: "auto",
  displayOnly?: boolean;
  className?: string;
  onClick?: () => void;
}

const ActionButton = (props: Props) => {
  const {
    active,
    activeIcon,
    activeText,
    inactiveIcon,
    inactiveText,
    className,
    sideInfo,
    sidePanel,
    size,
    displayOnly,
    onClick,
    onSidePanelToggle,
    sidePanelClassName,
  } = props;
  const Icon = active ? activeIcon : inactiveIcon;
  const ButtonElement = displayOnly ? "div" : "button";
  const { leftHandedUi } = useAppStateStore();

  const displayText = active ? activeText : inactiveText

  return (
    <div
      className={cx("ActionButton", className, { active, 'left-handed': leftHandedUi, [`size-${size}`]: size })}
    >
      {sideInfo && (
        <div className="side-info">
          {sideInfo}
        </div>
      )}
      <SidePanel
        content={sidePanel}
        onSidePanelToggle={onSidePanelToggle}
        sidePanelClassName={sidePanelClassName}
      >
        {({onClick: sidePanelClick, ref}) => {
          return (
            <ButtonElement
              className={cx("button")}
              type="button"
              onClick={displayOnly ? undefined : onClick || sidePanelClick}
              ref={ref}
            >
              <Icon />
              <span className="sr-only">
                {displayText}
              </span>
            </ButtonElement>
          )
        }}
      </SidePanel>
    </div>
  );
};

type Children = (props: {onClick: (event: React.MouseEvent<HTMLElement>) => void, ref: React.Ref<any>}) => JSX.Element

const SidePanel = (
  {content, children, onSidePanelToggle, sidePanelClassName}: {
    content: SidePanelContent,
    onSidePanelToggle?: (isOpen: boolean) => void,
    sidePanelClassName?: string,
    children: Children
  }
): JSX.Element => {
  const currentOpenPopover = useCurrentOpenPopover()
  const { leftHandedUi, forceLandscape } = useAppStateStore();
  const id = `action-button-side-panel-${useUID()}`
  const isOpen = id === currentOpenPopover
  useEffect(() => {
    onSidePanelToggle?.(isOpen)
  }, [isOpen, onSidePanelToggle])

  // Without isOpenDelayedClose the popover content will be immediately removed from the DOM immediately where as the
  // popover itself takes a short amount of time to animate out
  const [isOpenDelayedClose, setIsOpenDelayedClose] = React.useState(isOpen)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isOpen) {
      timeout = setTimeout(() => setIsOpenDelayedClose(false), 300)
    } else {
      setIsOpenDelayedClose(true)
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    }
  }, [isOpen])
  if (!content) return children({onClick: () => {}, ref: null})

  const safeInsetPadding = useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    const additionalPadding = parseInt(style.getPropertyValue('--overlay-edge-margin')) ?? 0
    return {
      top: (parseInt(style.getPropertyValue('--safe-inset-top')) || 0) + additionalPadding,
      left: (parseInt(style.getPropertyValue('--safe-inset-left')) || 0) + additionalPadding,
      right: (parseInt(style.getPropertyValue('--safe-inset-right')) || 0) + additionalPadding,
      bottom: (parseInt(style.getPropertyValue('--safe-inset-bottom')) || 0) + additionalPadding,
    };
  }, [forceLandscape])

  const processedClickEvents = useMemo(() => new WeakSet(), [])
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: Event) {
      processedClickEvents.add(event)
    }
    window.addEventListener("click", handleClick, {capture: true})
    return () => {
      window.removeEventListener("click", handleClick, {capture: true})
    }
  }, [isOpen])

  const renderChildren: Children = ({onClick, ref}) => children({
    onClick: (event) => {
      // We want to skip any events that have already been acted upon as part of the rootClose handling
      if (processedClickEvents.has(event.nativeEvent) || isOpen) return
      onClick?.(event)
    },
    ref
  })

  return (
    <OverlayTrigger
      trigger="click"
      placement={leftHandedUi ? "right" : "left"}
      overlay={
        <Popover
          className={cx("action-button-side-panel", sidePanelClassName, { 'left-handed': leftHandedUi })}
          id={id}
        >
          <div className="contents">
            {isOpenDelayedClose && (
              typeof content === "function"
                ? content({isOpen, close: () => useCurrentOpenPopover.setState(null)})
                : content
            )}
          </div>
        </Popover>
      }
      show={isOpen}
      rootClose={true}
      rootCloseEvent="click"
      onToggle={(shouldOpen) => {
        // We want to make sure to ignore any calls triggered by a rootClose event if the user has already clicked a
        // different action button and opened a different popover
        const currentlyOpen = id === useCurrentOpenPopover.getState()
        if (shouldOpen && !currentlyOpen) {
          useCurrentOpenPopover.setState(id)
        } else if (!shouldOpen && currentlyOpen) {
          useCurrentOpenPopover.setState(null)
        }
      }}
      popperConfig={{
        modifiers: [
          preventMisclickOnMoveModifier,
          preventChildOverflowModifier,
          applyArrowHideModifier,
          {
            name: 'preventOverflow',
            options: {
              padding: safeInsetPadding,
              tether: false,
            },
          },
        ],
      }}
    >
      {
        // OverlayTrigger's children appear to be typed wrong
        renderChildren as unknown as OverlayTriggerProps['children']
      }
    </OverlayTrigger>
  )
}

export default ActionButton;
