import { Resend } from "resend";

const SITE = "https://www.luchibeats.com";
const GOLD = "#C9A84C";
const BG   = "#080808";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

function base(content: string, footerNote = "You subscribed at luchibeats.com. No spam, ever."): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LuchiBeats</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr><td align="center" style="padding:48px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <!-- Logo -->
      <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(201,168,76,0.18);text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.12em;color:${GOLD};">LUCHIBEATS</p>
        <p style="margin:5px 0 0;font-size:9px;letter-spacing:0.35em;color:rgba(201,168,76,0.4);text-transform:uppercase;">Premium Beats · Production</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px 0 32px;">${content}</td></tr>
      <!-- Footer -->
      <tr><td style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
          <a href="${SITE}" style="color:${GOLD};text-decoration:none;">luchibeats.com</a> &nbsp;·&nbsp; New York
        </p>
        <p style="margin:8px 0 0;font-size:10px;color:rgba(255,255,255,0.12);">${footerNote}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function btn(label: string, href: string, secondary = false): string {
  return secondary
    ? `<a href="${href}" style="display:inline-block;padding:13px 28px;border:1px solid rgba(201,168,76,0.35);color:${GOLD};font-weight:700;font-size:13px;letter-spacing:0.04em;text-decoration:none;border-radius:8px;">${label}</a>`
    : `<a href="${href}" style="display:inline-block;padding:14px 36px;background:linear-gradient(90deg,#A8892E,${GOLD},#E5C76B);color:#000;font-weight:900;font-size:14px;letter-spacing:0.05em;text-decoration:none;border-radius:8px;">${label}</a>`;
}

export function promoEmailHtml(): string {
  return base(`
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">Welcome</p>
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">You're in. Welcome to the family.</h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
      You're now on the list for exclusive drops, early access, and subscriber-only deals.
      New heat lands regularly — you'll always hear about it first.
    </p>
    <div style="text-align:center;margin-bottom:24px;">${btn("Browse Beats", `${SITE}/beats`)}</div>
    <div style="text-align:center;margin-bottom:36px;">${btn("Book a Session", `${SITE}/contact`, true)}</div>
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.7;">
      15+ years of experience &nbsp;·&nbsp; 150+ artists worked with &nbsp;·&nbsp; 100% client satisfaction
    </p>
  `);
}

