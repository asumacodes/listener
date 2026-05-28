import RecordingsList from "@/components/recordings/RecordingsList";
import { listRecordingsWithSignedUrls } from "@/lib/recordings/server";

export const dynamic = "force-dynamic";

const RecordingsPage = async () => {
  const result = await listRecordingsWithSignedUrls();

  if (result.error !== null) {
    return <RecordingsList recordings={[]} error={result.error} />;
  }

  return <RecordingsList recordings={result.data} />;
};

export default RecordingsPage;
