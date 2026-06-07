import { Resend } from "resend";

const SITE = "https://www.luchibeats.com";
const GOLD = "#C9A84C";
const BG   = "#080808";

function base(content: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LuchiBeats</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
  <tr><td align="center" style="padding:48px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <!-- Logo -->
      <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(201,168,76,0.18);text-align:center;">
        <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.12em;color:${GOLD};">LUCHIBEATS</p>
        <p style="margin:5px 0 0;font-size:9px;letter-spacing:0.35em;color:rgba(201,168,76,0.4);text-transform:uppercase;">Premium Beats · Mixing · Production</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px 0 32px;">${content}</td></tr>
      <!-- Footer -->
      <tr><td style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
          <a href="${SITE}" style="color:${GOLD};text-decoration:none;">luchibeats.com</a> &nbsp;·&nbsp; New York
        </p>
        <p style="margin:8px 0 0;font-size:10px;color:rgba(255,255,255,0.12);">You subscribed at luchibeats.com. No spam, ever.</p>
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

export function freeBeatEmailHtml(beatTitle: string, downloadUrl: string): string {
  return base(`
    <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">Free Beat</p>
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">Your free beat is ready.</h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">
      Thanks for subscribing — here's your exclusive beat, on us. Download it and build something fire.
    </p>
    <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:22px 24px;margin-bottom:32px;">
      <p style="margin:0 0 5px;font-size:9px;letter-spacing:0.2em;color:rgba(201,168,76,0.45);text-transform:uppercase;">🎵 Your Free Beat</p>
      <p style="margin:0;font-size:20px;font-weight:900;color:#fff;">${beatTitle}</p>
    </div>
    <div style="text-align:center;margin-bottom:36px;">${btn("⬇ Download Beat", downloadUrl)}</div>
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.7;">
      Stay tuned — as a subscriber you'll get first access to new drops and exclusive deals.
    </p>
  `);
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
    <div style="text-align:center;margin-bottom:36px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:6px;">${btn("Mix &amp; Master", `${SITE}/mixing`, true)}</td>
        <td style="padding-left:6px;">${btn("Book a Session", `${SITE}/contact`, true)}</td>
      </tr></table>
    </div>
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
  beatTitle?: string;
  downloadUrl?: string;
}): string {
  const { badge, headline, body, ctaLabel, ctaUrl, beatTitle, downloadUrl } = opts;
  return base(`
    ${badge ? `<p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;color:${GOLD};text-transform:uppercase;">${badge}</p>` : ""}
    <h1 style="margin:0 0 18px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">${headline}</h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;">${body.replace(/\n/g, "<br>")}</p>
    ${beatTitle && downloadUrl ? `
    <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:22px 24px;margin-bottom:32px;">
      <p style="margin:0 0 5px;font-size:9px;letter-spacing:0.2em;color:rgba(201,168,76,0.45);text-transform:uppercase;">🎵 This Month's Beat</p>
      <p style="margin:0;font-size:20px;font-weight:900;color:#fff;">${beatTitle}</p>
    </div>
    <div style="text-align:center;margin-bottom:36px;">${btn("⬇ Download Beat", downloadUrl)}</div>
    ` : ctaLabel && ctaUrl ? `<div style="text-align:center;margin-bottom:36px;">${btn(ctaLabel, ctaUrl)}</div>` : ""}
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);line-height:1.7;">
      As a subscriber you get first access to new drops and exclusive deals — stay tuned.
    </p>
  `);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? `LuchiBeats <noreply@luchibeats.com>`;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    return !error;
  } catch {
    return false;
  }
}
