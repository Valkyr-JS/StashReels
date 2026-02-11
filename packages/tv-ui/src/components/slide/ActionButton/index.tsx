import React, {
  ComponentProps,
  useEffect,
  useMemo,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import "./ActionButton.css";
import { useUID } from "react-uid";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { create } from "zustand";
import { useAppStateStore } from "../../../store/appStateStore";

const useCurrentOpenPopover = create<null | string>(() => (null))

export type SidePanelContent = React.ReactNode | ((props: {isOpen: boolean, close: () => void}) => React.ReactNode)

export type Props = {
  /** Indicates if the buttons associated action is active. */
  active: boolean;
  activeIcon: IconDefinition | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  activeText: string;
  inactiveIcon: IconDefinition | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  inactiveText: string;
  sideInfo?: React.ReactNode;
  sidePanel?: SidePanelContent;
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
      <SidePanel content={sidePanel} onSidePanelToggle={onSidePanelToggle}>
        <ButtonElement
          className={cx("button")}
          type="button"
          onClick={displayOnly ? undefined : onClick}
        >
          {'icon' in Icon ? (
            <FontAwesomeIcon icon={Icon} />
          ) : (
            <Icon className={cx("icon", `icon-${className}`)} />
          )}
          <span className="sr-only">
            {displayText}
          </span>
        </ButtonElement>
      </SidePanel>
    </div>
  );
};

const SidePanel = (
  {content, children, onSidePanelToggle}: {
    content: SidePanelContent,
    onSidePanelToggle?: (isOpen: boolean) => void,
    children: ComponentProps<typeof OverlayTrigger>['children']
  }
) => {
  const currentOpenPopover = useCurrentOpenPopover()
  const { leftHandedUi, forceLandscape } = useAppStateStore();
  const id = `action-button-side-panel-${useUID()}`
  const isOpen = id === currentOpenPopover
  useEffect(() => {
    onSidePanelToggle?.(isOpen)
  }, [isOpen, onSidePanelToggle])
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
  if (!content) return <>{children}</>
  const popover =  (
    <Popover
      className={cx("action-button-side-panel", { 'left-handed': leftHandedUi })}
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
  )
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
  return (
    <OverlayTrigger
      trigger="click"
      placement={leftHandedUi ? "right" : "left"}
      overlay={popover}
      show={isOpen}
      rootClose={true}
      rootCloseEvent="mousedown"
      onToggle={() => {
        useCurrentOpenPopover.setState(id === currentOpenPopover ? null : id)
      }}
      popperConfig={{
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              padding: safeInsetPadding,
            },
          },
        ],
      }}
    >
      {children}
    </OverlayTrigger>
  )
}

export default ActionButton;
