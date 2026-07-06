import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import TspDemo from '../../components/demos/bitmask/TspDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { BitLattice, TspStateFigure, TspTransFigure, OpenClosedFigure } from './BitArt'

const CODE_P10447 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int n;
int w[25][25];               // 两点间边权
int f[1 << 20][25];          // f[S][i]：走过集合 S、当前停在 i 的最短路

int main()
{
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> w[i][j];

    memset(f, 0x3f, sizeof f);
    f[1][0] = 0;                            // 只到过点 0、停在 0，路程 0

    for (int S = 1; S < (1 << n); S++)      // 枚举集合（升序保证子集先算）
        for (int i = 0; i < n; i++)
        {
            if (!(S >> i & 1)) continue;    // i 必须已在集合内
            if (f[S][i] == 0x3f3f3f3f) continue;
            for (int j = 0; j < n; j++)
            {
                if (S >> j & 1) continue;   // ★j 必须尚未访问
                int T = S | (1 << j);       // 把 j 加入集合
                f[T][j] = min(f[T][j], f[S][i] + w[i][j]);
            }
        }

    cout << f[(1 << n) - 1][n - 1] << endl; // 走遍全集、停在点 n-1
    return 0;
}`

const CODE_P1433 = `
#include <iostream>
#include <cmath>
#include <cstring>
#include <algorithm>
using namespace std;

int n;
double x[20], y[20];
double dist[20][20];
double f[1 << 16][16];       // 下标 0 代表原点 (0,0)，1..n 为奶酪

int main()
{
    cin >> n;
    x[0] = y[0] = 0;                        // 原点当作第 0 个点
    for (int i = 1; i <= n; i++)
        cin >> x[i] >> y[i];

    for (int i = 0; i <= n; i++)
        for (int j = 0; j <= n; j++)
            dist[i][j] = sqrt((x[i] - x[j]) * (x[i] - x[j])
                            + (y[i] - y[j]) * (y[i] - y[j]));

    int m = n + 1;                          // 连原点共 m 个点
    for (int S = 0; S < (1 << m); S++)
        for (int i = 0; i < m; i++) f[S][i] = 1e18;
    f[1][0] = 0;                            // 从原点出发

    for (int S = 1; S < (1 << m); S++)
        for (int i = 0; i < m; i++)
        {
            if (!(S >> i & 1) || f[S][i] > 1e17) continue;
            for (int j = 0; j < m; j++)
            {
                if (S >> j & 1) continue;
                int T = S | (1 << j);
                f[T][j] = min(f[T][j], f[S][i] + dist[i][j]);
            }
        }

    double ans = 1e18;
    for (int i = 1; i < m; i++)             // 吃完所有奶酪，停哪都行
        ans = min(ans, f[(1 << m) - 1][i]);
    printf("%.2f\\n", ans);
    return 0;
}`

const CODE_P1171 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int n;
int w[25][25];
int f[1 << 20][25];

int main()
{
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> w[i][j];

    memset(f, 0x3f, sizeof f);
    f[1][0] = 0;                            // 从 1 号城市（下标 0）出发

    for (int S = 1; S < (1 << n); S++)
        for (int i = 0; i < n; i++)
        {
            if (!(S >> i & 1) || f[S][i] == 0x3f3f3f3f) continue;
            for (int j = 0; j < n; j++)
            {
                if (S >> j & 1) continue;
                int T = S | (1 << j);
                f[T][j] = min(f[T][j], f[S][i] + w[i][j]);
            }
        }

    int ans = 0x3f3f3f3f;
    for (int i = 1; i < n; i++)             // ★闭环：末尾必须再回到起点 0
        ans = min(ans, f[(1 << n) - 1][i] + w[i][0]);
    cout << ans << endl;
    return 0;
}`

