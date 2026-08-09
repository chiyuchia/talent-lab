export function BarGradientDefs({ id = "barGradient" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
        <stop offset="100%" stopColor="hsl(var(--primary-deep))" stopOpacity={0.85} />
      </linearGradient>
    </defs>
  );
}
