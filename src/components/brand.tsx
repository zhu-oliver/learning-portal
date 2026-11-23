import Link from "next/link";
import { Sprout } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
  return <Link className="brand" href={href} aria-label="Little Oak home">
    <span className="brand-icon"><Sprout size={25} strokeWidth={2.4} /></span>
    <span>little oak<span className="brand-dot">.</span></span>
  </Link>;
}
