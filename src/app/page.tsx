import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Check, FlaskConical, Leaf, ShieldCheck, Sparkles, Star } from "lucide-react";
import { auth, googleConfigured } from "@/auth";
import { login } from "./actions";
import { Brand } from "@/components/brand";
import { SubjectIcon } from "@/components/subject-icon";
import { subjects } from "@/modules";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  if (googleConfigured && (await auth())?.user?.id) redirect("/learn");

  return <div className="landing">
    <header className="site-header container">
      <Brand />
      <span className="header-note"><Leaf size={16} /> A place to grow</span>
    </header>
    <main id="main" className="container">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="pill"><span className="tiny-dot" /> BIG IDEAS FOR CURIOUS MINDS</span>
          <h1>A little curiosity.<br />A world of<br /><span className="highlight">possibility.</span></h1>
          <p className="hero-description">Welcome to your own little corner of discovery. Explore new ideas, stretch your imagination, and learn something wonderful every day.</p>
          <form action={login}>
            <button className="button google-button" disabled={!googleConfigured}>
              <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-1 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4H3.1v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.4 14.1a6 6 0 0 1 0-4.2V7.3H3.1a10 10 0 0 0 0 9.4l3.3-2.6Z" /><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.3l3.3 2.6c.8-2.3 3-4 5.6-4Z" /></svg>
              Continue with Google<ArrowRight size={18} />
            </button>
          </form>
          {!googleConfigured && <p className="setup-notice" role="status">Google sign-in is not set up yet. A parent can connect it using the project setup guide. You can try a sample lesson below.</p>}
          {error && <p className="error-notice" role="alert">{error === "Configuration" ? "Google sign-in needs to be configured before you can log in." : "We couldn't sign you in. Please try again with a verified Google account. If this keeps happening, ask a parent to check the sign-in setup."}</p>}
          <p className="sign-in-note"><ShieldCheck size={15} /> Sign in securely with your Google account</p>
          <Link className="text-link" href="/try">Take a peek at a sample lesson <ArrowRight size={16} /></Link>
          <br /><Link className="text-link" href="/try/spelling">Try the Spelling Bee <ArrowRight size={16} /></Link>
          <br /><Link className="text-link" href="/try/french">Say bonjour — try French <ArrowRight size={16} /></Link>
          <br /><Link className="text-link" href="/games">Play games without signing in <ArrowRight size={16} /></Link>
        </div>
        <div className="hero-art" aria-label="A colorful collection of learning subjects">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <Star className="art-star star-one" fill="currentColor" size={30} />
          <Sparkles className="art-star star-two" size={30} />
          <span className="art-dot dot-one" /><span className="art-dot dot-two" />
          <div className="art-card art-math"><span className="art-card-label">A LITTLE CHALLENGE</span><div className="math-illustration"><span>1<span className="fraction-line" />2</span><b>+</b><span>1<span className="fraction-line" />4</span><b>=</b><span className="math-question">?</span></div><span className="art-card-bottom">Big thinking starts small <Sparkles size={16} /></span></div>
          <div className="art-card art-reading"><div className="illustration-icon"><BookOpen size={42} /></div><div><span className="art-card-label">ONE MORE CHAPTER</span><strong>Adventure awaits.</strong><div className="fake-line" /><div className="fake-line short" /></div></div>
          <div className="art-card art-science"><FlaskConical size={47} strokeWidth={1.5} /><div><span className="art-card-label">WONDER. EXPLORE. DISCOVER.</span><strong>What if...?</strong></div><span className="science-bubble" /></div>
          <div className="art-badge"><span><Check size={16} /></span>Made for growing minds</div>
        </div>
      </section>
      <section className="subject-preview" aria-labelledby="subjects-heading">
        <div className="section-intro"><div><span className="eyebrow">SO MUCH TO EXPLORE</span><h2 id="subjects-heading">Where will your curiosity take you?</h2></div><span className="age-label">Grades 1–8 learning + all-grades practice</span></div>
        <div className="subject-cards">{subjects.map((subject) =>
          <div className={`subject-card theme-${subject.theme}`} key={subject.slug}>
            <span className="subject-icon"><SubjectIcon theme={subject.theme} /></span>
            <h3>{subject.title}</h3><p>{subject.description}</p>
            <span className="subject-tagline">{subject.tagline}</span>
          </div>,
        )}</div>
      </section>
      <div className="encouragement"><Sparkles size={20} /><p>No rush. No pressure. Just you, your curiosity, and the next little discovery.</p></div>
    </main>
    <footer className="site-footer container"><span>&copy; {new Date().getFullYear()} Little Oak</span><span>Small steps. Strong roots. <Leaf size={14} /></span><Link href="/privacy">Privacy &amp; parent notes</Link></footer>
  </div>;
}
