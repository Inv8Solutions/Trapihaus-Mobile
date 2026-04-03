import {
    getSavedListings,
    isListingSaved,
    removeListing,
    saveListing,
    toggleListing,
} from "@/utils/saved-cache";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

type SavedContextType = {
  items: any[];
  map: Record<string, boolean>;
  add: (item: any) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (item: any) => Promise<boolean>;
  refresh: () => Promise<void>;
  isSaved: (id: string) => Promise<boolean>;
};

const SavedContext = createContext<SavedContextType | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<any[]>([]);
  const [map, setMap] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const rows = await getSavedListings();
    setItems(rows);
    const m: Record<string, boolean> = {};
    rows.forEach((r: any) => (m[String(r.id)] = true));
    setMap(m);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (item: any) => {
      await saveListing(item);
      await load();
    },
    [load],
  );

  const remove = useCallback(
    async (id: string) => {
      await removeListing(id);
      await load();
    },
    [load],
  );

  const toggle = useCallback(
    async (item: any) => {
      const res = await toggleListing(item);
      await load();
      return res;
    },
    [load],
  );

  const isSaved = useCallback(async (id: string) => {
    return await isListingSaved(id);
  }, []);

  return (
    <SavedContext.Provider
      value={{ items, map, add, remove, toggle, refresh: load, isSaved }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
