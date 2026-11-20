"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag, Star, Mail, Globe, LogOut, TrendingUp, FileText, Sun, Moon, Tag, ChevronLeft, ChevronRight, GripVertical, type LucideIcon } from "lucide-react";
import type { Beat } from "@/lib/types";
import type { Testimonial, Message, Subscriber, Order, HomepageContent, StatItem, ProductionVideo, ShopifyConfig } from "@/lib/beats-store";


// ── Country helpers ──────────────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  US:"United States",GB:"United Kingdom",CA:"Canada",MX:"Mexico",PR:"Puerto Rico",
  DO:"Dominican Republic",JM:"Jamaica",TT:"Trinidad & Tobago",BB:"Barbados",
  BR:"Brazil",CO:"Colombia",VE:"Venezuela",AR:"Argentina",CL:"Chile",PE:"Peru",
  NG:"Nigeria",GH:"Ghana",ZA:"South Africa",KE:"Kenya",SN:"Senegal",
  FR:"France",DE:"Germany",ES:"Spain",IT:"Italy",NL:"Netherlands",SE:"Sweden",
  AU:"Australia",NZ:"New Zealand",JP:"Japan",KR:"South Korea",IN:"India",
  AE:"UAE",SA:"Saudi Arabia",Unknown:"Unknown",
};
function countryFlag(code: string) {
  if (code === "Unknown") return "🌐";
  try { return String.fromCodePoint(...code.split("").map((c) => 0x1F1E0 + c.charCodeAt(0) - 65)); }
  catch { return "🌐"; }
}
function countryName(code: string) { return COUNTRY_NAMES[code] ?? code; }

// ── CSV export ────────────────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BLANK_ORDER: { type:"beat"|"service"|"drumkit";itemId:string;itemTitle:string;licenseType:string;customerEmail:string;customerName:string;amount:string;status:"pending"|"completed"|"refunded";notes:string } = { type:"beat",itemId:"",itemTitle:"",licenseType:"",customerEmail:"",customerName:"",amount:"",status:"completed",notes:"" };

const TABS = ["Overview","Orders","Add Artist Testimonial","Messages","Subscribers","Merch","Homepage"] as const;
type Tab = typeof TABS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TAB_ICONS: Record<Tab, any> = {
  Overview: TrendingUp, Orders: ShoppingBag,
  "Add Artist Testimonial": Star, Messages: Mail, Subscribers: FileText, Merch: Tag, Homepage: Globe,
};

// ── Design tokens ─────────────────────────────────────────────────────────────

const GOLD        = "#C9A84C";
const GOLD_DIM    = "rgba(201,168,76,0.10)";
const GOLD_BORDER = "rgba(201,168,76,0.28)";
const GOLD_GLOW   = "rgba(201,168,76,0.18)";

// These reference CSS custom properties set on the root wrapper so both themes work automatically
const BG_CARD       = "var(--adm-card)";
const BG_INPUT      = "var(--adm-input)";
const BG_DEEP       = "var(--adm-deep)";
const BORDER_SUBTLE = "var(--adm-border)";
const BORDER_MID    = "var(--adm-border-mid)";
const TEXT_MUTED    = "var(--adm-muted)";
const TEXT_DIM      = "var(--adm-dim)";

