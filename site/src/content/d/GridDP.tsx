import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import MaxSquareDemo from '../../components/demos/grid/MaxSquareDemo'
import TwoPathDemo from '../../components/demos/grid/TwoPathDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { GridSetupFigure, SquareTransitionFigure, TwoPathFigure } from './GridDPArt'

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

const CODE_P1387 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n, m;
int g[105][105];                 // 原始 0/1 矩阵
int f[105][105];                 // f[i][j]：以 (i,j) 为右下角的最大全 1 正方形边长

int main()
{
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            cin >> g[i][j];

    int ans = 0;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            if (g[i][j] == 1)                       // 0 格当不了右下角，f 保持 0
                f[i][j] = min(min(f[i - 1][j], f[i][j - 1]), f[i - 1][j - 1]) + 1; // ★上/左/左上取 min
            ans = max(ans, f[i][j]);                // 全表最大边长
        }

    cout << ans << endl;                            // 题目要边长；面积则输出 ans*ans
    return 0;
}
// TAG: 矩阵DP 最大正方形 二维状态`

const CODE_P1006 = `
#include <iostream>
#include <algorithm>
using namespace std;

int m, n;                        // m 行 n 列
int a[55][55];
// 按步数压维：dp[k][x1][x2]，列号 y = k - x 自动定出。两条路同步从 (1,1) 走到 (m,n)。
int f[105][55][55];

int main()
{
    cin >> m >> n;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            cin >> a[i][j];

    int steps = m + n;           // 从 (1,1) 到 (m,n) 共走 (m-1)+(n-1) 步，k 从 2 到 m+n
    // 初始：k=2 时两条路都在 (1,1)，同格只算一次
    f[2][1][1] = a[1][1];

    for (int k = 3; k <= steps; k++)                 // 逐条反对角线推进
        for (int x1 = 1; x1 <= m; x1++)
        {
            int y1 = k - x1;
            if (y1 < 1 || y1 > n) continue;
            for (int x2 = 1; x2 <= m; x2++)
            {
                int y2 = k - x2;
                if (y2 < 1 || y2 > n) continue;
                // 上一步：每条路来自「上方 x-1」或「左方 x 不变」，四种组合取 max
                int best = max(max(f[k - 1][x1 - 1][x2 - 1], f[k - 1][x1 - 1][x2]),
                               max(f[k - 1][x1][x2 - 1], f[k - 1][x1][x2]));
                int add = a[x1][y1] + a[x2][y2];
                if (x1 == x2) add -= a[x1][y1];      // ★两路同格，权值只算一次
                f[k][x1][x2] = best + add;
            }
        }

    cout << f[steps][m][m] << endl;                  // 两路都到 (m,n)：x1=x2=m
    return 0;
}
// TAG: 矩阵DP 双线程 传纸条 按步压维`

const CODE_P1002 = `
#include <iostream>
using namespace std;

typedef long long ll;
ll f[25][25];                    // ★路径数会爆 int，必须 long long
bool block[25][25];              // 马的控制点（障碍）
int dx[9] = {0, 1, 1, 2, 2, -1, -1, -2, -2};
int dy[9] = {0, 2, -2, 1, -1, 2, -2, 1, -1};

int main()
{
    int bx, by, hx, hy;
    cin >> bx >> by >> hx >> hy;
    bx++, by++, hx++, hy++;                          // 坐标从 0 起，整体平移成 1-based

    for (int k = 0; k < 9; k++)                      // 马本身 + 8 个控制点设为障碍
    {
        int x = hx + dx[k], y = hy + dy[k];
        if (x >= 1 && y >= 1)
            block[x][y] = true;
    }

    f[1][1] = 1;                                     // 起点：1 条路（未走）
    for (int i = 1; i <= bx; i++)
        for (int j = 1; j <= by; j++)
        {
            if (block[i][j]) { f[i][j] = 0; continue; } // ★障碍格钉成 0，不再向外传数
            if (i == 1 && j == 1) continue;
            f[i][j] = f[i - 1][j] + f[i][j - 1];     // 上方来 + 左方来
        }

    cout << f[bx][by] << endl;
    return 0;
}
// TAG: 矩阵DP 网格路径 计数 障碍`

