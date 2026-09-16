/** Renders trusted SVG/HTML strings from lib/art.ts. Never pass user text here without escaping (art.ts escapes its inputs). */
export function Art({ html, className, style, as: Tag = "span" }: { html: string; className?: string; style?: React.CSSProperties; as?: "span" | "div" }) {
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
