// Run in Node >=22.18. Supply secrets only through local environment variables.
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join, relative, isAbsolute } from "node:path";
const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_ADMIN_EMAIL,
  SUPABASE_ADMIN_PASSWORD,
} = process.env;
if (
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY ||
  !SUPABASE_ADMIN_EMAIL ||
  !SUPABASE_ADMIN_PASSWORD
)
  throw Error(
    "Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ADMIN_EMAIL, SUPABASE_ADMIN_PASSWORD in the local shell environment. Never use VITE_ for the password.",
  );
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
const { error: authError } = await client.auth.signInWithPassword({
  email: SUPABASE_ADMIN_EMAIL,
  password: SUPABASE_ADMIN_PASSWORD,
});
if (authError) throw authError;
try {
  const { data: admin, error } = await client.rpc("is_admin");
  if (error || !admin) throw Error("Administrator access required");
  const root = resolve(
    process.argv[2] ||
      `backup-${new Date().toISOString().replace(/[:.]/g, "-")}`,
  );
  await mkdir(root, { recursive: true });
  for (const table of ["site_content", "journeys"]) {
    let all = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await client
        .from(table)
        .select("*")
        .order(table === "journeys" ? "user_id" : "id")
        .range(offset, offset + 999);
      if (error) throw error;
      all.push(...data);
      if (data.length < 1000) break;
    }
    await writeFile(join(root, table + ".json"), JSON.stringify(all, null, 2));
  }
  const manifest = [];
  for (const bucket of ["media", "guest-media"]) {
    async function walk(prefix = "") {
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await client.storage
          .from(bucket)
          .list(prefix, {
            limit: 100,
            offset,
            sortBy: { column: "name", order: "asc" },
          });
        if (error) throw error;
        for (const obj of data) {
          const path = prefix ? prefix + "/" + obj.name : obj.name;
          if (!obj.id) {
            await walk(path);
            continue;
          }
          const { data: blob, error } = await client.storage
            .from(bucket)
            .download(path);
          if (error) throw error;
          const target = resolve(root, bucket, path);
          if (
            relative(root, target).startsWith("..") ||
            isAbsolute(relative(root, target))
          )
            throw Error("Unsafe backup path");
          await mkdir(resolve(target, ".."), { recursive: true });
          await writeFile(target, Buffer.from(await blob.arrayBuffer()));
          manifest.push({ bucket, path, size: blob.size });
        }
        if (data.length < 100) break;
      }
    }
    await walk();
  }
  await writeFile(
    join(root, "media-manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(`Backup complete: ${root} (${manifest.length} media files)`);
} finally {
  await client.auth.signOut();
}
