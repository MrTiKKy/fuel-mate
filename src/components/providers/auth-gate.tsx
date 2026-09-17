"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { LoaderCircle, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import {
  collectLocalMigratePayload,
  isMigrationCompleted,
  markMigrationCompleted,
} from "@/features/auth/local-migrate";
import { hydrateIndexedDbFromCloud } from "@/lib/cloud/hydrate-local";
import { fetchCloudSnapshot } from "@/lib/cloud/client-snapshot";

type AuthGateProps = {
  children: React.ReactNode;
};

type Phase =
  | "loading"
  | "auth"
  | "conflict"
  | "migrating"
  | "ready"
  | "error";

export function AuthGate({ children }: AuthGateProps) {
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState<Phase>("loading");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("Preparing…");
  const [localCount, setLocalCount] = useState(0);
  const [cloudCount, setCloudCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "loading") {
      setPhase("loading");
      return;
    }
    if (status === "unauthenticated") {
      setPhase("auth");
      return;
    }
    if (!userId) {
      setPhase("auth");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        if (isMigrationCompleted(userId)) {
          setProgress("Syncing from Neon…");
          const snapshot = await fetchCloudSnapshot(true);
          await hydrateIndexedDbFromCloud(snapshot);
          if (!cancelled) setPhase("ready");
          return;
        }

        setProgress("Checking local data…");
        const local = await collectLocalMigratePayload();
        if (cancelled) return;

        const cloudRes = await fetch("/api/migrate");
        if (!cloudRes.ok) {
          throw new Error("Could not read cloud summary");
        }
        const cloudJson = (await cloudRes.json()) as {
          summary: {
            cars: number;
            fuelEntries: number;
            serviceRecords: number;
            documents: number;
            savedCalculations: number;
          };
        };
        const cloudTotal =
          cloudJson.summary.cars +
          cloudJson.summary.fuelEntries +
          cloudJson.summary.serviceRecords +
          cloudJson.summary.documents +
          cloudJson.summary.savedCalculations;

        setLocalCount(local.localCount);
        setCloudCount(cloudTotal);

        if (local.localCount === 0) {
          markMigrationCompleted(userId, new Date().toISOString());
          const snapshot = await fetchCloudSnapshot(true);
          await hydrateIndexedDbFromCloud(snapshot);
          if (!cancelled) setPhase("ready");
          return;
        }

        if (cloudTotal > 0) {
          if (!cancelled) setPhase("conflict");
          return;
        }

        if (!cancelled) {
          setPhase("migrating");
          await runMigrate("merge", userId, setProgress);
          const snapshot = await fetchCloudSnapshot(true);
          await hydrateIndexedDbFromCloud(snapshot);
          setPhase("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Setup failed");
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, userId]);

  const title = useMemo(() => {
    if (mode === "signup") return "Fă-ți un cont";
    return "Autentificare";
  }, [mode]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        name,
        mode,
        redirect: false,
      });
      if (result?.error) {
        setError(
          mode === "signup"
            ? "Nu am putut crea contul. Email deja folosit?"
            : "Email sau parolă greșită.",
        );
        return;
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "ready") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-sm font-bold text-primary">
            G+
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">
              Cont necesar pentru datele din cloud
            </p>
          </div>
        </div>

        {phase === "loading" || status === "loading" ? (
          <StatusBlock
            icon={<LoaderCircle className="size-5 animate-spin" />}
            title="Se încarcă…"
            description="Verificăm sesiunea."
          />
        ) : null}

        {phase === "auth" ? (
          <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                După login, datele locale se mută în Neon pe contul tău.
              </p>
            </div>

            {mode === "signup" ? (
              <Field label="Nume">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-2xl"
                  placeholder="Andi"
                />
              </Field>
            ) : null}

            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-2xl"
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </Field>

            <Field label="Parolă">
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-2xl"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </Field>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full rounded-2xl"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              {mode === "signup" ? "Creează cont" : "Intră în cont"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => {
                setMode((m) => (m === "login" ? "signup" : "login"));
                setError(null);
              }}
            >
              {mode === "signup"
                ? "Ai deja cont? Autentifică-te"
                : "Nu ai cont? Înregistrează-te"}
            </button>
          </form>
        ) : null}

        {phase === "conflict" && userId ? (
          <div className="space-y-4">
            <StatusBlock
              icon={<Sparkles className="size-5 text-primary" />}
              title="Date pe acest device și în cloud"
              description={`Local: ${localCount} · Cloud: ${cloudCount}. Alege cum unim.`}
            />
            <Button
              className="h-11 w-full rounded-2xl"
              onClick={() =>
                void (async () => {
                  try {
                    setPhase("migrating");
                    await runMigrate("merge", userId, setProgress);
                    await hydrateIndexedDbFromCloud();
                    setPhase("ready");
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Migration failed",
                    );
                    setPhase("error");
                  }
                })()
              }
            >
              Unește (idempotent)
            </Button>
            <Button
              variant="secondary"
              className="h-11 w-full rounded-2xl"
              onClick={() =>
                void (async () => {
                  try {
                    setPhase("migrating");
                    await runMigrate("cloud", userId, setProgress);
                    await hydrateIndexedDbFromCloud();
                    setPhase("ready");
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Migration failed",
                    );
                    setPhase("error");
                  }
                })()
              }
            >
              Folosește cloud (păstrează existente)
            </Button>
            <Button
              variant="outline"
              className="h-11 w-full rounded-2xl"
              onClick={() =>
                void (async () => {
                  try {
                    setPhase("migrating");
                    await runMigrate("local", userId, setProgress);
                    await hydrateIndexedDbFromCloud();
                    setPhase("ready");
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Migration failed",
                    );
                    setPhase("error");
                  }
                })()
              }
            >
              Folosește local (suprascrie câmpurile)
            </Button>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              IndexedDB nu se șterge. La conflict pe același id, strategia cloud
              sare rândurile existente; local/merge actualizează rândurile
              tale.
            </p>
          </div>
        ) : null}

        {phase === "migrating" ? (
          <StatusBlock
            icon={<LoaderCircle className="size-5 animate-spin text-primary" />}
            title="Migrare către Neon…"
            description={progress}
          />
        ) : null}

        {phase === "error" ? (
          <div className="space-y-4">
            <StatusBlock
              icon={<Lock className="size-5 text-destructive" />}
              title="Ceva nu a mers"
              description={error ?? "Încearcă din nou."}
            />
            <Button
              className="h-11 w-full rounded-2xl"
              onClick={() => window.location.reload()}
            >
              Reîncearcă
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

async function runMigrate(
  strategy: "merge" | "cloud" | "local",
  userId: string,
  setProgress: (value: string) => void,
) {
  setProgress("Collecting IndexedDB…");
  const local = await collectLocalMigratePayload();
  setProgress("Uploading to Neon…");
  const res = await fetch("/api/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy,
      cars: local.cars,
      fuelEntries: local.fuelEntries,
      serviceRecords: local.serviceRecords,
      documents: local.documents,
      documentFiles: local.documentFiles,
      savedCalculations: local.savedCalculations,
      settings: local.settings,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Migration request failed");
  }
  const result = (await res.json()) as { migratedAt: string };
  markMigrationCompleted(userId, result.migratedAt);
  setProgress("Done");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatusBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-muted/30 p-5")}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-muted-foreground">{icon}</span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
