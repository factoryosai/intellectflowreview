import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — IntellectFlow" },
      { name: "description", content: "Sign in to your IntellectFlow account to manage Google reviews on autopilot." },
      { property: "og:title", content: "Sign in — IntellectFlow" },
      { property: "og:description", content: "Sign in to your IntellectFlow account to manage Google reviews on autopilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function Logo() {
  return (
    <div className="grid place-items-center rounded-[9px] bg-black text-white font-black w-10 h-10" style={{ fontFamily: "var(--font-display)" }}>
      IF
    </div>
  );
}

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/dashboard" });
    });
  }, [nav]);

  const normalizeEmail = () => email.trim().toLowerCase();

  const authMessage = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes("weak") || msg.includes("pwned") || msg.includes("easy to guess")) {
      return "This password is blocked for security. Use a stronger password with 10+ characters, numbers and symbols.";
    }
    if (msg.includes("invalid") || msg.includes("credentials")) {
      return "Wrong email or password. If this account was first created with Google, use 'Reset / set password' below.";
    }
    if (msg.includes("confirm")) {
      return "Please confirm your email first, or use reset password to set a fresh password.";
    }
    if (msg.includes("rate") || msg.includes("too many")) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }
    return message;
  };

  const showAuthError = (message: string) => {
    const clean = authMessage(message);
    setAuthError(clean);
    toast.error(clean);
  };

  const sendPasswordReset = async () => {
    const cleanEmail = normalizeEmail();
    if (!cleanEmail) {
      showAuthError("Enter your email first, then click Reset / set password. If your account was made with Google, use Google sign in instead.");
      return;
    }
    setResetBusy(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password setup link sent. Check your email inbox.");
    } catch (err) {
      showAuthError(err instanceof Error ? err.message : "Could not send password reset email. Try again after a few minutes or use Google sign in.");
    } finally {
      setResetBusy(false);
    }
  };

  const googleAuth = async () => {
    setGoogleBusy(true);
    setAuthError(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth/callback`,
        extraParams: { prompt: "select_account" },
      });

      if (result.error) {
        throw result.error;
      }

      if (result.redirected) return;

      toast.success("Google sign in complete");
      nav({ to: "/auth/callback" });
    } catch (err) {
      showAuthError(err instanceof Error ? err.message : "Google sign in failed. Check that Google OAuth redirect URL is added in your Google Cloud app.");
    } finally {
      setGoogleBusy(false);
    }
  };

  const emailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = normalizeEmail();
    setAuthError(null);
    if (!cleanEmail) {
      showAuthError("Enter your email address first. New users can create an account, existing users should sign in or use Reset / set password.");
      return;
    }
    if (password.length < 8) {
      showAuthError("Use at least 8 characters for your password. If it says the password is blocked, choose a stronger new password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
            // Account exists — try signing in with the same password
            const { error: siErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
            if (siErr) {
              setMode("signin");
              throw new Error("This email already exists. If it was created with Google earlier, use 'Reset / set password' to add email-password login.");
            }
            toast.success("Welcome back!");
            nav({ to: "/dashboard" });
            return;
          }
          throw error;
        }
        if (data.session) {
          toast.success("Account created!");
          nav({ to: "/onboarding" });
        } else {
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
          throw error;
        }
        toast.success("Welcome back!");
        nav({ to: "/dashboard" });
      }
    } catch (err) {
      showAuthError(err instanceof Error ? err.message : "Auth failed. Try Google sign in or reset your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10" style={{ backgroundColor: "#fdf6ef" }}>
      <div className="w-full max-w-[420px]">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <Logo />
          <span className="font-black text-xl tracking-tight">IntellectFlow</span>
        </Link>

        <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6 md:p-7">
          <h1 className="font-black text-2xl text-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-center text-sm text-zinc-500 mt-1">
            {mode === "signin" ? "Sign in to your dashboard" : "Start automating Google reviews"}
          </p>

          {authError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
              <div className="font-extrabold">Login/signup failed</div>
              <div className="mt-1">{authError}</div>
              <div className="mt-2 text-xs text-red-800">
                Next: use Google sign in, or click Reset / set password and choose a strong password with 10+ characters, numbers and symbols.
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={googleAuth}
            disabled={googleBusy || busy}
            className="mt-6 w-full h-11 rounded-lg border border-black/15 bg-white font-extrabold text-sm hover:bg-zinc-50 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full border border-black/10 text-xs font-black">G</span>
            {googleBusy ? "Opening Google…" : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] font-bold uppercase text-zinc-400">
            <div className="h-px flex-1 bg-black/10" />
            or email
            <div className="h-px flex-1 bg-black/10" />
          </div>

          <form onSubmit={emailAuth} className="space-y-3">
            <input
              type="email" required placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-black"
            />
            <input
              type="password" required minLength={8} placeholder="Password (min 8 chars)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full h-11 rounded-lg border border-black/15 px-3 text-sm outline-none focus:border-black"
            />
            <button
              type="submit" disabled={busy}
              className="w-full h-11 rounded-lg bg-black text-white font-bold text-sm hover:bg-zinc-800 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-zinc-500">
            {mode === "signin" ? (
              <div className="space-y-2">
                <div>New to IntellectFlow?{" "}
                  <button className="text-black font-semibold underline" onClick={() => setMode("signup")}>Create an account</button>
                </div>
                <button className="text-black font-semibold underline disabled:opacity-50" onClick={sendPasswordReset} disabled={resetBusy}>
                  {resetBusy ? "Sending…" : "Reset / set password"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div>Already have an account?{" "}
                  <button className="text-black font-semibold underline" onClick={() => setMode("signin")}>Sign in</button>
                </div>
                <button className="text-black font-semibold underline disabled:opacity-50" onClick={sendPasswordReset} disabled={resetBusy}>
                  {resetBusy ? "Sending…" : "Existing Google account? Set password"}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-500 mt-4">
          Google users can sign in directly. Email/password users can reset password if login fails.
        </p>
      </div>
    </div>
  );
}
