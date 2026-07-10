import { Link } from 'react-router-dom'
import { MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import MergeIntervalDemo from '../../components/demos/interval/MergeIntervalDemo'
import TwoFourEightDemo from '../../components/demos/interval/TwoFourEightDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { TakeEndsSetupFigure, ShrinkTransitionFigure, Merge248Figure } from './MergeIntervalArt'

const CODE_P3146 = `
#include <iostream>
#include <algorithm>
using namespace std;

int n, a[300];
int dp[300][300];               // dp[l][r]：区间 [l,r] 能合成的单一数字（0 = 不可合成）

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        dp[i][i] = a[i];        // 单个数自成一块
    }

    int ans = 0;
    for (int i = 1; i <= n; i++)
    {
        ans = max(ans, a[i]);
    }

    for (int len = 2; len <= n; len++)          // ★外层枚举区间长度，由短到长
    {
        for (int l = 1; l + len - 1 <= n; l++)
        {
            int r = l + len - 1;
            for (int k = l; k <= r - 1; k++)    // 枚举分割点：两段要合成同一个数
            {
                if (dp[l][k] && dp[l][k] == dp[k + 1][r])
                {
                    dp[l][r] = max(dp[l][r], dp[l][k] + 1);
                }
            }
            ans = max(ans, dp[l][r]);           // 答案是全盘所有区间里的最大数字
        }
    }

    cout << ans << endl;
    return 0;
}
// TAG: 区间DP 合并 248`

const CODE_P1436 = `
#include <iostream>
#include <cstring>
using namespace std;

const int INF = 0x3f3f3f3f;
int n;
int s[9][9];                    // 二维前缀和：s[i][j] = 左上角 (1,1) 到 (i,j) 的总和
int f[16][9][9][9][9];          // f[k][x1][y1][x2][y2]：把该矩形切成 k 块的最小平方和

// 矩形 (x1,y1)-(x2,y2) 的总分
int sum(int x1, int y1, int x2, int y2)
{
    return s[x2][y2] - s[x1 - 1][y2] - s[x2][y1 - 1] + s[x1 - 1][y1 - 1];
}

int sq(int v)
{
    return v * v;
}

// 记忆化：把矩形切成 k 块，返回最小的「各块得分平方和」
int dfs(int k, int x1, int y1, int x2, int y2)
{
    int &cur = f[k][x1][y1][x2][y2];
    if (cur != -1)
    {
        return cur;
    }
    if (k == 1)                                 // 不再切，整块贡献一份平方
    {
        return cur = sq(sum(x1, y1, x2, y2));
    }
    cur = INF;
    for (int x = x1; x <= x2 - 1; x++)          // 横切：上 k1 块 + 下 k-k1 块
    {
        for (int k1 = 1; k1 <= k - 1; k1++)
        {
            cur = min(cur, dfs(k1, x1, y1, x, y2) + dfs(k - k1, x + 1, y1, x2, y2));
        }
    }
    for (int y = y1; y <= y2 - 1; y++)          // 竖切：左 k1 块 + 右 k-k1 块
    {
        for (int k1 = 1; k1 <= k - 1; k1++)
        {
            cur = min(cur, dfs(k1, x1, y1, x2, y) + dfs(k - k1, x1, y + 1, x2, y2));
        }
    }
    return cur;
}

int main()
{
    cin >> n;
    for (int i = 1; i <= 8; i++)
    {
        for (int j = 1; j <= 8; j++)
        {
            cin >> s[i][j];
            s[i][j] += s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1];
        }
    }

    memset(f, -1, sizeof(f));
    int tot = sum(1, 1, 8, 8);
    // 最小方差 ⇔ 最小平方和：σ² = (Σxᵢ²)/n − x̄²，均值固定，只需最小化 Σxᵢ²
    double variance = (double)dfs(n, 1, 1, 8, 8) / n - (double)tot / n * tot / n;
    printf("%.3lf\\n", variance);
    return 0;
}
// TAG: 区间DP 二维 记忆化 棋盘分割`

export default function MergeInterval() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从两端取数：另一种拆区间的方式</h2>
        <div className="prose">
          <p>
            石子合并里，我们靠<strong>枚举中间的分割点</strong>把区间拆成两半。但区间 DP 还有一类同样常见的场景：操作只发生在<strong>区间的两端</strong>——从两头拿、把两头删、比较两头。它们拆区间的方式不是「从中间断」，而是<strong>从两端收缩</strong>。
          </p>
          <p>
            看一个具体博弈：桌上一排 <strong>4</strong> 个数 <M>{'a=[3,\\ 9,\\ 1,\\ 2]'}</M>，两名玩家<strong>轮流</strong>行动，每回合只能从<strong>最左</strong>或<strong>最右</strong>端拿走一个数，拿到的数计入自己得分。两人都想让<strong>自己得分尽量高</strong>。先手最多能领先对手多少分？
          </p>
        </div>
        <figure className="figure">
          <TakeEndsSetupFigure />
          <figcaption className="figure__cap">一排数字，每回合只能从最左或最右端拿走一个；剩下的区间从两端逐步收缩。</figcaption>
        </figure>
        <div className="prose">
          <p>
            第一反应也许是<strong>贪心</strong>：每步拿两端里更大的那个。可这并不总对——此刻贪一个大的，可能把对手放进下一步更肥的位置。因为<strong>拿走一端后，剩下的又是一个连续区间，对手同样会最优应对</strong>，牵一发而动全身。这与石子合并的困境同源：<strong>局部最优不等于全局最优</strong>，得把「剩下那段对手能拿多少」也算进来。
          </p>
          <p>
            关键观察：无论怎么拿，<strong>当前面对的永远是一段连续区间 <M>{'[l,r]'}</M></strong>；一次行动只会把它变成<strong>去掉左端的 <M>{'[l{+}1,r]'}</M></strong> 或<strong>去掉右端的 <M>{'[l,r{-}1]'}</M></strong>——长度恰好少 1。区间结构再次浮现，这正是区间 DP 的入口，只不过转移从「枚举分割点」换成了「选哪一端」。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：站在对手的肩膀上</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[l][r]'}</M> 表示：当轮到某位玩家、面对区间 <M>{'[l,r]'}</M> 时，他能取得的<strong>「自己所得 − 对手所得」的最大净胜差</strong>。用「净胜差」而非「绝对得分」，是这一类博弈 DP 的点睛之笔——它让<strong>双方都最优</strong>这件事变得可递推。
          </p>
          <p>
            他有两种选择。若<strong>拿走左端 <M>{'a[l]'}</M></strong>：这一分先进自己账户，随后<strong>对手</strong>面对子区间 <M>{'[l{+}1,r]'}</M>，对手在那段的最大净胜差正是 <M>{'dp[l{+}1][r]'}</M>——但那是<strong>站在对手视角</strong>的领先，换回<strong>我方视角要取负号</strong>。于是这一步我方净胜差 <M>{'=a[l]-dp[l{+}1][r]'}</M>。拿右端同理。
          </p>
        </div>
        <figure className="figure">
          <ShrinkTransitionFigure />
          <figcaption className="figure__cap">dp[l][r] 只有两条分支：取左端接子问题 dp[l+1][r]、取右端接 dp[l][r-1]；子区间的净胜差是对手视角，故减去。取两者较大。</figcaption>
        </figure>
        <MB>{'dp[l][r]=\\max\\big(a[l]-dp[l+1][r],\\ a[r]-dp[l][r-1]\\big)'}</MB>
        <div className="prose">
          <p>
            边界：<M>{'dp[l][l]=a[l]'}</M>（只剩一个数，先手别无选择直接拿走，净胜差就是它）。答案：<M>{'dp[1][n]'}</M> 即先手在整排上的最大净胜差；若还想还原<strong>先手实际得分</strong>，用总和 <M>{'S'}</M> 反推 <M>{'\\tfrac{S+dp[1][n]}{2}'}</M>。
          </p>
          <p>
            同样地，<M>{'dp[l][r]'}</M> 依赖的两个子区间 <M>{'[l{+}1,r]'}</M> 与 <M>{'[l,r{-}1]'}</M> 长度都<strong>比它短 1</strong>。所以递推仍<strong>不能</strong>按 <M>{'l'}</M> 或 <M>{'r'}</M> 顺序走，必须<strong>按区间长度由短到长</strong>——这是区间 DP 雷打不动的填表顺序。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          区间 DP 的两副面孔：石子合并<strong>从中间枚举分割点</strong>（一分为二，追加区间和），两端取数 / 删除类<strong>从两端收缩</strong>（每次砍掉一端，规模减一）。共同点是<strong>状态都是连续区间 <M>{'[l,r]'}</M>、都按长度递推</strong>。博弈型再叠一层技巧：<strong>用「净胜差」定义状态，子问题的领先在换手时取负</strong>，一个 <M>{'\\max'}</M> 就把「双方都最优」编码进了转移。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用开头的例子（<M>{'a=[3,9,1,2]'}</M>，下标 <M>{'1..4'}</M>）走完整张三角表，重点盯住<strong>长度由短到长</strong>、以及「减去子区间」这一步：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>对角线（长度 1）。</b> <M>{'dp[l][l]=a[l]'}</M>：<M>{'dp[1][1]=3,\\ dp[2][2]=9,\\ dp[3][3]=1,\\ dp[4][4]=2'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>长度 2</b>：<M>{'dp[1][2]=\\max(3-9,\\ 9-3)=6'}</M>；<M>{'dp[2][3]=\\max(9-1,\\ 1-9)=8'}</M>；<M>{'dp[3][4]=\\max(1-2,\\ 2-1)=1'}</M>。都取「先拿大的一端」，符合直觉。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>长度 3</b>：<M>{'dp[1][3]=\\max(a_1-dp[2][3],\\ a_3-dp[1][2])=\\max(3-8,\\ 1-6)=-5'}</M>（这段先手<strong>反而落后</strong>）；<M>{'dp[2][4]=\\max(9-1,\\ 2-8)=8'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>长度 4</b>，整段 <M>{'[1,4]'}</M>：<M>{'\\max(a_1-dp[2][4],\\ a_4-dp[1][3])=\\max(3-8,\\ 2-(-5))=\\max(-5,7)=7'}</M>。先手取<strong>右端 2</strong>、把烫手的 <M>{'[1,3]'}</M> 丢给对手，净胜 <M>{'7'}</M>——总和 15，先手得 11、后手得 4。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把三角表<strong>按长度一层层填满</strong>，每格高亮它选中的是「取左」还是「取右」、以及收缩后的那个子区间。改改数值，看先手的最优选择如何反转。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看三角表一层一层长出来 · 枚举分界、两段合并</h2>
        <div className="demo">
          <div className="demo__body">
            <MergeIntervalDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：相邻相等合并（248）与升维到二维</h2>
        <div className="prose">
          <p>
            两端收缩是这一类的「入门形态」。把操作换成<strong>合并相邻元素并产生新值</strong>，就得到更有趣的一支——趣味十足的 <strong>248</strong>（脱胎自 2048）：一排数字，<strong>相邻两个相等</strong>的可以并成一个「值 + 1」的数，不断合并，问最终能得到的<strong>最大数字</strong>。
          </p>
        </div>
        <figure className="figure">
          <Merge248Figure />
          <figcaption className="figure__cap">248 的合并规则：相邻且相等的两数并成 +1（两个 2 → 一个 3）；不相等则并不了。要合成更大的数，左右两段必须先各自缩成同一个数。</figcaption>
        </figure>
        <div className="prose">
          <p>
            它的状态回到<strong>枚举分割点</strong>，但含义变了：设 <M>{'dp[l][r]'}</M> = 区间 <M>{'[l,r]'}</M> 若能反复合并<strong>缩成单个数字</strong>，则那个数字的值，否则记 <M>{'0'}</M>（不可合成）。一段能缩成 <M>{'v{+}1'}</M>，<strong>当且仅当</strong>存在分割点 <M>{'k'}</M>，使左段 <M>{'[l,k]'}</M> 与右段 <M>{'[k{+}1,r]'}</M> <strong>都能缩成同一个数 <M>{'v'}</M></strong>：
          </p>
          <MB>{'dp[l][r]=\\max_{l\\le k<r,\\ dp[l][k]=dp[k+1][r]>0}\\big(dp[l][k]+1\\big)'}</MB>
          <p>
            全盘答案是<strong>所有区间里最大的那个 <M>{'dp[l][r]'}</M></strong>——注意<strong>不一定是整段 <M>{'dp[1][n]'}</M></strong>，因为整排未必能缩成单值，但某个子段可以。这正是 248 计分「看棋盘上最大的数」的由来。下一节的演示会把这张「能否合成」的三角表画出来。
          </p>
          <p>
            <strong>再往上一维。</strong> 一维的「合并连续区间」升到二维，就是<strong>棋盘分割</strong>（例题 P1436）：把 <M>{'8\\times8'}</M> 棋盘沿横 / 竖线递归切成若干矩形。状态从一维的 <M>{'dp[l][r]'}</M> 膨胀成<strong>一个矩形的四个坐标 <M>{'dp[k][x_1][y_1][x_2][y_2]'}</M></strong>，转移枚举「切在哪条横 / 竖线」——本质仍是<strong>枚举最后一次分割、把大区域拆成两块子区域</strong>。这条「一维合并 → 二维分割」的线，正好把区间 DP 平滑地接到 <Link to="/part/d/grid" style={{ color: 'var(--accent-2)' }}>D 部分 · 网格 / 矩阵上的 DP</Link>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看 248 怎样把相邻相等的合并起来</h2>
        <div className="prose">
          <p>
            默认 <M>{'a=[1,1,2,2]'}</M>：两个 <M>{'1'}</M> 并成 <M>{'2'}</M>，与原有的 <M>{'2,2'}</M> 里的一个凑成 <M>{'2,2'}</M> 再并成 <M>{'3'}</M>——全盘最大数字是 <strong>3</strong>（落在子区间 <M>{'[1,3]'}</M> 或 <M>{'[3,4]'}</M> 上，而整段 <M>{'[1,4]'}</M> 反而缩不成单值）。改改数值，观察哪些格能合成（非 0）、哪些卡住。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <TwoFourEightDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="易错点：答案未必在右上角">
          两端取数型答案就在右上角 <M>{'dp[1][n]'}</M>；但 248 这类<strong>合成型</strong>，整段常常合成不了单值，右上角是 <M>{'0'}</M>。<strong>务必在填表过程中用一个全局变量记下所有 <M>{'dp[l][r]'}</M> 的最大值</strong>，而不是直接输出 <M>{'dp[1][n]'}</M>。这是初学者在 248 上最常见的翻车点。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P3146" name="[USACO16OPEN] 248 G" src="USACO2016(原生P)" diff="普及+/提高">
          <Field k="题意">
            一排 <M>{'n'}</M> 个数（<M>{'2\\le a_i\\le 40'}</M>）。每次可把<strong>相邻且相等</strong>的两个数并成一个「值 + 1」的数。求经过若干次合并后，能得到的<strong>最大的那个数</strong>。
          </Field>
          <Field k="对应关系">
            合并类区间 DP 的旗舰：<M>{'dp[l][r]'}</M> = 区间能缩成的单一值（<M>{'0'}</M> 不可），枚举分割点要求<strong>左右两段合成同一个数</strong>，方能再并一级。本页深化节 + 第二演示就是它的内核。
          </Field>
          <Field k="为什么选它">
            2048 玩法的区间 DP 化身，趣味性极强、重交互演示天然契合。更重要的是它训练一个反直觉点：<strong>答案不是 <M>{'dp[1][n]'}</M>，而是全表最大值</strong>——把「区间 DP 的答案一定在整段」的思维定式打破。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[l][r]=\\max_{k}(dp[l][k]+1)'}</M>（当 <M>{'dp[l][k]=dp[k+1][r]>0'}</M>）；外层长度、内层左端点、最内分割点，<M>{'O(n^3)'}</M>，<M>{'n\\le 248'}</M> 绰绰有余。
          </Field>
          <Field k="参考代码（合成三角表 · 全表取最大）">
            <CodeBlock code={CODE_P3146} luogu="P3146" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1436" name="棋盘分割" src="NOI1999" diff="提高+/省选-">
          <Field k="题意">
            <M>{'8\\times8'}</M> 棋盘，每格有分值。沿<strong>横线或竖线</strong>把棋盘切开、留一块、对另一块继续切，共切 <M>{'n-1'}</M> 刀得 <M>{'n'}</M> 块矩形。设各块总分为 <M>{'x_i'}</M>、均值 <M>{'\\bar x'}</M>，求最小的<strong>方差</strong> <M>{'\\sigma^2=\\tfrac1n\\sum(x_i-\\bar x)^2'}</M>。
          </Field>
          <Field k="对应关系（升维）">
            把一维「合并 / 分割连续区间」<strong>升到二维</strong>：状态由 <M>{'dp[l][r]'}</M> 膨胀成矩形四坐标 <M>{'f[k][x_1][y_1][x_2][y_2]'}</M> = 该矩形切成 <M>{'k'}</M> 块的最小平方和；转移枚举切在哪条横 / 竖线，仍是<strong>枚举最后一次分割</strong>。
          </Field>
          <Field k="为什么选它 · 衔接 D 部分">
            均值固定时<strong>最小方差 ⇔ 最小 <M>{'\\sum x_i^2'}</M></strong>，先把目标化简，是本题第一关。二维前缀和 <M>{'O(1)'}</M> 取矩形和、<strong>记忆化搜索</strong>而非循环填表，都是从一维区间 DP 向<strong>网格 / 矩阵 DP</strong> 过渡的钥匙——正好承上启下接到 D 部分。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[k][R]=\\min\\big(f[k_1][R_1]+f[k-k_1][R_2]\\big)'}</M>（<M>{'R_1,R_2'}</M> 是 <M>{'R'}</M> 被某条横 / 竖线切出的两个子矩形），枚举切线与 <M>{'k_1'}</M>；状态 <M>{'O(n\\cdot 8^4)'}</M>、每态枚举 <M>{'O(8\\cdot n)'}</M>，<M>{'n\\le 15'}</M> 轻松通过。
          </Field>
          <Field k="参考代码（二维前缀和 · 记忆化分割）">
            <CodeBlock code={CODE_P1436} luogu="P1436" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2858"
          name="[USACO06FEB] Treats for the Cows G/S 奶牛零食"
          hint="两端取数区间 DP 的直接应用：每天只能从零食序列最左或最右端取一个，第 t 天取出的价值要乘以天数 t。设 dp[l][r] 为取完区间 [l,r] 能得的最大加权总和，剩余天数 = 已取个数决定权重；从两端收缩、按长度递推。"
        />
        <Exercise
          pid="P2426"
          name="删数"
          hint="删除区间合并代价：dp[l][r] 表示删空区间 [l,r] 的最大收益。既可单个删（价值 a[i]），也可把两端 a[l]、a[r] 一起删得 (a[l]+a[r]+距离)，中间那段先删空。枚举分割点 / 端点配对，按长度递推。"
        />
        <Exercise
          pid="P2196"
          name="[NOIP1996 提高组] 挖地雷"
          hint="选取 / 路径变形（DAG 上区间不必连续）：地窖间单向连通，dp[i] = 以第 i 个地窖结尾的最大地雷数，转移取所有能到 i 的前驱最优值再加 a[i]；记录前驱以回溯输出路径。是区间 / 选取型 DP 的温和入门。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想亲手体验「合并顺序如何改变结局」？到 <Link to="/part/c" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>C 部分页</Link>的互动里试着自己决定每一步的取 / 并，再对照 DP 给出的最优。
      </div>

    </>
  )
}
