import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, MessageSquare, DollarSign, TrendingUp, Search, Shield, Gift, QrCode, Star, Package, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — IntellectFlow" },
      { name: "description", content: "Manage users, businesses, subscriptions and standee orders." },
      { property: "og:title", content: "Admin Console — IntellectFlow" },
      { property: "og:description", content: "Manage users, businesses, subscriptions and standee shipments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (role?.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

const PLAN_OPTIONS = ["starter", "growth", "pro", "lifetime"] as const;
const STANDEE_STATUSES = ["pending", "printing", "shipped", "delivered", "cancelled"] as const;

function Admin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sinceFilter, setSinceFilter] = useState<string>("all");
  const [tab, setTab] = useState<"overview" | "users" | "businesses" | "standees" | "reviews">("overview");


  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, biz, reviews, subs, coupons, scans, standees, profs] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("price, status, is_lifetime"),
        supabase.from("coupons").select("used_count"),
        supabase.from("businesses").select("total_scans"),
        supabase.from("standees").select("status"),
        supabase.from("profiles").select("plan, plan_price, lifetime_free, subscription_status, trial_ends_at, last_active_at"),
      ]);
      const activeSubs = (subs.data ?? []).filter((s) => s.status === "active" && !s.is_lifetime);
      const mrr = activeSubs.reduce((s, r) => s + (r.price ?? 0), 0);
      const p = profs.data ?? [];
      const nowMs = Date.now();
      const trialing = p.filter((r) => !r.lifetime_free && r.subscription_status === "trialing" && r.trial_ends_at && new Date(r.trial_ends_at).getTime() > nowMs).length;
      const churned = p.filter((r) => !r.lifetime_free && r.subscription_status === "trialing" && r.trial_ends_at && new Date(r.trial_ends_at).getTime() <= nowMs).length;
      const lifetime = p.filter((r) => r.lifetime_free).length;
      const active30 = p.filter((r) => r.last_active_at && nowMs - new Date(r.last_active_at).getTime() <= 30 * 86400000).length;
      return {
        users: users.count ?? 0,
        biz: biz.count ?? 0,
        reviews: reviews.count ?? 0,
        mrr,
        activeSubs: activeSubs.length,
        trialing,
        churned,
        lifetime,
        active30,
        coupons_used: (coupons.data ?? []).reduce((s, c) => s + (c.used_count ?? 0), 0),
        total_scans: (scans.data ?? []).reduce((s, b) => s + (b.total_scans ?? 0), 0),
        pending_standees: (standees.data ?? []).filter((s) => s.status === "pending" || s.status === "printing").length,
      };

    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users", q, planFilter, statusFilter, sinceFilter],
    enabled: tab === "users",
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, email, business_name, phone, city, plan, plan_price, is_admin, is_founder_free, lifetime_free, subscription_status, trial_ends_at, last_active_at, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (q) query = query.or(`email.ilike.%${q}%,business_name.ilike.%${q}%`);
      if (planFilter !== "all") query = query.eq("plan", planFilter);
      if (statusFilter === "lifetime") query = query.eq("lifetime_free", true);
      else if (statusFilter !== "all") query = query.eq("subscription_status", statusFilter);
      if (sinceFilter !== "all") {
        const days = Number(sinceFilter);
        query = query.gte("created_at", new Date(Date.now() - days * 86400000).toISOString());
      }
      return (await query).data ?? [];
    },
  });


  const { data: businesses } = useQuery({
    queryKey: ["admin-biz", q],
    enabled: tab === "businesses" || tab === "overview",
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select("id, user_id, name, slug, city, address, phone, gmb_link, rating, total_reviews, total_scans, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,city.ilike.%${q}%`);
      return (await query).data ?? [];
    },
  });

  const { data: standees } = useQuery({
    queryKey: ["admin-standees"],
    enabled: tab === "standees" || tab === "overview",
    queryFn: async () => {
      const { data } = await supabase
        .from("standees")
        .select("id, type, status, qr_data, created_at, business_id, businesses(name, address, city, phone, slug, user_id)")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["admin-reviews"],
    enabled: tab === "reviews",
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("id, business_id, customer_name, rating, review_text, status, created_at").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const updateProfile = async (
    id: string,
    patch: { plan?: string; is_founder_free?: boolean; is_admin?: boolean; lifetime_free?: boolean; subscription_status?: string },
  ) => {

    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const updateStandee = async (id: string, status: string) => {
    const { error } = await supabase.from("standees").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-standees"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold bg-black text-white px-2.5 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5" /> ADMIN
        </div>
        <h1 className="font-black text-2xl md:text-3xl mt-2">Platform Console</h1>
        <p className="text-sm text-zinc-500">Manage users, businesses, subscriptions and standee shipments.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users} label="Users" value={stats?.users ?? 0} tint="bg-blue-50 text-blue-700" />
        <Stat icon={Building2} label="Businesses" value={stats?.biz ?? 0} tint="bg-emerald-50 text-emerald-700" />
        <Stat icon={MessageSquare} label="Reviews" value={stats?.reviews ?? 0} tint="bg-amber-50 text-amber-700" />
        <Stat icon={DollarSign} label="MRR (₹)" value={stats?.mrr ?? 0} tint="bg-fuchsia-50 text-fuchsia-700" />
        <Stat icon={TrendingUp} label="Active Subs" value={stats?.activeSubs ?? 0} tint="bg-sky-50 text-sky-700" />
        <Stat icon={QrCode} label="QR Scans" value={stats?.total_scans ?? 0} tint="bg-indigo-50 text-indigo-700" />
        <Stat icon={Gift} label="Coupons Used" value={stats?.coupons_used ?? 0} tint="bg-rose-50 text-rose-700" />
        <Stat icon={Package} label="Standees pending" value={stats?.pending_standees ?? 0} tint="bg-orange-50 text-orange-700" />
      </div>

      <div className="bg-white border border-black/10 rounded-2xl">
        <div className="flex items-center justify-between border-b border-black/5 p-2 gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {(["overview", "users", "businesses", "standees", "reviews"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide",
                  tab === t ? "bg-black text-white" : "text-zinc-600 hover:bg-zinc-100",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
          {(tab === "users" || tab === "businesses") && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 h-9 rounded-lg border border-black/10 text-sm w-56"
              />
            </div>
          )}
        </div>

        {tab === "overview" && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="font-bold text-sm mb-2">Recent businesses</h3>
              <BizTable rows={businesses ?? []} />
            </div>
            <div>
              <h3 className="font-bold text-sm mb-2">Standees needing action</h3>
              <StandeeTable
                rows={(standees ?? []).filter((s) => s.status === "pending" || s.status === "printing")}
                onStatus={updateStandee}
              />
            </div>
          </div>
        )}

        {tab === "businesses" && <BizTable rows={businesses ?? []} />}

        {tab === "standees" && (
          <div className="p-2">
            <StandeeTable rows={standees ?? []} onStatus={updateStandee} />
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Business</th>
                  <th className="text-left p-3">City</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Lifetime Free</th>
                  <th className="text-left p-3">Admin</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((u) => (
                  <tr key={u.id} className="border-t border-black/5">
                    <td className="p-3 font-semibold truncate max-w-[240px]">{u.email}</td>
                    <td className="p-3">{u.business_name ?? "—"}</td>
                    <td className="p-3">{u.city ?? "—"}</td>
                    <td className="p-3">
                      <select
                        value={u.plan ?? "starter"}
                        onChange={(e) => updateProfile(u.id, { plan: e.target.value })}
                        className="h-8 rounded-md border border-black/10 px-1.5 text-xs font-semibold bg-white"
                      >
                        {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => updateProfile(u.id, { is_founder_free: !u.is_founder_free })}
                        className={[
                          "text-[11px] font-bold px-2 py-1 rounded",
                          u.is_founder_free ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        {u.is_founder_free ? "FREE ✓" : "Grant free"}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => updateProfile(u.id, { is_admin: !u.is_admin })}
                        className={[
                          "text-[11px] font-bold px-2 py-1 rounded",
                          u.is_admin ? "bg-black text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        {u.is_admin ? "Admin ✓" : "Make admin"}
                      </button>
                    </td>
                    <td className="p-3 text-xs text-zinc-500">{new Date(u.created_at ?? 0).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(users ?? []).length === 0 && (
                  <tr><td colSpan={7} className="p-6 text-center text-sm text-zinc-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "reviews" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Text</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">When</th>
                </tr>
              </thead>
              <tbody>
                {(reviews ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-black/5">
                    <td className="p-3 font-semibold">{r.customer_name || "Anonymous"}</td>
                    <td className="p-3"><span className="inline-flex items-center gap-1 font-bold"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{r.rating}</span></td>
                    <td className="p-3 max-w-[380px] truncate text-zinc-600">{r.review_text || "—"}</td>
                    <td className="p-3"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700">{r.status}</span></td>
                    <td className="p-3 text-xs text-zinc-500">{new Date(r.created_at ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
                {(reviews ?? []).length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-sm text-zinc-500">No reviews yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type StandeeRow = {
  id: string;
  type: string;
  status: string | null;
  qr_data: string | null;
  created_at: string | null;
  business_id: string;
  businesses: { name: string; address: string | null; city: string | null; phone: string | null; slug: string; user_id: string } | null;
};

function StandeeTable({ rows, onStatus }: { rows: StandeeRow[]; onStatus: (id: string, status: string) => void }) {
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="text-left p-3">Business</th>
            <th className="text-left p-3">Type</th>
            <th className="text-left p-3">Ship to</th>
            <th className="text-left p-3">Phone</th>
            <th className="text-left p-3">QR link</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Ordered</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} className="border-t border-black/5 align-top">
              <td className="p-3">
                <div className="font-semibold">{s.businesses?.name ?? "—"}</div>
                <div className="text-[11px] text-zinc-500 font-mono">/r/{s.businesses?.slug}</div>
              </td>
              <td className="p-3 whitespace-nowrap">{s.type}</td>
              <td className="p-3 max-w-[280px]">
                <div className="text-zinc-700">{s.businesses?.address ?? <span className="text-orange-600">No address on file</span>}</div>
                <div className="text-xs text-zinc-500">{s.businesses?.city ?? ""}</div>
              </td>
              <td className="p-3">
                {s.businesses?.phone ? (
                  <button onClick={() => s.businesses?.phone && copy(s.businesses.phone)} className="inline-flex items-center gap-1 text-xs font-semibold hover:text-black">
                    {s.businesses.phone}<Copy className="w-3 h-3" />
                  </button>
                ) : <span className="text-xs text-zinc-400">—</span>}
              </td>
              <td className="p-3">
                {s.qr_data ? (
                  <a href={s.qr_data} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:underline max-w-[180px] truncate">
                    <ExternalLink className="w-3 h-3 shrink-0" />{s.qr_data}
                  </a>
                ) : "—"}
              </td>
              <td className="p-3">
                <select
                  value={s.status ?? "pending"}
                  onChange={(e) => onStatus(s.id, e.target.value)}
                  className={[
                    "h-8 rounded-md px-1.5 text-xs font-bold border",
                    s.status === "delivered" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    s.status === "shipped" ? "bg-blue-50 border-blue-200 text-blue-700" :
                    s.status === "printing" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    s.status === "cancelled" ? "bg-zinc-100 border-zinc-200 text-zinc-500" :
                    "bg-orange-50 border-orange-200 text-orange-700",
                  ].join(" ")}
                >
                  {STANDEE_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </td>
              <td className="p-3 text-xs text-zinc-500 whitespace-nowrap">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="p-6 text-center text-sm text-zinc-500">No standee orders.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BizTable({ rows }: { rows: Array<{ id: string; name: string; slug: string; city: string | null; address?: string | null; phone?: string | null; gmb_link?: string | null; rating: number | null; total_reviews: number | null; total_scans: number | null; created_at: string | null }> }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="text-left p-3">Business</th>
            <th className="text-left p-3">Address</th>
            <th className="text-left p-3">Phone</th>
            <th className="text-left p-3">Review page</th>
            <th className="text-left p-3">Google</th>
            <th className="text-left p-3">Reviews</th>
            <th className="text-left p-3">Rating</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-black/5 align-top">
              <td className="p-3">
                <div className="font-semibold">{b.name}</div>
                <div className="text-[11px] font-mono text-zinc-500">/r/{b.slug}</div>
              </td>
              <td className="p-3 max-w-[240px]">
                <div className="text-zinc-700">{b.address ?? "—"}</div>
                <div className="text-xs text-zinc-500">{b.city ?? ""}</div>
              </td>
              <td className="p-3 whitespace-nowrap">{b.phone ?? "—"}</td>
              <td className="p-3">
                <a href={`${origin}/r/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">Open <ExternalLink className="w-3 h-3" /></a>
              </td>
              <td className="p-3">
                {b.gmb_link ? <a href={b.gmb_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">GMB <ExternalLink className="w-3 h-3" /></a> : "—"}
              </td>
              <td className="p-3">{b.total_reviews ?? 0}</td>
              <td className="p-3">{b.rating ?? "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="p-6 text-center text-sm text-zinc-500">No businesses yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: React.ElementType; label: string; value: number; tint: string }) {
  return (
    <div className="bg-white border border-black/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-semibold">{label}</span>
        <span className={["w-7 h-7 rounded-lg grid place-items-center", tint].join(" ")}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="mt-2 font-black text-2xl">{value.toLocaleString()}</div>
    </div>
  );
}
