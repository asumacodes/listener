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
  const { refresh: refreshWatchdog } = useStallWatchdog(screenState);

  useEffect(() => {
    setHidden(isAppReady && screenState.appState !== AppState.IDLE);
  }, [screenState.appState, isAppReady, setHidden]);

  useEffect(() => {
    if (screenState.appState !== AppState.PIPELINE_RUNNING) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshWatchdog();
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [screenState.appState, refreshWatchdog]);

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
        onWatchdogRefresh={refreshWatchdog}
      />
    </div>
  );
};

export default ListenerApp;
