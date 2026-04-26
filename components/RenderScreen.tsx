'use client';

import { useRecordingActions, useScreenState } from '@/hooks';
import IdleScreen from '@/screens/IdleScreen';
import RecordingScreen from '@/screens/RecordingScreen';
import { AppState } from '@/types';
import { useEffect } from 'react'

interface RenderScreenProps {
    screenState: ReturnType<typeof useScreenState>
    actions: ReturnType<typeof useRecordingActions>
  }

const RenderScreen = ({ screenState, actions }: RenderScreenProps) => {
    const { appState = AppState.IDLE, elapsedSeconds = 0 } = screenState;
    const { startRecording, stopRecording } = actions;

    useEffect(() => {
        console.log('appState 1', appState);
    }, [appState]);

    switch (appState) {
        case AppState.IDLE:
            return <IdleScreen onRecord={startRecording} />;
        case AppState.RECORDING:
            return (
              <RecordingScreen
                elapsedSeconds={elapsedSeconds}
                onStop={stopRecording}
              />
            );
        case AppState.STOPPED:
            return <IdleScreen onRecord={startRecording} />;
        case AppState.SUBMITTING:
            return <IdleScreen onRecord={startRecording} />;
        case AppState.DONE:
            return <IdleScreen onRecord={startRecording} />;
        case AppState.ERROR:
            return <IdleScreen onRecord={startRecording} />;
    }
}

export default RenderScreen