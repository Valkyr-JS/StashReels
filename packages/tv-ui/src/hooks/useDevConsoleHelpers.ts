import { useEffect } from "react";
import { useAppStateStore } from "../store/appStateStore";

declare global {
  interface Window {
    freeze?: (countdown?: number) => void;
  }
}

export function useDevConsoleHelpers() {
  const { showDevOptions } = useAppStateStore()
  useEffect(() => {
    window.freeze = showDevOptions ? (countdown = 2) => {
      setTimeout(() => {debugger}, countdown * 1000);
    } : undefined;
  }, [showDevOptions]);
}
