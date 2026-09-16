import Link from "next/link";
import { SignOut } from "./SignOut";

/** Top bar for the signed-in list pages. */
export function Shell({ children, email }: { children: React.ReactNode; email?: string | null }) {
  return (
    <main className="shell">
      <div className="nav" style={{ margin: "0 -20px" }}><div className="in">
        <Link className="wordmark" href="/app">Tada</Link>
        <div className="navr">
          <Link className="btn ghost small" href="/app">My scrapbooks</Link>
          <Link className="btn primary small" href="/app/new">New idea</Link>
          {email && <SignOut email={email} />}
        </div>
      </div></div>
      {children}
    </main>
  );
}