export function giveawayEmailHtml(opts: {
  badge?: string;
  headline: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const { badge, headline, body, ctaLabel, ctaUrl } = opts;
  return base(`
    ${badge ? `<p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">${esc(badge)}</p>` : ""}
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">${esc(headline)}</h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">${esc(body).replace(/\n/g, "<br>")}</p>
    ${ctaLabel && ctaUrl ? `<div style="text-align:center;margin-bottom:36px;">${btn(esc(ctaLabel), ctaUrl)}</div>` : ""}
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.7;">
      As a subscriber you get first access to new drops and exclusive deals — stay tuned.
    </p>
  `);
}

export function resetPasswordEmailHtml(email: string, resetUrl: string): string {
  return base(`
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">Admin Account Recovery</p>
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">Reset your admin password</h1>
    <p style="margin:0 0 10px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
      Your admin login email is <strong style="color:#fff;">${esc(email)}</strong>.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
      Click below to set a new password. This link expires in 45 minutes and can only be used once.
    </p>
    <div style="text-align:center;margin-bottom:36px;">${btn("Reset Password", resetUrl)}</div>
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.7;">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  `);
}

export interface PurchaseEmailItem {
  name: string;
  amount: number;
  downloads: { label: string; url: string }[];
}

export function purchaseEmailHtml(opts: { buyerName: string; items: PurchaseEmailItem[]; total: number; hasLicenses: boolean; orderUrl: string }): string {
  const { buyerName, items, total, hasLicenses, orderUrl } = opts;
  const rows = items.map((item) => `
    <tr><td style="padding:18px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#fff;">${esc(item.name)}</p>
      <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.4);">$${item.amount.toFixed(2)}</p>
      ${item.downloads.length
        ? item.downloads.map((d) => `<span style="display:inline-block;margin:0 8px 8px 0;">${btn(`Download ${esc(d.label)}`, esc(d.url), true)}</span>`).join("")
        : `<p style="margin:0;font-size:12px;color:${GOLD};">Your files are being prepared — we'll email them to you shortly.</p>`}
    </td></tr>`).join("");
  return base(`
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">Order Confirmed</p>
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">Thanks${buyerName ? `, ${esc(buyerName.split(" ")[0])}` : ""}! Your files are ready.</h1>
    <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
      Download your files below and save them somewhere safe. For security, download links expire after 7 days — you can always get fresh ones from your order page.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <p style="margin:20px 0 0;font-size:14px;font-weight:700;color:#fff;text-align:right;">Total paid: <span style="color:${GOLD};">$${total.toFixed(2)}</span></p>
    <div style="text-align:center;margin-top:28px;">${btn("View Your Order", esc(orderUrl))}</div>
    ${hasLicenses ? `<p style="margin:24px 0 0;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7;">Your license agreement is attached to this email (and linked above). Keep it for your records — it's your proof of the rights you purchased.</p>` : ""}
    <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.4);line-height:1.7;">Questions about your order? Just reply to this email or reach out at <a href="${SITE}/contact" style="color:${GOLD};">luchibeats.com/contact</a>.</p>
  `, "You're receiving this because you made a purchase at luchibeats.com.");
}

export function saleAlertEmailHtml(opts: { buyerName: string; buyerEmail: string; items: { name: string; amount: number }[]; total: number }): string {
  const { buyerName, buyerEmail, items, total } = opts;
  return base(`
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">New Sale</p>
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">💰 $${total.toFixed(2)} from ${esc(buyerName || buyerEmail)}</h1>
    <p style="margin:0 0 18px;font-size:14px;color:rgba(255,255,255,0.55);">${esc(buyerEmail)}</p>
    ${items.map((i) => `<p style="margin:0 0 6px;font-size:14px;color:#fff;">${esc(i.name)} — <span style="color:${GOLD};">$${i.amount.toFixed(2)}</span></p>`).join("")}
    <div style="text-align:center;margin-top:28px;">${btn("Open Orders", `${SITE}/admin`)}</div>
  `, "Sale notification for the LuchiBeats admin.");
}

export function exclusiveRefundEmailHtml(opts: { buyerName: string; itemName: string; amount: number; refunded: boolean }): string {
  const { buyerName, itemName, amount, refunded } = opts;
  return base(`
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">Order Update</p>
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">Sorry${buyerName ? `, ${esc(buyerName.split(" ")[0])}` : ""} — that exclusive was just sold</h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
      Another buyer completed their purchase of <strong style="color:#fff;">${esc(itemName)}</strong> moments before you.
      ${refunded ? `Your $${amount.toFixed(2)} has been refunded to your original payment method (it can take 5–10 business days to appear).` : `We'll refund your $${amount.toFixed(2)} shortly.`}
    </p>
    <div style="text-align:center;margin-bottom:24px;">${btn("Browse Beats", `${SITE}/beats`)}</div>
  `, "You're receiving this because you made a purchase at luchibeats.com.");
}

// Either inline text `content` or a remote file `path` (URL) that Resend fetches and attaches
export interface EmailAttachment {
  filename: string;
  content?: string;
  path?: string;
}

export async function sendEmail(to: string, subject: string, html: string, attachments?: EmailAttachment[]): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? `LuchiBeats <noreply@luchibeats.com>`;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from, to, subject, html,
      ...(attachments?.length ? { attachments: attachments.map((a) => (a.path ? { filename: a.filename, path: a.path } : { filename: a.filename, content: Buffer.from(a.content ?? "", "utf-8") })) } : {}),
    });
    if (error) console.error("[email] Resend error", error);
    return !error;
  } catch {
    return false;
  }
}
