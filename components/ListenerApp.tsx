"use client";

import { useTabBar } from "@/components/nav/TabBarContext";
import RenderScreen from "@/components/RenderScreen";
import {
  useMurmurActions,
  usePipelineRun,
  useRecordingActions,
  useScreenState,
  useSessionRestore,
  useStallWatchdog,
} from "@/hooks";
import { AppState } from "@/types";
import RehydrationSplash from "@/screens/RehydrationSplash";
import { useEffect } from "react";

const ListenerApp = () => {
  const screenState = useScreenState();
  const { isAppReady } = useSessionRestore(screenState);
  const recordingActions = useRecordingActions(screenState);
  const murmurActions = useMurmurActions(screenState);
  const actions = { ...recordingActions, ...murmurActions };
  const { setHidden } = useTabBar();

  usePipelineRun(screenState);
  const watchdog = useStallWatchdog(screenState);

  useEffect(() => {
    setHidden(isAppReady && screenState.appState !== AppState.IDLE);
  }, [screenState.appState, isAppReady, setHidden]);

  if (!isAppReady) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <RehydrationSplash />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <RenderScreen
        screenState={screenState}
        actions={actions}
        onWatchdogRefresh={watchdog.refresh}
      />
    </div>
  );
};

export default ListenerApp;
