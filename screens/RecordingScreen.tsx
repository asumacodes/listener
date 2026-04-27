import { formatTime } from "@/utils";
import React from "react";

interface RecordingScreenProps {
  elapsedSeconds: number;
  onStop: () => void;
}

const RecordingScreen = ({ elapsedSeconds, onStop }: RecordingScreenProps) => {
  return (
    <div>
      <p>State: RECORDING</p>
      <p>⏱ {formatTime(elapsedSeconds)} / 120</p>
      <button onClick={onStop}>Stop</button>
    </div>
  );
};

export default RecordingScreen;
