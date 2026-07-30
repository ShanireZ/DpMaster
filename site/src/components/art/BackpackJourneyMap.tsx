import './backpack-journey.css'

export default function BackpackJourneyMap({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`backpack-journey ${className}`.trim()}
      viewBox="0 0 1180 720"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-family-art="a"
      data-family-mode="journey"
    >
      <g className="backpack-journey__construction">
        {[220, 424, 628, 832, 1036].map((x) => <path key={x} d={`M${x} 20V690`} />)}
        {[178, 398, 618].map((y) => <path key={y} d={`M80 ${y}H1160`} />)}
        <path d="M82 664 1152 42" />
      </g>

      <g className="backpack-journey__capacity-axis">
        <path d="M72 52V658" />
        <path d="M64 178H80M64 398H80M64 618H80" />
        <text x="72" y="30" textAnchor="middle">W</text>
        <text x="58" y="182" textAnchor="end">件数</text>
        <text x="58" y="402" textAnchor="end">约束</text>
        <text x="58" y="622" textAnchor="end">目标</text>
      </g>

      <g className="backpack-journey__rails">
        <path d="M140 178H1148" />
        <path d="M140 398H1148" />
        <path d="M140 618H1148" />
        <path d="M140 178C260 84 390 84 548 178S866 270 1148 178" />
        <path d="M140 398C344 308 476 482 650 398S958 314 1148 398" />
        <path d="M140 618C388 530 598 708 840 618S1030 560 1148 618" />
      </g>

      <g className="backpack-journey__states">
        {[242, 444, 646, 848, 1050].map((x, index) => (
          <g key={x} transform={`translate(${x} ${178 - index * 7})`}>
            <path d="M-15 0 0-12 15 0 0 12Z" />
            <path d="M0-12V12M-15 0H15" />
          </g>
        ))}
        <path d="M380 368 420 338 460 368 420 398Z" />
        <path d="M780 368 820 338 860 368 820 398Z" />
        <circle cx="404" cy="618" r="16" />
        <path d="M388 618H420M404 602V634" />
      </g>
    </svg>
  )
}
