import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { M, MB } from '../components/ui/Math'
import InfoBox from '../components/ui/InfoBox'
import CodeBlock from '../components/ui/CodeBlock'
import { PARTS } from '../data/catalog'
import './typepage.css'
import './about.css'

const CODE_MEMO = `
int f[N];                 // 备忘录，-1 表示"尚未计算"
bool vis[N];

int dp(int s)             // 求状态 s 的答案
{
    if (vis[s]) return f[s];        // 算过就直接查表，绝不重算
    vis[s] = true;
    int res = BASE;                 // 边界 / 初值
    for (auto &d : decisions(s))    // 枚举"最后一步"的决策
        res = max(res, dp(prev(s, d)) + cost(d));
    return f[s] = res;
}`

const CODE_ROLL = `
// 01 背包压成一维：f[j] = 容量恰为 j 时的最大价值
int f[M + 1] = {0};
for (int i = 1; i <= n; i++)
    for (int j = m; j >= w[i]; j--)        // ★逆推：先算大 j
        f[j] = max(f[j], f[j - w[i]] + v[i]);

// 完全背包：同一段转移，内层改成正推即可（每件可无限取）
// for (int j = w[i]; j <= m; j++) ...`

export default function MethodPage() {
  return (
    <article className="typepage">
      <header className="typehead">
        <span className="typehead__eyebrow">
          <span className="typehead__code">
            <Sparkles size={14} />
          </span>
          DP大师 · 总纲
        </span>
        <h1>动态规划 · 通用方法论</h1>
        <p className="typehead__blurb">
          先把框架立起来，再进七大家族——学会用一张逐格填写的表，装下指数级的搜索。
        </p>
      </header>

      <section className="lesson">
        <h2 className="section-title">动态规划在做什么</h2>
        <div className="prose">
          <p>
            一句话：把一个大问题拆成许多<strong>重叠的子问题</strong>，每个子问题只算一次、把答案记下来，
            后面遇到就直接查表。它介于两种极端之间——<strong>暴力搜索</strong>把所有可能都试一遍（常是 <M>{'2^n'}</M> 或 <M>{'n!'}</M> 级），
            <strong>贪心</strong>每步只顾眼前最优（快，但常常错）。DP 用「记忆」换「重复」，把暴力的指数压成多项式，又比贪心稳。
          </p>
          <p>
            所以判断一道题「能不能 DP」，本质是问三件事：子问题的最优<strong>能不能拼出</strong>大问题的最优？
            一个局面定下来后，<strong>还需不需要回头</strong>看它是怎么来的？这些子问题<strong>会不会反复出现</strong>？
            三个「是」，就是下面的三个前提。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">能用 DP 的三个前提</h2>
        <InfoBox kind="key" title="① 最优子结构">
          大问题的最优解，由它<strong>子问题的最优解</strong>拼成。比如「前 <M>{'i'}</M> 件、容量 <M>{'j'}</M> 的最优」，
          一定建立在「前 <M>{'i-1'}</M> 件」的最优之上——否则把更优的子解换进来，整体还能更优，矛盾。
        </InfoBox>
        <InfoBox kind="key" title="② 无后效性">
          一个状态一旦确定，<strong>后续决策只看这个状态本身</strong>，与「它是经由哪条路径到达的」无关。
          这让我们可以只记状态、不记历史。若「怎么来的」会影响未来，就得把那部分信息<strong>补进状态维度</strong>里。
        </InfoBox>
        <InfoBox kind="key" title="③ 重叠子问题">
          同一个子问题会被<strong>反复用到</strong>。正因为重叠，「算一次、记下来」才划算——这也是 DP 区别于分治的地方
          （分治的子问题通常互不相交）。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">解一道 DP，就这五步</h2>
        <div className="prose">
          <p>拿到题别急着写循环，按这五步想清楚，代码几乎是抄出来的：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>定状态。</b>用最少的维度，把「当前局面」不重不漏地描述出来。问自己：<strong>有几样东西在变？</strong>
              每样就是一维。<M>{'dp[\\cdots]'}</M> 的含义要一句话说得清（例：以 <M>{'i'}</M> 结尾的最长上升子序列长度）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>写转移。</b>盯住<strong>最后一步决策</strong>：当前状态是从哪些更小的状态、付出什么代价得到的？把它们取 <M>{'\\max/\\min/\\sum'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>定边界与初值。</b>最小的子问题答案是什么？没被转移覆盖的格子要手动填对（求最大常填 <M>{'0'}</M> 或 <M>{'-\\infty'}</M>，计数填 <M>{'0'}</M> 而起点填 <M>{'1'}</M>）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">4</span>
            <div className="step__b">
              <b>定递推顺序。</b>保证算 <M>{'dp[x]'}</M> 之前，它依赖的子状态<strong>都已算好</strong>——见下一节。
            </div>
          </div>
          <div className="step">
            <span className="step__n">5</span>
            <div className="step__b">
              <b>取答案。</b>答案未必是最后一格，可能是<strong>某一维的最值</strong>（如 LIS 取 <M>{'\\max_i dp[i]'}</M>）。想清楚要读哪个/哪些格子。
            </div>
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态：DP 的灵魂</h2>
        <div className="prose">
          <p>
            九成的 DP，难在<strong>状态怎么定</strong>，而非转移。维度 = 有几个「限制/进度」在同时变化：
            背包是「考虑到第几件」×「用了多少容量」，于是 <M>{'f[i][j]'}</M>；区间 DP 是「左右端点」，于是 <M>{'f[l][r]'}</M>；
            树形 DP 是「以谁为根的子树」×「选没选它」，于是 <M>{'f[u][0/1]'}</M>。
          </p>
          <p>
            两条经验：状态要<strong>刚好够用</strong>——少一维会漏信息（无后效性被破坏），多一维会白白拖慢；
            当「怎么来的」影响未来时，<strong>把它编码进状态</strong>（比如上一步选了什么、当前奇偶、集合用二进制压成一个整数）。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">转移：从子问题推当前</h2>
        <div className="prose">
          <p>写转移的通用姿势，是枚举<strong>「最后一步」</strong>的所有可能决策，在对应的更小状态上取最优：</p>
          <MB>{'dp[s]=\\operatorname*{opt}_{s\\,\\leftarrow\\,s\'}\\big(\\,dp[s\']+\\text{cost}(s\'\\to s)\\,\\big)'}</MB>
          <p>
            这里 <M>{'\\text{opt}'}</M> 按题意是 <M>{'\\max'}</M>、<M>{'\\min'}</M> 或求和 <M>{'\\sum'}</M>（计数）。
            把「最优」换成「累加」，最优 DP 就变成<strong>计数 DP</strong>；同一套状态与转移骨架，常能一题多吃。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">递推顺序：先算谁</h2>
        <div className="prose">
          <p>
            <strong>铁律：算 <M>{'dp[x]'}</M> 前，它依赖的每个子状态必须都已经算好。</strong>顺序错了，你读到的是没填好的空格。三种常见姿势：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">→</span>
            <div className="step__b">
              <b>按维度顺推。</b>线性 DP 从小到大扫下标；区间 DP 按<strong>区间长度</strong>从短到长（短区间先算，长区间才能用）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">↑</span>
            <div className="step__b">
              <b>后序遍历。</b>树形 DP 自底向上——先把所有孩子的子树算完，再合并到父亲。
            </div>
          </div>
          <div className="step">
            <span className="step__n">↺</span>
            <div className="step__b">
              <b>记忆化搜索。</b>懒得推顺序？写成递归 + 备忘录，让递归调用<strong>天然</strong>保证「依赖先算」——它就是自顶向下的 DP。
            </div>
          </div>
        </div>
        <CodeBlock title="记忆化搜索 · 通用模板" code={CODE_MEMO} />
        <InfoBox kind="key" title="记忆化 = 自顶向下的 DP">
          递推是「自底向上」填表，记忆化是「自顶向下」递归 + 缓存。两者算的是同一批状态、同一个转移，只是<strong>谁先谁后</strong>的组织方式不同。状态空间稀疏、或顺序难推时，记忆化往往更好写。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">空间优化：把一维滚掉</h2>
        <div className="prose">
          <p>
            当 <M>{'dp[i][\\cdot]'}</M> 只依赖 <M>{'dp[i-1][\\cdot]'}</M>，就没必要保留所有行——用一维数组<strong>就地更新</strong>，空间从 <M>{'O(nm)'}</M> 降到 <M>{'O(m)'}</M>。
          </p>
        </div>
        <CodeBlock title="滚动数组 · 01 背包一维" code={CODE_ROLL} />
        <InfoBox kind="warn" title="降维后，循环方向决定物种">
          压成一维后，正 / 逆序决定你读到的是「上一层的旧值」还是「本层已更新的新值」：01 背包<strong>逆推</strong>（每件至多一次），
          完全背包<strong>正推</strong>（每件无限次）。<strong>同一段转移，方向反了就是另一道题。</strong>
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">调试与常见陷阱</h2>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>打印整张表。</b>DP 错了先别改代码，把 <M>{'dp'}</M> 数组打出来逐格对照手算——错在哪一格，一眼看见。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>对拍。</b>写个 <M>{'O(2^n)'}</M> 暴力，用小数据随机对拍 DP，最快揪出转移或边界的偏差。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>初值与边界。</b>「求最大」忘了把不可达状态设成 <M>{'-\\infty'}</M>、计数忘了 <M>{'dp[0]=1'}</M>，是最高频的错。
            </div>
          </div>
          <div className="step">
            <span className="step__n">4</span>
            <div className="step__b">
              <b>溢出与越界。</b>方案数、代价和很容易爆 <code>int</code>，果断上 <code>long long</code>；一维逆推注意 <M>{'j\\ge w_i'}</M> 的下界。
            </div>
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">七大家族速览</h2>
        <div className="prose">
          <p>框架立好了，就进具体家族。每个家族其实是一类<strong>状态设计的范式</strong>——认出题目属于哪一类，状态怎么定就有了模板：</p>
        </div>
        <div className="about-parts" style={{ marginTop: 'var(--sp-5)' }}>
          {PARTS.map((p) => (
            <Link
              to={`/part/${p.id}`}
              key={p.id}
              className="about-part"
              style={{ ['--pg']: `var(--grad-${p.id})` } as CSSProperties}
            >
              <span className="about-part__code">{p.code}</span>
              <span className="about-part__title">{p.title}</span>
              <span className="about-part__n">{p.types.length}</span>
            </Link>
          ))}
        </div>
      </section>

      <nav className="type-nav">
        <span />
        <Link to="/part/a/01" className="next">
          <span className="dir">开始第一题 →</span>
          <span className="nm">
            01 背包 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </article>
  )
}
