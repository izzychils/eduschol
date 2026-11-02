"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Loader2, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useSession } from "@/lib/session";
import { useSchool } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const demos: { role: Role; icon: typeof ShieldCheck; title: string; copy: string }[] = [
  {
    role: "admin",
    icon: ShieldCheck,
    title: "Administrator",
    copy: "Every record, the ledger and leadership analytics",
  },
  {
    role: "teacher",
    icon: GraduationCap,
    title: "Teacher",
    copy: "Classes, register, gradebook and exam builder",
  },
  {
    role: "parent",
    icon: Users,
    title: "Parent",
    copy: "Two children, fees balance and published results",
  },
];

export default function SignInPage() {
  const router = useRouter();
  const { user, ready, signIn, signInAs } = useSession();
  const { ready: storeReady } = useSchool();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState<Role | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  useEffect(() => {
    if (user && storeReady) router.replace("/dashboard");
  }, [user, storeReady, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await signIn({ email, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  async function demo(role: Role) {
    setError("");
    setDemoBusy(role);
    const result = await signInAs(role);
    setDemoBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="route-in">
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-ink">
        Sign in to Eduschol
      </h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        Pick up where your school left off.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-3.5" noValidate>
        <Field label="School email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@school.edu.ng"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>

        {error ? (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[11.5px] font-medium text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Signing in" : "Sign in"}
          {!busy ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Or open a demo role
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-2">
        {demos.map((demoAccount) => (
          <button
            key={demoAccount.role}
            type="button"
            onClick={() => demo(demoAccount.role)}
            disabled={demoBusy !== null}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition-all duration-200",
              "hover:-translate-y-px hover:border-brand/30 hover:bg-brand-soft/30",
              demoBusy === demoAccount.role && "border-brand/40 bg-brand-soft/40",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <demoAccount.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-bold text-ink">{demoAccount.title}</span>
              <span className="block truncate text-[10.5px] text-muted">{demoAccount.copy}</span>
            </span>
            {demoBusy === demoAccount.role ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
            )}
          </button>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-[11px] text-muted">
        <BriefcaseBusiness className="h-3 w-3" />
        New here?
        <Link href="/auth/sign-up" className="font-semibold text-brand hover:underline">
          Create a school workspace
        </Link>
      </p>
    </div>
  );
}
