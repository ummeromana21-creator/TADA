import { SignIn } from "@/components/SignIn";
import Link from "next/link";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="shell">
      <div className="nav" style={{ margin: "0 -20px" }}><div className="in"><Link className="wordmark" href="/">Tada</Link></div></div>
      <div style={{ maxWidth: 480, margin: "60px auto 0" }}>
        <h1 className="serif" style={{ fontSize: 40, margin: "0 0 16px" }}>Welcome back</h1>
        <SignIn next={next && next.startsWith("/") ? next : "/app"} />
      </div>
    </main>
  );
}
