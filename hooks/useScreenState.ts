'use client';

import { AppState } from '@/types';
import { useState } from 'react'

const useScreenState = () => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    return {
        appState,
        setAppState,
        elapsedSeconds,
        setElapsedSeconds,
    }
}

export default useScreenState