import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/components/CartContext";

const nav = [
  { label: "Shop", to: "/shop" },
  { label: "Earrings", to: "/collections/earrings" },
  { label: "Necklaces", to: "/collections/necklaces" },
  { label: "Bracelets", to: "/collections/bracelets" },
  { label: "Rings", to: "/collections/ring" },
  { label: "Belts", to: "/collections/belts" },
  { label: "Journal", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { cart } = useCart();
  const location = useLocation();

  // Close the menu whenever the page changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Stop the page behind the menu from scrolling while it is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Total quantity of all items
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-background/85 backdrop-blur-xl border-b border-border"
        : "bg-transparent"
        }`}
    >
      <div className="container-luxe flex items-center justify-between gap-4 ">
        <div className="hidden lg:flex flex-1 items-center gap-5 xl:gap-7 text-[11px] tracking-[0.22em] uppercase text-foreground/80">
          {nav.slice(0, 4).map((n) => (
            <Link key={n.to} to={n.to as any} className="link-underline hover:text-gold transition-colors">
              {n.label}
            </Link>
          ))}
        </div>

        <Logo className="lg:mx-auto w-[135px] sm:w-[150px] lg:w-[170px] h-auto" />

        <div className="flex lg:flex-1 items-center justify-end gap-3 sm:gap-5">
          <div className="hidden lg:flex items-center gap-5 xl:gap-7 text-[11px] tracking-[0.22em] uppercase text-foreground/80">
            {nav.slice(4).map((n) => (
              <Link key={n.to} to={n.to as any} className="link-underline hover:text-gold transition-colors">
                {n.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-4 lg:ml-2">
            <button aria-label="Search" className="p-2 -m-2 text-foreground/80 hover:text-gold transition">
              <Search size={18} strokeWidth={1.4} />
            </button>
            <Link to="/account" aria-label="Account" className="p-2 -m-2 text-foreground/80 hover:text-gold transition hidden sm:inline-flex">
              <User size={18} strokeWidth={1.4} />
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative p-2 -m-2 text-foreground/80 hover:text-gold transition">
              <ShoppingBag size={18} strokeWidth={1.4} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 text-[9px] text-ink bg-gold rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              aria-label="Menu"
              className="lg:hidden p-2 -m-2 text-foreground/80 hover:text-gold transition"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} strokeWidth={1.4} />
            </button>
          </div>
        </div>
      </div>

    </header>
      {/* Mobile menu — rendered on <body> (portal). Inside the header, the header's
            backdrop-blur trapped this "fixed" layer, so it scrolled with the page and
            the gold links ended up on top of the product listing. */}
        {typeof document !== "undefined" &&
          createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-hidden={!open}
              className={`fixed inset-0 z-[100] h-[100dvh] bg-background overflow-hidden transition-opacity duration-500 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
            >
              <div className="container-luxe flex items-center justify-between py-5 border-b border-border">
                <Logo className="w-[135px] sm:w-[150px] h-auto" />
                <button aria-label="Close" onClick={() => setOpen(false)} className="text-gold p-2 -m-2">
                  <X size={22} strokeWidth={1.4} />
                </button>
              </div>
              <nav className="container-luxe pt-8 sm:pt-12 pb-12 flex flex-col gap-5 sm:gap-7 h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain scrollbar-luxe">
                {nav.map((n, i) => (
                  <Link
                    key={n.to} to={n.to as any}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="font-serif text-2xl sm:text-3xl gradient-gold-text"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>,
            document.body,
          )}
    </>
  );
}
export default Header;
