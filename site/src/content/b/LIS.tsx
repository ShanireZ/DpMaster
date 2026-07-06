import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import LISDemo from '../../components/demos/lis/LISDemo'
import LISPatienceDemo from '../../components/demos/lis/LISPatienceDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { SetupFigure, DecisionFigure, PatienceFigure } from './LISArt'

const CODE_B3637 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, ans, a[5005], dp[5005];

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    for (int i = 1; i <= n; i++)
    {
        dp[i] = 1;                      // 每个数自成长度 1 的上升串
        for (int j = 1; j < i; j++)     // 向左看能接在谁后面
        {
            if (a[j] < a[i])            // 严格上升才能接
            {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        ans = max(ans, dp[i]);          // ★LIS 可在任意位置结尾，取全局最大
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP LIS 最长上升子序列`

const CODE_P1020 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, a[100005];
int g1[100005], len1;            // 第一问：最长不升子序列的「结尾」栈
int g2[100005], len2;            // 第二问：最长上升子序列的「结尾」栈

int main()
{
    while (cin >> a[++n]);           // 读到文件尾，n 会多算 1
    n--;

    for (int i = 1; i <= n; i++)
    {
        // 第一问：一套系统能拦的最多导弹 = 最长「不升」子序列长度。
        // 维护一个「各长度的最大结尾」序列 g1（单调不升），二分找第一个 < a[i] 的位置替换。
        if (len1 == 0 || g1[len1] >= a[i])
        {
            g1[++len1] = a[i];
        }
        else
        {
            int l = 1, r = len1;
            while (l <= r)                       // 找第一个 g1[p] < a[i]
            {
                int mid = (l + r) >> 1;
                g1[mid] < a[i] ? r = mid - 1 : l = mid + 1;
            }
            g1[l] = a[i];
        }

        // 第二问（Dilworth）：最少拦截系统数 = 最长「上升」子序列长度。
        // g2 单调上升，二分找第一个 >= a[i] 的位置替换（lower_bound）。
        if (len2 == 0 || g2[len2] < a[i])
        {
            g2[++len2] = a[i];
        }
        else
        {
            int l = 1, r = len2;
            while (l <= r)                       // 找第一个 g2[p] >= a[i]
            {
                int mid = (l + r) >> 1;
                g2[mid] >= a[i] ? r = mid - 1 : l = mid + 1;
            }
            g2[l] = a[i];
        }
    }

    cout << len1 << endl << len2 << endl;
    return 0;
}
// TAG: LIS 最长不升 Dilworth 二分 O(nlogn)`

const CODE_P1091 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, ans, a[105];
int up[105], down[105];          // up[i]：以 i 结尾的最长上升；down[i]：从 i 起的最长下降

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    for (int i = 1; i <= n; i++)         // 正向：每人左侧的最长上升
    {
        up[i] = 1;
        for (int j = 1; j < i; j++)
        {
            if (a[j] < a[i])
            {
                up[i] = max(up[i], up[j] + 1);
            }
        }
    }

    for (int i = n; i >= 1; i--)         // 反向：每人右侧的最长下降
    {
        down[i] = 1;
        for (int j = n; j > i; j--)
        {
            if (a[j] < a[i])
            {
                down[i] = max(down[i], down[j] + 1);
            }
        }
    }

    for (int i = 1; i <= n; i++)         // 枚举峰顶 i，合唱队形长 up[i]+down[i]-1
    {
        ans = max(ans, up[i] + down[i] - 1);
    }

    cout << n - ans << endl;             // 最少出列 = 总人数 − 最长合唱队形
    return 0;
}
// TAG: 线性DP 双向LIS 枚举峰顶`

export default function LIS() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">什么是「上升子序列」</h2>
        <div className="prose">
          <p>
            给一串数 <M>{'a_1,a_2,\\dots,a_n'}</M>，<strong>子序列</strong>是从中挑出若干个数、<strong>保持原来的先后次序</strong>（但不必相邻）得到的序列；
            若挑出的这串数<strong>严格递增</strong>，就是一条<strong>上升子序列</strong>。我们要找的，是其中<strong>最长</strong>的一条——它的长度就是 LIS
            （Longest Increasing Subsequence）。
          </p>
        </div>
        <figure className="figure">
          <SetupFigure />
          <figcaption className="figure__cap">
            序列 2 1 5 3 6 4 8 9 7：柱高即数值。高亮的 1→3→6→8→9 是一条长度 5 的上升子序列——下标递增、数值也递增。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            盯住上图：<M>{'1,3,6,8,9'}</M> 这五个数在原序列里的<strong>下标</strong>是 <M>{'1<3<4<6<7'}</M>（递增，说明保持了原次序），
            对应的<strong>数值</strong> <M>{'1<3<6<8<9'}</M> 也递增——两个条件都满足，是合法的上升子序列。能不能更长？试遍所有挑法，答案是不能，所以这题的 LIS 长度是 <strong>5</strong>。
          </p>
          <p>
            那能不能<strong>贪心</strong>，从左到右「能接就接」？看这条链就会翻车：从 2 起步，遇到 5 接上（2,5），再遇 6 接上（2,5,6），
            往后 8、9 也接，得到 2,5,6,8,9——长度也是 5，碰巧不差。但若序列是 <M>{'1,100,2,3,4'}</M>，贪心从 1 接了 100 就卡死（后面再没有比 100 大的），只得长度 2；
            而正解是 <M>{'1,2,3,4'}</M> 长度 4。<strong>此刻接哪个数最好，取决于后面还有什么</strong>——这正是需要 DP 的信号。
          </p>
          <p>
            要枚举<strong>所有</strong>子序列？那是 <M>{'2^n'}</M> 种挑法，<M>{'n=1000'}</M> 就已无从枚举。下面用 DP 把它压成 <M>{'O(n^2)'}</M>，再进一步压到 <M>{'O(n\\log n)'}</M>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：以某个数「结尾」</h2>
        <div className="prose">
          <p>
            难点在于「子序列可以在任意位置结尾」，直接对整体设状态很滑。换个抓手：<strong>强制枚举它以哪个数结尾</strong>。
            设 <M>{'dp[i]'}</M> 表示：<strong>以 <M>{'a_i'}</M> 为最后一个元素</strong>的最长上升子序列的长度。这样每条上升子序列都被它的结尾唯一「认领」，不重不漏。
          </p>
        </div>
        <figure className="figure">
          <DecisionFigure />
          <figcaption className="figure__cap">
            算 dp（以 9 结尾）：向左看每个比 9 小的数，谁的 dp 最大就接在谁后面，再 +1。这里 6 的 dp=3 最大，故 dp=3+1=4。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            怎么算 <M>{'dp[i]'}</M>？既然它<strong>以 <M>{'a_i'}</M> 结尾</strong>，那 <M>{'a_i'}</M> 前面那个数 <M>{'a_j'}</M> 必须满足两件事：下标更靠前（<M>{'j<i'}</M>）、数值更小（<M>{'a_j<a_i'}</M>，才「上升」）。
            在所有这样的 <M>{'j'}</M> 里，谁结尾的子序列最长（<M>{'dp[j]'}</M> 最大），就把 <M>{'a_i'}</M> 接到它后面，长度 <M>{'+1'}</M>：
          </p>
          <MB>{'dp[i]=1+\\max_{\\,j<i,\\ a_j<a_i}dp[j]'}</MB>
          <p>
            如果左边没有任何更小的数可接，这个 <M>{'\\max'}</M> 为空，<M>{'dp[i]'}</M> 就取<strong>初值 1</strong>（<M>{'a_i'}</M> 自己单独成一条长度 1 的串）。
            最终答案不是 <M>{'dp[n]'}</M>——因为 LIS 可以在任何位置收尾——而是<strong>整个 dp 数组的最大值</strong>：
          </p>
          <MB>{'\\text{LIS}=\\max_{1\\le i\\le n}dp[i]'}</MB>
        </div>
        <InfoBox kind="key" title="本质">
          「以 <M>{'a_i'}</M> 结尾」这个限定，把「求全局最长」拆成了 <M>{'n'}</M> 个彼此独立、可按下标顺序递推的小问题。
          每个 <M>{'dp[i]'}</M> 只依赖它<strong>左边</strong>已算好的 <M>{'dp[j]'}</M>，于是 <M>{'2^n'}</M> 种挑法被 <M>{'O(n^2)'}</M> 次比较装下。★答案取全行最大，别顺手写成 <M>{'dp[n]'}</M>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用序列 <M>{'a=[2,1,5,3,6]'}</M> 走几步（下标从 1 记），把方程跑起来：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>前两个数。</b> <M>{'dp[1]=1'}</M>（2 自成一串）；到 1 时，左边只有 2，而 <M>{'2<1'}</M> 不成立，接不上 → <M>{'dp[2]=1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>第 3 个数 5。</b> 左边 <M>{'2<5'}</M>、<M>{'1<5'}</M> 都能接，取 <M>{'\\max(dp[1],dp[2])+1=\\max(1,1)+1=2'}</M> → <M>{'dp[3]=2'}</M>（如 2,5）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>第 4 个数 3。</b> 能接的是 <M>{'2<3'}</M>、<M>{'1<3'}</M>（<M>{'5<3'}</M> 不行），<M>{'\\max(dp[1],dp[2])+1=2'}</M> → <M>{'dp[4]=2'}</M>（如 2,3）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">4</span>
            <div className="step__b">
              <b>第 5 个数 6。</b> 左边全比它小，来源里 <M>{'dp[3]=2'}</M>（结尾 5）与 <M>{'dp[4]=2'}</M>（结尾 3）最大，<M>{'2+1=3'}</M> → <M>{'dp[5]=3'}</M>。
              当前全行最大是 <strong>3</strong>（如 2,5,6 或 2,3,6）。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'dp[]'}</M> 逐格填出来，并高亮每个 <M>{'dp[i]'}</M> 向左扫描时「能接 / 跳过 / 采纳」的来源。改数组、加删元素，或换个预设看它实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一格一格长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <LISDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：O(n log n) 贪心 + 二分</h2>
        <div className="prose">
          <p>
            <M>{'O(n^2)'}</M> 应付 <M>{'n\\le 5000'}</M> 绰绰有余，但 <M>{'n=10^5'}</M> 就会超时。瓶颈在那句「向左扫所有 <M>{'j'}</M>」。能不能不扫？
            关键洞察是一个贪心：<strong>要让子序列有机会更长，同样长度的上升子序列，它的结尾越小越好</strong>——结尾越小，后面越容易接上更多数。
          </p>
          <p>
            于是维护一个数组 <M>{'tails'}</M>：<M>{'tails[k]'}</M> 表示<strong>所有长度为 <M>{'k{+}1'}</M> 的上升子序列中，最小的那个结尾</strong>。
            它有个漂亮性质——<strong><M>{'tails'}</M> 本身严格递增</strong>（长度越长，最小结尾必然越大）。逐个处理 <M>{'a_i'}</M>：
          </p>
        </div>
        <figure className="figure">
          <PatienceFigure />
          <figcaption className="figure__cap">
            两种动作：① 当前数比 tails 末尾大 → 追加到末尾，LIS 长度 +1；② 否则二分找第一个 ≥ 它的位置，替换掉——把那个长度的结尾压得更小。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>动作一 · 追加。</strong>若 <M>{'a_i'}</M> 比 <M>{'tails'}</M> 当前末尾还大，它能接在<strong>最长</strong>那条的后面，于是把它<strong>追加</strong>到 <M>{'tails'}</M> 末尾——LIS 长度增长 1。
          </p>
          <p>
            <strong>动作二 · 替换。</strong>否则，用<strong>二分</strong>在 <M>{'tails'}</M> 里找<strong>第一个 <M>{'\\ge a_i'}</M> 的位置</strong>（<M>{'\\texttt{lower\\_bound}'}</M>），把那一格<strong>替换</strong>成 <M>{'a_i'}</M>。
            含义是：某个长度的子序列，如今找到了一个<strong>更小的结尾</strong>，长度没变，但为后面接续腾出了更多空间。
          </p>
          <p>
            因为 <M>{'tails'}</M> 始终有序，二分只需 <M>{'O(\\log n)'}</M>，总复杂度降到 <strong><M>{'O(n\\log n)'}</M></strong>。
            <strong>最终 <M>{'tails'}</M> 的长度就是 LIS</strong>。要当心一个常见误解：<M>{'tails'}</M> 的<strong>内容</strong>不一定是某条真实存在的上升子序列（它是被反复替换出来的），
            但它的<strong>长度</strong>恒等于 LIS，这才是我们要的答案。
          </p>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的动画把耐心排序逐元素放慢：看每个数如何二分命中 <M>{'tails'}</M> 的某一格——追加（末尾长出新格）还是替换（某格数字被压小）。同一个「经典乱序」，最终 <M>{'tails'}</M> 长度依旧是 <strong>5</strong>，和上面 <M>{'O(n^2)'}</M> 的答案完全一致。
        </div>
        <div className="demo">
          <div className="demo__body">
            <LISPatienceDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="常见陷阱 · 严格上升 vs 不降">
          求<strong>严格</strong>上升子序列，二分用 <M>{'\\texttt{lower\\_bound}'}</M>（第一个 <M>{'\\ge a_i'}</M>，相等也替换）；若改求<strong>不降</strong>（允许相等）子序列，则要换成 <M>{'\\texttt{upper\\_bound}'}</M>（第一个 <M>{'> a_i'}</M>）。
          一字之差，结果就差一截——<Link to="/part/b/lcs" style={{ color: 'var(--accent-2)' }}>下一节 LCS</Link> 里 <strong>P1439 排列 LCS</strong> 正是靠把问题转成 LIS、再用这套二分做到 <M>{'O(n\\log n)'}</M> 的。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="B3637" name="最长上升子序列" src="洛谷原生" diff="入门">
          <Field k="题意">
            给定长度 <M>{'n'}</M> 的序列，求其最长<strong>严格上升</strong>子序列的长度。
          </Field>
          <Field k="为什么选它">
            最裸的 LIS 模板，<M>{'n\\le 5000'}</M> 正好让 <M>{'O(n^2)'}</M> 双层循环通过——拿来把「以 <M>{'a_i'}</M> 结尾 + 全行取最大」这套状态设计写熟，一行不多一行不少。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[i]=1+\\max_{j<i,\\,a_j<a_i}dp[j]'}</M>，答案 <M>{'\\max_i dp[i]'}</M>；时间 <M>{'O(n^2)'}</M>。
          </Field>
          <Field k="参考代码（O(n²) 裸模板）">
            <CodeBlock code={CODE_B3637} luogu="B3637" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1020" name="[NOIP1999 提高组] 导弹拦截" src="NOIP1999 提高" diff="提高+/省选-">
          <Field k="题意">
            一套拦截系统首发不限高度，此后每发不能高于前一发。给出依次飞来的导弹高度，求：① 一套系统最多拦几发；② 最少几套系统才能全拦。
          </Field>
          <Field k="对应关系">
            ① = 最长<strong>不升</strong>子序列长度；② 由 <strong>Dilworth 定理</strong>，「最少用几条不升子序列覆盖整个序列」等于「最长<strong>上升</strong>子序列长度」。
          </Field>
          <Field k="为什么选它">
            <M>{'n'}</M> 可达十万级，<M>{'O(n^2)'}</M> 会 T——<strong>逼你上 <M>{'O(n\\log n)'}</M> 二分</strong>。同时它把「不升」和「上升」两种变体、以及 Dilworth 这条经典结论一次讲透，是 LIS 进阶第一题。
          </Field>
          <Field k="转移 · 复杂度">
            两个单调栈 <M>{'g1'}</M>（不升）、<M>{'g2'}</M>（上升）各做一遍二分替换；时间 <M>{'O(n\\log n)'}</M>。
          </Field>
          <Field k="参考代码（O(n log n) 二分 + Dilworth）">
            <CodeBlock code={CODE_P1020} luogu="P1020" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1091" name="[NOIP2004 提高组] 合唱队形" src="NOIP2004 提高" diff="普及/提高-">
          <Field k="题意">
            <M>{'n'}</M> 名同学各有身高，要求出列若干人后剩下的队形<strong>先升后降</strong>（存在一个峰顶）。求最少出列多少人。
          </Field>
          <Field k="为什么选它">
            典型的<strong>双向 LIS</strong>：正着做一遍「以 <M>{'i'}</M> 结尾的最长上升」<M>{'up[i]'}</M>，反着做一遍「从 <M>{'i'}</M> 起的最长下降」<M>{'down[i]'}</M>，
            再<strong>枚举峰顶</strong> <M>{'i'}</M>——它教会你 LIS 不止正向一种跑法，正反两遍再拼接是一大类题的通法。
          </Field>
          <Field k="转移 · 复杂度">
            峰顶在 <M>{'i'}</M> 的合唱队形长 <M>{'up[i]+down[i]-1'}</M>，答案 <M>{'n-\\max_i(up[i]+down[i]-1)'}</M>；时间 <M>{'O(n^2)'}</M>（<M>{'n\\le 100'}</M> 足够）。
          </Field>
          <Field k="参考代码（双向 LIS + 枚举峰顶）">
            <CodeBlock code={CODE_P1091} luogu="P1091" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2782"
          name="友好城市"
          hint="二维偏序转 LIS：把每座城市看成 (南岸坐标, 北岸坐标)，按南岸排序后，答案就是北岸坐标的最长上升子序列——排序消去一维，剩一维做 LIS。"
        />
        <Exercise
          pid="P1439"
          name="【模板】最长公共子序列"
          hint="两个排列的 LCS：把 a 中每个值映射成它在 a 里的位置，再把 b 按这个映射改写，b 的 LIS 长度就是答案，用 O(n log n) 二分。（亦属 A4 LCS。）"
        />
        <Exercise
          pid="P1725"
          name="琪露诺"
          hint="LIS 思想的延伸——带区间转移的线性 DP：dp[i] 从 [i−r, i−l] 这段窗口取最大值转移，用单调队列把每步的区间最大值优化到 O(1)。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/b/maxseg">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 最大子段和
          </span>
        </Link>
        <Link to="/part/b/lcs" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            最长公共子序列 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
