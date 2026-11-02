"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useSession } from "@/lib/session";

const benefits = [
  "A full sample school, ready to explore",
  "Every module unlocked for one workspace",
  "Your data never leaves this browser",
];

export default function SignUpPage() {
  const router = useRouter();
  const { user, ready, signUp } = useSession();
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!agree) {
      setError("Confirm that you are allowed to create a workspace for this school.");
      return;
    }
    setBusy(true);
    const result = await signUp({ name, email, password, schoolName });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="route-in">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-ink">
        <Sparkles className="h-3 w-3" />
        Administrator workspace
      </span>
      <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-[-0.04em] text-ink">
        Set up your school
      </h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        One workspace, seeded with a realistic school so you can try every screen before entering
        your own records.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3.5" noValidate>
        <Field label="Your full name" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            placeholder="Ngozi Balogun"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field label="School name" htmlFor="school">
          <Input
            id="school"
            placeholder="Greenfield Academy"
            value={schoolName}
            onChange={(event) => setSchoolName(event.target.value)}
            required
          />
        </Field>
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
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Choose a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>

        <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[hsl(var(--brand))]"
          />
          I am authorised to create a workspace for this school and understand this demo stores
          its records in this browser.
        </label>

        {error ? (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[11.5px] font-medium text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Creating workspace" : "Create workspace"}
          {!busy ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </Button>
      </form>

      <ul className="mt-6 space-y-2">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-[11px] text-muted">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="h-2.5 w-2.5" />
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[11px] text-muted">
        Already have a workspace?{" "}
        <Link href="/auth/sign-in" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
