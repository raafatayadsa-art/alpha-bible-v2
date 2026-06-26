import { createFileRoute, notFound } from "@tanstack/react-router";
import { POST_TYPE_META } from "@/data/church-posts";
import { fetchChurchDirectoryFullDetails } from "@/features/church-directory";
import {
  ChurchDirectoryPostsTypeScreen,
  isValidPostTypeRoute,
} from "@/features/church-mixed-feed";

export const Route = createFileRoute("/church/directory/$placeId/posts/$type")({
  ssr: false,
  loader: async ({ params }) => {
    if (!isValidPostTypeRoute(params.type)) throw notFound();
    const church = await fetchChurchDirectoryFullDetails(params.placeId);
    if (!church) throw notFound();
    return { church, postType: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData?.postType
      ? POST_TYPE_META[loaderData.postType].label
      : "منشورات";
    const name = loaderData?.church?.name ?? "الكنيسة";
    return {
      meta: [
        { title: `ألفا — ${label} · ${name}` },
        { name: "description", content: `منشورات ${name} — ${label}` },
      ],
    };
  },
  component: DirectoryPostsTypeRoute,
});

function DirectoryPostsTypeRoute() {
  const { church, postType } = Route.useLoaderData();
  const { placeId } = Route.useParams();
  return (
    <ChurchDirectoryPostsTypeScreen
      churchId={church.id}
      placeId={placeId}
      churchName={church.name}
      postType={postType}
    />
  );
}
