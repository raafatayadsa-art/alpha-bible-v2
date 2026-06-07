import { useEffect, useState } from "react";
import type { ChurchPost } from "@/data/church-posts";
import {
  getFallbackPostImage,
  resolvePostImageSrc,
} from "./post-image-engine";

export function PostImage({
  post,
  alt,
  className = "",
  loading = "lazy",
}: {
  post: Pick<ChurchPost, "image" | "type" | "title" | "id" | "details">;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const fallback = getFallbackPostImage(post);
  const [src, setSrc] = useState(() => resolvePostImageSrc(post.image, post));

  useEffect(() => {
    setSrc(resolvePostImageSrc(post.image, post));
  }, [post.image, post.type, post.id, post.details?.eventType]);

  return (
    <img
      src={src}
      alt={alt ?? post.title}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}
