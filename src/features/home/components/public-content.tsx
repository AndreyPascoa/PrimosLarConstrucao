"use client";
import { createContext, useContext } from "react";
import type { PublicContent } from "@/lib/content";
const Context = createContext<PublicContent | null>(null);
export const PublicContentProvider = Context.Provider;
export function usePublicContent() {
  const value = useContext(Context);
  if (!value) throw new Error("PublicContentProvider missing");
  return value;
}
export function useSiteSettings() {
  const { settings } = usePublicContent();
  return {
    ...settings,
    hours: { weekdays: settings.weekdays, saturday: settings.saturday },
  };
}
