"use client";
import type { Project } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import { Scrapbook } from "./Scrapbook";
import { Sheet } from "./Sheet";
import { VisionBoard } from "./VisionBoard";

/** The public share page: look, don't touch. */
export function ReadOnly({ project }: { project: Project }) {
  const [view, setView] = useState<"scrapbook" | "board">("scrapbook");
  const [sheet, setSheet] = useState<string | null>(null);
  return (
    <>
      <div className="readonly-banner">You&apos;re viewing a shared scrapbook made with Tada. <Link href="/" style={{ color: "#FFE45C" }}>Make your own →</Link></div>
      <div className="nav"><div className="in">
        <Link className="wordmark" href="/">Tada</Link>
        <div className="tabs"><button className={"tab" + (view === "scrapbook" ? " on" : "")} onClick={() => setView("scrapbook")}>Scrapbook</button><button className={"tab" + (view === "board" ? " on" : "")} onClick={() => setView("board")}>Vision board</button></div>
        <div className="navr"><span className="tiny">read-only</span></div>
      </div></div>
      <div className="page">
        {view === "scrapbook" ? <Scrapbook p={project} readOnly onOpen={(t) => (t === "path" ? setView("board") : setSheet(t))} /> : <VisionBoard p={project} readOnly />}
        <p className="foot">Not legal, tax or financial advice. Every licence links to the official body; confirm there before you file. Costs are estimates.</p>
      </div>
      {sheet && <Sheet p={project} tile={sheet} readOnly onClose={() => setSheet(null)} />}
    </>
  );
}
