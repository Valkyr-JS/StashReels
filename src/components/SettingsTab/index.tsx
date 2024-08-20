import { default as cx } from "classnames";
import React, { forwardRef } from "react";
import { TransitionStatus } from "react-transition-group";
import * as styles from "./SettingsTab.module.scss";

interface SettingsTabProps {
  transitionStatus: TransitionStatus;
}

const SettingsTab = forwardRef(
  (props: SettingsTabProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const classes = cx(styles["settings-tab"], props.transitionStatus);
    return (
      <div className={classes} data-testid="SettingsTab" ref={ref}>
        Settings tab component
      </div>
    );
  }
);

export default SettingsTab;
