"use client";

import { useTabBar } from "@/components/nav/TabBarContext";
import RenderScreen from "@/components/RenderScreen";
import {
  useMurmurActions,
  usePipelineRun,
  useRecordingActions,
  useScreenState,
} from "@/hooks";
import { AppState } from "@/types";
import { useEffect } from "react";

const ListenerApp = () => {
  const screenState = useScreenState();
  const recordingActions = useRecordingActions(screenState);
  const murmurActions = useMurmurActions(screenState);
  const actions = { ...recordingActions, ...murmurActions };
  const { setHidden } = useTabBar();

  usePipelineRun(screenState);

  useEffect(() => {
    setHidden(screenState.appState !== AppState.IDLE);
  }, [screenState.appState, setHidden]);

  return <RenderScreen screenState={screenState} actions={actions} />;
};

export default ListenerApp;
