import { Link } from 'react-router-dom'
import { ArrowRight, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackDemo from '../../components/demos/knapsack/KnapsackDemo'
import ForwardBugDemo from '../../components/demos/knapsack/ForwardBugDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { SetupFigure, DecisionFigure, ForwardBugFigure } from './KnapsackArt'

const CODE_P1048 = `
#include <iostream>
#include <algorithm>
using namespace std;

int t[105], v[105];
int f[1005];                 // f[j]：用时不超过 j 的最大价值

int main()
{
    int T, M;
    cin >> T >> M;
    for (int i = 1; i <= M; i++)
        cin >> t[i] >> v[i];

    for (int i = 1; i <= M; i++)        // 逐株草药
        for (int j = T; j >= t[i]; j--) // ★逆推：从大容量往小推
            f[j] = max(f[j], f[j - t[i]] + v[i]);

    cout << f[T] << endl;
    return 0;
}`

const CODE_P2871 = `
#include <iostream>
#include <algorithm>
using namespace std;

int w[3405], d[3405];
int f[12885];

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> w[i] >> d[i];

    for (int i = 1; i <= n; i++)        // N 大，二维会 MLE，必须一维
        for (int j = m; j >= w[i]; j--)
            f[j] = max(f[j], f[j - w[i]] + d[i]);

    cout << f[m] << endl;
    return 0;
}`

const CODE_P1164 = `
#include <iostream>
using namespace std;

int a[105];
int f[10005];                // f[j]：恰好花 j 元的方案数

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> a[i];

    f[0] = 1;                           // 花 0 元有 1 种方案（什么都不点）
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= a[i]; j--)
            f[j] += f[j - a[i]];        // 计数：max 换成累加

    cout << f[m] << endl;
    return 0;
}`

export default function Knapsack01() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从「整件取舍」说起</h2>
        <div className="prose">
          <p>
            先看一个具体场景：有 3 件物品，一个容量 <M>{'m=8'}</M> 的背包。每件物品有自己的<strong>重量 <M>{'w'}</M></strong> 和<strong>价值 <M>{'v'}</M></strong>，
            而且要么<strong>整件装入</strong>、要么<strong>留下</strong>——没有「装半件」这回事（这就是「01」的含义：每件取 0 次或 1 次）。目标：在不超重的前提下，让装入的<strong>总价值最大</strong>。
          </p>
        </div>
        <figure className="figure">
          <SetupFigure />
          <figcaption className="figure__cap">3 件物品（重量 w、价值 v）与容量 m=8 的背包——该带走哪些？</figcaption>
        </figure>
        <div className="prose">
          <p>
            第一反应也许是<strong>贪心</strong>：按「性价比」<M>{'v/w'}</M> 从高到低装。这里三件的性价比是 <M>{'1.5,\\ 1.33,\\ 1.25'}</M>，
            于是先装物品 1（<M>{'w=2'}</M>），再装物品 2（<M>{'w=3'}</M>，累计 5），想装物品 3 时 <M>{'5+4=9>8'}</M> 塞不下——贪心只拿到 <M>{'3+4=7'}</M>。
          </p>
          <p>
            可最优其实是<strong>物品 2 + 物品 3</strong>：重量 <M>{'3+4=7\\le 8'}</M>，价值 <M>{'4+5=9'}</M>。贪心输了 2。
            <strong>「整件取舍」的最优，贪心按不住</strong>——因为此刻的最优选择，依赖后面还剩多少空间，是一个牵一发动全身的全局问题。
          </p>
          <p>
            那把 <M>{'n'}</M> 件物品「取 / 不取」的所有组合都枚举一遍？那是 <M>{'2^n'}</M> 种，<M>{'n=100'}</M> 就已是天文数字。
            DP 的思路，是把这 <M>{'2^n'}</M> 的爆炸，压成一张<strong>逐格填写的表</strong>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：取，还是不取</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'f[i][j]'}</M> 表示：<strong>只在前 <M>{'i'}</M> 件物品里挑选、且总重量不超过 <M>{'j'}</M></strong> 时，能得到的最大价值。
            把「逐件考虑」当作阶段，第 <M>{'i'}</M> 阶段只决断一件事——第 <M>{'i'}</M> 件，取还是不取？
          </p>
        </div>
        <figure className="figure">
          <DecisionFigure />
          <figcaption className="figure__cap">每一格 f[i][j] 只有两条路：不取继承上一行，取则腾出 w 再补上 v，最后取较大者。</figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>不取第 <M>{'i'}</M> 件</strong>：它没参与，前 <M>{'i'}</M> 件的最优就等于前 <M>{'i-1'}</M> 件在同容量 <M>{'j'}</M> 下的最优，即 <M>{'f[i-1][j]'}</M>。
          </p>
          <p>
            <strong>取第 <M>{'i'}</M> 件</strong>（前提装得下 <M>{'j\\ge w_i'}</M>）：先腾出 <M>{'w_i'}</M> 的空间给它，剩下的 <M>{'j-w_i'}</M> 容量留给前 <M>{'i-1'}</M> 件去最优，再加上它自己的价值 <M>{'v_i'}</M>，即 <M>{'f[i-1][j-w_i]+v_i'}</M>。
          </p>
          <p>两条路要价值最大，取较大者，就得到<strong>转移方程</strong>：</p>
          <MB>{'f[i][j]=\\max\\big(\\,f[i-1][j],\\ f[i-1][j-w_i]+v_i\\,\\big)'}</MB>
          <p>
            边界：<M>{'f[0][j]=0'}</M>（一件都不考虑，价值为 0）。答案：<M>{'f[n][m]'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          这一步把「<M>{'2^n'}</M> 种组合」拆成了「每件物品在参与 / 不参与两种局面下的最优」，用 <M>{'O(nm)'}</M> 张表格格子，装下了指数级的搜索。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用刚才的例子（物品 <M>{'(w,v)=(2,3),(3,4),(4,5)'}</M>，容量 8）走几步，把方程「跑起来」：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>初始化第 0 行。</b> 一件物品都不考虑时，任何容量下价值都是 0：<M>{'f[0][0..8]=0'}</M>。这是整张表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>放入物品 1</b>（<M>{'w=2,v=3'}</M>）。容量 <M>{'j<2'}</M> 装不下 → 仍是 0；<M>{'j\\ge2'}</M> 时 <M>{'f[1][j]=\\max(0,\\ 0+3)=3'}</M>。于是第 1 行变成 <M>{'0,0,3,3,3,3,3,3,3'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>放入物品 2</b>（<M>{'w=3,v=4'}</M>）。看容量 5：不取 = <M>{'f[1][5]=3'}</M>；取 = <M>{'f[1][5-3]+4=f[1][2]+4=3+4=7'}</M>。取较大 → <M>{'f[2][5]=7'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>放入物品 3</b>（<M>{'w=4,v=5'}</M>），看容量 8：取 = <M>{'f[2][8-4]+5=f[2][4]+5=4+5=9'}</M>，大于不取的 <M>{'f[2][8]=7'}</M>。
              于是 <M>{'f[3][8]=9'}</M>——正是最优解，和我们手算的「物品 2+3」吻合。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把整张表<strong>逐格填满</strong>，并高亮每一格的两个来源。试着改物品或容量，看表格实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一格一格长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackDemo variant="01" />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">卷成一维：滚动数组与逆推</h2>
        <div className="prose">
          <p>
            注意转移只用到<strong>上一行</strong> <M>{'f[i-1][\\cdot]'}</M>。既然如此，何必保留所有行？用一维 <M>{'f[j]'}</M> 就地更新即可，空间从 <M>{'O(nm)'}</M> 压到 <M>{'O(m)'}</M>：
          </p>
          <MB>{'f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)'}</MB>
          <p>
            但方向<strong>必须逆推</strong>（<M>{'j'}</M> 从 <M>{'m'}</M> 到 <M>{'w_i'}</M>）：算 <M>{'f[j]'}</M> 要用「上一件」留下的 <M>{'f[j-w_i]'}</M>，逆推时它还没被本件动过，是<strong>干净的旧值</strong>。方向反过来会怎样？这不是小瑕疵，而是会让答案<strong>彻底跑偏</strong>——下一节把它摊开看。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">为什么不能正推：一件物品被反复装入</h2>
        <div className="prose">
          <p>
            把内层循环从逆推改成<strong>正推</strong>（<M>{'j'}</M> 从 <M>{'w_i'}</M> 到 <M>{'m'}</M>），代码只差一个方向，结果却会错得离谱。病根就一句话：<strong>正推时，你用来更新 <M>{'f[j]'}</M> 的 <M>{'f[j-w_i]'}</M>，可能在本轮已经被同一件物品改过了。</strong>
          </p>
          <p>
            用最干净的例子看——只有<strong>一件</strong>物品 <M>{'(w,v)=(2,3)'}</M>，容量 6：
          </p>
        </div>
        <figure className="figure">
          <ForwardBugFigure />
          <figcaption className="figure__cap">
            同一件物品：逆推每格都取「装它之前」的旧值，恒为 3（只装 1 件）；正推却让 f[0]→f[2]→f[4]→f[6] 链式 +3，一路滚到 9——同一件被装了 3 次。
          </figcaption>
        </figure>
        <div className="steps">
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>逆推</b>（<M>{'j:6\\to 4\\to 2'}</M>）：算 <M>{'f[6]'}</M> 用 <M>{'f[4]'}</M> 的<b>旧值 0</b> → 3；算 <M>{'f[4]'}</M> 用 <M>{'f[2]'}</M> 旧值 0 → 3；算 <M>{'f[2]'}</M> 用 <M>{'f[0]=0'}</M> → 3。每格都落在「这件还没进过」的旧值上，只加一次 → <b>f[6]=3，装 1 件</b>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✗</span>
            <div className="step__b">
              <b>正推</b>（<M>{'j:2\\to 4\\to 6'}</M>）：<M>{'f[2]=f[0]+3=3'}</M>；到 <M>{'f[4]'}</M> 时 <M>{'f[2]'}</M> <b>已经含这件了</b>，<M>{'f[4]=f[2]+3=6'}</M>（2 件）；<M>{'f[6]=f[4]+3=9'}</M>（<b>3 件</b>）。一件 <M>{'w=2'}</M> 的物品被当成「无限件」反复塞了进去。
            </div>
          </div>
        </div>
        <InfoBox kind="warn" title="记死：01 逆推、完全顺推">
          01 背包每件至多取一次，必须<strong>逆推</strong>，让 <M>{'f[j-w_i]'}</M> 保持「上一件」留下的干净旧值；而这个「正推会重复取」的 bug，到 <Link to="/part/a/complete" style={{ color: 'var(--accent-2)' }}>完全背包</Link> 里恰好翻身成<strong>想要的特性</strong>（每种无限件）。同一段转移，循环方向决定物种。
        </InfoBox>
        <div className="prose">
          <p>
            下面把两个方向<strong>并排跑给你看</strong>——改物品的 <M>{'w,v'}</M> 或容量：左边逆推恒等于一件的价值，右边正推随容量成倍上涨。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <ForwardBugDemo />
          </div>
        </div>
        <div className="pointer-cue">
          <Gamepad2 size={18} />
          想更直观？到 <Link to="/part/a" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>B 部分页的「装包大师」</Link>亲手挑物品，再点「看 DP 最优」，体验一次贪心为何会输给 DP。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1048" name="采药" src="NOIP2005 普及组" diff="普及-">
          <Field k="题意">
            给定总时间 <M>{'T'}</M> 与 <M>{'M'}</M> 株草药，每株耗时 <M>{'t_i'}</M>、价值 <M>{'v_i'}</M>，每株至多采一次。求 <M>{'T'}</M> 时间内最大总价值。
          </Field>
          <Field k="对应关系">「时间」= 重量 <M>{'w'}</M>，「价值」= <M>{'v'}</M>，「总时间 <M>{'T'}</M>」= 容量 <M>{'m'}</M>。标准 01 背包。</Field>
          <Field k="转移 · 复杂度">
            <M>{'f[j]=\\max(f[j],f[j-t_i]+v_i)'}</M>，一维逆推；时间 <M>{'O(TM)'}</M>。
          </Field>
          <Field k="参考代码（一维逆推）">
            <CodeBlock code={CODE_P1048} luogu="P1048" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2871" name="[USACO07DEC] Charm Bracelet S" src="USACO 2007" diff="普及/提高-">
          <Field k="题意">
            <M>{'N'}</M> 个饰品，每个重量 <M>{'W_i'}</M>、魅力 <M>{'D_i'}</M>，背包承重 <M>{'M'}</M>，求最大魅力和。
          </Field>
          <Field k="为什么选它">
            <M>{'N\\le 3402,\\ M\\le 12880'}</M>——二维表 <M>{'N\\times M'}</M> 直接 MLE，逼你写一维滚动数组。是讲「为何必须一维、为何倒序」的最佳载体。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P2871} luogu="P2871" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1164" name="小 A 点菜" src="洛谷原生" diff="普及-">
          <Field k="题意">
            <M>{'n'}</M> 道菜价格已知，手上恰好 <M>{'m'}</M> 元，求<strong>恰好花完</strong>的点菜方案数。
          </Field>
          <Field k="关键变形">
            把「求最优」换成「求方案数」：转移里的 <M>{'\\max'}</M> 换成<strong>累加</strong> <M>{'+'}</M>，初值 <M>{'f[0]=1'}</M>（花 0 元有 1 种方案）。这是从「最优 DP」跨到「计数 DP」最平滑的一题。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1164} luogu="P1164" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P1049" name="[NOIP2001 普及组] 装箱问题" hint="布尔可行性：让 f[j] 表示容量 j 能否恰好装满，求最小剩余空间 = m − 最大可装。" />
        <Exercise pid="P1417" name="烹调方案" hint="01 背包 + 邻项交换排序：先按系数 b 决定处理顺序，再做背包。" />
        <Exercise pid="P1466" name="[USACO2.2] 集合 Subset Sums" hint="求方案数：能否把 1..n 分成两个和相等的子集，f[j] 计数。" />
      </section>

      <nav className="type-nav">
        <span />
        <Link to="/part/a/complete" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            完全背包 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
