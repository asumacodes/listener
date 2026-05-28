"use client";

import RenderScreen from "@/components/RenderScreen";
import { RecordingHistoryProvider } from "@/components/RecordingHistoryContext";
import RecordingHistorySidebar from "@/components/RecordingHistorySidebar";
import { useScreenState, useRecordingActions } from "@/hooks";
import { useState } from "react";

const ListenerApp = () => {
  const screenState = useScreenState();
  const actions = useRecordingActions(screenState);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <RecordingHistoryProvider openHistory={() => setHistoryOpen(true)}>
      <RenderScreen screenState={screenState} actions={actions} />
      <RecordingHistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </RecordingHistoryProvider>
  );
};

export default ListenerApp;
