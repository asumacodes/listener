import React, { useState } from "react";

type TranscriptionScreenProps = {
  transcription: string;
  onNewRecording: () => void;
};

const TranscriptionScreen = ({
  transcription,
  onNewRecording,
}: TranscriptionScreenProps) => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopyStatus("Copied to clipboard.");
    } catch {
      setCopyStatus("Copy failed. Select the text and copy it manually.");
    }
  };

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
      <button onClick={handleCopy}>Copy</button>{" "}
      <button onClick={onNewRecording}>New Recording</button>
      {copyStatus && (
        <p style={{ color: "#666", fontSize: "0.8rem" }}>{copyStatus}</p>
      )}
    </div>
  );
};

export default TranscriptionScreen;
