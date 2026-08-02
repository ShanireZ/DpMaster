import { useMemo, useRef, useState } from 'react'
import { Check, ChevronsRight, Orbit, ScanLine, Split } from 'lucide-react'
import {
  DemoDetailSwitch,
  DemoTableViewport,
  DemoWorkbench,
  InstrumentRail,
  VizStateKey,
  VizStateMark,
} from '../components/demos/shared'
import { useStepPlayer } from '../components/dp-engine/playback/useStepPlayer.ts'
import type { PartId } from '../data/catalog.ts'
import './body-demo-standard.css'

const FAMILIES: ReadonlyArray<{ id: PartId; label: string; material: string }> = [
  { id: 'a', label: '背包', material: '赭金容器' },
  { id: 'b', label: '线性', material: '青绿刻度' },
  { id: 'c', label: '区间', material: '陶土拱顶' },
  { id: 'd', label: '矩阵', material: '橄榄折页' },
  { id: 'e', label: '换根', material: '灰紫轨道' },
  { id: 'f', label: '树形', material: '金褐树冠' },
  { id: 'g', label: '状压', material: '玫瑰星座' },
]

const VALUES = [4, 7, 3, 6, 2, 5]
const FRAMES = [
  { interval: [0, 5], split: 2, role: 'source' as const, note: '读取左右子区间' },
  { interval: [0, 2], split: 0, role: 'current' as const, note: '聚焦左侧短区间' },
  { interval: [1, 2], split: 1, role: 'chosen' as const, note: '确定局部最优合并' },
  { interval: [3, 5], split: 4, role: 'current' as const, note: '切换到右侧区间' },
  { interval: [0, 5], split: 2, role: 'chosen' as const, note: '合成完整区间' },
]

type ReviewChoice = {
  composition: 'spine' | 'ribbon' | 'split'
  interaction: 'approve' | 'density' | 'revisit'
  intensity: 'restrained' | 'enhanced' | 'quiet'
}

type RepresentativeReviewChoice = {
  rollout: 'approve' | 'density' | 'rework'
  intensity: 'enhanced' | 'stronger' | 'quieter'
  mobile: 'approve' | 'density' | 'family'
}

const DEFAULT_REVIEW: ReviewChoice = {
  composition: 'spine',
  interaction: 'approve',
  intensity: 'restrained',
}

const DEFAULT_REPRESENTATIVE_REVIEW: RepresentativeReviewChoice = {
  rollout: 'approve',
  intensity: 'enhanced',
  mobile: 'approve',
}

