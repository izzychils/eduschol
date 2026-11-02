"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Workspace } from "./types";
import { readWorkspace, writeWorkspace } from "./storage";
import { createSeedWorkspace } from "./seed";
import { useSession } from "./session";

type StoreContextValue = {
  workspace: Workspace | null;
  ready: boolean;
  update: (recipe: (current: Workspace) => Workspace) => void;
  reset: () => void;
  exportedAt: string | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [ready, setReady] = useState(false);
  const [exportedAt, setExportedAt] = useState<string | null>(null);
  const ref = useRef<Workspace | null>(null);

  useEffect(() => {
    if (!user) {
      ref.current = null;
      setWorkspace(null);
      setReady(false);
      return;
    }

    const existing = readWorkspace(user.id);
    if (existing) {
      ref.current = existing;
      setWorkspace(existing);
      setReady(true);
      return;
    }

    const seeded = createSeedWorkspace({
      role: user.role,
      name: user.name,
      email: user.email,
    });
    if (user.schoolName) seeded.school.name = user.schoolName;
    writeWorkspace(user.id, seeded);
    ref.current = seeded;
    setWorkspace(seeded);
    setReady(true);
  }, [user]);

  const update = useCallback(
    (recipe: (current: Workspace) => Workspace) => {
      const current = ref.current;
      if (!current || !user) return;
      const next = recipe(current);
      if (!next || next === current) return;
      ref.current = next;
      setWorkspace(next);
      writeWorkspace(user.id, next);
    },
    [user],
  );

  const reset = useCallback(() => {
    if (!user) return;
    const seeded = createSeedWorkspace({ role: user.role, name: user.name, email: user.email });
    if (user.schoolName) seeded.school.name = user.schoolName;
    writeWorkspace(user.id, seeded);
    ref.current = seeded;
    setWorkspace(seeded);
    setExportedAt(new Date().toISOString());
  }, [user]);

  const value = useMemo<StoreContextValue>(
    () => ({ workspace, ready, update, reset, exportedAt }),
    [workspace, ready, update, reset, exportedAt],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useSchool() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useSchool must be used inside StoreProvider");
  return context;
}
