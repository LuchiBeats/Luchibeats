import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, purchasedItems } from "@/lib/checkout";
import { getBeats, saveBeats, getOrders, saveOrders, getSoldArchive, saveSoldArchive, type Order } from "@/lib/beats-store";
import { sendEmail, purchaseEmailHtml, saleAlertEmailHtml, exclusiveRefundEmailHtml, type EmailAttachment } from "@/lib/email";

const SITE_URL = "https://www.luchibeats.com";

// Stripe calls this after payment. Records orders, retires exclusive beats, and emails files + license to the buyer.
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") await fulfill(stripe, session);
  } else if (event.type === "checkout.session.expired") {
    await releaseHolds((event.data.object as Stripe.Checkout.Session).id);
  }
  return NextResponse.json({ received: true });
}

// An abandoned checkout frees its exclusives right away instead of waiting for the hold to run out
async function releaseHolds(sessionId: string) {
  const beats = await getBeats();
  const held = beats.filter((b) => b.exclusiveHold?.sessionId === sessionId);
  if (!held.length) return;
  for (const beat of held) delete beat.exclusiveHold;
  await saveBeats(beats);
}

async function fulfill(stripe: Stripe, session: Stripe.Checkout.Session) {
  // Stripe can deliver the same event more than once — only fulfill a session once
  const orders = await getOrders();
  if (orders.some((o) => o.stripeSessionId === session.id)) return;

  const buyerEmail = session.customer_details?.email ?? "";
  const buyerName = session.customer_details?.name ?? "";
  const purchaseDate = new Date().toISOString();
  const allItems = await purchasedItems(stripe, session.id);

  // Exclusives another buyer got first: refund that line and don't deliver it
  const lost = allItems.filter((i) => i.soldToSomeoneElse);
  const items = allItems.filter((i) => !i.soldToSomeoneElse);
  const refunded = new Set<string>();
  for (const item of lost) {
    try {
      await stripe.refunds.create({
        payment_intent: String(session.payment_intent),
        amount: Math.round(item.amount * 100),
        reason: "duplicate",
        metadata: { reason: "exclusive already sold", beatId: item.refId },
      });
      refunded.add(item.refId);
    } catch (e) {
      console.error(`[stripe] Auto-refund failed for session ${session.id}, beat ${item.refId}`, e);
    }
  }

  const newOrders: Order[] = allItems.map((item, i) => ({
    id: `ord-${Date.now()}-${i}`,
    type: item.kind,
    itemId: item.refId,
    itemTitle: item.name,
    licenseType: item.licenseName,
    customerEmail: buyerEmail,
    customerName: buyerName,
    amount: item.amount,
    status: item.soldToSomeoneElse && refunded.has(item.refId) ? "refunded" : "completed",
    createdAt: purchaseDate,
    notes: item.soldToSomeoneElse
      ? `Exclusive already sold to another buyer — ${refunded.has(item.refId) ? "auto-refunded" : "AUTO-REFUND FAILED, refund manually in Stripe"}. Stripe ${session.payment_intent ?? session.id}`
      : `Stripe ${session.payment_intent ?? session.id}`,
    stripeSessionId: session.id,
  }));
  await saveOrders([...newOrders, ...orders]);

  // Exclusive purchases take the beat off the store and go into the sold archive; holds from this checkout are released
  const exclusiveIds = items.filter((i) => i.licenseName === "Exclusive").map((i) => i.refId);
  const beats = await getBeats();
  const holdsToRelease = beats.filter((b) => b.exclusiveHold?.sessionId === session.id);
  if (exclusiveIds.length || holdsToRelease.length) {
    const archive = await getSoldArchive();
    for (const beat of beats) {
      if (beat.exclusiveHold?.sessionId === session.id) delete beat.exclusiveHold;
      if (!exclusiveIds.includes(beat.id) || beat.soldExclusive) continue;
      const order = newOrders.find((o) => o.itemId === beat.id && o.licenseType === "Exclusive");
      archive.unshift({ beat: { ...beat }, soldAt: purchaseDate, customerName: buyerName, customerEmail: buyerEmail, orderId: order?.id, amount: order?.amount });
      beat.soldExclusive = true;
      beat.soldSessionId = session.id;
    }
    await saveBeats(beats);
    if (exclusiveIds.length) await saveSoldArchive(archive);
  }

  // Attach the uploaded license agreement for each beat's purchased tier
  const beatsById = new Map(beats.map((b) => [b.id, b]));
  const attachments: EmailAttachment[] = [];
  for (const item of items) {
    const beat = beatsById.get(item.refId);
    const stored = beat?.licenses.find((l) => l.name === item.licenseName)?.agreementUrl;
    const link = item.downloads.find((d) => d.label === "License Agreement");
    if (item.kind !== "beat" || !beat || !stored || !link) continue;
    const ext = stored.split("?")[0].split(".").pop()?.toLowerCase() || "pdf";
    attachments.push({ filename: `LuchiBeats_${beat.title.replace(/[^a-zA-Z0-9]/g, "_")}_${item.licenseName}_License.${ext}`, path: link.url });
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0);
  if (buyerEmail) {
    if (items.length) {
      const ok = await sendEmail(
        buyerEmail,
        "Your LuchiBeats order — download your files",
        purchaseEmailHtml({ buyerName, items, total, hasLicenses: attachments.length > 0, orderUrl: `${SITE_URL}/checkout/success?session_id=${session.id}` }),
        attachments,
      );
      if (!ok) console.error(`[stripe] Purchase email to ${buyerEmail} failed for session ${session.id}`);
    }
    for (const item of lost) {
      await sendEmail(buyerEmail, "About your LuchiBeats exclusive order",
        exclusiveRefundEmailHtml({ buyerName, itemName: item.name, amount: item.amount, refunded: refunded.has(item.refId) }));
    }
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminEmail) {
    if (items.length) {
      await sendEmail(adminEmail, `💰 New sale — $${total.toFixed(2)}`, saleAlertEmailHtml({ buyerName, buyerEmail, items, total }));
    }
    for (const item of lost) {
      await sendEmail(adminEmail, `⚠️ Exclusive double-purchase ${refunded.has(item.refId) ? "auto-refunded" : "— REFUND MANUALLY"}`,
        saleAlertEmailHtml({ buyerName, buyerEmail, items: [{ name: `${item.name} (already sold — ${refunded.has(item.refId) ? "refunded" : "refund failed"})`, amount: item.amount }], total: item.amount }));
    }
  }
}
