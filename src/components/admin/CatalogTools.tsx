import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RING_SIZE_PRESET,
  normalizeSku,
  parseCsv,
  parsePrice,
  parseSizes,
  pick,
  skuFromFileName,
  skuNumber,
} from "@/lib/catalog";

type Product = {
  id: string;
  name: string;
  price: number;
  sku?: string | null;
  image?: string | null;
  images?: string[] | null;
  sizes?: string[] | null;
  category_id: string;
  categories?: { name: string };
};

type Category = { id: string; name: string; slug?: string };

interface Props {
  products: Product[];
  categories: Category[];
  uploadImage: (file: File) => Promise<string>;
  onChanged: () => Promise<void> | void;
}

const panel = "border border-[#22201c] bg-[#1c1a17]/40 p-4 space-y-3";
const label = "text-[10px] uppercase text-[#a8a296] tracking-wider block mb-1";
const field = "bg-[#1c1a17] border-[#22201c] rounded-none text-sm focus-visible:ring-[#c5a880]";
const goldBtn = "bg-[#c5a880] text-[#0d0d0c] rounded-none hover:bg-[#b0936b] disabled:opacity-50 w-full";

/** Run async jobs a few at a time so we don't flood Supabase */
async function inBatches<T>(items: T[], size: number, fn: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

const isRingCategory = (c?: Category) =>
  !!c && (["ring", "rings"].includes((c.slug || "").toLowerCase()) || c.name.toLowerCase().startsWith("ring"));

export default function CatalogTools({ products, categories, uploadImage, onChanged }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const say = (line: string) => setLog((prev) => [line, ...prev].slice(0, 200));

  const bySku = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) if (p.sku) m.set(normalizeSku(p.sku), p);
    return m;
  }, [products]);

  const findCategory = (value: string): Category | undefined => {
    const v = value.trim().toLowerCase();
    if (!v) return undefined;
    return categories.find(
      (c) =>
        c.name.toLowerCase() === v ||
        (c.slug || "").toLowerCase() === v ||
        c.name.toLowerCase().replace(/s$/, "") === v.replace(/s$/, ""),
    );
  };

  // ───────────────── 1. Raise prices ─────────────────
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [amount, setAmount] = useState("");
  const [priceScope, setPriceScope] = useState("all");
  const [roundTo, setRoundTo] = useState<"none" | "dollar" | "99">("dollar");

  const newPrice = (old: number) => {
    const a = Number(amount);
    let p = mode === "percent" ? old * (1 + a / 100) : old + a;
    if (roundTo === "dollar") p = Math.round(p);
    if (roundTo === "99") p = Math.max(0.99, Math.ceil(p) - 0.01);
    return Math.round(p * 100) / 100;
  };

  const priceTargets = products.filter((p) => priceScope === "all" || p.category_id === priceScope);
  const priceExample = priceTargets[0];

  const raisePrices = async () => {
    const a = Number(amount);
    if (!Number.isFinite(a) || a <= 0) return;
    const desc = mode === "percent" ? `${a}%` : `$${a}`;
    if (!window.confirm(`Raise the price of ${priceTargets.length} products by ${desc}? Note the old prices down first if you may want to undo.`)) return;
    setBusy("prices");
    let ok = 0;
    const failed: string[] = [];
    await inBatches(priceTargets, 8, async (p) => {
      const { error } = await supabase.from("products").update({ price: newPrice(Number(p.price)) }).eq("id", p.id);
      if (error) failed.push(`${p.sku || p.name}: ${error.message}`);
      else ok++;
    });
    say(`Prices raised by ${desc} on ${ok} products.${failed.length ? ` ${failed.length} failed: ${failed.slice(0, 5).join("; ")}` : ""}`);
    setBusy(null);
    await onChanged();
  };

  // ───────────────── 2. CSV import ─────────────────
  type Planned = { row: number; sku: string; action: "insert" | "update" | "skip"; reason?: string; data: Record<string, any> };
  const [plan, setPlan] = useState<Planned[]>([]);

  const readCsv = async (file: File) => {
    const rows = parseCsv(await file.text());
    const planned: Planned[] = rows.map((r, i) => {
      const rawSku = pick(r, "sku", "item no", "item no.", "item", "code", "id", "#");
      const sku = rawSku ? normalizeSku(rawSku) : "";
      const name = pick(r, "name", "title", "product", "item name", "product name");
      const catText = pick(r, "category", "categories", "type", "collection");
      const cat = findCategory(catText);
      const price = parsePrice(pick(r, "price", "price (usd)", "usd", "cost"));
      const description = pick(r, "description", "details", "desc");
      const sizes = parseSizes(pick(r, "sizes", "size", "ring sizes", "ring size"));
      const image = pick(r, "image", "image url", "photo", "picture");
      const images = parseSizes(pick(r, "images", "extra images", "gallery")).filter((u) => u.startsWith("http"));

      const data: Record<string, any> = {};
      if (sku) data.sku = sku;
      if (name) data.name = name;
      if (cat) data.category_id = cat.id;
      if (price !== null) data.price = price;
      if (description) data.description = description;
      if (sizes.length) data.sizes = sizes;
      if (image.startsWith("http")) data.image = image;
      if (images.length) data.images = images;

      const existing = sku ? bySku.get(sku) : undefined;
      if (existing) {
        return { row: i + 2, sku, action: "update", data };
      }
      const missing = [!name && "name", !cat && `category${catText ? ` "${catText}" not found` : ""}`, price === null && "price"].filter(Boolean);
      if (missing.length) return { row: i + 2, sku, action: "skip", reason: `missing ${missing.join(", ")}`, data };
      return { row: i + 2, sku, action: "insert", data };
    });
    setPlan(planned);
  };

  const runImport = async () => {
    const todo = plan.filter((p) => p.action !== "skip");
    if (!todo.length) return;
    setBusy("csv");
    let inserted = 0;
    let updated = 0;
    const failed: string[] = [];
    await inBatches(todo, 6, async (p) => {
      if (p.action === "update") {
        const target = bySku.get(p.sku)!;
        const { error } = await supabase.from("products").update(p.data).eq("id", target.id);
        if (error) failed.push(`row ${p.row} (${p.sku}): ${error.message}`);
        else updated++;
      } else {
        const { error } = await supabase.from("products").insert(p.data);
        if (error) failed.push(`row ${p.row} (${p.sku}): ${error.message}`);
        else inserted++;
      }
    });
    say(`CSV import: ${inserted} added, ${updated} updated${failed.length ? `, ${failed.length} failed — ${failed.slice(0, 5).join("; ")}` : ""}.`);
    setPlan([]);
    setBusy(null);
    await onChanged();
  };

  // ───────────────── 3. Photos by SKU ─────────────────
  const [replaceMain, setReplaceMain] = useState(false);

  const uploadPhotos = async (files: File[]) => {
    const groups = new Map<string, File[]>();
    const unmatched: string[] = [];
    for (const f of files) {
      const sku = skuFromFileName(f.name);
      if (sku && bySku.has(sku)) {
        groups.set(sku, [...(groups.get(sku) || []), f]);
      } else {
        unmatched.push(f.name);
      }
    }
    if (!groups.size) {
      say(`No photos matched a product SKU. Name the files like A309.jpg, A309-2.jpg. Unmatched: ${unmatched.slice(0, 8).join(", ")}`);
      return;
    }
    setBusy("photos");
    let done = 0;
    const failed: string[] = [];
    for (const [sku, list] of groups) {
      const product = bySku.get(sku)!;
      const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      try {
        const urls: string[] = [];
        for (const f of sorted) urls.push(await uploadImage(f));
        const update: Record<string, any> = {};
        let extra = urls;
        if (!product.image || replaceMain) {
          update.image = urls[0];
          extra = urls.slice(1);
        }
        if (extra.length) update.images = [...(product.images || []), ...extra];
        const { error } = await supabase.from("products").update(update).eq("id", product.id);
        if (error) throw error;
        done++;
      } catch (e: any) {
        failed.push(`${sku}: ${e?.message || e}`);
      }
    }
    say(
      `Photos: ${done} products updated.${unmatched.length ? ` ${unmatched.length} files had no matching SKU (${unmatched.slice(0, 6).join(", ")}${unmatched.length > 6 ? "…" : ""}).` : ""}${failed.length ? ` Failed: ${failed.join("; ")}` : ""}`,
    );
    setBusy(null);
    await onChanged();
  };

  // ───────────────── 4. Ring sizes ─────────────────
  const [ringSizes, setRingSizes] = useState(RING_SIZE_PRESET.join(", "));
  const [overwriteSizes, setOverwriteSizes] = useState(false);
  const ringCatIds = categories.filter(isRingCategory).map((c) => c.id);
  const rings = products.filter((p) => ringCatIds.includes(p.category_id));
  const ringTargets = rings.filter((p) => overwriteSizes || !(p.sizes && p.sizes.length));

  const applyRingSizes = async () => {
    const sizes = parseSizes(ringSizes);
    if (!sizes.length || !ringTargets.length) return;
    if (!window.confirm(`Set sizes ${sizes.join(", ")} on ${ringTargets.length} rings?`)) return;
    setBusy("rings");
    const failed: string[] = [];
    await inBatches(ringTargets, 8, async (p) => {
      const { error } = await supabase.from("products").update({ sizes }).eq("id", p.id);
      if (error) failed.push(`${p.sku || p.name}: ${error.message}`);
    });
    say(`Ring sizes set on ${ringTargets.length - failed.length} rings.${failed.length ? ` Failed: ${failed.slice(0, 5).join("; ")}` : ""}`);
    setBusy(null);
    await onChanged();
  };

  const maxSku = products.reduce((m, p) => (p.sku ? Math.max(m, skuNumber(p.sku)) : m), 0);
  const withoutDescription = products.filter((p: any) => !p.description).length;

  return (
    <Card className="bg-[#141311] border-[#22201c] text-[#f4efe6] rounded-none">
      <CardHeader>
        <CardTitle className="font-serif text-lg text-[#c5a880]">Catalog Tools</CardTitle>
        <CardDescription className="text-[#a8a296] text-xs">
          {products.length} products · highest SKU A{maxSku || "—"} · {withoutDescription} without description · {rings.length} rings
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Raise prices */}
        <div className={panel}>
          <p className="font-serif text-[#c5a880]">Raise all prices</p>
          <div className="grid grid-cols-2 gap-2">
            <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="h-9 bg-[#1c1a17] border border-[#22201c] text-xs px-2">
              <option value="percent">By %</option>
              <option value="amount">By $ amount</option>
            </select>
            <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={mode === "percent" ? "e.g. 20" : "e.g. 5"} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className={label}>Products</span>
              <select value={priceScope} onChange={(e) => setPriceScope(e.target.value)} className="w-full h-9 bg-[#1c1a17] border border-[#22201c] text-xs px-2">
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>Rounding</span>
              <select value={roundTo} onChange={(e) => setRoundTo(e.target.value as any)} className="w-full h-9 bg-[#1c1a17] border border-[#22201c] text-xs px-2">
                <option value="dollar">Whole $</option>
                <option value="99">.99 ending</option>
                <option value="none">Exact</option>
              </select>
            </div>
          </div>
          {priceExample && Number(amount) > 0 && (
            <p className="text-[11px] font-mono text-[#a8a296]">
              e.g. {priceExample.sku || priceExample.name}: ${Number(priceExample.price)} → ${newPrice(Number(priceExample.price))}
            </p>
          )}
          <Button type="button" className={goldBtn} disabled={!!busy || !(Number(amount) > 0)} onClick={raisePrices}>
            {busy === "prices" ? "Updating…" : `Apply to ${priceTargets.length} products`}
          </Button>
        </div>

        {/* CSV import */}
        <div className={panel}>
          <p className="font-serif text-[#c5a880]">Import items from CSV</p>
          <p className="text-[11px] text-[#a8a296] leading-relaxed">
            Google Sheet → File → Download → CSV. Columns: <span className="font-mono">sku, name, category, price, description, sizes, image</span>. Existing SKUs are updated, new ones added.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readCsv(f);
              e.target.value = "";
            }}
            className="text-xs"
          />
          {plan.length > 0 && (
            <>
              <p className="text-[11px] font-mono text-[#a8a296]">
                {plan.filter((p) => p.action === "insert").length} new · {plan.filter((p) => p.action === "update").length} update · {plan.filter((p) => p.action === "skip").length} skipped
              </p>
              {plan.some((p) => p.action === "skip") && (
                <ul className="max-h-24 overflow-y-auto text-[10px] font-mono text-red-300/80 space-y-0.5">
                  {plan.filter((p) => p.action === "skip").slice(0, 30).map((p) => (
                    <li key={p.row}>row {p.row} {p.sku}: {p.reason}</li>
                  ))}
                </ul>
              )}
              <Button type="button" className={goldBtn} disabled={!!busy} onClick={runImport}>
                {busy === "csv" ? "Importing…" : "Import now"}
              </Button>
            </>
          )}
        </div>

        {/* Photos by SKU */}
        <div className={panel}>
          <p className="font-serif text-[#c5a880]">Upload photos by SKU</p>
          <p className="text-[11px] text-[#a8a296] leading-relaxed">
            Name files by item number: <span className="font-mono">A309.jpg</span>, <span className="font-mono">A309-2.jpg</span>… The first becomes the main photo (if the item has none), the rest go into its gallery.
          </p>
          <label className="flex items-center gap-2 text-[11px] text-[#a8a296]">
            <input type="checkbox" checked={replaceMain} onChange={(e) => setReplaceMain(e.target.checked)} />
            Replace the main photo
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!!busy}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) uploadPhotos(files);
              e.target.value = "";
            }}
            className="text-xs"
          />
          {busy === "photos" && <p className="text-[11px] font-mono text-[#c5a880]">Uploading…</p>}
        </div>

        {/* Ring sizes */}
        <div className={panel}>
          <p className="font-serif text-[#c5a880]">Ring sizes</p>
          <div>
            <span className={label}>Sizes</span>
            <Input value={ringSizes} onChange={(e) => setRingSizes(e.target.value)} className={field} />
          </div>
          <label className="flex items-center gap-2 text-[11px] text-[#a8a296]">
            <input type="checkbox" checked={overwriteSizes} onChange={(e) => setOverwriteSizes(e.target.checked)} />
            Also overwrite rings that already have sizes
          </label>
          <Button type="button" className={goldBtn} disabled={!!busy || !ringTargets.length} onClick={applyRingSizes}>
            {busy === "rings" ? "Saving…" : `Apply to ${ringTargets.length} rings`}
          </Button>
          <p className="text-[10px] text-[#6e6555]">Single rings can also be edited one by one in the form.</p>
        </div>

        {log.length > 0 && (
          <div className="md:col-span-2 xl:col-span-4 border border-[#22201c] p-3 max-h-40 overflow-y-auto">
            {log.map((l, i) => (
              <p key={i} className="text-[11px] font-mono text-emerald-300/80">› {l}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
