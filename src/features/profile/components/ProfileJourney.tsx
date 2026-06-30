import { Timeline, TimelineItem } from "@/components/coptic/Timeline";
import { PROFILE_JOURNEY } from "../profile-seed";
import { ProfileGlassCard } from "./shared";

export function ProfileJourney() {
  return (
    <ProfileGlassCard className="p-4">
      <Timeline>
        {PROFILE_JOURNEY.map((event) => (
          <TimelineItem key={event.id} accent={event.accent}>
            <div className="rounded-[16px] border border-[#efe2c4]/80 bg-white/55 px-3 py-2.5 mr-1">
              <p className="text-[12.5px] font-extrabold text-[#3a2a18]">{event.title}</p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-[#9a7e5a]">{event.date}</p>
            </div>
          </TimelineItem>
        ))}
      </Timeline>
    </ProfileGlassCard>
  );
}
