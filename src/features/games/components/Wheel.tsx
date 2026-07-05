const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = SIZE / 2 - 4

export interface WheelSlice {
  key: string
  label: string
  color: string
}

// Polar coordinates with 0deg = 12 o'clock, increasing clockwise — matches
// how the rotation math in the calling route reasons about slice angles.
function point(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function slicePath(startAngle: number, endAngle: number): string {
  const start = point(startAngle, RADIUS)
  const end = point(endAngle, RADIUS)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

export function Wheel({
  slices,
  rotation,
  highlightKey,
}: {
  slices: WheelSlice[]
  rotation: number
  // While set, all slices except this one dim — used for the "landed"
  // moment right after the spin settles.
  highlightKey?: string | null
}) {
  const sliceAngle = 360 / slices.length

  return (
    <div
      className="relative mx-auto overflow-hidden"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* Pointer — fixed at 12 o'clock, outside the rotating wheel */}
      <div
        className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1"
        style={{
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: '16px solid hsl(var(--foreground))',
        }}
      />
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 3.2s cubic-bezier(0.17, 0.67, 0.1, 0.99)',
        }}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 2}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
        />
        {slices.map((slice, i) => {
          const start = i * sliceAngle
          const end = start + sliceAngle
          const mid = start + sliceAngle / 2
          const labelPos = point(mid, RADIUS * 0.62)
          const dimmed = highlightKey != null && highlightKey !== slice.key
          return (
            <g key={`${slice.key}-${i}`}>
              <path
                d={slicePath(start, end)}
                fill={slice.color}
                fillOpacity={dimmed ? 0.25 : 0.85}
                stroke="hsl(var(--card))"
                strokeWidth={2}
                style={{ transition: 'fill-opacity 0.4s ease' }}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--background))"
                fontSize={14}
                fontWeight={600}
                opacity={dimmed ? 0.5 : 1}
                transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
              >
                {slice.label}
              </text>
            </g>
          )
        })}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={22}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
        />
      </svg>
    </div>
  )
}
