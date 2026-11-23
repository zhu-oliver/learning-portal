import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return <div className="container"><header className="site-header"><Brand /></header>
    <main id="main" className="empty-state"><span className="eyebrow">A LITTLE DETOUR</span><h1>That discovery isn&apos;t here.</h1><p>The page may have moved, or the link may be incorrect.</p><Link href="/learn" className="button primary">Back to your subjects</Link></main>
  </div>;
}
