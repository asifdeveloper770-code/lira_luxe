import { Link } from "react-router-dom";
import { useSiteImage } from "@/lib/site-images";

export function Logo({
  className = "",
}: {
  className?: string;
}) {
  const logo = useSiteImage("logo");
  return (
    <Link
      to="/"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <img
        src={logo}
        alt="Lira Fashion"
        className="w-full h-auto object-contain"
      />
    </Link>
  );
}

export default Logo;
