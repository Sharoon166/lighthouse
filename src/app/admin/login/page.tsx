"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
import logo from "@/assets/logo-dark.png";

function FloatingOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl ${className}`}
    />
  );
}

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: redirectTo,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-theme="dashboard" className="flex min-h-dvh bg-background p-6">
      {/* ── Left: Brand panel ── */}
      <div className="relative hidden overflow-hidden bg-[#2a1b45] lg:flex lg:w-[45%] rounded-md">
        {/* Decorative orbs */}
        <FloatingOrb className="left-[-10%] top-[-10%] size-125 bg-[#702f5c]/30" />
        <FloatingOrb className="bottom-[-15%] right-[-5%] size-100 bg-[#702f5c]/20" />
        <FloatingOrb className="left-[20%] top-[40%] size-75 bg-gold/10" />


        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
          <Image
            src={logo}
            alt="Lighthouse"
            priority
            className="w-40 brightness-0 invert"
          />

          <div>
            <h2 className="font-heading font-bold leading-tight tracking-tight text-white">
              Illuminate
              <br />
              your vision.
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-white/50">
              Manage your product catalog, projects, and content from one
              place. The Lighthouse admin dashboard gives you full control
              over your lighting showroom.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/30">
            <span className="inline-block size-1.5 rounded-full bg-gold" />
            Secure admin access
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Image
              src={logo}
              alt="Lighthouse"
              priority
              className="h-9 w-auto"
            />
          </div>

          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={`transition-colors ${focused === "email" ? "text-foreground" : ""}`}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@lighthouse.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                autoComplete="email"
                disabled={loading}
                className="h-11 transition-shadow focus-visible:shadow-[0_0_0_3px_rgba(42,27,69,0.08)]"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`transition-colors ${focused === "password" ? "text-foreground" : ""}`}
              >
                Password
              </Label>
              <InputGroup className="h-11">
                <InputGroupInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
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
              className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="size-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Contact your team lead if you need access.
          </p>
        </div>
      </div>
    </div>
  );
}
