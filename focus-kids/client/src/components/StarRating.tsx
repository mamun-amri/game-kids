export function StarRating({
  value,
  max = 3,
  size = 46,
}: {
  value: number;
  max?: number;
  size?: number;
}) {
  return (
    <div className="stars-row" aria-label={`${value} dari ${max} bintang`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? '' : 'off'} style={{ fontSize: size }}>
          ⭐
        </span>
      ))}
    </div>
  );
}
