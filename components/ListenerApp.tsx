"use client";

import RenderScreen from "@/components/RenderScreen";
import { useScreenState, useRecordingActions } from "@/hooks";

const ListenerApp = () => {
  const screenState = useScreenState();
  const actions = useRecordingActions(screenState);

  return <RenderScreen screenState={screenState} actions={actions} />;
};

export default ListenerApp;