export default function BitTSP() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">走遍所有点，暴力为何不行</h2>
        <div className="prose">
          <p>
            旅行商问题（TSP）：从起点出发，<strong>不重不漏地走遍所有 <M>{'n'}</M> 个点</strong>，让总路程最短。最直白的想法是枚举点的排列——<M>{'n'}</M> 个点有 <M>{'n!'}</M> 种走法，<M>{'n=12'}</M> 已接近五亿，<M>{'n=15'}</M> 就上万亿，彻底不可行。
          </p>
          <p>
            但仔细想：走到某一步时，<strong>接下来怎么走最优，只跟两件事有关</strong>——「<strong>已经走过了哪些点</strong>」（一个集合）和「<strong>此刻站在哪个点</strong>」。至于这些点是按什么顺序走到的，对未来毫无影响。这就把 <M>{'n!'}</M> 条路径，坍缩成了「已访问集合 × 当前点」这么多状态。
          </p>
        </div>
        <figure className="figure">
          <TspStateFigure />
          <figcaption className="figure__cap">TSP 状态两个维度：已访问集合 S（用比特点阵表示）+ 当前停留的点 i。</figcaption>
        </figure>
        <div className="prose">
          <p>
            「已访问集合」用<strong>状态压缩</strong>再合适不过：<M>{'n'}</M> 个点的子集，正好是一个 <M>{'n'}</M> 位二进制数 <M>{'S'}</M>，第 <M>{'i'}</M> 位为 <M>{'1'}</M> 表示点 <M>{'i'}</M> 已访问。集合共 <M>{'2^n'}</M> 个，配上 <M>{'n'}</M> 个「当前点」，状态总数 <M>{'2^n\\cdot n'}</M>——<M>{'n=18'}</M> 也只有约 <M>{'470'}</M> 万，可以承受。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：dp[S][i]</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[S][i]'}</M> 表示：已经走过的点集合恰为 <M>{'S'}</M>、当前停在点 <M>{'i'}</M>（<M>{'i'}</M> 必属于 <M>{'S'}</M>）时，走出这条路径的<strong>最短总长</strong>。
          </p>
          <p>
            <strong>转移。</strong>从 <M>{'dp[S][i]'}</M> 出发，选一个<strong>还没访问过</strong>的点 <M>{'j'}</M>（即第 <M>{'j'}</M> 位在 <M>{'S'}</M> 里是 <M>{'0'}</M>），走过去。新集合是 <M>{'S'}</M> 点亮第 <M>{'j'}</M> 位，当前点变成 <M>{'j'}</M>，路程加上 <M>{'dist(i,j)'}</M>：
          </p>
        </div>
        <figure className="figure">
          <TspTransFigure />
          <figcaption className="figure__cap">从当前点 i 走向未访问点 j：集合并入 j，用 S ∪ {'{j}'} 更新 dp[S∪{'{j}'}][j]。</figcaption>
        </figure>
        <div className="prose">
          <MB>{'dp[S\\cup\\{j\\}][j]=\\min\\big(dp[S\\cup\\{j\\}][j],\\ dp[S][i]+dist(i,j)\\big)'}</MB>
          <p>
            边界：<M>{'dp[\\{0\\}][0]=0'}</M>（从点 0 出发，只到过点 0，路程 0）。答案：走遍全集后停在终点 <M>{'t'}</M>，即 <M>{'dp[(1{<}{<}n)-1][t]'}</M>。
            实现时按 <M>{'S'}</M> 从小到大枚举——因为并入新点后 <M>{'S\\cup\\{j\\}>S'}</M>，保证每个状态被用到时，它依赖的子状态已经算好。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          状压把「已访问哪些点」这个<strong>集合</strong>编码成一个整数下标，于是「走过的历史」被压进 <M>{'dp'}</M> 的第一维。<M>{'n!'}</M> 条排列坍缩为 <M>{'O(2^n\\cdot n)'}</M> 个状态、每个状态 <M>{'O(n)'}</M> 转移，总复杂度 <M>{'O(2^n\\cdot n^2)'}</M>——这是 <M>{'n\\le 20'}</M> 的 TSP 唯一可行的通用解法。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>取 <M>{'4'}</M> 个点，起点为 <M>{'0'}</M>，看几个关键状态怎么被填出来。集合用 4 位二进制表示（最高位是点 3）：</p>
        </div>
        <figure className="figure">
          <BitLattice bits={[1, 1, 0, 0]} labels={['0', '1', '2', '3']} showBinary={false} />
          <figcaption className="figure__cap">集合 S = 0011：点 0、1 已访问，点 2、3 待访问（顶端为点编号）。</figcaption>
        </figure>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>起点。</b> <M>{'dp[0001][0]=0'}</M>——集合只含点 0，停在 0，路程 0。其余状态先设为 <M>{'+\\infty'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>从 0 走到 1。</b> <M>{'j=1'}</M> 未访问：<M>{'dp[0011][1]=dp[0001][0]+dist(0,1)=dist(0,1)'}</M>。集合从 <M>{'0001'}</M> 点亮第 1 位成 <M>{'0011'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>再从 1 走到 2。</b> 现在 <M>{'S=0011'}</M>、当前在 <M>{'1'}</M>，去 <M>{'j=2'}</M>：<M>{'dp[0111][2]=dp[0011][1]+dist(1,2)'}</M>。集合变 <M>{'0111'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>收尾。</b> 当 <M>{'S=1111'}</M>（全走过）时，<M>{'dp[1111][i]'}</M> 就是「走遍四点、停在 <M>{'i'}</M>」的最短路。开环 TSP 取 <M>{'\\min_i dp[1111][i]'}</M> 即答案。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'dp[S][i]'}</M> 直接铺成<strong>网格</strong>：行是集合 mask，列是当前点。拖动小地图上的点、增删点数，看整张表怎么从起点一格格点亮。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">dp[S][i] 就是一张表</h2>
        <div className="prose">
          <p>
            <M>{'dp[S][i]'}</M> 有两个下标，天生就是<strong>二维表格</strong>：把 <M>{'2^n'}</M> 个集合当作行、<M>{'n'}</M> 个当前点当作列。每一步转移，都是从某个已算好的格子，指向「集合更大一位、当前点为 <M>{'j'}</M>」的新格子。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <TspDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">开环还是闭环：一个 +dist(i,0) 的差别</h2>
        <div className="prose">
          <p>
            上面求的是<strong>Hamilton 路径</strong>——走遍所有点就结束，<strong>不必回到起点</strong>，答案是 <M>{'\\min_i dp[(1{<}{<}n)-1][i]'}</M>。这是「最短 Hamilton 路径」和「吃奶酪」的形态。
          </p>
          <p>
            但「售货员的难题」要求走一圈<strong>回到出发城市</strong>——这是<strong>闭环</strong> TSP（Hamilton 回路）。状态转移一模一样，只有最后一步不同：停在 <M>{'i'}</M> 后还得<strong>补上回起点的边</strong>，答案变成 <M>{'\\min_i\\big(dp[(1{<}{<}n)-1][i]+dist(i,0)\\big)'}</M>。
          </p>
        </div>
        <figure className="figure">
          <OpenClosedFigure />
          <figcaption className="figure__cap">开环：走遍即止；闭环：末尾必须再加一条回到起点 0 的边（虚线）。差别只在收尾。</figcaption>
        </figure>
        <InfoBox kind="warn" title="常见陷阱：开环 / 闭环、有向 / 无向别混">
          闭环忘了 <M>{'+dist(i,0)'}</M> 会算成开环，答案偏小；开环误加了回边则偏大。另外「售货员」是<strong>有向图</strong>，<M>{'dist(i,j)'}</M> 未必等于 <M>{'dist(j,i)'}</M>，转移里务必用<strong>方向正确</strong>的那条边。起点固定为 <M>{'0'}</M> 是惯例——回路从哪点断开都一样，固定起点可省去一层枚举。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P10447" name="最短 Hamilton 路径" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            给定 <M>{'n'}</M> 个点的带权无向图（<M>{'n\\le 20'}</M>），求从点 <M>{'0'}</M> 到点 <M>{'n-1'}</M>、恰好经过每个点各一次的最短路径长。
          </Field>
          <Field k="为什么选它">
            TSP 状压<strong>最纯的模板</strong>：没有坐标、没有几何，输入直接给邻接矩阵，让你把注意力全放在 <M>{'dp[S][i]'}</M> 的状态设计和「枚举未访问点」的转移上。先立骨架就选它。
          </Field>
          <Field k="状态 · 转移 · 复杂度">
            <M>{'dp[S][i]'}</M>=走过 <M>{'S'}</M>、停在 <M>{'i'}</M> 的最短路；<M>{'dp[S\\cup\\{j\\}][j]=\\min(\\cdot,dp[S][i]+w_{ij})'}</M>；<M>{'O(2^n n^2)'}</M>。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P10447} luogu="P10447" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1433" name="吃奶酪" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            平面上 <M>{'n'}</M> 块奶酪（<M>{'n\\le 15'}</M>），老鼠从原点 <M>{'(0,0)'}</M> 出发，求吃完所有奶酪走过的最短欧氏距离。
          </Field>
          <Field k="换个视角">
            把<strong>原点也当作一个点</strong>（编号 0），就化归为「从 0 出发的开环 TSP」，只是边权是<strong>欧氏距离</strong>（用 <M>{'double'}</M>）。题面亲切、坐标直观，是把抽象 TSP 落到几何上的最佳过渡。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1433} luogu="P1433" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1171" name="售货员的难题" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            <M>{'n'}</M> 个村庄，售货员从<strong>家（1 号）出发，走遍所有村庄再回到家</strong>，给定两两距离，求最短总路程（<M>{'n\\le 20'}</M>）。
          </Field>
          <Field k="换个视角">
            与前两题的关键差别：这是<strong>闭环</strong>——末尾必须 <M>{'+dist(i,0)'}</M> 回到起点。把它和开环并排，正好暴露「回不回起点」这个最常见的 TSP 坑。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1171} luogu="P1171" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2831" name="[NOIP2016 提高组] 愤怒的小鸟" hint="换个集合含义：S=已消灭的猪的集合。预处理每条抛物线能打掉哪些猪（压成 mask），转移选一条线覆盖新猪——是 TSP 之外的「集合覆盖」状压，见下一类。" />
        <Exercise pid="P2915" name="[USACO08NOV] Mixed Up Cows G" hint="排列型集合状压，与 TSP 同构：f[S][i]=用完集合 S、末位是 i 的合法排列数，转移要求相邻编号差 > K。把「最短路」换成「计数」。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/g/board" className="prev">
          <span className="dir">
            <ArrowLeft size={13} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">棋盘 / 轮廓状压</span>
        </Link>
        <Link to="/part/g/cover" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            状压 + 覆盖 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
