"use client";
import { Check, ShoppingCart } from "lucide-react";
import { mixingServices } from "@/lib/data";
import { useCart } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function MixingPage() {
  const { addItem, items } = useCart();

  const inCart = (id: string) => items.some((i) => i.id === `service-${id}`);

  const handleBook = (serviceId: string) => {
    const service = mixingServices.find((s) => s.id === serviceId);
    if (!service) return;
    addItem({
      id: `service-${service.id}`,
      type: "service",
      name: service.name,
      price: service.price,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>PROFESSIONAL SERVICES</p>
        <h1 className="text-4xl font-black text-white mb-4">Mixing & Mastering</h1>
        <p className="max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
          Every mix is crafted with intention — clean low-end, clear vocals, balanced instruments, and a master that translates on every speaker.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {mixingServices.map((service) => (
          <div key={service.id} className={cn("rounded-lg p-6 flex flex-col relative", service.popular ? "border-2" : "card-surface")}
            style={service.popular ? { borderColor: "var(--gold)", background: "var(--surface)" } : {}}>
            {service.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black" style={{ background: "var(--gold)" }}>
                MOST POPULAR
              </div>
            )}
            <div className="mb-6">
              <h2 className="text-xl font-black text-white mb-1">{service.name}</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{service.turnaround}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black" style={{ color: "var(--gold)" }}>${service.price}</span>
              <span className="text-sm ml-1" style={{ color: "var(--muted)" }}>/ project</span>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--muted)" }}>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleBook(service.id)}
              disabled={inCart(service.id)}
              className={cn("w-full py-3 rounded font-semibold text-sm transition-colors", inCart(service.id) ? "text-green-400 border border-green-400/30" : service.popular ? "btn-gold" : "btn-outline")}
            >
              {inCart(service.id) ? (
                <span className="flex items-center justify-center gap-2"><Check size={16} /> Added to Cart</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><ShoppingCart size={16} /> Add to Cart</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Process Section */}
      <div className="border-t pt-16" style={{ borderColor: "var(--border)" }}>
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>HOW IT WORKS</p>
          <h2 className="text-3xl font-black text-white">The Process</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Add to Cart", desc: "Choose your package and add it to your cart." },
            { step: "02", title: "Checkout", desc: "Complete payment securely via Stripe." },
            { step: "03", title: "Send Your Files", desc: "Upload your stems and vocals to the shared link we send you." },
            { step: "04", title: "Receive Your Mix", desc: "Get your polished track delivered within the turnaround window." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <p className="text-4xl font-black mb-3" style={{ color: "rgba(201,168,76,0.3)" }}>{step}</p>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
