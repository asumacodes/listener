import React from "react";

type PlaybackScreenProps = {
  audioUrl: string;
  onReRecord: () => void;
  onConfirm: () => void;
};

const PlaybackScreen = ({
  audioUrl,
  onReRecord,
  onConfirm,
}: PlaybackScreenProps) => {
  return (
    <div>
      <p>State: PLAYBACK READY</p>
      <audio
        controls
        src={audioUrl}
        style={{ display: "block", marginBottom: "1rem" }}
      />
      <button onClick={onReRecord}>Re-record</button>{" "}
      <button onClick={onConfirm}>Confirm →</button>
    </div>
  );
};

export default PlaybackScreen;
