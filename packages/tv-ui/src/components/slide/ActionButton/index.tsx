import React, {
  ComponentProps,
  forwardRef,
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

export type Props = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
  /** Indicates if the buttons associated action is active. */
  active: boolean;
  activeIcon: IconDefinition | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  activeText: string;
  inactiveIcon: IconDefinition | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  inactiveText: string;
  sideInfo?: React.ReactNode;
  sidePanel?: React.ReactNode;
  size?: "auto"
}

const ActionButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
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
    ...otherProps
  } = props;
  const Icon = active ? activeIcon : inactiveIcon;
  const ButtonElement = otherProps.disabled ? "div" : "button";
  const { leftHandedUi } = useAppStateStore();
  const SidePanel = ({children}: {children: ComponentProps<typeof OverlayTrigger>['children']}) => {
    if (!sidePanel) return <>{children}</>
    const currentOpenPopover = useCurrentOpenPopover()
    const id = `action-button-side-panel-${useUID()}`
    const popover = (
      <Popover
        className="action-button-side-panel"
        id={id}
      >
        <>{sidePanel}</>
      </Popover>
    )
    return (
      <OverlayTrigger
        trigger="click"
        placement={leftHandedUi ? "right" : "left"}
        overlay={popover}
        show={id === currentOpenPopover}
        onToggle={() => useCurrentOpenPopover.setState(id === currentOpenPopover ? null : id)}
      >
        {children}
      </OverlayTrigger>
    )
  }

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
      <SidePanel>
        <ButtonElement
          {...otherProps}
          className={cx("button")}
          type="button"
          ref={ref}
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
});

export default ActionButton;
