// Moves product + category images from the OLD Supabase storage into the NEW project
// and updates the image links in the database.
//
// Run it once on your own computer (in the project folder):
//   npm install
//   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/migrate-images.mjs
// (Windows PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY="..."; node scripts/migrate-images.mjs)
//
// Service role key: Supabase Dashboard > Project Settings > API Keys > "service_role" / secret key.
// It's secret - don't put it on GitHub or in the website code.
// It's safe to run again: images that are already moved get skipped.

import { createClient } from "@supabase/supabase-js";

const NEW_REF = "fffaggysgkpdymalunyn";
const NEW_URL = `https://${NEW_REF}.supabase.co`;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is missing. See the instructions at the top of this file.");
  process.exit(1);
}

const supabase = createClient(NEW_URL, KEY, { auth: { persistSession: false } });
const STORAGE_RE = /^https:\/\/([a-z0-9]+)\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;

const stats = { moved: 0, skipped: 0, failed: [] };
const done = new Map(); // same old URL -> upload only once

async function ensureBucket(name) {
  const { data } = await supabase.storage.getBucket(name);
  if (!data) {
    const { error } = await supabase.storage.createBucket(name, { public: true });
    if (error && !/exists/i.test(error.message)) throw error;
  }
}

async function moveOne(oldUrl) {
  if (done.has(oldUrl)) return done.get(oldUrl);
  const m = oldUrl.match(STORAGE_RE);
  if (!m) return null;
  const [, ref, bucket, encodedPath] = m;
  if (ref === NEW_REF) return null; // already in the new project
  const path = decodeURIComponent(encodedPath);

  const res = await fetch(oldUrl);
  if (!res.ok) throw new Error(`download failed (${res.status})`);
  const body = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";

  await ensureBucket(bucket);
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType, upsert: true });
  if (error) throw error;

  const newUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  done.set(oldUrl, newUrl);
  return newUrl;
}

async function migrateTable(table) {
  const { data: rows, error } = await supabase.from(table).select("id, name, image").not("image", "is", null);
  if (error) throw error;
  console.log(`\n${table}: ${rows.length} rows with images`);

  for (const row of rows) {
    try {
      const newUrl = await moveOne(row.image);
      if (!newUrl) { stats.skipped++; continue; }
      const { error: upErr } = await supabase.from(table).update({ image: newUrl }).eq("id", row.id);
      if (upErr) throw upErr;
      stats.moved++;
      process.stdout.write(".");
    } catch (e) {
      stats.failed.push(`${table} | ${row.name} | ${row.image} | ${e.message}`);
      process.stdout.write("x");
    }
  }
}

await migrateTable("categories");
await migrateTable("products");

console.log(`\n\nDone. Moved: ${stats.moved}, already OK/skipped: ${stats.skipped}, failed: ${stats.failed.length}`);
if (stats.failed.length) {
  console.log("\nThese images couldn't be moved (the old link may already be broken):");
  for (const f of stats.failed) console.log(" - " + f);
}
