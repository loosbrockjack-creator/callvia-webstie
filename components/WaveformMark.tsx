interface WaveformMarkProps {
  size?: number;
  animated?: boolean;
  className?: string;
  opacity?: number;
}

export function WaveformMark({
  size = 40,
  animated = false,
  className = "",
  opacity = 1,
}: WaveformMarkProps) {
  // Larger viewBox gives more room — bars stay thin even at big display sizes
  const viewW = 400;
  const viewH = 400;
  const barW = 5;
  const gap = 10;

  // 13 bars: more spread, thinner silhouette, symmetric diamond
  const barHeights = [22, 44, 72, 104, 138, 176, 210, 176, 138, 104, 72, 44, 22];

  const totalW = barHeights.length * barW + (barHeights.length - 1) * gap;
  const xOffset = (viewW - totalW) / 2;
  const centerY = viewH / 2;

  const getGradient = (i: number, uid: string) => {
    if (i <= 1 || i >= 11) return `url(#grad-outer-${uid})`;
    if (i <= 3 || i >= 9)  return `url(#grad-mid-${uid})`;
    return `url(#grad-inner-${uid})`;
  };

  const uid = animated ? "a" : "s";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewW} ${viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-outer-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7744cc" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#3322aa" stopOpacity="1" />
          <stop offset="100%" stopColor="#1a1a7e" stopOpacity="1" />
        </linearGradient>

        <linearGradient id={`grad-mid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#aa88ff" stopOpacity="1" />
          <stop offset="50%" stopColor="#5544dd" stopOpacity="1" />
          <stop offset="100%" stopColor="#2233bb" stopOpacity="1" />
        </linearGradient>

        <linearGradient id={`grad-inner-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ddeeff" stopOpacity="1" />
          <stop offset="25%" stopColor="#aabbff" stopOpacity="1" />
          <stop offset="60%" stopColor="#6677ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#3344ee" stopOpacity="1" />
        </linearGradient>
      </defs>

      {barHeights.map((h, i) => {
        const x = xOffset + i * (barW + gap);
        const y = centerY - h / 2;

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={3}
            ry={3}
            fill={getGradient(i, uid)}
            className={animated ? "waveform-bar" : undefined}
            style={
              animated
                ? { animation: `waveBar 1.9s ease-in-out ${(i * 0.1).toFixed(1)}s infinite` }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
