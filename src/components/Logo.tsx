import { Link } from "react-router-dom";
import logo from "@/assets/lira2.png";

export function Logo({
  className = "",
}: {
  className?: string;
}) {
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