import { Link } from "@tanstack/react-router";
import {
  ChevronLeft, MapPin, Navigation, Phone, MessageCircle, Mail, Globe,
  Church, Users, BookOpen, ShieldCheck, Cross, ExternalLink, Sparkles,
} from "lucide-react";
import {
  directoryChurchImage,
  directoryChurchLocation,
  mapsDirectionsUrlForChurch,
  mapsUrlForChurch,
  churchHasMapTarget,
  type DirectoryChurch,
} from "@/features/church/churches-directory-api";
import { JoinChurchButton } from "@/features/church/JoinChurchButton";

const SKY = "rgba(140,180,220,";
const LAV = "rgba(170,150,210,";
const GOLD = "#c9a14a";
const BORDER = "rgba(220,210,235,0.7)";
const TEXT = "#3a3258";
const SUB = "#6b658a";

type Props = {
  church: DirectoryChurch;
  backTo?: string;
};

export function ChurchDirectoryDetailCard({ church, backTo = "/church/directory" }: Props) {
  const location = directoryChurchLocation(church);
  const directionsUrl = mapsDirectionsUrlForChurch(church);
  const mapUrl = mapsUrlForChurch(church);
  const canNavigate = churchHasMapTarget(church);

  return (
    <div dir="rtl" className="space-y-4">
      <section
        className="relative overflow-hidden rounded-[28px] border backdrop-blur-xl"
        style={{
          borderColor: BORDER,
          boxShadow: "0 24px 50px -24px rgba(120,110,180,0.5), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <div className="relative h-[220px] w-full">
          <img
            src={directoryChurchImage(church)}
            alt={church.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(26,16,48,0.82) 100%)",
            }}
          />
          {church.isVerified ? (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
              موثّقة
            </span>
          ) : null}
          <div className="absolute bottom-4 right-4 left-4 text-right text-white">
            {church.churchCode ? (
              <p className="text-[10px] font-bold tracking-wide text-white/75">{church.churchCode}</p>
            ) : null}
            <h2 className="font-arabic-serif text-[22px] font-extrabold leading-tight">{church.name}</h2>
            {church.englishName ? (
              <p className="mt-1 text-[11px] font-medium text-white/80 line-clamp-2">{church.englishName}</p>
            ) : null}
            {location ? (
              <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-white/92">
                <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2.3} />
                <span>{location}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-3 bg-gradient-to-b from-[#fbf6ec] to-[#efeaf6] p-4">
          <div className="grid grid-cols-3 gap-2">
            <LocationChip label="الإيبارشية" value={church.diocese} />
            <LocationChip label="المحافظة" value={church.governorate} />
            <LocationChip label="المدينة" value={church.city} />
          </div>

          {church.locationLat != null && church.locationLng != null ? (
            <p className="text-[10.5px] font-bold text-right" style={{ color: SUB }}>
              الإحداثيات: {church.locationLat.toFixed(5)}, {church.locationLng.toFixed(5)}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            {canNavigate ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full text-[12px] font-extrabold text-white active:scale-[0.98] transition-transform"
                style={{
                  background: `linear-gradient(160deg, ${SKY}0.95), #2f5a8a)`,
                  boxShadow: `0 12px 24px -14px ${SKY}0.9)`,
                }}
              >
                <Navigation className="h-4 w-4" strokeWidth={2.4} />
                الاتجاهات
              </a>
            ) : (
              <span
                className="inline-flex h-11 items-center justify-center rounded-full text-[12px] font-extrabold opacity-50"
                style={{ background: `${SKY}0.25)`, color: "#2f5a8a" }}
              >
                لا يوجد موقع
              </span>
            )}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border text-[12px] font-extrabold active:scale-[0.98] transition-transform"
              style={{
                background: `linear-gradient(160deg, rgba(255,255,255,0.95), ${LAV}0.18))`,
                borderColor: `${LAV}0.5)`,
                color: "#5a3e8a",
              }}
            >
              <MapPin className="h-4 w-4" strokeWidth={2.4} />
              على الخريطة
            </a>
          </div>
        </div>
      </section>

      <DetailCard title="الكاهن والقديس" icon={Church}>
        {church.priestName || church.priestsFull ? (
          <InfoRow label="الكاهن" value={church.priestsFull ?? church.priestName ?? ""} multiline />
        ) : null}
        {church.patronSaint ? <InfoRow label="القديس الشفيع" value={church.patronSaint} /> : null}
        {church.patronFeasts ? <InfoRow label="الأعياد" value={church.patronFeasts} multiline /> : null}
        {!church.priestName && !church.priestsFull && !church.patronSaint ? (
          <p className="text-[12px] font-bold text-right" style={{ color: SUB }}>لا توجد بيانات كهنوتية بعد.</p>
        ) : null}
      </DetailCard>

      {church.address || church.country ? (
        <DetailCard title="العنوان" icon={MapPin}>
          {church.address ? <InfoRow label="العنوان الكامل" value={church.address} multiline /> : null}
          {church.country ? <InfoRow label="الدولة" value={church.country} /> : null}
        </DetailCard>
      ) : null}

      {church.description ? (
        <DetailCard title="نبذة" icon={Sparkles}>
          <p className="text-[13px] leading-relaxed font-bold text-right" style={{ color: TEXT }}>
            {church.description}
          </p>
        </DetailCard>
      ) : null}

      <DetailCard title="المجتمع" icon={Users}>
        <div className="grid grid-cols-2 gap-2">
          <StatMini icon={Users} label="أعضاء" value={church.memberCount.toLocaleString("ar-EG")} />
          <StatMini icon={BookOpen} label="خدام" value={church.servantCount.toLocaleString("ar-EG")} />
        </div>
      </DetailCard>

      {(church.phone || church.whatsapp || church.email) ? (
        <DetailCard title="التواصل" icon={Phone}>
          <div className="grid grid-cols-1 gap-2">
            {church.phone ? (
              <ContactLink href={`tel:${church.phone}`} icon={Phone} label="اتصال" value={church.phone} />
            ) : null}
            {church.whatsapp ? (
              <ContactLink
                href={`https://wa.me/${church.whatsapp.replace(/\D/g, "")}`}
                icon={MessageCircle}
                label="واتساب"
                value={church.whatsapp}
                external
              />
            ) : null}
            {church.email ? (
              <ContactLink href={`mailto:${church.email}`} icon={Mail} label="بريد" value={church.email} />
            ) : null}
          </div>
        </DetailCard>
      ) : null}

      {(church.websiteUrl || church.facebookUrl || church.youtubeUrl || church.churchUrl) ? (
        <DetailCard title="الروابط" icon={Globe}>
          <div className="grid grid-cols-1 gap-2">
            {church.websiteUrl ? (
              <ContactLink href={church.websiteUrl} icon={Globe} label="الموقع" value="فتح الموقع" external />
            ) : null}
            {church.churchUrl ? (
              <ContactLink href={church.churchUrl} icon={ExternalLink} label="مرجع تاريخي" value="st-takla.org" external />
            ) : null}
            {church.facebookUrl ? (
              <ContactLink href={church.facebookUrl} icon={ExternalLink} label="فيسبوك" value="Facebook" external />
            ) : null}
            {church.youtubeUrl ? (
              <ContactLink href={church.youtubeUrl} icon={ExternalLink} label="يوتيوب" value="YouTube" external />
            ) : null}
          </div>
        </DetailCard>
      ) : null}

      <DetailCard title="الانضمام" icon={Cross}>
        <JoinChurchButton churchId={church.id} churchName={church.name} />
      </DetailCard>

      <Link
        to={backTo as any}
        className="block text-center text-[12px] font-extrabold py-2"
        style={{ color: "#5a3e8a" }}
      >
        العودة إلى الدليل
      </Link>
    </div>
  );
}

function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Church;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[24px] border p-4 backdrop-blur-xl"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(241,236,247,0.85))",
        borderColor: BORDER,
        boxShadow: "0 20px 40px -24px rgba(120,110,180,0.5), inset 0 1px 0 rgba(255,255,255,0.95)",
      }}
    >
      <div className="mb-3 flex items-center justify-end gap-2">
        <h3 className="text-[13.5px] font-extrabold" style={{ color: TEXT }}>{title}</h3>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: `${LAV}0.2)`, color: "#5a4e8a", border: `1px solid ${LAV}0.35)` }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </div>
      {children}
    </section>
  );
}

