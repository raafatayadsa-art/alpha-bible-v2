import { createContext, useContext, type ReactNode } from "react";
import type { ChurchDashboardData } from "./church-dashboard-api";

const ChurchDashboardContext = createContext<ChurchDashboardData | null>(null);

export function ChurchDashboardProvider({
  data,
  children,
}: {
  data: ChurchDashboardData;
  children: ReactNode;
}) {
  return (
    <ChurchDashboardContext.Provider value={data}>{children}</ChurchDashboardContext.Provider>
  );
}

export function useChurchDashboardData(): ChurchDashboardData {
  const ctx = useContext(ChurchDashboardContext);
  if (!ctx) throw new Error("useChurchDashboardData requires ChurchDashboardProvider");
  return ctx;
}