const THEMES = {
  dark: {
    deep: "#14141c", card: "#1c1c26", input: "#22222e",
    border: "#2c2c3a", borderMid: "#36364a",
    muted: "#5e5e74", dim: "#8e8ea6",
    sidebarBg: "rgba(16,16,22,0.98)", topBg: "rgba(16,16,22,0.94)",
    orb1: "rgba(201,168,76,0.08)", orb2: "rgba(201,168,76,0.06)", orb3: "rgba(201,168,76,0.03)",
  },
  light: {
    deep: "#f0f0f7", card: "#ffffff", input: "#f4f4fb",
    border: "#dcdce8", borderMid: "#c8c8d8",
    muted: "#9090a4", dim: "#565668",
    sidebarBg: "rgba(255,255,255,0.98)", topBg: "rgba(248,248,254,0.96)",
    orb1: "rgba(201,168,76,0.10)", orb2: "rgba(201,168,76,0.07)", orb3: "rgba(201,168,76,0.04)",
  },
} as const;

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: TEXT_DIM }}>
        <span style={{ color: GOLD, fontSize: 10 }}>▶</span>{label}
      </label>
      <input {...props}
        className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all"
        style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}` }}
        onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD_GLOW}, inset 0 1px 0 rgba(201,168,76,0.06)`; }}
        onBlur={e => { e.target.style.borderColor = BORDER_SUBTLE; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: TEXT_DIM }}>
        <span style={{ color: GOLD, fontSize: 10 }}>▶</span>{label}
      </label>
      <textarea {...props}
        className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none resize-none transition-all"
        style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}` }}
        onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD_GLOW}, inset 0 1px 0 rgba(201,168,76,0.06)`; }}
        onBlur={e => { e.target.style.borderColor = BORDER_SUBTLE; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Sel({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: TEXT_DIM }}>
        <span style={{ color: GOLD, fontSize: 10 }}>▶</span>{label}
      </label>
      <select {...props} className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all"
        style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}` }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, className = "", accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-5 relative overflow-hidden ${className}`}
      style={{ background: BG_CARD, border: `1px solid ${accent ? GOLD_BORDER : BORDER_SUBTLE}`, boxShadow: accent ? `0 0 40px rgba(201,168,76,0.04)` : "none" }}>
      {accent && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />}
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon?: LucideIcon }) {
  return (
    <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: BG_DEEP, border: `1px solid ${BORDER_SUBTLE}` }}>
      {/* top laser line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${GOLD} 50%,transparent)` }} />
      {/* corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3" style={{ borderTop: `1.5px solid ${GOLD}`, borderLeft: `1.5px solid ${GOLD}`, opacity: 0.5 }} />
      <div className="absolute top-0 right-0 w-3 h-3" style={{ borderTop: `1.5px solid ${GOLD}`, borderRight: `1.5px solid ${GOLD}`, opacity: 0.5 }} />
      <div className="absolute bottom-0 left-0 w-3 h-3" style={{ borderBottom: `1.5px solid ${GOLD}`, borderLeft: `1.5px solid ${GOLD}`, opacity: 0.5 }} />
      <div className="absolute bottom-0 right-0 w-3 h-3" style={{ borderBottom: `1.5px solid ${GOLD}`, borderRight: `1.5px solid ${GOLD}`, opacity: 0.5 }} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.22em] mb-3 uppercase" style={{ color: TEXT_MUTED }}>{label}</p>
          <p className="text-3xl font-black text-white leading-none" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</p>
          {sub && <p className="text-xs mt-2 font-semibold tracking-wide" style={{ color: GOLD }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.14),rgba(201,168,76,0.04))`, border: `1px solid ${GOLD_BORDER}`, boxShadow: `inset 0 1px 0 rgba(201,168,76,0.1)` }}>
            <Icon size={16} style={{ color: GOLD }} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-black tracking-[0.3em] uppercase flex-shrink-0" style={{ color: GOLD }}>{"//"}</span>
        <h2 className="text-sm font-black text-white tracking-wide truncate">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function GoldBtn({ onClick, children, small = false }: { onClick?: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={`${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} rounded-lg font-bold whitespace-nowrap transition-all`}
      style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 16px ${GOLD_GLOW}`; e.currentTarget.style.background = "rgba(201,168,76,0.16)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = GOLD_DIM; }}>
      {children}
    </button>
  );
}

function GoldSubmit({ saving, label, savingLabel }: { saving: boolean; label: string; savingLabel?: string }) {
  return (
    <button type="submit" disabled={saving}
      className="px-7 py-3 rounded-lg font-black text-sm text-black disabled:opacity-40 transition-all tracking-wide"
      style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: saving ? "none" : `0 0 24px rgba(201,168,76,0.35), 0 4px 16px rgba(0,0,0,0.4)` }}>
      {saving ? (savingLabel ?? "Saving…") : `${label} →`}
    </button>
  );
}

function Badge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return <span className="text-xs px-2 py-0.5 rounded font-black tracking-wide" style={{ background: bg, color }}>{children}</span>;
}

function FormSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl space-y-4 overflow-hidden"
      style={{ background: BG_CARD, border: `1px solid ${GOLD_BORDER}`, boxShadow: `0 0 50px rgba(201,168,76,0.04)` }}>
      {title && (
        <div className="px-6 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${BORDER_MID}`, background: `linear-gradient(90deg,rgba(201,168,76,0.06),transparent)` }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-[0.3em]" style={{ color: GOLD }}>{"//"}</span>
            <h2 className="text-sm font-black tracking-widest uppercase" style={{ color: GOLD }}>{title}</h2>
          </div>
        </div>
      )}
      <div className={`${title ? "px-6 pb-6" : "p-6 md:p-8"} space-y-4`}>{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]       = useState(false);
  const [password, setPassword]   = useState("");
  const [authErr, setAuthErr]     = useState("");
  const [tab, setTab]             = useState<Tab>("Overview");

  // Auth gate mode — login (default), first-run setup, forgot-password, or reset-with-token
  const [authMode, setAuthMode]   = useState<"login" | "setup" | "forgot" | "reset">("login");
  const [email, setEmail]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [authBusy, setAuthBusy]   = useState(false);

  // Core data
  const [beats, setBeats]               = useState<Beat[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [subscribers, setSubscribers]   = useState<Subscriber[]>([]);
  const [analytics, setAnalytics]       = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [settings, setSettings]         = useState<{ pushSubCount: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);

  // Order form
  const [orderForm, setOrderForm]   = useState(BLANK_ORDER);
  const [orderMsg, setOrderMsg]     = useState("");
  const [orderSaving, setOrderSaving] = useState(false);

  // Testimonial forms
  const [testForm, setTestForm]     = useState({ quote:"",name:"",title:"",image:"",objectPosition:"top" });
  const [testMsg, setTestMsg]       = useState("");
  const [testUploading, setTestUploading] = useState(false);
  const testFileRef = useRef<HTMLInputElement>(null);

  // Shopify / Merch
  const [shopifyForm, setShopifyForm] = useState({ storeHandle:"", storefrontToken:"", collectionId:"" });
  const [shopifySaving, setShopifySaving] = useState(false);
  const [shopifyMsg, setShopifyMsg] = useState("");
  const [shopifyConfig, setShopifyConfig] = useState<ShopifyConfig | null>(null);

  // Homepage form
  const [homepageForm, setHomepageForm] = useState({
    marqueeText:"", beatsLabel:"FRESH CUTS", beatsHeadline:"Latest Beats",
    heroHeadline:"", heroSubtext:"", heroCta:"", heroCtaUrl:"/contact",
    emailBadge:"JOIN THE LIST", emailHeadline:"Stay Up To Date\nOn New Drops",
    emailSubtext:"Join the list. Be the first to hear new drops and exclusive deals.",
    seoTitle:"", seoDescription:"",
  });
  const [formStats, setFormStats] = useState<{value:string;suffix:string;label:string}[]>([
    {value:"15",suffix:"+",label:"Years of Experience"},
    {value:"150",suffix:"+",label:"Artists Worked With"},
    {value:"100",suffix:"%",label:"Client Satisfaction"},
  ]);
  const [formProductions, setFormProductions] = useState<{id:string;artist:string;title:string;credits:string}[]>([
    {id:"zGzpIqC5zvQ",artist:"A Boogie Wit Da Hoodie",title:"Timeless",credits:"Vocal Recording"},
    {id:"DMjz34ubhg4",artist:"Mach City",title:"Machi 99",credits:"Beat · Vocal Recording · Mix"},
    {id:"6a94jphQcaY",artist:"Mach City",title:"Make Em Trip",credits:"Beat · Vocal Recording · Mix"},
    {id:"gPyvvEYe3Ng",artist:"Trey Budden x Oskama Esteban",title:"Cage Bird Sings",credits:"Beat · Vocal Recording · Mix"},
    {id:"aLmZ0nV9_gc",artist:"A.D Ft K Godess",title:"Work",credits:"Beat · Vocal Recording · Mix"},
    {id:"dft7z1yWCDg",artist:"Trey Budden",title:"PUBLIK!",credits:"Beat · Vocal Recording · Mix"},
    {id:"PPnuRGkrRuY",artist:"Swizzyy Marleyy",title:"Super Gango",credits:"Vocal Recording · Mix"},
    {id:"IwreOeCvK1M",artist:"Mysonne",title:"That's How We On It",credits:"Vocal Recording · Mix"},
    {id:"Oma1SZ8utmw",artist:"G Wreck ft Coi Leray",title:"Froze",credits:"Beat · Vocal Recording · Mix"},
  ]);
  const [homepageSaving, setHomepageSaving] = useState(false);
  const [homepageMsg, setHomepageMsg]     = useState("");

  // UI
  const seenMsgIdsRef = useRef<Set<string>>(new Set());
  const [newMsgToast, setNewMsgToast] = useState<{ count: number; name: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [msgFolder, setMsgFolder] = useState<"inbox"|"starred"|"replied"|"archive"|"trash">("inbox");
  const [subSearch, setSubSearch] = useState("");
  const [subView, setSubView] = useState<"list"|"giveaway">("list");
  const [giveawayForm, setGiveawayForm] = useState({
    subject: "",
    badge: "Monthly Giveaway",
    headline: "",
    body: "",
    ctaLabel: "Browse Beats",
    ctaUrl: "https://www.luchibeats.com",
    audience: "all" as "all"|"new30",
  });
  const [giveawaySending, setGiveawaySending] = useState(false);
  const [giveawayResult, setGiveawayResult] = useState<{sent:number;failed:number;total:number}|null>(null);
  const [giveawayConfirm, setGiveawayConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("adm-theme") !== "light";
  });
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}));
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("adm-sidebar-collapsed") === "1";
  });
  const [tabOrder, setTabOrder] = useState<Tab[]>(() => {
    if (typeof window === "undefined") return [...TABS];
    try {
      const saved = JSON.parse(localStorage.getItem("adm-tab-order") || "null");
      if (Array.isArray(saved) && saved.length === TABS.length && (TABS as readonly string[]).every(t => saved.includes(t))) return saved as Tab[];
    } catch {}
    return [...TABS];
  });
  const [reorderMode, setReorderMode] = useState(false);
  const dragSrcIdxRef = useRef<number>(-1);

  // ── Loaders ────────────────────────────────────────────────────────────────

  const load = useCallback(async (endpoint: string) => {
    const r = await fetch(endpoint);
    return r.ok ? r.json() : null;
  }, []);

  const loadAll = useCallback(async () => {
    const [b, t, m, s, an, or_, hp, st, sh] = await Promise.all([
      load("/api/admin/beats"), load("/api/admin/testimonials"),
      load("/api/admin/messages"), load("/api/admin/subscribers"), load("/api/admin/analytics"),
      load("/api/admin/orders"), load("/api/admin/homepage"), load("/api/admin/settings"),
      load("/api/admin/shopify"),
    ]);
    if (b)   setBeats(b);
    if (t)   setTestimonials(t);
    if (m)   { setMessages(m); (m as Message[]).forEach(msg => seenMsgIdsRef.current.add(msg.id)); }
    if (s)   setSubscribers(s);
    if (an)  setAnalytics(an);
    if (or_) setOrders(or_);
    if (hp)  {
      setHomepageContent(hp);
      setHomepageForm({
        marqueeText:(hp.marqueeItems??[]).join("\n"),
        beatsLabel:hp.beatsLabel??"FRESH CUTS",
        beatsHeadline:hp.beatsHeadline??"Latest Beats",
        heroHeadline:hp.heroHeadline??"",
        heroSubtext:hp.heroSubtext??"",
        heroCta:hp.heroCta??"",
        heroCtaUrl:hp.heroCtaUrl??"/contact",
        emailBadge:hp.emailBadge??"JOIN THE LIST",
        emailHeadline:hp.emailHeadline??"Stay Up To Date\nOn New Drops",
        emailSubtext:hp.emailSubtext??"Join the list. Be the first to hear new drops and exclusive deals.",
        seoTitle:hp.seoTitle??"",
        seoDescription:hp.seoDescription??"",
      });
      if (hp.stats?.length) setFormStats((hp.stats as StatItem[]).map(s=>({value:String(s.value),suffix:s.suffix,label:s.label})));
      if (hp.productions?.length) setFormProductions(hp.productions as ProductionVideo[]);
    }
    if (st)  setSettings(st);
    if (sh)  { setShopifyConfig(sh); setShopifyForm({ storeHandle:sh.storeHandle??"", storefrontToken:sh.storefrontToken??"", collectionId:sh.collectionId??"" }); }
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/beats").then((r) => { if (r.ok) { setAuthed(true); loadAll(); } });

    const token = new URLSearchParams(window.location.search).get("resetToken");
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the reset link on page load
      setResetToken(token);
      setAuthMode("reset");
    } else {
      fetch("/api/admin/auth")
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && !d.hasCredentials) setAuthMode("setup"); })
        .catch(() => {});
    }
  }, [loadAll]);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll messages + subscribers every 30s so new contact form submissions appear without a page reload
  useEffect(() => {
    if (!authed) return;
    const interval = tab === "Messages" ? 3_000 : 15_000;
    const id = setInterval(async () => {
      if (document.visibilityState === "hidden") return;
      const [m, s, an] = await Promise.all([
        load("/api/admin/messages"),
        load("/api/admin/subscribers"),
        load("/api/admin/analytics"),
      ]);
      if (m) {
        // Only ever ADD new messages — never overwrite existing local state.
        // This means optimistic updates (trash/archive/delete) are never clobbered by a stale poll.
        const incoming = (m as Message[]).filter(msg => !seenMsgIdsRef.current.has(msg.id));
        if (incoming.length > 0) {
          incoming.forEach(msg => seenMsgIdsRef.current.add(msg.id));
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setNewMsgToast({ count: incoming.length, name: incoming[0].name });
          toastTimerRef.current = setTimeout(() => setNewMsgToast(null), 6_000);
          setMessages(prev => [...incoming, ...prev]);
        }
      }
      if (s) setSubscribers(s);
      if (an) setAnalytics(an);
    }, interval);
    return () => clearInterval(id);
  }, [authed, load, tab]);

  // ── Auth ───────────────────────────────────────────────────────────────────

  async function login(e: React.FormEvent) {
    e.preventDefault(); setAuthErr(""); setAuthBusy(true);
    const res = await fetch("/api/admin/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email, password }) });
    setAuthBusy(false);
    if (res.ok) { setAuthed(true); loadAll(); } else setAuthErr((await res.json().catch(()=>({})))?.error || "Wrong email or password");
  }

  async function setupAccount(e: React.FormEvent) {
    e.preventDefault(); setAuthErr("");
    if (password !== confirmPassword) { setAuthErr("Passwords don't match"); return; }
    setAuthBusy(true);
    const res = await fetch("/api/admin/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ setupKey: accessKey, email, password }) });
    setAuthBusy(false);
    if (res.ok) { setAuthed(true); loadAll(); } else setAuthErr((await res.json().catch(()=>({})))?.error || "Couldn't set up your account");
  }

  async function sendRecoveryEmail() {
    setAuthErr(""); setAuthBusy(true);
    await fetch("/api/admin/auth/forgot", { method:"POST" }).catch(() => {});
    setAuthBusy(false); setForgotSent(true);
  }

  async function resetPasswordWithToken(e: React.FormEvent) {
    e.preventDefault(); setAuthErr("");
    if (password !== confirmPassword) { setAuthErr("Passwords don't match"); return; }
    setAuthBusy(true);
    const res = await fetch("/api/admin/auth/forgot", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ token: resetToken, newPassword: password }) });
    setAuthBusy(false);
    if (res.ok) {
      window.history.replaceState({}, "", "/admin");
      setAuthMode("login"); setPassword(""); setConfirmPassword(""); setResetToken("");
      setAuthErr(""); setForgotSent(false);
    } else setAuthErr((await res.json().catch(()=>({})))?.error || "This reset link is invalid or has expired");
  }

  async function logout() { await fetch("/api/admin/auth", { method:"DELETE" }); setAuthed(false); }

  // ── Tab reorder ────────────────────────────────────────────────────────────

  function onTabDragStart(idx: number) { dragSrcIdxRef.current = idx; }
  function onTabDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    const src = dragSrcIdxRef.current;
    if (src === -1 || src === idx) return;
    const next = [...tabOrder];
    const [moved] = next.splice(src, 1);
    next.splice(idx, 0, moved);
    dragSrcIdxRef.current = idx;
    setTabOrder(next);
  }
  function lockTabOrder() { localStorage.setItem("adm-tab-order", JSON.stringify(tabOrder)); setReorderMode(false); }
  function resetTabOrder() { const d = [...TABS]; setTabOrder(d); localStorage.setItem("adm-tab-order", JSON.stringify(d)); setReorderMode(false); }

  // ── Orders ─────────────────────────────────────────────────────────────────

  async function saveOrder(e: React.FormEvent) {
    e.preventDefault(); setOrderSaving(true); setOrderMsg("");
    const wasExclusive = orderForm.type === "beat" && orderForm.itemId && orderForm.licenseType === "Exclusive";
    await fetch("/api/admin/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...orderForm, amount:Number(orderForm.amount) }) });
    setOrderForm(BLANK_ORDER); setOrderSaving(false);
    setOrderMsg(wasExclusive ? "Order recorded — beat removed from store and archived!" : "Order recorded!");
    const [or_, b] = await Promise.all([load("/api/admin/orders"), load("/api/admin/beats")]);
    if (or_) setOrders(or_);
    if (b) setBeats(b);
    setTimeout(()=>setOrderMsg(""), 4000);
  }

  async function updateOrderStatus(id: string, status: Order["status"]) {
    const order = orders.find(o=>o.id===id); if (!order) return;
    await fetch("/api/admin/orders", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...order, status }) });
    const or_ = await load("/api/admin/orders"); if (or_) setOrders(or_);
  }

  async function deleteOrder(id: string) {
    if (!confirm("Delete this order record?")) return;
    await fetch("/api/admin/orders", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const or_ = await load("/api/admin/orders"); if (or_) setOrders(or_);
  }

  // ── Testimonials ─────────────────────────────────────────────────────────────

  async function saveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/testimonials", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(testForm) });
    setTestMsg("Testimonial added!");
    setTestForm({ quote:"",name:"",title:"",image:"",objectPosition:"top" });
    if (testFileRef.current) testFileRef.current.value = "";
    const t = await load("/api/admin/testimonials"); if (t) setTestimonials(t); setTimeout(()=>setTestMsg(""), 2500);
  }

  async function deleteTestimonial(id: string) {
    if (!confirm("Remove this testimonial?")) return;
    await fetch("/api/admin/testimonials", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const t = await load("/api/admin/testimonials"); if (t) setTestimonials(t);
  }

  async function uploadTestimonialPhoto(file: File) {
    setTestUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method:"POST", body:fd });
    const data = await res.json();
    if (data.url) setTestForm(f => ({ ...f, image: data.url }));
    setTestUploading(false);
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  function patchMessage(id: string, patch: Partial<Message>) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    fetch("/api/admin/messages", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id, ...patch }) });
  }

  function markRead(id: string, read: boolean) { patchMessage(id, { read }); }
  function starMessage(id: string, starred: boolean) { patchMessage(id, { starred }); }
  function archiveMessage(id: string) { patchMessage(id, { folder:"archive", read:true }); }
  function restoreMessage(id: string) { patchMessage(id, { folder:"inbox" }); }
  function markReplied(id: string) { patchMessage(id, { replied:true, read:true }); }

  function deleteMessage(id: string) {
    if (!confirm("Permanently delete this message?")) return;
    setMessages(prev => prev.filter(m => m.id !== id));
    setExpandedMsg(null);
    fetch("/api/admin/messages", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
  }

  function trashMessage(id: string) { patchMessage(id, { folder:"trash" }); }

  // ── Homepage ───────────────────────────────────────────────────────────────

  async function saveShopify(e: React.FormEvent) {
    e.preventDefault(); setShopifySaving(true);
    const cfg: ShopifyConfig = { storeHandle:shopifyForm.storeHandle.trim(), storefrontToken:shopifyForm.storefrontToken.trim(), collectionId:shopifyForm.collectionId.trim(), connected:!!(shopifyForm.storeHandle.trim()&&shopifyForm.storefrontToken.trim()) };
    await fetch("/api/admin/shopify", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(cfg) });
    setShopifyConfig(cfg); setShopifySaving(false);
    setShopifyMsg(cfg.connected ? "Shopify config saved! Ready to connect products." : "Config saved.");
    setTimeout(()=>setShopifyMsg(""), 4000);
  }

  function extractYouTubeId(input: string): string {
    const match = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input.replace(/\s/g,"");
  }

  async function saveHomepage(e: React.FormEvent) {
    e.preventDefault(); setHomepageSaving(true);
    const content: HomepageContent = {
      marqueeItems: homepageForm.marqueeText.split("\n").map(i=>i.trim()).filter(Boolean),
      beatsLabel: homepageForm.beatsLabel,
      beatsHeadline: homepageForm.beatsHeadline,
      heroHeadline: homepageForm.heroHeadline,
      heroSubtext: homepageForm.heroSubtext,
      heroCta: homepageForm.heroCta,
      heroCtaUrl: homepageForm.heroCtaUrl || "/contact",
      stats: formStats.map(s=>({ value:Number(s.value)||0, suffix:s.suffix, label:s.label })),
      emailBadge: homepageForm.emailBadge,
      emailHeadline: homepageForm.emailHeadline,
      emailSubtext: homepageForm.emailSubtext,
      productions: formProductions.filter(v=>v.id.trim()),
      seoTitle: homepageForm.seoTitle,
      seoDescription: homepageForm.seoDescription,
    };
    await fetch("/api/admin/homepage", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(content) });
    setHomepageSaving(false); setHomepageMsg("Homepage updated! Changes go live on next page load.");
    setTimeout(()=>setHomepageMsg(""), 4000);
  }

  // ── Exports ─────────────────────────────────────────────────────────────────

  async function deleteSubscriber(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    await fetch("/api/admin/subscribers", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const s = await load("/api/admin/subscribers"); if (s) setSubscribers(s);
  }

  const exportSubscribers = () => downloadCSV("luchibeats-subscribers.csv", ["Email","Joined"], subscribers.map(s=>[s.email,new Date(s.createdAt).toLocaleDateString()]));
  const exportMessages    = () => downloadCSV("luchibeats-messages.csv", ["Name","Email","Subject","Message","Date"], messages.map(m=>[m.name,m.email,m.subject,m.message,new Date(m.createdAt).toLocaleDateString()]));
  const exportOrders      = () => downloadCSV("luchibeats-orders.csv", ["Customer","Email","Item","License","Amount","Status","Date","Notes"], orders.map(o=>[o.customerName,o.customerEmail,o.itemTitle,o.licenseType??"",`$${o.amount}`,o.status,new Date(o.createdAt).toLocaleDateString(),o.notes??""]));

  // ── Login screen ───────────────────────────────────────────────────────────

  // ── Theme ─────────────────────────────────────────────────────────────────

  const p = THEMES[darkMode ? "dark" : "light"];
  const cssVars = {
    "--adm-deep": p.deep, "--adm-card": p.card, "--adm-input": p.input,
    "--adm-border": p.border, "--adm-border-mid": p.borderMid,
    "--adm-muted": p.muted, "--adm-dim": p.dim,
  } as React.CSSProperties;

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("adm-theme", next ? "dark" : "light");
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        data-adm={darkMode?"dark":"light"} style={{ ...cssVars, background: BG_DEEP }}>
        <style>{`[data-adm="light"] .text-white{color:#111118!important}[data-adm="light"] select option{background:#f4f4fb;color:#111118}[data-adm="light"] audio{filter:invert(0.88) hue-rotate(195deg)}`}</style>
        {/* Theme toggle — top right */}
        <button onClick={toggleTheme} className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}>
          {darkMode ? <Sun size={12}/> : <Moon size={12}/>}
          {darkMode ? "Light" : "Dark"}
        </button>
        {/* Ambient orbs — same as main site */}
        <div className="orb orb-1 w-[500px] h-[500px] -top-32 -left-40 absolute" style={{ background: p.orb1 }} />
        <div className="orb orb-2 w-[400px] h-[400px] -bottom-24 -right-32 absolute" style={{ background: p.orb2 }} />
        <div className="orb orb-3 w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute" style={{ background: p.orb3 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)" }} />

        {(() => {
          const gateInput = (type: string, placeholder: string, value: string, onChange: (v: string) => void, mono = false) => (
            <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
              autoComplete={type === "password" ? "new-password" : "off"}
              autoCorrect="off" autoCapitalize="off" spellCheck={false}
              data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other"
              readOnly onFocus={e => {
                e.target.readOnly = false;
                e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD_GLOW}`;
              }}
              className={`w-full px-4 py-3.5 rounded-lg text-white text-sm mb-4 outline-none transition-all ${mono ? "font-mono tracking-widest" : ""}`}
              style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}`, letterSpacing: mono ? "0.3em" : undefined }}
              onBlur={e => { e.target.style.borderColor = BORDER_SUBTLE; e.target.style.boxShadow = "none"; }} />
          );
          const gateLabel = (label: string) => (
            <label className="flex items-center gap-2 text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: TEXT_DIM }}>
              <span style={{ color: GOLD }}>▶</span> {label}
            </label>
          );
          const gateErr = authErr && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="text-red-400 text-xs">⚠</span>
              <p className="text-red-400 text-xs font-bold">{authErr}</p>
            </div>
          );
          const gateSubmit = (label: string) => (
            <button type="submit" disabled={authBusy} className="w-full py-3.5 rounded-lg font-black text-sm text-black tracking-widest transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: authBusy ? "none" : `0 0 30px rgba(201,168,76,0.3), 0 8px 24px rgba(0,0,0,0.4)` }}>
              {authBusy ? "Working…" : `${label} →`}
            </button>
          );

          const subtitle = {
            login:  "SECURE ACCESS TERMINAL",
            setup:  "CLAIM YOUR ADMIN ACCOUNT",
            forgot: "ACCOUNT RECOVERY",
            reset:  "SET A NEW PASSWORD",
          }[authMode];

          return (
            <div className="w-full max-w-sm relative z-10">
              {/* logo */}
              <div className="text-center mb-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="LuchiBeats" className="h-20 w-auto mx-auto mb-4 object-contain" />
                <h1 className="text-3xl font-black text-white tracking-tight">ADMIN OS</h1>
                <p className="text-xs mt-2 tracking-[0.2em]" style={{ color: TEXT_MUTED }}>{subtitle}</p>
              </div>

              <div className="relative rounded-xl p-8" style={{ background: BG_CARD, border: `1px solid ${GOLD_BORDER}`, boxShadow: `0 0 60px rgba(201,168,76,0.08), 0 30px 60px rgba(0,0,0,0.6)` }}>
                {/* corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
                <div className="absolute top-0 right-0 w-4 h-4" style={{ borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
                <div className="absolute bottom-0 left-0 w-4 h-4" style={{ borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
                <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />

                {authMode === "login" && (
                  <form onSubmit={login}>
                    {gateLabel("Email")}
                    {gateInput("email", "Enter Email", email, setEmail, true)}
                    {gateLabel("Password")}
                    {gateInput("password", "Enter your password", password, setPassword, true)}
                    {gateErr}
                    {gateSubmit("SIGN IN")}
                    <button type="button" onClick={() => { setAuthMode("forgot"); setAuthErr(""); setForgotSent(false); }}
                      className="w-full text-center mt-5 text-xs font-bold transition-colors" style={{ color: TEXT_MUTED }}>
                      Forgot your email or password?
                    </button>
                  </form>
                )}

                {authMode === "setup" && (
                  <form onSubmit={setupAccount}>
                    {gateLabel("Access Key")}
                    {gateInput("password", "Enter access key", accessKey, setAccessKey, true)}
                    {gateLabel("Your Email")}
                    {gateInput("email", "Enter Email", email, setEmail, true)}
                    {gateLabel("New Password")}
                    {gateInput("password", "At least 8 characters", password, setPassword)}
                    {gateLabel("Confirm Password")}
                    {gateInput("password", "Repeat password", confirmPassword, setConfirmPassword)}
                    {gateErr}
                    {gateSubmit("CLAIM ACCOUNT")}
                    <p className="text-center mt-5 text-xs" style={{ color: TEXT_MUTED }}>
                      Use your current Access Key once to set up email + password login.
                    </p>
                  </form>
                )}

                {authMode === "forgot" && (
                  forgotSent ? (
                    <div>
                      <p className="text-sm text-center mb-6" style={{ color: TEXT_MUTED }}>
                        If an admin account is on file, a recovery email is on its way with your login email and a link to reset your password.
                      </p>
                      <button type="button" onClick={() => { setAuthMode("login"); setForgotSent(false); }}
                        className="w-full py-3.5 rounded-lg font-black text-sm tracking-widest transition-all"
                        style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}>
                        ← BACK TO LOGIN
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-center mb-6" style={{ color: TEXT_MUTED }}>
                        We&apos;ll email a reset link to your registered admin address.
                      </p>
                      {gateErr}
                      <button type="button" disabled={authBusy} onClick={sendRecoveryEmail}
                        className="w-full py-3.5 rounded-lg font-black text-sm text-black tracking-widest transition-all disabled:opacity-40 mb-3"
                        style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: authBusy ? "none" : `0 0 30px rgba(201,168,76,0.3), 0 8px 24px rgba(0,0,0,0.4)` }}>
                        {authBusy ? "Sending…" : "SEND RECOVERY EMAIL →"}
                      </button>
                      <button type="button" onClick={() => { setAuthMode("login"); setAuthErr(""); }}
                        className="w-full text-center text-xs font-bold transition-colors" style={{ color: TEXT_MUTED }}>
                        ← Back to login
                      </button>
                    </div>
                  )
                )}

                {authMode === "reset" && (
                  <form onSubmit={resetPasswordWithToken}>
                    {gateLabel("New Password")}
                    {gateInput("password", "At least 8 characters", password, setPassword)}
                    {gateLabel("Confirm Password")}
                    {gateInput("password", "Repeat password", confirmPassword, setConfirmPassword)}
                    {gateErr}
                    {gateSubmit("SET NEW PASSWORD")}
                  </form>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const unreadCount     = messages.filter(m=>!m.read && m.folder !== "trash" && m.folder !== "archive").length;
  const completedOrders = orders.filter(o=>o.status==="completed");
  const totalRevenue    = completedOrders.reduce((s,o)=>s+o.amount, 0);
  const refundedRevenue = orders.filter(o=>o.status==="refunded").reduce((s,o)=>s+o.amount, 0);

  // ── Sidebar nav item ───────────────────────────────────────────────────────

  function NavItem({ t, idx }: { t: Tab; idx: number }) {
    const Icon = TAB_ICONS[t];
    const active = tab === t;

    if (reorderMode) {
      return (
        <div draggable
          onDragStart={() => onTabDragStart(idx)}
          onDragOver={(e) => onTabDragOver(e, idx)}
          className="w-full flex items-center gap-2 px-2 py-2.5 rounded-lg cursor-grab select-none"
          style={{ background: "rgba(201,168,76,0.06)", border: `1px solid ${GOLD_BORDER}` }}>
          <GripVertical size={12} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(201,168,76,0.12)", border: `1px solid ${GOLD_BORDER}` }}>
            <Icon size={13} style={{ color: GOLD }} />
          </div>
          <span className="flex-1 text-xs font-bold tracking-wide truncate" style={{ color: GOLD }}>{t}</span>
        </div>
      );
    }

    return (
      <button onClick={() => setTab(t)} title={sidebarCollapsed ? t : undefined}
        className="w-full flex items-center gap-3 rounded-lg text-left transition-all relative overflow-hidden"
        style={{ padding: sidebarCollapsed ? "10px 0" : "10px 12px", justifyContent: sidebarCollapsed ? "center" : undefined, background: active ? "rgba(201,168,76,0.08)" : "transparent", color: active ? GOLD : TEXT_DIM }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
        {active && !sidebarCollapsed && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />}
        <div className="relative w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? GOLD_BORDER : BORDER_SUBTLE}` }}>
          <Icon size={13} />
          {sidebarCollapsed && t === "Messages" && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-black"
              style={{ background: GOLD, color: "#000", fontSize: 9 }}>{unreadCount}</span>
          )}
        </div>
        {!sidebarCollapsed && <span className="flex-1 text-xs font-bold tracking-wide">{t}</span>}
        {!sidebarCollapsed && t === "Messages" && unreadCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-xs font-black" style={{ background: GOLD, color: "#000" }}>{unreadCount}</span>
        )}
      </button>
    );
  }

  // ── Dashboard shell ────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen relative" data-adm={darkMode?"dark":"light"} style={{ ...cssVars, background: BG_DEEP, overflowX: "hidden", maxWidth: "100vw" }}>
      <style>{`[data-adm="light"] .text-white{color:#111118!important}[data-adm="light"] select option{background:#f4f4fb;color:#111118}[data-adm="light"] audio{filter:invert(0.88) hue-rotate(195deg)}`}</style>
      {/* Ambient orbs */}
      <div className="orb orb-1 w-[600px] h-[600px] -top-40 -left-40 fixed pointer-events-none" style={{ background: p.orb1 }} />
      <div className="orb orb-2 w-[500px] h-[500px] -bottom-32 -right-40 fixed pointer-events-none" style={{ background: p.orb2 }} />
      <div className="orb orb-3 w-80 h-80 top-1/2 right-1/4 fixed pointer-events-none" style={{ background: p.orb3 }} />

      {/* ── New message toast ── */}
      {newMsgToast && (
        <div onClick={() => { setTab("Messages"); setMsgFolder("inbox"); setNewMsgToast(null); }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer select-none"
          style={{ background:"linear-gradient(135deg,#1c1c26,#22222e)", border:`1px solid ${GOLD_BORDER}`, boxShadow:`0 0 30px rgba(201,168,76,0.25), 0 8px 32px rgba(0,0,0,0.6)`, minWidth:240, maxWidth:320 }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${GOLD},#A8892E)` }}>
            <Mail size={16} style={{ color:"#000" }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white">{newMsgToast.count > 1 ? `${newMsgToast.count} new messages` : "New message"}</p>
            <p className="text-xs truncate" style={{ color:GOLD }}>{newMsgToast.name}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setNewMsgToast(null); }}
            className="text-xs ml-auto flex-shrink-0 w-5 h-5 flex items-center justify-center rounded"
            style={{ color:TEXT_MUTED, background:"rgba(255,255,255,0.05)" }}>×</button>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto overflow-x-hidden transition-all duration-200 ${sidebarCollapsed ? "w-[60px]" : "w-60"}`}
        style={{ background: p.sidebarBg, borderRight: `1px solid ${BORDER_SUBTLE}` }}>

        {/* Brand header */}
        <div className="flex items-center justify-between px-3 pt-4 pb-4" style={{ borderBottom: `1px solid ${BORDER_SUBTLE}`, minHeight: 72 }}>
          {!sidebarCollapsed && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="LuchiBeats" className="h-10 w-auto object-contain" />
            </>
          )}
          <button
            onClick={() => { const next = !sidebarCollapsed; setSidebarCollapsed(next); localStorage.setItem("adm-sidebar-collapsed", next ? "1" : "0"); if (next) setReorderMode(false); }}
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
            style={{ color: TEXT_MUTED, background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER_SUBTLE}`, marginLeft: sidebarCollapsed ? "auto" : undefined, marginRight: sidebarCollapsed ? "auto" : undefined }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Online status */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
                <p className="text-xs font-bold tracking-[0.15em]" style={{ color: TEXT_MUTED }}>ONLINE</p>
              </div>
              <p className="text-xs font-mono" style={{ color: TEXT_MUTED }}>{clock}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className={`flex-1 py-4 space-y-0.5 ${sidebarCollapsed ? "px-1.5" : "px-3"}`}>
          {tabOrder.map((t, idx) => <NavItem key={t} t={t} idx={idx} />)}
        </nav>

        {/* Reorder controls */}
        {!sidebarCollapsed && (
          <div className="px-3 py-2" style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
            {reorderMode ? (
              <div className="flex gap-1.5">
                <button type="button" onClick={lockTabOrder}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all"
                  style={{ background: "rgba(201,168,76,0.15)", color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                  ✓ Lock Order
                </button>
                <button type="button" onClick={resetTabOrder}
                  className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", color: TEXT_MUTED, border: `1px solid ${BORDER_SUBTLE}` }}
                  title="Reset to default order">
                  ↺
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setReorderMode(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.03)", color: TEXT_MUTED, border: `1px solid ${BORDER_SUBTLE}` }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; e.currentTarget.style.borderColor = GOLD_BORDER; }}
                onMouseLeave={e => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.borderColor = BORDER_SUBTLE; }}>
                <GripVertical size={11} /> Reorder Tabs
              </button>
            )}
          </div>
        )}

        {/* Theme switcher */}
        <div className={`py-3 ${sidebarCollapsed ? "px-1.5" : "px-3"}`} style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
          {!sidebarCollapsed && <p className="text-xs font-black tracking-[0.2em] uppercase mb-2.5 px-1" style={{ color: TEXT_MUTED }}>Appearance</p>}
          {sidebarCollapsed ? (
            <button type="button" onClick={() => { const next = !darkMode; setDarkMode(next); localStorage.setItem("adm-theme", next ? "dark" : "light"); }}
              className="w-full flex items-center justify-center py-2 rounded-lg transition-all"
              style={{ background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`, color: GOLD }}
              title={darkMode ? "Switch to Light" : "Switch to Dark"}>
              {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl" style={{ background: BG_INPUT }}>
              <button type="button" onClick={() => { setDarkMode(true); localStorage.setItem("adm-theme","dark"); }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: darkMode ? BG_CARD : "transparent", color: darkMode ? GOLD : TEXT_MUTED, boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.3)" : "none", border: darkMode ? `1px solid ${GOLD_BORDER}` : "1px solid transparent" }}>
                <Moon size={11} /> Dark
              </button>
              <button type="button" onClick={() => { setDarkMode(false); localStorage.setItem("adm-theme","light"); }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: !darkMode ? BG_CARD : "transparent", color: !darkMode ? GOLD : TEXT_MUTED, boxShadow: !darkMode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: !darkMode ? `1px solid ${GOLD_BORDER}` : "1px solid transparent" }}>
                <Sun size={11} /> Light
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className={`pb-5 pt-2 ${sidebarCollapsed ? "px-1.5" : "px-3"}`} style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
          <button onClick={logout} title={sidebarCollapsed ? "Log Out" : undefined}
            className="w-full flex items-center rounded-lg transition-all"
            style={{ gap: sidebarCollapsed ? 0 : 12, padding: sidebarCollapsed ? "10px 0" : "10px 12px", justifyContent: sidebarCollapsed ? "center" : undefined, color: TEXT_MUTED, background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.background = "transparent"; }}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER_SUBTLE}` }}>
              <LogOut size={13} />
            </div>
            {!sidebarCollapsed && <span className="text-xs font-bold tracking-wide">Log Out</span>}
          </button>
          {!sidebarCollapsed && <p className="text-center text-xs mt-3 font-mono" style={{ color: BORDER_MID }}>v2.0 · LuchiBeats</p>}
        </div>
      </aside>

      {/* ── Right side ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top chrome bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ background: p.topBg, borderBottom: `1px solid ${BORDER_SUBTLE}`, backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-3">
            <p className="md:hidden text-xs font-black tracking-[0.3em]" style={{ color: GOLD }}>LB</p>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono" style={{ color: TEXT_MUTED }}>
              <span style={{ color: GOLD }}>~/</span>
              <span>luchibeats</span>
              <span style={{ color: BORDER_MID }}>/</span>
              <span className="font-bold" style={{ color: TEXT_DIM }}>{tab.toLowerCase().replace(" ", "-")}</span>
            </div>
            <span className="md:hidden text-sm font-black text-white">{tab}</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden md:block text-xs font-mono" style={{ color: TEXT_MUTED }}>{clock}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#39ff8a", boxShadow: "0 0 6px #39ff8a" }} />
              <p className="text-xs font-bold tracking-widest" style={{ color: TEXT_MUTED }}>LIVE</p>
            </div>
            <button onClick={toggleTheme} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: GOLD_DIM, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
              {darkMode ? <Sun size={11}/> : <Moon size={11}/>}
              <span className="hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
            </button>
            <button onClick={logout} className="md:hidden text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: "rgba(255,255,255,0.04)", color: TEXT_DIM, border: `1px solid ${BORDER_SUBTLE}` }}>
              Exit
            </button>
          </div>
        </div>

        {/* Mobile tab strip */}
        <div className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 flex-shrink-0"
          style={{ background: "rgba(10,10,10,0.95)", borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
          {tabOrder.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all"
              style={{ background: tab===t ? GOLD_DIM : "rgba(255,255,255,0.03)", color: tab===t ? GOLD : TEXT_MUTED, border: `1px solid ${tab===t ? GOLD_BORDER : "transparent"}`, boxShadow: tab===t ? `0 0 12px ${GOLD_GLOW}` : "none" }}>
              {t}
              {t==="Messages" && unreadCount>0 && <span className="ml-1 px-1 py-0.5 rounded text-xs font-black" style={{ background:GOLD,color:"#000" }}>{unreadCount}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 flex flex-col min-h-0">
          <div className={tab === "Messages" ? "flex-1 flex flex-col min-h-0 p-3 md:p-5" : "max-w-4xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 space-y-6"}>

            {/* ── OVERVIEW ── */}
            {tab === "Overview" && (
              <>
                <style>{`
                  @keyframes adm-glow-pulse { 0%,100%{opacity:1;box-shadow:0 0 5px #4ade80,0 0 10px #4ade8060} 50%{opacity:0.6;box-shadow:0 0 3px #4ade80} }
                  @keyframes adm-gold-pulse { 0%,100%{opacity:1;box-shadow:0 0 5px #C9A84C,0 0 10px #C9A84C60} 50%{opacity:0.6;box-shadow:0 0 3px #C9A84C} }
                  @keyframes adm-bar-fill { from{width:0} }
                  .adm-live-dot { animation: adm-glow-pulse 2.2s ease-in-out infinite; }
                  .adm-gold-dot { animation: adm-gold-pulse 2.2s ease-in-out infinite; }
                  .adm-bar { animation: adm-bar-fill 0.9s cubic-bezier(0.22,1,0.36,1) both; }
                `}</style>

                {/* ── Command Center header ── */}
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontFamily:"monospace",fontSize:9,letterSpacing:"0.3em",color:GOLD,marginBottom:8 }}>{"// LUCHIBEATS · COMMAND CENTER"}</p>
                    <h1 className="text-2xl font-black text-white mb-2" style={{ letterSpacing:"-0.02em" }}>System Overview</h1>
                    <div className="flex items-center gap-2">
                      <span className="adm-live-dot" style={{ display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#4ade80",flexShrink:0 }} />
                      <span style={{ fontFamily:"monospace",fontSize:9,letterSpacing:"0.2em",color:"#4ade80" }}>ALL SYSTEMS ONLINE</span>
                      <span style={{ color:"rgba(255,255,255,0.1)",margin:"0 4px" }}>·</span>
                      <span style={{ fontFamily:"monospace",fontSize:9,letterSpacing:"0.15em",color:TEXT_MUTED }}>
                        {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <p style={{ fontFamily:"monospace",fontSize:22,fontWeight:900,color:GOLD,letterSpacing:"0.08em",textShadow:`0 0 20px ${GOLD}60` }}>{clock}</p>
                    <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.2em",color:TEXT_MUTED,marginTop:2 }}>LOCAL · UTC−5</p>
                  </div>
                </div>

                {/* ── Status strip ── */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label:"SUBSCRIBERS", value:subscribers.length, color:GOLD },
                    { label:"INBOX", value:unreadCount>0?`${unreadCount} UNREAD`:"CLEAR", color:unreadCount>0?GOLD:"#4ade80" },
                    { label:"ORDERS", value:`${orders.filter(o=>o.status==="pending").length} PENDING`, color:orders.filter(o=>o.status==="pending").length>0?"#f59e0b":"#4ade80" },
                    { label:"PUSH DEVICES", value:settings?.pushSubCount??0, color:"#60a5fa" },
                  ].map(({label,value,color}) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ display:"inline-block",width:5,height:5,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}` }} />
                      <span style={{ fontFamily:"monospace",fontSize:9,letterSpacing:"0.15em",color:TEXT_MUTED }}>{label}</span>
                      <span style={{ fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em",color,fontWeight:700 }}>{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* ── Primary KPI grid ── */}
                {(() => {
                  const hudCard = (key: string, value: string|number, sub: string|null, color: string) => (
                    <div key={key} className="relative rounded-xl p-4 overflow-hidden" style={{ background:"rgba(201,168,76,0.02)",border:"1px solid rgba(201,168,76,0.09)" }}>
                      {/* corner brackets */}
                      {[[0,0,"Top","Left"],[0,1,"Top","Right"],[1,0,"Bottom","Left"],[1,1,"Bottom","Right"]].map(([r,c,v,h])=>(
                        <div key={`${r}${c}`} style={{ position:"absolute",[String(v).toLowerCase()]:6,[String(h).toLowerCase()]:6,width:9,height:9,[`border${v}`]:`1.5px solid ${color}`,[`border${h}`]:`1.5px solid ${color}`,opacity:0.55 }} />
                      ))}
                      {/* scanlines */}
                      <div style={{ position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(201,168,76,0.013) 3px,rgba(201,168,76,0.013) 4px)",pointerEvents:"none" }} />
                      <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.22em",color:TEXT_MUTED,textTransform:"uppercase",marginBottom:10,position:"relative" }}>{key}</p>
                      <p style={{ fontFamily:"monospace",fontSize:30,fontWeight:900,color,lineHeight:1,textShadow:`0 0 24px ${color}50`,position:"relative" }}>{typeof value==="number"?value.toLocaleString():value}</p>
                      {sub && <p style={{ fontFamily:"monospace",fontSize:8,color,opacity:0.65,marginTop:5,letterSpacing:"0.12em",position:"relative" }}>{sub}</p>}
                    </div>
                  );
                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {hudCard("SUBSCRIBERS", subscribers.length, `+${subscribers.filter(s=>new Date(s.createdAt)>=new Date(Date.now()-30*86400000)).length} THIS MONTH`, "#4ade80")}
                        {hudCard("INBOX", messages.length, unreadCount>0?`${unreadCount} UNREAD`:null, unreadCount>0?GOLD:"#4ade80")}
                        {hudCard("PAGE VIEWS", (analytics?.pageViews as number)??0, null, "#60a5fa")}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {hudCard("TOTAL REVENUE", `$${totalRevenue.toLocaleString()}`, `${completedOrders.length} COMPLETED`, GOLD)}
                        {hudCard("ORDERS", orders.length, `${orders.filter(o=>o.status==="pending").length} PENDING`, "#f59e0b")}
                        {hudCard("AVG ORDER VALUE", completedOrders.length?`$${(totalRevenue/completedOrders.length).toFixed(0)}`:"—", null, "#a78bfa")}
                      </div>
                    </>
                  );
                })()}

                {/* ── Activity ── */}
                <div className="grid grid-cols-1 gap-4">

                  {/* Live Activity Feed */}
                  <div className="rounded-xl p-5" style={{ background:"rgba(201,168,76,0.02)",border:"1px solid rgba(201,168,76,0.09)" }}>
                    <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.28em",color:TEXT_MUTED,marginBottom:18 }}>{"// LIVE ACTIVITY FEED"}</p>
                    {(() => {
                      type FeedItem = {id:string;type:"MSG"|"ORDER";label:string;sub:string;time:string;color:string};
                      const feed: FeedItem[] = [
                        ...messages.slice(0,6).map(m=>({ id:m.id,type:"MSG" as const,label:m.name,sub:m.subject,time:m.createdAt,color:m.read?TEXT_MUTED:GOLD })),
                        ...orders.slice(0,5).map(o=>({ id:o.id,type:"ORDER" as const,label:o.customerName,sub:`$${o.amount} · ${o.itemTitle.slice(0,18)}`,time:o.createdAt,color:"#4ade80" })),
                      ].sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime()).slice(0,9);
                      if (feed.length===0) return <p style={{ fontFamily:"monospace",fontSize:10,color:TEXT_MUTED }}>NO ACTIVITY YET</p>;
                      return (
                        <div className="space-y-3">
                          {feed.map((item,i) => (
                            <div key={item.id} className="flex items-start gap-3">
                              <div className="flex flex-col items-center flex-shrink-0" style={{ paddingTop:2 }}>
                                <div style={{ width:6,height:6,borderRadius:"50%",background:item.color,boxShadow:`0 0 6px ${item.color}` }} />
                                {i < feed.length-1 && <div style={{ width:1,height:18,background:"rgba(255,255,255,0.06)",marginTop:3 }} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span style={{ fontFamily:"monospace",fontSize:7,letterSpacing:"0.15em",color:item.color,background:item.type==="MSG"?"rgba(201,168,76,0.08)":"rgba(74,222,128,0.08)",padding:"1px 4px",borderRadius:2,border:`1px solid ${item.color}30` }}>{item.type}</span>
                                  <span style={{ fontFamily:"monospace",fontSize:8,color:TEXT_MUTED }}>{new Date(item.time).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                                </div>
                                <p style={{ fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.label}</p>
                                <p style={{ fontFamily:"monospace",fontSize:8,color:TEXT_DIM,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.sub}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ── Site Traffic Analytics ── */}
                {(() => {
                  const countries = (analytics?.countries as Record<string,{views:number;contacts:number;subscribers:number}>) ?? {};
                  const pageViews = (analytics?.pageViews as number) ?? 0;
                  const sorted = Object.entries(countries)
                    .filter(([, s]) => s.views > 0)
                    .map(([code, s]) => ({ code, ...s }))
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 10);
                  const maxViews = Math.max(...sorted.map(c => c.views), 1);
                  const totalContacts = Object.values(countries).reduce((s,c)=>s+c.contacts,0);
                  const totalSubs = Object.values(countries).reduce((s,c)=>s+c.subscribers,0);
                  return (
                    <div className="rounded-xl overflow-hidden" style={{ background:"rgba(8,8,14,0.95)", border:"1px solid rgba(201,168,76,0.12)" }}>
                      {/* Header */}
                      <div className="px-5 pt-5 pb-4 flex items-center justify-between" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                        <div>
                          <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.28em",color:TEXT_MUTED,marginBottom:4 }}>{"// SITE TRAFFIC — ANALYTICS"}</p>
                          <p className="text-sm font-black text-white">Traffic Overview</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="adm-live-dot" style={{ display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#4ade80",flexShrink:0 }} />
                          <span style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.15em",color:TEXT_MUTED }}>LIVE</span>
                        </div>
                      </div>
                      {/* KPI row */}
                      <div className="grid grid-cols-3 divide-x" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                        {[
                          { label:"PAGE VIEWS", value:pageViews.toLocaleString(), color:"#60a5fa" },
                          { label:"FORM CONTACTS", value:totalContacts, color:GOLD },
                          { label:"SUBSCRIBERS", value:totalSubs, color:"#4ade80" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="px-5 py-4 text-center">
                            <p style={{ fontFamily:"monospace",fontSize:7,letterSpacing:"0.2em",color:TEXT_MUTED,marginBottom:6 }}>{label}</p>
                            <p style={{ fontFamily:"monospace",fontSize:24,fontWeight:900,color,textShadow:`0 0 20px ${color}50` }}>{value}</p>
                          </div>
                        ))}
                      </div>
                      {/* Device split */}
                      {pageViews > 0 && (() => {
                        const mobile = (analytics?.mobileViews as number) ?? 0;
                        const desktop = (analytics?.desktopViews as number) ?? 0;
                        const tracked = mobile + desktop;
                        const mobilePct = tracked > 0 ? Math.round((mobile / tracked) * 100) : 0;
                        const desktopPct = tracked > 0 ? 100 - mobilePct : 0;
                        return (
                          <div className="px-5 py-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                            <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.2em",color:TEXT_MUTED,marginBottom:12 }}>DEVICE BREAKDOWN</p>
                            <div className="flex items-center gap-4">
                              {/* Split bar */}
                              <div className="flex-1 flex h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                                {mobilePct > 0 && <div className="adm-bar h-full" style={{ width:`${mobilePct}%`, background:"linear-gradient(90deg,#a78bfa,#8b5cf6)" }} />}
                                {desktopPct > 0 && <div className="adm-bar h-full" style={{ width:`${desktopPct}%`, background:"linear-gradient(90deg,rgba(96,165,250,0.5),#60a5fa)", animationDelay:"60ms" }} />}
                              </div>
                              {/* Labels */}
                              <div className="flex gap-4 flex-shrink-0">
                                <div className="flex items-center gap-1.5">
                                  <span style={{ display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#8b5cf6",flexShrink:0 }} />
                                  <div>
                                    <p style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#a78bfa" }}>{mobilePct}%</p>
                                    <p style={{ fontFamily:"monospace",fontSize:7,color:TEXT_MUTED,letterSpacing:"0.1em" }}>MOBILE ({mobile.toLocaleString()})</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span style={{ display:"inline-block",width:7,height:7,borderRadius:"50%",background:"#60a5fa",flexShrink:0 }} />
                                  <div>
                                    <p style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#60a5fa" }}>{desktopPct}%</p>
                                    <p style={{ fontFamily:"monospace",fontSize:7,color:TEXT_MUTED,letterSpacing:"0.1em" }}>DESKTOP ({desktop.toLocaleString()})</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Country table */}
                      <div className="px-5 py-5">
                        <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.2em",color:TEXT_MUTED,marginBottom:14 }}>TOP TRAFFIC SOURCES</p>
                        {sorted.length === 0 ? (
                          <p style={{ fontFamily:"monospace",fontSize:10,color:TEXT_MUTED }}>No traffic data yet — visits will appear here once people browse the site.</p>
                        ) : (
                          <div className="space-y-3">
                            {sorted.map((c, i) => (
                              <div key={c.code} className="grid items-center gap-3" style={{ gridTemplateColumns:"20px 20px 1fr auto" }}>
                                <span style={{ fontFamily:"monospace",fontSize:9,color:TEXT_MUTED }}>{i+1}</span>
                                <span className="text-base">{countryFlag(c.code)}</span>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span style={{ fontSize:11,color:"rgba(255,255,255,0.85)",fontWeight:600 }}>{countryName(c.code)}</span>
                                  </div>
                                  <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                                    <div className="adm-bar h-full rounded-full" style={{ width:`${(c.views/maxViews)*100}%`, background:`linear-gradient(90deg,rgba(96,165,250,0.5),#60a5fa)` }} />
                                  </div>
                                </div>
                                <div className="flex gap-3 text-right flex-shrink-0">
                                  <div>
                                    <p style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#60a5fa" }}>{c.views.toLocaleString()}</p>
                                    <p style={{ fontFamily:"monospace",fontSize:7,color:TEXT_MUTED,letterSpacing:"0.1em" }}>VIEWS</p>
                                  </div>
                                  {c.contacts > 0 && (
                                    <div>
                                      <p style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:GOLD }}>{c.contacts}</p>
                                      <p style={{ fontFamily:"monospace",fontSize:7,color:TEXT_MUTED,letterSpacing:"0.1em" }}>MSGS</p>
                                    </div>
                                  )}
                                  {c.subscribers > 0 && (
                                    <div>
                                      <p style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#4ade80" }}>{c.subscribers}</p>
                                      <p style={{ fontFamily:"monospace",fontSize:7,color:TEXT_MUTED,letterSpacing:"0.1em" }}>SUBS</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* ── ORDERS ── */}
            {tab === "Orders" && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={ShoppingBag} />
                  <StatCard label="Completed" value={completedOrders.length} icon={TrendingUp} />
                  <StatCard label="Avg Order" value={completedOrders.length?`$${(totalRevenue/completedOrders.length).toFixed(0)}`:"$0"} icon={TrendingUp} />
                  <StatCard label="Refunded" value={`$${refundedRevenue}`} />
                </div>

                <FormSection title="Record Manual Sale">
                  <form onSubmit={saveOrder} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Customer Name *" required value={orderForm.customerName} onChange={e=>setOrderForm({...orderForm,customerName:e.target.value})} placeholder="Jay Smith" />
                      <Input label="Customer Email *" required type="email" value={orderForm.customerEmail} onChange={e=>setOrderForm({...orderForm,customerEmail:e.target.value})} placeholder="jay@gmail.com" />
                      <Sel label="Type" options={["beat","service","drumkit"]} value={orderForm.type} onChange={e=>setOrderForm({...orderForm,type:e.target.value as Order["type"],itemId:"",itemTitle:""})} />
                      {orderForm.type === "beat" ? (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: TEXT_DIM }}>
                            <span style={{ color: GOLD, fontSize: 10 }}>▶</span>Beat *
                          </label>
                          <select required value={orderForm.itemId}
                            onChange={e => { const b = beats.find(x=>x.id===e.target.value); setOrderForm({...orderForm,itemId:e.target.value,itemTitle:b?.title??""}); }}
                            className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all"
                            style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}` }}>
                            <option value="">Select a beat…</option>
                            {beats.filter(b=>!b.soldExclusive).map(b=>(
                              <option key={b.id} value={b.id}>{b.title} — {b.genre} · ${b.licenses.find(l=>l.name==="Exclusive")?.price ?? "?"} excl.</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <Input label="Item Title *" required value={orderForm.itemTitle} onChange={e=>setOrderForm({...orderForm,itemTitle:e.target.value})} placeholder="Mix & Master / Kit name" />
                      )}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: TEXT_DIM }}>
                          <span style={{ color: GOLD, fontSize: 10 }}>▶</span>License Type
                        </label>
                        <select value={orderForm.licenseType} onChange={e=>setOrderForm({...orderForm,licenseType:e.target.value})}
                          className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all"
                          style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}` }}>
                          <option value="">— Select —</option>
                          <option value="Exclusive">Exclusive</option>
                        </select>
                      </div>
                      <Input label="Amount ($) *" required type="number" step="0.01" value={orderForm.amount} onChange={e=>setOrderForm({...orderForm,amount:e.target.value})} placeholder="99" />
                      <Sel label="Status" options={["completed","pending","refunded"]} value={orderForm.status} onChange={e=>setOrderForm({...orderForm,status:e.target.value as Order["status"]})} />
                      <Input label="Notes (optional)" value={orderForm.notes} onChange={e=>setOrderForm({...orderForm,notes:e.target.value})} placeholder="PayPal / Cash App / etc." />
                    </div>
                    {orderForm.type==="beat" && orderForm.itemId && orderForm.licenseType==="Exclusive" && (
                      <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)" }}>
                        <span className="text-base flex-shrink-0">⚠</span>
                        <p className="text-sm" style={{ color:"#f87171" }}>
                          Saving this order will <strong>automatically remove &ldquo;{beats.find(b=>b.id===orderForm.itemId)?.title}&rdquo; from the store</strong> and back up the full beat record to the Exclusive Archive.
                        </p>
                      </div>
                    )}
                    {orderMsg && <p className="text-sm font-medium" style={{ color:"#4ade80" }}>{orderMsg}</p>}
                    <GoldSubmit saving={orderSaving} label="Record Sale" />
                  </form>
                </FormSection>

                <div>
                  <SectionHeader title={`Orders (${orders.length})`} action={orders.length>0?<GoldBtn onClick={exportOrders} small>Export CSV</GoldBtn>:undefined} />
                  {orders.length===0 ? <p className="text-sm" style={{ color:"#444" }}>No orders recorded yet.</p> : (
                    <div className="space-y-2">
                      {orders.map(o => (
                        <div key={o.id} className="rounded-2xl p-4" style={{ background:BG_CARD, border:`1px solid ${BORDER_SUBTLE}` }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="font-bold text-white text-sm">{o.customerName}</p>
                                <Badge color={o.status==="completed"?"#4ade80":o.status==="refunded"?"#f87171":"#fbbf24"} bg={o.status==="completed"?"rgba(74,222,128,0.1)":o.status==="refunded"?"rgba(239,68,68,0.1)":"rgba(251,191,36,0.1)"}>{o.status.toUpperCase()}</Badge>
                              </div>
                              <p className="text-sm" style={{ color:"#aaa" }}>{o.itemTitle}{o.licenseType?` · ${o.licenseType}`:""}</p>
                              <p className="text-xs mt-0.5" style={{ color:"#555" }}>{o.customerEmail} · {new Date(o.createdAt).toLocaleDateString()}{o.notes?` · ${o.notes}`:""}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <p className="text-base font-black" style={{ color:o.status==="refunded"?"#f87171":GOLD }}>{o.status==="refunded"?"-":""}${o.amount}</p>
                              <div className="flex gap-1.5 flex-wrap">
                                {o.status!=="completed" && <button onClick={()=>updateOrderStatus(o.id,"completed")} className="text-xs px-2 py-1 rounded-lg" style={{ background:"rgba(74,222,128,0.08)",color:"#4ade80" }}>Complete</button>}
                                {o.status!=="refunded" && <button onClick={()=>updateOrderStatus(o.id,"refunded")} className="text-xs px-2 py-1 rounded-lg" style={{ background:"rgba(239,68,68,0.08)",color:"#f87171" }}>Refund</button>}
                                {o.licenseType && <button onClick={async()=>{ const r=await fetch("/api/license",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buyerName:o.customerName,buyerEmail:o.customerEmail,beatTitle:o.itemTitle,beatId:o.itemId??"",licenseType:o.licenseType,purchaseDate:o.createdAt,orderId:o.id,amount:o.amount})}); const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`LuchiBeats_License_${o.itemTitle.replace(/[^a-zA-Z0-9]/g,"_")}.txt`; a.click(); URL.revokeObjectURL(url); }} className="text-xs px-2 py-1 rounded-lg" style={{ background:GOLD_DIM,color:GOLD }}>License</button>}
                                <button onClick={()=>deleteOrder(o.id)} className="text-xs px-2 py-1 rounded-lg hover:text-red-400 transition-colors" style={{ color:"#444",background:"#1a1a1a" }}>Delete</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── TESTIMONIALS ── */}
            {tab === "Add Artist Testimonial" && (
              <>
                <FormSection title="Add Testimonial">
                  <form onSubmit={saveTestimonial} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Name *" required value={testForm.name} onChange={e=>setTestForm({...testForm,name:e.target.value})} placeholder="Artist Name" />
                      <Input label="Title" value={testForm.title} onChange={e=>setTestForm({...testForm,title:e.target.value})} placeholder="Artist" />
                    </div>
                    {/* Photo upload */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Photo (optional)</p>
                      <div className="flex items-center gap-4">
                        {testForm.image ? (
                          <div className="relative flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={testForm.image} alt="preview" className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: GOLD_BORDER }} />
                            <button type="button" onClick={()=>setTestForm(f=>({...f,image:""}))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black border flex items-center justify-center text-xs leading-none" style={{ borderColor:"#333",color:"#888" }}>×</button>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background:BG_INPUT, border:`1px dashed ${BORDER_SUBTLE}` }}>
                            <span className="text-lg" style={{ color:"#333" }}>+</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <input ref={testFileRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadTestimonialPhoto(f); e.target.value=""; }} />
                          <button type="button" disabled={testUploading} onClick={()=>testFileRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors" style={{ background:GOLD_DIM, color:GOLD, opacity:testUploading?0.5:1 }}>
                            {testUploading ? "Uploading…" : testForm.image ? "Change Photo" : "Choose Photo"}
                          </button>
                          <p className="text-xs mt-1.5" style={{ color:TEXT_MUTED }}>JPG, PNG, or WEBP — will be stored on CDN</p>
                        </div>
                      </div>
                    </div>
                    <Sel label="Photo Position" options={["top","center","bottom"]} value={testForm.objectPosition} onChange={e=>setTestForm({...testForm,objectPosition:e.target.value})} />
                    <Textarea label="Quote *" required rows={4} value={testForm.quote} onChange={e=>setTestForm({...testForm,quote:e.target.value})} placeholder="What did they say?" />
                    {testMsg && <p className="text-sm font-medium" style={{ color:"#4ade80" }}>{testMsg}</p>}
                    <GoldSubmit saving={false} label="Add Testimonial" />
                  </form>
                </FormSection>

                <div>
                  <SectionHeader title={`Testimonials (${testimonials.length})`} />
                  {testimonials.length===0 ? <p className="text-sm" style={{ color:"#444" }}>No testimonials added via admin yet.</p> : (
                    <div className="space-y-2">
                      {testimonials.map(t => (
                        <div key={t.id} className="p-4 rounded-2xl" style={{ background:BG_CARD, border:`1px solid ${BORDER_SUBTLE}` }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-white text-sm">{t.name} <span className="text-xs font-normal" style={{ color:"#555" }}>— {t.title}</span></p>
                              <p className="text-sm mt-1 leading-relaxed" style={{ color:"#666" }}>&ldquo;{t.quote}&rdquo;</p>
                            </div>
                            <button onClick={()=>deleteTestimonial(t.id)} className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors flex-shrink-0" style={{ color:"#444",background:"#1a1a1a" }}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── MESSAGES ── */}
            {tab === "Messages" && (() => {
              const inboxCount   = messages.filter(m=>!m.folder||m.folder==="inbox").length;
              const unreadInbox  = messages.filter(m=>(!m.folder||m.folder==="inbox")&&!m.read).length;
              const folderDefs: { id: typeof msgFolder; label: string; icon: string; count: number; unread: number }[] = [
                { id:"inbox",   label:"Inbox",   icon:"📥", count:inboxCount, unread:unreadInbox },
                { id:"starred", label:"Starred", icon:"⭐", count:messages.filter(m=>m.starred&&m.folder!=="trash").length, unread:0 },
                { id:"replied", label:"Sent",    icon:"↩", count:messages.filter(m=>m.replied&&m.folder!=="trash").length, unread:0 },
                { id:"archive", label:"Archive", icon:"🗄", count:messages.filter(m=>m.folder==="archive").length, unread:0 },
                { id:"trash",   label:"Trash",   icon:"🗑", count:messages.filter(m=>m.folder==="trash").length, unread:0 },
              ];
              const folderMsgs = messages.filter(m => {
                if (msgFolder==="inbox")   return !m.folder||m.folder==="inbox";
                if (msgFolder==="starred") return m.starred&&m.folder!=="trash";
                if (msgFolder==="replied") return m.replied&&m.folder!=="trash";
                if (msgFolder==="archive") return m.folder==="archive";
                if (msgFolder==="trash")   return m.folder==="trash";
                return true;
              });
              const openMsg = expandedMsg ? messages.find(m=>m.id===expandedMsg) ?? null : null;

              function fmtDate(d: string) {
                const date = new Date(d);
                const now = new Date();
                const diff = now.getTime() - date.getTime();
                if (diff < 86400000 && date.getDate()===now.getDate()) return date.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
                if (diff < 604800000) return date.toLocaleDateString("en-US",{weekday:"short"});
                return date.toLocaleDateString("en-US",{month:"short",day:"numeric"});
              }

              return (
                <div className="rounded-xl overflow-hidden flex-1 flex flex-col min-h-0" style={{ background:BG_CARD, border:`1px solid ${BORDER_SUBTLE}` }}>
                  <div className="flex flex-1 min-h-0">

                    {/* ── Left sidebar: folders ── */}
                    <div className="hidden md:flex flex-shrink-0 flex-col" style={{ width:148, minWidth:148, borderRight:`1px solid ${BORDER_SUBTLE}`, background:BG_DEEP }}>
                      <div className="px-3 pt-4 pb-3 flex items-center justify-between">
                        <span className="text-xs font-black tracking-widest uppercase" style={{ color:GOLD }}>Mail</span>
                        <button title="Refresh" onClick={async()=>{ const m=await load("/api/admin/messages"); if(m) setMessages(m); }}
                          className="text-sm transition-colors" style={{ color:TEXT_MUTED }}
                          onMouseEnter={e=>e.currentTarget.style.color=GOLD} onMouseLeave={e=>e.currentTarget.style.color=TEXT_MUTED}>↻</button>
                      </div>
                      <nav className="flex-1 px-2 space-y-0.5">
                        {folderDefs.map(f => (
                          <button key={f.id} onClick={()=>{ setMsgFolder(f.id); setExpandedMsg(null); }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-all"
                            style={{ background:msgFolder===f.id?"rgba(201,168,76,0.1)":"transparent", color:msgFolder===f.id?GOLD:TEXT_DIM, border:`1px solid ${msgFolder===f.id?GOLD_BORDER:"transparent"}` }}>
                            <span style={{ fontSize:13 }}>{f.icon}</span>
                            <span className="flex-1 truncate">{f.label}</span>
                            {f.count>0 && <span className="text-xs font-black px-1.5 py-0.5 rounded-full" style={{ background: f.unread>0?"rgba(201,168,76,0.2)":"rgba(255,255,255,0.06)", color: f.unread>0?GOLD:TEXT_MUTED, minWidth:20, textAlign:"center" }}>{f.unread>0?f.unread:f.count}</span>}
                          </button>
                        ))}
                      </nav>
                      {messages.length>0 && (
                        <div className="p-2 border-t" style={{ borderColor:BORDER_SUBTLE }}>
                          <button onClick={exportMessages} className="w-full text-xs px-2 py-1.5 rounded-lg font-semibold text-center transition-all"
                            style={{ color:TEXT_MUTED, background:"rgba(255,255,255,0.03)" }}
                            onMouseEnter={e=>e.currentTarget.style.color=GOLD} onMouseLeave={e=>e.currentTarget.style.color=TEXT_MUTED}>
                            Export CSV
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ── Message list ── */}
                    <div className="flex-shrink-0 flex flex-col" style={{ width:"28%", minWidth:220, maxWidth:320, borderRight:`1px solid ${BORDER_SUBTLE}`, overflowY:"auto" }}>
                      {/* List header */}
                      <div className="px-4 py-3 sticky top-0 z-10 flex items-center justify-between" style={{ background:BG_CARD, borderBottom:`1px solid ${BORDER_SUBTLE}` }}>
                        <span className="text-xs font-black text-white">{folderDefs.find(f=>f.id===msgFolder)?.label}</span>
                        <span className="text-xs" style={{ color:TEXT_MUTED }}>{folderMsgs.length}</span>
                      </div>
                      {folderMsgs.length===0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
                          <p className="text-2xl mb-2">{msgFolder==="trash"?"🗑️":msgFolder==="starred"?"⭐":msgFolder==="replied"?"↩️":"📭"}</p>
                          <p className="text-xs font-semibold" style={{ color:TEXT_MUTED }}>
                            {msgFolder==="inbox"?"No messages yet":msgFolder==="starred"?"No starred messages":msgFolder==="replied"?"No sent messages":msgFolder==="archive"?"Archive empty":"Trash empty"}
                          </p>
                        </div>
                      ) : folderMsgs.map(m => {
                        const isSelected = expandedMsg===m.id;
                        const isUnread = !m.read && (msgFolder==="inbox");
                        return (
                          <button key={m.id} onClick={()=>{ setExpandedMsg(m.id); if(!m.read) markRead(m.id,true); }}
                            className="w-full text-left px-4 py-3 transition-all relative"
                            style={{ background: isSelected?"rgba(201,168,76,0.08)":isUnread?"rgba(201,168,76,0.03)":"transparent", borderBottom:`1px solid ${BORDER_SUBTLE}`, borderLeft: isSelected?`2px solid ${GOLD}`:"2px solid transparent" }}>
                            {/* Unread dot */}
                            {isUnread && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background:GOLD }} />}
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <span className="text-xs truncate" style={{ fontWeight: isUnread?700:500, color: isUnread?"white":TEXT_DIM, maxWidth:150 }}>{m.name}</span>
                              <span className="text-xs flex-shrink-0" style={{ color:TEXT_MUTED, fontSize:10 }}>{fmtDate(m.createdAt)}</span>
                            </div>
                            <p className="text-xs truncate mb-0.5" style={{ fontWeight: isUnread?600:400, color: isUnread?"rgba(255,255,255,0.8)":TEXT_MUTED }}>{m.subject}</p>
                            <p className="text-xs truncate" style={{ color:TEXT_MUTED, fontSize:10 }}>{m.message.slice(0,60)}</p>
                            {(m.starred||m.replied) && (
                              <div className="flex gap-1 mt-1">
                                {m.starred && <span style={{ fontSize:9, color:GOLD }}>★ starred</span>}
                                {m.replied && <span style={{ fontSize:9, color:"#4ade80" }}>↩ replied</span>}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* ── Reading pane ── */}
                    <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth:0 }}>
                      {!openMsg ? (
                        <div className="flex-1 flex flex-col items-center justify-center" style={{ color:TEXT_MUTED }}>
                          <Mail size={36} style={{ opacity:0.15, marginBottom:12 }} />
                          <p className="text-sm font-semibold" style={{ opacity:0.4 }}>Select a message to read</p>
                        </div>
                      ) : (
                        <>
                          {/* Message header */}
                          <div className="px-6 py-5" style={{ borderBottom:`1px solid ${BORDER_SUBTLE}` }}>
                            <h2 className="text-base font-black text-white mb-3 leading-snug">{openMsg.subject}</h2>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                                    style={{ background:`linear-gradient(135deg,${GOLD},#A8892E)` }}>
                                    {openMsg.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{openMsg.name}</p>
                                    <p className="text-xs" style={{ color:TEXT_MUTED }}>{openMsg.email}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs" style={{ color:TEXT_MUTED }}>{new Date(openMsg.createdAt).toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"})}</p>
                              </div>
                            </div>
                          </div>

                          {/* Message body */}
                          <div className="flex-1 overflow-y-auto px-6 py-5">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color:"rgba(255,255,255,0.75)", lineHeight:1.8 }}>{openMsg.message}</p>
                          </div>

                          {/* Action bar */}
                          <div className="px-6 py-4 flex flex-wrap gap-2" style={{ borderTop:`1px solid ${BORDER_SUBTLE}`, background:BG_DEEP }}>
                            <a href={`mailto:${openMsg.email}?subject=Re: ${encodeURIComponent(openMsg.subject)}`}
                              onClick={()=>markReplied(openMsg.id)}
                              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold"
                              style={{ background:`linear-gradient(90deg,#A8892E,${GOLD})`, color:"#000" }}>
                              ↩ Reply
                            </a>
                            <button onClick={()=>starMessage(openMsg.id,!openMsg.starred)}
                              className="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                              style={{ background: openMsg.starred?"rgba(201,168,76,0.15)":"rgba(255,255,255,0.04)", color: openMsg.starred?GOLD:TEXT_MUTED, border:`1px solid ${openMsg.starred?GOLD_BORDER:BORDER_SUBTLE}` }}>
                              {openMsg.starred?"★ Starred":"☆ Star"}
                            </button>
                            {!openMsg.replied && (
                              <button onClick={()=>markReplied(openMsg.id)}
                                className="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                                style={{ background:"rgba(74,222,128,0.08)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)" }}>
                                ✓ Mark Replied
                              </button>
                            )}
                            {openMsg.folder!=="archive" && (
                              <button onClick={()=>archiveMessage(openMsg.id)}
                                className="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                                style={{ background:"rgba(255,255,255,0.04)",color:TEXT_DIM,border:`1px solid ${BORDER_SUBTLE}` }}>
                                Archive
                              </button>
                            )}
                            {(openMsg.folder==="archive"||openMsg.folder==="trash") && (
                              <button onClick={()=>restoreMessage(openMsg.id)}
                                className="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                                style={{ background:"rgba(74,222,128,0.08)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)" }}>
                                Restore
                              </button>
                            )}
                            {openMsg.folder!=="trash" ? (
                              <button onClick={()=>{ trashMessage(openMsg.id); setExpandedMsg(null); }}
                                className="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                                style={{ background:"rgba(239,68,68,0.06)",color:"#f87171",border:"1px solid rgba(239,68,68,0.15)" }}>
                                Trash
                              </button>
                            ) : (
                              <button onClick={()=>{ deleteMessage(openMsg.id); setExpandedMsg(null); }}
                                className="text-xs px-3 py-2 rounded-lg font-bold transition-all"
                                style={{ background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.25)" }}>
                                Delete Forever
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── SUBSCRIBERS ── */}
            {tab === "Subscribers" && (
              <>
                {/* Folder nav */}
                <div className="flex items-center gap-2">
                  {([["list","All Subscribers",subscribers.length,null],["giveaway","🎯 Giveaway Blast",null,null]] as const).map(([view,label,count])=>(
                    <button key={view} onClick={()=>{ setSubView(view as "list"|"giveaway"); setGiveawayResult(null); setGiveawayConfirm(false); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ background:subView===view?"rgba(201,168,76,0.12)":"transparent", color:subView===view?GOLD:TEXT_MUTED, border:`1px solid ${subView===view?"rgba(201,168,76,0.3)":"transparent"}` }}>
                      {label}
                      {count!==null && <span className="px-1.5 py-0.5 rounded text-xs" style={{ background:"rgba(201,168,76,0.1)",color:GOLD }}>{count}</span>}
                    </button>
                  ))}
                </div>

                {/* ── ALL SUBSCRIBERS view ── */}
                {subView==="list" && (() => {
                  const now = new Date();
                  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
                  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate()-7);

                  const thisMonth  = subscribers.filter(s=>new Date(s.createdAt)>=startOfMonth).length;
                  const lastMonth  = subscribers.filter(s=>new Date(s.createdAt)>=startOfLastMonth&&new Date(s.createdAt)<startOfMonth).length;
                  const thisWeek   = subscribers.filter(s=>new Date(s.createdAt)>=startOfWeek).length;
                  const growthPct  = lastMonth===0 ? null : Math.round(((thisMonth-lastMonth)/lastMonth)*100);

                  // Monthly chart — last 6 months
                  const months: { label:string; count:number }[] = [];
                  for (let i=5; i>=0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
                    const end = new Date(now.getFullYear(), now.getMonth()-i+1, 1);
                    months.push({
                      label: d.toLocaleString("en-US",{month:"short"}),
                      count: subscribers.filter(s=>{ const c=new Date(s.createdAt); return c>=d&&c<end; }).length,
                    });
                  }
                  const maxCount = Math.max(...months.map(m=>m.count), 1);

                  // Filtered list
                  const filtered = subscribers.filter(s=>s.email.toLowerCase().includes(subSearch.toLowerCase()));

                  function timeAgo(date: string) {
                    const diff = Math.floor((now.getTime()-new Date(date).getTime())/1000);
                    if (diff<60) return "just now";
                    if (diff<3600) return `${Math.floor(diff/60)}m ago`;
                    if (diff<86400) return `${Math.floor(diff/3600)}h ago`;
                    if (diff<2592000) return `${Math.floor(diff/86400)}d ago`;
                    return `${Math.floor(diff/2592000)}mo ago`;
                  }

                  return (
                    <>
                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard label="Total" value={subscribers.length} icon={FileText} />
                        <StatCard label="This Month" value={thisMonth} sub={growthPct!==null?`${growthPct>=0?"+":""}${growthPct}% vs last month`:undefined} />
                        <StatCard label="This Week" value={thisWeek} />
                        <StatCard label="Last Month" value={lastMonth} />
                      </div>

                      {/* Growth chart */}
                      {subscribers.length>0 && (
                        <Card>
                          <SectionHeader title="Growth — Last 6 Months" />
                          <div className="flex items-end gap-2 h-28">
                            {months.map(m=>(
                              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                                <span className="text-xs font-bold" style={{ color:m.count>0?GOLD:TEXT_MUTED }}>{m.count>0?m.count:""}</span>
                                <div className="w-full rounded-t-md transition-all" style={{ height:`${Math.max((m.count/maxCount)*80,m.count>0?6:2)}px`, background:m.count>0?`linear-gradient(180deg,${GOLD},rgba(201,168,76,0.4))`:`rgba(255,255,255,0.05)` }} />
                                <span className="text-xs font-semibold" style={{ color:TEXT_MUTED }}>{m.label}</span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Search + export */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text" placeholder="Search by email…" value={subSearch}
                            onChange={e=>setSubSearch(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                            style={{ background:BG_INPUT, border:`1px solid ${BORDER_SUBTLE}`, color:"var(--adm-dim)" }}
                            onFocus={e=>{e.target.style.borderColor=GOLD;e.target.style.boxShadow=`0 0 0 3px ${GOLD_GLOW}`;}}
                            onBlur={e=>{e.target.style.borderColor=BORDER_SUBTLE;e.target.style.boxShadow="none";}}
                          />
                          {subSearch && <button onClick={()=>setSubSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color:TEXT_MUTED }}>×</button>}
                        </div>
                        {subscribers.length>0 && <GoldBtn onClick={exportSubscribers} small>Export CSV</GoldBtn>}
                      </div>

                      {/* List */}
                      <SectionHeader title={subSearch?`${filtered.length} result${filtered.length!==1?"s":""} for "${subSearch}"`:`All Subscribers (${subscribers.length})`} />
                      {subscribers.length===0 ? (
                        <div className="text-center py-12" style={{ color:TEXT_MUTED }}>
                          <p className="text-3xl mb-2">📭</p>
                          <p className="text-sm font-semibold">No subscribers yet</p>
                          <p className="text-xs mt-1">People who sign up on your site will appear here</p>
                        </div>
                      ) : filtered.length===0 ? (
                        <p className="text-sm text-center py-6" style={{ color:TEXT_MUTED }}>No results for &ldquo;{subSearch}&rdquo;</p>
                      ) : (
                        <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid ${BORDER_SUBTLE}` }}>
                          {/* Table header */}
                          <div className="grid grid-cols-12 px-4 py-2.5" style={{ background:BG_INPUT, borderBottom:`1px solid ${BORDER_SUBTLE}` }}>
                            <span className="col-span-1 text-xs font-black tracking-widest" style={{ color:TEXT_MUTED }}>#</span>
                            <span className="col-span-6 text-xs font-black tracking-widest" style={{ color:TEXT_MUTED }}>EMAIL</span>
                            <span className="col-span-3 text-xs font-black tracking-widest" style={{ color:TEXT_MUTED }}>JOINED</span>
                            <span className="col-span-2 text-xs font-black tracking-widest text-right" style={{ color:TEXT_MUTED }}>AGO</span>
                          </div>
                          {/* Rows */}
                          {filtered.map((s,i)=>(
                            <div key={s.id} className="group grid grid-cols-12 items-center px-4 py-3 transition-all"
                              style={{ borderBottom: i<filtered.length-1?`1px solid ${BORDER_SUBTLE}`:"none", background:"transparent" }}
                              onMouseEnter={e=>(e.currentTarget.style.background=GOLD_DIM)}
                              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                              <span className="col-span-1 text-xs font-mono" style={{ color:TEXT_MUTED }}>{i+1}</span>
                              <div className="col-span-6 flex items-center gap-2 min-w-0">
                                <span className="text-sm font-semibold text-white truncate">{s.email}</span>
                                <button
                                  onClick={()=>navigator.clipboard.writeText(s.email)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                                  style={{ background:GOLD_DIM,color:GOLD,border:`1px solid ${GOLD_BORDER}` }}
                                  title="Copy email">
                                  Copy
                                </button>
                              </div>
                              <span className="col-span-3 text-xs" style={{ color:TEXT_MUTED }}>{new Date(s.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                              <div className="col-span-2 flex items-center justify-end gap-2">
                                <span className="text-xs" style={{ color:TEXT_MUTED }}>{timeAgo(s.createdAt)}</span>
                                <button onClick={()=>deleteSubscriber(s.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded"
                                  style={{ color:"#f87171",background:"rgba(239,68,68,0.08)" }}
                                  title="Remove subscriber">
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* ── GIVEAWAY BLAST view ── */}
                {subView==="giveaway" && (() => {
                  // Compute live recipient count
                  // eslint-disable-next-line react-hooks/purity -- recipient count only needs to be roughly current
                  const now = Date.now();
                  const cutoff30 = now - 30*24*60*60*1000;
                  const audienceCount = giveawayForm.audience==="all"
                    ? subscribers.length
                    : subscribers.filter(s=>new Date(s.createdAt).getTime()>=cutoff30).length;

                  async function sendBlast() {
                    setGiveawaySending(true);
                    setGiveawayResult(null);
                    try {
                      const res = await fetch("/api/admin/giveaway-blast", {
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body: JSON.stringify(giveawayForm),
                      });
                      const data = await res.json();
                      setGiveawayResult(data);
                    } finally {
                      setGiveawaySending(false);
                      setGiveawayConfirm(false);
                    }
                  }

                  return (
                    <>
                      {/* Header */}
                      <div className="rounded-2xl p-5" style={{ background:"linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03))", border:`1px solid rgba(201,168,76,0.2)` }}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ background:"rgba(201,168,76,0.1)",border:`1px solid rgba(201,168,76,0.25)` }}>🎯</div>
                          <div>
                            <h3 className="text-base font-black text-white mb-1">Monthly Giveaway Blast</h3>
                            <p className="text-xs" style={{ color:TEXT_MUTED }}>Send a custom email to your subscriber list. Choose your content, target audience, then fire.</p>
                          </div>
                        </div>
                      </div>

                      {/* Result */}
                      {giveawayResult && (
                        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background:giveawayResult.sent>0?"rgba(74,222,128,0.06)":"rgba(239,68,68,0.06)", border:`1px solid ${giveawayResult.sent>0?"rgba(74,222,128,0.2)":"rgba(239,68,68,0.2)"}` }}>
                          <span className="text-xl">{giveawayResult.sent>0?"🚀":"⚠️"}</span>
                          <div>
                            <p className="text-sm font-bold text-white mb-0.5">
                              {giveawayResult.sent>0 ? `Blast sent! ${giveawayResult.sent} email${giveawayResult.sent!==1?"s":""} delivered.` : "No emails were sent."}
                            </p>
                            <p className="text-xs" style={{ color:TEXT_MUTED }}>
                              {giveawayResult.sent} sent · {giveawayResult.failed} failed · {giveawayResult.total} total recipients
                              {giveawayResult.failed>0 && " · Check RESEND_API_KEY env var"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stats bar */}
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard label="Total Subscribers" value={subscribers.length} icon={FileText} />
                        <StatCard label="Target Audience" value={audienceCount} sub={giveawayForm.audience==="all"?"All subscribers":"Last 30 days"} />
                      </div>

                      <Card>
                        <SectionHeader title="Step 1 — What to Send" />
                          <>
                            <Input label="Email Subject" value={giveawayForm.subject}
                              onChange={e=>setGiveawayForm({...giveawayForm,subject:e.target.value})}
                              placeholder="🔥 LuchiBeats Monthly Drop — Exclusive for Subscribers" />
                            <Input label="Badge (small text above headline)" value={giveawayForm.badge}
                              onChange={e=>setGiveawayForm({...giveawayForm,badge:e.target.value})}
                              placeholder="Monthly Giveaway" />
                            <Input label="Headline" value={giveawayForm.headline}
                              onChange={e=>setGiveawayForm({...giveawayForm,headline:e.target.value})}
                              placeholder="This month's exclusive drop is live." />
                            <Textarea label="Body / Message" rows={4} value={giveawayForm.body}
                              onChange={e=>setGiveawayForm({...giveawayForm,body:e.target.value})}
                              placeholder={"Write your message to subscribers here.\nUse line breaks to separate paragraphs."} />
                            <div className="grid grid-cols-2 gap-3">
                              <Input label="Button Label" value={giveawayForm.ctaLabel}
                                onChange={e=>setGiveawayForm({...giveawayForm,ctaLabel:e.target.value})}
                                placeholder="Browse Beats" />
                              <Input label="Button URL" value={giveawayForm.ctaUrl}
                                onChange={e=>setGiveawayForm({...giveawayForm,ctaUrl:e.target.value})}
                                placeholder="https://www.luchibeats.com" />
                            </div>
                          </>
                      </Card>

                      <Card>
                        <SectionHeader title="Step 2 — Who Gets It" />
                        <div className="space-y-2">
                          {([
                            ["all", "All Subscribers", `Send to every subscriber (${subscribers.length} total)`],
                            ["new30", "New Subscribers", `Only subscribers from the last 30 days (${subscribers.filter(s=>new Date(s.createdAt).getTime()>=cutoff30).length} people)`],
                          ] as const).map(([val,label,desc])=>(
                            <button key={val} type="button"
                              onClick={()=>setGiveawayForm({...giveawayForm,audience:val})}
                              className="w-full text-left px-4 py-3 rounded-xl transition-all flex items-start gap-3"
                              style={{ background:giveawayForm.audience===val?"rgba(201,168,76,0.1)":"rgba(255,255,255,0.02)", border:`1px solid ${giveawayForm.audience===val?"rgba(201,168,76,0.3)":BORDER_SUBTLE}` }}>
                              <span className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                style={{ borderColor:giveawayForm.audience===val?GOLD:TEXT_MUTED }}>
                                {giveawayForm.audience===val && <span className="w-2 h-2 rounded-full" style={{ background:GOLD }} />}
                              </span>
                              <div>
                                <p className="text-sm font-bold" style={{ color:giveawayForm.audience===val?GOLD:"var(--adm-dim)" }}>{label}</p>
                                <p className="text-xs mt-0.5" style={{ color:TEXT_MUTED }}>{desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </Card>

                      {/* Confirm + Send */}
                      <Card>
                        <SectionHeader title="Step 3 — Send" />
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-bold text-white">Ready to fire?</p>
                            <p className="text-xs mt-0.5" style={{ color:TEXT_MUTED }}>
                              This will send to <span style={{ color:GOLD,fontWeight:700 }}>{audienceCount} subscriber{audienceCount!==1?"s":""}</span>.
                              {audienceCount===0 && " No one matches this filter."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {giveawayConfirm ? (
                              <>
                                <button type="button" onClick={()=>setGiveawayConfirm(false)}
                                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                  style={{ background:"rgba(255,255,255,0.04)",color:TEXT_MUTED,border:`1px solid ${BORDER_SUBTLE}` }}>
                                  Cancel
                                </button>
                                <button type="button"
                                  onClick={sendBlast}
                                  disabled={giveawaySending || audienceCount===0}
                                  className="px-5 py-2 rounded-xl text-sm font-black transition-all"
                                  style={{ background:giveawaySending||audienceCount===0?"rgba(201,168,76,0.15)":"linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", color:giveawaySending||audienceCount===0?TEXT_MUTED:"#000", cursor:audienceCount===0?"not-allowed":"pointer" }}>
                                  {giveawaySending ? "Sending…" : `🚀 Send to ${audienceCount}`}
                                </button>
                              </>
                            ) : (
                              <button type="button"
                                onClick={()=>setGiveawayConfirm(true)}
                                disabled={audienceCount===0 || !giveawayForm.subject.trim()}
                                className="px-5 py-2 rounded-xl text-sm font-black transition-all"
                                style={{ background:audienceCount===0||!giveawayForm.subject.trim()?"rgba(255,255,255,0.04)":"rgba(201,168,76,0.12)", color:audienceCount===0||!giveawayForm.subject.trim()?TEXT_DIM:GOLD, border:`1px solid ${audienceCount===0||!giveawayForm.subject.trim()?BORDER_SUBTLE:"rgba(201,168,76,0.3)"}`, cursor:audienceCount===0||!giveawayForm.subject.trim()?"not-allowed":"pointer" }}>
                                Review &amp; Send →
                              </button>
                            )}
                          </div>
                        </div>
                        {giveawayConfirm && (
                          <div className="rounded-xl p-4 mt-3" style={{ background:"rgba(201,168,76,0.06)",border:`1px solid rgba(201,168,76,0.2)` }}>
                            <p className="text-xs font-black tracking-widest mb-3" style={{ color:GOLD }}>CONFIRM BLAST</p>
                            <div className="space-y-2 text-xs" style={{ color:TEXT_MUTED }}>
                              <div className="flex gap-2"><span style={{ color:TEXT_DIM,width:80,flexShrink:0 }}>Subject</span><span className="text-white font-semibold">{giveawayForm.subject}</span></div>
                              <div className="flex gap-2"><span style={{ color:TEXT_DIM,width:80,flexShrink:0 }}>Audience</span><span className="text-white font-semibold">{audienceCount} subscriber{audienceCount!==1?"s":""}</span></div>
                            </div>
                          </div>
                        )}
                        {!giveawayForm.subject.trim() && <p className="text-xs mt-3" style={{ color:"#f87171" }}>⚠ Enter an email subject to continue.</p>}
                      </Card>
                    </>
                  );
                })()}
              </>
            )}

            {/* ── MERCH ── */}
            {tab === "Merch" && (
              <>
                {/* Connection status */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <SectionHeader title="Shopify Connection" />
                    <span className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{ background:shopifyConfig?.connected?"rgba(74,222,128,0.1)":"rgba(201,168,76,0.08)", color:shopifyConfig?.connected?"#4ade80":TEXT_MUTED, border:`1px solid ${shopifyConfig?.connected?"rgba(74,222,128,0.2)":"rgba(201,168,76,0.15)"}` }}>
                      {shopifyConfig?.connected ? "● Connected" : "○ Not Connected"}
                    </span>
                  </div>
                  <p className="text-xs mb-5" style={{ color:TEXT_MUTED }}>
                    Enter your Shopify Storefront API credentials to pull products onto the <code style={{ color:GOLD }}>/merch</code> page automatically. The Storefront API token is public-safe — it only has read access.
                  </p>
                  <form onSubmit={saveShopify} className="space-y-3">
                    <Input label="Store Handle" value={shopifyForm.storeHandle}
                      onChange={e=>setShopifyForm({...shopifyForm,storeHandle:e.target.value})}
                      placeholder="yourstore (without .myshopify.com)" />
                    <Input label="Storefront API Token" value={shopifyForm.storefrontToken}
                      onChange={e=>setShopifyForm({...shopifyForm,storefrontToken:e.target.value})}
                      placeholder="Public Storefront access token" />
                    <Input label="Collection ID (optional)" value={shopifyForm.collectionId}
                      onChange={e=>setShopifyForm({...shopifyForm,collectionId:e.target.value})}
                      placeholder="Filter to a specific collection gid://..." />
                    {shopifyMsg && <p className="text-sm font-medium" style={{ color:"#4ade80" }}>{shopifyMsg}</p>}
                    <GoldSubmit saving={shopifySaving} label="Save Shopify Config" />
                  </form>
                </Card>

                {/* How to connect */}
                <Card>
                  <SectionHeader title="How to Connect Shopify" />
                  <ol className="space-y-4 mt-2">
                    {[
                      { step:"1", title:"Create or open your Shopify store", desc:'Go to shopify.com and create an account (14-day free trial, or use an existing store).' },
                      { step:"2", title:"Enable the Storefront API", desc:'In your Shopify admin → Settings → Apps and sales channels → Develop apps → Create an app. Enable Storefront API access with the "unauthenticated_read_product_listings" scope.' },
                      { step:"3", title:"Generate your Storefront API token", desc:'In the app you just created → API credentials → Install app → copy the Storefront API access token. This is the public token — safe to save here.' },
                      { step:"4", title:"Enter credentials above", desc:'Paste your store handle (e.g. "luchibeats") and the Storefront API token in the fields above and save.' },
                      { step:"5", title:"Products appear automatically", desc:'Once connected, any products in your Shopify store will display on /merch. Tag products with "merch" or create a "Merch" collection and paste the collection ID above to filter.' },
                    ].map(({ step, title, desc }) => (
                      <li key={step} className="flex gap-4">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                          style={{ background:"rgba(201,168,76,0.12)",color:GOLD,border:`1px solid rgba(201,168,76,0.25)` }}>{step}</span>
                        <div>
                          <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                          <p className="text-xs" style={{ color:TEXT_MUTED }}>{desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                {/* Current merch page status */}
                <Card>
                  <SectionHeader title="Merch Page Status" />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"rgba(201,168,76,0.08)", border:`1px solid rgba(201,168,76,0.2)` }}>
                      <Tag size={18} style={{ color:GOLD }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-1">Currently showing: Coming Soon</p>
                      <p className="text-xs mb-3" style={{ color:TEXT_MUTED }}>The public merch page at <code style={{ color:GOLD }}>/merch</code> displays a styled &quot;Coming Soon&quot; page. Once your Shopify store is connected and products are live, you can upgrade this page to show real inventory.</p>
                      <div className="rounded-xl px-4 py-3 text-xs space-y-1" style={{ background:BG_DEEP,border:`1px solid ${BORDER_SUBTLE}` }}>
                        <p style={{ color:TEXT_MUTED }}>When you&apos;re ready to go live with products:</p>
                        <p style={{ color:TEXT_DIM }}>1. Connect Shopify above · 2. Add products in Shopify · 3. Ask Claude to wire up the Storefront API to render product cards on /merch</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Admin API note */}
                <Card>
                  <SectionHeader title="Order Webhooks (Advanced)" />
                  <p className="text-xs mb-3" style={{ color:TEXT_MUTED }}>
                    For automated order tracking (syncing Shopify purchases to your Orders tab), you&apos;ll need Shopify Admin API credentials stored as Vercel environment variables — not here.
                  </p>
                  <div className="rounded-xl p-4 text-xs space-y-1.5" style={{ background:BG_DEEP,border:`1px solid ${BORDER_SUBTLE}` }}>
                    <p className="font-bold" style={{ color:TEXT_MUTED }}>Add these to Vercel env vars when ready:</p>
                    <p style={{ color:TEXT_DIM }}>
                      <code style={{ color:GOLD }}>SHOPIFY_ADMIN_API_KEY</code> · <code style={{ color:GOLD }}>SHOPIFY_WEBHOOK_SECRET</code> · <code style={{ color:GOLD }}>SHOPIFY_STORE_DOMAIN</code>
                    </p>
                  </div>
                </Card>
              </>
            )}

            {/* ── HOMEPAGE ── */}
            {tab === "Homepage" && (
              <form onSubmit={saveHomepage} className="space-y-6">

                {/* SEO */}
                <Card>
                  <SectionHeader title="SEO & Meta Tags" />
                  <p className="text-xs mb-4" style={{ color:TEXT_MUTED }}>Controls the browser tab title and Google search snippet for the homepage. Leave blank to use site defaults.</p>
                  <div className="space-y-3">
                    <Input label="Page Title" value={homepageForm.seoTitle} onChange={e=>setHomepageForm({...homepageForm,seoTitle:e.target.value})} placeholder="LuchiBeats — Premium Beats & Mixing Services" />
                    <Textarea label="Meta Description" rows={2} value={homepageForm.seoDescription} onChange={e=>setHomepageForm({...homepageForm,seoDescription:e.target.value})} placeholder="Buy premium beats, book professional mixing services…" />
                  </div>
                </Card>

                {/* Hero Overlay */}
                <Card>
                  <SectionHeader title="Hero Overlay" />
                  <p className="text-xs mb-4" style={{ color:TEXT_MUTED }}>Optional text that appears over the hero video. Leave headline blank to show the video only.</p>
                  <div className="space-y-3">
                    <Input label="Headline (optional)" value={homepageForm.heroHeadline} onChange={e=>setHomepageForm({...homepageForm,heroHeadline:e.target.value})} placeholder="e.g. Premium Beats. Professional Sound." />
                    <Input label="Subtext (optional)" value={homepageForm.heroSubtext} onChange={e=>setHomepageForm({...homepageForm,heroSubtext:e.target.value})} placeholder="e.g. Trap · R&B · Afrobeats · Drill" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input label="CTA Button Text (optional)" value={homepageForm.heroCta} onChange={e=>setHomepageForm({...homepageForm,heroCta:e.target.value})} placeholder="e.g. Browse Beats" />
                      <Input label="CTA Button Link" value={homepageForm.heroCtaUrl} onChange={e=>setHomepageForm({...homepageForm,heroCtaUrl:e.target.value})} placeholder="/contact" />
                    </div>
                  </div>
                </Card>

                {/* Stats Counter */}
                <Card>
                  <SectionHeader title="Stats Counter" />
                  <p className="text-xs mb-4" style={{ color:TEXT_MUTED }}>The animated number strip that shows below the marquee. Each row is one stat card.</p>
                  <div className="space-y-2">
                    {formStats.map((stat, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <input type="number" value={stat.value} onChange={e=>{const n=[...formStats];n[i]={...n[i],value:e.target.value};setFormStats(n);}}
                            placeholder="150" className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                            style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                        </div>
                        <div className="col-span-2">
                          <input type="text" value={stat.suffix} onChange={e=>{const n=[...formStats];n[i]={...n[i],suffix:e.target.value};setFormStats(n);}}
                            placeholder="+" className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                            style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                        </div>
                        <div className="col-span-6">
                          <input type="text" value={stat.label} onChange={e=>{const n=[...formStats];n[i]={...n[i],label:e.target.value};setFormStats(n);}}
                            placeholder="Years of Experience" className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                            style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button type="button" onClick={()=>setFormStats(formStats.filter((_,j)=>j!==i))} className="text-sm px-2 py-1 rounded transition-colors" style={{ color:"#f87171",background:"rgba(239,68,68,0.08)" }}>×</button>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs mt-1" style={{ color:TEXT_DIM }}>← Value &nbsp;·&nbsp; Suffix (+, %, hr) &nbsp;·&nbsp; Label</p>
                  </div>
                  <button type="button" onClick={()=>setFormStats([...formStats,{value:"0",suffix:"+",label:""}])}
                    className="mt-3 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                    style={{ background:"rgba(201,168,76,0.08)",color:GOLD,border:`1px solid rgba(201,168,76,0.2)` }}>
                    + Add Stat
                  </button>
                </Card>

                {/* Marquee */}
                <Card>
                  <SectionHeader title="Marquee Ticker" />
                  <Textarea label="Items (one per line — keep SHORT and ALL CAPS)" rows={8} value={homepageForm.marqueeText} onChange={e=>setHomepageForm({...homepageForm,marqueeText:e.target.value})} />
                  <p className="text-xs mt-1.5" style={{ color:TEXT_DIM }}>Scrolls in the gold strip below the hero. Each line becomes one item.</p>
                </Card>

                {/* Beats Section */}
                <Card>
                  <SectionHeader title="Beats Section" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Label (small gold text above headline)" value={homepageForm.beatsLabel} onChange={e=>setHomepageForm({...homepageForm,beatsLabel:e.target.value})} placeholder="FRESH CUTS" />
                    <Input label="Headline" value={homepageForm.beatsHeadline} onChange={e=>setHomepageForm({...homepageForm,beatsHeadline:e.target.value})} placeholder="Latest Beats" />
                  </div>
                </Card>

                {/* Productions */}
                <Card>
                  <SectionHeader title="Productions — YouTube Videos" />
                  <p className="text-xs mb-4" style={{ color:TEXT_MUTED }}>Paste a full YouTube URL or just the video ID. Drag the up/down arrows to reorder.</p>
                  <div className="space-y-3">
                    {formProductions.map((vid, i) => (
                      <div key={i} className="rounded-xl p-3 space-y-2" style={{ background:BG_DEEP,border:`1px solid ${BORDER_SUBTLE}` }}>
                        <div className="flex items-center gap-2">
                          {/* Thumbnail */}
                          {vid.id && (
                            <img src={`https://i.ytimg.com/vi/${vid.id}/default.jpg`} alt="" className="w-14 h-10 object-cover rounded flex-shrink-0" style={{ opacity:0.85 }} />
                          )}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input type="text"
                              value={vid.id.includes("youtube") || vid.id.includes("youtu.be") ? vid.id : vid.id}
                              onChange={e=>{const n=[...formProductions];n[i]={...n[i],id:extractYouTubeId(e.target.value)};setFormProductions(n);}}
                              onBlur={e=>{const n=[...formProductions];n[i]={...n[i],id:extractYouTubeId(e.target.value)};setFormProductions(n);}}
                              placeholder="YouTube URL or video ID"
                              className="px-3 py-2 rounded-lg text-xs outline-none transition-all"
                              style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                            <input type="text" value={vid.artist} onChange={e=>{const n=[...formProductions];n[i]={...n[i],artist:e.target.value};setFormProductions(n);}}
                              placeholder="Artist name"
                              className="px-3 py-2 rounded-lg text-xs outline-none transition-all"
                              style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button type="button" disabled={i===0} onClick={()=>{const n=[...formProductions];[n[i-1],n[i]]=[n[i],n[i-1]];setFormProductions(n);}}
                              className="text-xs px-1.5 py-0.5 rounded disabled:opacity-30" style={{ color:GOLD,background:"rgba(201,168,76,0.08)" }}>▲</button>
                            <button type="button" disabled={i===formProductions.length-1} onClick={()=>{const n=[...formProductions];[n[i],n[i+1]]=[n[i+1],n[i]];setFormProductions(n);}}
                              className="text-xs px-1.5 py-0.5 rounded disabled:opacity-30" style={{ color:GOLD,background:"rgba(201,168,76,0.08)" }}>▼</button>
                          </div>
                          <button type="button" onClick={()=>setFormProductions(formProductions.filter((_,j)=>j!==i))} className="text-sm px-2 py-1 rounded flex-shrink-0" style={{ color:"#f87171",background:"rgba(239,68,68,0.08)" }}>×</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input type="text" value={vid.title} onChange={e=>{const n=[...formProductions];n[i]={...n[i],title:e.target.value};setFormProductions(n);}}
                            placeholder="Song title"
                            className="px-3 py-2 rounded-lg text-xs outline-none transition-all"
                            style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                          <input type="text" value={vid.credits} onChange={e=>{const n=[...formProductions];n[i]={...n[i],credits:e.target.value};setFormProductions(n);}}
                            placeholder="Credits (e.g. Beat · Vocal Recording · Mix)"
                            className="px-3 py-2 rounded-lg text-xs outline-none transition-all"
                            style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-text,#fff)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button"
                    onClick={()=>setFormProductions([...formProductions,{id:"",artist:"",title:"",credits:"Beat · Vocal Recording · Mix"}])}
                    className="mt-3 text-xs px-3 py-1.5 rounded-lg font-bold"
                    style={{ background:"rgba(201,168,76,0.08)",color:GOLD,border:`1px solid rgba(201,168,76,0.2)` }}>
                    + Add Video
                  </button>
                </Card>

                {/* Email Capture */}
                <Card>
                  <SectionHeader title="Email Capture Section" />
                  <div className="space-y-3">
                    <Input label="Badge Text" value={homepageForm.emailBadge} onChange={e=>setHomepageForm({...homepageForm,emailBadge:e.target.value})} placeholder="JOIN THE LIST" />
                    <Textarea label="Headline (use a newline to split into two lines — second line gets the gold gradient)" rows={2} value={homepageForm.emailHeadline} onChange={e=>setHomepageForm({...homepageForm,emailHeadline:e.target.value})} placeholder={"Stay Up To Date\nOn New Drops"} />
                    <Textarea label="Body Text" rows={3} value={homepageForm.emailSubtext} onChange={e=>setHomepageForm({...homepageForm,emailSubtext:e.target.value})} placeholder="Join the list. Be the first to hear new drops…" />
                  </div>
                </Card>

                {/* Save */}
                {homepageMsg && <p className="text-sm font-medium" style={{ color:"#4ade80" }}>{homepageMsg}</p>}
                <GoldSubmit saving={homepageSaving} label="Save Homepage" />

                {/* Push Notifications */}
                <Card>
                  <SectionHeader title="Push Notifications" />
                  <p className="text-sm mb-4" style={{ color:TEXT_MUTED }}>
                    Get a phone/browser alert when someone submits a contact form. Currently <span style={{ color:GOLD }}>{settings?.pushSubCount??0} device{settings?.pushSubCount!==1?"s":""}</span> subscribed.
                  </p>
                  <div className="rounded-xl p-4 space-y-1.5 text-xs" style={{ background:BG_DEEP,border:`1px solid ${BORDER_SUBTLE}` }}>
                    <p className="font-bold" style={{ color:TEXT_MUTED }}>To enable push notifications — add these to Vercel env vars then redeploy:</p>
                    <p style={{ color:TEXT_DIM }}><code style={{ color:GOLD }}>VAPID_PUBLIC_KEY</code> · <code style={{ color:GOLD }}>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> · <code style={{ color:GOLD }}>VAPID_PRIVATE_KEY</code> · <code style={{ color:GOLD }}>VAPID_EMAIL</code></p>
                  </div>
                </Card>

              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
