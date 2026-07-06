import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import StateMachineDemo from '../../components/demos/fsm/StateMachineDemo'
import StockStateDemo from '../../components/demos/fsm/StockStateDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { SetupFigure, TransitionFigure, StockFigure } from './StateMachineArt'

const CODE_P2196 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n;
int a[25];                       // 每个地窖的地雷数
bool g[25][25];                  // g[i][j]：i 能否走到 j（题目保证 j>i）
int f[25], nxt[25];              // f[i]：从 i 出发最多能挖的地雷；nxt[i]：路径上 i 的下一个

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> a[i];
    for (int i = 1; i < n; i++)          // 上三角连接矩阵：i 到 i+1..n
        for (int j = i + 1; j <= n; j++)
            cin >> g[i][j];

    int start = 1;
    for (int i = n; i >= 1; i--)         // ★逆序：转移只依赖编号更大的地窖
    {
        f[i] = a[i];                     // 至少挖自己这一窖
        nxt[i] = 0;                      // 0 表示到此为止
        for (int j = i + 1; j <= n; j++)
            if (g[i][j] && a[i] + f[j] > f[i])
            {
                f[i] = a[i] + f[j];      // 接到 j 那条最优链后面
                nxt[i] = j;              // 记下一步，供回溯路径
            }
        if (f[i] > f[start])             // 起点可以是任意地窖，取全局最优
            start = i;
    }

    for (int i = start; i; i = nxt[i])   // 顺着 nxt 链把路径打印出来
        cout << i << (nxt[i] ? " " : "\\n");
    cout << f[start] << endl;
    return 0;
}
// TAG: 线性DP DAG路径 状态机 方案回溯`

