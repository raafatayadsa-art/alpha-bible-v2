import { useEffect, useState } from "react";
import type { ChurchPost } from "@/data/church-posts";
import { getFallbackPostImage, resolvePostImageSrc } from "@/features/church/post-image-engine";
import { getPostImages } from "./post-media";

function GalleryTile({
  src,
  post,
  alt,
  className = "",
  overlay,
}: {
  src: string;
  post: ChurchPost;
  alt: string;
  className?: string;
  overlay?: React.ReactNode;
}) {
  const fallback = getFallbackPostImage(post);
  const [resolved, setResolved] = useState(() => resolvePostImageSrc(src, post));

  useEffect(() => {
    setResolved(resolvePostImageSrc(src, post));
  }, [src, post]);

  return (
    <div className={"relative overflow-hidden bg-black/30 " + className}>
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        onError={() => { if (resolved !== fallback) setResolved(fallback); }}
      />
      {overlay}
    </div>
  );
}

/** Facebook-style multi-image grid — text should sit above this block. */
export function PostImageGallery({
  post,
  className = "",
  maxVisible = 4,
}: {
  post: ChurchPost;
  className?: string;
  maxVisible?: number;
}) {
  const images = getPostImages(post);
  if (images.length <= 1) return null;

  const shown = images.slice(0, maxVisible);
  const extra = images.length - maxVisible;
  const n = shown.length;

  if (n === 2) {
    return (
      <div className={"grid grid-cols-2 gap-0.5 " + className}>
        {shown.map((src, i) => (
          <GalleryTile key={i} src={src} post={post} alt="" className="aspect-[4/3]" />
        ))}
      </div>
    );
  }

  if (n === 3) {
    return (
      <div className={"grid grid-cols-2 grid-rows-2 gap-0.5 " + className} style={{ minHeight: 150 }}>
        <GalleryTile src={shown[0]} post={post} alt="" className="row-span-2 h-full min-h-[150px]" />
        <GalleryTile src={shown[1]} post={post} alt="" className="h-full min-h-[72px]" />
        <GalleryTile src={shown[2]} post={post} alt="" className="h-full min-h-[72px]" />
      </div>
    );
  }

  return (
    <div className={"grid grid-cols-2 gap-0.5 " + className}>
      {shown.map((src, i) => (
        <GalleryTile
          key={i}
          src={src}
          post={post}
          alt=""
          className="aspect-[4/3]"
          overlay={
            i === shown.length - 1 && extra > 0 ? (
              <div className="absolute inset-0 grid place-items-center bg-black/55 text-[15px] font-extrabold text-white">
                +{extra}
              </div>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
