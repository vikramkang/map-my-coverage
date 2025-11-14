import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Map My Coverage",
  description: "Neutral insurance coverage checkup for Canadians.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className="app-shell">
        <header className="app-header">
          <a href="/" className="app-header__brand">
            <span className="app-header__brand-main">Map My Coverage</span>
            <span className="app-header__brand-sub">
              Insurance gap checkup for Canadians
            </span>
          </a>
          <nav className="app-header__nav">
            <a href="/">Home</a>
            <a href="/login">Coverage checkup</a>
            <a href="/login">Sign in</a>
            <a href="/register" className="app-header__cta">
              Create account
            </a>
          </nav>
        </header>
        <main className="app-main">{children}</main>
        <footer className="app-footer">
          <span>© {year} Map My Coverage</span>
        </footer>
      </body>
    </html>
  );
}
