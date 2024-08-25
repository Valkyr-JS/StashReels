import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/pro-solid-svg-icons/faSpinner";
import * as styles from "./Loading.module.scss";

interface LoadingProps {
  heading: React.ReactNode;
  text?: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = (props) => {
  const smallText = props.text ?? null;

  return (
    <div className={styles["Loading"]} data-testid="Loader">
      <h2>{props.heading}</h2>
      {smallText}
      <div>
        <FontAwesomeIcon icon={faSpinner} pulse />
      </div>
    </div>
  );
};

export default Loading;
