import React, {
  forwardRef,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import "./ActionButton.css";
import { useUID } from "react-uid";

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
  const sidePanelRef = React.useRef<HTMLDialogElement>(null);
  const sidePanelId = useUID();

  return (
    <div
      className={cx("ActionButton", className, { active })}
    >
      {sideInfo && (
        <div className="side-info">
          {sideInfo}
        </div>
      )}
      {sidePanel && (
        <dialog
          className="side-panel"
          popover="auto"
          id={sidePanelId}
          ref={sidePanelRef}
        >
          {sidePanel}
        </dialog>
      )}
      <button
        {...otherProps}
        popovertarget={sidePanelId}
        popovertargetaction="toggle"
        type="button"
        ref={ref}
      >
        {'icon' in Icon ? (
          <FontAwesomeIcon icon={Icon} />
        ) : (
          <Icon className="icon" />
        )}
        <span className="sr-only">
          {active ? activeText : inactiveText}
        </span>
      </button>
    </div>
  );
});

export default ActionButton;
