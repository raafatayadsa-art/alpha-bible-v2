import type { Comment } from "./types";
import { Avatar } from "./Avatar";

export function CommentBox({ comment }: { comment: Comment }) {
  return (
    <div className="glass rounded-2xl px-2.5 py-2 flex items-center gap-2 shadow-soft border border-border/60">
      <Avatar member={comment.member} size={28} />
      <span className="font-display font-bold text-[12px] text-foreground shrink-0">
        {comment.member.name}
      </span>
      <span className="text-[12px] text-foreground/80 truncate flex-1">
        {comment.text} {comment.emoji ?? ""}
      </span>
      <span className="text-[10px] text-muted-foreground shrink-0">
        {comment.timeAgo}
      </span>
    </div>
  );
}

export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {comments.slice(0, 2).map((c) => (
        <CommentBox key={c.id} comment={c} />
      ))}
    </div>
  );
}
