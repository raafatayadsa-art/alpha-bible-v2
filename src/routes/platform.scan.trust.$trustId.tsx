import { createFileRoute } from "@tanstack/react-router";
import { PlatformTrustProfileScreen } from "@/features/platform-admin/PlatformTrustProfileScreen";
import { PlatformAccessGate } from "@/features/platform-admin/PlatformAccessGate";

export const Route = createFileRoute("/platform/scan/trust/$trustId")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Platform Trust Profile — Alpha Control" }],
  }),
  component: PlatformTrustProfileRoute,
});

function PlatformTrustProfileRoute() {
  const { trustId } = Route.useParams();
  return (
    <PlatformAccessGate>
      <PlatformTrustProfileScreen trustId={trustId} />
    </PlatformAccessGate>
  );
}
