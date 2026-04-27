import React from "react";

type TranscriptionScreenProps = {
  transcription: string;
  onNewRecording: () => void;
};

const TranscriptionScreen = ({
  transcription,
  onNewRecording,
}: TranscriptionScreenProps) => {
  return (
    <div>
      <p>State: TRANSCRIPTION</p>
      <p
        style={{
          background: "#f5f5f5",
          padding: "1rem",
          borderLeft: "4px solid #C9A96E",
          lineHeight: 1.6,
        }}
      >
        {transcription}
      </p>
      <button onClick={() => navigator.clipboard.writeText(transcription)}>
        Copy
      </button>{" "}
      <button onClick={onNewRecording}>New Recording</button>
    </div>
  );
};

export default TranscriptionScreen;
