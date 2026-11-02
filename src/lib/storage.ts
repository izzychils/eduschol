import type { Account, Session, Workspace } from "./types";

const ROOT = "eduschol.v1";

export const storageKeys = {
  accounts: `${ROOT}.accounts`,
  session: `${ROOT}.session`,
  workspace: (userId: string) => `${ROOT}.workspace.${userId}`,
};

function hasWindow() {
  return typeof window !== "undefined";
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  if (!hasWindow()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string) {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage is unavailable in some private modes */
  }
}

export const readAccounts = () => readJSON<Account[]>(storageKeys.accounts, []);
export const writeAccounts = (accounts: Account[]) => writeJSON(storageKeys.accounts, accounts);

export const readSession = () => readJSON<Session | null>(storageKeys.session, null);
export const writeSession = (session: Session | null) =>
  session ? writeJSON(storageKeys.session, session) : removeKey(storageKeys.session);

export function readWorkspace(userId: string): Workspace | null {
  const workspace = readJSON<Workspace | null>(storageKeys.workspace(userId), null);
  if (!workspace || workspace.version !== 1) return null;
  return workspace;
}

export function writeWorkspace(userId: string, workspace: Workspace) {
  return writeJSON(storageKeys.workspace(userId), workspace);
}

export function removeWorkspace(userId: string) {
  removeKey(storageKeys.workspace(userId));
}
