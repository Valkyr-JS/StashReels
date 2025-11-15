import React from "react";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import CogOutlineIcon from '../../../assets/cog-outline.svg?react';
import { useAppStateStore } from "../../../store/appStateStore";
import ActionButton from "../ActionButton";
import "../ActionButton/ActionButton.css";

export function SettingsButton() {
  const { showSettings, set: setAppSetting } = useAppStateStore();

  return (
    <ActionButton
      className="settings"
      active={showSettings}
      activeIcon={faGear}
      activeText="Close settings"
      data-testid="MediaSlide--settingsButton"
      inactiveIcon={CogOutlineIcon}
      inactiveText="Show settings"
      onClick={() => setAppSetting("showSettings", (prev) => !prev)}
    />
  )
}
