/**
 * A rating shown as five stars. The stars are decoration; the label carries
 * the value for screen readers ("4 out of 5"), so meaning never rests on
 * the glyphs or their colour alone.
 */
export function StarRating({ value, label }: { value: number; label: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="star-rating" role="img" aria-label={label}>
      <span aria-hidden="true">{'★'.repeat(filled)}</span>
      <span aria-hidden="true" className="star-rating-empty">
        {'★'.repeat(5 - filled)}
      </span>
    </span>
  );
}
