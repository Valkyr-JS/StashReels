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
    ...otherProps
  } = props;
  const Icon = active ? activeIcon : inactiveIcon;
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
        placement="left"
        overlay={popover}
        show={id === currentOpenPopover}
        onToggle={() => useCurrentOpenPopover.setState(id === currentOpenPopover ? null : id)}
      >
        {children}
      </OverlayTrigger>
    )
  }

  return (
    <div
      className={cx("ActionButton", className, { active })}
    >
      {sideInfo && (
        <div className="side-info">
          {sideInfo}
        </div>
      )}
      <SidePanel>
        <button
          {...otherProps}
          type="button"
          ref={ref}
        >
          {'icon' in Icon ? (
            <FontAwesomeIcon icon={Icon} />
          ) : (
            <Icon className={cx("icon", `icon-${className}`)} />
          )}
          <span className="sr-only">
            {active ? activeText : inactiveText}
          </span>
        </button>
      </SidePanel>
    </div>
  );
});

export default ActionButton;
