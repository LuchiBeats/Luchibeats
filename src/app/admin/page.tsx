"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Music, ShoppingBag, Users, Drum, Star, Mail, Globe, LogOut, TrendingUp, FileText, List, Sun, Moon, Tag, type LucideIcon } from "lucide-react";
import type { Beat, Artist, DrumKit } from "@/lib/types";
import type { Testimonial, Message, Subscriber, Order, HomepageContent, SoldExclusiveEntry, StatItem, ProductionVideo, ShopifyConfig, FreeBeatDelivery } from "@/lib/beats-store";

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

const GENRES    = ["Trap","Hip-Hop","R&B","Drill","Afrobeats","Boom Bap","Pop","Melodic Trap"];
const MOODS     = ["Dark","Hard","Melodic","Chill","Aggressive","Soulful","Hype","Smooth"];
const KEYS      = ["C major","C minor","C# major","C# minor","D major","D minor","D# major","D# minor","E major","E minor","F major","F minor","F# major","F# minor","G major","G minor","G# major","G# minor","A major","A minor","A# major","A# minor","B major","B minor"];
const KIT_GENRES = ["Hip-Hop / Trap","Boom Bap / Hip-Hop","R&B / Melodic","Drill","Afrobeats","All Genres"];

const PRESET_TAGS = [
  // Genre
  "Trap","Hip-Hop","Rap","Drill","R&B","Afrobeats","Boom Bap","Pop","Melodic Trap",
  "Lo-Fi","Jersey Club","UK Drill","Latin Trap","Dancehall","Gospel","Reggaeton",
  // Mood / vibe
  "Dark","Hard","Melodic","Chill","Aggressive","Soulful","Hype","Smooth","Emotional","Cinematic",
  // Sound
  "808s","Guitar","Piano","Strings","Choir","Flute","Violin","Synth","Horns","Church Bells",
];

function TagPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const active = new Set(value.split(",").map(t => t.trim().toLowerCase()).filter(Boolean));
  function toggle(tag: string) {
    const key = tag.toLowerCase();
    const next = new Set(active);
    if (next.has(key)) next.delete(key); else next.add(key);
    // preserve original casing from PRESET_TAGS where possible, else keep as typed
    const ordered = PRESET_TAGS.filter(t => next.has(t.toLowerCase()));
    const extra = [...next].filter(k => !PRESET_TAGS.some(t => t.toLowerCase() === k));
    onChange([...ordered, ...extra].join(", "));
  }
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color: "#6e6e7a" }}>
        <span style={{ color: "#C9A84C", fontSize: 10 }}>▶</span>Tags
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PRESET_TAGS.map(tag => {
          const on = active.has(tag.toLowerCase());
          return (
            <button key={tag} type="button" onClick={() => toggle(tag)}
              className="text-xs px-2.5 py-1 rounded-md font-bold transition-all"
              style={{ background: on ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.04)", color: on ? "#C9A84C" : "#3e3e45", border: `1px solid ${on ? "rgba(201,168,76,0.35)" : "#1a1a1e"}`, boxShadow: on ? "0 0 8px rgba(201,168,76,0.15)" : "none" }}>
              {on ? "✓ " : ""}{tag}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="or type custom tags separated by commas…"
        className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-all"
        style={{ background: "#111114", border: "1px solid #1a1a1e", color: "#6e6e7a" }}
        onFocus={e => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.18)"; }}
        onBlur={e => { e.target.style.borderColor = "#1a1a1e"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

const BLANK_BEAT = { title:"",audioUrl:"",imageUrl:"",mp3Url:"",wavUrl:"",stemsUrl:"",genre:"Trap",bpm:"",key:"A minor",mood:"Dark",tags:"",basicPrice:"",premiumPrice:"",exclusivePrice:"",goLiveAt:"",isFree:false };
const BLANK_KIT: { name:string;genre:string;description:string;price:string;sampleCount:string;formats:string;tags:string;includes:string;popular:boolean;imageUrl:string;previewUrl:string;downloadUrl:string } = { name:"",genre:"Hip-Hop / Trap",description:"",price:"",sampleCount:"",formats:"WAV, 24-bit",tags:"",includes:"",popular:false,imageUrl:"",previewUrl:"",downloadUrl:"" };
const BLANK_ORDER: { type:"beat"|"service"|"drumkit";itemId:string;itemTitle:string;licenseType:string;customerEmail:string;customerName:string;amount:string;status:"pending"|"completed"|"refunded";notes:string } = { type:"beat",itemId:"",itemTitle:"",licenseType:"",customerEmail:"",customerName:"",amount:"",status:"completed",notes:"" };

const TABS = ["Overview","Beats","Beat Inventory","Orders","Drum Kits","Kit Inventory","Add Artist Spotlight","Add Artist Testimonial","Messages","Subscribers","Merch","Homepage"] as const;
type Tab = typeof TABS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TAB_ICONS: Record<Tab, any> = {
  Overview: TrendingUp, Beats: Music, "Beat Inventory": List, Orders: ShoppingBag, "Drum Kits": Drum, "Kit Inventory": List,
  "Add Artist Spotlight": Users, "Add Artist Testimonial": Star, Messages: Mail, Subscribers: FileText, Merch: Tag, Homepage: Globe,
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
        <span className="text-xs font-black tracking-[0.3em] uppercase flex-shrink-0" style={{ color: GOLD }}>//</span>
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
            <span className="text-xs font-black tracking-[0.3em]" style={{ color: GOLD }}>//</span>
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

  // Core data
  const [beats, setBeats]               = useState<Beat[]>([]);
  const [artists, setArtists]           = useState<Artist[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [subscribers, setSubscribers]   = useState<Subscriber[]>([]);
  const [deliveries, setDeliveries]     = useState<FreeBeatDelivery[]>([]);
  const [analytics, setAnalytics]       = useState<Record<string, unknown> | null>(null);
  const [drumKits, setDrumKits]         = useState<DrumKit[]>([]);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [settings, setSettings]         = useState<{ freeBeatId?: string; pushSubCount: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [soldArchive, setSoldArchive] = useState<SoldExclusiveEntry[]>([]);

  // Beat form
  const [beatForm, setBeatForm]       = useState(BLANK_BEAT);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [beatMsg, setBeatMsg]         = useState("");
  const [beatSaving, setBeatSaving]   = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const beatAudioRef  = useRef<HTMLInputElement>(null);
  const beatImageRef  = useRef<HTMLInputElement>(null);
  const beatMp3Ref    = useRef<HTMLInputElement>(null);
  const beatWavRef    = useRef<HTMLInputElement>(null);
  const beatStemsRef  = useRef<HTMLInputElement>(null);
  const [beatAudioProgress,  setBeatAudioProgress]  = useState<number | null>(null);
  const [beatImageUploading, setBeatImageUploading] = useState(false);
  const [beatMp3Progress,    setBeatMp3Progress]    = useState<number | null>(null);
  const [beatWavProgress,    setBeatWavProgress]    = useState<number | null>(null);
  const [beatStemsProgress,  setBeatStemsProgress]  = useState<number | null>(null);

  // Kit form
  const [kitForm, setKitForm]       = useState(BLANK_KIT);
  const [editingKit, setEditingKit] = useState<DrumKit | null>(null);
  const [kitMsg, setKitMsg]         = useState("");
  const [kitSaving, setKitSaving]   = useState(false);
  const kitImageRef   = useRef<HTMLInputElement>(null);
  const kitPreviewRef = useRef<HTMLInputElement>(null);
  const kitZipRef     = useRef<HTMLInputElement>(null);
  const [kitImageUploading,   setKitImageUploading]   = useState(false);
  const [kitPreviewProgress,  setKitPreviewProgress]  = useState<number | null>(null);
  const [kitZipProgress,      setKitZipProgress]      = useState<number | null>(null);

  // Order form
  const [orderForm, setOrderForm]   = useState(BLANK_ORDER);
  const [orderMsg, setOrderMsg]     = useState("");
  const [orderSaving, setOrderSaving] = useState(false);

  // Artist / testimonial forms
  const [artistForm, setArtistForm] = useState({ name:"",genre:"",imageUrl:"",bio:"",instagramUrl:"",youtubeUrl:"",spotifyUrl:"",linktreeUrl:"" });
  const [artistMsg, setArtistMsg]   = useState("");
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
    heroHeadline:"", heroSubtext:"", heroCta:"", heroCtaUrl:"/beats",
    emailBadge:"FREE BEAT", emailHeadline:"Get a Free Beat\nWhen You Subscribe",
    emailSubtext:"Join the list. Be the first to hear new drops, exclusive deals, and get a free beat delivered straight to your inbox.",
    seoTitle:"", seoDescription:"",
  });
  const [formStats, setFormStats] = useState<{value:string;suffix:string;label:string}[]>([
    {value:"15",suffix:"+",label:"Years of Experience"},
    {value:"150",suffix:"+",label:"Artists Worked With"},
    {value:"100",suffix:"%",label:"Client Satisfaction"},
    {value:"72",suffix:"hr",label:"Avg. Turnaround"},
  ]);
  const [formProductions, setFormProductions] = useState<{id:string;artist:string;title:string;credits:string}[]>([
    {id:"Oma1SZ8utmw",artist:"G Wreck ft Coi Leray",title:"Froze",credits:"Beat · Vocal Recording · Mix"},
    {id:"DMjz34ubhg4",artist:"Mach City",title:"Machi 99",credits:"Beat · Vocal Recording · Mix"},
    {id:"6a94jphQcaY",artist:"Mach City",title:"Make Em Trip",credits:"Beat · Vocal Recording · Mix"},
    {id:"gPyvvEYe3Ng",artist:"Trey Budden x Oskama Esteban",title:"Cage Bird Sings",credits:"Beat · Vocal Recording · Mix"},
    {id:"aLmZ0nV9_gc",artist:"A.D Ft K Godess",title:"Work",credits:"Beat · Vocal Recording · Mix"},
    {id:"dft7z1yWCDg",artist:"Trey Budden",title:"PUBLIK!",credits:"Beat · Vocal Recording · Mix"},
    {id:"PPnuRGkrRuY",artist:"Swizzyy Marleyy",title:"Super Gango",credits:"Vocal Recording · Mix"},
    {id:"IwreOeCvK1M",artist:"Mysonne",title:"That's How We On It",credits:"Vocal Recording · Mix"},
    {id:"zGzpIqC5zvQ",artist:"A Boogie Wit Da Hoodie",title:"Timeless",credits:"Initial Vocal Recording"},
  ]);
  const [homepageSaving, setHomepageSaving] = useState(false);
  const [homepageMsg, setHomepageMsg]     = useState("");

  // UI
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [msgFolder, setMsgFolder] = useState<"inbox"|"starred"|"replied"|"archive"|"trash">("inbox");
  const [subSearch, setSubSearch] = useState("");
  const [subView, setSubView] = useState<"list"|"deliveries"|"giveaway">("list");
  const [giveawayForm, setGiveawayForm] = useState({
    type: "beat" as "beat"|"custom",
    beatId: "",
    subject: "",
    badge: "Monthly Giveaway",
    headline: "",
    body: "",
    ctaLabel: "Browse Beats",
    ctaUrl: "https://www.luchibeats.com/beats",
    audience: "all" as "all"|"new30"|"nobeat",
  });
  const [giveawaySending, setGiveawaySending] = useState(false);
  const [giveawayResult, setGiveawayResult] = useState<{sent:number;failed:number;total:number}|null>(null);
  const [giveawayConfirm, setGiveawayConfirm] = useState(false);
  const [visFilter, setVisFilter] = useState<"All"|"Live"|"Hidden"|"Sold">("All");
  const [kitVisFilter, setKitVisFilter] = useState<"All"|"Live"|"Hidden">("All");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("adm-theme") !== "light";
  });
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}));

  // ── Loaders ────────────────────────────────────────────────────────────────

  const load = useCallback(async (endpoint: string) => {
    const r = await fetch(endpoint);
    return r.ok ? r.json() : null;
  }, []);

  const loadAll = useCallback(async () => {
    const [b, ar, t, m, s, an, dk, or_, hp, st, sa, sh, dl] = await Promise.all([
      load("/api/admin/beats"), load("/api/admin/artists"), load("/api/admin/testimonials"),
      load("/api/admin/messages"), load("/api/admin/subscribers"), load("/api/admin/analytics"),
      load("/api/admin/drum-kits"), load("/api/admin/orders"), load("/api/admin/homepage"), load("/api/admin/settings"),
      load("/api/admin/sold-archive"), load("/api/admin/shopify"), load("/api/admin/free-beat-deliveries"),
    ]);
    if (b)   setBeats(b);
    if (ar)  setArtists(ar);
    if (t)   setTestimonials(t);
    if (m)   setMessages(m);
    if (s)   setSubscribers(s);
    if (an)  setAnalytics(an);
    if (dk)  setDrumKits(dk);
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
        heroCtaUrl:hp.heroCtaUrl??"/beats",
        emailBadge:hp.emailBadge??"FREE BEAT",
        emailHeadline:hp.emailHeadline??"Get a Free Beat\nWhen You Subscribe",
        emailSubtext:hp.emailSubtext??"Join the list. Be the first to hear new drops, exclusive deals, and get a free beat delivered straight to your inbox.",
        seoTitle:hp.seoTitle??"",
        seoDescription:hp.seoDescription??"",
      });
      if (hp.stats?.length) setFormStats((hp.stats as StatItem[]).map(s=>({value:String(s.value),suffix:s.suffix,label:s.label})));
      if (hp.productions?.length) setFormProductions(hp.productions as ProductionVideo[]);
    }
    if (st)  setSettings(st);
    if (sa)  setSoldArchive(sa);
    if (sh)  { setShopifyConfig(sh); setShopifyForm({ storeHandle:sh.storeHandle??"", storefrontToken:sh.storefrontToken??"", collectionId:sh.collectionId??"" }); }
    if (dl)  setDeliveries(dl);
  }, [load]);

  useEffect(() => {
    fetch("/api/admin/beats").then((r) => { if (r.ok) { setAuthed(true); loadAll(); } });
  }, [loadAll]);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────────

  async function login(e: React.FormEvent) {
    e.preventDefault(); setAuthErr("");
    const res = await fetch("/api/admin/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ password }) });
    if (res.ok) { setAuthed(true); loadAll(); } else setAuthErr("Wrong password");
  }

  async function logout() { await fetch("/api/admin/auth", { method:"DELETE" }); setAuthed(false); }

  // ── Beats ──────────────────────────────────────────────────────────────────

  async function saveBeat(e: React.FormEvent) {
    e.preventDefault(); setBeatSaving(true); setBeatMsg("");
    if (editingBeat) {
      const updated: Beat = { ...editingBeat, title:beatForm.title, audioUrl:beatForm.audioUrl, imageUrl:beatForm.imageUrl||"/images/beats/default.jpg", mp3Url:beatForm.mp3Url||undefined, wavUrl:beatForm.wavUrl||undefined, stemsUrl:beatForm.stemsUrl||undefined, genre:beatForm.genre, bpm:Number(beatForm.bpm), key:beatForm.key, mood:beatForm.mood, tags:beatForm.tags.split(",").map(t=>t.trim()).filter(Boolean), goLiveAt:beatForm.goLiveAt||undefined, isFree:beatForm.isFree, licenses:editingBeat.licenses.map(l=>({ ...l, price:l.name==="Basic"?Number(beatForm.basicPrice):l.name==="Premium"?Number(beatForm.premiumPrice):Number(beatForm.exclusivePrice) })) };
      await fetch("/api/admin/beats", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updated) });
      setEditingBeat(null); setBeatMsg("Beat updated!");
    } else {
      const id = `beat-${Date.now()}`;
      const beat: Beat = { id, title:beatForm.title, audioUrl:beatForm.audioUrl, imageUrl:beatForm.imageUrl||"/images/beats/default.jpg", mp3Url:beatForm.mp3Url||undefined, wavUrl:beatForm.wavUrl||undefined, stemsUrl:beatForm.stemsUrl||undefined, genre:beatForm.genre, bpm:Number(beatForm.bpm), key:beatForm.key, mood:beatForm.mood, tags:beatForm.tags.split(",").map(t=>t.trim()).filter(Boolean), goLiveAt:beatForm.goLiveAt||undefined, isFree:beatForm.isFree, soldExclusive:false, copyrightTimestamp:new Date().toISOString(), licenses:[{ id:`${id}-basic`,name:"Basic",price:Number(beatForm.basicPrice),format:"MP3",streams:"100K streams",description:"Non-exclusive MP3 lease" },{ id:`${id}-premium`,name:"Premium",price:Number(beatForm.premiumPrice),format:"WAV + Stems",streams:"500K streams",description:"Non-exclusive WAV + stems" },{ id:`${id}-exclusive`,name:"Exclusive",price:Number(beatForm.exclusivePrice),format:"WAV + Stems",streams:"Unlimited",description:"Full exclusive rights" }] };
      await fetch("/api/admin/beats", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(beat) });
      setBeatMsg("Beat added!"); formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" }); setTimeout(()=>setBeatMsg(""), 2500);
    }
    setBeatForm(BLANK_BEAT); setBeatSaving(false);
    const b = await load("/api/admin/beats"); if (b) setBeats(b);
  }

  function startEditBeat(beat: Beat) {
    setEditingBeat(beat);
    setBeatForm({ title:beat.title, audioUrl:beat.audioUrl, imageUrl:beat.imageUrl, mp3Url:beat.mp3Url??"", wavUrl:beat.wavUrl??"", stemsUrl:beat.stemsUrl??"", genre:beat.genre, bpm:String(beat.bpm), key:beat.key, mood:beat.mood, tags:beat.tags.join(", "), goLiveAt:beat.goLiveAt?beat.goLiveAt.slice(0,10):"", isFree:beat.isFree??false, basicPrice:String(beat.licenses.find(l=>l.name==="Basic")?.price??""), premiumPrice:String(beat.licenses.find(l=>l.name==="Premium")?.price??""), exclusivePrice:String(beat.licenses.find(l=>l.name==="Exclusive")?.price??"") });
    formRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  async function deleteBeat(id: string) {
    if (!confirm("Remove this beat?")) return;
    await fetch("/api/admin/beats", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const b = await load("/api/admin/beats"); if (b) setBeats(b);
  }

  async function toggleSoldExclusive(beat: Beat) {
    await fetch("/api/admin/beats", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...beat, soldExclusive:!beat.soldExclusive }) });
    const [b, sa] = await Promise.all([load("/api/admin/beats"), load("/api/admin/sold-archive")]);
    if (b) setBeats(b);
    if (sa) setSoldArchive(sa);
  }

  async function toggleHidden(beat: Beat) {
    await fetch("/api/admin/beats", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...beat, hidden:!beat.hidden }) });
    const b = await load("/api/admin/beats"); if (b) setBeats(b);
  }

  async function toggleKitHidden(kit: DrumKit) {
    await fetch("/api/admin/drum-kits", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...kit, hidden:!kit.hidden }) });
    const dk = await load("/api/admin/drum-kits"); if (dk) setDrumKits(dk);
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.trim().split("\n").slice(1); let count = 0;
    for (const line of lines) {
      const [filename,title,bpm,key,genre,mood,tags,basic,premium,exclusive] = line.split(",").map(s=>s.trim().replace(/^"|"$/g,""));
      if (!filename||!title) continue;
      const id = `beat-${Date.now()}-${count}`;
      const beat: Beat = { id, title, bpm:Number(bpm), key, genre, mood, audioUrl:`https://cdn.luchibeats.com/${filename}`, imageUrl:"/images/beats/default.jpg", tags:tags?tags.split(";").map(t=>t.trim()):[], soldExclusive:false, copyrightTimestamp:new Date().toISOString(), licenses:[{ id:`${id}-basic`,name:"Basic",price:Number(basic),format:"MP3",streams:"100K streams",description:"Non-exclusive MP3 lease" },{ id:`${id}-premium`,name:"Premium",price:Number(premium),format:"WAV + Stems",streams:"500K streams",description:"Non-exclusive WAV + stems" },{ id:`${id}-exclusive`,name:"Exclusive",price:Number(exclusive),format:"WAV + Stems",streams:"Unlimited",description:"Full exclusive rights" }] };
      await fetch("/api/admin/beats", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(beat) }); count++;
    }
    setBeatMsg(`${count} beats imported!`);
    const b = await load("/api/admin/beats"); if (b) setBeats(b); e.target.value = "";
  }

  // ── Drum Kits ──────────────────────────────────────────────────────────────

  async function saveKit(e: React.FormEvent) {
    e.preventDefault(); setKitSaving(true); setKitMsg("");
    const kit: DrumKit = { id:editingKit?.id??`kit-${Date.now()}`, name:kitForm.name, genre:kitForm.genre, description:kitForm.description, price:Number(kitForm.price), sampleCount:Number(kitForm.sampleCount), formats:kitForm.formats.split(",").map(f=>f.trim()).filter(Boolean), tags:kitForm.tags.split(",").map(t=>t.trim()).filter(Boolean), includes:kitForm.includes.split("\n").map(i=>i.trim()).filter(Boolean), popular:kitForm.popular, imageUrl:kitForm.imageUrl||undefined, previewUrl:kitForm.previewUrl||undefined, downloadUrl:kitForm.downloadUrl||undefined };
    if (editingKit) { await fetch("/api/admin/drum-kits", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(kit) }); setEditingKit(null); setKitMsg("Kit updated!"); }
    else { await fetch("/api/admin/drum-kits", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(kit) }); setKitMsg("Kit added!"); }
    setKitForm(BLANK_KIT); setKitSaving(false);
    const dk = await load("/api/admin/drum-kits"); if (dk) setDrumKits(dk); setTimeout(()=>setKitMsg(""), 2500);
  }

  function startEditKit(kit: DrumKit) {
    setEditingKit(kit);
    setKitForm({ name:kit.name, genre:kit.genre, description:kit.description, price:String(kit.price), sampleCount:String(kit.sampleCount), formats:kit.formats.join(", "), tags:kit.tags.join(", "), includes:kit.includes.join("\n"), popular:kit.popular??false, imageUrl:kit.imageUrl??"", previewUrl:kit.previewUrl??"", downloadUrl:kit.downloadUrl??"" });
  }

  async function deleteKit(id: string) {
    if (!confirm("Remove this drum kit?")) return;
    await fetch("/api/admin/drum-kits", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const dk = await load("/api/admin/drum-kits"); if (dk) setDrumKits(dk);
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  async function saveOrder(e: React.FormEvent) {
    e.preventDefault(); setOrderSaving(true); setOrderMsg("");
    const wasExclusive = orderForm.type === "beat" && orderForm.itemId && orderForm.licenseType === "Exclusive";
    await fetch("/api/admin/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ ...orderForm, amount:Number(orderForm.amount) }) });
    setOrderForm(BLANK_ORDER); setOrderSaving(false);
    setOrderMsg(wasExclusive ? "Order recorded — beat removed from store and archived!" : "Order recorded!");
    const [or_, b, sa] = await Promise.all([load("/api/admin/orders"), load("/api/admin/beats"), load("/api/admin/sold-archive")]);
    if (or_) setOrders(or_);
    if (b) setBeats(b);
    if (sa) setSoldArchive(sa);
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

  // ── Artists / Testimonials ─────────────────────────────────────────────────

  async function saveArtist(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/artists", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(artistForm) });
    setArtistMsg("Artist added!"); setArtistForm({ name:"",genre:"",imageUrl:"",bio:"",instagramUrl:"",youtubeUrl:"",spotifyUrl:"",linktreeUrl:"" });
    const a = await load("/api/admin/artists"); if (a) setArtists(a); setTimeout(()=>setArtistMsg(""), 2500);
  }

  async function deleteArtist(id: string) {
    if (!confirm("Remove this artist?")) return;
    await fetch("/api/admin/artists", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const a = await load("/api/admin/artists"); if (a) setArtists(a);
  }

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

  async function uploadToR2(
    file: File,
    folder: "beats" | "covers" | "previews" | "kits" | "mp3s" | "wavs" | "stems",
    onProgress: (pct: number) => void
  ): Promise<string> {
    const res = await fetch(
      `/api/admin/upload-r2?folder=${folder}&filename=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`
    );
    const { presignedUrl, cdnUrl, error } = await res.json();
    if (error) throw new Error(error);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener("load", () =>
        xhr.status < 300 ? resolve() : reject(new Error(`R2 upload failed: ${xhr.status}`))
      );
      xhr.addEventListener("error", () => reject(new Error("Network error")));
      xhr.send(file);
    });

    return cdnUrl;
  }

  async function uploadBeatAudio(file: File) {
    setBeatAudioProgress(0);
    try {
      const url = await uploadToR2(file, "beats", setBeatAudioProgress);
      setBeatForm(f => ({ ...f, audioUrl: url }));
    } catch (err) {
      setBeatMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBeatAudioProgress(null);
    }
  }

  async function uploadBeatImage(file: File) {
    setBeatImageUploading(true);
    try {
      const url = await uploadToR2(file, "covers", () => {});
      setBeatForm(f => ({ ...f, imageUrl: url }));
    } catch (err) {
      setBeatMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setBeatImageUploading(false);
    }
  }

  async function uploadBeatMp3(file: File) {
    setBeatMp3Progress(0);
    try {
      const url = await uploadToR2(file, "mp3s", setBeatMp3Progress);
      setBeatForm(f => ({ ...f, mp3Url: url }));
    } catch (err) {
      setBeatMsg(err instanceof Error ? err.message : "MP3 upload failed");
    } finally {
      setBeatMp3Progress(null);
    }
  }

  async function uploadBeatWav(file: File) {
    setBeatWavProgress(0);
    try {
      const url = await uploadToR2(file, "wavs", setBeatWavProgress);
      setBeatForm(f => ({ ...f, wavUrl: url }));
    } catch (err) {
      setBeatMsg(err instanceof Error ? err.message : "WAV upload failed");
    } finally {
      setBeatWavProgress(null);
    }
  }

  async function uploadBeatStems(file: File) {
    setBeatStemsProgress(0);
    try {
      const url = await uploadToR2(file, "stems", setBeatStemsProgress);
      setBeatForm(f => ({ ...f, stemsUrl: url }));
    } catch (err) {
      setBeatMsg(err instanceof Error ? err.message : "Stems upload failed");
    } finally {
      setBeatStemsProgress(null);
    }
  }

  async function uploadKitImage(file: File) {
    setKitImageUploading(true);
    try {
      const url = await uploadToR2(file, "covers", () => {});
      setKitForm(f => ({ ...f, imageUrl: url }));
    } catch (err) {
      setKitMsg(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setKitImageUploading(false);
    }
  }

  async function uploadKitPreview(file: File) {
    setKitPreviewProgress(0);
    try {
      const url = await uploadToR2(file, "previews", setKitPreviewProgress);
      setKitForm(f => ({ ...f, previewUrl: url }));
    } catch (err) {
      setKitMsg(err instanceof Error ? err.message : "Preview upload failed");
    } finally {
      setKitPreviewProgress(null);
    }
  }

  async function uploadKitZip(file: File) {
    setKitZipProgress(0);
    try {
      const url = await uploadToR2(file, "kits", setKitZipProgress);
      setKitForm(f => ({ ...f, downloadUrl: url }));
    } catch (err) {
      setKitMsg(err instanceof Error ? err.message : "Kit file upload failed");
    } finally {
      setKitZipProgress(null);
    }
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async function patchMessage(id: string, patch: Partial<Message>) {
    await fetch("/api/admin/messages", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id, ...patch }) });
    const m = await load("/api/admin/messages"); if (m) setMessages(m);
  }

  async function markRead(id: string, read: boolean) { await patchMessage(id, { read }); }
  async function starMessage(id: string, starred: boolean) { await patchMessage(id, { starred }); }
  async function archiveMessage(id: string) { await patchMessage(id, { folder:"archive", read:true }); }
  async function restoreMessage(id: string) { await patchMessage(id, { folder:"inbox" }); }
  async function markReplied(id: string) { await patchMessage(id, { replied:true, read:true }); }

  async function deleteMessage(id: string) {
    if (!confirm("Permanently delete this message?")) return;
    await fetch("/api/admin/messages", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ id }) });
    const m = await load("/api/admin/messages"); if (m) setMessages(m);
  }

  async function trashMessage(id: string) { await patchMessage(id, { folder:"trash" }); }

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
      heroCtaUrl: homepageForm.heroCtaUrl || "/beats",
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

        <form onSubmit={login} className="w-full max-w-sm relative z-10">
          {/* logo */}
          <div className="text-center mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="LuchiBeats" className="h-20 w-auto mx-auto mb-4 object-contain" />
            <h1 className="text-3xl font-black text-white tracking-tight">ADMIN OS</h1>
            <p className="text-xs mt-2 tracking-[0.2em]" style={{ color: TEXT_MUTED }}>SECURE ACCESS TERMINAL</p>
          </div>

          <div className="relative rounded-xl p-8" style={{ background: BG_CARD, border: `1px solid ${GOLD_BORDER}`, boxShadow: `0 0 60px rgba(201,168,76,0.08), 0 30px 60px rgba(0,0,0,0.6)` }}>
            {/* corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
            <div className="absolute top-0 right-0 w-4 h-4" style={{ borderTop: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />
            <div className="absolute bottom-0 left-0 w-4 h-4" style={{ borderBottom: `2px solid ${GOLD}`, borderLeft: `2px solid ${GOLD}` }} />
            <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `2px solid ${GOLD}`, borderRight: `2px solid ${GOLD}` }} />

            <label className="flex items-center gap-2 text-xs font-black tracking-[0.25em] uppercase mb-2" style={{ color: TEXT_DIM }}>
              <span style={{ color: GOLD }}>▶</span> Access Key
            </label>
            <input type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-lg text-white text-sm mb-5 outline-none transition-all font-mono tracking-widest"
              style={{ background: BG_INPUT, border: `1px solid ${BORDER_SUBTLE}`, letterSpacing: "0.3em" }}
              onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD_GLOW}`; }}
              onBlur={e => { e.target.style.borderColor = BORDER_SUBTLE; e.target.style.boxShadow = "none"; }} />
            {authErr && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span className="text-red-400 text-xs">⚠</span>
                <p className="text-red-400 text-xs font-bold">{authErr}</p>
              </div>
            )}
            <button type="submit" className="w-full py-3.5 rounded-lg font-black text-sm text-black tracking-widest transition-all"
              style={{ background: "linear-gradient(90deg,#A8892E,#C9A84C,#E5C76B)", boxShadow: `0 0 30px rgba(201,168,76,0.3), 0 8px 24px rgba(0,0,0,0.4)` }}>
              INITIALIZE →
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Derived stats ──────────────────────────────────────────────────────────

  const unreadCount     = messages.filter(m=>!m.read).length;
  const completedOrders = orders.filter(o=>o.status==="completed");
  const totalRevenue    = completedOrders.reduce((s,o)=>s+o.amount, 0);
  const refundedRevenue = orders.filter(o=>o.status==="refunded").reduce((s,o)=>s+o.amount, 0);
  const freeBeat        = beats.find(b=>b.isFree);

  // ── Sidebar nav item ───────────────────────────────────────────────────────

  function NavItem({ t }: { t: Tab }) {
    const Icon = TAB_ICONS[t];
    const active = tab === t;
    return (
      <button onClick={() => setTab(t)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all relative overflow-hidden"
        style={{ background: active ? "rgba(201,168,76,0.08)" : "transparent", color: active ? GOLD : TEXT_DIM }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
        {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />}
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? GOLD_BORDER : BORDER_SUBTLE}` }}>
          <Icon size={13} />
        </div>
        <span className="flex-1 text-xs font-bold tracking-wide">{t}</span>
        {t === "Messages" && unreadCount > 0 && (
          <span className="px-1.5 py-0.5 rounded text-xs font-black" style={{ background: GOLD, color: "#000" }}>{unreadCount}</span>
        )}
      </button>
    );
  }

  // ── Dashboard shell ────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen relative" data-adm={darkMode?"dark":"light"} style={{ ...cssVars, background: BG_DEEP }}>
      <style>{`[data-adm="light"] .text-white{color:#111118!important}[data-adm="light"] select option{background:#f4f4fb;color:#111118}[data-adm="light"] audio{filter:invert(0.88) hue-rotate(195deg)}`}</style>
      {/* Ambient orbs */}
      <div className="orb orb-1 w-[600px] h-[600px] -top-40 -left-40 fixed pointer-events-none" style={{ background: p.orb1 }} />
      <div className="orb orb-2 w-[500px] h-[500px] -bottom-32 -right-40 fixed pointer-events-none" style={{ background: p.orb2 }} />
      <div className="orb orb-3 w-80 h-80 top-1/2 right-1/4 fixed pointer-events-none" style={{ background: p.orb3 }} />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ background: p.sidebarBg, borderRight: `1px solid ${BORDER_SUBTLE}` }}>

        {/* Brand header */}
        <div className="px-4 pt-5 pb-4" style={{ borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="LuchiBeats" className="h-12 w-auto mb-3 object-contain" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#39ff8a", boxShadow: "0 0 8px #39ff8a" }} />
              <p className="text-xs font-bold tracking-[0.15em]" style={{ color: TEXT_MUTED }}>ONLINE</p>
            </div>
            <p className="text-xs font-mono" style={{ color: TEXT_MUTED }}>{clock}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {TABS.map(t => <NavItem key={t} t={t} />)}
        </nav>

        {/* Theme switcher */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-2.5 px-1" style={{ color: TEXT_MUTED }}>Appearance</p>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl" style={{ background: BG_INPUT }}>
            <button type="button" onClick={() => { setDarkMode(true); localStorage.setItem("adm-theme","dark"); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: darkMode ? BG_CARD : "transparent", color: darkMode ? GOLD : TEXT_MUTED, boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.3)" : "none", border: darkMode ? `1px solid ${GOLD_BORDER}` : "1px solid transparent" }}>
              <Moon size={11} />
              Dark
            </button>
            <button type="button" onClick={() => { setDarkMode(false); localStorage.setItem("adm-theme","light"); }}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: !darkMode ? BG_CARD : "transparent", color: !darkMode ? GOLD : TEXT_MUTED, boxShadow: !darkMode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", border: !darkMode ? `1px solid ${GOLD_BORDER}` : "1px solid transparent" }}>
              <Sun size={11} />
              Light
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-5 pt-2" style={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
            style={{ color: TEXT_MUTED, background: "transparent" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.background = "transparent"; }}>
            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER_SUBTLE}` }}>
              <LogOut size={13} />
            </div>
            <span className="text-xs font-bold tracking-wide">Log Out</span>
          </button>
          <p className="text-center text-xs mt-3 font-mono" style={{ color: BORDER_MID }}>v2.0 · LuchiBeats</p>
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
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all"
              style={{ background: tab===t ? GOLD_DIM : "rgba(255,255,255,0.03)", color: tab===t ? GOLD : TEXT_MUTED, border: `1px solid ${tab===t ? GOLD_BORDER : "transparent"}`, boxShadow: tab===t ? `0 0 12px ${GOLD_GLOW}` : "none" }}>
              {t}
              {t==="Messages" && unreadCount>0 && <span className="ml-1 px-1 py-0.5 rounded text-xs font-black" style={{ background:GOLD,color:"#000" }}>{unreadCount}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">

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
                    <p style={{ fontFamily:"monospace",fontSize:9,letterSpacing:"0.3em",color:GOLD,marginBottom:8 }}>// LUCHIBEATS · COMMAND CENTER</p>
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
                    { label:"CATALOG", value:`${beats.filter(b=>!b.hidden&&!b.soldExclusive).length} LIVE`, color:"#4ade80" },
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {hudCard("BEAT CATALOG", beats.length, beats.filter(b=>b.hidden).length>0?`${beats.filter(b=>b.hidden).length} HIDDEN`:null, GOLD)}
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

                {/* ── Free beat alert ── */}
                {freeBeat && (
                  <div className="flex items-center gap-4 px-5 py-3 rounded-xl" style={{ background:"rgba(74,222,128,0.04)",border:"1px solid rgba(74,222,128,0.18)" }}>
                    <span className="adm-live-dot" style={{ display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#4ade80",flexShrink:0 }} />
                    <div>
                      <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.25em",color:"#4ade80",marginBottom:2 }}>FREE BEAT SIGNAL ACTIVE</p>
                      <p className="text-sm font-bold text-white">{freeBeat.title}</p>
                    </div>
                  </div>
                )}

                {/* ── Spectrum + Activity ── */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                  {/* Signal Spectrum (beat plays) */}
                  <div className="md:col-span-3 rounded-xl p-5" style={{ background:"rgba(201,168,76,0.02)",border:"1px solid rgba(201,168,76,0.09)" }}>
                    <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.28em",color:TEXT_MUTED,marginBottom:18 }}>// SIGNAL SPECTRUM — BEAT PLAYS</p>
                    {beats.length===0 ? (
                      <p style={{ fontFamily:"monospace",fontSize:10,color:TEXT_MUTED }}>NO SIGNAL — Upload beats to start tracking plays</p>
                    ) : (() => {
                      const beatPlays = (analytics?.beatPlays as Record<string,number>)??{};
                      const sorted = beats.map(b=>({ ...b,plays:beatPlays[b.id]??0 })).sort((a,b)=>b.plays-a.plays).slice(0,8);
                      const maxPlays = Math.max(...sorted.map(b=>b.plays), 1);
                      return (
                        <div className="space-y-4">
                          {sorted.map((b, i) => (
                            <div key={b.id}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span style={{ fontFamily:"monospace",fontSize:9,color:TEXT_MUTED,width:12,flexShrink:0 }}>{String(i+1).padStart(2,"0")}</span>
                                  <span style={{ fontSize:11,color:"rgba(255,255,255,0.8)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{b.title}</span>
                                  {b.soldExclusive && <Badge color="#f87171" bg="rgba(239,68,68,0.12)">SOLD</Badge>}
                                  {b.isFree && <Badge color="#4ade80" bg="rgba(74,222,128,0.12)">FREE</Badge>}
                                </div>
                                <span style={{ fontFamily:"monospace",fontSize:10,color:GOLD,letterSpacing:"0.08em",flexShrink:0,marginLeft:8,textShadow:`0 0 10px ${GOLD}60` }}>{b.plays.toLocaleString()}</span>
                              </div>
                              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.04)" }}>
                                <div className="adm-bar h-full rounded-full" style={{ width:`${(b.plays/maxPlays)*100}%`, background:`linear-gradient(90deg,rgba(201,168,76,0.35),${GOLD})`, boxShadow:`0 0 8px ${GOLD}55`, animationDelay:`${i*60}ms` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Live Activity Feed */}
                  <div className="md:col-span-2 rounded-xl p-5" style={{ background:"rgba(201,168,76,0.02)",border:"1px solid rgba(201,168,76,0.09)" }}>
                    <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.28em",color:TEXT_MUTED,marginBottom:18 }}>// LIVE ACTIVITY FEED</p>
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

                {/* ── Geo data terminal ── */}
                <div className="rounded-xl p-5" style={{ background:"rgba(201,168,76,0.02)",border:"1px solid rgba(201,168,76,0.09)" }}>
                  <p style={{ fontFamily:"monospace",fontSize:8,letterSpacing:"0.28em",color:TEXT_MUTED,marginBottom:18 }}>// AUDIENCE ORIGIN — GEO SIGNAL</p>
                  {(() => {
                    const countries = (analytics?.countries as Record<string,{views:number;contacts:number;subscribers:number}>) ?? {};
                    const sorted = Object.entries(countries).map(([code,s])=>({ code,...s,total:s.views+s.contacts+s.subscribers })).sort((a,b)=>b.total-a.total);
                    const maxViews = Math.max(...sorted.map(c=>c.views), 1);
                    if (sorted.length===0) return <p style={{ fontFamily:"monospace",fontSize:10,color:TEXT_MUTED }}>NO SIGNAL — Visits will appear here automatically</p>;
                    return (
                      <div className="space-y-3">
                        {sorted.map(c => (
                          <div key={c.code} className="grid items-center gap-3" style={{ gridTemplateColumns:"22px 1fr" }}>
                            <span className="text-sm">{countryFlag(c.code)}</span>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span style={{ fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.6)",letterSpacing:"0.08em" }}>{countryName(c.code).toUpperCase()}</span>
                                <div className="flex gap-3">
                                  <span style={{ fontFamily:"monospace",fontSize:8,color:GOLD }}>{c.views}<span style={{ opacity:0.4 }}>V</span></span>
                                  <span style={{ fontFamily:"monospace",fontSize:8,color:"#60a5fa" }}>{c.contacts}<span style={{ opacity:0.4 }}>C</span></span>
                                  <span style={{ fontFamily:"monospace",fontSize:8,color:"#4ade80" }}>{c.subscribers}<span style={{ opacity:0.4 }}>S</span></span>
                                </div>
                              </div>
                              <div className="relative h-px rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.05)" }}>
                                <div className="adm-bar h-full rounded-full" style={{ width:`${(c.views/maxViews)*100}%`,background:`linear-gradient(90deg,rgba(201,168,76,0.4),${GOLD})` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* ── BEATS ── */}
            {tab === "Beats" && (
              <>
                {/* CSV import bar */}
                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "#0f0f0f", border: `1px solid ${BORDER_SUBTLE}` }}>
                  <div>
                    <p className="text-sm font-bold text-white">Bulk Import</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT_MUTED }}>Upload a filled CSV to add multiple beats at once</p>
                  </div>
                  <label className="cursor-pointer" style={{ flexShrink: 0 }}>
                    <GoldBtn>Upload CSV</GoldBtn>
                    <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
                  </label>
                </div>
                {beatMsg.includes("imported") && <p className="text-sm font-medium" style={{ color: "#4ade80" }}>{beatMsg}</p>}

                {/* Beat form */}
                <FormSection title={editingBeat ? `Editing: ${editingBeat.title}` : "Add New Beat"}>
                  <form ref={formRef} onSubmit={saveBeat} className="space-y-4">
                    {/* Audio file upload */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Beat File (MP3 / WAV) *</p>
                      <input ref={beatAudioRef} type="file" accept="audio/*,.mp3,.wav,.flac" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadBeatAudio(f); e.target.value=""; }} />
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={beatAudioProgress !== null} onClick={()=>beatAudioRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors flex-shrink-0" style={{ background:GOLD_DIM, color:GOLD, opacity:beatAudioProgress!==null?0.5:1 }}>
                          {beatAudioProgress !== null ? `Uploading ${beatAudioProgress}%…` : beatForm.audioUrl ? "Change File" : "Choose File"}
                        </button>
                        {beatAudioProgress !== null && (
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#222" }}>
                            <div className="h-full rounded-full transition-all" style={{ width:`${beatAudioProgress}%`, background:GOLD }} />
                          </div>
                        )}
                        {beatForm.audioUrl && beatAudioProgress === null && (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs truncate max-w-[200px]" style={{ color:"#4ade80" }}>✓ {beatForm.audioUrl.split("/").pop()}</span>
                            <button type="button" onClick={()=>setBeatForm(f=>({...f,audioUrl:""}))} className="text-xs flex-shrink-0" style={{ color:"#555" }}>×</button>
                          </div>
                        )}
                      </div>
                      {/* still allow manual URL if they already have one on R2 */}
                      <input
                        type="text"
                        required
                        value={beatForm.audioUrl}
                        onChange={e=>setBeatForm({...beatForm,audioUrl:e.target.value})}
                        placeholder="or paste existing URL — https://cdn.luchibeats.com/beat.mp3"
                        className="mt-2 w-full text-xs rounded-lg px-3 py-2 outline-none"
                        style={{ background:BG_INPUT, border:`1px solid ${BORDER_SUBTLE}`, color:"#666" }}
                      />
                    </div>

                    {/* Download files section */}
                    <div className="rounded-xl p-4 space-y-4" style={{ background:"#0d0d0d", border:`1px solid ${BORDER_SUBTLE}` }}>
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: GOLD }}>Download Files (what buyers receive)</p>

                      {/* Full MP3 — Basic license */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Full MP3 <span style={{ color:"#444" }}>— Basic license buyers</span></p>
                        <input ref={beatMp3Ref} type="file" accept=".mp3,audio/mpeg" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadBeatMp3(f); e.target.value=""; }} />
                        <div className="flex items-center gap-3">
                          <button type="button" disabled={beatMp3Progress !== null} onClick={()=>beatMp3Ref.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold flex-shrink-0" style={{ background:GOLD_DIM, color:GOLD, opacity:beatMp3Progress!==null?0.5:1 }}>
                            {beatMp3Progress !== null ? `Uploading ${beatMp3Progress}%…` : beatForm.mp3Url ? "Change MP3" : "Choose MP3"}
                          </button>
                          {beatMp3Progress !== null && (
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#222" }}>
                              <div className="h-full rounded-full transition-all" style={{ width:`${beatMp3Progress}%`, background:GOLD }} />
                            </div>
                          )}
                          {beatForm.mp3Url && beatMp3Progress === null && (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs truncate max-w-[200px]" style={{ color:"#4ade80" }}>✓ {beatForm.mp3Url.split("/").pop()}</span>
                              <button type="button" onClick={()=>setBeatForm(f=>({...f,mp3Url:""}))} className="text-xs flex-shrink-0" style={{ color:"#555" }}>×</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* WAV — Premium + Exclusive */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>WAV File <span style={{ color:"#444" }}>— Premium &amp; Exclusive buyers</span></p>
                        <input ref={beatWavRef} type="file" accept=".wav,audio/wav,audio/x-wav" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadBeatWav(f); e.target.value=""; }} />
                        <div className="flex items-center gap-3">
                          <button type="button" disabled={beatWavProgress !== null} onClick={()=>beatWavRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold flex-shrink-0" style={{ background:GOLD_DIM, color:GOLD, opacity:beatWavProgress!==null?0.5:1 }}>
                            {beatWavProgress !== null ? `Uploading ${beatWavProgress}%…` : beatForm.wavUrl ? "Change WAV" : "Choose WAV"}
                          </button>
                          {beatWavProgress !== null && (
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#222" }}>
                              <div className="h-full rounded-full transition-all" style={{ width:`${beatWavProgress}%`, background:GOLD }} />
                            </div>
                          )}
                          {beatForm.wavUrl && beatWavProgress === null && (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs truncate max-w-[200px]" style={{ color:"#4ade80" }}>✓ {beatForm.wavUrl.split("/").pop()}</span>
                              <button type="button" onClick={()=>setBeatForm(f=>({...f,wavUrl:""}))} className="text-xs flex-shrink-0" style={{ color:"#555" }}>×</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stems ZIP — Premium + Exclusive */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Stems ZIP <span style={{ color:"#444" }}>— Premium &amp; Exclusive buyers (all individual tracks)</span></p>
                        <input ref={beatStemsRef} type="file" accept=".zip,application/zip,application/x-zip-compressed" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadBeatStems(f); e.target.value=""; }} />
                        <div className="flex items-center gap-3">
                          <button type="button" disabled={beatStemsProgress !== null} onClick={()=>beatStemsRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold flex-shrink-0" style={{ background:GOLD_DIM, color:GOLD, opacity:beatStemsProgress!==null?0.5:1 }}>
                            {beatStemsProgress !== null ? `Uploading ${beatStemsProgress}%…` : beatForm.stemsUrl ? "Change Stems ZIP" : "Choose Stems ZIP"}
                          </button>
                          {beatStemsProgress !== null && (
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#222" }}>
                              <div className="h-full rounded-full transition-all" style={{ width:`${beatStemsProgress}%`, background:GOLD }} />
                            </div>
                          )}
                          {beatForm.stemsUrl && beatStemsProgress === null && (
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs truncate max-w-[200px]" style={{ color:"#4ade80" }}>✓ {beatForm.stemsUrl.split("/").pop()}</span>
                              <button type="button" onClick={()=>setBeatForm(f=>({...f,stemsUrl:""}))} className="text-xs flex-shrink-0" style={{ color:"#555" }}>×</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cover art upload */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: TEXT_MUTED }}>Cover Art (optional)</p>
                      <input ref={beatImageRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadBeatImage(f); e.target.value=""; }} />
                      <div className="flex items-center gap-3">
                        {beatForm.imageUrl && (
                          <div className="relative flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={beatForm.imageUrl} alt="cover" className="w-12 h-12 rounded-lg object-cover border" style={{ borderColor:GOLD_BORDER }} />
                            <button type="button" onClick={()=>setBeatForm(f=>({...f,imageUrl:""}))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black border flex items-center justify-center text-xs leading-none" style={{ borderColor:"#333",color:"#888" }}>×</button>
                          </div>
                        )}
                        <button type="button" disabled={beatImageUploading} onClick={()=>beatImageRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors" style={{ background:GOLD_DIM, color:GOLD, opacity:beatImageUploading?0.5:1 }}>
                          {beatImageUploading ? "Uploading…" : beatForm.imageUrl ? "Change Art" : "Choose Image"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Beat Title *" required value={beatForm.title} onChange={e=>setBeatForm({...beatForm,title:e.target.value})} placeholder="Dark Tunnel" />
                      <Input label="BPM *" required type="number" value={beatForm.bpm} onChange={e=>setBeatForm({...beatForm,bpm:e.target.value})} placeholder="140" />
                      <Sel label="Key *" options={KEYS} value={beatForm.key} onChange={e=>setBeatForm({...beatForm,key:e.target.value})} />
                      <Sel label="Genre" options={GENRES} value={beatForm.genre} onChange={e=>setBeatForm({...beatForm,genre:e.target.value})} />
                      <Sel label="Mood" options={MOODS} value={beatForm.mood} onChange={e=>setBeatForm({...beatForm,mood:e.target.value})} />
                      <TagPicker value={beatForm.tags} onChange={v=>setBeatForm({...beatForm,tags:v})} />
                      <Input label="Go Live Date (empty = live now)" type="date" value={beatForm.goLiveAt} onChange={e=>setBeatForm({...beatForm,goLiveAt:e.target.value})} />
                      <div className="flex items-center gap-3 pt-6">
                        <input type="checkbox" id="isFree" checked={beatForm.isFree} onChange={e=>setBeatForm({...beatForm,isFree:e.target.checked})} className="w-4 h-4 rounded" style={{ accentColor: GOLD }} />
                        <label htmlFor="isFree" className="text-sm text-white cursor-pointer">Free beat for email subscribers <span className="text-xs" style={{ color: "#444" }}>(one at a time)</span></label>
                      </div>
                    </div>
                    <div className="pt-2 border-t" style={{ borderColor: BORDER_SUBTLE }}>
                      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>License Pricing ($)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input label="Basic (MP3)" required type="number" value={beatForm.basicPrice} onChange={e=>setBeatForm({...beatForm,basicPrice:e.target.value})} placeholder="35" />
                        <Input label="Premium (WAV+Stems)" required type="number" value={beatForm.premiumPrice} onChange={e=>setBeatForm({...beatForm,premiumPrice:e.target.value})} placeholder="99" />
                        <Input label="Exclusive" required type="number" value={beatForm.exclusivePrice} onChange={e=>setBeatForm({...beatForm,exclusivePrice:e.target.value})} placeholder="499" />
                      </div>
                    </div>
                    {beatMsg && !beatMsg.includes("imported") && <p className="text-sm font-medium" style={{ color: beatMsg.includes("Error")?"#f87171":"#4ade80" }}>{beatMsg}</p>}
                    <div className="flex gap-3 pt-2">
                      <GoldSubmit saving={beatSaving} label={editingBeat?"Save Changes":"Add Beat"} />
                      {editingBeat && <button type="button" onClick={()=>{setEditingBeat(null);setBeatForm(BLANK_BEAT);}} className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background:"#1a1a1a",color:"#666" }}>Cancel</button>}
                    </div>
                  </form>
                </FormSection>

                {/* Beat list — active only */}
                <div>
                  <SectionHeader title={`Catalog (${beats.filter(b=>!b.soldExclusive&&!b.hidden).length} live · ${beats.filter(b=>b.hidden&&!b.soldExclusive).length} hidden · ${beats.filter(b=>b.soldExclusive).length} sold)`} />
                  {beats.length===0 ? <p className="text-sm" style={{ color:"#444" }}>No beats yet.</p> : (
                    <div className="space-y-2">
                      {beats.map(beat => {
                        const isScheduled = beat.goLiveAt && new Date(beat.goLiveAt)>new Date();
                        const borderColor = beat.soldExclusive ? "rgba(239,68,68,0.3)" : beat.hidden ? "rgba(111,111,111,0.3)" : beat.isFree ? "rgba(74,222,128,0.2)" : BORDER_SUBTLE;
                        return (
                          <div key={beat.id} className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${borderColor}` }}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-bold text-white text-sm">{beat.title}</p>
                                  {beat.soldExclusive && <Badge color="#f87171" bg="rgba(239,68,68,0.12)">SOLD EXCLUSIVE</Badge>}
                                  {beat.hidden && !beat.soldExclusive && <Badge color="#888" bg="rgba(255,255,255,0.06)">HIDDEN</Badge>}
                                  {beat.isFree && <Badge color="#4ade80" bg="rgba(74,222,128,0.12)">FREE BEAT</Badge>}
                                  {isScheduled && <Badge color="#fbbf24" bg="rgba(251,191,36,0.12)">DROPS {new Date(beat.goLiveAt!).toLocaleDateString()}</Badge>}
                                </div>
                                <p className="text-xs mb-1" style={{ color:"#555" }}>{beat.genre} · {beat.bpm} BPM · {beat.key} · {beat.mood}</p>
                                {beat.copyrightTimestamp && (
                                  <p className="text-xs mb-1 font-mono" style={{ color: GOLD, opacity: 0.7 }}>
                                    © {new Date(beat.copyrightTimestamp).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" })} · Ariel Jesus Muniz / LuchiBeats
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: beat.mp3Url?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.04)", color: beat.mp3Url?"#4ade80":"#333" }}>MP3 {beat.mp3Url?"✓":"–"}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: beat.wavUrl?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.04)", color: beat.wavUrl?"#4ade80":"#333" }}>WAV {beat.wavUrl?"✓":"–"}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: beat.stemsUrl?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.04)", color: beat.stemsUrl?"#4ade80":"#333" }}>STEMS {beat.stemsUrl?"✓":"–"}</span>
                                </div>
                                <audio controls src={beat.audioUrl} className="w-full" style={{ height:32, accentColor:GOLD }} />
                              </div>
                              <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                                <div className="flex gap-1.5">
                                  <GoldBtn onClick={()=>startEditBeat(beat)} small>Edit</GoldBtn>
                                  <button onClick={()=>deleteBeat(beat.id)} className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors" style={{ color:"#444",background:"#1a1a1a" }}>Remove</button>
                                </div>
                                <button onClick={()=>toggleHidden(beat)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                  style={{ color:beat.hidden?"#4ade80":"#888", background:beat.hidden?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.05)" }}>
                                  {beat.hidden ? "Show on Store" : "Hide from Store"}
                                </button>
                                {!beat.soldExclusive && (
                                  <button onClick={()=>toggleSoldExclusive(beat)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                    style={{ color:"#f87171", background:"rgba(239,68,68,0.08)" }}>
                                    Mark Sold
                                  </button>
                                )}
                                {beat.soldExclusive && (
                                  <button onClick={()=>toggleSoldExclusive(beat)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                    style={{ color:"#4ade80", background:"rgba(74,222,128,0.08)" }}>
                                    Un-Mark Sold
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Exclusive Sale Archive */}
                {soldArchive.length > 0 && (
                  <div>
                    <SectionHeader title={`Exclusive Archive (${soldArchive.length})`} />
                    <div className="space-y-2">
                      {soldArchive.map((entry, i) => (
                        <div key={i} className="rounded-2xl p-4" style={{ background: BG_CARD, border: "1px solid rgba(239,68,68,0.2)" }}>
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-white text-sm">{entry.beat.title}</p>
                                <Badge color="#f87171" bg="rgba(239,68,68,0.12)">EXCLUSIVE SOLD</Badge>
                              </div>
                              <p className="text-xs mb-0.5" style={{ color:"#555" }}>{entry.beat.genre} · {entry.beat.bpm} BPM · {entry.beat.key}</p>
                              {entry.beat.copyrightTimestamp && (
                                <p className="text-xs font-mono mb-1" style={{ color: GOLD, opacity: 0.7 }}>
                                  © {new Date(entry.beat.copyrightTimestamp).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric" })} · LuchiBeats
                                </p>
                              )}
                              <p className="text-xs mt-1" style={{ color:"#666" }}>
                                Sold {new Date(entry.soldAt).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" })}
                                {entry.customerName ? ` · ${entry.customerName}` : ""}
                                {entry.customerEmail ? ` · ${entry.customerEmail}` : ""}
                              </p>
                            </div>
                            {entry.amount != null && (
                              <p className="text-base font-black flex-shrink-0" style={{ color: GOLD }}>${entry.amount}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── VISIBILITY ── */}
            {tab === "Beat Inventory" && (
              <>
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Live on Store" value={beats.filter(b=>!b.soldExclusive&&!b.hidden).length} icon={List} />
                  <StatCard label="Hidden" value={beats.filter(b=>b.hidden&&!b.soldExclusive).length} />
                  <StatCard label="Sold Exclusive" value={beats.filter(b=>b.soldExclusive).length} />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 flex-wrap">
                  {(["All","Live","Hidden","Sold"] as const).map(f => (
                    <button key={f} type="button" onClick={()=>setVisFilter(f)}
                      className="text-xs px-4 py-1.5 rounded-full font-bold transition-all"
                      style={{ background: visFilter===f ? GOLD_DIM : "rgba(255,255,255,0.04)", color: visFilter===f ? GOLD : TEXT_MUTED, border: `1px solid ${visFilter===f ? GOLD_BORDER : BORDER_SUBTLE}` }}>
                      {f}
                      <span className="ml-1.5 opacity-60">
                        {f==="All"?beats.length:f==="Live"?beats.filter(b=>!b.hidden&&!b.soldExclusive).length:f==="Hidden"?beats.filter(b=>b.hidden&&!b.soldExclusive).length:beats.filter(b=>b.soldExclusive).length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Beat rows */}
                {beats.length === 0 ? (
                  <p className="text-sm" style={{ color:"#444" }}>No beats uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {beats
                      .filter(b => visFilter==="All" || (visFilter==="Live"&&!b.hidden&&!b.soldExclusive) || (visFilter==="Hidden"&&b.hidden&&!b.soldExclusive) || (visFilter==="Sold"&&b.soldExclusive))
                      .map(beat => {
                        const plays = ((analytics?.beatPlays as Record<string,number>)??{})[beat.id]??0;
                        const isLive = !beat.hidden && !beat.soldExclusive;
                        const rowBorder = beat.soldExclusive ? "rgba(239,68,68,0.25)" : beat.hidden ? "rgba(255,255,255,0.07)" : "rgba(201,168,76,0.15)";
                        return (
                          <div key={beat.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: BG_CARD, border:`1px solid ${rowBorder}`, opacity: beat.hidden ? 0.65 : 1 }}>
                            {/* Cover art */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={beat.imageUrl||"/images/beats/default.jpg"} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{ border:`1px solid ${BORDER_SUBTLE}` }} />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="font-bold text-white text-sm truncate">{beat.title}</p>
                                {beat.soldExclusive && <Badge color="#f87171" bg="rgba(239,68,68,0.12)">SOLD</Badge>}
                                {beat.hidden && !beat.soldExclusive && <Badge color="#666" bg="rgba(255,255,255,0.05)">HIDDEN</Badge>}
                                {isLive && <Badge color="#4ade80" bg="rgba(74,222,128,0.08)">LIVE</Badge>}
                              </div>
                              <p className="text-xs" style={{ color:"#555" }}>{beat.genre} · {beat.bpm} BPM · {beat.key}</p>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-xs font-semibold" style={{ color: plays>0?GOLD:"#333" }}>{plays} play{plays!==1?"s":""}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: beat.mp3Url?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.03)", color: beat.mp3Url?"#4ade80":"#333" }}>MP3{beat.mp3Url?" ✓":" –"}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: beat.wavUrl?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.03)", color: beat.wavUrl?"#4ade80":"#333" }}>WAV{beat.wavUrl?" ✓":" –"}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: beat.stemsUrl?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.03)", color: beat.stemsUrl?"#4ade80":"#333" }}>STEMS{beat.stemsUrl?" ✓":" –"}</span>
                              </div>
                            </div>

                            {/* Prices */}
                            <div className="hidden md:flex flex-col gap-0.5 flex-shrink-0 text-right">
                              {beat.licenses.map(l => (
                                <span key={l.id} className="text-xs" style={{ color: l.name==="Exclusive"?GOLD:"#555" }}>
                                  {l.name} <span className="font-bold text-white">${l.price}</span>
                                </span>
                              ))}
                            </div>

                            {/* Actions */}
                            {!beat.soldExclusive && (
                              <div className="flex flex-col gap-1.5 flex-shrink-0">
                                <button onClick={()=>toggleHidden(beat)}
                                  className="text-xs px-4 py-2 rounded-xl font-bold transition-all w-36 text-center"
                                  style={{ background: beat.hidden ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.06)", color: beat.hidden ? "#4ade80" : "#888", border: `1px solid ${beat.hidden?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.08)"}` }}>
                                  {beat.hidden ? "Show on Store" : "Hide from Store"}
                                </button>
                                <button onClick={()=>{ startEditBeat(beat); setTab("Beats"); }}
                                  className="text-xs px-4 py-2 rounded-xl font-bold transition-all w-36 text-center"
                                  style={{ background: GOLD_DIM, color: GOLD, border:`1px solid ${GOLD_BORDER}` }}>
                                  Edit Beat
                                </button>
                              </div>
                            )}
                            {beat.soldExclusive && (
                              <div className="flex-shrink-0 text-xs font-bold" style={{ color:"#f87171" }}>SOLD</div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
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
                          <option value="Basic">Basic</option>
                          <option value="Premium">Premium</option>
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

            {/* ── DRUM KITS ── */}
            {tab === "Drum Kits" && (
              <>
                <FormSection title={editingKit?`Editing: ${editingKit.name}`:"Add Drum Kit"}>
                  <form onSubmit={saveKit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Kit Name *" required value={kitForm.name} onChange={e=>setKitForm({...kitForm,name:e.target.value})} placeholder="Luchi Essentials Vol. 2" />
                      <Sel label="Genre" options={KIT_GENRES} value={kitForm.genre} onChange={e=>setKitForm({...kitForm,genre:e.target.value})} />
                      <Input label="Price ($) *" required type="number" step="0.01" value={kitForm.price} onChange={e=>setKitForm({...kitForm,price:e.target.value})} placeholder="29.99" />
                      <Input label="Sample Count *" required type="number" value={kitForm.sampleCount} onChange={e=>setKitForm({...kitForm,sampleCount:e.target.value})} placeholder="150" />
                      <Input label="Formats (comma separated)" value={kitForm.formats} onChange={e=>setKitForm({...kitForm,formats:e.target.value})} placeholder="WAV, 24-bit" />
                      <TagPicker value={kitForm.tags} onChange={v=>setKitForm({...kitForm,tags:v})} />
                      <div className="flex items-center gap-3 pt-5">
                        <input type="checkbox" id="kitPopular" checked={kitForm.popular} onChange={e=>setKitForm({...kitForm,popular:e.target.checked})} className="w-4 h-4 rounded" style={{ accentColor:GOLD }} />
                        <label htmlFor="kitPopular" className="text-sm text-white cursor-pointer">Mark as Popular</label>
                      </div>
                    </div>
                    <Textarea label="Description *" required rows={3} value={kitForm.description} onChange={e=>setKitForm({...kitForm,description:e.target.value})} placeholder="What's in this kit and what makes it special?" />
                    <Textarea label="What's Included (one item per line)" rows={5} value={kitForm.includes} onChange={e=>setKitForm({...kitForm,includes:e.target.value})} placeholder={"50 Drum Hits\n30 808s & Bass\n25 Hi-Hats & Cymbals"} />

                    {/* Cover art */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:TEXT_MUTED }}>Cover Art (optional)</p>
                      <input ref={kitImageRef} type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadKitImage(f); e.target.value=""; }} />
                      <div className="flex items-center gap-3">
                        {kitForm.imageUrl && (
                          <div className="relative flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={kitForm.imageUrl} alt="cover" className="w-12 h-12 rounded-lg object-cover border" style={{ borderColor:GOLD_BORDER }} />
                            <button type="button" onClick={()=>setKitForm(f=>({...f,imageUrl:""}))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black border flex items-center justify-center text-xs leading-none" style={{ borderColor:"#333",color:"#888" }}>×</button>
                          </div>
                        )}
                        <button type="button" disabled={kitImageUploading} onClick={()=>kitImageRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors" style={{ background:GOLD_DIM,color:GOLD,opacity:kitImageUploading?0.5:1 }}>
                          {kitImageUploading ? "Uploading…" : kitForm.imageUrl ? "Change Art" : "Choose Image"}
                        </button>
                      </div>
                    </div>

                    {/* Preview audio */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:TEXT_MUTED }}>Preview Audio (optional — short MP3 clip)</p>
                      <input ref={kitPreviewRef} type="file" accept="audio/*,.mp3,.wav" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadKitPreview(f); e.target.value=""; }} />
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={kitPreviewProgress!==null} onClick={()=>kitPreviewRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors flex-shrink-0" style={{ background:GOLD_DIM,color:GOLD,opacity:kitPreviewProgress!==null?0.5:1 }}>
                          {kitPreviewProgress!==null ? `Uploading ${kitPreviewProgress}%…` : kitForm.previewUrl ? "Change Preview" : "Choose Preview"}
                        </button>
                        {kitPreviewProgress!==null && (
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#222" }}>
                            <div className="h-full rounded-full transition-all" style={{ width:`${kitPreviewProgress}%`,background:GOLD }} />
                          </div>
                        )}
                        {kitForm.previewUrl && kitPreviewProgress===null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color:"#4ade80" }}>✓ {kitForm.previewUrl.split("/").pop()}</span>
                            <button type="button" onClick={()=>setKitForm(f=>({...f,previewUrl:""}))} className="text-xs" style={{ color:"#555" }}>×</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kit download file */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:TEXT_MUTED }}>Kit File (ZIP / RAR — the actual download)</p>
                      <input ref={kitZipRef} type="file" accept=".zip,.rar,.7z" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) uploadKitZip(f); e.target.value=""; }} />
                      <div className="flex items-center gap-3">
                        <button type="button" disabled={kitZipProgress!==null} onClick={()=>kitZipRef.current?.click()} className="text-sm px-4 py-2 rounded-lg font-semibold transition-colors flex-shrink-0" style={{ background:GOLD_DIM,color:GOLD,opacity:kitZipProgress!==null?0.5:1 }}>
                          {kitZipProgress!==null ? `Uploading ${kitZipProgress}%…` : kitForm.downloadUrl ? "Change File" : "Choose Kit File"}
                        </button>
                        {kitZipProgress!==null && (
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"#222" }}>
                            <div className="h-full rounded-full transition-all" style={{ width:`${kitZipProgress}%`,background:GOLD }} />
                          </div>
                        )}
                        {kitForm.downloadUrl && kitZipProgress===null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color:"#4ade80" }}>✓ {kitForm.downloadUrl.split("/").pop()}</span>
                            <button type="button" onClick={()=>setKitForm(f=>({...f,downloadUrl:""}))} className="text-xs" style={{ color:"#555" }}>×</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {kitMsg && <p className="text-sm font-medium" style={{ color:"#4ade80" }}>{kitMsg}</p>}
                    <div className="flex gap-3">
                      <GoldSubmit saving={kitSaving} label={editingKit?"Save Changes":"Add Kit"} />
                      {editingKit && <button type="button" onClick={()=>{setEditingKit(null);setKitForm(BLANK_KIT);}} className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background:"#1a1a1a",color:"#666" }}>Cancel</button>}
                    </div>
                  </form>
                </FormSection>

                <div>
                  <SectionHeader title={`Kits (${drumKits.length})`} />
                  {drumKits.length===0 ? <p className="text-sm" style={{ color:"#444" }}>No kits added yet.</p> : (
                    <div className="space-y-2">
                      {drumKits.map(kit => (
                        <div key={kit.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background:BG_CARD, border:`1px solid ${BORDER_SUBTLE}` }}>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-sm">{kit.name}</p>
                              {kit.popular && <Badge color={GOLD} bg={GOLD_DIM}>POPULAR</Badge>}
                            </div>
                            <p className="text-xs mt-0.5" style={{ color:"#555" }}>{kit.genre} · {kit.sampleCount} samples · ${kit.price}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <GoldBtn onClick={()=>startEditKit(kit)} small>Edit</GoldBtn>
                            <button onClick={()=>deleteKit(kit.id)} className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors" style={{ color:"#444",background:"#1a1a1a" }}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── KIT INVENTORY ── */}
            {tab === "Kit Inventory" && (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Live Kits" value={drumKits.filter(k=>!k.hidden).length} icon={Drum} />
                  <StatCard label="Hidden" value={drumKits.filter(k=>k.hidden).length} />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 flex-wrap">
                  {(["All","Live","Hidden"] as const).map(f => (
                    <button key={f} type="button" onClick={()=>setKitVisFilter(f)}
                      className="text-xs px-4 py-1.5 rounded-full font-bold transition-all"
                      style={{ background: kitVisFilter===f ? GOLD_DIM : "rgba(255,255,255,0.04)", color: kitVisFilter===f ? GOLD : TEXT_MUTED, border: `1px solid ${kitVisFilter===f ? GOLD_BORDER : BORDER_SUBTLE}` }}>
                      {f}
                      <span className="ml-1.5 opacity-60">
                        {f==="All"?drumKits.length:f==="Live"?drumKits.filter(k=>!k.hidden).length:drumKits.filter(k=>k.hidden).length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Kit rows */}
                {drumKits.length === 0 ? (
                  <p className="text-sm" style={{ color:"#444" }}>No drum kits uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {drumKits
                      .filter(k => kitVisFilter==="All" || (kitVisFilter==="Live"&&!k.hidden) || (kitVisFilter==="Hidden"&&k.hidden))
                      .map(kit => (
                        <div key={kit.id} className="rounded-2xl p-4 flex items-center gap-4"
                          style={{ background: BG_CARD, border:`1px solid ${kit.hidden ? "rgba(255,255,255,0.07)" : "rgba(201,168,76,0.15)"}`, opacity: kit.hidden ? 0.65 : 1 }}>

                          {/* Cover art */}
                          {kit.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={kit.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" style={{ border:`1px solid ${BORDER_SUBTLE}` }} />
                          ) : (
                            <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: BG_INPUT, border:`1px solid ${BORDER_SUBTLE}` }}>
                              <Drum size={20} style={{ color: TEXT_MUTED }} />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-bold text-white text-sm truncate">{kit.name}</p>
                              {kit.hidden ? <Badge color="#666" bg="rgba(255,255,255,0.05)">HIDDEN</Badge> : <Badge color="#4ade80" bg="rgba(74,222,128,0.08)">LIVE</Badge>}
                              {kit.popular && <Badge color={GOLD} bg={GOLD_DIM}>POPULAR</Badge>}
                            </div>
                            <p className="text-xs" style={{ color:"#555" }}>{kit.genre} · {kit.sampleCount} samples</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs font-semibold" style={{ color: GOLD }}>${kit.price}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: kit.previewUrl?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.03)", color: kit.previewUrl?"#4ade80":"#333" }}>Preview{kit.previewUrl?" ✓":" –"}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: kit.downloadUrl?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.03)", color: kit.downloadUrl?"#4ade80":"#333" }}>Download{kit.downloadUrl?" ✓":" –"}</span>
                            </div>
                          </div>

                          {/* Formats */}
                          <div className="hidden md:block text-xs text-right flex-shrink-0" style={{ color: TEXT_MUTED }}>
                            {kit.formats.join(" · ")}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <button onClick={()=>toggleKitHidden(kit)}
                              className="text-xs px-4 py-2 rounded-xl font-bold transition-all w-36 text-center"
                              style={{ background: kit.hidden?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.06)", color: kit.hidden?"#4ade80":"#888", border:`1px solid ${kit.hidden?"rgba(74,222,128,0.2)":"rgba(255,255,255,0.08)"}` }}>
                              {kit.hidden ? "Show on Store" : "Hide from Store"}
                            </button>
                            <button onClick={()=>{ startEditKit(kit); setTab("Drum Kits"); }}
                              className="text-xs px-4 py-2 rounded-xl font-bold transition-all w-36 text-center"
                              style={{ background: GOLD_DIM, color: GOLD, border:`1px solid ${GOLD_BORDER}` }}>
                              Edit Kit
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}

            {/* ── ARTISTS ── */}
            {tab === "Add Artist Spotlight" && (
              <>
                <FormSection title="Add Artist">
                  <form onSubmit={saveArtist} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Name *" required value={artistForm.name} onChange={e=>setArtistForm({...artistForm,name:e.target.value})} placeholder="Artist Name" />
                      <Input label="Genre *" required value={artistForm.genre} onChange={e=>setArtistForm({...artistForm,genre:e.target.value})} placeholder="Hip-Hop / Rap" />
                      <Input label="Photo URL" value={artistForm.imageUrl} onChange={e=>setArtistForm({...artistForm,imageUrl:e.target.value})} placeholder="/artists/name.jpg" />
                      <Input label="Instagram URL" value={artistForm.instagramUrl} onChange={e=>setArtistForm({...artistForm,instagramUrl:e.target.value})} placeholder="https://instagram.com/..." />
                      <Input label="YouTube URL" value={artistForm.youtubeUrl} onChange={e=>setArtistForm({...artistForm,youtubeUrl:e.target.value})} placeholder="https://youtube.com/@..." />
                      <Input label="Spotify URL" value={artistForm.spotifyUrl} onChange={e=>setArtistForm({...artistForm,spotifyUrl:e.target.value})} placeholder="https://open.spotify.com/artist/..." />
                      <Input label="Linktree URL" value={artistForm.linktreeUrl} onChange={e=>setArtistForm({...artistForm,linktreeUrl:e.target.value})} placeholder="https://linktr.ee/..." />
                    </div>
                    <Textarea label="Bio *" required rows={5} value={artistForm.bio} onChange={e=>setArtistForm({...artistForm,bio:e.target.value})} placeholder="Artist bio..." />
                    {artistMsg && <p className="text-sm font-medium" style={{ color:"#4ade80" }}>{artistMsg}</p>}
                    <GoldSubmit saving={false} label="Add Artist" />
                  </form>
                </FormSection>

                <div>
                  <SectionHeader title={`Artists (${artists.length})`} />
                  {artists.length===0 ? <p className="text-sm" style={{ color:"#444" }}>No artists added via admin yet.</p> : (
                    <div className="space-y-2">
                      {artists.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl" style={{ background:BG_CARD, border:`1px solid ${BORDER_SUBTLE}` }}>
                          <div>
                            <p className="font-bold text-white text-sm">{a.name}</p>
                            <p className="text-xs mt-0.5" style={{ color:"#555" }}>{a.genre}</p>
                          </div>
                          <button onClick={()=>deleteArtist(a.id)} className="text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors" style={{ color:"#444",background:"#1a1a1a" }}>Remove</button>
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
            {tab === "Messages" && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard label="Total" value={messages.filter(m=>m.folder!=="trash").length} icon={Mail} />
                  <StatCard label="Unread" value={messages.filter(m=>!m.read&&m.folder!=="trash"&&m.folder!=="archive").length} />
                  <StatCard label="Starred" value={messages.filter(m=>m.starred&&m.folder!=="trash").length} />
                  <StatCard label="Replied" value={messages.filter(m=>m.replied&&m.folder!=="trash").length} />
                </div>

                {/* Folder sub-nav */}
                {(() => {
                  const folders: { id: typeof msgFolder; label: string; count: number }[] = [
                    { id:"inbox",   label:"Inbox",   count: messages.filter(m=>!m.folder||m.folder==="inbox").length },
                    { id:"starred", label:"Starred", count: messages.filter(m=>m.starred&&m.folder!=="trash").length },
                    { id:"replied", label:"Replied", count: messages.filter(m=>m.replied&&m.folder!=="trash").length },
                    { id:"archive", label:"Archive", count: messages.filter(m=>m.folder==="archive").length },
                    { id:"trash",   label:"Trash",   count: messages.filter(m=>m.folder==="trash").length },
                  ];
                  return (
                    <div className="flex gap-1.5 flex-wrap p-1 rounded-xl" style={{ background: BG_INPUT }}>
                      {folders.map(f => {
                        const unread = f.id==="inbox" ? messages.filter(m=>(!m.folder||m.folder==="inbox")&&!m.read).length : 0;
                        const active = msgFolder===f.id;
                        return (
                          <button key={f.id} onClick={()=>{ setMsgFolder(f.id); setExpandedMsg(null); }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                            style={{ background:active?BG_CARD:"transparent", color:active?GOLD:TEXT_MUTED, border:`1px solid ${active?GOLD_BORDER:"transparent"}`, boxShadow:active?"0 1px 4px rgba(0,0,0,0.2)":"none" }}>
                            {f.label}
                            <span className="rounded-full px-1.5 py-0.5 text-xs font-black" style={{ background: unread>0?"rgba(201,168,76,0.2)":"rgba(255,255,255,0.06)", color: unread>0?GOLD:TEXT_MUTED }}>
                              {f.id==="inbox"?f.count:f.count}
                            </span>
                            {unread>0 && <span className="w-1.5 h-1.5 rounded-full" style={{ background:GOLD }} />}
                          </button>
                        );
                      })}
                      <div className="flex-1" />
                      {messages.length>0 && <GoldBtn onClick={exportMessages} small>Export CSV</GoldBtn>}
                    </div>
                  );
                })()}

                {/* Message list */}
                {(() => {
                  const folderMsgs = messages.filter(m => {
                    if (msgFolder==="inbox")   return !m.folder||m.folder==="inbox";
                    if (msgFolder==="starred") return m.starred&&m.folder!=="trash";
                    if (msgFolder==="replied") return m.replied&&m.folder!=="trash";
                    if (msgFolder==="archive") return m.folder==="archive";
                    if (msgFolder==="trash")   return m.folder==="trash";
                    return true;
                  });

                  if (folderMsgs.length===0) return (
                    <div className="text-center py-12" style={{ color:TEXT_MUTED }}>
                      <p className="text-2xl mb-2">{msgFolder==="trash"?"🗑️":msgFolder==="starred"?"⭐":msgFolder==="replied"?"↩️":"📭"}</p>
                      <p className="text-sm font-semibold">
                        {msgFolder==="inbox"?"No messages yet":msgFolder==="starred"?"No starred messages":msgFolder==="replied"?"No replied messages yet":msgFolder==="archive"?"Archive is empty":"Trash is empty"}
                      </p>
                    </div>
                  );

                  return (
                    <div className="space-y-2">
                      {folderMsgs.map(m => (
                        <div key={m.id} className="rounded-2xl overflow-hidden transition-all"
                          style={{ background:BG_CARD, border:`1px solid ${m.starred?GOLD_BORDER:!m.read&&(msgFolder==="inbox")?"rgba(201,168,76,0.25)":BORDER_SUBTLE}` }}>

                          {/* Header row */}
                          <div className="flex items-center gap-3 px-4 py-3.5">
                            {/* Star */}
                            <button onClick={()=>starMessage(m.id,!m.starred)} className="flex-shrink-0 transition-all text-base leading-none"
                              style={{ color:m.starred?GOLD:TEXT_MUTED, opacity:m.starred?1:0.5 }}
                              title={m.starred?"Unstar":"Star"}>★</button>

                            {/* Expand / collapse */}
                            <button className="flex-1 text-left min-w-0" onClick={()=>{ setExpandedMsg(expandedMsg===m.id?null:m.id); if(!m.read) markRead(m.id,true); }}>
                              <div className="flex items-center gap-2 min-w-0 mb-0.5">
                                {!m.read && msgFolder==="inbox" && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:GOLD }} />}
                                <p className={`text-sm truncate ${!m.read?"font-black text-white":"font-semibold"}`} style={{ color: !m.read?"white":"var(--adm-dim)" }}>
                                  {m.name}
                                </p>
                                {m.replied && <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ background:"rgba(74,222,128,0.1)",color:"#4ade80" }}>Replied</span>}
                                {m.folder==="archive" && msgFolder!=="archive" && <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ background:GOLD_DIM,color:GOLD }}>Archived</span>}
                              </div>
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="text-xs truncate font-medium" style={{ color:TEXT_MUTED }}>{m.subject}</p>
                                <span className="text-xs flex-shrink-0" style={{ color:TEXT_MUTED }}>·</span>
                                <p className="text-xs flex-shrink-0" style={{ color:TEXT_MUTED }}>{new Date(m.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                              </div>
                            </button>

                            <span className="text-xs flex-shrink-0" style={{ color:TEXT_MUTED }}>{expandedMsg===m.id?"▲":"▼"}</span>
                          </div>

                          {/* Expanded body */}
                          {expandedMsg===m.id && (
                            <div className="px-5 pb-5 border-t" style={{ borderColor:BORDER_SUBTLE }}>
                              <p className="text-xs mt-3 mb-1 font-semibold" style={{ color:TEXT_MUTED }}>From: {m.name} · {m.email}</p>
                              <p className="text-sm leading-relaxed mt-3 whitespace-pre-wrap" style={{ color:"var(--adm-dim)" }}>{m.message}</p>

                              <div className="flex flex-wrap gap-2 mt-5">
                                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                                  onClick={()=>markReplied(m.id)}
                                  className="text-xs px-4 py-2 rounded-lg font-bold"
                                  style={{ background:GOLD_DIM, color:GOLD, border:`1px solid ${GOLD_BORDER}` }}>
                                  Reply via Email
                                </a>
                                {!m.replied && (
                                  <button onClick={()=>markReplied(m.id)} className="text-xs px-4 py-2 rounded-lg font-bold transition-all"
                                    style={{ background:"rgba(74,222,128,0.08)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)" }}>
                                    Mark Replied
                                  </button>
                                )}
                                {m.folder!=="archive" && (
                                  <button onClick={()=>archiveMessage(m.id)} className="text-xs px-4 py-2 rounded-lg font-bold transition-all"
                                    style={{ background:"rgba(255,255,255,0.05)",color:TEXT_DIM,border:`1px solid ${BORDER_SUBTLE}` }}>
                                    Archive
                                  </button>
                                )}
                                {(m.folder==="archive"||m.folder==="trash") && (
                                  <button onClick={()=>restoreMessage(m.id)} className="text-xs px-4 py-2 rounded-lg font-bold transition-all"
                                    style={{ background:"rgba(74,222,128,0.08)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.2)" }}>
                                    Restore to Inbox
                                  </button>
                                )}
                                {m.folder!=="trash" ? (
                                  <button onClick={()=>trashMessage(m.id)} className="text-xs px-4 py-2 rounded-lg font-bold transition-all"
                                    style={{ background:"rgba(239,68,68,0.06)",color:"#f87171",border:"1px solid rgba(239,68,68,0.15)" }}>
                                    Move to Trash
                                  </button>
                                ) : (
                                  <button onClick={()=>deleteMessage(m.id)} className="text-xs px-4 py-2 rounded-lg font-bold transition-all"
                                    style={{ background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.25)" }}>
                                    Delete Forever
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}

            {/* ── SUBSCRIBERS ── */}
            {tab === "Subscribers" && (
              <>
                {/* Folder nav */}
                <div className="flex items-center gap-2">
                  {([["list","All Subscribers",subscribers.length,null],["deliveries","🎁 Free Beat Sent",deliveries.length,null],["giveaway","🎯 Giveaway Blast",null,null]] as const).map(([view,label,count])=>(
                    <button key={view} onClick={()=>{ setSubView(view as "list"|"deliveries"|"giveaway"); setGiveawayResult(null); setGiveawayConfirm(false); }}
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

                {/* ── FREE BEAT DELIVERIES view ── */}
                {subView==="deliveries" && (() => {
                  const beatDeliveries  = deliveries.filter(d=>d.type==="beat");
                  const promoDeliveries = deliveries.filter(d=>d.type==="promo" || !d.type);
                  const emailSentCount  = deliveries.filter(d=>d.emailSent).length;
                  const recipientEmails = new Set(deliveries.map(d=>d.subscriberEmail));

                  // Group beat deliveries by beat
                  const byBeat: Record<string,{beatTitle:string;items:FreeBeatDelivery[]}> = {};
                  for (const d of beatDeliveries) {
                    const key = d.beatId ?? "unknown";
                    if (!byBeat[key]) byBeat[key] = { beatTitle:d.beatTitle??"Unknown Beat", items:[] };
                    byBeat[key].items.push(d);
                  }
                  const beatGroups = Object.entries(byBeat).sort((a,b)=>b[1].items.length-a[1].items.length);

                  function timeAgo(date: string) {
                    const diff = Math.floor((Date.now()-new Date(date).getTime())/1000);
                    if (diff<60) return "just now";
                    if (diff<3600) return `${Math.floor(diff/60)}m ago`;
                    if (diff<86400) return `${Math.floor(diff/3600)}h ago`;
                    if (diff<2592000) return `${Math.floor(diff/86400)}d ago`;
                    return `${Math.floor(diff/2592000)}mo ago`;
                  }

                  const exportAll = () => downloadCSV(
                    "luchibeats-email-log.csv",
                    ["Email","Type","Beat","Email Sent","Date"],
                    deliveries.map(d=>[d.subscriberEmail,d.type??"beat",d.beatTitle??"—",d.emailSent?"Yes":"No (Resend not set up)",new Date(d.deliveredAt).toLocaleDateString()])
                  );

                  function DeliveryTable({ items }: { items: FreeBeatDelivery[] }) {
                    return (
                      <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${BORDER_SUBTLE}` }}>
                        <div className="grid grid-cols-12 px-4 py-2.5" style={{ background:BG_INPUT,borderBottom:`1px solid ${BORDER_SUBTLE}` }}>
                          <span className="col-span-1 text-xs font-black tracking-widest" style={{ color:TEXT_MUTED }}>#</span>
                          <span className="col-span-6 text-xs font-black tracking-widest" style={{ color:TEXT_MUTED }}>EMAIL</span>
                          <span className="col-span-2 text-xs font-black tracking-widest" style={{ color:TEXT_MUTED }}>EMAILED</span>
                          <span className="col-span-3 text-xs font-black tracking-widest text-right" style={{ color:TEXT_MUTED }}>DATE</span>
                        </div>
                        {items.map((d,i)=>(
                          <div key={d.id} className="group grid grid-cols-12 items-center px-4 py-3 transition-all"
                            style={{ borderBottom:i<items.length-1?`1px solid ${BORDER_SUBTLE}`:"none",background:"transparent" }}
                            onMouseEnter={e=>(e.currentTarget.style.background=GOLD_DIM)}
                            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                            <span className="col-span-1 text-xs font-mono" style={{ color:TEXT_MUTED }}>{i+1}</span>
                            <div className="col-span-6 flex items-center gap-2 min-w-0">
                              <span className="text-sm text-white truncate">{d.subscriberEmail}</span>
                              <button onClick={()=>navigator.clipboard.writeText(d.subscriberEmail)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                                style={{ color:GOLD,background:"rgba(201,168,76,0.08)" }} title="Copy">⎘</button>
                            </div>
                            <span className="col-span-2 text-xs" style={{ color:d.emailSent?"#4ade80":TEXT_DIM }}>
                              {d.emailSent ? "✓ Sent" : "—"}
                            </span>
                            <span className="col-span-3 text-xs text-right" style={{ color:TEXT_MUTED }}>{timeAgo(d.deliveredAt)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Resend setup notice if emails aren't sending */}
                      {emailSentCount===0 && deliveries.length>0 && (
                        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)" }}>
                          <span className="text-lg flex-shrink-0">⚠️</span>
                          <div>
                            <p className="text-sm font-bold text-white mb-1">Emails are not being sent yet</p>
                            <p className="text-xs mb-2" style={{ color:TEXT_MUTED }}>Add <code style={{ color:GOLD }}>RESEND_API_KEY</code> and <code style={{ color:GOLD }}>RESEND_FROM_EMAIL</code> to your Vercel environment variables to activate email delivery. Get a free API key at resend.com.</p>
                            <p className="text-xs" style={{ color:TEXT_DIM }}>Deliveries are still being tracked — once Resend is set up, new subscribers will receive emails automatically.</p>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard label="Total Logged" value={deliveries.length} icon={Mail} />
                        <StatCard label="Free Beats Sent" value={beatDeliveries.length} icon={Music} />
                        <StatCard label="Promo Emails" value={promoDeliveries.length} />
                        <StatCard label="Emails Delivered" value={emailSentCount} sub={emailSentCount===0?"Set up Resend":undefined} />
                      </div>

                      {deliveries.length===0 ? (
                        <Card>
                          <div className="text-center py-10" style={{ color:TEXT_MUTED }}>
                            <p className="text-3xl mb-3">📬</p>
                            <p className="text-sm font-semibold text-white">No emails logged yet</p>
                            <p className="text-xs mt-1">Every subscriber gets either a free beat or a promo email — both are tracked here.</p>
                          </div>
                        </Card>
                      ) : (
                        <>
                          {/* Beat deliveries grouped by beat */}
                          {beatGroups.length>0 && beatGroups.map(([beatId,group])=>(
                            <Card key={beatId}>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-xs font-black tracking-widest mb-1" style={{ color:TEXT_MUTED }}>🎵 FREE BEAT DELIVERED</p>
                                  <p className="text-base font-bold text-white">{group.beatTitle}</p>
                                </div>
                                <span className="px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background:"rgba(201,168,76,0.1)",color:GOLD }}>
                                  {group.items.length} recipient{group.items.length!==1?"s":""}
                                </span>
                              </div>
                              <DeliveryTable items={group.items} />
                            </Card>
                          ))}

                          {/* Promo emails */}
                          {promoDeliveries.length>0 && (
                            <Card>
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-xs font-black tracking-widest mb-1" style={{ color:TEXT_MUTED }}>📣 PROMO / WELCOME EMAIL</p>
                                  <p className="text-sm text-white">Subscribers who got a welcome email instead of a free beat<br/><span className="text-xs" style={{ color:TEXT_MUTED }}>(no free beat was active at sign-up, or beat was already sent to them)</span></p>
                                </div>
                                <span className="px-3 py-1.5 rounded-xl text-sm font-bold" style={{ background:"rgba(96,165,250,0.1)",color:"#60a5fa" }}>
                                  {promoDeliveries.length} sent
                                </span>
                              </div>
                              <DeliveryTable items={promoDeliveries} />
                            </Card>
                          )}

                          {/* Export */}
                          <div className="flex justify-end">
                            <GoldBtn onClick={exportAll} small>Export Full Log CSV</GoldBtn>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}

                {/* ── GIVEAWAY BLAST view ── */}
                {subView==="giveaway" && (() => {
                  // Compute live recipient count
                  const now = Date.now();
                  const cutoff30 = now - 30*24*60*60*1000;
                  const noBeatSet = new Set(deliveries.filter(d=>d.beatId===giveawayForm.beatId).map(d=>d.subscriberEmail));
                  const audienceCount = giveawayForm.audience==="all"
                    ? subscribers.length
                    : giveawayForm.audience==="new30"
                      ? subscribers.filter(s=>new Date(s.createdAt).getTime()>=cutoff30).length
                      : subscribers.filter(s=>!noBeatSet.has(s.email)).length;

                  const selectedBeat = beats.find(b=>b.id===giveawayForm.beatId) ?? null;

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
                      // Refresh deliveries
                      const dl = await load("/api/admin/free-beat-deliveries");
                      if (dl) setDeliveries(dl);
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
                            <p className="text-xs" style={{ color:TEXT_MUTED }}>Send a beat download or custom email to your subscriber list. Choose your content, target audience, then fire.</p>
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
                      <div className="grid grid-cols-3 gap-3">
                        <StatCard label="Total Subscribers" value={subscribers.length} icon={FileText} />
                        <StatCard label="Target Audience" value={audienceCount} sub={giveawayForm.audience==="all"?"All subscribers":giveawayForm.audience==="new30"?"Last 30 days":"Haven't got this beat"} />
                        <StatCard label="Past Blasts" value={deliveries.filter(d=>d.id.startsWith("giveaway")).length} />
                      </div>

                      <Card>
                        <SectionHeader title="Step 1 — What to Send" />
                        {/* Type toggle */}
                        <div className="flex gap-2 mb-5">
                          {([["beat","🎵 Beat Download"],["custom","✉️ Custom Email"]] as const).map(([t,label])=>(
                            <button key={t} type="button"
                              onClick={()=>setGiveawayForm({...giveawayForm,type:t})}
                              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                              style={{ background:giveawayForm.type===t?"rgba(201,168,76,0.15)":"rgba(255,255,255,0.03)", color:giveawayForm.type===t?GOLD:TEXT_MUTED, border:`1px solid ${giveawayForm.type===t?"rgba(201,168,76,0.35)":BORDER_SUBTLE}` }}>
                              {label}
                            </button>
                          ))}
                        </div>

                        {giveawayForm.type==="beat" ? (
                          <>
                            <label className="flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] mb-2 uppercase" style={{ color:"#6e6e7a" }}>
                              <span style={{ color:GOLD,fontSize:10 }}>▶</span>Select Beat
                            </label>
                            <select
                              value={giveawayForm.beatId}
                              onChange={e=>setGiveawayForm({...giveawayForm,beatId:e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-3"
                              style={{ background:BG_INPUT,border:`1px solid ${BORDER_SUBTLE}`,color:"var(--adm-dim)" }}>
                              <option value="">— Choose a beat —</option>
                              {beats.map(b=>(
                                <option key={b.id} value={b.id}>{b.title}{b.isFree?" (subscriber-only)":""}</option>
                              ))}
                            </select>
                            {selectedBeat && (
                              <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background:"rgba(201,168,76,0.06)",border:`1px solid rgba(201,168,76,0.15)` }}>
                                <span className="text-xl">🎵</span>
                                <div>
                                  <p className="text-sm font-bold text-white">{selectedBeat.title}</p>
                                  <p className="text-xs" style={{ color:TEXT_MUTED }}>
                                    {selectedBeat.genre} · {selectedBeat.bpm} BPM
                                    {selectedBeat.isFree && <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background:"rgba(201,168,76,0.1)",color:GOLD }}>Subscriber-only</span>}
                                  </p>
                                </div>
                              </div>
                            )}
                            <Input label="Email Subject" value={giveawayForm.subject}
                              onChange={e=>setGiveawayForm({...giveawayForm,subject:e.target.value})}
                              placeholder={`Your free beat is here — ${selectedBeat?.title||"Beat Title"}`} />
                          </>
                        ) : (
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
                                placeholder="https://www.luchibeats.com/beats" />
                            </div>
                          </>
                        )}
                      </Card>

                      <Card>
                        <SectionHeader title="Step 2 — Who Gets It" />
                        <div className="space-y-2">
                          {([
                            ["all", "All Subscribers", `Send to every subscriber (${subscribers.length} total)`],
                            ["new30", "New Subscribers", `Only subscribers from the last 30 days (${subscribers.filter(s=>new Date(s.createdAt).getTime()>=cutoff30).length} people)`],
                            ["nobeat", "Haven't Received This Beat", `Only subscribers who haven't gotten this beat yet (${giveawayForm.beatId?subscribers.filter(s=>!noBeatSet.has(s.email)).length:subscribers.length} people)`],
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
                                disabled={audienceCount===0 || (giveawayForm.type==="beat"&&!giveawayForm.beatId) || !giveawayForm.subject.trim()}
                                className="px-5 py-2 rounded-xl text-sm font-black transition-all"
                                style={{ background:audienceCount===0||!giveawayForm.subject.trim()||(giveawayForm.type==="beat"&&!giveawayForm.beatId)?"rgba(255,255,255,0.04)":"rgba(201,168,76,0.12)", color:audienceCount===0||!giveawayForm.subject.trim()||(giveawayForm.type==="beat"&&!giveawayForm.beatId)?TEXT_DIM:GOLD, border:`1px solid ${audienceCount===0||!giveawayForm.subject.trim()||(giveawayForm.type==="beat"&&!giveawayForm.beatId)?BORDER_SUBTLE:"rgba(201,168,76,0.3)"}`, cursor:audienceCount===0||!giveawayForm.subject.trim()||(giveawayForm.type==="beat"&&!giveawayForm.beatId)?"not-allowed":"pointer" }}>
                                Review &amp; Send →
                              </button>
                            )}
                          </div>
                        </div>
                        {giveawayConfirm && (
                          <div className="rounded-xl p-4 mt-3" style={{ background:"rgba(201,168,76,0.06)",border:`1px solid rgba(201,168,76,0.2)` }}>
                            <p className="text-xs font-black tracking-widest mb-3" style={{ color:GOLD }}>CONFIRM BLAST</p>
                            <div className="space-y-2 text-xs" style={{ color:TEXT_MUTED }}>
                              <div className="flex gap-2"><span style={{ color:TEXT_DIM,width:80,flexShrink:0 }}>Type</span><span className="text-white font-semibold">{giveawayForm.type==="beat"?"Beat Download":"Custom Email"}</span></div>
                              {giveawayForm.type==="beat" && selectedBeat && <div className="flex gap-2"><span style={{ color:TEXT_DIM,width:80,flexShrink:0 }}>Beat</span><span className="text-white font-semibold">{selectedBeat.title}</span></div>}
                              <div className="flex gap-2"><span style={{ color:TEXT_DIM,width:80,flexShrink:0 }}>Subject</span><span className="text-white font-semibold">{giveawayForm.subject}</span></div>
                              <div className="flex gap-2"><span style={{ color:TEXT_DIM,width:80,flexShrink:0 }}>Audience</span><span className="text-white font-semibold">{audienceCount} subscriber{audienceCount!==1?"s":""}</span></div>
                            </div>
                          </div>
                        )}
                        {!giveawayForm.subject.trim() && <p className="text-xs mt-3" style={{ color:"#f87171" }}>⚠ Enter an email subject to continue.</p>}
                        {giveawayForm.type==="beat" && !giveawayForm.beatId && <p className="text-xs mt-1" style={{ color:"#f87171" }}>⚠ Select a beat to continue.</p>}
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
                      <p className="text-xs mb-3" style={{ color:TEXT_MUTED }}>The public merch page at <code style={{ color:GOLD }}>/merch</code> displays a styled "Coming Soon" page. Once your Shopify store is connected and products are live, you can upgrade this page to show real inventory.</p>
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
                      <Input label="CTA Button Link" value={homepageForm.heroCtaUrl} onChange={e=>setHomepageForm({...homepageForm,heroCtaUrl:e.target.value})} placeholder="/beats" />
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
                    <Input label="Badge Text" value={homepageForm.emailBadge} onChange={e=>setHomepageForm({...homepageForm,emailBadge:e.target.value})} placeholder="FREE BEAT" />
                    <Textarea label="Headline (use a newline to split into two lines — second line gets the gold gradient)" rows={2} value={homepageForm.emailHeadline} onChange={e=>setHomepageForm({...homepageForm,emailHeadline:e.target.value})} placeholder={"Get a Free Beat\nWhen You Subscribe"} />
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
