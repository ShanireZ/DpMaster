import type { PartId } from '../data/parts'

/** 每个部分的几何母题字形——映射该 DP 的结构（线/容器/弧/网格/放射树/树/比特）。 */
export default function PartGlyph({ id, size = 120 }: { id: PartId; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (id) {
    case 'a': // 递增刻度序列
      return (
        <svg {...common}>
          <path d="M12 82 H88" strokeOpacity={0.5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={20 + i * 15} y1={82} x2={20 + i * 15} y2={70 - i * 12} />
          ))}
          <path d="M20 58 L35 46 L50 34 L65 22 L80 14" strokeOpacity={0.9} />
        </svg>
      )
    case 'b': // 容器逐格填充
      return (
        <svg {...common}>
          <rect x={20} y={20} width={60} height={60} rx={6} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}${c}`}
                x={28 + c * 16}
                y={28 + r * 16}
                width={12}
                height={12}
                rx={2}
                fill={(r + c) % 2 === 0 ? 'currentColor' : 'none'}
                fillOpacity={0.5}
                strokeWidth={2}
              />
            )),
          )}
        </svg>
      )
    case 'c': // 嵌套弧
      return (
        <svg {...common}>
          <path d="M14 74 Q50 6 86 74" />
          <path d="M26 74 Q50 26 74 74" strokeOpacity={0.7} />
          <path d="M38 74 Q50 46 62 74" strokeOpacity={0.5} />
          <line x1={14} y1={74} x2={86} y2={74} strokeOpacity={0.4} />
        </svg>
      )
    case 'd': // 网格矩阵
      return (
        <svg {...common} strokeWidth={2.4}>
          <rect x={20} y={20} width={60} height={60} rx={4} />
          {[1, 2, 3].map((i) => (
            <line key={`h${i}`} x1={20} y1={20 + i * 15} x2={80} y2={20 + i * 15} strokeOpacity={0.6} />
          ))}
          {[1, 2, 3].map((i) => (
            <line key={`v${i}`} x1={20 + i * 15} y1={20} x2={20 + i * 15} y2={80} strokeOpacity={0.6} />
          ))}
          <path d="M20 20 L35 35 L50 50 L65 65 L80 80" strokeWidth={3} />
        </svg>
      )
    case 'e': // 放射树（换根）
      return (
        <svg {...common}>
          <circle cx={50} cy={50} r={8} fill="currentColor" fillOpacity={0.5} />
          {[
            [22, 24], [78, 24], [18, 66], [82, 66], [50, 86],
          ].map(([x, y], i) => (
            <g key={i}>
              <line x1={50} y1={50} x2={x} y2={y} strokeOpacity={0.7} />
              <circle cx={x} cy={y} r={6} />
            </g>
          ))}
        </svg>
      )
    case 'f': // 分叉树冠
      return (
        <svg {...common}>
          <circle cx={50} cy={18} r={7} />
          <circle cx={28} cy={52} r={7} />
          <circle cx={72} cy={52} r={7} />
          <circle cx={16} cy={84} r={6} />
          <circle cx={40} cy={84} r={6} />
          <circle cx={62} cy={84} r={6} />
          <circle cx={84} cy={84} r={6} />
          <path d="M50 25 L28 46 M50 25 L72 46 M28 59 L16 78 M28 59 L40 78 M72 59 L62 78 M72 59 L84 78" strokeOpacity={0.7} />
        </svg>
      )
    case 'g': // 比特点阵 / 立方
      return (
        <svg {...common} strokeWidth={2.6}>
          <path d="M30 34 L30 66 L58 82 L58 50 Z" strokeOpacity={0.85} />
          <path d="M30 34 L58 18 L86 34 L58 50 Z" strokeOpacity={0.6} />
          <path d="M58 50 L86 34 L86 66 L58 82 Z" strokeOpacity={0.45} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={16} cy={30 + i * 18} r={3} fill="currentColor" fillOpacity={i % 2 ? 0.2 : 0.8} />
          ))}
        </svg>
      )
  }
}
