import { NextRequest, NextResponse } from "next/server";
import { getStripe, resolveCart, type CartRef } from "@/lib/checkout";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/checkout — body: { items: CartRef[] } → { url } of a Stripe Checkout page
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`checkout:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Checkout isn't available yet. Please contact us to purchase." }, { status: 503 });
  }

  let items;
  try {
    const { items: refs } = (await req.json()) as { items: CartRef[] };
    items = await resolveCart(refs);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid cart." }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            ...(item.imageUrl?.startsWith("https://") ? { images: [item.imageUrl] } : {}),
            metadata: { kind: item.kind, refId: item.refId, license: item.licenseName ?? "" },
          },
        },
      })),
      allow_promotion_codes: true,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] Stripe session create failed", e);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
}
