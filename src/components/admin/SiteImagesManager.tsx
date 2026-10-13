// src/components/admin/SiteImagesManager.tsx
// Admin tab: replace any website image (hero, logo, banners, gallery…) without touching code.
import { useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  SITE_IMAGE_SLOTS,
  SITE_IMAGES_BUCKET,
  VIDEO_OFF,
  useSiteImages,
  type SiteImageSlot,
} from "@/lib/site-images";

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 50;

type Notice = { type: "success" | "error"; text: string } | null;

function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${SITE_IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

export default function SiteImagesManager() {
  const { overrides, refresh } = useSiteImages();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState("All");

  const sections = useMemo(() => {
    const map = new Map<string, SiteImageSlot[]>();
    SITE_IMAGE_SLOTS.forEach((slot) => {
      if (!map.has(slot.section)) map.set(slot.section, []);
      map.get(slot.section)!.push(slot);
    });
    return Array.from(map.entries());
  }, []);

  const customCount = SITE_IMAGE_SLOTS.filter((s) => overrides[s.key]).length;

  const flash = (n: Notice) => {
    setNotice(n);
    if (n) setTimeout(() => setNotice(null), 4500);
  };

  const removeOldFile = async (key: string) => {
    const oldUrl = overrides[key];
    const path = oldUrl ? storagePathFromUrl(oldUrl) : null;
    if (path) {
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([path]);
    }
  };

  const handleUpload = async (slot: SiteImageSlot, file: File) => {
    const isVideo = slot.kind === "video";
    const okType = isVideo ? file.type.startsWith("video/") : file.type.startsWith("image/");
    if (!okType) {
      flash({ type: "error", text: `Please choose ${isVideo ? "a video (MP4)" : "an image"} file.` });
      return;
    }
    const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (file.size > maxMb * 1024 * 1024) {
      flash({ type: "error", text: `File is too large. Maximum is ${maxMb} MB.` });
      return;
    }

    setBusyKey(slot.key);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
      const path = `${slot.key}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(SITE_IMAGES_BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(path);

      await removeOldFile(slot.key);

      const { error: dbError } = await supabase
        .from("site_images")
        .upsert({ key: slot.key, url: data.publicUrl, updated_at: new Date().toISOString() });
      if (dbError) throw dbError;

      await refresh();
      flash({ type: "success", text: `"${slot.label}" updated. It is now live on the website.` });
    } catch (err: any) {
      console.error("Site image upload failed:", err);
      flash({ type: "error", text: `Upload failed: ${err?.message || "Unknown error"}` });
    } finally {
      setBusyKey(null);
    }
  };

  const handleReset = async (slot: SiteImageSlot) => {
    setBusyKey(slot.key);
    try {
      await removeOldFile(slot.key);
      const { error } = await supabase.from("site_images").delete().eq("key", slot.key);
      if (error) throw error;
      await refresh();
      flash({ type: "success", text: `"${slot.label}" restored to the original.` });
    } catch (err: any) {
      flash({ type: "error", text: `Reset failed: ${err?.message || "Unknown error"}` });
    } finally {
      setBusyKey(null);
    }
  };

  const handleVideoOff = async (slot: SiteImageSlot) => {
    setBusyKey(slot.key);
    try {
      await removeOldFile(slot.key);
      const { error } = await supabase
        .from("site_images")
        .upsert({ key: slot.key, url: VIDEO_OFF, updated_at: new Date().toISOString() });
      if (error) throw error;
      await refresh();
      flash({ type: "success", text: "Hero video turned off. The hero image is now shown." });
    } catch (err: any) {
      flash({ type: "error", text: `Could not turn off video: ${err?.message || "Unknown error"}` });
    } finally {
      setBusyKey(null);
    }
  };

  const visibleSections = filter === "All" ? sections : sections.filter(([name]) => name === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-[#22201c] bg-[#141311] p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c5a880]">Website Imagery</p>
          <h2 className="font-serif text-2xl mt-2">Site Images</h2>
          <p className="text-xs text-[#a8a296] mt-2 max-w-xl leading-relaxed">
            Replace any picture on the website. Changes go live immediately for every visitor.
            Use “Reset” to bring back the original image.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#a8a296]">
            {customCount} / {SITE_IMAGE_SLOTS.length} customised
          </span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 bg-[#1c1a17] border border-[#22201c] text-xs text-[#f4efe6] px-2 focus:outline-none"
          >
            <option value="All">All sections</option>
            {sections.map(([name]) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div
          className={`border px-4 py-3 text-xs font-mono ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {notice.type === "success" ? "✓ " : "✕ "}
          {notice.text}
        </div>
      )}

      {visibleSections.map(([section, slots]) => (
        <section key={section} className="border border-[#22201c] bg-[#141311]">
          <header className="px-6 py-4 border-b border-[#22201c] flex items-center justify-between">
            <h3 className="font-serif text-lg text-[#c5a880]">{section}</h3>
            <span className="font-mono text-[10px] text-[#6e6555] uppercase">{slots.length} slots</span>
          </header>
          <div className="p-6 grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {slots.map((slot) => (
              <SlotCard
                key={slot.key}
                slot={slot}
                customUrl={overrides[slot.key]}
                busy={busyKey === slot.key}
                disabled={busyKey !== null && busyKey !== slot.key}
                onUpload={(f) => handleUpload(slot, f)}
                onReset={() => handleReset(slot)}
                onVideoOff={() => handleVideoOff(slot)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function SlotCard({
  slot,
  customUrl,
  busy,
  disabled,
  onUpload,
  onReset,
  onVideoOff,
}: {
  slot: SiteImageSlot;
  customUrl?: string;
  busy: boolean;
  disabled: boolean;
  onUpload: (file: File) => void;
  onReset: () => void;
  onVideoOff: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = slot.kind === "video";
  const videoOff = isVideo && customUrl === VIDEO_OFF;
  const current = customUrl && customUrl !== VIDEO_OFF ? customUrl : slot.defaultUrl;
  const isCustom = Boolean(customUrl);

  return (
    <div className="border border-[#22201c] bg-[#0d0d0c] flex flex-col">
      <div className={`relative ${slot.aspect || "aspect-video"} bg-[#1c1a17] overflow-hidden`}>
        {videoOff ? (
          <div className="absolute inset-0 grid place-items-center text-center px-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#6e6555]">
              Video off
              <br />
              <span className="normal-case tracking-normal">Hero image is shown instead</span>
            </p>
          </div>
        ) : current ? (
          isVideo ? (
            <video src={current} style={{ height: "100%" }} muted loop playsInline autoPlay preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img
              src={current}
              alt={slot.label}
              style={{ height: "100%" }}
              className={`absolute inset-0 w-full h-full ${slot.contain ? "object-contain p-3" : "object-cover"}`}
            />
          )
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center px-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#6e6555]">
              Not set
              <br />
              <span className="normal-case tracking-normal">Uses the category image</span>
            </p>
          </div>
        )}

        <span
          className={`absolute top-2 left-2 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border ${
            isCustom
              ? "bg-[#c5a880] text-[#0d0d0c] border-[#c5a880]"
              : "bg-[#0d0d0c]/80 text-[#a8a296] border-[#3a352a]"
          }`}
        >
          {isCustom ? "Custom" : "Original"}
        </span>

        {busy && (
          <div className="absolute inset-0 bg-[#0d0d0c]/75 grid place-items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c5a880] animate-pulse">
              Uploading…
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-[#f4efe6]">{slot.label}</p>
          {slot.hint && <p className="text-[11px] text-[#6e6555] mt-1 leading-relaxed">{slot.hint}</p>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={isVideo ? "video/mp4,video/webm" : "image/*"}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = "";
          }}
        />

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => inputRef.current?.click()}
            className="flex-1 min-w-[110px] bg-[#c5a880] text-[#0d0d0c] hover:bg-[#b0936b] disabled:opacity-40 px-3 py-2 text-[10px] uppercase tracking-wider font-mono transition-colors"
          >
            {isVideo ? "Upload Video" : "Replace Image"}
          </button>

          {isVideo && !videoOff && (
            <button
              type="button"
              disabled={busy || disabled}
              onClick={onVideoOff}
              className="border border-[#3a352a] text-[#a8a296] hover:text-[#c5a880] hover:border-[#c5a880] disabled:opacity-40 px-3 py-2 text-[10px] uppercase tracking-wider font-mono transition-colors"
            >
              Turn Off
            </button>
          )}

          {isCustom && (
            <button
              type="button"
              disabled={busy || disabled}
              onClick={onReset}
              className="border border-[#3a352a] text-[#a8a296] hover:text-red-400 hover:border-red-400/60 disabled:opacity-40 px-3 py-2 text-[10px] uppercase tracking-wider font-mono transition-colors"
            >
              {videoOff ? "Turn On" : "Reset"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
