export interface ChartPoint {
  label: string;
  value: number;
  color?: string;
}

export function BarChart({
  points,
  height = 140,
  color = 'linear-gradient(180deg,#a78bfa,#7c3aed)',
}: {
  points: ChartPoint[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="chart-bars" style={{ height }}>
      {points.map((p, i) => (
        <div className="chart-bar" key={i} title={`${p.label}: ${p.value}`}>
          <div
            className="fill"
            style={{
              height: `${Math.max(2, (p.value / max) * 100)}%`,
              background: p.color ?? color,
            }}
          />
          <div className="day">{p.label}</div>
        </div>
      ))}
    </div>
  );
}
