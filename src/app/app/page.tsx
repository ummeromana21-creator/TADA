import { Art } from "@/components/Art";
import { DeleteProject } from "@/components/DeleteProject";
import { Shell } from "@/components/Shell";
import { logoSvg } from "@/lib/art";
import { placeOf } from "@/lib/data";
import { rowToProject } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import { arr, niceDate, obj, str } from "@/lib/util";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MyScrapbooks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
  const projects = (data ?? []).map(rowToProject);
  return (
    <Shell email={user?.email}>
      <div style={{ paddingTop: 28 }}><span className="sticker sky">Your profile</span><h1 className="serif" style={{ fontSize: "clamp(32px,5vw,50px)", margin: "12px 0 6px" }}>My scrapbooks</h1><p className="muted" style={{ margin: 0, maxWidth: "60ch" }}>Saved to your account, so they&apos;re here on any device. Share one from inside it, or save it as a file.</p></div>
      <div className="plist">
        {!projects.length && <div className="note" style={{ padding: 24 }}><p className="muted" style={{ margin: 0 }}>No scrapbooks yet.</p><Link className="btn primary" style={{ marginTop: 12 }} href="/app/new">Start one</Link></div>}
        {projects.map((p, i) => {
          const steps = arr(obj(p.book?.path).steps); const done = steps.filter((s) => p.done[str(s.id)]).length; const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
          return (
            <div key={p.id} className="note pcard" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.8}deg)` }}>
              <div className={["tape stripe", "pin blue", "tape dots"][i % 3]}></div>
              <div className="row between" style={{ alignItems: "flex-start" }}>
                {p.book && <Art html={logoSvg(obj(p.book.brand).logo, 44, p.book.name)} />}
                <div style={{ minWidth: 0, flex: 1 }}><div className="serif" style={{ fontSize: 22 }}>{p.book ? p.book.name : "Untitled idea"}</div><div className="tiny" style={{ marginTop: 2 }}>{placeOf(p)} · {niceDate(p.createdAt)}</div></div>
                <DeleteProject id={p.id} />
              </div>
              <p className="muted" style={{ fontSize: 14, margin: "10px 0 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.idea}</p>
              {p.book ? <><div className="progress" style={{ marginTop: 12 }}><div className="bar" style={{ width: pct + "%" }}></div></div><div className="tiny" style={{ marginTop: 4 }}>{done} of {steps.length} steps</div></> : <div className="tiny" style={{ marginTop: 12 }}>{p.interview.length} answers · not built yet</div>}
              <Link className="btn primary small" style={{ marginTop: 12 }} href={`/app/p/${p.id}`}>{p.book ? "Open" : "Continue"}</Link>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