const CODE_P4310 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n, ans;
int f[35];                       // f[b]：以「第 b 位为 1 的数」结尾的最长合法子序列长度

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int x;
        cin >> x;

        // 决策的记忆压进 31 个「按位状态」里：
        // b_i & b_{i-1} != 0 ⇔ 两数至少共享一个为 1 的位。
        int best = 0;                    // 能接在谁后面：所有与 x 共位的状态取最大
        for (int b = 0; b < 31; b++)
            if (x >> b & 1)
                best = max(best, f[b]);

        int cur = best + 1;              // x 自己接上去，长度 +1
        for (int b = 0; b < 31; b++)     // x 的每个为 1 的位都被刷新为 cur
            if (x >> b & 1)
                f[b] = max(f[b], cur);

        ans = max(ans, cur);
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 按位状态机 f[bit]转移 O(30n)`

export default function StateMachine() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">给每个位置装上一个「状态」</h2>
        <div className="prose">
          <p>
            到目前为止，线性 DP 的每个位置 <M>{'i'}</M> 只记一个数：<M>{'dp[i]'}</M>。但很多问题里，「站在位置 <M>{'i'}</M>」并不是一个笼统的局面——
            它还分<strong>几种互斥的处境</strong>。比如手上<strong>有没有股票</strong>、第 <M>{'i'}</M> 个数<strong>选了没选</strong>、机器此刻<strong>停在哪一档</strong>。
            于是我们给每个位置引入若干<strong>离散状态</strong> <M>{'s'}</M>，用 <M>{'dp[i][s]'}</M> 分别记录，让转移在<strong>状态之间</strong>流动——这就是<strong>线性状态机 DP</strong>。
          </p>
          <p>
            先看一个最朴素的「受限选取」：给一排数 <M>{'a_1,a_2,\\dots,a_n'}</M>，要挑出若干个使<strong>总和最大</strong>，但有一条硬约束——
            <strong>相邻的两个不能同时选</strong>（选了 <M>{'a_i'}</M> 就不能选 <M>{'a_{i-1}'}</M> 和 <M>{'a_{i+1}'}</M>）。这正是「打家劫舍」式的模型。
          </p>
        </div>
        <figure className="figure">
          <SetupFigure />
          <figcaption className="figure__cap">
            受限选取：a=[1,2,3,1]，相邻两数用红虚线连着表示互斥。选 a1+a3=1+3=4 是最大——不能贪心地把最大的 3 和它两边一起拿。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            为什么不能<strong>贪心</strong>地「从大到小挑，冲突就跳过」？看最短的反例 <M>{'a=[1,2,3]'}</M>：贪心先拿最大的 <M>{'3'}</M>（在中间），它左右两个数就都被禁了，只得 <M>{'3'}</M>；
            可最优是拿<strong>两端</strong> <M>{'a_1+a_3=1+3=4'}</M>。贪心为了眼前那个大数，堵死了两侧更划算的组合。
            <strong>此刻选或不选，牵动前后两侧</strong>——又是需要 DP 的信号。而枚举「每个数选或不选」的所有组合是 <M>{'2^n'}</M> 种，<M>{'n=50'}</M> 就已无从枚举。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：选，还是不选</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>光记「前 <M>{'i'}</M> 个的最大和」不够——因为下一步能不能选 <M>{'a_{i+1}'}</M>，取决于 <M>{'a_i'}</M> 到底<strong>选没选</strong>。
            于是把这个「选没选」<strong>显式记进状态</strong>：设 <M>{'dp[i][0]'}</M> = 考虑前 <M>{'i'}</M> 个、且<strong>不选</strong> <M>{'a_i'}</M> 时的最大和；<M>{'dp[i][1]'}</M> = 前 <M>{'i'}</M> 个、且<strong>选</strong> <M>{'a_i'}</M> 时的最大和。
          </p>
        </div>
        <figure className="figure">
          <TransitionFigure />
          <figcaption className="figure__cap">
            两状态之间的转移：不选 dp[i][0] 可承接上一位置的任一状态（取 max）；选 dp[i][1] 只能接上一位置的「不选」——这条独木桥正是「相邻互斥」的化身。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>不选 <M>{'a_i'}</M></strong>（<M>{'dp[i][0]'}</M>）：既然本位不取，前一个 <M>{'a_{i-1}'}</M> <strong>选或不选都行</strong>，所以从上一位置的两个状态里取较大者：
          </p>
          <MB>{'dp[i][0]=\\max\\big(dp[i-1][0],\\ dp[i-1][1]\\big)'}</MB>
          <p>
            <strong>选 <M>{'a_i'}</M></strong>（<M>{'dp[i][1]'}</M>）：本位既然要取，前一个 <M>{'a_{i-1}'}</M> 就<strong>必须不选</strong>（相邻互斥），只能接上一位置的「不选」状态，再加上 <M>{'a_i'}</M> 自己：
          </p>
          <MB>{'dp[i][1]=dp[i-1][0]+a_i'}</MB>
          <p>
            边界：<M>{'dp[0][0]=dp[0][1]=0'}</M>（哨兵起点，什么都没考虑）。答案在<strong>末列</strong>取两状态较大者——因为最后一个数选不选都可以：
          </p>
          <MB>{'\\text{ans}=\\max\\big(dp[n][0],\\ dp[n][1]\\big)'}</MB>
        </div>
        <InfoBox kind="key" title="本质：状态，就是「决策的记忆」">
          普通线性 DP 的 <M>{'dp[i]'}</M> 只背一个总量；状态机 DP 多出的那一维，背的是<strong>「上一步做了什么决定」</strong>——正因为把「<M>{'a_i'}</M> 选没选」记进了状态，下一步才知道自己能不能选。
          它把「后面的决策依赖前面怎么选」这层<strong>耦合</strong>，拆成了<strong>每个状态各自独立、可按位置递推</strong>的小问题，<M>{'2^n'}</M> 种组合被 <M>{'O(n\\cdot k)'}</M>（<M>{'k'}</M> 为状态数）装下。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用开头的例子 <M>{'a=[1,2,3,1]'}</M> 走几步，把两个状态<strong>并行</strong>推进（下标从 1 记）：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第 1 个数（a₁=1）。</b> 不选 <M>{'dp[1][0]=\\max(0,0)=0'}</M>；选 <M>{'dp[1][1]=dp[0][0]+1=0+1=1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>第 2 个数（a₂=2）。</b> 不选 <M>{'dp[2][0]=\\max(dp[1][0],dp[1][1])=\\max(0,1)=1'}</M>；选 <M>{'dp[2][1]=dp[1][0]+2=0+2=2'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>第 3 个数（a₃=3）。</b> 不选 <M>{'dp[3][0]=\\max(1,2)=2'}</M>；选 <M>{'dp[3][1]=dp[2][0]+3=1+3=4'}</M>（接的是「a₂ 不选」那条，即选了 a₁）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">4</span>
            <div className="step__b">
              <b>第 4 个数（a₄=1）。</b> 不选 <M>{'dp[4][0]=\\max(2,4)=4'}</M>；选 <M>{'dp[4][1]=dp[3][0]+1=2+1=3'}</M>。
              末列取大：<M>{'\\max(4,3)=4'}</M>——正是选 <M>{'a_1+a_3'}</M> 的答案，和手算吻合。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'dp[i][0/1]'}</M> 这张「状态 × 位置」的二维表<strong>逐格填满</strong>，并高亮每一格在上一位置的来源。改数组、加删元素、或换个预设，看它实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看两个状态一格一格长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <StateMachineDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：股票买卖——把「持有 / 未持有」做成状态机</h2>
        <div className="prose">
          <p>
            「选 / 不选」只是最简单的两状态。真正让状态机大显身手的，是<strong>股票买卖</strong>一族：给出每天的价格 <M>{'p_1,\\dots,p_n'}</M>，可以在某天<strong>买入</strong>、某天<strong>卖出</strong>（手上最多持一股），求最大利润。
            关键抓手同样是——<strong>站在第 <M>{'i'}</M> 天，你此刻「手里有没有股票」是两种截然不同的处境</strong>，能做的动作也不同。
          </p>
          <p>
            于是设两个状态：<M>{'\\mathit{hold}[i]'}</M> = 第 <M>{'i'}</M> 天结束时<strong>持有</strong>一股的最优现金；<M>{'\\mathit{cash}[i]'}</M> = 第 <M>{'i'}</M> 天结束时<strong>空仓</strong>的最优现金（现金相对初始 0 计，买入是垫钱、卖出是回款）。
          </p>
        </div>
        <figure className="figure">
          <StockFigure />
          <figcaption className="figure__cap">
            股票状态机：持有(hold) 与 未持有(cash) 两节点。买入边把 cash→hold（现金 −price），卖出边把 hold→cash（现金 +price），两个自环是「不动」。若带冷却，卖出后要在 cash 多停一天才能再买入。
          </figcaption>
        </figure>
        <div className="prose">
          <p>逐日在两状态间转移（无限次交易版）：</p>
          <MB>{'\\mathit{cash}[i]=\\max\\big(\\mathit{cash}[i-1],\\ \\mathit{hold}[i-1]+p_i\\big)'}</MB>
          <MB>{'\\mathit{hold}[i]=\\max\\big(\\mathit{hold}[i-1],\\ \\mathit{cash}[i-1]-p_i\\big)'}</MB>
          <p>
            前者：空仓 = 昨天就空仓（不动）、或昨天持有今天<strong>卖出</strong>（<M>{'+p_i'}</M>）；后者：持有 = 昨天就持有（不动）、或昨天空仓今天<strong>买入</strong>（<M>{'-p_i'}</M>）。
            初始 <M>{'\\mathit{cash}[0]=0'}</M>、<M>{'\\mathit{hold}[0]=-\\infty'}</M>（还没买过）。答案取末日的 <M>{'\\mathit{cash}[n]'}</M>——手里不留股才算落袋。
          </p>
          <p>
            再加一条<strong>冷却期</strong>（卖出后次日不能买入）会怎样？只需把买入时的现金基准从「昨日空仓」改成「<strong>前天</strong>空仓」<M>{'\\mathit{cash}[i-2]'}</M>——这样刚卖出的那天就买不回来了。
            换句话说，<strong>加一条规则，只是给状态机换一条边</strong>，主干丝毫不动。这正是状态机模型的威力：现实约束越复杂，越能靠「多设一个状态 / 改一条转移边」优雅地容纳。
          </p>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把状态机<strong>逐日推演</strong>：点某天或用按钮前进，看「持有 / 空仓」两状态的最优现金如何随每天<strong>买 / 卖 / 不动</strong>更新。改价格、勾上「冷却期」，观察那条被改的边如何影响全局。
        </div>
        <div className="demo">
          <div className="demo__body">
            <StockStateDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="常见陷阱 · 答案取「空仓」态，别取 max">
          股票问题最终答案是 <M>{'\\mathit{cash}[n]'}</M>（末日空仓），<strong>不是</strong> <M>{'\\max(\\mathit{hold}[n],\\mathit{cash}[n])'}</M>——手里还攥着一股不叫利润。
          另一处易错：<M>{'\\mathit{hold}'}</M> 的初值必须是 <M>{'-\\infty'}</M> 而非 0，否则「还没买就先算持有」会凭空多出一股。状态机 DP 的边界，往往就藏在这些「哪个状态一开始根本不可能」的细节里。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2196" name="[NOIP1996 提高组] 挖地雷" src="NOIP1996 提高" diff="普及/提高-">
          <Field k="题意">
            <M>{'n'}</M> 个地窖各有若干地雷，给出哪些地窖间有地道（只能从<strong>编号小</strong>走向<strong>编号大</strong>）。从任一地窖出发一路挖下去，求最多地雷数，并输出<strong>具体路径</strong>。
          </Field>
          <Field k="为什么选它">
            状态机 DP 的<strong>入门底子</strong>：边只朝编号增大的方向 → 天然是一张 DAG，<M>{'f[i]'}</M>=「从 <M>{'i'}</M> 出发最多挖多少」就是最朴素的路径 DP。更重要的是它逼你练<strong>方案回溯</strong>——多存一个 <M>{'nxt[i]'}</M> 记住每步走向谁，再顺链打印。这是「状态里存决策、事后还原路径」的第一课。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[i]=a_i+\\max_{\\,j>i,\\ g[i][j]}f[j]'}</M>，逆序递推；起点取 <M>{'\\arg\\max_i f[i]'}</M>；时间 <M>{'O(n^2)'}</M>。
          </Field>
          <Field k="参考代码（逆序 DP + nxt 回溯路径）">
            <CodeBlock code={CODE_P2196} luogu="P2196" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P4310" name="绝世好题" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            给长度 <M>{'n'}</M> 的序列，求最长子序列 <M>{'b'}</M>，使相邻两项<strong>按位与不为 0</strong>（<M>{'b_i\\ \\&\\ b_{i-1}\\neq 0'}</M>，即至少共享一个为 1 的二进制位）。
          </Field>
          <Field k="换个视角（把状态藏进「位」里）">
            若沿用 LIS 的「<M>{'dp[i]'}</M> 向左扫所有 <M>{'j'}</M>」是 <M>{'O(n^2)'}</M>，会超时。妙处在于：<strong>能不能接</strong>只看「有没有公共位」，与具体是哪个数无关。于是不按「下标」记状态，而按<strong>二进制位</strong>记：<M>{'f[b]'}</M> = 以「第 <M>{'b'}</M> 位为 1 的数」结尾的最长合法子序列长度。
            处理 <M>{'a_i'}</M> 时，它能接的最长链 = 它所有为 1 的位对应 <M>{'f[b]'}</M> 的最大值，<M>{'+1'}</M> 后再<strong>回写</strong>到它每个为 1 的位。是「<strong>状态即决策的记忆</strong>」的绝佳变体——记忆被压进了 31 个按位状态。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'\\mathit{cur}=1+\\max_{\\,b:\\ a_i\\ \\&\\ 2^b\\neq 0}f[b]'}</M>，再对每个这样的 <M>{'b'}</M> 令 <M>{'f[b]\\leftarrow\\max(f[b],\\mathit{cur})'}</M>；时间 <M>{'O(30n)'}</M>。
          </Field>
          <Field k="参考代码（按位状态机 f[bit]）">
            <CodeBlock code={CODE_P4310} luogu="P4310" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2569" name="[SCOI2010] 股票交易" src="SCOI2010" diff="省选/NOI-">
          <Field k="题意">
            <M>{'T'}</M> 天，每天给出买入价 <M>{'ap_i'}</M>、卖出价 <M>{'bp_i'}</M> 及单日买入上限 <M>{'as_i'}</M>、卖出上限 <M>{'bs_i'}</M>；任意时刻持股不超过 <M>{'\\max P'}</M>；<strong>两次交易之间必须间隔 <M>{'W'}</M> 天</strong>（冷却）。求最大收益。
          </Field>
          <Field k="状态设计（拔高 · 只给思路）">
            设 <M>{'f[i][j]'}</M> = 第 <M>{'i'}</M> 天结束、持股 <M>{'j'}</M> 股的最优收益。四类转移：① <strong>凭空建仓</strong>（此前 <M>{'W'}</M> 天没交易）<M>{'f[i][j]=-j\\cdot ap_i'}</M>；② <strong>不动</strong> <M>{'f[i][j]=f[i-1][j]'}</M>；
            ③ <strong>买入</strong> <M>{'f[i][j]=\\max_{\\,j-as_i\\le k<j}\\big(f[i-W-1][k]-(j-k)ap_i\\big)'}</M>；④ <strong>卖出</strong> <M>{'f[i][j]=\\max_{\\,j<k\\le j+bs_i}\\big(f[i-W-1][k]+(k-j)bp_i\\big)'}</M>。
          </Field>
          <Field k="为什么选它 · 优化关键">
            冷却把「合法转移源」精确锁到 <M>{'i-W-1'}</M> 那一天，是状态机「隔 <M>{'W'}</M> 天才能再动」的硬核版。③④ 的内层 <M>{'\\max'}</M> 是<strong>定长滑动窗口取极值</strong>——把式子按 <M>{'k'}</M> 拆成「只含 <M>{'k'}</M> 的项 + 只含 <M>{'j'}</M> 的项」后，用<strong>单调队列</strong>把每天的转移从 <M>{'O(\\max P^2)'}</M> 降到 <M>{'O(\\max P)'}</M>，总复杂度 <M>{'O(T\\cdot\\max P)'}</M>。它示范了状态机 DP 与单调队列优化的经典合流。
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1799"
          name="数列"
          hint="选 / 删两状态：设 f[i][j] = 前 i 个数里保留 j 个、且第 i 个保留时的最大「匹配数」（a_i 恰好落在第 j 位，即 a_i=j 记一分）。删则继承、留则从 f[i-1][j-1] 转来——正是「选 / 不选」状态机换了个计分规则。"
        />
        <Exercise
          pid="P1103"
          name="书本整理"
          hint="保留 n−k 本的选段 DP：按高度排序后，设 f[i][j] = 前 i 本选 j 本、且第 i 本入选时的最小「宽度差之和」。第 i 本选或不选构成两状态，选时差值只与上一本入选者相邻——又一个线性状态机。"
        />
        <Exercise
          pid="P1868"
          name="饥饿的奶牛"
          hint="区间不相交选取（打家劫舍的区间版）：把每段区间按右端点排序，f[x] = 覆盖到坐标 x 的最大收益。对每段 [l,r]，f[r]=max(f[r-1], f[l-1]+长度)——「选这段」要求前一段在 l 之前结束，正是相邻互斥推广到区间。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/a/edit">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 编辑距离
          </span>
        </Link>
        <Link to="/part/a/count" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            计数 / 划分型 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
