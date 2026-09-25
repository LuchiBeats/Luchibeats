"use client";
import { useState } from "react";
import { useCart } from "@/lib/store";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ id: i.id, type: i.type })) }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Couldn't start checkout. Please try again.");
    } catch {
      setError("Couldn't reach checkout. Check your connection and try again.");
    }
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto mb-6" style={{ color: "var(--muted)" }} />
        <h1 className="text-2xl font-black text-white mb-2">Your cart is empty</h1>
        <p className="mb-8" style={{ color: "var(--muted)" }}>Head over to the store and grab some beats.</p>
        <Link href="/beats" className="btn-gold px-8 py-3 rounded text-sm">Browse Beats</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-8">Your Cart</h1>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div key={item.id} className="card-surface rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{item.name}</p>
              <p className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>{item.type}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold" style={{ color: "var(--gold)" }}>${item.price}</span>
              <button onClick={() => removeItem(item.id)} className="hover:text-red-400 transition-colors" style={{ color: "var(--muted)" }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-white">Total</span>
          <span className="text-2xl font-black" style={{ color: "var(--gold)" }}>${total()}</span>
        </div>
        <button onClick={checkout} disabled={loading} className="btn-gold w-full py-3 rounded text-sm font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? "Opening secure checkout…" : <>Checkout <ArrowRight size={16} /></>}
        </button>
        {error && <p className="text-sm text-center mt-3 text-red-400">{error}</p>}
        <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
          Secure payment powered by Stripe. You&apos;ll receive download links immediately after purchase.
        </p>
      </div>
    </div>
  );
}
