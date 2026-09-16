import { Art } from "@/components/Art";
import { SignIn } from "@/components/SignIn";
import { decor, scene } from "@/lib/art";

export default function Landing() {
  const marks = [["Sugar & Sage — home bakery", "cake", "#FBE3C8", "#F6C6D0", -5, "0", "30px"], ["Gleam — mobile car detailing", "car", "#D7E5F8", "#E4D9F7", 4, "calc(50% - 10px)", "0"], ["Brightpath — tutoring", "book", "#DDF1E5", "#FBEFC8", 2, "12%", "270px"]] as const;
  return (
    <main className="shell">
      <div className="nav" style={{ margin: "0 -20px" }}><div className="in"><span className="wordmark">Tada</span><span className="tiny">Your business scrapbook</span></div></div>
      <section className="landing">
        <div className="col" style={{ gap: 20, position: "relative", zIndex: 1 }}>
          <Art html={decor("flower", "left:-40px;top:-10px;width:70px;opacity:.9;transform:rotate(-12deg)")} />
          <div><span className="sticker blush">An AI-powered scrapbook for your business idea</span></div>
          <h1 className="serif">What&apos;s the idea?</h1>
          <p className="lede">Say it in a sentence. Tada asks what it needs to know, then builds a scrapbook of everything it takes — the pitch, the brand, the money, the licences with links to the real forms, the tools — and a vision board that walks you, step by step, to Ta-da.</p>
          <SignIn />
          <div className="hand" style={{ fontSize: 24, marginLeft: 8 }}>no plan needed — just the idea, in your own words</div>
        </div>
        <div className="collage">
          <Art html={decor("sun", "right:-10px;top:-24px;width:110px;opacity:.9") + decor("sprig", "left:-30px;bottom:-10px;width:120px;transform:rotate(10deg)") + decor("sparkles", "left:44%;top:-12px;width:54px") + decor("mushroom", "right:8%;bottom:8px;width:60px;transform:rotate(-8deg)")} />
          {marks.map((m, i) => (
            <div key={m[0]} className="polaroid" style={{ position: "absolute", left: m[5], top: m[6], width: "min(220px,46%)", transform: `rotate(${m[4]}deg)` }}>
              <div className={"pin" + (m[1] === "book" ? " green" : m[1] === "car" ? " blue" : "")}></div>
              <Art as="div" className="photo" html={scene(m[1], m[2], m[3], i + 10)} />
              <div className="cap">{m[0]}</div>
            </div>
          ))}
          <div className="note yellow" style={{ position: "absolute", right: 0, top: 310, width: "min(230px,48%)", padding: "16px 16px 14px", transform: "rotate(-3deg)" }}><div className="tape stripe"></div><div className="hand" style={{ fontSize: 22, color: "var(--ink)" }}>Every scrapbook ends with the same page:</div><div className="serif" style={{ fontSize: 40, marginTop: 4, color: "var(--accent)" }}>Ta-da.</div><div className="tiny" style={{ marginTop: 6 }}>registrations filed · accounts open · first customer ready</div></div>
        </div>
      </section>
      <p className="foot">Tada is not legal, tax or financial advice. Every licence links to the official body; confirm there before you file.</p>
    </main>
  );
}
