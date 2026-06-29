/** Post-trip lifecycle — wires 089–091, 097 on trip completion */

import type { ChurchPost } from "@/data/church-posts";
import { getRegistrationsForPost } from "../post-registrations";
import { issueCertificate } from "./trip-certificates";
import { buildTripMemoryAlbum } from "./trip-memory-album";
import { buildTripTimelineFromArchive } from "./trip-timeline";
import { addPilgrimageEntry } from "./pilgrimage-passport";
import { recordTripCompletionForOrganizer } from "./organizer-trust";

export function finalizePostTrip(post: ChurchPost) {
  if (post.type !== "trip") return;

  buildTripMemoryAlbum(post);
  buildTripTimelineFromArchive(post);

  const organizerId = post.details?.organizerUserId;
  const organizerName = post.details?.organizerName ?? post.author;
  if (organizerId) {
    recordTripCompletionForOrganizer(organizerId, post.id);
  }

  const regs = getRegistrationsForPost(post.id, "trip");
  for (const r of regs) {
    issueCertificate({
      userId: r.userId,
      eventTitle: post.title,
      eventDate: post.details?.date ?? post.date,
      organizerName,
      postId: post.id,
    });
    addPilgrimageEntry({
      userId: r.userId,
      kind: post.details?.places?.includes("دير") ? "monastery" : "trip",
      title: post.title,
      completedAt: new Date().toISOString(),
      postId: post.id,
    });
  }
}
