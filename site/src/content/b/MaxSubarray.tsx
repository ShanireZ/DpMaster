import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import MaxSubarrayDemo from '../../components/demos/linear/MaxSubarrayDemo'
import MaxSegRingDemo from '../../components/demos/linear/MaxSegRingDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { SetupFigure, DecisionFigure, RingFigure } from './MaxSubarrayArt'

const CODE_P1115 = `
#include <algorithm>
#include <iostream>
using namespace std;

int n, a;
int dp, ans;                     // dp：以当前数结尾的最大子段和；ans：全局最大

int main()
{
    cin >> n;
    cin >> a;
    dp = a;                          // 第一个数：只能自成一段
    ans = a;                         // ★ans 初值设成 a[1]，别设 0（全负时会错）
    for (int i = 2; i <= n; i++)
    {
        cin >> a;
        dp = max(dp + a, a);         // 接续 dp+a 还是另起 a，取较大
        ans = max(ans, dp);          // 子段可在任意位置结尾，随时刷新全局最大
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 最大子段和 Kadane`

const CODE_P2642 = `
#include <algorithm>
#include <iostream>
using namespace std;

const int MX = 1000005;
long long a[MX];
long long pre[MX], suf[MX];      // pre[i]：以 i 结尾的最大子段；suf[i]：以 i 开头的最大子段
long long bp[MX], bs[MX];        // bp[i]：前缀 [1..i] 里的最大子段；bs[i]：后缀 [i..n] 里的最大子段

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
    }

    pre[1] = a[1];
    for (int i = 2; i <= n; i++)                 // 正向 Kadane，落成「以 i 结尾」
    {
        pre[i] = max(pre[i - 1] + a[i], a[i]);
    }
    bp[1] = pre[1];
    for (int i = 2; i <= n; i++)                 // 前缀最大子段（可结尾于 ≤ i 处）
    {
        bp[i] = max(bp[i - 1], pre[i]);
    }

    suf[n] = a[n];
    for (int i = n - 1; i >= 1; i--)             // 反向 Kadane，落成「以 i 开头」
    {
        suf[i] = max(suf[i + 1] + a[i], a[i]);
    }
    bs[n] = suf[n];
    for (int i = n - 1; i >= 1; i--)             // 后缀最大子段（可开头于 ≥ i 处）
    {
        bs[i] = max(bs[i + 1], suf[i]);
    }

    long long ans = -0x3f3f3f3f3f3f3f3f;
    for (int i = 2; i < n; i++)                  // 枚举被跳过的中间数 i：左段收尾于 ≤ i-1，右段起于 ≥ i+1
    {
        ans = max(ans, bp[i - 1] + bs[i + 1]);   // 两段不相交且至少隔开中间的 i，各取自己那侧的最大
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 最大子段和 两段不相交 前后缀`

const CODE_P1121 = `
#include <algorithm>
#include <iostream>
using namespace std;

const int MX = 200005;
const long long INF = 0x3f3f3f3f3f3f3f3f;
int n;
long long a[MX], tot;

// 序列 b[l..r] 里选「恰好 K 段不相交、非空」子段的最大总和。
// f[j]=已选 j 段的最大和；g[j]=已选 j 段且第 j 段延伸到当前位的最大和。
long long kmax(long long b[], int l, int r, int K)
{
    long long f[3], g[3];
    for (int j = 0; j <= K; j++)
    {
        f[j] = -INF, g[j] = -INF;
    }
    f[0] = 0;
    for (int i = l; i <= r; i++)
    {
        for (int j = K; j >= 1; j--)             // ★逆序 j，防第 j 段在本轮被重复计入
        {
            g[j] = max(f[j - 1], g[j]) + b[i];   // 新开一段 或 延续第 j 段
            f[j] = max(f[j], g[j]);
        }
    }
    return f[K];
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        tot += a[i];
    }

    // 情况一：两段都不跨首尾 —— 序列 a[1..n] 上直接选最大两段。
    long long ans = kmax(a, 1, n, 2);

    // 情况二：有段跨首尾 —— 剩下的绕首尾两段 = 总和 − (中间挖掉的最小两段)。
    // 挖掉的两段必须落在「掐头去尾」的 a[2..n−1] 内，才能把环切成两段弧（首尾各留 ≥1）。
    // 最小两段 = −(在 −a 上的最大两段)，故 ans 候选 = tot + kmax(−a, 2..n−1, 2)。
    if (n >= 4)                                  // 内层至少 2 个元素才能挖两段
    {
        for (int i = 1; i <= n; i++)
        {
            a[i] = -a[i];
        }
        ans = max(ans, tot + kmax(a, 2, n - 1, 2));
    }

    cout << ans << endl;
    return 0;
}
// TAG: 线性DP 环状最大两段子段和 K段DP 补集`

