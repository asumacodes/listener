import { useRecordingActions, useScreenState } from '@/hooks';
import React from 'react'

const IdleScreen = () => {
  const screenState = useScreenState();
  const { startRecording } = useRecordingActions(screenState);

  return (
    <div>
      <p>State: IDLE</p>
      <button onClick={startRecording}>Record</button>
    </div>
  )
}

export default IdleScreen