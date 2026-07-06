import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import EditDistanceDemo from '../../components/demos/grid/EditDistanceDemo'
import EditTracebackDemo from '../../components/demos/grid/EditTracebackDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { SetupFigure, TransitionFigure, WeightedFigure } from './EditDistanceArt'

const CODE_P2758 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

char a[2005], b[2005];
int f[2005][2005];               // f[i][j]：a 前 i 个字符改成 b 前 j 个的最少操作

int main()
{
    cin >> (a + 1) >> (b + 1);   // 下标从 1 开始存
    int n = strlen(a + 1), m = strlen(b + 1);

    for (int i = 0; i <= n; i++) f[i][0] = i;   // 边界：全删空
    for (int j = 0; j <= m; j++) f[0][j] = j;   // 边界：从空串插出来

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            int sub = f[i - 1][j - 1] + (a[i] != b[j]); // 改/匹配：同字 +0，异字 +1
            int del = f[i - 1][j] + 1;                  // 删掉 a[i]
            int ins = f[i][j - 1] + 1;                  // 插入 b[j]
            f[i][j] = min(sub, min(del, ins));          // ★三向取最小
        }

    cout << f[n][m] << endl;
    return 0;
}
// TAG: 线性DP 编辑距离 Levenshtein 串对齐`

const CODE_P1279 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

char a[2005], b[2005];
int f[2005][2005];               // f[i][j]：a 前 i 个对齐到 b 前 j 个的最小总代价
int k;                           // 空位（删/插）的固定代价

int main()
{
    cin >> k >> (a + 1) >> (b + 1);
    int n = strlen(a + 1), m = strlen(b + 1);

    for (int i = 0; i <= n; i++) f[i][0] = i * k;   // 前 i 个全对空位，各计 k
    for (int j = 0; j <= m; j++) f[0][j] = j * k;

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            int sub = f[i - 1][j - 1] + abs(a[i] - b[j]); // 改：代价 = 两字符 ASCII 差
            int del = f[i - 1][j] + k;                    // 删 a[i]：a[i] 对空位
            int ins = f[i][j - 1] + k;                    // 插 b[j]：空位对 b[j]
            f[i][j] = min(sub, min(del, ins));
        }

    cout << f[n][m] << endl;
    return 0;
}
// TAG: 线性DP 带权编辑距离 字串距离 序列对齐`

