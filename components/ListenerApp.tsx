"use client";

import { useTabBar } from "@/components/nav/TabBarContext";
import RenderScreen from "@/components/RenderScreen";
import {
  useMurmurActions,
  usePipelineRun,
  useRecordingActions,
  useScreenState,
  useSessionRestore,
} from "@/hooks";
import { AppState } from "@/types";
import AppBootstrapScreen from "@/screens/AppBootstrapScreen";
import RehydrationSplash from "@/screens/RehydrationSplash";
import { useEffect } from "react";

const ListenerApp = () => {
  const screenState = useScreenState();
  const { isAppReady, restoreMode } = useSessionRestore(screenState);
  const recordingActions = useRecordingActions(screenState);
  const murmurActions = useMurmurActions(screenState);
  const actions = { ...recordingActions, ...murmurActions };
  const { setHidden } = useTabBar();

  usePipelineRun(screenState);

  useEffect(() => {
    setHidden(isAppReady && screenState.appState !== AppState.IDLE);
  }, [screenState.appState, isAppReady, setHidden]);

  if (!isAppReady) {
    return restoreMode === "pipeline" ? (
      <RehydrationSplash />
    ) : (
      <AppBootstrapScreen />
    );
  }

  return <RenderScreen screenState={screenState} actions={actions} />;
};

export default ListenerApp;
