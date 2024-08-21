import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { default as cx } from "classnames";
import React, { forwardRef } from "react";
import { TransitionStatus } from "react-transition-group";
import * as styles from "./SettingsTab.module.scss";
import { TRANSITION_DURATION } from "../../constants";

interface SettingsTabProps {
  setSettingsTabHandler: (show: boolean) => void;
  transitionStatus: TransitionStatus;
}

const SettingsTab = forwardRef(
  (props: SettingsTabProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const toggleableUiStyles: React.CSSProperties = {
      transitionDuration: TRANSITION_DURATION / 1000 + "s",
    };

    const closeButtonHandler = () => props.setSettingsTabHandler(false);

    const classes = cx(styles["settings-tab"], props.transitionStatus);

    return (
      <div
        className={classes}
        onClick={closeButtonHandler}
        data-testid="SettingsTab"
        ref={ref}
        style={toggleableUiStyles}
      >
        <div className={styles["settings-tab--body"]}>
          Settings tab component
        </div>
        <div className={styles["settings-tab--footer"]}>
          <button data-testid="SettingsTab--closeButton" type="button">
            <FontAwesomeIcon icon={faXmark} />
            <span className={styles["visually-hidden"]}>Close settings</span>
          </button>
        </div>
      </div>
    );
  }
);

export default SettingsTab;
