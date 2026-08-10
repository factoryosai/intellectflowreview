import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, MessageSquare, Sparkles, TrendingUp, Gift, MessageCircle, Users, Image, QrCode, Settings, CreditCard, Shield, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  ),
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/ai-reply", label: "AI Reply", icon: Sparkles },
  { to: "/gmb", label: "GMB Posts", icon: TrendingUp },
  { to: "/coupons", label: "Coupons", icon: Gift },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/competitors", label: "Competitors", icon: Users },
  { to: "/standees", label: "Standees", icon: Image },
  { to: "/qr", label: "QR & Page", icon: QrCode },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/billing", label: "Billing", icon: CreditCard },
];

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => setIsAdmin(!error && data?.role === "admin"));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#fdf6ef" }}>
      {/* Sidebar */}
      <aside className={[
        "fixed md:sticky md:top-0 md:h-screen top-0 left-0 z-40 h-full w-64 bg-white border-r border-black/10 transition-transform",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}>
        <div className="p-4 flex items-center justify-between border-b border-black/5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid place-items-center rounded-[7px] bg-black text-white font-black w-8 h-8 text-sm" style={{ fontFamily: "var(--font-display)" }}>IF</div>
            <span className="font-black tracking-tight">IntellectFlow</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden p-1"><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-2 space-y-0.5 overflow-y-auto h-[calc(100vh-64px)]">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition",
                  active ? "bg-black text-white" : "text-zinc-700 hover:bg-zinc-100",
                ].join(" ")}
              >
                <n.icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition mt-2",
                pathname === "/admin" ? "bg-black text-white" : "text-zinc-700 hover:bg-zinc-100",
              ].join(" ")}>
              <Shield className="w-4 h-4" /> Admin
            </Link>
          )}
          <div className="border-t border-black/5 mt-3 pt-3 px-1">
            <div className="text-[11px] text-zinc-500 px-2 truncate">{user?.email}</div>
            <button
              onClick={handleSignOut}
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-black/5 h-14 flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="md:hidden p-1"><Menu className="w-5 h-5" /></button>
          <div className="text-sm font-semibold text-zinc-500">IntellectFlow Console</div>
        </header>
        <main className="p-4 md:p-6 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
