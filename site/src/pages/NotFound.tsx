import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCw, Compass } from 'lucide-react'
import ShaderField from '../components/notfound/ShaderField'
import GridSolver from '../components/notfound/GridSolver'
import './notfound.css'

/**
 * 404 · 越界的状态。
 * 把「页面不存在」双关成 DP 的「状态不可达 / 越界下标 / 最优值退化为 −∞」。
 * 背景 WebGL 流场 + Canvas DP 填表与断裂路径，文案给出返回起点的转移。
 */
export default function NotFound() {
  const [replay, setReplay] = useState(0)

  return (
    <div className="nf">
      <ShaderField />
      <GridSolver replayKey={replay} />

      <div className="nf__stage">
        <span className="nf__badge">HTTP 404 · Out of Bounds</span>

        <div className="nf__code" aria-hidden="true">
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>

        <div className="nf__eq" aria-hidden="true">
          <span>
            <i>f</i>[<i>page</i>]&nbsp;=&nbsp;<b>−∞</b>
          </span>
          <span>
            <i>state</i>&nbsp;∉&nbsp;reachable
          </span>
        </div>

        <h1 className="nf__title">状态不可达 · 页面越界</h1>

        <p className="nf__desc">
          你请求的状态不在 DP 表的可达集合里——就像越界的下标 <code>dp[i][j]</code>，
          没有转移方程能抵达这里，最优值退化为 <b>−∞</b>。退回起点，重新规划一条路径。
        </p>

        <div className="nf__cta">
          <Link to="/" className="nf-btn nf-btn--primary">
            <ArrowLeft size={18} /> 回到 dp[0][0]
          </Link>
          <Link to="/part/a/01" className="nf-btn nf-btn--ghost">
            <Compass size={18} /> 从 01 背包开始
          </Link>
          <button
            type="button"
            className="nf-btn nf-btn--replay"
            onClick={() => setReplay((v) => v + 1)}
          >
            <RotateCw size={16} /> 重新规划路径
          </button>
        </div>
      </div>
    </div>
  )
}
