import { CommunityAddFriendMethodsPanel } from "./CommunityAddFriendMethodsPanel";
import { CommunityShieldSheet } from "./CommunityShieldSheet";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

/** Compact add-friend sheet — Trust Shield glass DNA. */
export function CommunityAddFriendSheet({ open, onClose, onAdded }: Props) {
  const handleAdded = () => {
    onAdded?.();
    onClose();
  };

  return (
    <CommunityShieldSheet
      open={open}
      onClose={onClose}
      title="إضافة صديق"
      subtitle="اختر طريقة آمنة للإضافة"
      maxHeight="min(72dvh,540px)"
      zIndex={97}
      variant="solid"
    >
      <CommunityAddFriendMethodsPanel compact onAdded={handleAdded} />
    </CommunityShieldSheet>
  );
}
