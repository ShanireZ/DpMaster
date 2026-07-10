import { Link } from 'react-router-dom'
import { MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import StoneMergeDemo from '../../components/demos/interval/StoneMergeDemo'
import StoneMinMaxDemo from '../../components/demos/interval/StoneMinMaxDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { MergeSetupFigure, IntervalSplitFigure, LengthOrderFigure } from './StoneMergeArt'

const CODE_P1880 = `
#include <iostream>
#include <cstring>
using namespace std;

const int INF = 0x3f3f3f3f;
int a[105];                   // 链形基底：n 堆石子（环形拆解留到下一节）
int pre[105];                 // 前缀和，sum(l..r) = pre[r] - pre[l-1]
int f[105][105];             // 最小合并代价
int g[105][105];             // 最大合并代价

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        pre[i] = pre[i - 1] + a[i];
    }

    for (int len = 2; len <= n; len++)          // ★外层枚举区间长度，由短到长
        for (int l = 1; l + len - 1 <= n; l++)
        {
            int r = l + len - 1;
            int s = pre[r] - pre[l - 1];        // 本区间合并的代价（区间和）
            f[l][r] = INF;
            g[l][r] = -INF;
            for (int k = l; k <= r - 1; k++)    // 枚举分割点 k
            {
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s);
                g[l][r] = max(g[l][r], g[l][k] + g[k + 1][r] + s);
            }
        }

    cout << f[1][n] << endl;                     // 一题双问：最小、最大
    cout << g[1][n] << endl;
    return 0;
}`

const CODE_P5019 = `
#include <iostream>
using namespace std;

int main()
{
    int n;
    cin >> n;
    long long ans = 0;
    int prev = 0;                                // 上一格的高度（差分视角）
    for (int i = 1; i <= n; i++)
    {
        int h;
        cin >> h;
        if (h > prev)                            // 只在“抬高”处付出铺设次数
            ans += h - prev;
        prev = h;
    }
    cout << ans << endl;
    return 0;
}`

export default function StoneMerge() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">把相邻的石子并成一堆</h2>
        <div className="prose">
          <p>
            先看一个具体场景：一排摆着 <strong>4 堆</strong>石子，数目依次是 <M>{'7,\\ 6,\\ 5,\\ 4'}</M>。
            每次只能挑<strong>相邻的两堆</strong>并成一堆，代价是<strong>这两堆石子数之和</strong>。不断合并，直到剩下唯一一堆——不同的合并顺序，累计代价不同，问<strong>最小总代价</strong>。
          </p>
        </div>
        <figure className="figure">
          <MergeSetupFigure />
          <figcaption className="figure__cap">4 堆石子排成一排，只能合并相邻两堆；合并第 1、2 堆（6 与 5）付出代价 11。</figcaption>
        </figure>
        <div className="prose">
          <p>
            第一反应也许是<strong>贪心</strong>：每次挑当前最小的相邻两堆并。可这在石子合并里<strong>并不总对</strong>——因为一堆石子会<strong>反复参与</strong>后续每一次合并，早并的堆，其石子数会被后面一次次重复计入代价。此刻看着便宜的一步，可能把某堆抬进后续昂贵的合并里。
            这是个<strong>牵一发动全身</strong>的全局问题。
          </p>
          <p>
            那把「先合哪对、再合哪对」的所有顺序都枚举一遍？<M>{'n'}</M> 堆的合并顺序数量随 <M>{'n'}</M> <strong>指数爆炸</strong>，不可行。
            但换个角度：无论怎么合，<strong>最后一步</strong>一定是把某个<strong>连续区间</strong>的左半与右半两堆并起来。于是问题天然带上了<strong>区间</strong>的结构——这正是区间 DP 的入口。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：枚举最后一次合并的分割点</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[l][r]'}</M> 表示：把第 <M>{'l'}</M> 堆到第 <M>{'r'}</M> 堆这段<strong>连续区间</strong>合并成<strong>一堆</strong>所需的最小代价。
            要把 <M>{'[l,r]'}</M> 合成一堆，<strong>最后一次合并</strong>必然是把某个<strong>分割点 <M>{'k'}</M></strong> 左边的 <M>{'[l,k]'}</M>（已合成一堆）与右边的 <M>{'[k+1,r]'}</M>（也已合成一堆）并起来。
          </p>
        </div>
        <figure className="figure">
          <IntervalSplitFigure />
          <figcaption className="figure__cap">dp[l][r] 枚举分割点 k：左半 dp[l][k] 与右半 dp[k+1][r] 各自先合成一堆，再合并这最后两堆，追加代价 = 整段区间和 sum(l..r)。</figcaption>
        </figure>
        <div className="prose">
          <p>
            这<strong>最后一并</strong>的代价是多少？两堆分别是 <M>{'[l,k]'}</M> 和 <M>{'[k+1,r]'}</M> 的全部石子，加起来恰好是<strong>整段区间的石子总和</strong> <M>{'\\mathrm{sum}(l,r)'}</M>——与 <M>{'k'}</M> 断在哪里<strong>无关</strong>。
            所以在分割点 <M>{'k'}</M> 处断开的总代价是 <M>{'dp[l][k]+dp[k+1][r]+\\mathrm{sum}(l,r)'}</M>。究竟断在哪个 <M>{'k'}</M> 最好？<strong>把每个 <M>{'k'}</M> 都试一遍，取最小</strong>：
          </p>
          <MB>{'dp[l][r]=\\min_{l\\le k\\le r-1}\\big(dp[l][k]+dp[k+1][r]\\big)+\\mathrm{sum}(l,r)'}</MB>
          <p>
            边界：<M>{'dp[l][l]=0'}</M>（单独一堆无需合并）。答案：<M>{'dp[1][n]'}</M>。
            区间和用<strong>前缀和</strong> <M>{'\\mathrm{sum}(l,r)=pre[r]-pre[l-1]'}</M> 一步取到，不必每次重扫。
          </p>
          <p>
            这里藏着区间 DP 与线性 DP 的关键分野：<M>{'dp[l][r]'}</M> 依赖的是<strong>比它更短的子区间</strong>（<M>{'[l,k]'}</M> 与 <M>{'[k+1,r]'}</M> 长度都 <M>{'<r-l+1'}</M>）。所以递推<strong>不能</strong>按 <M>{'l'}</M> 或 <M>{'r'}</M> 顺序走，必须<strong>按区间长度由短到长</strong>——短的先算好，长的才有得引用。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          区间 DP 把「合并顺序的指数爆炸」压成一张 <M>{'O(n^2)'}</M> 的<strong>三角表</strong>：每个连续区间只算一次最优，靠<strong>枚举最后一次合并的分割点</strong>把大区间拆成两个更短的、已解的子区间。<strong>「最后一并的代价与分割点无关，恒为区间和」</strong>——正是这一条让转移得以成立。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用开头的例子（石子 <M>{'a=[7,6,5,4]'}</M>，下标 <M>{'1..4'}</M>）走几步。前缀和 <M>{'pre=[0,7,13,18,22]'}</M>，重点盯住<strong>长度由短到长</strong>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>对角线（长度 1）。</b> 每堆单独一堆，无需合并：<M>{'dp[l][l]=0'}</M>。这是整张三角表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>长度 2</b>：只有一种分法。<M>{'dp[1][2]=0+0+\\mathrm{sum}(1,2)=13'}</M>；同理 <M>{'dp[2][3]=11'}</M>、<M>{'dp[3][4]=9'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>长度 3</b>，看 <M>{'[1,3]'}</M>（区间和 <M>{'\\mathrm{sum}=18'}</M>）：<M>{'k=1'}</M> → <M>{'dp[1][1]+dp[2][3]=0+11=11'}</M>；<M>{'k=2'}</M> → <M>{'dp[1][2]+dp[3][3]=13+0=13'}</M>。取小 <M>{'11'}</M>，加 <M>{'18'}</M> → <M>{'dp[1][3]=29'}</M>。同理 <M>{'dp[2][4]=9+15=24'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>长度 4</b>，看整段 <M>{'[1,4]'}</M>（区间和 <M>{'\\mathrm{sum}=22'}</M>）：<M>{'k=1'}</M> → <M>{'0+24=24'}</M>；<M>{'k=2'}</M> → <M>{'13+9=22'}</M>；<M>{'k=3'}</M> → <M>{'29+0=29'}</M>。取小 <M>{'22'}</M>，加 <M>{'22'}</M> → <M>{'dp[1][4]=44'}</M>——正是最小合并代价。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把三角表<strong>按长度一层层填满</strong>，高亮每个 <M>{'dp[l][r]'}</M> 选中的分割点与它的两个子区间来源。改改石子数，看表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看三角表一层一层长出来 · 枚举分割点、区间和相加</h2>
        <div className="demo">
          <div className="demo__body">
            <StoneMergeDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">为什么按长度递推：填表顺序与复杂度</h2>
        <div className="prose">
          <p>
            区间 DP 的表是个<strong>上三角</strong>（只有 <M>{'l\\le r'}</M> 才是合法区间，下三角空着）。转移 <M>{'dp[l][r]'}</M> 要用 <M>{'dp[l][k]'}</M> 与 <M>{'dp[k+1][r]'}</M>，这两者的<strong>区间长度都比 <M>{'[l,r]'}</M> 短</strong>。
            所以只要<strong>先把所有短区间算完</strong>，长区间需要的子区间就一定<strong>都已就绪</strong>——这就是「外层枚举长度 <M>{'\\mathrm{len}=2\\ldots n'}</M>，内层枚举左端点 <M>{'l'}</M>」的由来。
          </p>
        </div>
        <figure className="figure">
          <LengthOrderFigure />
          <figcaption className="figure__cap">三角表沿对角线成层：主对角线是长度 1（已知 0），每向右上错一格长度加 1。填表从对角线出发，一层层推向右上角 dp[1][n]。</figcaption>
        </figure>
        <div className="prose">
          <p>
            数一数计算量：区间长度、左端点合起来约 <M>{'O(n^2)'}</M> 个区间，每个区间还要枚举分割点 <M>{'k'}</M>（<M>{'O(n)'}</M> 个），于是总复杂度 <M>{'O(n^3)'}</M>。
            对石子合并的常见数据范围（<M>{'n\\le'}</M> 几百）绰绰有余。<strong>三层循环、外层是长度</strong>——这是几乎所有区间 DP 的通用骨架，记死它：
          </p>
          <pre
            className="mono"
            style={{
              margin: 'var(--sp-4) 0',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--r-2)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              fontSize: '13.5px',
              lineHeight: 1.7,
              color: 'var(--text-1)',
              overflowX: 'auto',
              whiteSpace: 'pre',
            }}
          >
{`for 长度 len = 2 … n:          // ★外层枚举区间长度，由短到长
  for 左端点 l = 1 … n-len+1:
    r = l + len - 1
    for 分割点 k = l … r-1:
      dp[l][r] = min( dp[l][r], dp[l][k] + dp[k+1][r] + sum(l,r) )`}
          </pre>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">一题双问：把 min 换成 max</h2>
        <div className="prose">
          <p>
            石子合并的经典题（P1880）常常<strong>同时问最小与最大</strong>合并代价。好消息是：状态、转移骨架<strong>一字不改</strong>——只把那个 <M>{'\\min'}</M> 换成 <M>{'\\max'}</M>，就从「最省」翻成「最费」：
          </p>
          <MB>{'dp_{\\max}[l][r]=\\max_{l\\le k\\le r-1}\\big(dp_{\\max}[l][k]+dp_{\\max}[k+1][r]\\big)+\\mathrm{sum}(l,r)'}</MB>
          <p>
            两问共用同一套三层循环，用两张表 <M>{'f'}</M>（最小）、<M>{'g'}</M>（最大）并行填即可。下面把二者<strong>并排跑给你看</strong>：左边求最小、右边求最大。默认还是 <M>{'a=[7,6,5,4]'}</M>——最小 <M>{'44'}</M>、最大 <M>{'53'}</M>。改改石子数，看两个答案与各自选中的分割点如何分道扬镳。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <StoneMinMaxDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="别忘了：这排石子其实是环">
          P1880 原题里，石子摆成一个<strong>环</strong>——第 <M>{'n'}</M> 堆与第 <M>{'1'}</M> 堆也相邻。本页先把它当作<strong>链</strong>讲透区间 DP 的内核；处理「环」的通法（<strong>断环为链</strong>：复制一倍接成 <M>{'2n'}</M> 长，枚举所有长度为 <M>{'n'}</M> 的窗口）留到 <Link to="/part/c/ring" style={{ color: 'var(--accent-2)' }}>环形区间 DP</Link> 一节专门拆解。链形基底是环形的地基。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1880" name="[NOI1995] 石子合并" src="NOI1995" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 堆石子摆成一<strong>环</strong>，每次合并相邻两堆、代价为两堆之和，直到并成一堆。分别求<strong>最小</strong>与<strong>最大</strong>总代价。
          </Field>
          <Field k="对应关系">
            标准区间 DP：<M>{'dp[l][r]'}</M> = 合并 <M>{'[l,r]'}</M> 的最优代价，枚举分割点 <M>{'k'}</M>，追加代价 = 区间和。<strong>本页的链形 + 一题双问</strong>就是它的内核。
          </Field>
          <Field k="环的处理（下一节展开）">
            断环为链：把石子数组<strong>复制一倍</strong>拼成长度 <M>{'2n'}</M>，在其上做链形区间 DP，再取所有长度为 <M>{'n'}</M> 的区间 <M>{'[i,i+n-1]'}</M> 里的最优。参考代码先给<strong>链形双问</strong>骨架（把 <M>{'n'}</M> 换成 <M>{'2n'}</M> 并加一层窗口枚举即得环形）。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f/g[l][r]=\\mathrm{opt}(f/g[l][k]+f/g[k+1][r])+\\mathrm{sum}(l,r)'}</M>，外层长度、内层左端点、最内分割点；时间 <M>{'O(n^3)'}</M>。
          </Field>
          <Field k="参考代码（链形基底 · 双问并行）">
            <CodeBlock code={CODE_P1880} luogu="P1880" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P5019" name="[NOIP2018 提高组] 铺设道路" src="NOIP2018 提高组" diff="普及/提高-">
          <Field k="题意">
            一排 <M>{'n'}</M> 段道路，第 <M>{'i'}</M> 段深度 <M>{'d_i'}</M>。每天可把一段<strong>连续区间</strong>的深度整体填平 1。求填平所有段的最少天数。
          </Field>
          <Field k="为什么选它">
            较新的 CSP/NOIP 真题，是理解<strong>「区间合并代价」直觉</strong>的极佳前菜：把「填平连续区间」这一操作，和石子合并里「合并连续区间」并置——都在<strong>连续段</strong>上思考代价。它的最优解可由<strong>差分</strong>一眼看穿：只有当前段比前一段<strong>更深</strong>时才需新增 <M>{'d_i-d_{i-1}'}</M> 天，累加即答案 <M>{'\\sum\\max(0,\\ d_i-d_{i-1})'}</M>——一个 <M>{'O(n)'}</M> 的贪心/差分，正好反衬石子合并<strong>为何非 DP 不可</strong>。
          </Field>
          <Field k="参考代码（差分累加）">
            <CodeBlock code={CODE_P5019} luogu="P5019" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1775"
          name="石子合并（弱化版）"
          hint="纯链形石子合并模板：石子排成一条链（非环）。前缀和求区间代价，外层枚举长度、内层左端点、最内分割点，dp[1][n] 即答案。把三层循环骨架默写下来。"
        />
        <Exercise
          pid="P1043"
          name="[NOIP2003 普及组] 数字游戏"
          hint="环形 + 区间 DP：环上分 m 段，各段和对 10 取模后相乘，求最大/最小。断环为链（复制一倍）后，dp[l][r][k] 记「区间 [l,r] 分成 k 段」的最优，转移枚举最后一段的分割点；取模后可能为负，最小值转移别漏负负得正。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想更直观地感受「合并顺序如何改变总代价」？到 <Link to="/part/c" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>C 部分页</Link>的互动里亲手挑一次合并顺序，再看 DP 给出的最优。
      </div>

    </>
  )
}
