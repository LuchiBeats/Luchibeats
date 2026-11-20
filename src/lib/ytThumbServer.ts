// Server side: which of these YouTube videos have NO full-HD thumbnail. Checked once a day
// (cached), so pages can go straight to the smaller one for those and never request a
// missing image (which would log a 404 in visitors' browsers).
export async function missingHD(ids: string[]): Promise<string[]> {
  const checks = await Promise.all(ids.map(async (id) => {
    try {
      const r = await fetch(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, { method: "HEAD", next: { revalidate: 86400 } });
      return r.ok ? null : id;
    } catch { return null; }   // unknown: let the browser-side fallback handle it
  }));
  return checks.filter((x): x is string => x !== null);
}
