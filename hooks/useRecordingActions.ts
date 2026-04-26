'use client';

import { AppState } from "@/types";
import { useScreenState } from ".";

const useRecordingActions = (screenState: ReturnType<typeof useScreenState>) => {
    const { setAppState } = screenState;

    const startRecording = () => {
        console.log('startRecording');
        setAppState(AppState.RECORDING);
    }

    const stopRecording = () => {
        console.log('stopRecording');
    }

    const submitRecording = () => {
        console.log('submitRecording');
    }

    const handleReRecord = () => {
        console.log('handleReRecord');
    }

    return {
        startRecording,
        stopRecording,
        submitRecording,
        handleReRecord,
    }
}

export default useRecordingActions