"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import logo from "@/assets/logo.png";
import { createFirstAdmin } from "./actions";

export function SetupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createFirstAdmin({ name, email, password });

      if (result.error) {
        setError(result.error);
        return;
      }

      // Admin created, now sign in
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/admin",
      });

      if (signInError) {
        setDone(true);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div data-theme="dashboard" className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center">
          <Image src={logo} alt="Lighthouse" priority className="mx-auto h-10 w-auto" />
          <h1 className="mt-8 font-heading text-2xl font-bold tracking-tight text-foreground">
            Admin created
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your admin account is ready. You can now sign in.
          </p>
          <Button
            className="mt-6 bg-[#2a1b45] text-white hover:bg-[#2a1b45]/90"
            onClick={() => router.push("/admin/login")}
          >
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="dashboard" className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src={logo} alt="Lighthouse" priority className="mx-auto h-10 w-auto" />
          <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
            Create admin account
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            This is a one-time setup. Once created, this page will no longer be accessible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Admin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@lighthouse.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <InputGroup className="h-11">
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading}
                minLength={8}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/4 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-[#2a1b45] text-sm font-semibold text-white transition-all hover:bg-[#2a1b45]/90 hover:shadow-lg hover:shadow-[#2a1b45]/20 active:scale-[0.98]"
            disabled={loading || !name || !email || password.length < 8}
          >
            {loading ? "Creating account..." : "Create admin account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
