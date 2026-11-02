"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Account, Role } from "./types";
import {
  readAccounts,
  readSession,
  removeWorkspace,
  writeAccounts,
  writeSession,
} from "./storage";
import { nowISO, uid } from "./utils";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  schoolName?: string;
};

type AuthResult = { ok: true } | { ok: false; error: string };

type SessionContextValue = {
  user: SessionUser | null;
  ready: boolean;
  signIn: (input: { email: string; password: string }) => Promise<AuthResult>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    schoolName: string;
  }) => Promise<AuthResult>;
  signInAs: (role: Role) => Promise<AuthResult>;
  signOut: () => void;
  updateName: (name: string) => AuthResult;
  changePassword: (current: string, next: string) => Promise<AuthResult>;
  deleteAccount: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const DEMO_ACCOUNTS: {
  role: Role;
  name: string;
  email: string;
  password: string;
  schoolName: string;
  blurb: string;
}[] = [
  {
    role: "admin",
    name: "Ngozi Balogun",
    email: "admin@eduschol.app",
    password: "demo1234",
    schoolName: "Greenfield Academy",
    blurb: "Full access to records, finance, staff and reports",
  },
  {
    role: "teacher",
    name: "Tunde Bello",
    email: "teacher@eduschol.app",
    password: "demo1234",
    schoolName: "Greenfield Academy",
    blurb: "Classes, attendance, gradebook and lesson tools",
  },
  {
    role: "parent",
    name: "Ngozi Eze",
    email: "parent@eduschol.app",
    password: "demo1234",
    schoolName: "Greenfield Academy",
    blurb: "Two children, fees, results and announcements",
  },
];

async function digest(value: string): Promise<string> {
  const subtle = typeof crypto !== "undefined" ? crypto.subtle : undefined;
  if (!subtle) {
    return `fallback:${btoa(unescape(encodeURIComponent(value)))}`;
  }
  const bytes = new TextEncoder().encode(value);
  const hash = await subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function makeSalt() {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function passwordHash(password: string, salt: string) {
  return digest(`${salt}::${password}`);
}

function toUser(account: Account): SessionUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    createdAt: account.createdAt,
    schoolName: account.schoolName,
  };
}

function startSession(account: Account) {
  writeSession({ userId: account.id, startedAt: nowISO() });
  return toUser(account);
}

function createAccount(input: {
  id: string;
  name: string;
  email: string;
  role: Role;
  salt: string;
  passwordHash: string;
  schoolName?: string;
}) {
  return {
    ...input,
    createdAt: nowISO(),
  } satisfies Account;
}

function findAccountByEmail(email: string) {
  const clean = email.trim().toLowerCase();
  return readAccounts().find((account) => account.email.toLowerCase() === clean);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (session) {
      const account = readAccounts().find((item) => item.id === session.userId);
      if (account) setUser(toUser(account));
      else writeSession(null);
    }
    setReady(true);
  }, []);

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }): Promise<AuthResult> => {
      const account = findAccountByEmail(email);
      if (!account) {
        return { ok: false, error: "No account found for that email on this device." };
      }
      const hash = await passwordHash(password, account.salt);
      if (hash !== account.passwordHash) {
        return { ok: false, error: "That password does not match. Try again." };
      }
      setUser(startSession(account));
      return { ok: true };
    },
    [],
  );

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      schoolName,
    }: {
      name: string;
      email: string;
      password: string;
      schoolName: string;
    }): Promise<AuthResult> => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanSchool = schoolName.trim();
      if (cleanName.length < 2) return { ok: false, error: "Enter your full name." };
      if (cleanSchool.length < 2) return { ok: false, error: "Enter the name of your school." };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: "That email address does not look right." };
      }
      if (password.length < 8) {
        return { ok: false, error: "Use at least 8 characters for your password." };
      }
      if (findAccountByEmail(cleanEmail)) {
        return { ok: false, error: "An account with that email already exists. Sign in instead." };
      }
      const salt = makeSalt();
      const account = createAccount({
        id: uid("usr"),
        name: cleanName,
        email: cleanEmail,
        role: "admin",
        salt,
        passwordHash: await passwordHash(password, salt),
        schoolName: cleanSchool,
      });
      writeAccounts([...readAccounts(), account]);
      setUser(startSession(account));
      return { ok: true };
    },
    [],
  );

  const signInAs = useCallback(async (role: Role): Promise<AuthResult> => {
    const demo = DEMO_ACCOUNTS.find((item) => item.role === role);
    if (!demo) return { ok: false, error: "That demo account is not available." };
    const existing = findAccountByEmail(demo.email);
    if (existing) {
      setUser(startSession(existing));
      return { ok: true };
    }
    const salt = makeSalt();
    const account = createAccount({
      id: role === "admin" ? "usr_admin" : role === "teacher" ? "usr_teacher" : "usr_parent",
      name: demo.name,
      email: demo.email,
      role: demo.role,
      salt,
      passwordHash: await passwordHash(demo.password, salt),
      schoolName: demo.schoolName,
    });
    writeAccounts([...readAccounts(), account]);
    setUser(startSession(account));
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const updateName = useCallback(
    (name: string): AuthResult => {
      const clean = name.trim();
      if (clean.length < 2) return { ok: false, error: "Enter your full name." };
      if (!user) return { ok: false, error: "You are signed out." };
      writeAccounts(
        readAccounts().map((account) =>
          account.id === user.id ? { ...account, name: clean } : account,
        ),
      );
      setUser({ ...user, name: clean });
      return { ok: true };
    },
    [user],
  );

  const changePassword = useCallback(
    async (current: string, next: string): Promise<AuthResult> => {
      if (!user) return { ok: false, error: "You are signed out." };
      if (next.length < 8) return { ok: false, error: "The new password needs 8 characters or more." };
      const accounts = readAccounts();
      const account = accounts.find((item) => item.id === user.id);
      if (!account) return { ok: false, error: "Account not found on this device." };
      const currentHash = await passwordHash(current, account.salt);
      if (currentHash !== account.passwordHash) {
        return { ok: false, error: "The current password is not correct." };
      }
      const salt = makeSalt();
      const nextHash = await passwordHash(next, salt);
      writeAccounts(
        accounts.map((item) =>
          item.id === user.id ? { ...item, salt, passwordHash: nextHash } : item,
        ),
      );
      return { ok: true };
    },
    [user],
  );

  const deleteAccount = useCallback(() => {
    if (!user) return;
    writeAccounts(readAccounts().filter((account) => account.id !== user.id));
    removeWorkspace(user.id);
    writeSession(null);
    setUser(null);
  }, [user]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      ready,
      signIn,
      signUp,
      signInAs,
      signOut,
      updateName,
      changePassword,
      deleteAccount,
    }),
    [user, ready, signIn, signUp, signInAs, signOut, updateName, changePassword, deleteAccount],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
