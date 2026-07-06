import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import StairCountDemo from '../../components/demos/linear/StairCountDemo'
import PartitionDemo from '../../components/demos/linear/PartitionDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { MaxToPlusFigure, StairCountFigure, PartitionFigure } from './LinearCountArt'

const preMono: CSSProperties = {
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
}

const CODE_P1255 = `
#include <iostream>
#include <cstring>
using namespace std;

// 数楼梯：f[i] = f[i-1] + f[i-2]，n≤5000 时结果远超 long long，必须高精度。
// 用 int 数组逆序存每一位（下标 0 = 个位），f[i] 由 f[i-1] + f[i-2] 逐位进位得到。
int n;
int a[5005][2005];               // a[i]：第 i 级走法数的高精度表示，a[i][0]=位数

void add(int *c, int *x, int *y)  // c = x + y（高精度加）
{
    int len = max(x[0], y[0]);
    for (int i = 1; i <= len; i++)
    {
        c[i] += x[i] + y[i];
        c[i + 1] += c[i] / 10;    // 进位
        c[i] %= 10;
    }
    if (c[len + 1] > 0)
    {
        len++;
    }
    c[0] = len;                   // 记录位数
}

int main()
{
    cin >> n;
    a[0][0] = 1; a[0][1] = 1;     // f[0] = 1
    a[1][0] = 1; a[1][1] = 1;     // f[1] = 1
    for (int i = 2; i <= n; i++)
    {
        add(a[i], a[i - 1], a[i - 2]);
    }

    for (int i = a[n][0]; i >= 1; i--) // 逆序输出每一位
    {
        cout << a[n][i];
    }
    cout << endl;
    return 0;
}
// TAG: 线性DP 计数 斐波那契 高精度`

const CODE_P1077 = `
#include <iostream>
using namespace std;

const int MOD = 1000007;
int n, m, a[105];
int f[105][105];                 // f[i][j]：前 i 种花恰好摆 j 盆的方案数

int main()
{
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    for (int j = 0; j <= m; j++)     // 0 种花只有「摆 0 盆」1 种；j>0 无解
    {
        f[0][j] = (j == 0) ? 1 : 0;
    }

    for (int i = 1; i <= n; i++)
    {
        for (int j = 0; j <= m; j++)
        {
            for (int k = 0; k <= a[i] && k <= j; k++) // 第 i 种取 k 盆
            {
                f[i][j] = (f[i][j] + f[i - 1][j - k]) % MOD;
            }
        }
    }

    cout << f[n][m] << endl;
    return 0;
}
// TAG: 线性DP 有界计数 摆花 取模`

const CODE_P2401 = `
#include <iostream>
using namespace std;

const int MOD = 2015;
int n, k;
int f[1005][1005];               // f[i][j]：1..i 的排列中恰有 j 处 a[t]<a[t+1] 的方案数

int main()
{
    cin >> n >> k;
    f[1][0] = 1;                     // 单个数：0 处上升

    for (int i = 2; i <= n; i++)     // 把新数 i 逐个插进已有排列
    {
        for (int j = 0; j < i; j++)
        {
            // 插进原有 j 个「上升位」之一或末尾（共 j+1 处）→ 上升数不变
            long long same = (long long)f[i - 1][j] * (j + 1);
            // 插进其余位置 → 新增一个上升位 → 由 j-1 处上升转来（j=0 时无此项）
            long long grow = (j > 0) ? (long long)f[i - 1][j - 1] * (i - j) : 0;
            f[i][j] = (same + grow) % MOD;
        }
    }

    cout << f[n][k] << endl;
    return 0;
}
// TAG: 线性DP 逐个插入 排列计数 不等数列`

