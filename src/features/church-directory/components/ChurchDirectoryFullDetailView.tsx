import { useEffect, useState } from "react";
import {
  MapPin, Navigation, ShieldCheck, Share2,
} from "lucide-react";
import type { ChurchDirectoryFullDetails } from "../types";
import { CHURCH_DIR } from "../tokens";
import { directionsUrlForRow, shareUrlForChurch } from "../normalize";
import { getActiveMembershipChurchId } from "@/features/church/church-membership-api";
import {
  ChurchPageStatusBanner,
  fetchChurchClaimStatus,
  type ChurchPageStatus,
} from "@/features/church-page";
import { ChurchPublicFeedSection } from "@/features/church-mixed-feed";
import { ChurchDirectoryInfoTabs } from "./ChurchDirectoryInfoTabs";
import { ChurchDirectoryConnectActions } from "./ChurchDirectoryConnectActions";
import cardChurch from "@/assets/home/card-church.jpg";

type Props = {
  church: ChurchDirectoryFullDetails;
};

function heroImage(church: ChurchDirectoryFullDetails): string {
  return church.heroImageUrl?.trim() || church.coverImageUrl?.trim() || cardChurch;
}

function locationLine(church: ChurchDirectoryFullDetails): string {
  return [church.city, church.governorate, church.diocese, church.country ?? "مصر"].filter(Boolean).join(" · ");
}

export function ChurchDirectoryFullDetailView({ church }: Props) {
  const [pageStatus, setPageStatus] = useState<ChurchPageStatus>(church.pageStatus);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    setPageStatus(church.pageStatus);
  }, [church.id, church.pageStatus]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const claim = await fetchChurchClaimStatus(church.id);
      if (cancelled || !claim?.pageStatus) return;
      setPageStatus(claim.pageStatus);
    })();
    return () => {
      cancelled = true;
    };
  }, [church.id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const activeId = await getActiveMembershipChurchId();
      if (!cancelled) setIsMember(activeId === church.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [church.id]);

  const location = locationLine(church);
  const directionsUrl = directionsUrlForRow({
    name: church.name,
    lat: church.lat,
    lng: church.lng,
    city: church.city,
    governorate: church.governorate,
    verifiedLocationUrl: church.verifiedLocationUrl,
  });

  const share = async () => {
    const url = shareUrlForChurch(church.id);
    try {
      if (navigator.share) await navigator.share({ title: church.name, text: location, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <ChurchPageStatusBanner status={pageStatus} />

      <section
        className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl"
        style={{ borderColor: CHURCH_DIR.border, boxShadow: "0 24px 50px -24px rgba(93,50,145,0.45)" }}
      >
        <div className="relative h-[240px] w-full">
          <img src={heroImage(church)} alt={church.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1030]/85 via-[#1a1030]/20 to-transparent" />
          {church.isVerified || pageStatus === "verified" ? (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              موثقة
            </span>
          ) : null}
          <div className="absolute bottom-4 right-4 left-4 text-right text-white">
            {church.churchCode ? <p className="text-[10px] font-bold text-white/75">{church.churchCode}</p> : null}
            <h2 className="font-arabic-serif text-[22px] font-extrabold leading-tight">{church.name}</h2>
            {church.englishName ? <p className="mt-1 text-[11px] text-white/82">{church.englishName}</p> : null}
            {location ? (
              <p className="mt-2 inline-flex items-center gap-1 text-[12px]">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="grid grid-cols-4 gap-1 border-t p-2"
          style={{ borderColor: CHURCH_DIR.border, background: CHURCH_DIR.beige }}
        >
          <ChurchDirectoryConnectActions
            church={{
              id: church.id,
              name: church.name,
              phone: church.phone,
              whatsapp: church.whatsapp,
            }}
          />
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="action-tile">
            <Navigation className="h-4 w-4" />
            <span>الاتجاهات</span>
          </a>
          <button type="button" onClick={share} className="action-tile">
            <Share2 className="h-4 w-4" />
            <span>مشاركة</span>
          </button>
        </div>
      </section>

      <ChurchPublicFeedSection
        churchId={church.id}
        placeId={church.id}
        churchName={church.name}
      />

      <ChurchDirectoryInfoTabs
        church={church}
        pageStatus={pageStatus}
        isMember={isMember}
        onStatusChange={setPageStatus}
      />

      <style>{`
        .action-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border-radius: 16px;
          padding: 0.65rem 0.25rem;
          font-size: 10px;
          font-weight: 800;
          color: #5D3291;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(93,50,145,0.12);
        }
      `}</style>
    </div>
  );
}
