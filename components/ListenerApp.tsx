"use client";

import CostHaltSheet from "@/components/confirm/CostHaltSheet";
import OutOfQuotaSheet from "@/components/confirm/OutOfQuotaSheet";
import RunInProgressSheet from "@/components/confirm/RunInProgressSheet";
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
import { useCallback, useEffect } from "react";

const ListenerApp = () => {
  const screenState = useScreenState();
  const { isAppReady } = useSessionRestore(screenState);
  const recordingActions = useRecordingActions(screenState);
  const murmurActions = useMurmurActions(screenState);
  const actions = { ...recordingActions, ...murmurActions };
  const { setHidden } = useTabBar();

  usePipelineRun(screenState);
  const { refresh: refreshWatchdog } = useStallWatchdog(screenState);

  const {
    concurrentActiveRunId,
    setConcurrentActiveRunId,
    outOfQuotaOpen,
    setOutOfQuotaOpen,
    costHaltOpen,
    setCostHaltOpen,
    setRunId,
    setAppState,
  } = screenState;

  const goToConcurrentPipeline = useCallback(() => {
    if (!concurrentActiveRunId) return;
    setRunId(concurrentActiveRunId);
    setConcurrentActiveRunId(null);
    setAppState(AppState.PIPELINE_RUNNING);
  }, [concurrentActiveRunId, setRunId, setConcurrentActiveRunId, setAppState]);

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

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const postActiveRun = () => {
      const controller = navigator.serviceWorker.controller;
      if (!controller) return;

      controller.postMessage({
        kind: "active-run-state",
        runId: screenState.runId,
        active:
          screenState.appState === AppState.PIPELINE_RUNNING &&
          document.visibilityState === "visible",
      });
    };

    postActiveRun();
    document.addEventListener("visibilitychange", postActiveRun);
    return () =>
      document.removeEventListener("visibilitychange", postActiveRun);
  }, [screenState.appState, screenState.runId]);

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
      <RunInProgressSheet
        open={concurrentActiveRunId !== null}
        onClose={() => setConcurrentActiveRunId(null)}
        onGoToPipeline={goToConcurrentPipeline}
      />
      <OutOfQuotaSheet
        open={outOfQuotaOpen}
        onClose={() => setOutOfQuotaOpen(false)}
      />
      <CostHaltSheet
        open={costHaltOpen}
        onClose={() => setCostHaltOpen(false)}
      />
    </div>
  );
};

export default ListenerApp;
