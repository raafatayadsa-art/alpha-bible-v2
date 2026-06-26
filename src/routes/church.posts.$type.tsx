import { createFileRoute, notFound } from "@tanstack/react-router";
import { POST_TYPE_META } from "@/data/church-posts";
import { ChurchPostsTypeScreen, isValidPostTypeRoute } from "@/features/church-mixed-feed";

export const Route = createFileRoute("/church/posts/$type")({
  ssr: false,
  beforeLoad: ({ params }) => {
    if (!isValidPostTypeRoute(params.type)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const label = isValidPostTypeRoute(params.type)
      ? POST_TYPE_META[params.type].label
      : "منشورات";
    return {
      meta: [
        { title: `ألفا — ${label}` },
        { name: "description", content: `منشورات الكنيسة — ${label}` },
      ],
    };
  },
  component: ChurchPostsTypeRoute,
});

function ChurchPostsTypeRoute() {
  const { type } = Route.useParams();
  if (!isValidPostTypeRoute(type)) return null;
  return <ChurchPostsTypeScreen postType={type} />;
}
