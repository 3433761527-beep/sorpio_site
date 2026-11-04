export function youtubeId(value: string): string | null {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      id =
        u.pathname === "/watch"
          ? u.searchParams.get("v")
          : /^\/(embed|shorts)\/([^/]+)$/.exec(u.pathname)?.[2] || null;
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
