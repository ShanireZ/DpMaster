import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import LCSDemo from '../../components/demos/grid/LCSDemo'
import LCSToLISDemo from '../../components/demos/grid/LCSToLISDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { SetupFigure, DecisionFigure, BacktrackFigure, PermToLisFigure } from './LCSArt'

const CODE_P1439 = `
#include <algorithm>
#include <iostream>
using namespace std;
#define MX 100005

int n, len;
int a[MX], p[MX];   // p[值] = 该值在 a 中的位置
int b[MX], g[MX];   // g[k] = 长度 k 的上升子序列的最小结尾（单调递增）

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        p[a[i]] = i;                // 记下 a 中每个值的位置
    }
    for (int i = 1; i <= n; i++)
    {
        int x;
        cin >> x;
        b[i] = p[x];                // ★把 b 的值换成它在 a 中的位置
    }

    // 排列 LCS = 位置序列 b[] 的 LIS，二分 O(n log n)
    for (int i = 1; i <= n; i++)
    {
        if (len == 0 || b[i] > g[len])
        {
            g[++len] = b[i];        // 比末尾大，接到最长后面
        }
        else
        {
            int l = 1, r = len;
            while (l <= r)          // lower_bound：第一个 >= b[i] 的位置
            {
                int mid = (l + r) >> 1;
                g[mid] >= b[i] ? r = mid - 1 : l = mid + 1;
            }
            g[l] = b[i];
        }
    }

    cout << len << endl;
    return 0;
}
// TAG: 线性DP LCS 排列 LIS 二分 O(nlogn)`

const CODE_P4303 = `
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
#define MX 100005

int n, len;
vector<int> pos[MX];   // pos[值] = 该值在 a 中出现的所有位置（升序）
int b[5 * MX], g[5 * MX];

int main()
{
    cin >> n;
    int tot = 5 * n;                    // 每种基因恰好出现 5 次
    for (int i = 1; i <= tot; i++)
    {
        int x;
        cin >> x;
        pos[x].push_back(i);            // a 中位置，天然升序
    }

    int cnt = 0;
    for (int i = 1; i <= tot; i++)
    {
        int x;
        cin >> x;
        // ★把 b 里的 x 展开成它在 a 中的位置，且按【降序】铺开，
        // 这样同一个值的 5 个位置在 LIS 里最多被选中一个，等价 LCS 的匹配约束。
        for (int k = (int)pos[x].size() - 1; k >= 0; k--)
        {
            b[++cnt] = pos[x][k];
        }
    }

    // 对展开后的位置序列求 LIS（严格上升），二分 O(N log N)，N = 5n
    for (int i = 1; i <= cnt; i++)
    {
        if (len == 0 || b[i] > g[len])
        {
            g[++len] = b[i];
        }
        else
        {
            int l = 1, r = len;
            while (l <= r)              // 第一个 >= b[i] 的位置
            {
                int mid = (l + r) >> 1;
                g[mid] >= b[i] ? r = mid - 1 : l = mid + 1;
            }
            g[l] = b[i];
        }
    }

    cout << len << endl;
    return 0;
}
// TAG: 线性DP LCS 有界重复 展开 LIS 二分`

const CODE_P2516 = `
#include <algorithm>
#include <iostream>
#include <cstring>
using namespace std;
#define MX 5005
const int MOD = 100000000;   // 答案对 10^8 取模

char sa[MX], sb[MX];
int la, lb;
int f[MX][MX];               // f[i][j]：LCS 长度
int c[MX][MX];               // c[i][j]：取得该长度的方案数

int main()
{
    cin >> (sa + 1) >> (sb + 1);
    la = strlen(sa + 1) - 1;         // 题目串尾带一个多余字符，去掉
    lb = strlen(sb + 1) - 1;

    for (int i = 0; i <= la; i++)    // 与空串比：长度 0，「什么都不选」算 1 种
    {
        c[i][0] = 1;
    }
    for (int j = 0; j <= lb; j++)
    {
        c[0][j] = 1;
    }

    for (int i = 1; i <= la; i++)
    {
        for (int j = 1; j <= lb; j++)
        {
            if (sa[i] == sb[j])
            {
                f[i][j] = f[i - 1][j - 1] + 1;
                c[i][j] = c[i - 1][j - 1];       // 末位配对，方案继承左上
            }
            else
            {
                f[i][j] = max(f[i - 1][j], f[i][j - 1]);
                if (f[i - 1][j] == f[i][j])      // 谁的长度达标就并进来
                {
                    c[i][j] = (c[i][j] + c[i - 1][j]) % MOD;
                }
                if (f[i][j - 1] == f[i][j])
                {
                    c[i][j] = (c[i][j] + c[i][j - 1]) % MOD;
                }
                if (f[i - 1][j - 1] == f[i][j])  // ★容斥：左上被重复计入，减掉
                {
                    c[i][j] = ((c[i][j] - c[i - 1][j - 1]) % MOD + MOD) % MOD;
                }
            }
        }
    }

    cout << f[la][lb] << endl;
    cout << c[la][lb] % MOD << endl;
    return 0;
}
// TAG: 线性DP LCS 计数 容斥`

