import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Little Oak | A little curiosity. A world of possibility.", template: "%s | Little Oak" },
  description: "A welcoming learning space for curious minds ages 9–11. Explore math, reading, and science, one discovery at a time.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main">Skip to content</a>
    {children}
  </body></html>;
}
