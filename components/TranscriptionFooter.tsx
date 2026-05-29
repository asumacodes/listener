"use client";

import CopyButton from "@/components/CopyButton";
import Button from "@/components/ui/Button";
import CtaBar from "@/components/ui/CtaBar";

type TranscriptionFooterProps = {
  transcription: string;
  onNewRecording: () => void;
};

const TranscriptionFooter = ({
  transcription,
  onNewRecording,
}: TranscriptionFooterProps) => (
  <CtaBar>
    <CopyButton text={transcription} />
    <Button variant="primary" fullWidth onClick={onNewRecording}>
      New Recording
    </Button>
  </CtaBar>
);

export default TranscriptionFooter;
