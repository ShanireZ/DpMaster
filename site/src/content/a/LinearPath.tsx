import { Link } from 'react-router-dom'
import { ArrowRight, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import PathTriangleDemo from '../../components/demos/grid/PathTriangleDemo'
import PathGridCountDemo from '../../components/demos/grid/PathGridCountDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { TrianglePathFigure, TriangleDecisionFigure, GridCountFigure } from './LinearPathArt'

const CODE_P1216 = `
#include <algorithm>
#include <iostream>
using namespace std;
#define MX 1005
int n, a[MX][MX], f[MX][MX];

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)
            cin >> a[i][j];

    for (int i = 1; i <= n; i++)         // 最底行先落地：f[n][j] = a[n][j]
        f[n][i] = a[n][i];

    for (int i = n - 1; i >= 1; i--)     // ★自底向上，从倒数第二行往塔顶推
        for (int j = 1; j <= i; j++)
            f[i][j] = a[i][j] + max(f[i + 1][j], f[i + 1][j + 1]); // 正下方 / 右下方取大

    cout << f[1][1] << endl;             // 答案在塔顶
    return 0;
}
// TAG: 线性DP 数字三角形 递推`

const CODE_P1002 = `
#include <iostream>
using namespace std;
#define MX 25
long long f[MX][MX];                 // ★路径数会爆 int，必须 long long
bool block[MX][MX];                  // 马的控制点（障碍）
int dx[9] = {0, 1, 1, 2, 2, -1, -1, -2, -2};
int dy[9] = {0, 2, -2, 1, -1, 2, -2, 1, -1};

int main()
{
    int bx, by, hx, hy;
    cin >> bx >> by >> hx >> hy;
    bx += 1, by += 1, hx += 1, hy += 1;         // 坐标从 0 起，整体平移成 1-based

    for (int k = 0; k < 9; k++)                  // 马本身 + 8 个control点设为障碍
    {
        int x = hx + dx[k], y = hy + dy[k];
        if (x >= 1 && y >= 1)
            block[x][y] = true;
    }

    f[1][1] = 1;                                 // 起点：1 条路（未走）
    for (int i = 1; i <= bx; i++)
        for (int j = 1; j <= by; j++)
        {
            if (block[i][j])                     // 障碍格：卒到不了，方案数清零
            {
                f[i][j] = 0;
                continue;
            }
            if (i == 1 && j == 1)
                continue;
            f[i][j] = f[i - 1][j] + f[i][j - 1]; // 上方来 + 左方来
        }

    cout << f[bx][by] << endl;
    return 0;
}
// TAG: 线性DP 网格路径 计数 障碍`

const CODE_P1004 = `
#include <algorithm>
#include <iostream>
using namespace std;
#define MX 12
int n, a[MX][MX];
int f[MX][MX][MX][MX];               // 两条路径同时走：各自的 (x1,y1) 与 (x2,y2)

int main()
{
    cin >> n;
    int x, y, w;
    while (cin >> x >> y >> w && (x || y || w))
        a[x][y] = w;

    for (int i = 1; i <= n; i++)         // 两条路一起从 (1,1) 走到 (n,n)
        for (int j = 1; j <= n; j++)
            for (int k = 1; k <= n; k++)
                for (int l = 1; l <= n; l++)
                {
                    int best = max(max(f[i - 1][j][k - 1][l], f[i - 1][j][k][l - 1]),
                                   max(f[i][j - 1][k - 1][l], f[i][j - 1][k][l - 1]));
                    f[i][j][k][l] = best + a[i][j] + a[k][l];
                    if (i == k && j == l)        // 同一格只能被拿一次，扣掉重复
                        f[i][j][k][l] -= a[i][j];
                }

    cout << f[n][n][n][n] << endl;
    return 0;
}
// TAG: 线性DP 网格路径 双线程 方格取数`

export default function LinearPath() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从「一步一步往下走」说起</h2>
        <div className="prose">
          <p>
            先看一个具体场景——<strong>数字三角形</strong>：一座数字塔，从<strong>塔顶</strong>出发往下走，每一步只能踩到<strong>正下方</strong>或<strong>右下方</strong>那一格，
            一直走到<strong>塔底</strong>。把沿途踩过的数字加起来，问：怎么走，能让这个<strong>总和最大</strong>？
          </p>
        </div>
        <figure className="figure">
          <TrianglePathFigure />
          <figcaption className="figure__cap">
            数字塔：从顶走到底，每步只能去正下方或右下方。图中高亮的一条路 3→6→8，总和 17——它是最大的吗？
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            第一反应也许是<strong>贪心</strong>：每一步都挑「眼前更大的那个邻居」。从顶上 <M>{'3'}</M> 往下，左边是 <M>{'6'}</M>、右边是 <M>{'5'}</M>，贪心选 <M>{'6'}</M>；
            再往下，<M>{'6'}</M> 的两个孩子是 <M>{'3'}</M> 和 <M>{'8'}</M>，选 <M>{'8'}</M>——凑成 <M>{'3+6+8=17'}</M>。这一回它恰好对了，但贪心<strong>并不可靠</strong>：
            眼前小一点的邻居，底下可能接着一串大数。<strong>此刻的最优选择，要看后面还能捡到多少</strong>——这是个牵一发动全身的全局问题。
          </p>
          <p>
            那把每条路径都枚举一遍呢？塔有 <M>{'n'}</M> 层，每步二选一，就是 <M>{'2^{n-1}'}</M> 条路，<M>{'n=100'}</M> 时是天文数字。
            <strong>DP 的思路，是不去数「路」，而是给每一格算一个值</strong>：从这一格出发、走到塔底能拿到的<strong>最大总和</strong>。
          </p>
          <p>
            这里藏着线性 DP 最朴素的一问：<strong>站在一格上，往下的「最后一步」从哪来？</strong>——只可能是它<strong>正下方</strong>或<strong>右下方</strong>的那一格接上来。
            把这个「最后一步」想清楚，转移方程就浮出来了。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：每格只回看下面两格</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'f[i][j]'}</M> 表示：<strong>从第 <M>{'i'}</M> 行第 <M>{'j'}</M> 列这一格出发、一路走到塔底，能得到的最大数字和</strong>。
            这样一来，我们真正想要的答案就是塔顶那一格 <M>{'f[1][1]'}</M>。
          </p>
        </div>
        <figure className="figure">
          <TriangleDecisionFigure />
          <figcaption className="figure__cap">
            每格 f[i][j] 只有两个下方来源：正下方 f[i+1][j] 与右下方 f[i+1][j+1]，取较大的那个，再加上自己这格的数字。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            站在 <M>{'f[i][j]'}</M>，下一步只有两条路：走到<strong>正下方</strong> <M>{'f[i+1][j]'}</M>，或走到<strong>右下方</strong> <M>{'f[i+1][j+1]'}</M>。
            从这一格出发的最大和，就是「自己这格的数字 <M>{'a[i][j]'}</M>」加上「两个下方谁能带来更大的后续」。于是得到<strong>转移方程</strong>：
          </p>
          <MB>{'f[i][j]=a[i][j]+\\max\\big(\\,f[i+1][j],\\ f[i+1][j+1]\\,\\big)'}</MB>
          <p>
            <strong>边界</strong>在最底行：站在塔底，脚下就是终点，无路可走，从这里出发的最大和就是它自己，<M>{'f[n][j]=a[n][j]'}</M>。
            有了地基，从倒数第二行开始<strong>自底向上</strong>逐行往塔顶推，最后读 <M>{'f[1][1]'}</M> 即答案。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          这一步把「数 <M>{'2^{n-1}'}</M> 条路」换成了「给 <M>{'O(n^2)'}</M> 个格子各算一个最优值」。能这么换，靠的是<strong>无后效性</strong>：<M>{'f[i][j]'}</M> 只关心「从这格往下」的最优，
          与「怎么走到这格」毫无关系。每个子问题（一格的最优）算一次、存下来，被上方两格反复复用——这正是<strong>最优子结构 + 重叠子问题</strong>，DP 的两块基石。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用图中那座三行小塔（第 1 行 <M>{'3'}</M>；第 2 行 <M>{'6,5'}</M>；第 3 行 <M>{'3,8,2'}</M>）走一遍，<strong>从最底行往上</strong>填：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>最底行落地。</b> 第 3 行每格脚下就是终点，从它出发的最大和就是自己：<M>{'f[3][1]=3,\\ f[3][2]=8,\\ f[3][3]=2'}</M>。这是整张表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>算第 2 行左格</b> <M>{'f[2][1]'}</M>（本身 <M>{'a=6'}</M>）。它的两个下方是 <M>{'f[3][1]=3'}</M> 与 <M>{'f[3][2]=8'}</M>，取大者 <M>{'8'}</M>，
              于是 <M>{'f[2][1]=6+8=14'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>算第 2 行右格</b> <M>{'f[2][2]'}</M>（本身 <M>{'a=5'}</M>）。两个下方是 <M>{'f[3][2]=8'}</M> 与 <M>{'f[3][3]=2'}</M>，取大者 <M>{'8'}</M>，
              于是 <M>{'f[2][2]=5+8=13'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>算塔顶</b> <M>{'f[1][1]'}</M>（本身 <M>{'a=3'}</M>）。两个下方是 <M>{'f[2][1]=14'}</M> 与 <M>{'f[2][2]=13'}</M>，取大者 <M>{'14'}</M>，
              于是 <M>{'f[1][1]=3+14=17'}</M>——正是最大和，对应那条 <M>{'3\\to 6\\to 8'}</M> 的路。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把整座塔<strong>从底往上逐格填满</strong>，并高亮每格的两个下方来源。试着改数字或层数，看它实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它从底往上长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <PathTriangleDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">换个方向：把「最优」换成「计数」</h2>
        <div className="prose">
          <p>
            同一套「格子上的递推」，稍微换个问法就能解一类全新的题。看<strong>过河卒</strong>：一枚卒在网格上，从<strong>左上角</strong>出发，每步只能<strong>向右</strong>或<strong>向下</strong>，
            要走到<strong>右下角</strong>。这回不问「最大和」，而问<strong>一共有多少条不同的路</strong>。
          </p>
          <p>
            还是先问那句话：走到某一格 <M>{'(i,j)'}</M>，<strong>最后一步从哪来？</strong>只可能从<strong>上方</strong> <M>{'(i-1,j)'}</M> 向下一步，或从<strong>左方</strong> <M>{'(i,j-1)'}</M> 向右一步。
            于是「走到 <M>{'(i,j)'}</M> 的路数」= 「走到上方的路数」+「走到左方的路数」：
          </p>
          <MB>{'f[i][j]=f[i-1][j]+f[i][j-1]'}</MB>
          <p>
            边界是起点 <M>{'f[1][1]=1'}</M>（站着没动，也算 1 条路），第一行、第一列都只有 1 条路（只能一直往右 / 往下）。
            <strong>和数字三角形是同一个模具</strong>：只是把转移里的 <M>{'\\max'}</M> 换成了<strong>相加</strong>——求最优变成了求方案数。
          </p>
          <p>
            过河卒还多一条硬约束：棋盘上有一匹<strong>马</strong>，马本身和它能一步跳到的 8 个点都是<strong>障碍</strong>，卒一步都不能踩。障碍怎么进方程？很简单——
            <strong>障碍格的方案数直接钉成 0</strong>：既然卒到不了它，它也就不会再把任何路径数往右、往下传出去。这就是「<strong>非法状态清零</strong>」，线性 DP 里最常用的一记落子。
          </p>
        </div>
        <figure className="figure">
          <GridCountFigure />
          <figcaption className="figure__cap">
            网格计数：每格 = 上方 + 左方。把中间 (2,2) 设成障碍（×，钉成 0）后，它不再向外传数——右下角的总路数从无障碍的 6 被截断成 2。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            用一个 <M>{'3\\times 3'}</M> 的小网格验一下：不设障碍时，第一行、第一列全是 <M>{'1'}</M>，往里每格上+左累加，右下角得 <M>{'6'}</M>（正是组合数 <M>{'\\binom{4}{2}'}</M>）。
            一旦把正中间 <M>{'(2,2)'}</M> 设为障碍钉成 <M>{'0'}</M>，穿过中心的那些路全被掐断，右下角只剩 <M>{'2'}</M>。<strong>一个格子清零，整张计数表随之改写</strong>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">并排看：障碍如何截断路径</h2>
        <div className="prose">
          <p>
            道理讲完，不如亲手试。下面的网格默认 <M>{'4\\times 4'}</M>、正中 <M>{'(2,2)'}</M> 是障碍——<strong>点任意格子可设 / 撤障碍</strong>（起点「起」、终点「终」锁定不可点）。
            读数条会实时告诉你：<strong>无障碍时共几条路，避开当前障碍后剩几条，被截断了多少</strong>。演示区把每格从<strong>上方 + 左方</strong>累加的过程逐格走给你看，
            障碍格会标红并钉成 <M>{'0'}</M>。试着把障碍挪到角落，或一次设两三个，看这个计数怎么随之崩塌或复原。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <PathGridCountDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="记牢：非法状态钉成「零元」">
          「障碍清零」不是特例，而是一条通法：在<strong>求最优</strong>的题里，非法状态钉成 <M>{'-\\infty'}</M>（永远选不中）；在<strong>求方案数</strong>的题里，钉成 <M>{'0'}</M>（贡献 0 条路）。
          把不合法的格子设成该问题的「<strong>零元</strong>」，它就会自动被排除在所有转移之外——比在每条转移里写一堆 <M>{'if'}</M> 判断干净得多。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1216" name="[USACO1.5][IOI1994] 数字三角形 Number Triangles" src="IOI1994" diff="普及-">
          <Field k="题意">
            给一座 <M>{'n'}</M> 行的数字三角形，从顶到底、每步走向正下方或右下方，求路径上数字之和的最大值。
          </Field>
          <Field k="对应关系">
            本类型的<strong>裸模板</strong>。状态 <M>{'f[i][j]'}</M> = 从 <M>{'(i,j)'}</M> 到底的最大和，自底向上一路推到塔顶 <M>{'f[1][1]'}</M>。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[i][j]=a[i][j]+\\max(f[i+1][j],\\ f[i+1][j+1])'}</M>，边界 <M>{'f[n][j]=a[n][j]'}</M>；时间 <M>{'O(n^2)'}</M>。
          </Field>
          <Field k="参考代码（自底向上）">
            <CodeBlock code={CODE_P1216} luogu="P1216" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1002" name="[NOIP2002 普及组] 过河卒" src="NOIP2002 普及组" diff="普及-">
          <Field k="题意">
            卒从 <M>{'(0,0)'}</M> 只走右 / 下到达 <M>{'(n,m)'}</M>，棋盘上一匹马的<strong>所在点与 8 个可跳到的点</strong>都不能经过，求不同路径条数。
          </Field>
          <Field k="换个视角（最优 → 计数）">
            把数字三角形的 <M>{'\\max'}</M> 换成<strong>相加</strong>：<M>{'f[i][j]=f[i-1][j]+f[i][j-1]'}</M>，就从「求最优」跨到了「求方案数」。障碍格<strong>钉成 0</strong> 即可自动绕行。
          </Field>
          <Field k="为什么选它">
            两个新东西一次讲透：<strong>计数型转移</strong>（<M>{'\\max\\to +'}</M>）与<strong>障碍即非法状态清零</strong>。还有个必踩的坑——最坏路径数超过 <M>{'2^{31}'}</M>，
            <strong>必须开 <M>{'\\texttt{long long}'}</M></strong>，否则 int 溢出。坐标从 <M>{'0'}</M> 起，平移成 <M>{'1'}</M>-based 更好写。
          </Field>
          <Field k="参考代码（long long + 障碍清零）">
            <CodeBlock code={CODE_P1002} luogu="P1002" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1004" name="[NOIP2000 提高组] 方格取数" src="NOIP2000 提高组" diff="普及/提高-">
          <Field k="题意">
            <M>{'n\\times n'}</M> 方格中部分格有数字，从左上角走到右下角（只走右 / 下）<strong>两次</strong>，取走沿途数字（同一格数字只算一次），求两条路径数字和的最大值。
          </Field>
          <Field k="状态设计（一条路 → 两条路同走）">
            难点在从「一条路径」升到「<strong>两条路径同时走</strong>」。让两条路<strong>同步推进</strong>（走过的步数相同），状态 <M>{'f[i][j][k][l]'}</M> 记两条路分别到 <M>{'(i,j)'}</M> 与 <M>{'(k,l)'}</M> 时的最大和；
            转移从两条路各自的「上 / 左」共 <M>{'4'}</M> 种组合取 max。若两条路<strong>撞在同一格</strong>（<M>{'i=k,\\ j=l'}</M>），该格数字<strong>只能算一次</strong>，减掉重复。
          </Field>
          <Field k="为什么选它">
            经典的<strong>多维线性 DP / 双线程</strong>代表：把「路径型」从二维状态推到四维，是理解「多条路径联合决策」的入门题。转移骨架仍是「回看上一步的几种来源取最优」，只是来源从 2 种变成 4 种。
          </Field>
          <Field k="参考代码（四维双线程）">
            <CodeBlock code={CODE_P1004} luogu="P1004" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1508"
          name="Likecloud-吃、吃、吃"
          hint="矩阵三向最优路径：从底行中央下方出发向上走，每步可去正前 / 左前 / 右前，格中能量可正可负，求到顶行的最大能量和。数字三角形的三向版，f[i][j] 从下方三格取 max 再加自己。"
        />
        <Exercise
          pid="P1216"
          name="[USACO1.5][IOI1994] 数字三角形"
          hint="学完回来独立默写：自底向上，f[i][j]=a[i][j]+max(下方两格)。再试着改成自顶向下（f[i][j] 由上方两格转移），体会两种方向都对。"
        />
        <Exercise
          pid="P1057"
          name="[NOIP2008 普及组] 传球游戏"
          hint="最朴素的递推计数入门：f[i][j] = 第 i 次传球后球在第 j 人手里的方案数，每次只能传给左右邻居（环形）。转移 f[i][j]=f[i-1][左]+f[i-1][右]，答案 f[m][1]。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想更直观地体会「一步一步累积」？到 <Link to="/part/a" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>A 部分页的互动小游戏</Link>里，
        亲手在格子间走一条路，看每一步如何叠出最终的答案。
      </div>

      <nav className="type-nav">
        <span />
        <Link to="/part/a/maxseg" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            最大子段和 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
