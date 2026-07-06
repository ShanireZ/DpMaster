import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ShaderField from '../components/notfound/ShaderField'
import GridSolver from '../components/notfound/GridSolver'
import './notfound.css'

/**
 * 404 · 越界的状态。
 * 把「页面不存在」双关成 DP 的「状态不可达」。
 * 背景 WebGL 流场 + Canvas DP 填表与断裂路径（往返播放：正放填表→断裂→倒放收回）。
 */
export default function NotFound() {
  return (
    <div className="nf">
      <ShaderField />
      <GridSolver />

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

        <p className="nf__desc">你请求的状态不在 DP 表的可达集合里。</p>

        <div className="nf__cta">
          <Link to="/" className="nf-btn nf-btn--primary">
            <ArrowLeft size={18} /> 回到 dp[0][0]
          </Link>
        </div>
      </div>
    </div>
  )
}