function LocationChip({ label, value }: { label: string; value: string | null }) {
  return (
    <div
      className="rounded-2xl border px-2 py-2.5 text-center min-h-[62px] flex flex-col justify-center"
      style={{ background: "rgba(255,255,255,0.72)", borderColor: BORDER }}
    >
      <p className="text-[9px] font-bold" style={{ color: SUB }}>{label}</p>
      <p className="mt-1 text-[11px] font-extrabold leading-snug line-clamp-2" style={{ color: TEXT }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function InfoRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="rounded-2xl border px-3 py-2.5 text-right mb-2 last:mb-0" style={{ borderColor: BORDER, background: "rgba(255,255,255,0.65)" }}>
      <p className="text-[10px] font-bold" style={{ color: SUB }}>{label}</p>
      <p className={`mt-1 text-[13px] font-extrabold ${multiline ? "leading-relaxed whitespace-pre-line" : ""}`} style={{ color: TEXT }}>
        {value}
      </p>
    </div>
  );
}

function StatMini({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/70 border px-3 py-2 text-center" style={{ borderColor: BORDER }}>
      <Icon className="mx-auto h-4 w-4" style={{ color: "#5a4e8a" }} strokeWidth={2.2} />
      <p className="mt-1 text-[16px] font-extrabold" style={{ color: TEXT }}>{value}</p>
      <p className="text-[10px] font-bold" style={{ color: SUB }}>{label}</p>
    </div>
  );
}

function ContactLink({
  href,
  icon: Icon,
  label,
  value,
  external,
}: {
  href: string;
  icon: typeof Phone;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 active:scale-[0.99] transition-transform"
      style={{
        borderColor: `${GOLD}55`,
        background: "linear-gradient(160deg, rgba(255,255,255,0.9), rgba(251,246,236,0.85))",
      }}
    >
      <span className="text-[12px] font-extrabold truncate" style={{ color: TEXT }}>{value}</span>
      <span className="inline-flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-bold" style={{ color: SUB }}>{label}</span>
        <Icon className="h-4 w-4" style={{ color: "#5a4e8a" }} strokeWidth={2.2} />
      </span>
    </a>
  );
}
