export interface LicenseData {
  buyerName: string;
  buyerEmail: string;
  beatTitle: string;
  beatId: string;
  licenseType: "Basic" | "Premium" | "Exclusive";
  purchaseDate: string;
  orderId: string;
  amount: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const LICENSOR_BLOCK = `
  LICENSOR:  Ariel Jesus Muniz, professionally known as LuchiBeats
             Paterson, New Jersey
             BMI Songwriter/Publisher — CAE/IPI: [YOUR BMI NUMBER]
             luchibeats@outlook.com | www.luchibeats.com
`.trim();

const FOOTER = (year: number) =>
  `LuchiBeats © ${year} Ariel Jesus Muniz. All Rights Reserved.\nwww.luchibeats.com | luchibeats@outlook.com`;

// ── BASIC LICENSE ─────────────────────────────────────────────────────────────

export function basicLicense(d: LicenseData): string {
  return `
BEAT LICENSE AGREEMENT — BASIC LICENSE (MP3)
═══════════════════════════════════════════════════════════════════════════════

This Beat License Agreement ("Agreement") is entered into as of ${formatDate(d.purchaseDate)},
between:

  ${LICENSOR_BLOCK}

  LICENSEE:  ${d.buyerName}
             ${d.buyerEmail}

Order ID:    ${d.orderId}
Beat Title:  "${d.beatTitle}"
Beat ID:     ${d.beatId}
License:     Basic License (MP3)
Price Paid:  $${d.amount.toFixed(2)} USD

═══════════════════════════════════════════════════════════════════════════════
1. GRANT OF LICENSE
═══════════════════════════════════════════════════════════════════════════════

Licensor hereby grants Licensee a non-exclusive, non-transferable license to
use the Beat in one (1) new song or recording ("New Song") under the following
terms and conditions.

═══════════════════════════════════════════════════════════════════════════════
2. PERMITTED USES
═══════════════════════════════════════════════════════════════════════════════

Licensee MAY:

  a) Use the Beat to record one (1) New Song.
  b) Distribute up to TWO THOUSAND FIVE HUNDRED (2,500) copies/streams of
     the New Song across all platforms combined (Spotify, Apple Music,
     YouTube, SoundCloud, etc.).
  c) Perform the New Song at live performances for non-profit or personal use.
  d) Upload the New Song to free mixtape platforms and personal websites.
  e) Use the New Song for self-promotion (social media posts, reels, stories).

═══════════════════════════════════════════════════════════════════════════════
3. RESTRICTIONS
═══════════════════════════════════════════════════════════════════════════════

Licensee MAY NOT:

  a) Distribute more than 2,500 copies/streams of the New Song without
     upgrading to a Premium or Exclusive license.
  b) Sell the New Song for profit on streaming platforms, digital stores
     (iTunes, Bandcamp, etc.), or physical media without upgrading to a
     Premium or Exclusive license.
  c) License, sublicense, sell, resell, transfer, or assign the Beat or any
     rights to the Beat to any third party.
  d) Use the Beat in any synchronization license (film, TV, advertisements,
     video games) without upgrading to a Premium or Exclusive license.
  e) Submit the Beat or New Song to any content ID system or claim ownership
     of the underlying instrumental.
  f) Remove, alter, or obscure any watermark embedded in the Beat file.
  g) Register the Beat or any portion thereof with any performing rights
     organization (ASCAP, BMI, SESAC) as an original work without listing
     Ariel Jesus Muniz (LuchiBeats) as a co-writer/composer.

═══════════════════════════════════════════════════════════════════════════════
4. CREDIT REQUIREMENT (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

Producer credit is REQUIRED on ALL releases, posts, uploads, and descriptions.
Failure to credit is a breach of this Agreement.

  Required tag:  "Prod. by LuchiBeats"

This credit must appear in:
  - The song title (e.g., "Song Name (Prod. by LuchiBeats)")
  - The description or caption on all streaming/social platforms
  - Any physical liner notes or artwork if applicable

Licensee may NOT remove, alter, or obscure this credit in any form.

═══════════════════════════════════════════════════════════════════════════════
5. PUBLISHING & PERFORMING RIGHTS
═══════════════════════════════════════════════════════════════════════════════

Ariel Jesus Muniz (LuchiBeats) is a registered BMI songwriter and publisher.
BMI CAE/IPI: [YOUR BMI NUMBER]

If Licensee registers the New Song with any Performing Rights Organization
(ASCAP, BMI, SESAC, or any international PRO equivalent), Licensee MUST
list the following as a co-writer and publisher of the underlying composition:

  Co-Writer / Composer:  Ariel Jesus Muniz
  Publisher:             LuchiBeats (BMI)
  BMI CAE/IPI:           [YOUR BMI NUMBER]

Publishing royalty split for PRO registration:
  Licensee (Artist):   50% of songwriter share
  Licensor (Producer): 50% of songwriter share

Licensor retains one hundred percent (100%) of the publisher's share.

If Licensee does not register with a PRO, no royalty split applies. However,
the credit requirement in Section 4 remains in effect regardless.

PRE-RELEASE REGISTRATION REQUIREMENT:
Licensee MUST register the New Song with their respective PRO (or equivalent)
BEFORE releasing the New Song to any Digital Service Provider (DSP), including
but not limited to Spotify, Apple Music, Amazon Music, Tidal, YouTube Music,
Deezer, or any other streaming or download platform. Releasing to DSPs without
prior registration is a breach of this Agreement.

PRE-RELEASE NOTIFICATION REQUIREMENT:
Licensee MUST notify Licensor at luchibeats@outlook.com no less than SEVEN (7)
days before the New Song is released to any DSP or made publicly available.
Notification must include the release date, song title, and a link to the
pre-save or distribution page if available. This allows Licensor the
opportunity to promote and share the release through his own platforms and
network. Licensor is under no obligation to promote the New Song and any
promotion provided is done solely at Licensor's discretion. Failure to notify
is a breach of this Agreement.

═══════════════════════════════════════════════════════════════════════════════
6. FILE DELIVERY
═══════════════════════════════════════════════════════════════════════════════

Licensor will deliver the Beat in MP3 format (tagged). No WAV, stems, or
untagged files are included with this license.

═══════════════════════════════════════════════════════════════════════════════
7. EXCLUSIVITY
═══════════════════════════════════════════════════════════════════════════════

This license is NON-EXCLUSIVE. Licensor retains the right to sell additional
licenses for the same Beat to other artists, and the Beat may remain available
for purchase on www.luchibeats.com.

═══════════════════════════════════════════════════════════════════════════════
8. COPYRIGHT OWNERSHIP
═══════════════════════════════════════════════════════════════════════════════

Licensor retains one hundred percent (100%) ownership of the Beat and all
underlying composition and sound recording copyrights. Licensee owns the
lyrics, vocal performance, and any original creative elements contributed to
the New Song. The underlying instrumental remains the sole property of
Ariel Jesus Muniz (LuchiBeats).

═══════════════════════════════════════════════════════════════════════════════
9. TERM
═══════════════════════════════════════════════════════════════════════════════

This Agreement is effective as of the purchase date and shall remain in effect
unless terminated. Licensor may terminate this Agreement immediately upon
written notice if Licensee breaches any term. Upon termination, Licensee must
immediately cease all use and distribution of the New Song.

═══════════════════════════════════════════════════════════════════════════════
10. WARRANTY & INDEMNIFICATION
═══════════════════════════════════════════════════════════════════════════════

Licensor warrants he has the right to grant this license and that the Beat
does not infringe any third-party copyright. Licensee agrees to indemnify and
hold harmless Licensor from any claims arising from Licensee's use of the
Beat beyond the scope of this Agreement.

═══════════════════════════════════════════════════════════════════════════════
11. GOVERNING LAW
═══════════════════════════════════════════════════════════════════════════════

This Agreement is governed by the laws of the State of New Jersey. Any
disputes shall be resolved in the courts of New Jersey.

═══════════════════════════════════════════════════════════════════════════════
12. ENTIRE AGREEMENT
═══════════════════════════════════════════════════════════════════════════════

This Agreement constitutes the entire agreement between the parties and
supersedes all prior negotiations or representations. Any modification must
be in writing and signed by both parties.

═══════════════════════════════════════════════════════════════════════════════

By completing this purchase, Licensee acknowledges they have read, understood,
and agreed to all terms of this Agreement.

  LICENSOR:  Ariel Jesus Muniz (LuchiBeats) — www.luchibeats.com
  LICENSEE:  ${d.buyerName} (${d.buyerEmail})
  DATE:      ${formatDate(d.purchaseDate)}

═══════════════════════════════════════════════════════════════════════════════
${FOOTER(new Date(d.purchaseDate).getFullYear())}
`.trim();
}

// ── PREMIUM LICENSE ───────────────────────────────────────────────────────────

export function premiumLicense(d: LicenseData): string {
  return `
BEAT LICENSE AGREEMENT — PREMIUM LICENSE (WAV + STEMS)
═══════════════════════════════════════════════════════════════════════════════

This Beat License Agreement ("Agreement") is entered into as of ${formatDate(d.purchaseDate)},
between:

  ${LICENSOR_BLOCK}

  LICENSEE:  ${d.buyerName}
             ${d.buyerEmail}

Order ID:    ${d.orderId}
Beat Title:  "${d.beatTitle}"
Beat ID:     ${d.beatId}
License:     Premium License (WAV + Stems)
Price Paid:  $${d.amount.toFixed(2)} USD

═══════════════════════════════════════════════════════════════════════════════
1. GRANT OF LICENSE
═══════════════════════════════════════════════════════════════════════════════

Licensor hereby grants Licensee a non-exclusive, non-transferable license to
use the Beat in one (1) new song or recording ("New Song") under the following
terms and conditions.

═══════════════════════════════════════════════════════════════════════════════
2. PERMITTED USES
═══════════════════════════════════════════════════════════════════════════════

Licensee MAY:

  a) Use the Beat to record one (1) New Song.
  b) Distribute up to FIFTY THOUSAND (50,000) copies/streams of the New Song
     across all platforms combined (Spotify, Apple Music, YouTube, etc.).
  c) Sell the New Song on digital stores (iTunes, Bandcamp, Amazon Music,
     etc.) and collect streaming revenue.
  d) Monetize the New Song on YouTube via the YouTube Partner Program.
  e) Perform the New Song at paid and non-paid live performances.
  f) Broadcast the New Song on up to TWO (2) radio stations.
  g) Use the New Song in music videos distributed online.
  h) Use the individual stem tracks provided for professional mixing purposes.

═══════════════════════════════════════════════════════════════════════════════
3. RESTRICTIONS
═══════════════════════════════════════════════════════════════════════════════

Licensee MAY NOT:

  a) Distribute more than 50,000 copies/streams without upgrading to an
     Exclusive license.
  b) Broadcast on more than two (2) radio stations.
  c) License, sublicense, sell, resell, transfer, or assign the Beat or any
     rights therein to any third party.
  d) Use the Beat in any synchronization license (film, TV, advertisements,
     video games) without a separate Sync license from Licensor.
  e) Submit the Beat or New Song to any content ID system or claim ownership
     of the underlying instrumental.
  f) Re-sell or distribute the stem files to any third party.
  g) Register the Beat with any PRO as an original work without listing
     Ariel Jesus Muniz (LuchiBeats) as co-writer/composer.

═══════════════════════════════════════════════════════════════════════════════
4. CREDIT REQUIREMENT (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

Producer credit is REQUIRED on ALL releases, posts, uploads, and descriptions.
Failure to credit is a breach of this Agreement.

  Required tag:  "Prod. by LuchiBeats"

This credit must appear in:
  - The song title (e.g., "Song Name (Prod. by LuchiBeats)")
  - The description or caption on all streaming/social platforms
  - Any physical liner notes or artwork if applicable

Licensee may NOT remove, alter, or obscure this credit in any form.

═══════════════════════════════════════════════════════════════════════════════
5. PUBLISHING & PERFORMING RIGHTS
═══════════════════════════════════════════════════════════════════════════════

Ariel Jesus Muniz (LuchiBeats) is a registered BMI songwriter and publisher.
BMI CAE/IPI: [YOUR BMI NUMBER]

If Licensee registers the New Song with any Performing Rights Organization
(ASCAP, BMI, SESAC, or any international PRO equivalent), Licensee MUST
list the following as a co-writer and publisher of the underlying composition:

  Co-Writer / Composer:  Ariel Jesus Muniz
  Publisher:             LuchiBeats (BMI)
  BMI CAE/IPI:           [YOUR BMI NUMBER]

Publishing royalty split for PRO registration:
  Licensee (Artist):   50% of songwriter share
  Licensor (Producer): 50% of songwriter share

Licensor retains one hundred percent (100%) of the publisher's share.

If Licensee does not register with a PRO, no royalty split applies. However,
the credit requirement in Section 4 remains in effect regardless.

PRE-RELEASE REGISTRATION REQUIREMENT:
Licensee MUST register the New Song with their respective PRO (or equivalent)
BEFORE releasing the New Song to any Digital Service Provider (DSP), including
but not limited to Spotify, Apple Music, Amazon Music, Tidal, YouTube Music,
Deezer, or any other streaming or download platform. Releasing to DSPs without
prior registration is a breach of this Agreement.

PRE-RELEASE NOTIFICATION REQUIREMENT:
Licensee MUST notify Licensor at luchibeats@outlook.com no less than SEVEN (7)
days before the New Song is released to any DSP or made publicly available.
Notification must include the release date, song title, and a link to the
pre-save or distribution page if available. This allows Licensor the
opportunity to promote and share the release through his own platforms and
network. Licensor is under no obligation to promote the New Song and any
promotion provided is done solely at Licensor's discretion. Failure to notify
is a breach of this Agreement.

═══════════════════════════════════════════════════════════════════════════════
6. FILE DELIVERY
═══════════════════════════════════════════════════════════════════════════════

Licensor will deliver the Beat in the following formats:

  - MP3 (tagged)
  - WAV (untagged, high quality)
  - Individual Stem/Track-Out files (WAV format)

═══════════════════════════════════════════════════════════════════════════════
7. EXCLUSIVITY
═══════════════════════════════════════════════════════════════════════════════

This license is NON-EXCLUSIVE. Licensor retains the right to sell additional
licenses for the same Beat to other artists, and the Beat may remain available
for purchase on www.luchibeats.com.

═══════════════════════════════════════════════════════════════════════════════
8. COPYRIGHT OWNERSHIP
═══════════════════════════════════════════════════════════════════════════════

Licensor retains one hundred percent (100%) ownership of the Beat and all
underlying composition and sound recording copyrights. Licensee owns the
lyrics, vocal performance, and any original creative elements contributed to
the New Song. The underlying instrumental remains the sole property of
Ariel Jesus Muniz (LuchiBeats).

═══════════════════════════════════════════════════════════════════════════════
9. TERM
═══════════════════════════════════════════════════════════════════════════════

This Agreement is effective as of the purchase date and shall remain in effect
unless terminated. Licensor may terminate this Agreement immediately upon
written notice if Licensee breaches any term. Upon termination, Licensee must
immediately cease all use and distribution of the New Song and destroy all
copies of the Beat files.

═══════════════════════════════════════════════════════════════════════════════
10. WARRANTY & INDEMNIFICATION
═══════════════════════════════════════════════════════════════════════════════

Licensor warrants he has the right to grant this license and that the Beat
does not infringe any third-party copyright. Licensee agrees to indemnify and
hold harmless Licensor from any claims arising from Licensee's use of the
Beat beyond the scope of this Agreement.

═══════════════════════════════════════════════════════════════════════════════
11. GOVERNING LAW
═══════════════════════════════════════════════════════════════════════════════

This Agreement is governed by the laws of the State of New Jersey. Any
disputes shall be resolved in the courts of New Jersey.

═══════════════════════════════════════════════════════════════════════════════
12. ENTIRE AGREEMENT
═══════════════════════════════════════════════════════════════════════════════

This Agreement constitutes the entire agreement between the parties and
supersedes all prior negotiations or representations. Any modification must
be in writing and signed by both parties.

═══════════════════════════════════════════════════════════════════════════════

By completing this purchase, Licensee acknowledges they have read, understood,
and agreed to all terms of this Agreement.

  LICENSOR:  Ariel Jesus Muniz (LuchiBeats) — www.luchibeats.com
  LICENSEE:  ${d.buyerName} (${d.buyerEmail})
  DATE:      ${formatDate(d.purchaseDate)}

═══════════════════════════════════════════════════════════════════════════════
${FOOTER(new Date(d.purchaseDate).getFullYear())}
`.trim();
}

// ── EXCLUSIVE LICENSE ─────────────────────────────────────────────────────────

export function exclusiveLicense(d: LicenseData): string {
  return `
BEAT LICENSE AGREEMENT — EXCLUSIVE LICENSE
═══════════════════════════════════════════════════════════════════════════════

This Exclusive Beat License Agreement ("Agreement") is entered into as of
${formatDate(d.purchaseDate)}, between:

  ${LICENSOR_BLOCK}

  LICENSEE:  ${d.buyerName}
             ${d.buyerEmail}

Order ID:    ${d.orderId}
Beat Title:  "${d.beatTitle}"
Beat ID:     ${d.beatId}
License:     Exclusive License
Price Paid:  $${d.amount.toFixed(2)} USD

═══════════════════════════════════════════════════════════════════════════════
1. GRANT OF EXCLUSIVE LICENSE
═══════════════════════════════════════════════════════════════════════════════

Licensor hereby grants Licensee an EXCLUSIVE, worldwide, perpetual license to
use the Beat in one (1) or more new songs or recordings ("New Song(s)").

Upon execution of this Agreement, Licensor agrees to:
  - Remove the Beat from sale on www.luchibeats.com and all other platforms
    within twenty-four (24) hours of payment confirmation.
  - Not sell, license, or grant any rights to the Beat to any other party
    from the date of this Agreement forward.

═══════════════════════════════════════════════════════════════════════════════
2. PERMITTED USES
═══════════════════════════════════════════════════════════════════════════════

Licensee MAY:

  a) Use the Beat to record one (1) or more New Songs.
  b) Distribute UNLIMITED copies and streams across all platforms.
  c) Sell the New Song(s) on any digital store or physical format.
  d) Monetize on YouTube, streaming platforms, and all digital distribution.
  e) Perform the New Song(s) at live performances of any scale.
  f) Broadcast on any number of radio stations worldwide.
  g) Use the New Song(s) in synchronization licenses — film, television,
     advertisements, video games, podcasts, and any audio/visual media.
  h) Use all provided stem/track-out files for mixing and post-production.
  i) Collect one hundred percent (100%) of master recording royalties.

═══════════════════════════════════════════════════════════════════════════════
3. RESTRICTIONS
═══════════════════════════════════════════════════════════════════════════════

Licensee MAY NOT:

  a) Sell, sublicense, transfer, or assign the Beat itself as a standalone
     instrumental to any third party.
  b) Claim copyright of the underlying Beat composition.
  c) Submit the underlying Beat to any content ID system as an original work.
  d) Grant any other party a license to use the Beat without written consent
     from Licensor.

═══════════════════════════════════════════════════════════════════════════════
4. CREDIT REQUIREMENT (MANDATORY)
═══════════════════════════════════════════════════════════════════════════════

Producer credit is REQUIRED on ALL releases, posts, uploads, and descriptions,
including exclusive purchases. Failure to credit is a breach of this Agreement.

  Required tag:  "Prod. by LuchiBeats"

This credit must appear in:
  - The song title (e.g., "Song Name (Prod. by LuchiBeats)")
  - The description or caption on all streaming/social platforms
  - Any physical liner notes, album credits, or artwork if applicable
  - Any sync placements (end credits, ad copy, etc.) where credits are listed

Licensee may NOT remove, alter, or obscure this credit in any form.

═══════════════════════════════════════════════════════════════════════════════
5. PUBLISHING & PERFORMING RIGHTS
═══════════════════════════════════════════════════════════════════════════════

Ariel Jesus Muniz (LuchiBeats) is a registered BMI songwriter and publisher.
BMI CAE/IPI: [YOUR BMI NUMBER]

Licensee MUST list the following as co-writer and publisher when registering
the New Song(s) with any Performing Rights Organization (ASCAP, BMI, SESAC,
or any international PRO equivalent):

  Co-Writer / Composer:  Ariel Jesus Muniz
  Publisher:             LuchiBeats (BMI)
  BMI CAE/IPI:           [YOUR BMI NUMBER]

Publishing royalty split for PRO registration:
  Licensee (Artist):   50% of songwriter share
  Licensor (Producer): 50% of songwriter share

Licensor retains one hundred percent (100%) of the publisher's share.

Master recording royalties belong entirely to Licensee (100%).

This section applies whether or not Licensee is affiliated with a PRO. If
Licensee registers the New Song(s) and fails to include Licensor as
co-writer, Licensor reserves the right to register his ownership directly
with BMI and pursue any and all royalties owed.

PRE-RELEASE REGISTRATION REQUIREMENT:
Licensee MUST register the New Song(s) with their respective PRO (or
equivalent) BEFORE releasing to any Digital Service Provider (DSP), including
but not limited to Spotify, Apple Music, Amazon Music, Tidal, YouTube Music,
Deezer, or any other streaming or download platform. Releasing to DSPs without
prior PRO registration is a material breach of this Agreement.

PRE-RELEASE NOTIFICATION REQUIREMENT:
Licensee MUST notify Licensor at luchibeats@outlook.com no less than SEVEN (7)
days before the New Song(s) are released to any DSP or made publicly available.
Notification must include the release date, song title, and a link to the
pre-save or distribution page if available. This allows Licensor the
opportunity to promote and share the release through his own platforms and
network. Licensor is under no obligation to promote the New Song(s) and any
promotion provided is done solely at Licensor's discretion. Failure to notify
is a material breach of this Agreement.

═══════════════════════════════════════════════════════════════════════════════
6. FILE DELIVERY
═══════════════════════════════════════════════════════════════════════════════

Licensor will deliver the Beat in the following formats:

  - MP3 (untagged)
  - WAV (untagged, high quality)
  - Individual Stem/Track-Out files (WAV format)

═══════════════════════════════════════════════════════════════════════════════
7. EXCLUSIVITY & PERMANENT REMOVAL FROM SALE
═══════════════════════════════════════════════════════════════════════════════

This license is EXCLUSIVE AND PERMANENT. Once this Agreement is executed and
payment is confirmed:

  - The Beat will be removed from www.luchibeats.com and ALL other sales
    platforms within twenty-four (24) hours of payment confirmation.
  - The Beat will NEVER be sold, licensed, leased, or otherwise granted to
    any other artist, producer, label, or third party for any purpose,
    under any license type, at any price, for any reason — EVER.
  - Licensor will not re-upload, re-release, or make the Beat available
    for purchase or free download on any platform at any future date.
  - This restriction is permanent and irrevocable as long as Licensee
    remains in compliance with all terms of this Agreement.

Any previously sold non-exclusive licenses (Basic or Premium) issued prior to
this Agreement remain valid under their original terms. Licensor makes no
warranty that no prior non-exclusive licenses exist. Licensee acknowledges
and accepts this condition prior to purchase.

═══════════════════════════════════════════════════════════════════════════════
8. COPYRIGHT OWNERSHIP
═══════════════════════════════════════════════════════════════════════════════

Licensor retains the underlying composition copyright of the Beat (melody,
chords, arrangement). Licensee acquires exclusive rights to USE the Beat as
described herein and owns the master recording of the New Song(s). This
Agreement does not constitute a transfer of copyright ownership of the
underlying Beat composition.

═══════════════════════════════════════════════════════════════════════════════
9. TERM
═══════════════════════════════════════════════════════════════════════════════

This Agreement is effective as of the purchase date and is perpetual unless
Licensee breaches a material term. In the event of a material breach,
Licensor may terminate upon written notice, and Licensee must immediately
cease all distribution of the New Song(s).

═══════════════════════════════════════════════════════════════════════════════
10. WARRANTY & INDEMNIFICATION
═══════════════════════════════════════════════════════════════════════════════

Licensor warrants he is the sole creator and owner of the Beat and has full
authority to grant this exclusive license, and that the Beat does not infringe
any third-party copyright. Licensee agrees to indemnify and hold harmless
Licensor from any claims arising from Licensee's use of the Beat.

═══════════════════════════════════════════════════════════════════════════════
11. GOVERNING LAW
═══════════════════════════════════════════════════════════════════════════════

This Agreement is governed by the laws of the State of New Jersey. Any
disputes shall be resolved in the courts of New Jersey.

═══════════════════════════════════════════════════════════════════════════════
12. ENTIRE AGREEMENT
═══════════════════════════════════════════════════════════════════════════════

This Agreement constitutes the entire agreement between the parties and
supersedes all prior negotiations or representations. Any modification must
be in writing and signed by both parties.

═══════════════════════════════════════════════════════════════════════════════

By completing this purchase, Licensee acknowledges they have read, understood,
and agreed to all terms of this Agreement.

  LICENSOR:  Ariel Jesus Muniz (LuchiBeats) — www.luchibeats.com
  LICENSEE:  ${d.buyerName} (${d.buyerEmail})
  DATE:      ${formatDate(d.purchaseDate)}

═══════════════════════════════════════════════════════════════════════════════
${FOOTER(new Date(d.purchaseDate).getFullYear())}
`.trim();
}

// ── Generator ─────────────────────────────────────────────────────────────────

export function generateLicense(d: LicenseData): string {
  switch (d.licenseType) {
    case "Basic":     return basicLicense(d);
    case "Premium":   return premiumLicense(d);
    case "Exclusive": return exclusiveLicense(d);
  }
}
