import React, {
  forwardRef,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import "./ActionButton.css";

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
}

const ActionButton = forwardRef<HTMLButtonElement, Props>(
  (
    { active, activeIcon, activeText, inactiveIcon, inactiveText, className, ...props },
    ref
  ) => {
    const Icon = active ? activeIcon : inactiveIcon;
    return (
      <button
        className={cx("ActionButton", className, { active })}
        {...props}
        onClick={props.onClick}
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
    );
  }
);

export default ActionButton;