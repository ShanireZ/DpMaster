import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import RingIntervalDemo from '../../components/demos/interval/RingIntervalDemo'
import RingChainDemo from '../../components/demos/interval/RingChainDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { RingSetupFigure, BreakRingFigure, WindowScanFigure } from './RingIntervalArt'

const CODE_P1880 = `
#include <iostream>
using namespace std;

const int INF = 0x3f3f3f3f;
int a[205];                       // ★断环为链：a[i] 与 a[i+n] 同值，链长 2n
int pre[205];                     // 前缀和，sum(l..r) = pre[r] - pre[l-1]
int f[205][205];                 // 最小合并代价
int g[205][205];                 // 最大合并代价

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        a[i + n] = a[i];          // ★复制一倍，接成长度 2n 的链
    }
    for (int i = 1; i <= 2 * n; i++)
        pre[i] = pre[i - 1] + a[i];

    for (int len = 2; len <= n; len++)          // 区间长度只需到 n（一整圈）
        for (int l = 1; l + len - 1 <= 2 * n; l++)
        {
            int r = l + len - 1;
            int s = pre[r] - pre[l - 1];        // 本区间合并追加的代价
            f[l][r] = INF;
            g[l][r] = -INF;
            for (int k = l; k <= r - 1; k++)    // 枚举分割点 k
            {
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s);
                g[l][r] = max(g[l][r], g[l][k] + g[k + 1][r] + s);
            }
        }

    int mn = INF, mx = -INF;
    for (int i = 1; i <= n; i++)                 // ★枚举 n 个长度为 n 的窗口
    {
        mn = min(mn, f[i][i + n - 1]);
        mx = max(mx, g[i][i + n - 1]);
    }
    cout << mn << endl;                          // 一题双问：最小、最大
    cout << mx << endl;
    return 0;
}`

const CODE_P1063 = `
#include <iostream>
using namespace std;

int e[205];                       // 珠子上的标记值，断环为链后长 2n
long long f[205][205];           // f[i][j]：把标记 i..j 之间的珠子合成一颗的最大释放能量

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> e[i];
        e[i + n] = e[i];          // ★复制一倍
    }

    long long ans = 0;
    for (int len = 2; len <= n; len++)          // len = 相邻标记跨度，含 len 个原珠首尾标记
        for (int i = 1; i + len <= 2 * n; i++)
        {
            int j = i + len;                    // 合成后新珠的两端标记 e[i]、e[j]
            for (int k = i + 1; k < j; k++)     // 枚举最后一次并珠处的中间标记 k
            {
                long long v = f[i][k] + f[k][j] + (long long)e[i] * e[k] * e[j];
                f[i][j] = max(f[i][j], v);       // ★最后一并释放 head*mid*tail
            }
            if (len == n)                        // 一整圈：更新答案
                ans = max(ans, f[i][j]);
        }

    cout << ans << endl;
    return 0;
}`

