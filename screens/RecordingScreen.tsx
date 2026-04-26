import { useRecordingActions } from '@/hooks';
import { formatTime } from '@/utils';
import React from 'react'

const RecordingScreen = () => {
  const { elapsedSeconds, stopRecording } = useRecordingActions();

  return (
    <div>
        <p>State: RECORDING</p>
        <p>⏱ {formatTime(elapsedSeconds)} / 120</p>
        <button onClick={stopRecording}>Stop</button>
    </div>
  )
}

export default RecordingScreen