export default function GridDP() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当状态住进「行 × 列」的格子里</h2>
        <div className="prose">
          <p>
            <Link to="/part/b/path" style={{ color: 'var(--accent-2)' }}>B 部分的路径型入门</Link> 已经让我们在网格上走过一次——数字三角形、过河卒，都是「从一格走到相邻一格」。
            这一节把镜头正式对准<strong>二维坐标上的 DP</strong>：状态不再是一条链上的 <M>{'f[i]'}</M>，而是一整张表 <M>{'dp[i][j]'}</M>，下标 <M>{'(i,j)'}</M> 就是<strong>第 <M>{'i'}</M> 行第 <M>{'j'}</M> 列</strong>那个格子。
          </p>
          <p>
            网格 DP 的通用套路只有一句话：<strong>算一格，只回看它的几个「邻居来源」</strong>。因为每步只能往固定方向走，任何一格 <M>{'(i,j)'}</M> 的最后一步，
            都只可能从<strong>上方</strong> <M>{'(i-1,j)'}</M>、<strong>左方</strong> <M>{'(i,j-1)'}</M>，或<strong>左上方</strong> <M>{'(i-1,j-1)'}</M> 这几格接上来。把「谁能接过来」想清楚，转移就成形了。
          </p>
        </div>
        <figure className="figure">
          <GridSetupFigure />
          <figcaption className="figure__cap">
            本节主问题——「最大正方形」：一张 0/1 矩阵，1 是可用格、0 是空洞，要找出<strong>全由 1 组成的最大正方形</strong>。图中最大的是一个 3×3 块，边长 3、面积 9。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            为什么不直接暴力？枚举正方形的<strong>左上角 + 边长</strong>再逐格检查是否全 1，最坏是 <M>{'O(n^2m^2)'}</M> 甚至更糟——网格一大就崩。
            网格 DP 的思路，是给<strong>每一格</strong>算一个「以它为角能撑起多大的正方形」，让相邻格子的答案<strong>互相接力</strong>，把重复检查压成一次填表。下面就把这个 <M>{'dp[i][j]'}</M> 定出来。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">最大正方形：三格取 min，短板说了算</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[i][j]'}</M> 表示：<strong>以 <M>{'(i,j)'}</M> 为<u>右下角</u>、全部由 1 组成的最大正方形的边长</strong>。
            为什么钉死「右下角」？因为一个正方形有四个角，但只有<strong>右下角</strong>能同时「看见」它左边、上边、左上的邻居——正好对应网格 DP 的三个来源，转移最顺。
          </p>
          <p>
            若 <M>{'(i,j)'}</M> 本身是 <M>{'0'}</M>，它当不了任何全 1 正方形的右下角，直接 <M>{'dp[i][j]=0'}</M>。
            若它是 <M>{'1'}</M>，能撑多大？关键洞察：<strong>以 <M>{'(i,j)'}</M> 为右下角的正方形，等价于它的上、左、左上三个方向都能撑起「至少一样大」的正方形</strong>——任一方向短一截，整体就被拖小。于是取三者的<strong>最短板</strong>再加自己这一层：
          </p>
        </div>
        <figure className="figure">
          <SquareTransitionFigure />
          <figcaption className="figure__cap">
            以 (i,j) 为右下角的正方形，被上 dp[i−1][j]、左 dp[i][j−1]、左上 dp[i−1][j−1] 三个方向共同「顶住」——取三者最短板 +1。任一方向缺一格，正方形就撑不起来。
          </figcaption>
        </figure>
        <div className="prose">
          <p>合起来就是<strong>转移方程</strong>：</p>
          <MB>{'dp[i][j]=\\begin{cases}\\min\\big(dp[i-1][j],\\ dp[i][j-1],\\ dp[i-1][j-1]\\big)+1, & g[i][j]=1\\\\[4pt] 0, & g[i][j]=0\\end{cases}'}</MB>
          <p>
            <strong>边界</strong>在首行、首列：上方或左方越界，正方形最多 <M>{'1\\times1'}</M>，故 <M>{'g[i][j]=1'}</M> 时 <M>{'dp[i][j]=1'}</M>。
            <strong>答案</strong>不在某个固定角落，而是<strong>全表最大的 <M>{'dp[i][j]'}</M></strong>（它的平方即最大面积）——因为正方形的右下角可能落在任何位置。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 短板决定边长">
          「以我为右下角的正方形」能有多大，取决于<strong>上、左、左上三个邻居里最弱的那个</strong>：只要有一个方向撑不到 <M>{'k'}</M>，我就凑不出 <M>{'k+1'}</M> 的正方形。
          这个 <M>{'\\min(\\cdot)+1'}</M> 把「逐格检查一个二维区域是否全 1」压成了 <M>{'O(nm)'}</M> 一次扫描——<strong>二维状态最经典的一记</strong>：一格的答案，由它左上三邻的答案接力而来。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用引入图那张矩阵的<strong>左上一角</strong>走几步（行列都从 0 编号）。第 0 行原样落地 <M>{'1,0,1,1,0'}</M>，我们从第 1 行往里填：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>首行落地。</b> 第 0 行没有上方，能撑的正方形最多 <M>{'1\\times1'}</M>：格是 1 就记 1、是 0 就记 0 → <M>{'dp[0]=1,0,1,1,0'}</M>。首列同理。这是整张表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>算 <M>{'dp[1][1]'}</M></b>（本身 <M>{'g=1'}</M>）。三来源：上 <M>{'dp[0][1]=0'}</M>、左 <M>{'dp[1][0]=1'}</M>、左上 <M>{'dp[0][0]=1'}</M>，最短板是 <M>{'0'}</M>，
              于是 <M>{'dp[1][1]=0+1=1'}</M>——上方那个 0 把它死死压成了 <M>{'1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>算 <M>{'dp[1][3]'}</M></b>（<M>{'g=1'}</M>）。三来源：上 <M>{'dp[0][3]=1'}</M>、左 <M>{'dp[1][2]=1'}</M>、左上 <M>{'dp[0][2]=1'}</M>，最短板 <M>{'1'}</M>，
              <M>{'dp[1][3]=1+1=2'}</M>——三邻都够到 1，于是这里长出一个 <M>{'2\\times2'}</M> 正方形。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>一路推到 <M>{'dp[3][3]'}</M></b>。此时它的上、左、左上分别是 <M>{'2,2,2'}</M>，最短板 <M>{'2'}</M>，<M>{'dp[3][3]=2+1=3'}</M>——
              全表最大值就是这个 <strong>3</strong>，对应那个 <M>{'3\\times3'}</M> 全 1 块，面积 <M>{'9'}</M>。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把整张 <M>{'dp'}</M> 表<strong>逐格填满</strong>，高亮每格的上 / 左 / 左上三来源并标出最短板。<strong>点矩阵里的格子可翻转 0↔1</strong>，看最大正方形实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看正方形一格一格长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <MaxSquareDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化 · 双线程：两条路一起走</h2>
        <div className="prose">
          <p>
            <strong>先说和 B 路径型的分工：</strong>双线程的<strong>四维朴素写法</strong>（<M>{'dp[x_1][y_1][x_2][y_2]'}</M>）已在 <Link to="/part/b/path" style={{ color: 'var(--accent-2)' }}>B 路径型</Link> 里随方格取数带出——那边侧重<strong>路径 DP 入门</strong>、顺手把四维摆出来；
            本页不再重复四维怎么来，而是专注<strong>把它压成三维 <M>{'dp[k][x_1][x_2]'}</M></strong>，这正是「网格二维状态 + 压维」这一专章的重心。
          </p>
          <p>
            网格 DP 的第二条主线，是<strong>同一张网格上有两条路径要一起规划</strong>——经典模型「<strong>传纸条</strong>」：两位同学分别从<strong>左上角</strong>出发、只能<strong>向右或向下</strong>，各自走到<strong>右下角</strong>，
            每格有一个好感度权值，问两条路径<strong>合计能收集的最大权值和</strong>（同一格被两条路都经过时，权值<strong>只算一次</strong>）。
          </p>
          <p>
            为什么不能「先跑一条最优路，再跑第二条」？因为两条路会<strong>互相影响</strong>：第一条把高权值的格子占了，第二条就只能退而求其次——分开贪心必然错。正确做法是让<strong>两条路同时决策</strong>，
            状态一口气记住<strong>两条路各自的位置</strong>：<M>{'dp[x_1][y_1][x_2][y_2]'}</M>，四维，转移从两条路各自的「上 / 左」共 <M>{'4'}</M> 种组合取 max（这正是 <Link to="/part/b/path" style={{ color: 'var(--accent-2)' }}>B 路径型</Link> 里方格取数的四维写法）。
          </p>
          <p>
            四维能<strong>压成三维</strong>。注意一个约束：两条路<strong>同步推进</strong>——走了同样多步的两条右/下路径，<strong>行号 + 列号必然相等</strong>，即 <M>{'x_1+y_1=x_2+y_2=k'}</M>（都落在<strong>反对角线</strong> <M>{'x+y=k'}</M> 上）。
            既然列号能由 <M>{'y=k-x'}</M> 反推，就不必单独存它，状态压成 <M>{'dp[k][x_1][x_2]'}</M>：
          </p>
        </div>
        <figure className="figure">
          <TwoPathFigure />
          <figcaption className="figure__cap">
            两条路径同步从左上走到右下：走了 k 步时，两条路都落在反对角线 x+y=k 上。只需记两条路当前的行号 x1、x2，列号 y=k−x 自动定出——四维 dp 压成三维 dp[k][x1][x2]。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            转移：从 <M>{'k-1'}</M> 层推到 <M>{'k'}</M> 层，每条路上一步要么来自<strong>上方</strong>（<M>{'x'}</M> 减 1）、要么来自<strong>左方</strong>（<M>{'x'}</M> 不变、<M>{'y'}</M> 减 1），两条路组合出 <M>{'4'}</M> 种来源取 max，再加上两条路当前所站两格的权值。<strong>关键一处：若两条路走到<u>同一格</u></strong>（<M>{'x_1=x_2'}</M>，此时 <M>{'y'}</M> 也相等），那格权值<strong>只能加一次</strong>：
          </p>
          <MB>{'dp[k][x_1][x_2]=\\max_{4\\text{ prev}}dp[k-1]+a[x_1][y_1]+a[x_2][y_2]-[\\,x_1=x_2\\,]\\cdot a[x_1][y_1]'}</MB>
          <p>把这套三维推进写成中文伪代码：</p>
          <pre className="mono" style={preMono}>
{`# 双线程 / 传纸条：两条路同步从 (0,0) 走到 (R-1,C-1)
dp[0][0] = a[0][0]                 # k=0，两条路都在起点，同格只算一次
for k = 1 … (R-1)+(C-1):          # 逐条反对角线
  for x1 in 合法行, x2 in 合法行:    # y1=k-x1, y2=k-x2（越界跳过）
    best = max over (路1 来自上/左) × (路2 来自上/左)   # 共 4 种
    add  = a[x1][y1] + a[x2][y2]
    if x1 == x2: add -= a[x1][y1]  # ★两路撞同格，权值只算一次
    dp[k][x1][x2] = best + add
answer = dp[最后一层][R-1][R-1]     # 两条路都到右下角`}
          </pre>
        </div>
        <InfoBox kind="key" title="双线程要诀 · 同步推进 + 同格去重">
          「两条路径联合决策」的通法：让两条路<strong>同步走</strong>（步数相同），把<strong>两条路的位置<u>拼进同一个状态</u></strong>一起转移，绝不各自贪心。
          由「同步」得到 <M>{'x_1+y_1=x_2+y_2=k'}</M>，可省掉一维压成 <M>{'dp[k][x_1][x_2]'}</M>；而两路可能<strong>重合</strong>，凡 <M>{'x_1=x_2'}</M> 的格子记得<strong>扣掉一次重复权值</strong>。这两条一立，从「两条路」到「多条路」都是同一副骨架。
        </InfoBox>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'dp[k][x_1][x_2]'}</M> 摆成一张<strong>行 = 路1 行号、列 = 路2 行号</strong>的表，<strong>逐层 <M>{'k'}</M></strong> 填格；对角线上（<M>{'x_1=x_2'}</M>）的格子正是「两路撞在一起、权值去重」的地方。改网格权值或大小，看最大权值和实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看两条路同步推进</h2>
        <div className="demo">
          <div className="demo__body">
            <TwoPathDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1387" name="最大正方形" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            给定 <M>{'n\\times m'}</M> 的 0/1 矩阵，求<strong>只含 1 的最大正方形</strong>的边长（边长平方即面积）。
          </Field>
          <Field k="对应关系">
            本节主问题的<strong>裸模板</strong>。状态 <M>{'f[i][j]'}</M> = 以 <M>{'(i,j)'}</M> 为右下角的最大全 1 正方形边长，答案取全表最大 <M>{'f'}</M>。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[i][j]=\\min(f[i-1][j],\\ f[i][j-1],\\ f[i-1][j-1])+1'}</M>（<M>{'g[i][j]=1'}</M> 时），否则 <M>{'0'}</M>；一次扫描 <M>{'O(nm)'}</M>。
          </Field>
          <Field k="参考代码（三格取 min）">
            <CodeBlock code={CODE_P1387} luogu="P1387" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1006" name="[NOIP2008 提高组] 传纸条" src="NOIP2008 提高组" diff="普及+/提高">
          <Field k="题意">
            <M>{'m\\times n'}</M> 网格每格有一个好感度，两张纸条各从左上角走到右下角（只走右 / 下），两条路径<strong>不重叠</strong>，求两条路径好感度之和的最大值。
          </Field>
          <Field k="状态设计（双线程 / 按步压维）">
            让两条路<strong>同步推进</strong>：走了 <M>{'k'}</M> 步都落在反对角线 <M>{'x+y=k'}</M> 上，状态压成 <M>{'f[k][x_1][x_2]'}</M>（列号 <M>{'y=k-x'}</M> 反推）。
            转移从两条路各自的「上 / 左」共 <M>{'4'}</M> 种组合取 max；两路<strong>撞在同格</strong>（<M>{'x_1=x_2'}</M>）时权值只算一次——这道自然逼你把「重叠去重」写进转移。
          </Field>
          <Field k="为什么选它">
            <strong>双线程 DP 的标杆题</strong>：真正的门槛不是转移，而是想到「<strong>两条路必须同时决策、位置一起进状态</strong>」，以及用「同步推进」把四维压成三维。学会它，方格取数、后续多路径问题都是同一副骨架。
          </Field>
          <Field k="参考代码（按步压维 dp[k][x1][x2]）">
            <CodeBlock code={CODE_P1006} luogu="P1006" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1002" name="[NOIP2002 普及组] 过河卒" src="NOIP2002 普及组" diff="普及-">
          <Field k="题意">
            卒从 <M>{'(0,0)'}</M> 只走右 / 下到达 <M>{'(n,m)'}</M>，棋盘上一匹马的<strong>所在点与 8 个可跳到的点</strong>都不能经过，求不同路径条数。
          </Field>
          <Field k="换个视角（网格 DP 的计数面）">
            同样是「每格只回看上、左两个来源」的网格 DP，只是把<strong>取最优换成求方案数</strong>：<M>{'f[i][j]=f[i-1][j]+f[i][j-1]'}</M>。障碍格<strong>钉成 0</strong>，它就不再把任何路径数向外传——「非法状态清零」。
          </Field>
          <Field k="为什么选它">
            补齐网格 DP 的<strong>计数视角</strong>（与本页「求最优」互为一体两面），并示范<strong>障碍即非法状态清零</strong>。有个必踩的坑：最坏路径数超过 <M>{'2^{31}'}</M>，<strong>必须开 <M>{'\\texttt{long long}'}</M></strong>。此题在 <Link to="/part/b/path" style={{ color: 'var(--accent-2)' }}>B 路径型</Link> 亦有讲解，可对照。
          </Field>
          <Field k="参考代码（long long + 障碍清零）">
            <CodeBlock code={CODE_P1002} luogu="P1002" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1004"
          name="[NOIP2000 提高组] 方格取数"
          hint="双线程同族：两条路同时从左上取数到右下，同一格数字只算一次。可写四维 f[x1][y1][x2][y2]，或与传纸条一样按步压成 f[k][x1][x2]。转移从两条路各自「上/左」的 4 种组合取 max。"
        />
        <Exercise
          pid="P1719"
          name="最大加权矩形"
          hint="二维前缀和 + 最大子段和（Kadane 升维）：枚举上下两行边界，把这两行之间每列的和压成一维数组，对它跑一次最大子段和，即得跨这段行的最大子矩阵。O(n³)。"
        />
        <Exercise
          pid="P1508"
          name="Likecloud-吃、吃、吃"
          hint="网格路径最大权、三方向：从底行中央下方出发向上走，每步可去正前 / 左前 / 右前，格中能量可正可负，求到顶行的最大能量和。f[i][j] 从下方三格取 max 再加自己，是数字三角形的三向网格版。"
        />
      </section>

      <nav className="type-nav">
        <span />
        <Link to="/part/d/matpow" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            矩阵快速幂加速 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