export default function EditDistance() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">把一个词改成另一个，最少几步</h2>
        <div className="prose">
          <p>
            给两个串 <M>{'A'}</M> 和 <M>{'B'}</M>，你只能用三种操作改写 <M>{'A'}</M>：<strong>删</strong>掉其中一个字符、
            <strong>插</strong>入一个字符、把某个字符<strong>改</strong>成另一个。目标是把 <M>{'A'}</M> 变成 <M>{'B'}</M>，
            <strong>用的操作次数最少</strong>——这个最小次数，就叫 <M>{'A'}</M> 到 <M>{'B'}</M> 的<strong>编辑距离</strong>（Levenshtein 距离）。
          </p>
        </div>
        <figure className="figure">
          <SetupFigure />
          <figcaption className="figure__cap">三种基本操作各一例：删（去一字）、插（补一字）、改（换一字）。每种都记 1 步。</figcaption>
        </figure>
        <div className="prose">
          <p>
            先看个具体的：把 <strong>"horse"</strong> 改成 <strong>"ros"</strong>。一条可行路线是——把 <code>h</code> 改成 <code>r</code>（horse→rorse），
            删掉第一个 <code>r</code> 后面的 <code>o</code>… 手工凑很容易凑不出最短。其实最优是 <strong>3</strong> 步：
            <code>h→r</code>（改）、删 <code>r</code>、删 <code>e</code>，剩下 <code>ros</code>。再看 <strong>"sitting"→"kitten"</strong>，最优也是 <strong>3</strong> 步
            （<code>s→k</code>、<code>i→e</code>、删末尾 <code>g</code>）。
          </p>
          <p>
            难点在哪？<strong>此刻该删、该插还是该改，取决于两个串后面还剩什么</strong>——是个牵一发动全身的全局问题，贪心按不住。
            那把所有操作序列枚举一遍？序列长度不固定、分叉又多，直接爆炸。和 <Link to="/part/a/lcs" style={{ color: 'var(--accent-2)' }}>LCS</Link> 一样，
            这类<strong>两个串逐位对齐</strong>的问题，正是二维 DP 的主场。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：三选一取最小</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[i][j]'}</M> 表示：把 <M>{'A'}</M> 的<strong>前 <M>{'i'}</M> 个字符</strong>改写成 <M>{'B'}</M> 的<strong>前 <M>{'j'}</M> 个字符</strong>，
            所需的最少操作数。把「逐位对齐」当作阶段，每一步只决断<strong>末尾这一位怎么处理</strong>。
          </p>
        </div>
        <figure className="figure">
          <TransitionFigure />
          <figcaption className="figure__cap">
            dp[i][j] 只看三个邻格：上邻（删 A[i]）、左邻（插 B[j]）、左上邻（改 A[i]→B[j]，或字符相同则免费匹配），三条路取最小。
          </figcaption>
        </figure>
        <div className="prose">
          <p>只盯住两个串的<strong>末尾字符</strong> <M>{'A[i]'}</M> 与 <M>{'B[j]'}</M>，把 <M>{'dp[i][j]'}</M> 拆成三条来路：</p>
          <p>
            <strong>删 <M>{'A[i]'}</M></strong>：把 <M>{'A[i]'}</M> 丢掉，问题缩成「<M>{'A'}</M> 前 <M>{'i-1'}</M> 个对齐 <M>{'B'}</M> 前 <M>{'j'}</M> 个」，再计 1 步 → <M>{'dp[i-1][j]+1'}</M>。
          </p>
          <p>
            <strong>插 <M>{'B[j]'}</M></strong>：在 <M>{'A'}</M> 末尾补一个 <M>{'B[j]'}</M> 把 <M>{'B'}</M> 这位对上，问题缩成「<M>{'A'}</M> 前 <M>{'i'}</M> 个对齐 <M>{'B'}</M> 前 <M>{'j-1'}</M> 个」，计 1 步 → <M>{'dp[i][j-1]+1'}</M>。
          </p>
          <p>
            <strong>改 / 匹配</strong>：让 <M>{'A[i]'}</M> 与 <M>{'B[j]'}</M> 正面相对，问题缩成「前 <M>{'i-1'}</M> 对齐前 <M>{'j-1'}</M>」。若两字<strong>本就相同</strong>，白赚一步不花代价；否则改一次记 1 步 → <M>{'dp[i-1][j-1]+[A[i]\\ne B[j]]'}</M>。
          </p>
          <p>三条路取最小，就是<strong>转移方程</strong>：</p>
          <MB>{'dp[i][j]=\\min\\big(\\,dp[i-1][j]+1,\\ dp[i][j-1]+1,\\ dp[i-1][j-1]+[A[i]\\ne B[j]]\\,\\big)'}</MB>
          <p>
            这里 <M>{'[A[i]\\ne B[j]]'}</M> 是艾弗森括号：两字不同取 1、相同取 0。还差<strong>边界</strong>——一个串为空时怎么办？
          </p>
          <MB>{'dp[i][0]=i,\\qquad dp[0][j]=j'}</MB>
          <p>
            <M>{'dp[i][0]=i'}</M>：把 <M>{'A'}</M> 前 <M>{'i'}</M> 个字符改成空串，只能一个个<strong>删</strong>，删 <M>{'i'}</M> 次；
            <M>{'dp[0][j]=j'}</M>：从空串造出 <M>{'B'}</M> 前 <M>{'j'}</M> 个，只能一个个<strong>插</strong>，插 <M>{'j'}</M> 次。答案在右下角 <M>{'dp[n][m]'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          编辑距离把「无穷多条操作序列」压成一张 <M>{'(n{+}1)\\times(m{+}1)'}</M> 的表：每一格只问「末尾这位<strong>删、插、还是改/匹配</strong>」，三个已算好的邻格取最小。指数级的改写路径，被 <M>{'O(nm)'}</M> 个格子装下——这正是<strong>两串对齐</strong>类 DP 的通用骨架。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用 <M>{'A='}</M>"horse"、<M>{'B='}</M>"ros" 走几步（下标从 1 记），把方程「跑起来」：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>铺边界。</b> 首列 <M>{'dp[i][0]=i'}</M>（"horse" 前缀全删空：0,1,2,3,4,5），首行 <M>{'dp[0][j]=j'}</M>（从空串插出 "ros"：0,1,2,3）。这是整张表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>左上角 <M>{'dp[1][1]'}</M></b>（<M>{'A[1]{=}\\text{h}'}</M> vs <M>{'B[1]{=}\\text{r}'}</M>，不同）：删 = <M>{'dp[0][1]+1=2'}</M>；插 = <M>{'dp[1][0]+1=2'}</M>；改 = <M>{'dp[0][0]+1=1'}</M>。取最小 → <M>{'dp[1][1]=1'}</M>（把 h 改成 r）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>命中相同字符 <M>{'dp[2][2]'}</M></b>（<M>{'A[2]{=}\\text{o}'}</M> vs <M>{'B[2]{=}\\text{o}'}</M>，<strong>相同</strong>）：匹配这条 = <M>{'dp[1][1]+0=1'}</M>，比删（<M>{'dp[1][2]+1=3'}</M>）、插（<M>{'dp[2][1]+1=3'}</M>）都小 → <M>{'dp[2][2]=1'}</M>。<strong>字符相同就白赚一格，不加代价</strong>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>右下角 <M>{'dp[5][3]'}</M></b>（<M>{'A[5]{=}\\text{e}'}</M> vs <M>{'B[3]{=}\\text{s}'}</M>，不同）：删 = <M>{'dp[4][3]+1=3'}</M> 最小（改 = <M>{'dp[4][2]+1=4'}</M>、插更大）→ <M>{'dp[5][3]=3'}</M>。正是 "horse"→"ros" 的编辑距离 <strong>3</strong>，与手算吻合。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把整张表<strong>逐格填满</strong>，每格高亮上 / 左 / 左上三个来源并标出被选中的那条。改改两个串，看表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一格一格填出来</h2>
        <div className="demo">
          <div className="demo__body">
            <EditDistanceDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：从「恒 1」到带权对齐</h2>
        <div className="prose">
          <p>
            上面每种操作都恒记 <strong>1</strong> 步。但「编辑距离」的骨架其实更通用——只要把<strong>每种操作的代价换成任意权重</strong>，同一套三向取最小就变成了<strong>最小代价的序列对齐</strong>。这在生物信息（DNA 比对）、拼写纠错里天天用。
          </p>
        </div>
        <figure className="figure">
          <WeightedFigure />
          <figcaption className="figure__cap">
            普通版：删 / 插 / 改各记 1。带权版：删 / 插（一个字符对「空位」）记固定代价 k，改（两字符相对）记它们的差异度，如 ASCII 差 |A[i]−B[j]|。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            把方程里的三个「<M>{'+1'}</M>」换成各自的权重，转移形状<strong>一字不改</strong>：
          </p>
          <MB>{'dp[i][j]=\\min\\big(dp[i-1][j]+c_{del},\\ dp[i][j-1]+c_{ins},\\ dp[i-1][j-1]+c_{sub}(A[i],B[j])\\big)'}</MB>
          <p>
            典型如洛谷 <strong>P1279「字串距离」</strong>：删 / 插一个字符视作它与「空位」配对，记固定代价 <M>{'k'}</M>；把 <M>{'A[i]'}</M> 改成 <M>{'B[j]'}</M> 的代价是两者 ASCII 差 <M>{'|A[i]-B[j]|'}</M>（相同则差为 0，自然免费）。边界也随之变成 <M>{'dp[i][0]=i\\cdot k'}</M>、<M>{'dp[0][j]=j\\cdot k'}</M>。
            <strong>普通编辑距离，不过是「删插改代价全取 1」的带权对齐特例</strong>。
          </p>
        </div>
        <InfoBox kind="key" title="换个视角：编辑距离 = 带权序列对齐">
          「删 / 插」= 某字符与<strong>空位</strong>配对，「改 / 匹配」= 两字符<strong>正面配对</strong>。于是求编辑距离，等价于给两个串找一套<strong>最省代价的逐位配对方案</strong>——把恒 1 的权重换成任意 <M>{'c_{del},c_{ins},c_{sub}'}</M>，方程原样通用。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">不止要距离，还要「怎么改」：回溯操作序列</h2>
        <div className="prose">
          <p>
            <M>{'dp[n][m]'}</M> 只告诉你<strong>最少几步</strong>，可很多时候我们想知道<strong>具体是哪几步</strong>——先删哪个、再改哪个。办法是<strong>从右下角回溯</strong>：站在 <M>{'dp[i][j]'}</M>，看它当初的值是从哪个邻格转移来的，就往那格走，同时记下对应的操作，一路退回 <M>{'dp[0][0]'}</M>：
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
{`站在 (i, j)，回头看它是从哪来的：
  若 A[i] == B[j] 且 dp[i][j] == dp[i−1][j−1]   → 保留，走向 (i−1, j−1)
  否则若 dp[i][j] == dp[i−1][j−1] + 1           → 改 A[i]→B[j]，走 (i−1, j−1)
  否则若 dp[i][j] == dp[i−1][j] + 1             → 删 A[i]，走 (i−1, j)
  否则                                          → 插 B[j]，走 (i, j−1)
倒着走到 (0,0)，把记录翻转，就是把 A 对齐到 B 的操作序列`}
          </pre>
          <p>
            下面这个演示就把回溯<strong>逐步走给你看</strong>：上排是 <M>{'A'}</M> 的字符、下排是 <M>{'B'}</M> 的字符，中间的徽标标出每一位是<strong>保留 / 删 / 插 / 改</strong>。拖动步进条，看 <M>{'A'}</M> 一步步被对齐成 <M>{'B'}</M>——真正花代价的步数，恰好等于上面主演示算出的编辑距离。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <EditTracebackDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="回溯的两个坑">
          ① 并列时要<strong>定一个固定优先级</strong>（这里：匹配 / 改 &gt; 删 &gt; 插），否则多条最优路径会让输出飘忽。② 回溯读的是<strong>转移来源</strong>而非单纯比大小——务必让判断顺序和当初填表时「谁被选中」的规则一致，否则会还原出一条并不合法的操作链。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2758" name="编辑距离" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            给两个字符串 <M>{'A'}</M>、<M>{'B'}</M>，每次可对 <M>{'A'}</M> 删一个、插一个或改一个字符，求把 <M>{'A'}</M> 变成 <M>{'B'}</M> 的最少操作次数。
          </Field>
          <Field k="为什么选它">
            最纯净的 <strong>Levenshtein 裸模板</strong>：删 / 插 / 改三向转移一次讲透，边界 <M>{'dp[i][0]=i,\\ dp[0][j]=j'}</M> 写熟。是把「两串对齐」这套二维 DP 骨架<strong>肌肉记忆</strong>下来的第一题，一行不多一行不少。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[i][j]=\\min(dp[i-1][j]+1,\\ dp[i][j-1]+1,\\ dp[i-1][j-1]+[A_i\\ne B_j])'}</M>；时间 <M>{'O(nm)'}</M>。
          </Field>
          <Field k="参考代码（标准三向转移）">
            <CodeBlock code={CODE_P2758} luogu="P2758" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1279" name="字串距离" src="洛谷原生 P" diff="普及+/提高">
          <Field k="题意">
            给两个串与一个空位代价 <M>{'k'}</M>。把两串对齐（允许在任一串插入「空位」），一段对齐的代价 = 各位配对代价之和：两字符对齐记 ASCII 差 <M>{'|A_i-B_j|'}</M>，字符对空位记 <M>{'k'}</M>。求最小总代价。
          </Field>
          <Field k="换个视角（带权编辑距离）">
            这就是<strong>把恒 1 换成权重</strong>的编辑距离：「删 / 插」= 字符对空位、代价 <M>{'k'}</M>；「改 / 匹配」= 两字符相对、代价 <M>{'|A_i-B_j|'}</M>（同字差 0，天然免费）。转移形状与 P2758 完全相同，只换掉三个代价项和边界 <M>{'dp[i][0]=i\\cdot k'}</M>。
          </Field>
          <Field k="为什么选它">
            把「编辑距离 = 带权序列对齐」这句话<strong>落到代码</strong>：看清删 / 插的本质是「对空位」、改的本质是「按差异计费」，就能把裸模板一眼改造成带权版。是从模板迈向建模的关键一题。
          </Field>
          <Field k="参考代码（带权对齐）">
            <CodeBlock code={CODE_P1279} luogu="P1279" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2543"
          name="[AGTC]"
          hint="编辑距离原版：允许增（插）、删、改三种操作，把 A 变成 B 求最少步数。直接套本页主演示的三向转移 dp[i][j]=min(删,插,改)，是 P2758 之外再练一遍裸模板、把边界与三来源写熟的一题。"
        />
        <Exercise
          pid="P1032"
          name="[NOIP2002 提高组] 字串变换"
          hint="串变换的搜索版：给定若干「子串→子串」的替换规则，求把 A 变成 B 的最少步数。规则不再是单字符删插改，用 BFS 逐层扩展状态（双向 BFS 更稳），是「编辑思想」从固定三操作推广到任意规则的延伸。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/a/lcs">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 最长公共子序列
          </span>
        </Link>
        <Link to="/part/a/fsm" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            状态机 DP <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
