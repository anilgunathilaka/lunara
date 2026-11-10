/**
 * The facts beneath the hero banner as sliding words (docs/2-ui.md §7.2;
 * founder decision 2026-11-10, after secchiariboots.com): one row set large
 * in the display face, drifting on its own and sliding further as the page
 * scrolls. All CSS: no script, nothing to load.
 *
 * The moving row is decoration (aria-hidden); the facts are read once,
 * from a list for screen readers. Under prefers-reduced-motion it stands still.
 */
export function FactMarquee({ facts }: { facts: string[] }) {
  // The row is two equal halves; drifting by one half loops without a seam.
  const row = (repeats: number) => (
    <div className="fact-marquee-row fact-marquee-large" aria-hidden="true">
      <div className="fact-marquee-shift">
        <div className="fact-marquee-track">
          {[0, 1].map((half) => (
            <span key={half} className="fact-marquee-half">
              {Array.from({ length: repeats }, (_, set) =>
                facts.map((fact, i) => (
                  <span key={`${set}-${i}`} className="fact-marquee-word">
                    {fact}
                  </span>
                )),
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fact-marquee">
      <ul className="sr-only">
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      {row(2)}
    </div>
  );
}
