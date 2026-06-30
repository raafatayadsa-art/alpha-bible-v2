import { Link } from "@tanstack/react-router";
import { ChevronLeft, Church } from "lucide-react";
import { PROFILE_MEMBER_DEMO } from "../profile-member";
import { ProfileGlassCard } from "./shared";

export function ProfileMyChurch() {
  const member = PROFILE_MEMBER_DEMO;

  return (
    <Link to="/church" className="block active:scale-[0.99] transition-transform">
      <ProfileGlassCard accent="#c98a3c" className="p-3.5">
        <div className="flex items-center gap-3.5">
          <div className="relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[16px] border border-[#efe2c4]">
            <img
              src={member.churchImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#3a2a18]/25 to-transparent"
            />
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Church className="h-3.5 w-3.5 text-[#b8893a]" strokeWidth={2.4} />
              <h3 className="text-[14px] font-extrabold text-[#3a2a18] truncate">
                {member.churchName}
              </h3>
            </div>
            <p className="mt-0.5 text-[11px] text-[#6a543a] truncate">{member.diocese}</p>
            <p className="mt-1 text-[11.5px] font-bold text-[#b8893a]">{member.churchRole}</p>
          </div>

          <ChevronLeft className="h-4 w-4 text-[#b8893a]/70 shrink-0" />
        </div>
      </ProfileGlassCard>
    </Link>
  );
}
