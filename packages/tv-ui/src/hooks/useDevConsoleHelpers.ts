import { useEffect } from "react";
import { useAppStateStore } from "../store/appStateStore";

declare global {
  interface Window {
    freeze?: (countdown?: number) => void;
    showSettings?(): void;
  }
}

export function useDevConsoleHelpers() {
  const { showDevOptions, set: setAppState } = useAppStateStore()
  useEffect(() => {
    if (showDevOptions) {
      window.freeze = (countdown = 2) => {
        setTimeout(() => {debugger}, countdown * 1000);
      };
      window.showSettings = () => setAppState("showSettings", true);
    } else {
      delete window.freeze;
      delete window.showSettings;
    }
  }, [showDevOptions]);
}
