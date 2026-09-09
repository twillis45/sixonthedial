/**
 * The scroll container every page that is not the game needs.
 *
 * THE BUG THIS FIXES SHIPPED, AND IT SHIPPED ON THE ONE PAGE BOTH APP STORES
 * REQUIRE. `globals.css` sets `body { position: fixed; inset: 0; overflow:
 * hidden }` — correct and load-bearing for the game, which is a fixed board
 * that must never rubber-band under a thumb, and which several guards
 * (check-rail, check-tiles) measure on that assumption.
 *
 * It applies to every route. So /privacy, /terms, /support and /press rendered
 * their full height inside a viewport-sized clip with no scroller anywhere:
 * measured on a 390x844 phone, /privacy is 1546px of content of which 844 could
 * be read, and nothing — wheel, drag or keyboard — moved it. A privacy policy
 * that cannot be scrolled is not a published privacy policy, and both stores
 * open that URL during review.
 *
 * Nothing caught it because nothing looked. Every runtime check in this repo
 * drives `/`, which is the one route where the fixed body is right.
 *
 * The fix is deliberately local rather than clever. Unsetting the body rule for
 * these routes would mean either a `:has()` selector keyed on game markup or a
 * class written onto <body> from a nested layout, and both put the game's
 * scroll behaviour at the mercy of a rule about the legal pages. An absolutely
 * positioned scroller inside the fixed body changes nothing about the game and
 * cannot be undone by a future edit to it.
 *
 * `npm run check:pages` asserts every one of these routes can reach the bottom
 * of its own content, and fails if a new route ships without a scroller.
 */
export default function PageScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-page-scroll=""
      className="absolute inset-0 overflow-y-auto overscroll-contain"
    >
      {children}
    </div>
  );
}
