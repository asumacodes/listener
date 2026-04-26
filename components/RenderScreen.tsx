'use client';

import { useScreenState } from '@/hooks';
import IdleScreen from '@/screens/IdleScreen';
import RecordingScreen from '@/screens/RecordingScreen';
import { AppState } from '@/types';
import React, { useEffect } from 'react'

const RenderScreen = () => {
    const { appState } = useScreenState();

    useEffect(() => {
        console.log('appState 1', appState);
    }, [appState]);

    switch (appState) {
        case AppState.IDLE:
            return <IdleScreen />;
        case AppState.RECORDING:
            return <RecordingScreen />;
        case AppState.STOPPED:
            return <IdleScreen />;
        case AppState.SUBMITTING:
            return <IdleScreen />;
        case AppState.DONE:
            return <IdleScreen />;
        case AppState.ERROR:
            return <IdleScreen />;
    }
}

export default RenderScreen