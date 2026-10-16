// src/lib/site-images.tsx
// Website images that the admin can replace from the dashboard ("Site Images" tab).
// Each slot has a built-in default; if the admin uploads a new file, its URL is stored
// in the Supabase table `site_images` and used instead.
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import logo from "@/assets/lira2.png";
import heroImage from "@/assets/hero-necklace.jpg";
import story from "@/assets/story.jpg";
import earrings from "@/assets/cat-earrings.jpg";
import necklaces from "@/assets/cat-necklaces.jpg";
import bracelets from "@/assets/cat-bracelets.jpg";
import rings from "@/assets/cat-rings.jpg";
import belts from "@/assets/cat-belts.jpg";
import galleryWide from "@/assets/Ring banner.png";
import { bestSellers, collections } from "@/lib/products";

export const SITE_IMAGES_BUCKET = "site-images";
export const VIDEO_OFF = "none";

export type SlotKind = "image" | "video";

export interface SiteImageSlot {
  key: string;
  label: string;
  section: string;
  kind: SlotKind;
  defaultUrl: string;
  hint?: string;
  /** Aspect ratio used for the preview tile in the dashboard */
  aspect?: string;
  /** Show the whole image in the dashboard preview (e.g. logos) */
  contain?: boolean;
}

const categoryDefaults: Record<string, string> = {
  earrings,
  necklaces,
  bracelets,
  rings,
  belts,
};

const categoryNames: Record<string, string> = {
  earrings: "Earrings",
  necklaces: "Necklaces",
  bracelets: "Bracelets",
  rings: "Rings",
  belts: "Beaded Belts",
};

const galleryDefaults = [
  bestSellers[0]?.image,
  bestSellers[2]?.image,
  bestSellers[1]?.image,
  bestSellers[3]?.image,
  collections[1]?.image,
  collections[2]?.image,
  galleryWide,
] as string[];

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "logo",
    label: "Logo",
    section: "Brand",
    kind: "image",
    defaultUrl: logo,
    hint: "Header & footer. Transparent PNG works best.",
    aspect: "aspect-[3/1]",
    contain: true,
  },
  {
    key: "home_hero",
    label: "Hero Image",
    section: "Home · Hero",
    kind: "image",
    defaultUrl: heroImage,
    hint: "Shown behind the hero text. While the video is on, it shows until the video loads.",
    aspect: "aspect-video",
  },
  {
    key: "home_hero_video",
    label: "Hero Video",
    section: "Home · Hero",
    kind: "video",
    defaultUrl: "/video/lira-video.mp4",
    hint: "MP4, max 50 MB. Turn it off to show only the hero image.",
    aspect: "aspect-video",
  },
  ...Object.keys(categoryDefaults).map((slug) => ({
    key: `category_${slug}`,
    label: categoryNames[slug],
    section: "Home · Collection Cards",
    kind: "image" as const,
    defaultUrl: categoryDefaults[slug],
    hint: "Portrait 3:4",
    aspect: "aspect-[3/4]",
  })),
  ...galleryDefaults.map((url, i) => ({
    key: `gallery_${i + 1}`,
    label: `Gallery ${i + 1}`,
    section: "Home · Gallery (The muse, in the wild)",
    kind: "image" as const,
    defaultUrl: url,
    hint: i === 6 ? "Wide strip at the bottom of the gallery. Landscape works best." : undefined,
    aspect: i === 6 ? "aspect-[3/1]" : "aspect-square",
  })),
  ...bestSellers.map((p, i) => ({
    key: `bestseller_${i + 1}`,
    label: `Bestseller ${i + 1} · ${p.name}`,
    section: "Home · Bestsellers (Coveted Pieces)",
    kind: "image" as const,
    defaultUrl: p.image,
    hint: "Portrait 4:5",
    aspect: "aspect-[4/5]",
  })),
  {
    key: "home_story",
    label: "Story Image",
    section: "Home · Story",
    kind: "image",
    defaultUrl: story,
    hint: "Portrait 4:5",
    aspect: "aspect-[4/5]",
  },
  {
    key: "about_hero",
    label: "About Banner",
    section: "About Page",
    kind: "image",
    defaultUrl: heroImage,
    hint: "Wide landscape",
    aspect: "aspect-video",
  },
  {
    key: "about_story",
    label: "About Story Image",
    section: "About Page",
    kind: "image",
    defaultUrl: story,
    hint: "Portrait 4:5",
    aspect: "aspect-[4/5]",
  },
  ...Object.keys(categoryDefaults).map((slug) => ({
    key: `collection_banner_${slug}`,
    label: `${categoryNames[slug]} Banner`,
    section: "Collection Page Banners",
    kind: "image" as const,
    defaultUrl: "",
    hint: "Wide banner at the top of the collection page. Empty = uses the category image.",
    aspect: "aspect-[21/9]",
  })),
];

const slotByKey = Object.fromEntries(SITE_IMAGE_SLOTS.map((s) => [s.key, s]));

// ---------------------------------------------------------------------------
// Provider: loads overrides once and shares them with the whole site
// ---------------------------------------------------------------------------
type Overrides = Record<string, string>;

interface SiteImagesContextValue {
  overrides: Overrides;
  loaded: boolean;
  refresh: () => Promise<void>;
}

const SiteImagesContext = createContext<SiteImagesContextValue>({
  overrides: {},
  loaded: false,
  refresh: async () => {},
});

const CACHE_KEY = "lira_site_images_v1";

function readCache(): Overrides {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Overrides) : {};
  } catch {
    return {};
  }
}

function writeCache(value: Overrides) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function SiteImagesProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>(() => readCache());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("site_images").select("key, url");
      if (error) throw error;
      const next: Overrides = {};
      (data || []).forEach((row: { key: string; url: string }) => {
        if (row.url) next[row.key] = row.url;
      });
      setOverrides(next);
      writeCache(next);
    } catch (err) {
      console.warn("Site images could not be loaded, using defaults.", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteImagesContext.Provider value={{ overrides, loaded, refresh }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

export function useSiteImages() {
  return useContext(SiteImagesContext);
}

/** Returns the admin-uploaded URL for a slot, or its built-in default. */
export function useSiteImage(key: string): string {
  const { overrides } = useContext(SiteImagesContext);
  return overrides[key] || slotByKey[key]?.defaultUrl || "";
}

export function isCustomized(overrides: Overrides, key: string) {
  return Boolean(overrides[key]);
}