export default function LinearCount() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">换个问题：不求「最好」，改数「多少种」</h2>
        <div className="prose">
          <p>
            前面几类线性 DP 都在问同一句话——<strong>最优是多少</strong>：最长的子序列、最大的子段和、代价最小的对齐。
            所以它们的转移里都坐着一个 <M>{'\\max'}</M>（或 <M>{'\\min'}</M>）。可现实里的问题未必都求极值：
            「上 <M>{'n'}</M> 级楼梯，每步跨 1 或 2 级，<strong>有多少种</strong>走法？」「把 <M>{'n'}</M> 拆成若干正整数，<strong>有几种</strong>拆法？」
            答案不再是一个「最好的值」，而是一个<strong>计数</strong>。
          </p>
        </div>
        <figure className="figure">
          <MaxToPlusFigure />
          <figcaption className="figure__cap">
            同一条链式转移，从「最优 DP」翻面成「计数 DP」只动两处：中间的算子 max → +，地基 f[0] 从 0 → 1。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            关键洞察小到出乎意料：<strong>把转移里的 <M>{'\\max'}</M> 换成加法 <M>{'+'}</M></strong>，DP 就从「记录最优」变成「累计方案」。
            道理在于 DP 的两大要件恰好都适配计数——<strong>最优子结构</strong>变成「大问题的方案由子问题的方案拼成」，
            <strong>无后效性</strong>保证「不同来路拼出的方案互不重复」。于是原来在若干候选里挑最大的那一步，现在变成把若干候选的方案数<strong>全部加起来</strong>。
          </p>
          <p>
            先用一个极小的例子热身。上 <M>{'3'}</M> 级台阶：走法有 <M>{'1{+}1{+}1'}</M>、<M>{'1{+}2'}</M>、<M>{'2{+}1'}</M> 三种。
            若这是最优题，我们会问「最少几步」（答案 2 步）；而这里问「几种走法」，答案是 <strong>3</strong>——同一个状态骨架，读出的东西完全不同。
            这一节就把计数型线性 DP 讲透：先是<strong>数楼梯</strong>（一维斐波那契计数），再深入<strong>整数划分</strong>（二维计数），最后点一句<strong>高精度</strong>这个计数题的老搭档。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">数楼梯：f[i] = f[i−1] + f[i−2]</h2>
        <div className="prose">
          <p>
            设 <M>{'f[i]'}</M> 表示<strong>跳到第 <M>{'i'}</M> 级台阶的不同走法数</strong>。怎么递推？盯住<strong>最后一步</strong>：
            站在第 <M>{'i'}</M> 级，上一步只可能来自两处——从第 <M>{'i-1'}</M> 级<strong>跨 1 级</strong>上来，或从第 <M>{'i-2'}</M> 级<strong>跨 2 级</strong>上来。
            这两类走法<strong>不重不漏</strong>（最后一步的跨度不同，绝不会数成同一种），于是把两边的方案数<strong>相加</strong>：
          </p>
          <MB>{'f[i]=f[i-1]+f[i-2]'}</MB>
          <p>
            地基要撒对：<M>{'f[0]=1'}</M>——「还没上台阶、原地站着」本身算<strong>一种</strong>走法（这颗 1 是所有计数的种子）；<M>{'f[1]=1'}</M>——到第 1 级只有「跨 1 级」一种。
            往后每格都是前两格之和，于是 <M>{'f'}</M> 长成 <M>{'1,1,2,3,5,8,13,\\dots'}</M>——正是<strong>斐波那契数列</strong>。
          </p>
        </div>
        <figure className="figure">
          <StairCountFigure />
          <figcaption className="figure__cap">
            到第 i 级的两条来路（跨 1 级 / 跨 2 级）方案数相加；底部条带即 f[0..6]=1,1,2,3,5,8,13，斐波那契。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            这套「最后一步从哪来、把各来源方案数相加」的思路是计数 DP 的通法。换个场景就成了<strong>有界计数</strong>：如果每步能跨 <M>{'1\\sim K'}</M> 级，
            转移就扩成一段区间求和 <M>{'f[i]=\\sum_{t=1}^{K} f[i-t]'}</M>；如果每种「零件」还带件数上限，就是下面例题 <strong>P1077 摆花</strong> 那样的<strong>有限件计数</strong>。
            把这类「枚举本步取什么、累加各分支」的骨架写成中文伪代码：
          </p>
          <pre className="mono" style={preMono}>
{`# 一维计数（数楼梯 / 有界跳跃）
f[0] = 1                       # 地基：空走法算 1 种
for i = 1 to n:
    f[i] = 0
    for t = 1 to K:            # 最后一步跨 t 级（数楼梯 K=2）
        if i - t >= 0:
            f[i] += f[i - t]   # ★把 max 换成累加

# 有限件计数（第 i 种零件最多取 c 个，摆花即此形）
for i = 1 to n:
    for j = 0 to m:
        for k = 0 to min(c_i, j):
            g[i][j] += g[i-1][j-k]`}
          </pre>
        </div>
        <InfoBox kind="key" title="本质 · 算子决定问题，骨架不动">
          计数 DP 和最优 DP 共用同一副<strong>状态与转移骨架</strong>——「最后一步从哪来」这套拆分毫不改变；变的只是<strong>如何聚合各来源</strong>：
          最优用 <M>{'\\max'}</M> 挑一个，计数用 <M>{'+'}</M> 全加起来。两处硬改动记死：<strong><M>{'\\max\\to +'}</M></strong>、<strong>地基 <M>{'f[0]=1'}</M></strong>（空方案是唯一的起点火种）。
          这与 B 部分的 <Link to="/part/a/variant" style={{ color: 'var(--accent-2)' }}>背包综合变形</Link>是同一个道理——那里也是把背包转移的 <M>{'\\max'}</M> 换成 <M>{'+'}</M>、<M>{'f[0]=1'}</M>，就从「最大价值」变「凑数的方案数」。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用 <M>{'n=5'}</M> 走一遍（每步跨 1 或 2 级），把方程跑起来，手上先猜答案该是 <strong>8</strong>：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>撒地基。</b> <M>{'f[0]=1'}</M>（原地不动算 1 种）、<M>{'f[1]=1'}</M>（到第 1 级只能跨 1 级）。这两粒种子是整条数列的起点。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第 2、3 级。</b> <M>{'f[2]=f[1]+f[0]=1+1=2'}</M>（走法 <M>{'1{+}1'}</M> 与 <M>{'2'}</M>）；<M>{'f[3]=f[2]+f[1]=2+1=3'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>第 4 级。</b> <M>{'f[4]=f[3]+f[2]=3+2=5'}</M>——从第 3 级跨 1 级来的 3 种，加上从第 2 级跨 2 级来的 2 种。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>第 5 级。</b> <M>{'f[5]=f[4]+f[3]=5+3=8'}</M>——正是 <strong>8</strong> 种，和开头猜的吻合。数列到此是 <M>{'1,1,2,3,5,8'}</M>。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'f[i]'}</M> <strong>逐格累加</strong>给你看，高亮每一格由前两格（<M>{'f[i-1]'}</M>、<M>{'f[i-2]'}</M>）相加而来。改台阶数 <M>{'n'}</M>，看走法数实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看走法数一格一格叠出来</h2>
        <div className="demo">
          <div className="demo__body">
            <StairCountDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化 · 整数划分：二维计数 dp[i][j]</h2>
        <div className="prose">
          <p>
            数楼梯是一维计数。再上一层——<strong>整数划分</strong>：把正整数 <M>{'n'}</M> 写成<strong>若干正整数之和</strong>（无序，<M>{'3{+}2'}</M> 与 <M>{'2{+}3'}</M> 算同一种），问共有多少种拆法。
            比如 <M>{'5'}</M> 有 <strong>7</strong> 种：<M>{'5;\\ 4{+}1;\\ 3{+}2;\\ 3{+}1{+}1;\\ 2{+}2{+}1;\\ 2{+}1{+}1{+}1;\\ 1{+}1{+}1{+}1{+}1'}</M>。
            难点在「无序」：直接枚举会把 <M>{'3{+}2'}</M> 和 <M>{'2{+}3'}</M> 数两遍。破法是<strong>再加一维限制零件的大小</strong>，逼拆分只按「从大到小」这一种写法出现。
          </p>
          <p>
            设 <M>{'dp[i][j]'}</M> 表示<strong>把 <M>{'i'}</M> 拆成若干正整数、且每个数都不超过 <M>{'j'}</M> 的方案数</strong>。对「最大能用的零件 <M>{'j'}</M>」分两类：
          </p>
          <MB>{'dp[i][j]=dp[i][j-1]+dp[i-j][j]'}</MB>
          <p className="mono" style={{ fontSize: '13px', color: 'var(--text-3)', margin: 'calc(-1 * var(--sp-2)) 0 var(--sp-3)' }}>
            左项 dp[i][j−1] = 完全不用 j · 右项 dp[i−j][j] = 至少用一个 j
          </p>
          <p>
            <strong>不用 <M>{'j'}</M></strong>：那能用的数就收窄到 <M>{'\\le j-1'}</M>，方案数正是 <M>{'dp[i][j-1]'}</M>。<strong>至少用一个 <M>{'j'}</M></strong>：先拿掉一个 <M>{'j'}</M>，
            剩下的 <M>{'i-j'}</M> 仍可继续用 <M>{'\\le j'}</M> 的数去拆（可以再用 <M>{'j'}</M>），方案数是 <M>{'dp[i-j][j]'}</M>。两类<strong>不重不漏</strong>，相加即得。
            边界 <M>{'dp[0][j]=1'}</M>（把 0 拆开只有「空拆分」一种）。答案 <M>{'dp[n][n]'}</M>（零件不限大小）。
          </p>
        </div>
        <figure className="figure">
          <PartitionFigure />
          <figcaption className="figure__cap">
            dp[5][3] 由两个来源相加：左邻 dp[5][2]（完全不用 3）＋ 上方 dp[2][3]（先扣一个 3，余 2 再拆）。二维网格逐格填。
          </figcaption>
        </figure>
        <InfoBox kind="warn" title="常见陷阱 · 计数题常爆 long long，数楼梯更要高精度">
          方案数增长极快，随手用 <M>{'\\texttt{int}'}</M> 会溢出——<strong>计数一律先想 <M>{'\\texttt{long long}'}</M></strong>；题目要求取模的（如摆花 <M>{'\\bmod\\ 1000007'}</M>）则每步累加后立刻取模。
          更极端的是<strong>数楼梯</strong>（例题 P1255）：<M>{'n\\le 5000'}</M> 时 <M>{'f[n]'}</M> 有上千位，连 <M>{'\\texttt{long long}'}</M> 也远远装不下，必须写<strong>高精度</strong>（用数组逐位存、逐位进位相加）。
          「计数 DP + 高精度」是一对常见搭档，见到「求方案数且 <M>{'n'}</M> 很大又不取模」就该警觉。
        </InfoBox>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把整数划分的<strong>二维表 <M>{'dp[i][j]'}</M></strong>逐格填出来（行 = 拆的数 <M>{'i'}</M>，列 = 允许的最大零件 <M>{'j'}</M>），高亮每格的左邻与上方两个来源。改 <M>{'N'}</M> 看方案数实时重算——<M>{'N=5'}</M> 时右下角正是 <strong>7</strong>。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看整数划分的二维表填满</h2>
        <div className="demo">
          <div className="demo__body">
            <PartitionDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1255" name="数楼梯" src="洛谷原生" diff="普及-">
          <Field k="题意">
            一共 <M>{'n'}</M> 级楼梯，每步可跨 <strong>1 级或 2 级</strong>，求走到第 <M>{'n'}</M> 级的不同走法总数（<M>{'n\\le 5000'}</M>）。
          </Field>
          <Field k="状态 · 转移">
            <M>{'f[i]'}</M> = 到第 <M>{'i'}</M> 级的走法数，<M>{'f[i]=f[i-1]+f[i-2]'}</M>，<M>{'f[0]=f[1]=1'}</M>。就是斐波那契。
          </Field>
          <Field k="为什么选它">
            「计数 DP」与「<strong>高精度</strong>」的双料入门。递推本身一行写完，真正的门槛在 <M>{'n=5000'}</M> 时 <M>{'f[n]'}</M> 上千位、<M>{'\\texttt{long long}'}</M> 彻底爆掉——逼你把方案数用<strong>数组逐位相加</strong>。
          </Field>
          <Field k="陷阱 · 复杂度">
            必须高精度加法（逐位进位）；下标从 0 起对齐 <M>{'f[0]=1'}</M>。时间 <M>{'O(n\\cdot L)'}</M>（<M>{'L'}</M> 为位数）。
          </Field>
          <Field k="参考代码（高精度斐波那契）">
            <CodeBlock code={CODE_P1255} luogu="P1255" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1077" name="[NOIP2012 普及组] 摆花" src="NOIP2012 普及" diff="普及/提高-">
          <Field k="题意">
            <M>{'n'}</M> 种花，第 <M>{'i'}</M> 种最多摆 <M>{'a_i'}</M> 盆，一共要摆<strong>恰好 <M>{'m'}</M> 盆</strong>（同种花无区别、顺序固定），求方案数 <M>{'\\bmod\\ 1000007'}</M>。
          </Field>
          <Field k="对应关系">
            <strong>有限件计数背包</strong>：把「第 <M>{'i'}</M> 种花取 <M>{'k'}</M> 盆（<M>{'0\\le k\\le a_i'}</M>）」当决策，<M>{'f[i][j]'}</M> = 前 <M>{'i'}</M> 种恰摆 <M>{'j'}</M> 盆的方案数，<M>{'f[0][0]=1'}</M>。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[i][j]=\\sum_{k=0}^{\\min(a_i,j)} f[i-1][j-k]'}</M>，答案 <M>{'f[n][m]'}</M>；朴素 <M>{'O(nm\\bar a)'}</M>，对「枚举本种取几盆」那层可用<strong>前缀和</strong>优化掉一维到 <M>{'O(nm)'}</M>。
          </Field>
          <Field k="参考代码（有界计数 + 取模）">
            <CodeBlock code={CODE_P1077} luogu="P1077" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2401" name="不等数列" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            把 <M>{'1\\sim n'}</M> 填成一个排列，在相邻两数间填 <M>{'<'}</M> 或 <M>{'>'}</M>，求恰好有 <M>{'k'}</M> 个 <M>{'<'}</M> 的排列数 <M>{'\\bmod\\ 2015'}</M>。
          </Field>
          <Field k="为什么选它">
            <strong>逐个插入的排列计数</strong>范式：把最大的数 <M>{'i'}</M> 逐个插进已有排列，按「插入位置是否新增一个上升」建 <M>{'dp[i][j]'}</M>。它与练习 <strong>P2513 逆序对数列</strong>同源，是「增量插入 + 贡献计数」的样板。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[i][j]=dp[i-1][j]\\cdot(j+1)+dp[i-1][j-1]\\cdot(i-1-(j-1))'}</M>：插进已有上升位（含末尾，共 <M>{'j+1'}</M> 处）上升数不变；插进其余位置新增一个上升。答案 <M>{'dp[n][k]'}</M>，时间 <M>{'O(n^2)'}</M>。
          </Field>
          <Field k="参考代码（逐个插入 · 排列计数）">
            <CodeBlock code={CODE_P2401} luogu="P2401" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2513"
          name="[HAOI2009] 逆序对数列"
          hint="逐位插入 + 前缀和优化：dp[i][j] = 用 1..i 构成、恰有 j 个逆序对的排列数。把第 i 个数插进已有排列的某位会新增 0..i-1 个逆序对，故 dp[i][j] = Σ dp[i-1][j-t]（t=0..i-1），这段区间和用前缀和 O(1) 取，总复杂度 O(n·k)。与例题 P2401 同源。"
        />
        <Exercise
          pid="P1057"
          name="[NOIP2008 普及组] 传球游戏"
          hint="环上方案计数递推：f[i][j] = 传了 i 次后球在第 j 人手里的方案数，j 只能由左右两个邻居传来 → f[i][j] = f[i-1][j-1] + f[i-1][j+1]（下标按 n 个人的环取模）。起点 f[0][1]=1，答案 f[m][1]。"
        />
        <Exercise
          pid="P2404"
          name="自然数的拆分问题"
          hint="整数划分枚举 / 计数：把 n 拆成若干正整数之和（无序），本页二维 dp[i][j] 思路直接套用；本题还要求按字典序输出每种拆分，用 DFS 枚举「当前零件不小于上一个」即可，计数则读 dp[n][n]。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/b/fsm">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 线性状态机 DP
          </span>
        </Link>
        <span />
      </nav>
    </>
  )
}
