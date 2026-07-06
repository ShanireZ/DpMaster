import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import PalindromeDemo from '../../components/demos/interval/PalindromeDemo'
import PalindromeInsertDemo from '../../components/demos/interval/PalindromeInsertDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { PalindromeSetupFigure, CollapseFigure, InsertFigure } from './PalindromeArt'

const CODE_P1435 = `
#include <iostream>
#include <cstring>
using namespace std;

#define MX 1005
char s[MX];
int len;
int dp[MX][MX];   // dp[i][j]：把子串 s[i..j] 补成回文的最少插入次数

int main()
{
    cin >> (s + 1);                          // 1-based：字符放在 s[1..len]
    len = strlen(s + 1);

    // ★按区间长度由短到长递推；长度 1 的子串已是回文，dp 默认 0
    for (int L = 2; L <= len; L++)
    {
        for (int i = 1; i + L - 1 <= len; i++)
        {
            int j = i + L - 1;
            if (s[i] == s[j])                // 两端天然对称，直接内缩
            {
                dp[i][j] = dp[i + 1][j - 1];
            }
            else                             // 补一端与对端配对，代价 +1，取较省的一侧
            {
                dp[i][j] = min(dp[i + 1][j], dp[i][j - 1]) + 1;
            }
        }
    }

    cout << dp[1][len] << endl;              // 整串补成回文的最少插入 = len − 最长回文子序列
    return 0;
}
// TAG: 区间DP 回文 最少插入`

const CODE_P4170 = `
#include <iostream>
#include <cstring>
using namespace std;

#define MX 55
char s[MX];
int len;
int dp[MX][MX];   // dp[i][j]：把区间 s[i..j] 刷成目标颜色的最少次数

int main()
{
    cin >> (s + 1);
    len = strlen(s + 1);

    memset(dp, 0x3f, sizeof(dp));
    for (int i = 1; i <= len; i++)
    {
        dp[i][i] = 1;                        // 单格必刷一次
    }

    for (int L = 2; L <= len; L++)
    {
        for (int i = 1; i + L - 1 <= len; i++)
        {
            int j = i + L - 1;
            if (s[i] == s[j])                // ★端点同色：一笔可顺带覆盖，省一次
            {
                dp[i][j] = min(dp[i + 1][j], dp[i][j - 1]);
            }
            else                             // 否则枚举分割点，两段各自刷再相加
            {
                for (int k = i; k <= j - 1; k++)
                {
                    dp[i][j] = min(dp[i][j], dp[i][k] + dp[k + 1][j]);
                }
            }
        }
    }

    cout << dp[1][len] << endl;
    return 0;
}
// TAG: 区间DP 回文 端点同色 涂色`

