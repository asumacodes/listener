"use client";

import { useTabBar } from "@/components/nav/TabBarContext";
import RenderScreen from "@/components/RenderScreen";
import { useRecordingActions, useScreenState } from "@/hooks";
import { AppState } from "@/types";
import { useEffect } from "react";

const ListenerApp = () => {
  const screenState = useScreenState();
  const actions = useRecordingActions(screenState);
  const { setHidden } = useTabBar();

  useEffect(() => {
    setHidden(screenState.appState !== AppState.IDLE);
  }, [screenState.appState, setHidden]);

  return <RenderScreen screenState={screenState} actions={actions} />;
};

export default ListenerApp;
