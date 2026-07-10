import { Link } from 'react-router-dom'
import { MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import BoardDemo from '../../components/demos/bitmask/BoardDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { BitLattice, RowToMaskFigure, BoardCheckFigure, CannonTwoRowFigure } from './BitArt'

const CODE_P1896 = `
#include <iostream>
using namespace std;

long long f[10][2005][1 << 9];   // f[行][已放王数][本行摆法mask]
int st[600], num[600], cnt;      // 预处理：行内合法的 mask 及其王数

int main()
{
    int n, K;
    cin >> n >> K;

    for (int s = 0; s < (1 << n); s++)      // 枚举一行所有摆法
    {
        if (s & (s << 1)) continue;         // ★行内：相邻两列都放则丢弃
        st[cnt] = s;
        num[cnt] = __builtin_popcount(s);   // 这行放了几个王
        cnt++;
    }

    for (int i = 0; i < cnt; i++)           // 第 1 行：直接填
        if (num[i] <= K)
            f[1][num[i]][st[i]] = 1;

    for (int r = 2; r <= n; r++)            // 逐行递推
        for (int i = 0; i < cnt; i++)       // 本行摆法
            for (int j = num[i]; j <= K; j++)
                for (int p = 0; p < cnt; p++) // 上一行摆法
                {
                    int a = st[i], b = st[p];
                    if (a & b) continue;        // ★正上方相邻
                    if (a & (b << 1)) continue; // ★左上相邻
                    if (a & (b >> 1)) continue; // ★右上相邻
                    f[r][j][a] += f[r - 1][j - num[i]][b];
                }

    long long ans = 0;
    for (int i = 0; i < cnt; i++)
        ans += f[n][K][st[i]];
    cout << ans << endl;
    return 0;
}`

const CODE_P1879 = `
#include <iostream>
using namespace std;

const int MOD = 1e8;
int g[15];                        // g[i]：第 i 行的「贫瘠格」掩码（1=不能种）
int f[15][1 << 12];
int st[5000], cnt;                // 行内合法（无横向相邻）的 mask

int main()
{
    int m, n;
    cin >> m >> n;
    for (int i = 1; i <= m; i++)
        for (int j = 0; j < n; j++)
        {
            int x; cin >> x;
            if (x == 0) g[i] |= (1 << j);   // 0 = 不可种 → 记入贫瘠掩码
        }

    for (int s = 0; s < (1 << n); s++)
        if (!(s & (s << 1))) st[cnt++] = s; // 行内无相邻

    f[0][0] = 1;                            // 第 0 行（虚拟空行）方案数 1
    for (int i = 1; i <= m; i++)
        for (int a = 0; a < cnt; a++)
        {
            int s = st[a];
            if (s & g[i]) continue;         // ★踩到贫瘠格，非法
            for (int b = 0; b < cnt; b++)
            {
                int t = st[b];
                if (s & t) continue;        // 上下相邻同列不能都种
                f[i][s] = (f[i][s] + f[i - 1][t]) % MOD;
            }
        }

    int ans = 0;
    for (int a = 0; a < cnt; a++)
        ans = (ans + f[m][st[a]]) % MOD;
    cout << ans << endl;
    return 0;
}`

const CODE_P2704 = `
#include <iostream>
#include <algorithm>
using namespace std;

int g[105];                       // g[i]：第 i 行山地(H)掩码，1=不能放
int st[105], num[105], cnt;       // 行内合法：任意两个 1 至少隔 2 列
int f[105][105][105];             // f[行][上一行mask下标][上上行mask下标]

bool ok(int s)                    // 同行炮兵间隔 ≥ 3（攻击隔两格）
{
    return !(s & (s << 1)) && !(s & (s << 2));
}

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 0; j < m; j++)
        {
            char c; cin >> c;
            if (c == 'H') g[i] |= (1 << j);
        }

    for (int s = 0; s < (1 << m); s++)
        if (ok(s)) { st[cnt] = s; num[cnt] = __builtin_popcount(s); cnt++; }

    for (int i = 1; i <= n; i++)
        for (int a = 0; a < cnt; a++)       // 本行
        {
            if (st[a] & g[i]) continue;
            for (int b = 0; b < cnt; b++)   // 上一行
            {
                if (st[a] & st[b]) continue;
                for (int c = 0; c < cnt; c++)   // 上上行
                {
                    if (st[a] & st[c]) continue;
                    if (st[b] & st[c]) continue;
                    f[i][a][b] = max(f[i][a][b],
                                     f[i - 1][b][c] + num[a]);
                }
            }
        }

    int ans = 0;
    for (int a = 0; a < cnt; a++)
        for (int b = 0; b < cnt; b++)
            ans = max(ans, f[n][a][b]);
    cout << ans << endl;
    return 0;
}`

export default function BitBoard() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当「一行的选择」有了 2ⁿ 种</h2>
        <div className="prose">
          <p>
            先看一个具体问题：在 <M>{'3\\times 3'}</M> 的棋盘上放国际象棋的<strong>王</strong>，王会攻击周围 8 格，要求两两<strong>互不攻击</strong>，问放 2 个王有多少种方案。
            如果一行一行地放，每一行的状态无非是「哪些列放了王」——这本身就是 <M>{'2^3=8'}</M> 种可能。
          </p>
          <p>
            为什么不能像线性 DP 那样，只记「这一行放了几个王」？因为下一行能不能放，<strong>不只取决于个数，还取决于放在哪些列</strong>——两个王只要斜对角相邻就冲突。
            「几个」这个标量丢掉了列的信息，是<strong>有后效性</strong>的。我们需要把「这一行的完整摆法」原封不动地记进状态里。
          </p>
        </div>
        <figure className="figure">
          <RowToMaskFigure />
          <figcaption className="figure__cap">一行棋盘「放 / 不放」正好对应一个二进制整数 mask——第 c 列放了王，就让第 c 位是 1。</figcaption>
        </figure>
        <div className="prose">
          <p>
            关键的一步：把<strong>一整行的摆法压成一个整数</strong>。第 <M>{'c'}</M> 列放了王就让二进制第 <M>{'c'}</M> 位为 <M>{'1'}</M>，否则为 <M>{'0'}</M>。
            于是「列 1、列 3 放了王」就是 <M>{'00101_2=5'}</M>。整行的 <M>{'2^n'}</M> 种摆法，一一对应 <M>{'0'}</M> 到 <M>{'2^n-1'}</M> 这些整数——这就是<strong>状态压缩</strong>：用一个 mask 承载一行的全部信息。
          </p>
          <p>
            这类「逐行推进、把当前行压成 mask」的状压，叫<strong>棋盘状压 / 轮廓状压</strong>。它只在 <M>{'n'}</M> 很小（通常 <M>{'\\le 12'}</M>）时可行，因为每行要枚举 <M>{'2^n'}</M> 种摆法。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">两道判定：行内合法、行间合法</h2>
        <div className="prose">
          <p>
            压成 mask 之后，「合不合法」全部变成<strong>位运算</strong>——这正是状压的威力。放王有两条约束：
          </p>
          <p>
            <strong>① 行内不相邻。</strong>同一行里两个王不能挨着（左右相邻会互相攻击）。把摆法 <M>{'x'}</M> 左移一位再和自己按位与：<M>{'x\\ \\&\\ (x{<}{<}1)'}</M>。
            若结果非 <M>{'0'}</M>，说明存在某位和它左边一位<strong>同时为 1</strong>，即有相邻——不合法。合法当且仅当 <M>{'x\\ \\&\\ (x{<}{<}1)=0'}</M>。
          </p>
          <p>
            <strong>② 行间不冲突。</strong>本行 <M>{'x'}</M> 与上一行 <M>{'y'}</M>，王会攻击正下、左下、右下三个方向。用三个按位与一起判：
            正上方 <M>{'x\\ \\&\\ y'}</M>、左上 <M>{'x\\ \\&\\ (y{<}{<}1)'}</M>、右上 <M>{'x\\ \\&\\ (y{>}{>}1)'}</M>，三者全为 <M>{'0'}</M> 才合法。
          </p>
        </div>
        <figure className="figure">
          <BoardCheckFigure />
          <figcaption className="figure__cap">行内用 x&(x&lt;&lt;1) 查横向相邻；行间用 x&y 等查上下同列/斜角冲突（虚线为冲突列）。</figcaption>
        </figure>
        <div className="prose">
          <p>
            有了判定，状态与转移就顺理成章。设 <M>{'f[r][j][x]'}</M> 表示：前 <M>{'r'}</M> 行、一共放了 <M>{'j'}</M> 个王、且<strong>第 <M>{'r'}</M> 行摆法为 <M>{'x'}</M></strong> 时的方案数。转移枚举上一行摆法 <M>{'y'}</M>：
          </p>
          <MB>{'f[r][j][x]=\\sum_{y\\,\\sim\\,x} f[r-1][\\,j-\\mathrm{popcount}(x)\\,][y]'}</MB>
          <p>
            其中记号 <M>{'y\\sim x'}</M> 表示上一行摆法 <M>{'y'}</M> 与本行 <M>{'x'}</M> <strong>兼容</strong>——<M>{'y'}</M> 行内合法、且与 <M>{'x'}</M> 行间不冲突。边界：第 1 行 <M>{'f[1][\\mathrm{popcount}(x)][x]=1'}</M>。答案：<M>{'\\sum_x f[n][K][x]'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          状压把「一行的组合结构」塞进一个整数，于是<strong>合法性判定 = 一两条位运算</strong>、<strong>状态转移 = 枚举相邻两行的 mask 配对</strong>。指数级的摆法被 <M>{'O(n\\cdot K\\cdot 4^n)'}</M> 的表格容纳——只在 <M>{'n'}</M> 小才划算，这也是状压的适用边界。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用 <M>{'3\\times 3'}</M> 棋盘、放 <M>{'K=2'}</M> 个王，把方程跑几步。先列出「行内合法」的一行摆法（<M>{'n=3'}</M>）：</p>
        </div>
        <figure className="figure">
          <BitLattice bits={[1, 0, 1]} showBinary={false} />
          <figcaption className="figure__cap">摆法 101（列 1、列 3）——两个 1 不相邻，行内合法；而 011、110 因相邻被淘汰。</figcaption>
        </figure>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>枚举行内合法摆法。</b> <M>{'n=3'}</M> 的 8 种里，去掉含相邻 1 的（<M>{'011,110,111'}</M>），剩 <M>{'000,001,010,100,101'}</M> 共 5 种。其中放了 2 个王的只有 <M>{'101'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第 1 行初始化。</b> 每个合法摆法各算 1 种：<M>{'f[1][0][000]=1'}</M>、<M>{'f[1][1][001]=1'}</M>、…、<M>{'f[1][2][101]=1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>第 2 行接上。</b> 想让第 2 行摆 <M>{'x=101'}</M>：它要放 2 个王，需 <M>{'j\\ge 2'}</M>；上一行 <M>{'y'}</M> 必须和它行间不冲突。<M>{'y=101'}</M> 时 <M>{'x\\&y=101\\ne 0'}</M> 冲突；只有 <M>{'y=000'}</M> 才兼容 → <M>{'f[2][2][101]\\mathrel{+}=f[1][0][000]=1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>累到第 3 行求和。</b> 把 <M>{'f[3][2][x]'}</M> 对所有 <M>{'x'}</M> 求和，就得到 <M>{'3\\times 3'}</M> 放 2 个互不攻击的王的方案数（答案是 <M>{'16'}</M>）。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会在棋盘上<strong>逐行放王</strong>，先带你看「其中一种」合法布局怎么一行行搭起来，再一键用状压 DP 算出<strong>方案总数</strong>。改 N 和 K 试试。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">逐行放王，再数尽所有方案</h2>
        <div className="demo">
          <div className="demo__body">
            <BoardDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">当攻击「隔两格」：状态升到两行</h2>
        <div className="prose">
          <p>
            互不侵犯里，冲突只发生在<strong>相邻行</strong>之间，所以状态记住「上一行」就够了。可一旦攻击范围更远，一行就不够了——<strong>炮兵阵地</strong>就是典型：炮兵沿行、列方向攻击<strong>两格</strong>，于是同一列上，第 <M>{'i'}</M> 行的炮兵会打到第 <M>{'i-1'}</M> 行<strong>和</strong>第 <M>{'i-2'}</M> 行。
          </p>
          <p>
            要判断新一行合不合法，必须同时知道<strong>前两行</strong>的摆法。状态因此升维成 <M>{'f[i][x][y]'}</M>——第 <M>{'i'}</M> 行摆 <M>{'x'}</M>、第 <M>{'i-1'}</M> 行摆 <M>{'y'}</M>；转移再枚举第 <M>{'i-2'}</M> 行的 <M>{'z'}</M>，要求 <M>{'x\\&y=x\\&z=y\\&z=0'}</M>（三行两两同列不撞）。
          </p>
        </div>
        <figure className="figure">
          <CannonTwoRowFigure />
          <figcaption className="figure__cap">炮兵攻击隔两格：新行要同时避开 i−1 与 i−2 两行，所以状态必须携带「前两行」的 mask。</figcaption>
        </figure>
        <div className="prose">
          <p>
            同行内部也更严：两个炮兵至少隔 <M>{'3'}</M> 列，判定变成 <M>{'x\\&(x{<}{<}1)=0'}</M> 且 <M>{'x\\&(x{<}{<}2)=0'}</M>。这一步「从记一行升到记两行」，是轮廓状压最常见的进阶跳板——<strong>状态里到底要留几行，取决于约束能跨多远</strong>。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱：合法 mask 要预处理，别每次重算">
          <M>{'n\\le 10'}</M> 时合法摆法只有几十个，务必<strong>先枚举一遍存进数组</strong>（连同它的 <M>{'\\mathrm{popcount}'}</M>），转移时只在这几十个之间配对。若在四重循环里对全部 <M>{'2^n'}</M> 现算判定，炮兵那种三行枚举会直接超时。这是棋盘状压能否通过的关键工程点。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1896" name="[SCOI2005] 互不侵犯" src="SCOI2005" diff="普及+/提高">
          <Field k="题意">
            <M>{'N\\times N'}</M> 棋盘放 <M>{'K'}</M> 个王，王攻击相邻 8 格，求两两互不攻击的放置方案数（<M>{'N\\le 9'}</M>）。
          </Field>
          <Field k="为什么选它">
            棋盘状压的「最小完整模型」：<strong>行内 <M>{'x\\&(x{<}{<}1)'}</M> + 行间 <M>{'x\\&y'}</M> 双判定</strong>一次讲透，还带「已放王数」这一维练计数。是本类的立骨题。
          </Field>
          <Field k="状态 · 转移 · 复杂度">
            <M>{'f[r][j][x]'}</M>=前 <M>{'r'}</M> 行放 <M>{'j'}</M> 个、末行摆 <M>{'x'}</M> 的方案数；枚举兼容的上一行 <M>{'y'}</M> 累加。复杂度 <M>{'O(N\\cdot K\\cdot M^2)'}</M>，<M>{'M'}</M> 为合法摆法数。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1896} luogu="P1896" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1879" name="[USACO06NOV] Corn Fields G" src="USACO 2006" diff="普及+/提高">
          <Field k="题意">
            <M>{'M\\times N'}</M> 田地，部分格<strong>贫瘠不可种</strong>，且相邻格不能都种，求（含一块都不种的）种植方案数，对 <M>{'10^8'}</M> 取模。
          </Field>
          <Field k="换个视角">
            比互不侵犯多了「<strong>禁格</strong>」：把每行不可种的格压成掩码 <M>{'g[i]'}</M>，一行摆法 <M>{'x'}</M> 合法当且仅当 <M>{'x\\&g[i]=0'}</M>。位运算判定极干净，是「带禁格的棋盘状压」范本。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1879} luogu="P1879" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2704" name="[NOI2001] 炮兵阵地" src="NOI2001" diff="提高+/省选-">
          <Field k="题意">
            <M>{'N\\times M'}</M> 地图（<M>{'M\\le 10'}</M>），部分为山地不可驻扎；炮兵沿行列攻击<strong>两格</strong>，求最多能驻扎多少炮兵互不攻击。
          </Field>
          <Field k="为什么选它">
            把状态从「一行」升到「<strong>前两行</strong>」的经典进阶：<M>{'f[i][x][y]'}</M> 记末两行摆法，转移枚举第三行。它逼你想清「状态要留几行」这个轮廓状压的核心问题。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P2704} luogu="P2704" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2622" name="关灯问题 II" hint="把灯的开关状态压成 mask，每个按钮是一次「异或若干位」的操作，求从全亮到全灭的最少按压——状压 + BFS 最短步。" />
        <Exercise pid="P2915" name="[USACO08NOV] Mixed Up Cows G" hint="排列型状压：f[S][i]=用完集合 S 的奶牛、末位是 i 的合法排列数，转移要求相邻编号差 > K。与 TSP 同构。" />
        <Exercise pid="P3694" name="邦邦的大合唱站队" hint="每个人属于某乐队，把「已归位的乐队集合」压成 mask，f[S]=让 S 中乐队各自连续所需最少移出人数，枚举下一个整块乐队。" />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想亲手试试？到 <Link to="/part/g" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>G 部分页的「棋盘布阵」</Link>手动放王，实时看位运算判定冲突，再点「看 DP 全部方案数」对照。
      </div>

    </>
  )
}
