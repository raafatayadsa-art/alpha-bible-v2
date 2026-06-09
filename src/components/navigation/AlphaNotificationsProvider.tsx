import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlphaNotificationsPanel } from "./AlphaNotificationsPanel";

type AlphaNotificationsContextValue = {
  open: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
};

const AlphaNotificationsContext = createContext<AlphaNotificationsContextValue | null>(null);

export function AlphaNotificationsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openNotifications = useCallback(() => setOpen(true), []);
  const closeNotifications = useCallback(() => setOpen(false), []);
  const toggleNotifications = useCallback(() => setOpen((v) => !v), []);

  const value = useMemo(
    () => ({ open, openNotifications, closeNotifications, toggleNotifications }),
    [open, openNotifications, closeNotifications, toggleNotifications],
  );

  return (
    <AlphaNotificationsContext.Provider value={value}>
      {children}
      <AlphaNotificationsPanel open={open} onClose={closeNotifications} />
    </AlphaNotificationsContext.Provider>
  );
}

export function useAlphaNotifications() {
  const ctx = useContext(AlphaNotificationsContext);
  if (!ctx) {
    throw new Error("useAlphaNotifications must be used within AlphaNotificationsProvider");
  }
  return ctx;
}
