export default function MixingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>PROFESSIONAL SERVICES</p>
        <h1 className="text-4xl font-black text-white mb-4">Mixing & Mastering</h1>
        <p className="max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
          Every mix is crafted with intention — clean low-end, clear vocals, balanced instruments, and a master that translates on every speaker.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center mb-20">
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: "var(--gold)" }}>EXPANDING THE CATALOG</p>
        <h2 className="text-3xl font-black text-white">Services Coming Soon</h2>
        <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
          More options are on the way. Stay locked in.
        </p>
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