function IntervalSculpture({
  frameIndex,
  family,
}: {
  frameIndex: number
  family: PartId
}) {
  const frame = FRAMES[frameIndex] ?? FRAMES[0]
  const x = (index: number) => 76 + index * 86
  const left = x(frame.interval[0])
  const right = x(frame.interval[1])
  const split = x(frame.split)
  const span = Math.max(1, frame.interval[1] - frame.interval[0])
  const crownY = 190 - span * 23

  return (
    <div className="standard-sculpture" data-family={family}>
      <svg
        viewBox="0 0 590 310"
        role="img"
        className="standard-sculpture__desktop"
        aria-label={`区间 ${frame.interval[0] + 1} 到 ${frame.interval[1] + 1} 在分割点 ${frame.split + 1} 合并`}
      >
        <defs>
          <linearGradient id="standard-plane" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--specimen-family)" stopOpacity=".58" />
            <stop offset="1" stopColor="var(--specimen-family)" stopOpacity=".08" />
          </linearGradient>
          <pattern id="standard-settled" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 0V7" stroke="var(--viz-settled)" strokeWidth="1.2" opacity=".35" />
          </pattern>
        </defs>
        <g className="standard-sculpture__engineering" aria-hidden="true">
          <path d="M40 250H550" />
          <path d="M40 84H550" strokeDasharray="3 8" />
          <path d="M295 46V276" strokeDasharray="2 10" />
        </g>
        <path
          className="standard-sculpture__range-plane"
          d={`M${left} 228 L${split} ${crownY} L${right} 228 L${right - 18} 250 L${left + 18} 250 Z`}
          fill="url(#standard-plane)"
        />
        <path
          className="standard-sculpture__arc standard-sculpture__arc--source"
          d={`M${left} 221 Q${(left + split) / 2} ${crownY - 22} ${split} 221`}
        />
        <path
          className="standard-sculpture__arc standard-sculpture__arc--chosen"
          d={`M${split} 221 Q${(split + right) / 2} ${crownY - 38} ${right} 221`}
        />
        <path
          className="standard-sculpture__split"
          d={`M${split} ${crownY - 8}V254`}
          data-viz-role={frame.role}
        />
        {VALUES.map((value, index) => {
          const inRange = index >= frame.interval[0] && index <= frame.interval[1]
          const role = index === frame.split
            ? frame.role
            : inRange
              ? 'source'
              : 'settled'
          return (
            <g
              key={value}
              className="standard-sculpture__node"
              data-viz-role={role}
              transform={`translate(${x(index)} 238)`}
            >
              <polygon points="0,-23 21,-11 21,12 0,24 -21,12 -21,-11" />
              <text y="5">{value}</text>
              <text className="standard-sculpture__index" y="43">{index + 1}</text>
            </g>
          )
        })}
        <g className="standard-sculpture__annotation" transform={`translate(${split + 12} ${crownY - 18})`}>
          <path d="M0 0h54" />
          <text x="60" y="4">k={frame.split + 1}</text>
        </g>
      </svg>
      <div
        className="standard-sculpture__mobile"
        role="img"
        aria-label={`移动端区间 ${frame.interval[0] + 1} 到 ${frame.interval[1] + 1}，分割点 ${frame.split + 1} 沿纵向依赖脊合并`}
      >
        <span className="standard-sculpture__mobile-crown">
          <small>interval</small>
          <strong>{frame.interval[0] + 1} → {frame.interval[1] + 1}</strong>
        </span>
        <span className="standard-sculpture__mobile-rail" aria-hidden="true" />
        <ol>
          {VALUES.map((value, index) => {
            const inRange = index >= frame.interval[0] && index <= frame.interval[1]
            const role = index === frame.split
              ? frame.role
              : inRange
                ? 'source'
                : 'settled'
            return (
              <li key={value} data-viz-role={role}>
                <span>{index + 1}</span>
                <strong>{value}</strong>
                <small>{index === frame.split ? `k=${frame.split + 1}` : inRange ? 'source' : 'settled'}</small>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="standard-sculpture__readout">
        <span>dp[{frame.interval[0] + 1}][{frame.interval[1] + 1}]</span>
        <strong>{frame.note}</strong>
      </div>
    </div>
  )
}

function InstrumentTable({ frameIndex }: { frameIndex: number }) {
  const size = 9
  return (
    <DemoTableViewport label="区间 DP 状态表">
      <table className="standard-table">
        <thead>
          <tr>
            <th scope="col">l \ r</th>
            {Array.from({ length: size }, (_, index) => (
              <th scope="col" key={index}>{index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: size }, (_, row) => (
            <tr key={row}>
              <th scope="row">{row + 1}</th>
              {Array.from({ length: size }, (_, column) => {
                const invalid = column < row
                const distance = column - row
                const active = !invalid && distance === Math.min(frameIndex + 1, size - 1)
                return (
                  <td
                    key={column}
                    data-viz-role={invalid ? 'invalid' : active ? 'current' : distance < frameIndex ? 'settled' : 'source'}
                  >
                    {invalid ? '—' : distance * 7 + row + column}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </DemoTableViewport>
  )
}

export default function BodyDemoStandardPage() {
  const [family, setFamily] = useState<PartId>('c')
  const [review, setReview] = useState<ReviewChoice>(DEFAULT_REVIEW)
  const [reviewSaved, setReviewSaved] = useState(false)
  const [representativeReview, setRepresentativeReview] = useState<RepresentativeReviewChoice>(
    DEFAULT_REPRESENTATIVE_REVIEW,
  )
  const [representativeReviewSaved, setRepresentativeReviewSaved] = useState(false)
  const reviewDialog = useRef<HTMLDialogElement>(null)
  const representativeReviewDialog = useRef<HTMLDialogElement>(null)
  const player = useStepPlayer(FRAMES.length)
  const frame = FRAMES[player.index] ?? FRAMES[0]
  const activeFamily = useMemo(
    () => FAMILIES.find((candidate) => candidate.id === family) ?? FAMILIES[2],
    [family],
  )

  const saveReview = () => {
    localStorage.setItem('dpmaster:body-demo-review:v1', JSON.stringify(review))
    setReviewSaved(true)
    reviewDialog.current?.close()
  }

  const saveRepresentativeReview = () => {
    localStorage.setItem(
      'dpmaster:representative-demo-review:v1',
      JSON.stringify(representativeReview),
    )
    setRepresentativeReviewSaved(true)
    representativeReviewDialog.current?.close()
  }

  return (
    <div className="body-standard-page">
      <dialog
        ref={reviewDialog}
        className="standard-review"
        aria-labelledby="standard-review-title"
        onCancel={() => reviewDialog.current?.close()}
      >
        <form method="dialog" onSubmit={saveReview}>
          <header>
            <span>Review gate 01 · no countdown</span>
            <h2 id="standard-review-title">正文视觉第一轮拍板</h2>
            <p>页面下方是三组真实对比与可运行组件。确认后才进入 14 门代表课程。</p>
          </header>

          <fieldset>
            <legend>01 / 主构图骨架</legend>
            {([
              ['spine', '纵向仪表脊', '推荐 · 跨 37 课与移动端最稳定'],
              ['ribbon', '横向观测带', '宽幅轨迹更强，移动端重排成本更高'],
              ['split', '双轨剖面', '技术密度最高，需要更多细节切换'],
            ] as const).map(([value, label, note]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="composition"
                  value={value}
                  checked={review.composition === value}
                  onChange={() => setReview((current) => ({ ...current, composition: value }))}
                />
                <strong>{label}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>02 / 公共交互合同</legend>
            {([
              ['approve', '整体确认', '44px 工具轨、五态双编码、局部滚动、移动重排、主题同几何'],
              ['density', '先调整密度', '保留规则，先降低工具或状态信息密度'],
              ['revisit', '需要逐项重议', '把五类规则拆开并继续提供对比图'],
            ] as const).map(([value, label, note]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="interaction"
                  value={value}
                  checked={review.interaction === value}
                  onChange={() => setReview((current) => ({ ...current, interaction: value }))}
                />
                <strong>{label}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>03 / 视觉力度</legend>
            {([
              ['restrained', '当前克制档', '推荐 · 雕塑承载语义，完成态仅一次演绎'],
              ['enhanced', '增强演绎档', '提高材质、亮边和完成态动画存在感'],
              ['quiet', '更安静档', '进一步收敛色场和动效'],
            ] as const).map(([value, label, note]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="intensity"
                  value={value}
                  checked={review.intensity === value}
                  onChange={() => setReview((current) => ({ ...current, intensity: value }))}
                />
                <strong>{label}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>

          <footer>
            <button type="button" onClick={() => reviewDialog.current?.close()}>继续查看标本</button>
            <button type="submit">保存本轮拍板</button>
          </footer>
        </form>
      </dialog>

      <dialog
        ref={representativeReviewDialog}
        className="standard-review"
        aria-labelledby="representative-review-title"
        onCancel={() => representativeReviewDialog.current?.close()}
      >
        <form method="dialog" onSubmit={saveRepresentativeReview}>
          <header>
            <span>Review gate 02 · approved 2026-08-02</span>
            <h2 id="representative-review-title">代表课程评审归档</h2>
            <p>
              A–G 共 14 门代表课程已通过高保真方向评审，仪器壳层已推广到全部 37 课。
              下方入口与选项仅保留为可复核记录。
            </p>
            <nav className="standard-review__routes" aria-label="代表课程快速入口">
              <a href="/part/a/01">A · 01</a>
              <a href="/part/a/dep">A · 依赖</a>
              <a href="/part/b/lcs">B · LCS</a>
              <a href="/part/b/fsm">B · 状态机</a>
              <a href="/part/c/stone">C · 石子</a>
              <a href="/part/c/ring">C · 环形</a>
              <a href="/part/d/grid">D · 网格</a>
              <a href="/part/d/matpow">D · 矩阵幂</a>
              <a href="/part/e/basic">E · 基础</a>
              <a href="/part/e/distsum">E · 距离和</a>
              <a href="/part/f/knapsack">F · 树背包</a>
              <a href="/part/f/cover">F · 覆盖</a>
              <a href="/part/g/board">G · 棋盘</a>
              <a href="/part/g/plug">G · 插头 DP</a>
            </nav>
          </header>

          <fieldset>
            <legend>01 / 归档结论</legend>
            {([
              ['approve', '确认推广', '推荐 · 将仪器骨架推广至全部 37 课'],
              ['density', '先调信息密度', '保留方向，先调整标题、轨道或状态密度'],
              ['rework', '重新设计', '暂停推广，回到代表课程重做'],
            ] as const).map(([value, label, note]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="rollout"
                  value={value}
                  checked={representativeReview.rollout === value}
                  onChange={() => setRepresentativeReview((current) => ({ ...current, rollout: value }))}
                />
                <strong>{label}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>02 / 增强演绎力度</legend>
            {([
              ['enhanced', '保持当前增强档', '推荐 · 亮边、矿材与完成态有存在感但不喧宾夺主'],
              ['stronger', '继续增强', '提高完成态和材质响应强度'],
              ['quieter', '适当收敛', '减少色场与动画对正文的竞争'],
            ] as const).map(([value, label, note]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="representative-intensity"
                  value={value}
                  checked={representativeReview.intensity === value}
                  onChange={() => setRepresentativeReview((current) => ({ ...current, intensity: value }))}
                />
                <strong>{label}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>03 / 移动端语义重排</legend>
            {([
              ['approve', '确认当前规则', '推荐 · 主状态脊常驻，表格、轨迹与解释原位切换'],
              ['density', '降低移动密度', '保留语义结构，减少同屏辅助信息'],
              ['family', '逐家族再审', '暂停全量推广，逐个家族确认移动构图'],
            ] as const).map(([value, label, note]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="mobile"
                  value={value}
                  checked={representativeReview.mobile === value}
                  onChange={() => setRepresentativeReview((current) => ({ ...current, mobile: value }))}
                />
                <strong>{label}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>

          <footer>
            <button type="button" onClick={() => representativeReviewDialog.current?.close()}>
              继续查看课程
            </button>
            <button type="submit">更新评审记录</button>
          </footer>
        </form>
      </dialog>

      <header className="body-standard-hero">
        <span className="body-standard-hero__kicker">Internal standard specimen · noindex</span>
        <h1>正文算法仪器标本场</h1>
        <p>
          同一套状态、工具和响应骨架，承载七种不同矿材。这里展示的是可运行组件，
          不是与产品脱节的效果图。
        </p>
      </header>

      <section className="standard-directions" aria-labelledby="standard-directions-title">
        <div className="standard-section-heading">
          <span>01 / composition</span>
          <h2 id="standard-directions-title">同一母题的三种构图密度</h2>
        </div>
        <div className="standard-direction-grid">
          <article className="standard-direction standard-direction--spine">
            <span className="standard-direction__flag">推荐</span>
            <ScanLine aria-hidden="true" />
            <h3>纵向仪表脊</h3>
            <p>索引轴贯穿标题、主雕塑和工具轨；阅读方向稳定，适合 37 课推广。</p>
            <span className="standard-direction__diagram" aria-hidden="true">
              <i /><i /><i />
            </span>
          </article>
          <article className="standard-direction standard-direction--ribbon">
            <Orbit aria-hidden="true" />
            <h3>横向观测带</h3>
            <p>主对象更宽、轨迹更强；适合线性与区间，但密集矩阵在移动端会变薄。</p>
            <span className="standard-direction__diagram" aria-hidden="true">
              <i /><i /><i />
            </span>
          </article>
          <article className="standard-direction standard-direction--split">
            <Split aria-hidden="true" />
            <h3>双轨剖面</h3>
            <p>主视觉与表格并行，技术感最强；信息密度也最高，需更频繁的细节切换。</p>
            <span className="standard-direction__diagram" aria-hidden="true">
              <i /><i /><i />
            </span>
          </article>
        </div>
      </section>

      <section className="standard-materials" aria-labelledby="standard-materials-title">
        <div className="standard-section-heading">
          <span>02 / material dialects</span>
          <h2 id="standard-materials-title">同一工坊，不同矿材</h2>
        </div>
        <div className="standard-materials__rail" role="group" aria-label="切换家族材质">
          {FAMILIES.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              data-family={candidate.id}
              aria-pressed={family === candidate.id}
              onClick={() => setFamily(candidate.id)}
            >
              <span>{candidate.id.toUpperCase()}</span>
              <strong>{candidate.label}</strong>
              <small>{candidate.material}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="standard-live" aria-labelledby="standard-live-title">
        <div className="standard-section-heading">
          <span>03 / live contract</span>
          <h2 id="standard-live-title">真实共享组件</h2>
        </div>
        <DemoWorkbench
          family={family}
          title={`${activeFamily.label} · 连续算法主构图`}
          description="切面只表达状态依赖、分割与合并；工程线退居负空间，工具轨与主对象共享一条几何基线。"
          activeRole={frame.role}
          complete={player.index === FRAMES.length - 1}
          status={(
            <>
              <VizStateMark role={frame.role}>{frame.note}</VizStateMark>
              <span>{player.index + 1} / {FRAMES.length}</span>
            </>
          )}
          visual={<IntervalSculpture frameIndex={player.index} family={family} />}
          rail={(
            <InstrumentRail
              player={player}
              defaultSecondaryOpen
              secondary={(
                <div className="standard-parameters">
                  <label>
                    合并目标
                    <select defaultValue="min">
                      <option value="min">最小代价</option>
                      <option value="max">最大代价</option>
                    </select>
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    显示依赖弧
                  </label>
                  <span>完成态仅演绎一次；reduced-motion 直接呈现结果。</span>
                </div>
              )}
            />
          )}
          details={(
            <DemoDetailSwitch
              initialItem="states"
              items={[
                {
                  id: 'states',
                  label: '状态',
                  content: <VizStateKey />,
                },
                {
                  id: 'table',
                  label: '表格',
                  content: <InstrumentTable frameIndex={player.index} />,
                },
                {
                  id: 'trace',
                  label: '轨迹',
                  content: (
                    <ol className="standard-trace">
                      {FRAMES.map((candidate, index) => (
                        <li key={candidate.note} data-active={index === player.index ? 'true' : 'false'}>
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          {candidate.note}
                          {index < player.index && <Check size={14} aria-label="已完成" />}
                        </li>
                      ))}
                    </ol>
                  ),
                },
              ]}
            />
          )}
        />
      </section>

      <footer className="body-standard-footer">
        <ChevronsRight aria-hidden="true" />
        <p>
          {representativeReviewSaved
            ? '代表课程评审记录已更新。'
            : reviewSaved
              ? '第一轮评审记录已更新；代表课程与 37 课推广均已通过。'
              : 'Task B 已完成；本页保留两轮设计评审与可运行标本。'}
        </p>
        <button
          type="button"
          onClick={() => {
            const firstReviewSaved = localStorage.getItem('dpmaster:body-demo-review:v1')
            const target = firstReviewSaved ? representativeReviewDialog.current : reviewDialog.current
            if (target && !target.open) target.showModal()
          }}
        >
          打开评审归档
        </button>
      </footer>
    </div>
  )
}
