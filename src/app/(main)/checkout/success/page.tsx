import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, Mail } from "lucide-react";
import { getStripe, purchasedItems, type PurchasedItem } from "@/lib/checkout";
import ClearCart from "./ClearCart";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sessionId = (await searchParams).session_id;
  const stripe = getStripe();

  let paid = false;
  let email = "";
  let total = 0;
  let items: PurchasedItem[] = [];
  if (stripe && typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      email = session.customer_details?.email ?? "";
      total = (session.amount_total ?? 0) / 100;
      if (paid) items = await purchasedItems(stripe, sessionId);
    } catch {
      // Invalid or unknown session — fall through to the "not found" state
    }
  }

  if (!paid) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-black text-white mb-2">We couldn&apos;t find that order</h1>
        <p className="mb-8" style={{ color: "var(--muted)" }}>
          If you just paid, check your email for your download links. Still stuck? Reach out and we&apos;ll sort it out.
        </p>
        <Link href="/contact" className="btn-gold px-8 py-3 rounded text-sm">Contact Us</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <ClearCart />
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center fire-glow" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <Check size={28} style={{ color: "var(--fire)" }} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Order Confirmed</h1>
        <p className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
          <Mail size={14} /> A copy of your files and license is on its way to {email || "your email"}.
        </p>
        <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
          Download links expire after 7 days — bookmark this page to get fresh links anytime.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div key={`${item.refId}-${item.licenseName ?? ""}`} className="card-surface rounded-lg p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <p className="font-semibold text-white text-sm">{item.name}</p>
              <span className="font-bold text-sm" style={{ color: "var(--gold)" }}>${item.amount.toFixed(2)}</span>
            </div>
            {item.soldToSomeoneElse ? (
              <p className="text-xs" style={{ color: "var(--fire)" }}>Another buyer completed this exclusive moments before you — this item is being refunded to your original payment method.</p>
            ) : item.downloads.length ? (
              <div className="flex flex-wrap gap-2">
                {item.downloads.map((d) => (
                  <a key={d.label} href={d.url} target="_blank" rel="noopener noreferrer" download
                    className="btn-gold px-4 py-2 rounded text-xs font-bold flex items-center gap-2">
                    <Download size={14} /> {d.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--fire)" }}>Your files are being prepared — we&apos;ll email them to you shortly.</p>
            )}
          </div>
        ))}
      </div>

      <div className="card-surface rounded-lg p-6 flex justify-between items-center mb-8">
        <span className="font-semibold text-white">Total paid</span>
        <span className="text-2xl font-black" style={{ color: "var(--gold)" }}>${total.toFixed(2)}</span>
      </div>

      <div className="text-center">
        <Link href="/beats" className="text-sm underline" style={{ color: "var(--muted)" }}>Keep browsing beats</Link>
      </div>
    </div>
  );
}