export default function Palindrome() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">回文，与「藏在串里」的最长回文</h2>
        <div className="prose">
          <p>
            <strong>回文串</strong>就是正着读、反着读一模一样的串：<M>{'\\texttt{aba}'}</M>、<M>{'\\texttt{noon}'}</M>、<M>{'\\texttt{racecar}'}</M>。
            本节要问的不是「整串是不是回文」，而是一个更有嚼头的问题：给一个<strong>不一定回文</strong>的串，从中<strong>按原次序挑出若干字符</strong>（不必相邻），能拼出的<strong>最长回文</strong>有多长？这条挑出来的子序列，就叫<strong>最长回文子序列</strong>（LPS）。
          </p>
          <p>
            拿 <M>{'s=\\texttt{character}'}</M> 做例子。把下标 <M>{'0,2,3,4,5'}</M> 的字符挑出来是 <M>{'\\texttt{carac}'}</M>——正反都一样，是长度 <strong>5</strong> 的回文。能不能更长？把所有挑法试遍，最长就是 5。注意它<strong>两端对称</strong>：最外一对 <M>{'\\texttt{c}\\dots\\texttt{c}'}</M> 相同，往里一对 <M>{'\\texttt{a}\\dots\\texttt{a}'}</M> 相同，正中留一个 <M>{'\\texttt{r}'}</M>。
          </p>
        </div>
        <figure className="figure">
          <PalindromeSetupFigure />
          <figcaption className="figure__cap">
            s=character，挑出下标 0 2 3 4 5 的 c a r a c。弧线把对称的字符两两勾出：外层 c↔c、内层 a↔a、中心 r 独坐——这正是回文「从两端向内成对」的结构。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            为什么不能<strong>贪心</strong>地扫一遍随手配对？因为<strong>此刻配哪一对，取决于内层还能配出多长</strong>——把某个字符过早用掉，可能挤掉里面一段更优的对称。穷举呢？长度 <M>{'n'}</M> 的串子序列有 <M>{'2^n'}</M> 条，逐条判回文，指数爆炸。
            但那句「回文从两端向内成对」正是<strong>区间</strong>的味道：只盯住一段<strong>连续区间的两个端点</strong>，就能把大问题剥成更短的子区间——这就是区间 DP 的入口。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：只看区间的两个端点</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[i][j]'}</M> 表示<strong>子串 <M>{'s[i..j]'}</M> 这段连续区间</strong>里，最长回文子序列的<strong>长度</strong>。
            要算它，只需盯住这段区间<strong>最外的两个字符</strong> <M>{'s_i'}</M> 与 <M>{'s_j'}</M>——它俩相不相等，决定两条截然不同的路。
          </p>
        </div>
        <figure className="figure">
          <CollapseFigure />
          <figcaption className="figure__cap">
            dp[i][j] 只看两端：相等就把这对字符裹在内层最优回文的两侧，长度 = 内层 dp[i+1][j−1] + 2（来源在左下、内缩一圈）；不等则至少丢一端，取 dp[i+1][j]（丢左）与 dp[i][j−1]（丢右）的较大者。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>两端相等</strong>（<M>{'s_i=s_j'}</M>）：这对字符<strong>可以且值得</strong>做回文的最外一层。把它俩裹在<strong>内层 <M>{'s[i+1..j-1]'}</M> 的最长回文</strong>两侧，长度在内层基础上 <M>{'+2'}</M>：
          </p>
          <MB>{'dp[i][j]=dp[i+1][j-1]+2'}</MB>
          <p>
            <strong>两端不等</strong>（<M>{'s_i\\ne s_j'}</M>）：这两个端点<strong>做不成同一对</strong>，那么最长回文里 <M>{'s_i'}</M> 与 <M>{'s_j'}</M> 至少有一个用不上。于是要么丢掉左端（转成 <M>{'dp[i+1][j]'}</M>），要么丢掉右端（转成 <M>{'dp[i][j-1]'}</M>），谁大取谁：
          </p>
          <MB>{'dp[i][j]=\\max\\big(dp[i+1][j],\\ dp[i][j-1]\\big)'}</MB>
          <p>
            边界：<M>{'dp[i][i]=1'}</M>（单个字符自成回文），空区间记 <M>{'0'}</M>。答案：<M>{'dp[0][n-1]'}</M>。
            和其余区间 DP 一样，<M>{'dp[i][j]'}</M> 依赖的三个来源（<M>{'dp[i+1][j-1]'}</M>、<M>{'dp[i+1][j]'}</M>、<M>{'dp[i][j-1]'}</M>）都是<strong>更短的子区间</strong>。所以递推<strong>不能</strong>按 <M>{'i'}</M> 或 <M>{'j'}</M> 顺序走，必须<strong>按区间长度由短到长</strong>——或等价地，让 <M>{'i'}</M> 从大到小、<M>{'j'}</M> 从小到大。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          回文的最长回文子序列被「连续区间 + 只看两端」拆成一张 <M>{'O(n^2)'}</M> 的<strong>三角表</strong>：每格只依赖<strong>左下、下、左</strong>三个更短的子区间，一步 <M>{'O(1)'}</M>。<M>{'2^n'}</M> 的枚举就此压进 <M>{'n^2/2'}</M> 个上三角格子。<strong>「端点相等则收缩 +2，不等则丢一端取大」</strong>——这条「收缩 vs 丢弃」的分野是全表的灵魂，也是后面括号匹配、涂色一整族区间问题的共同骨架。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用一个短串 <M>{'s=\\texttt{bcabb}'}</M>（下标 <M>{'0..4'}</M>）走几步，重点盯住<strong>长度由短到长</strong>、以及每格是「收缩」还是「取大」：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>对角线（长度 1）。</b> 每个字符自成回文：<M>{'dp[i][i]=1'}</M>。这是整张三角表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>长度 2</b>：看两端等不等。<M>{'dp[3][4]'}</M>：<M>{'s_3=\\texttt{b}=s_4'}</M> 相等 → <M>{'0+2=2'}</M>（内层为空记 0）。而 <M>{'dp[0][1]'}</M>：<M>{'s_0=\\texttt{b}\\ne s_1=\\texttt{c}'}</M> → <M>{'\\max(dp[1][1],dp[0][0])=1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>长度 3～4</b>：<M>{'dp[2][4]'}</M>（<M>{'\\texttt{abb}'}</M>）：<M>{'s_2=\\texttt{a}\\ne s_4=\\texttt{b}'}</M> → <M>{'\\max(dp[3][4],dp[2][3])=\\max(2,1)=2'}</M>。<M>{'dp[1][4]'}</M>（<M>{'\\texttt{cabb}'}</M>）：<M>{'s_1=\\texttt{c}\\ne s_4=\\texttt{b}'}</M> → <M>{'\\max(dp[2][4],dp[1][3])=\\max(2,1)=2'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>长度 5，整段 <M>{'[0,4]'}</M></b>（<M>{'\\texttt{bcabb}'}</M>）：<M>{'s_0=\\texttt{b}=s_4'}</M> 相等 → 收缩到内层 <M>{'dp[1][3]+2'}</M>。<M>{'dp[1][3]=\\texttt{cab}'}</M> 端点不等取大得 <M>{'1'}</M>，故 <M>{'dp[0][4]=1+2=3'}</M>——最长回文子序列长 3（如 <M>{'\\texttt{bab}'}</M> 或 <M>{'\\texttt{bcb}'}</M>）。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把三角表<strong>按长度一层层填满</strong>，高亮每个 <M>{'dp[i][j]'}</M> 是「相等收缩（左下）」还是「不等取大（下 / 左）」。改改字符串，看表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看三角表一层一层长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <PalindromeDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：最少插入构回文，与「括号 / 涂色」同族</h2>
        <div className="prose">
          <p>
            换一个看似不同的问题：给一个串，每次可在<strong>任意位置插入一个字符</strong>，问<strong>最少插入几次</strong>能让整串变回文？它和最长回文子序列其实是<strong>同一枚硬币的两面</strong>——
          </p>
          <MB>{'\\text{minInsert}=n-\\text{LPS}'}</MB>
          <p>
            道理很直白：串里那条<strong>最长回文子序列</strong>本就对称，一个字符都不用动；剩下的 <M>{'n-\\text{LPS}'}</M> 个「落单」字符，每个补一个镜像伙伴即可配对。所以求最少插入，等价于求最长回文子序列，再用总长减去它。
            也可以<strong>直接</strong>写一张区间 DP：<M>{'f[i][j]'}</M> = 把 <M>{'s[i..j]'}</M> 补成回文的最少插入；端点相等则 <M>{'f[i+1][j-1]'}</M>，不等则 <M>{'\\min(f[i+1][j],f[i][j-1])+1'}</M>——与上面的收缩 / 取大<strong>结构一模一样</strong>，只是把 +2 换成 +0、把 max 换成 min+1。
          </p>
        </div>
        <figure className="figure">
          <InsertFigure />
          <figcaption className="figure__cap">
            abcda 不是回文：最长回文子序列 aba（长 3），落单的 c、d 里需补 2 个字符（= 5 − 3），补成 abcdcba。虚线框是新插入的镜像字符。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            这套「<strong>端点相等省一步、不等再拆</strong>」的骨架，正是一整族区间问题的共同模板。
            <strong>括号 / 序列匹配</strong>同理：<M>{'s_i'}</M> 与 <M>{'s_j'}</M> 若能配成一对括号，问题落到内层 <M>{'[i+1,j-1]'}</M>，否则枚举分割点拆两段。
            <strong>涂色（区间刷漆）</strong>也一样：两端颜色相同则一笔顺带覆盖、<strong>省一次</strong>（<M>{'f[i][j]=\\min(f[i+1][j],f[i][j-1])'}</M>），不同则枚举分割点两段相加——正是例题 <strong>P4170</strong>。
            记住这条主线：<strong>区间 DP 的两端，要么配对内缩、要么拆点分治</strong>；回文是它最干净的入门形态。
          </p>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把「最少插入构回文」<strong>逐步跑给你看</strong>：双指针从两端逼近，相等内缩、不等就在较省一侧补一个镜像字符，直到补成回文。核对它的插入次数与上方三角表<strong>同一答案</strong>。
        </div>
        <div className="demo">
          <div className="demo__body">
            <PalindromeInsertDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="别混淆：回文子序列 vs 回文子串">
          本节的 <M>{'dp[i][j]'}</M> 求的是最长回文<strong>子序列</strong>（字符可不相邻，端点相等就 <M>{'+2'}</M>）。另有一类求最长回文<strong>子串</strong>（必须连续），转移与判定都不同：区间 DP 版本记 <M>{'g[i][j]'}</M> = 「<M>{'s[i..j]'}</M> 整段是否回文」，<M>{'g[i][j]=g[i+1][j-1]\\ \\&\\&\\ (s_i=s_j)'}</M>，专业解法还有 <strong>Manacher</strong> 的 <M>{'O(n)'}</M>。两者<strong>状态含义不同、答案不同</strong>，别把「子序列」的 <M>{'+2'}</M> 套到「子串」上。本页只讲子序列一族。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">为什么按长度递推：填表顺序与复杂度</h2>
        <div className="prose">
          <p>
            回文区间 DP 的表是个<strong>上三角</strong>（只有 <M>{'i\\le j'}</M> 才是合法区间）。<M>{'dp[i][j]'}</M> 的三个来源 <M>{'dp[i+1][j-1]'}</M>、<M>{'dp[i+1][j]'}</M>、<M>{'dp[i][j-1]'}</M> 的<strong>区间长度都比 <M>{'[i,j]'}</M> 短</strong>。
            只要<strong>先把所有短区间算完</strong>，长区间要用的就<strong>都已就绪</strong>。这就是「外层枚举长度 <M>{'L=2\\ldots n'}</M>、内层枚举左端点 <M>{'i'}</M>」的由来——最长回文子序列没有分割点那层枚举，故是 <M>{'O(n^2)'}</M>（括号 / 涂色因带分割点枚举升到 <M>{'O(n^3)'}</M>）：
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
{`for i = 0 … n-1:                 // 长度 1：单字符自成回文
  dp[i][i] = 1
for 长度 L = 2 … n:               // ★外层枚举区间长度，由短到长
  for 左端点 i = 0 … n-L:
    j = i + L - 1
    if s[i] == s[j]:              // 端点相等 → 收缩内层再 +2
      dp[i][j] = (L == 2 ? 0 : dp[i+1][j-1]) + 2
    else:                        // 端点不等 → 丢一端取大
      dp[i][j] = max(dp[i+1][j], dp[i][j-1])`}
          </pre>
          <p>
            这份「外层长度、端点决定收缩或取大」的骨架，把它记死：它是回文、最少插入、括号匹配、涂色一整族题的<strong>通用模具</strong>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1435" name="[IOI2000] 回文字串" src="IOI2000" diff="普及/提高-">
          <Field k="题意">
            给一个串，每次可在任意位置插入一个字符，求使整串成为回文串的<strong>最少插入次数</strong>。
          </Field>
          <Field k="对应关系">
            正是本页深化的<strong>最少插入 = <M>{'n-\\text{LPS}'}</M></strong>。可直接写区间 DP：<M>{'dp[i][j]'}</M> = 补成回文的最少插入，端点相等 <M>{'dp[i+1][j-1]'}</M>、不等 <M>{'\\min(dp[i+1][j],dp[i][j-1])+1'}</M>——与最长回文子序列<strong>同一收缩结构</strong>，参考代码用的就是它。
          </Field>
          <Field k="为什么选它">
            经典的 IOI 入门题，把「插入构回文」和「最长回文子序列」两个视角<strong>焊在一起</strong>的最佳载体：收缩过程一步步演示极佳，也让你亲手确认 <M>{'n-\\text{LPS}'}</M> 这条恒等式。注意串可能含大小写混合与数字，全部按字符比较即可。
          </Field>
          <Field k="转移 · 复杂度">
            端点相等 <M>{'dp[i][j]=dp[i+1][j-1]'}</M>；不等 <M>{'dp[i][j]=\\min(dp[i+1][j],dp[i][j-1])+1'}</M>。外层长度、内层左端点；时间 <M>{'O(n^2)'}</M>。
          </Field>
          <Field k="参考代码（最少插入 · 区间 DP）">
            <CodeBlock code={CODE_P1435} luogu="P1435" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P4170" name="[CQOI2007] 涂色" src="CQOI2007" diff="普及+/提高">
          <Field k="题意">
            一段木板每格有目标颜色，每次可把一段<strong>连续区间</strong>刷成同一颜色（后刷覆盖先刷）。求刷出目标配色的最少次数。
          </Field>
          <Field k="对应关系">
            端点决定收缩 / 分治的<strong>另一面孔</strong>：<M>{'dp[i][j]'}</M> = 刷好 <M>{'[i,j]'}</M> 的最少次数。<strong>两端颜色相同</strong>时，可让某一端的一笔顺带覆盖到另一端，<strong>省一次</strong>：<M>{'dp[i][j]=\\min(dp[i+1][j],dp[i][j-1])'}</M>；不同则枚举分割点 <M>{'k'}</M> 把两段各自刷再相加。与回文的「端点相等省一步」如出一辙。
          </Field>
          <Field k="为什么选它">
            省选级区间 DP 的<strong>招牌题</strong>：它把回文那条「端点同色 → 优化一步」的直觉，落到「刷漆次数」上，还多出一层<strong>分割点枚举</strong>（故 <M>{'O(n^3)'}</M>）。写通它，你就掌握了区间 DP「端点特判 + 分治枚举」的完整模具。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'s_i=s_j:\\ dp[i][j]=\\min(dp[i+1][j],dp[i][j-1])'}</M>；否则 <M>{'dp[i][j]=\\min_k(dp[i][k]+dp[k+1][j])'}</M>。外层长度、内层左端点、最内分割点；时间 <M>{'O(n^3)'}</M>。
          </Field>
          <Field k="参考代码（端点同色优化 · 分割点枚举）">
            <CodeBlock code={CODE_P4170} luogu="P4170" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P3205"
          name="[HNOI2010] 合唱队"
          hint="区间 DP 按端点「插入方向」计数：每个人从左端或右端插入当前队列，设 dp[i][j][0/1] 表示区间 [i,j] 且最后一个是从左 / 右插入的方案数，转移按新人比端点高矮决定能从哪侧接上。与回文的「端点决策」同源，只是把「取值」换成「计数」。"
        />
        <Exercise
          pid="P2426"
          name="删数"
          hint="区间删除合并：dp[i][j] = 删空区间 [i,j] 能得的最大价值。单个数单独删，或若两端满足给定条件可一起删并加权；否则枚举分割点把区间拆两段相加。端点特判 + 分割点枚举，正是本页涂色一族的骨架。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想更直观地感受「端点配对如何向内收缩」？到 <Link to="/part/c" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>C 部分页</Link>的互动里亲手挑一条回文子序列，再看 DP 给出的最优。
      </div>

      <nav className="type-nav">
        <Link to="/part/c/ring">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 环形区间 DP
          </span>
        </Link>
        <Link to="/part/c/tree" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            加分二叉树 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
