"use client";

import WelcomeBanner from "@/components/onboarding/WelcomeBanner";
import useWelcomeBanner from "@/hooks/useWelcomeBanner";
import { copy } from "@/lib/design/copy";
import { hasAnyRecording } from "@/lib/recordings/exists";
import IdleScreen from "@/screens/IdleScreen";
import { useQuery } from "@tanstack/react-query";

const IdleWelcomeHost = ({ onRecord }: { onRecord: () => void }) => {
  const { data: hasAny, isLoading } = useQuery({
    queryKey: ["has-any-recording"],
    queryFn: hasAnyRecording,
  });
  const emptyStudio = !isLoading && hasAny === false;
  const welcome = useWelcomeBanner({ emptyStudio });

  return (
    <IdleScreen
      onRecord={onRecord}
      explainer={copy.idle.explainer}
      banner={
        welcome.show ? (
          <WelcomeBanner
            title={welcome.title}
            body={welcome.body}
            onDismiss={welcome.dismiss}
          />
        ) : null
      }
    />
  );
};

export default IdleWelcomeHost;
