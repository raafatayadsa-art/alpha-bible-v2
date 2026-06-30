import type { CommunityMoment } from "./community-types";

export type MomentSourceRoute =
  | { to: "/church/post/$id"; params: { id: string } }
  | { to: "/$book/$chapter"; params: { book: string; chapter: string } }
  | { to: "/agpeya/$prayerId"; params: { prayerId: string } }
  | { to: "/prayer-requests"; params?: undefined }
  | { to: "/church"; params?: undefined };

/** Deep link for moment body tap — opens origin inside Alpha (church / bible / agpeya). */
export function resolveCommunityMomentSourceRoute(moment: CommunityMoment): MomentSourceRoute | null {
  if (moment.churchPostId) {
    return { to: "/church/post/$id", params: { id: moment.churchPostId } };
  }

  if (moment.kind === "reading" && moment.payload.reading?.bookRoute) {
    return {
      to: "/$book/$chapter",
      params: {
        book: moment.payload.reading.bookRoute,
        chapter: String(moment.payload.reading.chapter ?? 1),
      },
    };
  }

  if (moment.kind === "agpeya" && moment.payload.agpeya?.prayerId) {
    return { to: "/agpeya/$prayerId", params: { prayerId: moment.payload.agpeya.prayerId } };
  }

  if (moment.kind === "prayer") {
    if (moment.payload.prayer?.sourcePrayerId) {
      return { to: "/prayer-requests", params: undefined };
    }
    return { to: "/church", params: undefined };
  }

  return { to: "/church", params: undefined };
}
