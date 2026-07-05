// Server-side trigger that tells the public website to refresh its blog cache.
// The admin client calls this after a blog mutation; this route holds the shared
// secret + website URL server-side so neither ever reaches the browser.
//
// Env: WEBSITE_REVALIDATE_URL (e.g. https://<website>/api/revalidate) and
// REVALIDATE_SECRET (must match the website's value). Best-effort: never fails
// the admin action — a missed revalidation is caught by the website's hourly
// safety revalidate.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = process.env.WEBSITE_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) {
    return Response.json({ ok: false, reason: "not-configured" });
  }

  let slug: string | undefined;
  try {
    const body = (await request.json()) as { slug?: unknown };
    if (typeof body?.slug === "string" && body.slug) slug = body.slug;
  } catch {
    /* no body is fine */
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ slug }),
      cache: "no-store",
    });
    return Response.json({ ok: res.ok });
  } catch {
    return Response.json({ ok: false, reason: "unreachable" });
  }
}