export default function MaxSubarray() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">什么是「最大子段和」</h2>
        <div className="prose">
          <p>
            给一串数 <M>{'a_1,a_2,\\dots,a_n'}</M>（<strong>可正可负</strong>），<strong>子段</strong>是原序列里<strong>连续的一段</strong> <M>{'a_l,a_{l+1},\\dots,a_r'}</M>——
            注意和「子序列」不同，子段必须<strong>挨着取、不能跳</strong>。我们要找的，是所有子段里<strong>和最大</strong>的那一段（一般要求非空，至少含一个数）。
          </p>
        </div>
        <figure className="figure">
          <SetupFigure />
          <figcaption className="figure__cap">
            序列 −2, 11, −4, 13, −5, −2：柱高即数值（正上负下）。高亮的连续一段 11,−4,13 之和为 20，是最大子段——中间那个 −4 虽是负数，但为了连起两侧的大正数，值得含进来。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            盯住上图那段 <M>{'11,-4,13'}</M>：它跨过了一个负数 <M>{'-4'}</M>，可总和 <M>{'11-4+13=20'}</M> 仍是最优。
            这就是难点所在——<strong>要不要把当前这个数接进来，取决于前面攒下的和是正是负</strong>：前面若攒了正的一坨（如 <M>{'11-4=7'}</M>），哪怕眼下遇到 <M>{'13'}</M> 也该接上去滚成 <M>{'20'}</M>；
            可前面若攒成了负数，那这负担就该<strong>果断丢掉、从当前数重新起一段</strong>。
          </p>
          <p>
            最笨的办法是枚举左右端点 <M>{'l,r'}</M> 再累加，那是 <M>{'O(n^3)'}</M>；加前缀和也要 <M>{'O(n^2)'}</M>。
            当 <M>{'n=2\\times10^5'}</M>，这些都会超时。下面用一个只扫一遍的 DP——<strong>Kadane 算法</strong>——把它压到 <M>{'O(n)'}</M>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：接续，还是另起</h2>
        <div className="prose">
          <p>
            沿用 <Link to="/part/b/lis" style={{ color: 'var(--accent-2)' }}>LIS</Link> 那把母题抓手：最大子段落在哪儿事先不知道，与其对「全局最优段」直接设状态，不如<strong>钉住它的结尾</strong>。
            设 <M>{'dp[i]'}</M> 表示：<strong>以 <M>{'a_i'}</M> 为最后一个元素</strong>的最大子段和。于是 <M>{'n'}</M> 个不同结尾把所有候选段分门别类地兜住，一个也不漏、一个也不重。
          </p>
        </div>
        <figure className="figure">
          <DecisionFigure />
          <figcaption className="figure__cap">
            每个 dp[i] 只有两条路：把 a[i] 接在前一段后面（dp[i−1]+a[i]），或让它自己另起一段（a[i]）。谁大取谁。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            怎么算 <M>{'dp[i]'}</M>？既然它<strong>以 <M>{'a_i'}</M> 结尾</strong>，那 <M>{'a_i'}</M> 左边紧挨着的那段，只有两种可能：
          </p>
          <p>
            <strong>接续</strong>：把 <M>{'a_i'}</M> 接在「以 <M>{'a_{i-1}'}</M> 结尾的最优段」后面，得 <M>{'dp[i-1]+a_i'}</M>。
          </p>
          <p>
            <strong>另起</strong>：前面那段是负担（<M>{'dp[i-1]<0'}</M>），干脆扔掉，让 <M>{'a_i'}</M> <strong>自己单独成一段</strong>，得 <M>{'a_i'}</M>。
          </p>
          <p>两条路取较大，就是<strong>转移方程</strong>：</p>
          <MB>{'dp[i]=\\max\\big(dp[i-1]+a_i,\\ a_i\\big)'}</MB>
          <p>
            边界：<M>{'dp[1]=a_1'}</M>（第一个数只能自成一段）。答案<strong>不是</strong> <M>{'dp[n]'}</M>——因为最大子段可在任何位置收尾——而是<strong>整个 <M>{'dp'}</M> 数组的最大值</strong>：
          </p>
          <MB>{'\\text{ans}=\\max_{1\\le i\\le n}dp[i]'}</MB>
        </div>
        <InfoBox kind="key" title="本质">
          「以 <M>{'a_i'}</M> 结尾」这个限定，把「求全局最大子段」拆成了 <M>{'n'}</M> 个可顺序递推的小问题。转移只回看<strong>一格</strong> <M>{'dp[i-1]'}</M>，于是一趟 <M>{'O(n)'}</M> 扫描就够，连数组都能省成一个滚动变量。★答案取<strong>全行最大</strong>，且全为负数时 <M>{'\\text{ans}'}</M> 初值必须设成 <M>{'a_1'}</M> 而非 <M>{'0'}</M>，否则会误答 0。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用序列 <M>{'a=[-2,11,-4,13,-5,-2]'}</M> 走几步（下标从 1 记），把方程跑起来：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>起点。</b> <M>{'dp[1]=a_1=-2'}</M>（第一个数只能自成一段）。当前全局最大 <M>{'\\text{ans}=-2'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>到 11。</b> 接续 <M>{'dp[1]+11=-2+11=9'}</M>，另起 <M>{'11'}</M>。<strong>另起更大</strong>（前面 <M>{'-2'}</M> 是负担）→ <M>{'dp[2]=11'}</M>，<M>{'\\text{ans}=11'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>到 −4。</b> 接续 <M>{'11+(-4)=7'}</M>，另起 <M>{'-4'}</M>。接续更大 → <M>{'dp[3]=7'}</M>（含住这个负数，赌后面有更大的正数）。<M>{'\\text{ans}'}</M> 仍 <M>{'11'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>到 13。</b> 接续 <M>{'7+13=20'}</M>，另起 <M>{'13'}</M>。接续更大 → <M>{'dp[4]=20'}</M>。赌赢了——刷新 <M>{'\\text{ans}=20'}</M>，正是那段 <M>{'11,-4,13'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">4</span>
            <div className="step__b">
              <b>剩下 −5、−2。</b> <M>{'dp[5]=\\max(20-5,-5)=15'}</M>，<M>{'dp[6]=\\max(15-2,-2)=13'}</M>，都没超过 <M>{'20'}</M>。扫完，<strong>答案 20</strong>。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'dp[]'}</M> 逐格填出来，并高亮每一步「接续（连回 <M>{'dp[i-1]'}</M>）还是另起」的抉择。改数组、加删元素，或换个预设看它实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一格一格长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <MaxSubarrayDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化 · 环形：断环与补集</h2>
        <div className="prose">
          <p>
            换个设定：这串数<strong>首尾相接成一个环</strong>，子段可以<strong>跨过末尾绕回开头</strong>（例如 <M>{'a_{n-1},a_n,a_1,a_2'}</M> 是合法的一段）。最大子段和又该怎么求？
          </p>
          <p>
            分两种情况。<strong>其一，最优段不跨首尾</strong>——那它就是普通的一段，直接跑一遍上面的 Kadane 即可。
            <strong>其二，最优段跨过了首尾</strong>——这时它由「结尾的一截」和「开头的一截」拼成，绕过了中间某一段。
            关键一步是<strong>反着看</strong>：一个「绕首尾的段」和它「中间被绕过的那段」正好互补，两者拼起来是<strong>整个环</strong>。记 <M>{'\\text{total}=\\sum a_i'}</M>，则「绕首尾的最大段」等于总和减去中间被绕过的那段：
          </p>
          <MB>{'\\text{wrap}=\\text{total}-\\text{minSeg}'}</MB>
          <p>
            要让绕首尾的段最大，就要让<strong>中间挖掉的那段最小</strong>——而这个 <M>{'\\text{minSeg}'}</M>（最小子段和）把 Kadane 里的 <M>{'\\max'}</M> 换成 <M>{'\\min'}</M> 就能一趟求出。最终答案取两种情况的较大者：
          </p>
          <MB>{'\\text{ans}=\\max\\big(\\text{maxSeg},\\ \\text{total}-\\text{minSeg}\\big)'}</MB>
        </div>
        <figure className="figure">
          <RingFigure />
          <figcaption className="figure__cap">
            环形 2,−1,2,−1,2：普通 Kadane 全取得 4；但绕过中间的最小子段 −1（total − minSeg = 4 − (−1) = 5）更优——最优段跨过了首尾。
          </figcaption>
        </figure>
        <InfoBox kind="warn" title="常见陷阱 · 全正数会绕整圈">
          用 <M>{'\\text{total}-\\text{minSeg}'}</M> 时，若数组<strong>全为正数</strong>，最小子段会退化成「最小的单个元素」，<M>{'\\text{total}-\\text{minSeg}'}</M> 相当于「几乎绕整整一圈」，把同一个环重复计入——非法。
          稳妥写法：仅当最小子段<strong>没有吃掉整个数组</strong>（还留下至少一个元素）时才采用补集；实践中若普通 Kadane 的结果已 <M>{'\\ge0'}</M>，直接取两者较大即可自然避开这个坑。
        </InfoBox>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面把两种算法<strong>并排跑给你看</strong>：左边普通 Kadane 求「不跨首尾」的最大段，右边把 <M>{'\\max'}</M> 换成 <M>{'\\min'}</M> 求最小子段、再用 <M>{'\\text{total}-\\text{minSeg}'}</M> 求「绕首尾」的段。改数值看谁胜出。
        </div>
        <div className="demo">
          <div className="demo__body">
            <MaxSegRingDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1115" name="最大子段和" src="洛谷原生" diff="普及-">
          <Field k="题意">
            给定长度 <M>{'n'}</M> 的整数序列（含负数），求<strong>最大子段和</strong>（连续、非空的一段）。
          </Field>
          <Field k="为什么选它">
            最裸的 Kadane 模板，<M>{'n\\le 2\\times10^5'}</M> 逼你放弃 <M>{'O(n^2)'}</M> 前缀和暴力、写出一趟 <M>{'O(n)'}</M> 的「接续 vs 另起」——把这套状态设计写熟，一个滚动变量就够。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp=\\max(dp+a_i,\\ a_i)'}</M>，答案 <M>{'\\max_i dp_i'}</M>；时间 <M>{'O(n)'}</M>，空间 <M>{'O(1)'}</M>。★<M>{'\\text{ans}'}</M> 初值取 <M>{'a_1'}</M>，防全负误答 0。
          </Field>
          <Field k="参考代码（滚动变量 Kadane）">
            <CodeBlock code={CODE_P1115} luogu="P1115" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2642" name="双子序列最大和" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            在序列中选<strong>两段不相交、非空</strong>的子段，使两段和最大。求这个最大值。
          </Field>
          <Field k="为什么选它">
            把「两段不相交」单独练透，是环形题 P1121 的台阶。核心套路是<strong>前后缀最优拼接</strong>：正向求「前缀内最大子段」<M>{'bp[i]'}</M>、反向求「后缀内最大子段」<M>{'bs[i]'}</M>，再枚举<strong>被跳过的中间数</strong> <M>{'i'}</M>，让左段取 <M>{'bp[i-1]'}</M>、右段取 <M>{'bs[i+1]'}</M> 各据一侧——这是一大类「拆成互不相交若干段」问题的通法。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'pre/suf'}</M> 各跑一遍 Kadane，<M>{'bp/bs'}</M> 做前后缀最大；答案 <M>{'\\max_{2\\le i<n}(bp[i{-}1]+bs[i{+}1])'}</M>（枚举被跳过的中间数 <M>{'i'}</M>，保证两段隔开）；时间 <M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（前后缀最优拼接）">
            <CodeBlock code={CODE_P2642} luogu="P2642" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1121" name="环状最大两段子段和" src="洛谷原生" diff="提高+/省选-">
          <Field k="题意">
            序列<strong>首尾相接成环</strong>，选<strong>两段不相交、非空</strong>的子段（可跨首尾），求两段和最大。
          </Field>
          <Field k="为什么选它">
            一题同时叠<strong>环形</strong>与<strong>两段不相交</strong>两个变形，是本类集大成。核心是<strong>「恰好 K 段不相交」DP</strong>（<M>{'f[j]'}</M>=已选 <M>{'j'}</M> 段的最大和、<M>{'g[j]'}</M>=第 <M>{'j'}</M> 段延伸到当前位）加上一层补集：<strong>情况一</strong>两段都不跨首尾，直接在 <M>{'a'}</M> 上求最大两段；<strong>情况二</strong>有段跨首尾，剩下的绕首尾两段等于「总和减去中间挖掉的最小两段」，而<strong>中间的最小两段</strong>又等于「在 <M>{'-a'}</M> 上求最大两段」再取负。讲透「用补集绕开环」。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'kmax(b,K)'}</M> 对 <M>{'j'}</M> <strong>逆序</strong>更新 <M>{'g[j]=\\max(f[j-1],g[j])+b_i,\\ f[j]=\\max(f[j],g[j])'}</M>；两种情况各调一次（第二种在掐头去尾的 <M>{'-a[2..n-1]'}</M> 上），取较大，时间 <M>{'O(nK)'}</M>。★情况二必须给首尾各留至少一个元素，别让挖掉的两段吃光整环。
          </Field>
          <Field k="参考代码（恰好 K 段 DP + 补集）">
            <CodeBlock code={CODE_P1121} luogu="P1121" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1719"
          name="最大加权矩形"
          hint="二维压一维：枚举上下边界两行，把这两行之间每列求和压成一维数组，问题就退化成对这一维做一次最大子段和（Kadane）。外层枚举 O(n²) 对行界，内层 O(m) 跑 Kadane。"
        />
        <Exercise
          pid="P2642"
          name="双子序列最大和（回炉自测）"
          hint="上面精讲过的「两段不相交」——先合上参考代码，自己独立把前后缀 bp[]/bs[] 推一遍再枚举分界；吃透它，环形的 P1121 就只是再叠一层补集。"
        />
        <div className="prose" style={{ marginTop: 'var(--sp-4)' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--text-3)' }}>
            小字说明：最大子段和的洛谷<strong>原生练习池偏窄</strong>（多数同类题是本页例题本身）。除上面两题外，建议把例题 <strong>P1121 / P2642</strong> 当自测——先合上参考代码独立写、再对照，是巩固「环形 / 两段不相交」最有效的方式。
          </p>
        </div>
      </section>

      <nav className="type-nav">
        <Link to="/part/b/path">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 路径型 / 递推入门
          </span>
        </Link>
        <Link to="/part/b/lis" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            最长上升子序列 LIS <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