export default function LCS() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">什么是「公共子序列」</h2>
        <div className="prose">
          <p>
            上一节的<strong>子序列</strong>是从<em>一</em>串里挑数、保持原次序。这一节有<strong>两</strong>串，
            要找一条<strong>同时是它们各自子序列</strong>的序列——它就是一条<strong>公共子序列</strong>；其中<strong>最长</strong>的那条，长度就是 LCS
            （Longest Common Subsequence）。注意是「子序列」不是「子串」：字符<strong>不必相邻</strong>，只要在两串里都能按原次序依次找到。
          </p>
          <p>
            拿一个小例子：<M>{'A=\\texttt{ABCBDAB}'}</M>、<M>{'B=\\texttt{BDCAB}'}</M>。<M>{'\\texttt{BD}'}</M> 在两串里都出现且次序一致，是公共子序列（长 2）；
            <M>{'\\texttt{BCAB}'}</M> 也是——它在 A 里是第 2、3、6、7 位，在 B 里是第 1、3、4、5 位，两边都递增。能不能更长？试遍所有挑法，最长就是 4。
          </p>
        </div>
        <figure className="figure">
          <SetupFigure />
          <figcaption className="figure__cap">
            A=ABCBDAB、B=BDCAB。连线把公共子序列 B C A B 的四对字符勾出——线不交叉，正说明它在两串里的下标各自递增（保持了原次序）。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            为什么不能<strong>贪心</strong>地「从头扫，遇到相同字符就配一对」？看 <M>{'A=\\texttt{AB}'}</M>、<M>{'B=\\texttt{BA}'}</M>：贪心先把两个 <M>{'\\texttt{A}'}</M> 配上，之后 <M>{'\\texttt{B}'}</M> 在 A 里已经没了往后的位置——只得长度 1；
            可正解是先放 <M>{'\\texttt{B}'}</M> 再放 <M>{'\\texttt{A}'}</M>，同样长度 1，这里恰好不亏，但把串拉长就会出岔：<strong>此刻配哪一对最好，取决于后面还能配出多少</strong>——又是需要 DP 的信号。
          </p>
          <p>
            穷举呢？A 的子序列有 <M>{'2^{|A|}'}</M> 条，逐条去 B 里验证，指数级，串一长就无从枚举。下面用一张<strong>二维表</strong>把它压成 <M>{'O(|A|\\cdot|B|)'}</M>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：只看两串的「末位」</h2>
        <div className="prose">
          <p>
            两串一起处理，抓手是<strong>各自的前缀</strong>。设 <M>{'dp[i][j]'}</M> 表示：<strong>A 的前 <M>{'i'}</M> 个字符</strong>与 <strong>B 的前 <M>{'j'}</M> 个字符</strong>的最长公共子序列长度。
            要算它，只需盯住两串<strong>当前的最后一个字符</strong> <M>{'A_i'}</M> 与 <M>{'B_j'}</M>——它俩相不相等，决定了两条截然不同的路。
          </p>
        </div>
        <figure className="figure">
          <DecisionFigure />
          <figcaption className="figure__cap">
            算 dp[i][j] 只看末位：相等就把这对配上、各退一格，长度 = 左上 + 1；不等则末位至少有一个用不上，丢 A 末位或丢 B 末位，取较大者。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>末位相等</strong>（<M>{'A_i=B_j'}</M>）：这对字符<strong>可以且值得</strong>配成公共子序列的最后一对。把它配上后，剩下的问题变成「A 前 <M>{'i-1'}</M> 与 B 前 <M>{'j-1'}</M> 的 LCS」，长度在它基础上 <M>{'+1'}</M>：
          </p>
          <MB>{'dp[i][j]=dp[i-1][j-1]+1'}</MB>
          <p>
            <strong>末位不等</strong>（<M>{'A_i\\ne B_j'}</M>）：这两个末位<strong>配不成同一对</strong>，那么最优解里 <M>{'A_i'}</M> 与 <M>{'B_j'}</M> 至少有一个不会被用到。于是要么丢掉 <M>{'A_i'}</M>（转成 <M>{'dp[i-1][j]'}</M>），要么丢掉 <M>{'B_j'}</M>（转成 <M>{'dp[i][j-1]'}</M>），谁大取谁：
          </p>
          <MB>{'dp[i][j]=\\max\\big(dp[i-1][j],\\ dp[i][j-1]\\big)'}</MB>
          <p>
            边界：<M>{'dp[0][j]=dp[i][0]=0'}</M>（任一串为空，公共子序列长度为 0）。答案：<M>{'dp[|A|][|B|]'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          两串的 LCS 被「各自前缀 + 只看末位」拆成了一张 <M>{'(|A|{+}1)\\times(|B|{+}1)'}</M> 的表：每格<strong>只依赖左上、上、左三个已算好的邻居</strong>，一步 <M>{'O(1)'}</M>。于是 <M>{'2^{|A|}'}</M> 的枚举被 <M>{'O(|A|\\cdot|B|)'}</M> 个格子装下。相等走对角、不等走上/左——这条「对角 vs 直行」的分野是全表的灵魂。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用一对更短的串 <M>{'A=\\texttt{ABCB}'}</M>、<M>{'B=\\texttt{BDCB}'}</M> 走几格（下标从 1 记），把两条规则跑起来：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>第 0 行 / 第 0 列。</b> 任一串取空前缀，公共子序列只能是空的：<M>{'dp[0][\\cdot]=dp[\\cdot][0]=0'}</M>。整张表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>末位相等的格。</b> 看 <M>{'dp[1][1]'}</M>：<M>{'A_1=\\texttt{A}'}</M>、<M>{'B_1=\\texttt{B}'}</M> 不等 → 取 <M>{'\\max(dp[0][1],dp[1][0])=0'}</M>。
              再看 <M>{'dp[2][1]'}</M>：<M>{'A_2=\\texttt{B}=B_1'}</M> 相等 → <M>{'dp[1][0]+1=1'}</M>。第一对 <M>{'\\texttt{B}'}</M> 配上了。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>末位不等的格。</b> 看 <M>{'dp[3][3]'}</M>：<M>{'A_3=\\texttt{C}=B_3'}</M> 相等 → 左上 <M>{'dp[2][2]+1'}</M>。而如 <M>{'dp[3][2]'}</M>：<M>{'A_3=\\texttt{C}\\ne B_2=\\texttt{D}'}</M> → 取上、左较大者，长度不涨。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>读答案。</b> 填到右下角 <M>{'dp[4][4]=3'}</M>——<M>{'A=\\texttt{ABCB}'}</M> 与 <M>{'B=\\texttt{BDCB}'}</M> 的 LCS 长度是 3，正是 <M>{'\\texttt{BCB}'}</M>。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把整张 <M>{'dp'}</M> 表<strong>逐格填满</strong>，高亮每格来自左上（相等）还是上/左（不等）；填完再<strong>回溯</strong>出一条 LCS。改两串的字符、加删长度，看它实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一格一格长出来，再回溯出答案</h2>
        <div className="demo">
          <div className="demo__body">
            <LCSDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">不止长度：回溯重构一条 LCS</h2>
        <div className="prose">
          <p>
            <M>{'dp[|A|][|B|]'}</M> 只给出<strong>长度</strong>。想要那条子序列<strong>本身</strong>，就从右下角<strong>沿转移的来路往回走</strong>：
            在格 <M>{'(i,j)'}</M>，若当初是「相等」填的（<M>{'A_i=B_j'}</M>），就<strong>斜着</strong>走到 <M>{'(i-1,j-1)'}</M>，并<strong>摘下这个字符</strong>；
            否则朝当初更大的那个来源（上或左）走一格、不摘字符。走到边界为止，把摘到的字符<strong>逆序</strong>拼起来，就是一条 LCS。
          </p>
        </div>
        <figure className="figure">
          <BacktrackFigure />
          <figcaption className="figure__cap">
            从右下角回溯：绿格是「相等」时斜向的一步，各摘下一个字符；灰路是「不等」时的直行（不摘）。逆序拼出 B C B——正是这对串的一条 LCS。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            要留意 LCS <strong>可能不唯一</strong>：当上、左来源一样大时，往哪边走都合法，会回溯出<strong>不同但等长</strong>的 LCS。想统计「到底有多少条」，就得给方案数也开一张表——这正是本页例题 <strong>P2516</strong> 要处理的（相等时方案继承左上，不等时把达标来源并起来、再用容斥减去重复计入的左上）。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：当两串是「排列」——降到 O(n log n)</h2>
        <div className="prose">
          <p>
            标准 LCS 是 <M>{'O(|A|\\cdot|B|)'}</M>。当 <M>{'|A|=|B|=n'}</M> 都到 <M>{'10^5'}</M>，<M>{'n^2=10^{10}'}</M> 必然超时。但有一类特殊情形能<strong>大幅提速</strong>：
            两串是<strong>同一集合的两个排列</strong>（各值恰好出现一次，如都是 <M>{'1\\dots n'}</M> 的重排）。此时有一个漂亮的转化——<strong>LCS 可以变成 LIS</strong>。
          </p>
          <p>
            关键观察：既然 A 是排列，每个值在 A 里有<strong>唯一的位置</strong>。把 B 里的每个值，都<strong>替换成「它在 A 中的位置」</strong>，得到一串位置序列。那么——
          </p>
        </div>
        <figure className="figure">
          <PermToLisFigure />
          <figcaption className="figure__cap">
            A 取 1 2 3 4 5（位置即数值），B=2 4 1 5 3 逐个换成它在 A 里的位置，得位置序列 2 4 1 5 3；它的一条最长上升子序列 2 4 5（长 3）就等于 LCS 长度。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>为什么位置序列的 LIS 就是 LCS？</strong> 一条公共子序列，等价于在 A 里选一批位置、在 B 里选同样一批值，且<strong>两边次序一致</strong>。
            映射后，B 中被选值的相对次序<strong>就是它们出现的先后</strong>（沿 B 从左到右，即位置序列的下标递增）；而「它们在 A 里也保持同样次序」翻译过来，正是这些位置<strong>数值递增</strong>——两个「递增」合起来，恰是位置序列的一条<strong>上升子序列</strong>。于是<strong>最长公共子序列 = 位置序列的最长上升子序列</strong>。
          </p>
          <p>
            而 LIS 有 <M>{'O(n\\log n)'}</M> 的<Link to="/part/b/lis" style={{ color: 'var(--accent-2)' }}>贪心 + 二分</Link>解法（维护 <M>{'tails'}</M>、<M>{'\\texttt{lower\\_bound}'}</M> 替换）。绕这一圈，排列 LCS 就从 <M>{'O(n^2)'}</M> 降到了 <strong><M>{'O(n\\log n)'}</M></strong>。
          </p>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的转化器把这套映射<strong>逐步演示</strong>：逐个把 B 的值换成它在 A 里的位置，映完再点亮位置序列里的一条 LIS——它的长度就是 LCS。换第二个预设（A 乱序）看一般映射。
        </div>
        <div className="demo">
          <div className="demo__body">
            <LCSToLISDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="边界 · 只对「排列 / 无重复」直接成立">
          「LCS→LIS」的降维<strong>前提</strong>是「一串里每个值唯一」（映射才是单值函数）。若值<strong>有界重复</strong>（如每种恰好出现 <M>{'k'}</M> 次），需把一个值<strong>展开成它的多个位置、且按位置降序铺开</strong>再求 LIS——见例题 <strong>P4303</strong>。若是<strong>普通带重复的两串</strong>，则老老实实用 <M>{'O(|A|\\cdot|B|)'}</M> 的二维 DP，别硬套。另有一类叫 <strong>LCIS（最长公共上升子序列）</strong>，要求公共子序列同时<strong>严格上升</strong>——它是「LCS 的匹配 + LIS 的上升」两个约束的复合，需设<strong>二维状态</strong> <M>{'f[i][j]'}</M>「用到 <M>{'a_i'}</M>、且以 <M>{'b_j'}</M> 结尾」并配合前缀最优优化到 <M>{'O(nm)'}</M>；洛谷原生 P/B 题库暂无纯 LCIS 模板，此处只作为概念点点到，不强凑题号。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1439" name="【模板】最长公共子序列" src="洛谷原生" diff="提高+/省选-">
          <Field k="题意">
            给定 <M>{'1\\dots n'}</M> 的<strong>两个排列</strong>，求它们的最长公共子序列长度，<M>{'n\\le 10^5'}</M>。
          </Field>
          <Field k="为什么选它">
            排列 LCS→LIS 的<strong>招牌模板题</strong>：<M>{'n=10^5'}</M> 卡死 <M>{'O(n^2)'}</M>，逼你把「两串是排列」这个条件用足——映射位置、转成 LIS、二分求解。把本节深化那套转化<strong>一次写通</strong>的最佳载体。
          </Field>
          <Field k="转移 · 复杂度">
            记 <M>{'p[a_i]=i'}</M>，令 <M>{'b_i\\gets p[b_i]'}</M>；对 <M>{'b[]'}</M> 求 LIS（<M>{'\\texttt{lower\\_bound}'}</M> 二分）。时间 <M>{'O(n\\log n)'}</M>。
          </Field>
          <Field k="参考代码（映射位置 + LIS 二分）">
            <CodeBlock code={CODE_P1439} luogu="P1439" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P4303" name="[AHOI2006] 基因匹配" src="AHOI2006" diff="提高+/省选-">
          <Field k="题意">
            两串基因序列，每串长 <M>{'5n'}</M>，且 <M>{'1\\dots n'}</M> 每种基因在<strong>每串里恰好出现 5 次</strong>。求两串的最长公共子序列长度。
          </Field>
          <Field k="为什么选它">
            排列 LCS→LIS 的<strong>「有界重复」变体</strong>：值不再唯一（各出现 5 次），直接映射会一对多。技巧是把每个值<strong>展开成它在 A 中的 5 个位置、按降序铺开</strong>——降序保证同一值的多个位置在 LIS 里<strong>至多选中一个</strong>，恰好等价于 LCS 的匹配约束。展开后序列长 <M>{'5n'}</M>，再跑 LIS。它教会你「重复值」如何归约回 LIS。
          </Field>
          <Field k="转移 · 复杂度">
            对 A 建<strong>位置表</strong> <M>{'pos[v]'}</M>（值 <M>{'v'}</M> 的升序位置）；扫 B，把每个值的位置<strong>降序</strong>压入序列，再求其 LIS。时间 <M>{'O(5n\\log(5n))'}</M>。
          </Field>
          <Field k="参考代码（位置展开 + LIS 二分）">
            <CodeBlock code={CODE_P4303} luogu="P4303" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2516" name="[HAOI2010] 最长公共子序列" src="洛谷原生" diff="提高+/省选-">
          <Field k="题意">
            给定两串（末尾各带一个多余字符），求它们的 LCS <strong>长度</strong>，以及<strong>不同 LCS 的方案数</strong>（对 <M>{'10^8'}</M> 取模）。
          </Field>
          <Field k="为什么选它">
            回到<strong>标准二维 LCS</strong>，但在长度之外再叠一层<strong>计数 DP</strong>：既要 <M>{'f[i][j]'}</M> 记长度，又要 <M>{'c[i][j]'}</M> 记「取得该长度的方案数」。难点是不等时把上、左两个达标来源并起来会<strong>重复计入左上</strong>，须<strong>容斥减一次</strong>。是把 LCS 从「求长度」推向「数方案」的经典一题。
          </Field>
          <Field k="转移 · 复杂度">
            相等：<M>{'f{+}1'}</M>、<M>{'c\\gets c_{\\nwarrow}'}</M>；不等：<M>{'f=\\max'}</M>，<M>{'c'}</M> 并入长度达标的上/左，再<strong>减去</strong>左上（若也达标）。时间 <M>{'O(|A|\\cdot|B|)'}</M>。
          </Field>
          <Field k="参考代码（长度 + 方案数容斥）">
            <CodeBlock code={CODE_P2516} luogu="P2516" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <p className="prose" style={{ maxWidth: 'none', fontSize: '13.5px', color: 'var(--text-3)', marginBottom: 'var(--sp-4)' }}>
          说明：纯 <strong>LCIS（最长公共上升子序列）</strong>在洛谷原生 P/B 题库暂无对应模板题（仅有 U 前缀的用户自建题）。它的正解是「LCS 匹配 + LIS 上升」的复合二维状态，已在上方深化的「常见陷阱」框里作为<strong>概念点</strong>讲解，这里不强凑题号。下面两题分别从「子序列思想」与「加权 LCS / 对齐」两侧巩固。
        </p>
        <Exercise
          pid="P2837"
          name="晚餐队列优化 Dining Cows"
          hint="子序列思想：要删掉最少的牛，等价于保留最长的一段「先按体型分组、组内编号递增」的子序列——把它转成一维 LIS/前缀最优来做，答案 = 总数 − 最长保留。"
        />
        <Exercise
          pid="P1279"
          name="字串距离"
          hint="加权 LCS / 序列对齐：允许在两串里插入空格对齐，未匹配位置罚 k、错配位置罚字符差，求最小总距离——把 LCS 的「相等/不等」转移换成「对齐/跳过」的带权版二维 DP。（亦属 A5 编辑距离一族。）"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/b/lis">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 最长上升子序列
          </span>
        </Link>
        <Link to="/part/b/edit" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            编辑距离 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
