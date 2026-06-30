import type { ReactNode } from "react";

import { AvatarWithDisplayShield } from "@/components/alpha/AvatarWithDisplayShield";

import type { ShieldRole } from "@/components/alpha/AlphaShield";

import { profileAvatarInitials } from "./profile-user-store";
import { cn } from "@/lib/utils";



type Props = {

  name: string;

  avatarUrl?: string;

  shieldRole?: ShieldRole | null;

  showShield?: boolean;

  className?: string;

  onClick?: () => void;

};



const PHOTO_PX = 175;



/** Large profile avatar — clean circle without gold frame. */

export function ProfileCopticAvatarFrame({

  name,

  avatarUrl,

  shieldRole,

  showShield = false,

  className,

  onClick,

}: Props) {

  const initials = profileAvatarInitials(name);

  const role = showShield && shieldRole ? shieldRole : null;



  const photoInner = avatarUrl ? (

    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />

  ) : (

    <div className="grid h-full w-full place-items-center bg-[#f5efe6] font-arabic-serif text-[40px] font-black tracking-tight text-[#5a4a38]">

      {initials}

    </div>

  );



  const photo = (

    <div

      className="relative mx-auto overflow-hidden rounded-full bg-[#f5efe6] shadow-[0_12px_32px_-16px_rgba(40,28,12,0.35)]"

      style={{ width: PHOTO_PX, height: PHOTO_PX }}

    >

      {role ? (

        <AvatarWithDisplayShield

          userName={name}

          userAvatar={avatarUrl}

          shieldRole={role}

          shieldSize="lg"

          className="h-full w-full"

          avatarClassName="h-full w-full"

        >

          {photoInner}

        </AvatarWithDisplayShield>

      ) : (

        photoInner

      )}

    </div>

  );



  const shellClass = cn("relative mx-auto select-none", className);



  if (onClick) {

    return (

      <button

        type="button"

        onClick={onClick}

        aria-label={`معاينة ملف ${name}`}

        className={cn(shellClass, "block active:scale-[0.98] transition-transform")}

      >

        {photo}

      </button>

    );

  }



  return <div className={shellClass}>{photo}</div>;

}

