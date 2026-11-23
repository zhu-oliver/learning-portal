import Link from "next/link";
import { History, LogOut, Sprout } from "lucide-react";
import { Brand } from "@/components/brand";
import { requireUser } from "@/lib/session";
import { logout } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function LearningLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const firstName = user.name?.trim().split(/\s+/)[0] || "Explorer";
  return <div className="learning-shell">
    <header className="site-header container"><Brand href="/learn" /><div className="account-menu">
      <Link className="history-link" href="/learn/history" aria-label="My result history"><History size={18} /></Link>
      <span className="avatar" aria-hidden="true">{firstName.slice(0, 1).toUpperCase()}</span>
      <span className="account-name">{firstName}</span>
      <form action={logout}><button className="signout-button" aria-label="Sign out"><LogOut size={17} /><span>Sign out</span></button></form>
    </div></header>
    <main id="main" className="container learning-main">{children}</main>
    <footer className="site-footer container"><span>Little Oak learning club</span><Link href="/privacy">Privacy &amp; parent notes</Link><span><Sprout size={15} /> A little wiser, every day.</span></footer>
  </div>;
}