export default function RingInterval() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当石子摆成一个环</h2>
        <div className="prose">
          <p>
            上一节的石子排成一条<strong>链</strong>：两端是「头」和「尾」，谁也不挨着谁。可
            <Link to="/part/c/stone" style={{ color: 'var(--accent-2)' }}>石子合并</Link>的原题（P1880）里，石子其实摆成一个
            <strong>环</strong>——第 <M>{'n-1'}</M> 堆与第 <M>{'0'}</M> 堆<strong>也相邻</strong>，也能合并。规则不变：每次并<strong>相邻两堆</strong>、代价为两堆之和，直到剩一堆，求最小（或最大）总代价。
          </p>
        </div>
        <figure className="figure">
          <RingSetupFigure />
          <figcaption className="figure__cap">环形石子：n 堆首尾相接，第 0 堆与第 n-1 堆之间多出一条「链形没有」的相邻边——这正是环与链唯一的差别。</figcaption>
        </figure>
        <div className="prose">
          <p>
            差别虽小，却<strong>不能直接照搬链形</strong>。链形 <M>{'dp[1][n]'}</M> 默认最后剩下的那堆<strong>断在第 <M>{'1'}</M> 堆左侧</strong>；但在环上，「最后剩的那堆从哪里断开」是<strong>自由的</strong>——可以从任意一堆起、绕一圈回来。以 <M>{'a=[3,9,3,4]'}</M> 为例：当成直链算得 <M>{'dp[0][3]=38'}</M>；可若允许「先并第 3 堆与第 0 堆」（环上它们相邻），从第 <M>{'1'}</M> 堆起绕一圈只需 <M>{'36'}</M>。<strong>那条多出来的边，能让合并更省</strong>。
          </p>
          <p>
            也别想着「枚举每个断点，各跑一遍链形 DP」——那要跑 <M>{'n'}</M> 遍、白白多花一个 <M>{'n'}</M> 倍。有没有办法<strong>一次把所有断法都算进去</strong>？有，而且极简洁：<strong>断环为链</strong>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">断环为链：复制一倍，环上任一圈都成了链上一段</h2>
        <div className="prose">
          <p>
            核心一招：把石子数组<strong>复制一倍</strong>，首尾拼成一条长度 <M>{'2n'}</M> 的链
            <M>{'a2[0\\ldots 2n-1]'}</M>，其中 <M>{'a2[i]=a[i\\bmod n]'}</M>。这样一来，<strong>环上从任意堆起、绕一整圈的那 <M>{'n'}</M> 堆</strong>，在这条 <M>{'2n'}</M> 链里都恰好是一段<strong>连续区间</strong> <M>{'[i,\\ i+n-1]'}</M>。原本「绕过尾首」的麻烦相邻边，被复制的那半段<strong>抹平成了普通的链内相邻</strong>。
          </p>
        </div>
        <figure className="figure">
          <BreakRingFigure />
          <figcaption className="figure__cap">从任一处剪开环、把 n 堆复制一倍接成 2n 链。环上「从第 1 堆起绕一圈」= 链上连续区间 [1,4]——绕过尾首的相邻，变成了链内相邻。</figcaption>
        </figure>
        <div className="prose">
          <p>
            于是环形问题被<strong>化归成链形</strong>：在 <M>{'a2'}</M> 上跑<strong>一模一样</strong>的区间三角表（状态、转移、按长度递推，全部照搬上一节），只是网格从 <M>{'n\\times n'}</M> 变成 <M>{'2n\\times 2n'}</M>：
          </p>
          <MB>{'dp[l][r]=\\min_{l\\le k\\le r-1}\\big(dp[l][k]+dp[k+1][r]\\big)+\\mathrm{sum}(a2[l..r])'}</MB>
          <p>
            算完之后，环形答案不是某一格，而是<strong>枚举所有起点</strong> <M>{'i=0,1,\\ldots,n-1'}</M>，在这 <M>{'n'}</M> 个「整圈窗口」里取最优：
          </p>
          <MB>{'\\mathrm{ans}=\\min_{0\\le i<n} dp[i][i+n-1]'}</MB>
          <p>
            为什么长度只需枚举到 <M>{'n'}</M>、窗口长度恰取 <M>{'n'}</M>？因为一整圈正好 <M>{'n'}</M> 堆：长度小于 <M>{'n'}</M> 合不完，长度大于 <M>{'n'}</M> 会让某堆<strong>被数两次</strong>（既在原段、又在复制段），非法。取 <M>{'\\max'}</M> 就把 <M>{'\\min'}</M> 换成 <M>{'\\max'}</M>，一字不改。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          环形区间 DP = <strong>链形区间 DP + 一层「断点」枚举</strong>，而这层枚举被<strong>「复制一倍成 <M>{'2n'}</M> 链」</strong>悄悄吸收进了同一张三角表里。诀窍在于：<strong>环上任一条连续弧，在 <M>{'2n'}</M> 链上都能找到一段等价的连续区间</strong>——于是「从哪里断」不必外层重复跑，只需最后在 <M>{'n'}</M> 个长度为 <M>{'n'}</M> 的窗口里取最优。复杂度仍是三层循环，<M>{'O((2n)^3)=O(n^3)'}</M>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍：a=[3,9,3,4] 的那个更省的窗口</h2>
        <div className="prose">
          <p>
            仍用 <M>{'a=[3,9,3,4]'}</M>。复制一倍得 <M>{'a2=[3,9,3,4,\\ 3,9,3,4]'}</M>（下标 <M>{'0\\ldots7'}</M>），前缀和 <M>{'pre=[0,3,12,15,19,22,31,34,38]'}</M>。答案落在<strong>起点 <M>{'1'}</M> 的窗口</strong> <M>{'[1,4]'}</M>（对应 <M>{'a2[1..4]=[9,3,4,3]'}</M>，即环上从第 1 堆绕一圈）。把这个窗口按长度算出来：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>长度 1</b>：对角线全 <M>{'0'}</M>。<b>长度 2</b>（区间和即两堆之和）：<M>{'dp[1][2]=12'}</M>（<M>{'9{+}3'}</M>）、<M>{'dp[2][3]=7'}</M>、<M>{'dp[3][4]=7'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>长度 3</b>，看 <M>{'[1,3]'}</M>（区间和 <M>{'16'}</M>）：<M>{'k=1'}</M>→<M>{'0+7=7'}</M>，<M>{'k=2'}</M>→<M>{'12+0=12'}</M>。取小 <M>{'7'}</M>，加 <M>{'16'}</M> → <M>{'dp[1][3]=23'}</M>。同理 <M>{'dp[2][4]=17'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>长度 4</b>（整圈窗口），看 <M>{'[1,4]'}</M>（区间和 <M>{'19'}</M>）：<M>{'k=1'}</M>→<M>{'0+17=17'}</M>，<M>{'k=2'}</M>→<M>{'12+7=19'}</M>，<M>{'k=3'}</M>→<M>{'23+0=23'}</M>。取小 <M>{'17'}</M>，加 <M>{'19'}</M> → <M>{'dp[1][4]=36'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>扫窗取优</b>：四个窗口 <M>{'dp[0][3]=38,\\ dp[1][4]=36,\\ dp[2][5]=36,\\ dp[3][6]=38'}</M>，最小 <strong><M>{'36'}</M></strong>——比朴素直链的 <M>{'38'}</M> 省 <M>{'2'}</M>。这 <M>{'2'}</M>，就是那条「尾首相邻边」买来的。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'2n'}</M> 链的三角表<strong>按长度一层层填满</strong>，末帧再<strong>并排点亮 <M>{'n'}</M> 个整圈窗口</strong>、圈出最优的那个。改改环上数值，看答案落到哪个起点。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看 2n 链的三角表长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <RingIntervalDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">为什么要枚举窗口：一张图看断点如何平移</h2>
        <div className="prose">
          <p>
            断环为链的<strong>几何直觉</strong>是：<M>{'n'}</M> 个「整圈窗口」<M>{'[0,n-1],[1,n],\\ldots,[n-1,2n-2]'}</M> 在 <M>{'2n'}</M> 链上<strong>逐格右移</strong>，每一个对应「从某堆断开」的一种合并方案。它们覆盖的都是环上同一圈的 <M>{'n'}</M> 堆，只是<strong>起止不同</strong>——所以答案要在它们之间取最优，缺一不可。
          </p>
        </div>
        <figure className="figure">
          <WindowScanFigure />
          <figcaption className="figure__cap">2n 链上，n 个长度为 n 的窗口逐行下移（起点 0→n-1）；环形答案 = 这 n 个 dp[i][i+n-1] 的最优。长度超过 n 会重复计堆，非法。</figcaption>
        </figure>
        <div className="prose">
          <p>
            记死这套<strong>「复制一倍 + 三层循环 + 扫窗」</strong>骨架——几乎所有环形合并/区间题都用它：
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
{`for i = 0 … n-1:  a2[i+n] = a[i]          // ★复制一倍，链长 2n
for 长度 len = 2 … n:                      // 只需到 n（一整圈）
  for 左端点 l = 0 … 2n-len:
    r = l + len - 1
    for 分割点 k = l … r-1:
      dp[l][r] = min( dp[l][r], dp[l][k] + dp[k+1][r] + sum(a2[l..r]) )
ans = min over i∈[0,n-1] of dp[i][i+n-1]   // ★扫 n 个整圈窗口取优`}
          </pre>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">换个断点，窗口就平移：环↔链展开</h2>
        <div className="prose">
          <p>
            上面是「填表」视角；再换个<strong>「展开」视角</strong>把直觉坐实。下面的互动让你<strong>亲手选断点</strong>：环从那里剪开、展成 <M>{'2n'}</M> 直链，对应的长度 <M>{'n'}</M> 窗口随之在链上整体平移。切几个断点，感受「同一圈、不同起止」，以及为何单看一个 <M>{'dp[0][n-1]'}</M> 会漏掉更优解。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <RingChainDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="两个常见坑">
          <strong>其一，长度别超过 <M>{'n'}</M>。</strong>在 <M>{'2n'}</M> 链上若枚举到长度 <M>{'>n'}</M> 的区间，会把某堆石子<strong>数两遍</strong>，答案偏大且无意义——外层 <M>{'len'}</M> 只跑到 <M>{'n'}</M> 即可。
          <br />
          <strong>其二，取 <M>{'\\min'}</M> 时下三角别参与、初值要设对。</strong><M>{'f'}</M> 初值 <M>{'+\\infty'}</M>、<M>{'g'}</M> 初值 <M>{'-\\infty'}</M>，且只在合法上三角（<M>{'l\\le r'}</M>）转移。若像能量项链那样代价可能<strong>为负</strong>（如三元乘积含负数），求最小时还要留意「负负得正」，别漏候选。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1880" name="[NOI1995] 石子合并" src="NOI1995" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 堆石子摆成一<strong>环</strong>，每次合并相邻两堆、代价为两堆之和，直到并成一堆。分别求<strong>最小</strong>与<strong>最大</strong>总代价。
          </Field>
          <Field k="对应关系">
            环形区间 DP 的<strong>标准模板题</strong>，且<strong>一题双问</strong>：断环为链（复制一倍成 <M>{'2n'}</M>），在链上用两张表 <M>{'f'}</M>（最小）、<M>{'g'}</M>（最大）并行跑同一套三层循环，最后各扫 <M>{'n'}</M> 个整圈窗口取优。本页从头到尾就是它。
          </Field>
          <Field k="为什么选它">
            它把<strong>环形处理</strong>与<strong>min/max 双问</strong>两个要点压在一题里，是检验「断环为链是否真会」的试金石：<M>{'f/g[l][r]'}</M> 的转移与链形完全一致，唯一新增的就是<strong>「复制一倍 + 扫窗」</strong>这两处——把这两处默写下来，环形区间 DP 就到手了。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f/g[l][r]=\\mathrm{opt}_k(f/g[l][k]+f/g[k+1][r])+\\mathrm{sum}(l,r)'}</M>，链长 <M>{'2n'}</M>、外层长度到 <M>{'n'}</M>、扫窗 <M>{'i\\in[1,n]'}</M>；时间 <M>{'O(n^3)'}</M>。
          </Field>
          <Field k="参考代码（断环为链 · 双问并行 · 扫窗）">
            <CodeBlock code={CODE_P1880} luogu="P1880" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1063" name="[NOIP2006 提高组] 能量项链" src="NOIP2006 提高组" diff="普及+/提高">
          <Field k="题意">
            <M>{'n'}</M> 颗珠子串成一<strong>环</strong>，每颗珠有头、尾两个标记，相邻珠共享标记。合并相邻两珠 <M>{'(i,j)'}</M> 与 <M>{'(j,k)'}</M> 得新珠 <M>{'(i,k)'}</M>，释放能量 <M>{'e_i\\cdot e_j\\cdot e_k'}</M>。求把整串合成一颗珠能释放的<strong>最大总能量</strong>。
          </Field>
          <Field k="为什么选它">
            环形区间 DP 的<strong>经典进阶</strong>：合并代价从「区间和」升级成<strong>相邻三元乘积 <M>{'\\mathrm{head}\\cdot\\mathrm{mid}\\cdot\\mathrm{tail}'}</M></strong>。状态改成按<strong>标记</strong>划分——<M>{'f[i][j]'}</M> 表示标记 <M>{'i..j'}</M> 之间的珠子合成一颗的最大能量，枚举最后一并处的<strong>中间标记 <M>{'k'}</M></strong>，追加 <M>{'e_i e_k e_j'}</M>。断环为链的处理与石子合并<strong>一模一样</strong>，正好训练「同一套环形骨架、换一种代价函数」的迁移。
          </Field>
          <Field k="换个视角">
            这里 <M>{'dp'}</M> 的下标是<strong>标记（隔板）</strong>而非珠子：长度 <M>{'\\mathrm{len}'}</M> 的区间 <M>{'[i,j]'}</M> 含 <M>{'j-i'}</M> 颗珠，端点标记 <M>{'e_i,e_j'}</M> 是合成后新珠的两头。样例 <M>{'e=[2,3,5,10]'}</M> 的答案是 <M>{'710'}</M>。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[i][j]=\\max_{i<k<j}\\big(f[i][k]+f[k][j]+e_i e_k e_j\\big)'}</M>，标记链长 <M>{'2n'}</M>，扫 <M>{'\\mathrm{len}=n'}</M> 的窗口；时间 <M>{'O(n^3)'}</M>。
          </Field>
          <Field k="参考代码（断环为链 · 三元乘积）">
            <CodeBlock code={CODE_P1063} luogu="P1063" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1043"
          name="[NOIP2003 提高组] 数字游戏"
          hint="环形 + 分段区间 DP：数字排成环，分成 m 段求各段和乘积的最大/最小。断环为链（复制一倍）后枚举起点，状态加一维段数：dp[l][r][t] = 区间 [l,r] 分成 t 段的最优，转移枚举最后一段的分割点。乘积可能为负，求最小值别漏「负负得正」，最大最小两张表分开跑。"
        />
        <Exercise
          pid="P2426"
          name="删数"
          hint="区间合并变形：把相邻或首尾的数按规则合并/删除，代价与两端点相关。设 dp[l][r] 为处理区间 [l,r] 的最优值，枚举分割点或枚举“最后删哪个”转移；按区间长度由短到长递推，注意端点代价的定义与边界。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想更直观地感受「从哪儿断、绕哪一圈」？回 <Link to="/part/c" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>C 部分页</Link>的互动里亲手挑一个断点与合并顺序，再看 DP 给出的最优圈。
      </div>

      <nav className="type-nav">
        <Link to="/part/c/stone" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">石子合并（链形）</span>
        </Link>
        <Link to="/part/c/palindrome" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            回文 / 括号 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
