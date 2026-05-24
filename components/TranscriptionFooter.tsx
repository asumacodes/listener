"use client";

import CopyButton from "@/components/CopyButton";
import Button from "@/components/ui/Button";

type TranscriptionFooterProps = {
  transcription: string;
  onNewRecording: () => void;
};

const TranscriptionFooter = ({
  transcription,
  onNewRecording,
}: TranscriptionFooterProps) => {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 pt-8">
      <CopyButton text={transcription} />
      <Button variant="primary" onClick={onNewRecording}>
        New Recording
      </Button>
    </div>
  );
};

export default TranscriptionFooter;
