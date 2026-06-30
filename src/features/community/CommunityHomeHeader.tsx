import { AlphaNotificationButton } from "@/components/navigation/AlphaNotificationButton";
import { ProfileSettingsMenu } from "@/features/profile/ProfileSettingsMenu";

export function CommunityHomeHeader() {
  return (
    <header className="relative z-50 flex items-center gap-2 pt-[max(env(safe-area-inset-top),12px)] pb-3">
      <ProfileSettingsMenu
        menuAlign="start"
        trigger="avatar"
        avatarSize="lg"
        avatarVariant="community-hub"
      />

      <div className="flex min-w-0 flex-1 items-center justify-center">
        <h1 className="text-[17px] font-extrabold tracking-tight text-alpha-heading-muted">مجتمعي</h1>
      </div>

      <AlphaNotificationButton className="relative z-[60] shrink-0 border-transparent text-alpha-heading-muted shadow-none" />
    </header>
  );
}
