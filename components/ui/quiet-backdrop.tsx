/**
 * A very small amount of something, for the pages that are deliberately not
 * marketing surfaces.
 *
 * The funnel, the report and the login are documents: they get no shader, no
 * streak, and no floating CTA, which left them as flat black. This gives them a
 * horizon instead. Two layers, both fixed so they stay put while a long form
 * scrolls past, and both quiet enough that you notice the page has a top rather
 * than noticing the effect.
 *
 * Nothing here is new vocabulary. The ruled grid is the one already under
 * CTASection and the purple wash is the same radial used at the top of half the
 * marketing sections, just fainter. Inventing a third background idea for these
 * pages is how a site starts looking assembled rather than designed.
 *
 * Sits at z-0, so the page's own content needs to be z-10 above it.
 */
export function QuietBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {/* Ruled grid, fading out before the first fold so the page does not read
          as graph paper all the way down. */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "linear-gradient(to bottom, #000 0%, transparent 58%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 58%)",
        }}
      />

      {/* One accent bloom, anchored above the top edge so only its lower half
          is ever on screen and it never resolves into a visible ellipse. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 45% at 50% -8%, rgba(124,92,252,0.10) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}
