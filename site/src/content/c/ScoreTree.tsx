import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import ScoreTreeDemo from '../../components/demos/interval/ScoreTreeDemo'
import ScoreTreeBuildDemo from '../../components/demos/interval/ScoreTreeBuildDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { InorderRootFigure, IntervalSubtreeFigure, ScoreTransFigure } from './ScoreTreeArt'

const CODE_P1040 = `
#include <iostream>
using namespace std;

const int N = 35;
int n;
long long score[N];              // 每个节点的分数（按中序 1..n 排）
long long dp[N][N];              // dp[i][j] = 区间[i,j]建成一棵子树的最大加分
int root[N][N];                  // root[i][j] = 取到最优时选的根，供前序回溯

// 前序遍历输出最优树：根 → 左子树 → 右子树
void preorder(int i, int j)
{
    if (i > j) return;           // 空子树，什么都不输出
    int k = root[i][j];          // 这段区间的最优根
    cout << k << " ";
    preorder(i, k - 1);          // 左子树 = 区间左半
    preorder(k + 1, j);          // 右子树 = 区间右半
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> score[i];

    for (int i = 1; i <= n; i++) // 区间长度 1：单节点自成子树
    {
        dp[i][i] = score[i];
        root[i][i] = i;
    }

    for (int len = 2; len <= n; len++)              // ★外层枚举区间长度，由短到长
        for (int i = 1; i + len - 1 <= n; i++)
        {
            int j = i + len - 1;
            for (int k = i; k <= j; k++)            // 枚举根 k
            {
                // 空子树（k 在端点）的加分记 1：越界即视作 1
                long long lft = (k - 1 >= i) ? dp[i][k - 1] : 1;
                long long rgt = (k + 1 <= j) ? dp[k + 1][j] : 1;
                long long cur = lft * rgt + score[k];
                if (cur > dp[i][j])                 // 取最大，并记下根（相等取更小 k：不覆盖即最小）
                {
                    dp[i][j] = cur;
                    root[i][j] = k;
                }
            }
        }

    cout << dp[1][n] << endl;    // 第一问：最大加分
    preorder(1, n);              // 第二问：最优树的前序遍历
    cout << endl;
    return 0;
}`

const CODE_P1880 = `
#include <iostream>
using namespace std;

const int INF = 0x3f3f3f3f;
int n;
int a[205];                      // 断环为链：复制一倍成 2n
int pre[205];                    // 前缀和，sum(l..r) = pre[r] - pre[l-1]
int f[205][205];                 // 最小合并代价
int g[205][205];                 // 最大合并代价

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> a[i];
        a[i + n] = a[i];         // 复制一倍
    }
    for (int i = 1; i <= 2 * n; i++)
        pre[i] = pre[i - 1] + a[i];

    for (int len = 2; len <= n; len++)              // 长度只到 n（一圈）
        for (int l = 1; l + len - 1 <= 2 * n; l++)
        {
            int r = l + len - 1;
            int s = pre[r] - pre[l - 1];            // 本区间合并代价 = 区间和
            f[l][r] = INF;
            g[l][r] = -INF;
            for (int k = l; k <= r - 1; k++)        // ★枚举分割点 k（对照：加分树枚举根）
            {
                f[l][r] = min(f[l][r], f[l][k] + f[k + 1][r] + s);
                g[l][r] = max(g[l][r], g[l][k] + g[k + 1][r] + s);
            }
        }

    int mn = INF, mx = -INF;
    for (int l = 1; l <= n; l++)                    // 枚举起点，取所有长度为 n 的窗口
    {
        mn = min(mn, f[l][l + n - 1]);
        mx = max(mx, g[l][l + n - 1]);
    }
    cout << mn << endl << mx << endl;
    return 0;
}`

export default function ScoreTree() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">加分二叉树：中序固定，怎么建最划算</h2>
        <div className="prose">
          <p>
            换一个和石子合并<strong>神似</strong>、却长着「树」外壳的问题。给 <strong>5 个节点</strong>，分数依次是 <M>{'5,\\ 7,\\ 1,\\ 2,\\ 10'}</M>。
            要把它们建成一棵<strong>二叉树</strong>，唯一约束是：<strong>中序遍历必须恰好是 <M>{'1,2,3,4,5'}</M></strong>（即节点编号 = 它在中序里的位置）。一棵子树的<strong>加分</strong>这样算——记<strong>左子树加分</strong> <M>{'L'}</M>、<strong>右子树加分</strong> <M>{'R'}</M>、<strong>根分数</strong> <M>{'s'}</M>：
          </p>
          <MB>{'\\text{score}_{\\text{tree}}=L\\times R+s'}</MB>
          <p>
            并约定<strong>空子树的加分为 <M>{'1'}</M></strong>（乘法里的单位元，不改变乘积）。不同的建树方式，总加分不同——问<strong>整棵树能拿到的最大加分</strong>，还要<strong>输出这棵最优树的前序遍历</strong>。
          </p>
        </div>
        <figure className="figure">
          <InorderRootFigure />
          <figcaption className="figure__cap">中序固定为 1…5。任选一个节点当根（图中选了节点 3）——它<strong>左边</strong>的节点全落进左子树、<strong>右边</strong>的全落进右子树。这就是「枚举根」。</figcaption>
        </figure>
        <div className="prose">
          <p>
            为什么这题绕不开区间？关键在<strong>中序被钉死</strong>了。二叉树的中序是「左 → 根 → 右」，所以一旦某个节点 <M>{'k'}</M> 当了<strong>根</strong>，中序里<strong>排在它前面</strong>的节点必然全在<strong>左子树</strong>、<strong>排在它后面</strong>的全在<strong>右子树</strong>——绝不会交叉。于是「以 <M>{'k'}</M> 为根」就把连续的一段编号 <M>{'[i,j]'}</M> <strong>干净地劈成两段</strong> <M>{'[i,k-1]'}</M> 与 <M>{'[k+1,j]'}</M>，各自又是一棵<strong>更小的子树</strong>。
          </p>
        </div>
        <figure className="figure">
          <IntervalSubtreeFigure />
          <figcaption className="figure__cap">一段连续区间 [i,j] ↔ 一棵子树：钦定根 k 后，[i,k−1] 成左子树、[k+1,j] 成右子树——区间的「劈分」正是树的「拆解」，这就是「区间即子树」。</figcaption>
        </figure>
        <div className="prose">
          <p>
            要枚举<strong>所有</strong>合法二叉树？其数量是<strong>卡特兰数</strong>，随 <M>{'n'}</M> 指数爆炸，不可行。但上面那句「一段连续区间恰好是一棵子树」已经把出路点明——这正是区间 DP 的入口，和石子合并同一个模子。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：枚举根，左右子树相乘</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'dp[i][j]'}</M> 表示：把中序编号 <M>{'i'}</M> 到 <M>{'j'}</M> 这段<strong>连续区间</strong>建成<strong>一棵子树</strong>能拿到的<strong>最大加分</strong>。
            要把 <M>{'[i,j]'}</M> 建成子树，必须先<strong>钦定它的根</strong>——设根是 <M>{'k'}</M>（<M>{'i\\le k\\le j'}</M>），则左子树是区间 <M>{'[i,k-1]'}</M>、右子树是 <M>{'[k+1,j]'}</M>，两者都是<strong>更短的、已解的子区间</strong>。
          </p>
        </div>
        <figure className="figure">
          <ScoreTransFigure />
          <figcaption className="figure__cap">dp[i][j] 枚举根 k：左子树取 dp[i][k−1]、右子树取 dp[k+1][j]（任一为空则记 1），二者相乘再加上根分数 score[k]。</figcaption>
        </figure>
        <div className="prose">
          <p>
            按加分定义，以 <M>{'k'}</M> 为根时这棵子树的加分是 <M>{'dp[i][k-1]\\times dp[k+1][j]+\\mathrm{score}[k]'}</M>。哪个根最好？<strong>把每个 <M>{'k'}</M> 都试一遍，取最大</strong>：
          </p>
          <MB>{'dp[i][j]=\\max_{i\\le k\\le j}\\big(dp[i][k-1]\\times dp[k+1][j]\\big)+\\mathrm{score}[k]'}</MB>
          <p>
            这里 <M>{'i>j'}</M> 的<strong>空区间</strong>（当 <M>{'k=i'}</M> 时左子树 <M>{'[i,i-1]'}</M> 就是空、<M>{'k=j'}</M> 时右子树为空）约定 <M>{'dp=1'}</M>：空子树没有节点，乘上 <M>{'1'}</M> 不改变乘积。
            边界：<M>{'dp[i][i]=\\mathrm{score}[i]'}</M>（单节点自成一棵子树）。答案：<M>{'dp[1][n]'}</M>。
          </p>
          <p>
            和石子合并一样，<M>{'dp[i][j]'}</M> 依赖的都是<strong>更短的子区间</strong>，所以递推必须<strong>按区间长度由短到长</strong>——短子树先算好，长区间枚举根时才有得引用。
          </p>
        </div>
        <InfoBox kind="key" title="本质：区间就是子树，分割点就是根">
          区间 DP 的同一套骨架，在这里换了层皮：石子合并<strong>枚举分割点</strong>把区间拆成左右两段<strong>相加</strong>；加分二叉树<strong>枚举根</strong>把区间拆成左右两棵子树<strong>相乘再加根分</strong>。一句话对上号——<strong>「一段连续区间 ⇔ 一棵子树；区间里选的那个分割点/根 ⇔ 子树的根」</strong>。认出这层对应，就把「建树」这件看似要枚举卡特兰数棵树的事，压成了 <M>{'O(n^2)'}</M> 张三角表格、每格 <M>{'O(n)'}</M> 枚举根。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用开头的例子（分数 <M>{'\\mathrm{score}=[5,7,1,2,10]'}</M>，中序编号 <M>{'1..5'}</M>）走几步，重点盯住<strong>长度由短到长</strong>、以及<strong>空子树记 1</strong>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>对角线（长度 1）。</b> 每个节点自成一棵子树：<M>{'dp[i][i]=\\mathrm{score}[i]'}</M>，即 <M>{'5,7,1,2,10'}</M>。这是三角表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>长度 2</b>，看 <M>{'[1,2]'}</M>（分数 <M>{'5,7'}</M>）：根取 <M>{'1'}</M> → 左空 <M>{'1'}</M>、右 <M>{'dp[2][2]=7'}</M>，加分 <M>{'1\\times7+5=12'}</M>；根取 <M>{'2'}</M> → 左 <M>{'5'}</M>、右空 <M>{'1'}</M>，<M>{'5\\times1+7=12'}</M>。两者都 <M>{'12'}</M>，取 <M>{'dp[1][2]=12'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>长度 3</b>，看 <M>{'[1,3]'}</M>（分数 <M>{'5,7,1'}</M>，已知 <M>{'dp[2][3]=8'}</M>）：根 <M>{'1'}</M> → <M>{'1\\times dp[2][3]+5=1\\times8+5=13'}</M>；根 <M>{'2'}</M> → <M>{'dp[1][1]\\times dp[3][3]+7=5\\times1+7=12'}</M>；根 <M>{'3'}</M> → <M>{'dp[1][2]\\times1+1=12\\times1+1=13'}</M>。最大是 <M>{'dp[1][3]=13'}</M>；根 <M>{'1'}</M> 与根 <M>{'3'}</M> 打平，按字典序最小取<strong>根 = 节点 1</strong>（详见后文坑）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>长度 5</b>，整段 <M>{'[1,5]'}</M>：逐个试根，根 = 节点 <M>{'3'}</M> 时 <M>{'dp[1][2]\\times dp[4][5]+1=12\\times12+1=145'}</M> 胜出——<M>{'dp[1][5]=145'}</M>，正是最大加分。别被「节点 3 分数只有 1」骗到：<strong>乘法结构</strong>让它当根反而把左右两个 <M>{'12'}</M> 撑成了 <M>{'144'}</M>。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把三角表<strong>按长度一层层填满</strong>，高亮每个 <M>{'dp[i][j]'}</M> 选中的根 <M>{'k'}</M> 及左右子树来源。改改分数，看最优根如何随之跳动。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看三角表一层一层长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <ScoreTreeDemo />
          </div>
        </div>
        <div className="prose">
          <p>
            表是个<strong>上三角</strong>（只有 <M>{'i\\le j'}</M> 才是合法区间）。填表<strong>外层枚举长度 <M>{'\\mathrm{len}=2\\ldots n'}</M>、内层枚举左端点 <M>{'i'}</M>、最内枚举根 <M>{'k'}</M></strong>——三层循环、外层是长度，和几乎所有区间 DP 一个骨架。约 <M>{'O(n^2)'}</M> 个区间、每个枚举 <M>{'O(n)'}</M> 个根，总复杂度 <M>{'O(n^3)'}</M>。加分二叉树的 <M>{'n\\le 30'}</M>，轻松通过。中文伪代码：
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
{`for 长度 len = 2 … n:            // ★外层枚举区间长度，由短到长
  for 左端点 i = 1 … n-len+1:
    j = i + len - 1
    for 根 k = i … j:            // 枚举区间 [i,j] 的根
      左 = (k>i) ? dp[i][k-1] : 1   // 空子树记 1
      右 = (k<j) ? dp[k+1][j] : 1
      若 左*右 + score[k] 更大:
        dp[i][j] = 左*右 + score[k]
        root[i][j] = k           // 记下根，供前序回溯`}
          </pre>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：从 root 表前序回溯出整棵树</h2>
        <div className="prose">
          <p>
            光有最大加分还不够，本题第二问要<strong>输出最优树的前序遍历</strong>。诀窍是在填表时<strong>顺手记下每个区间选的根</strong>：转移取到最优的那个 <M>{'k'}</M>，存进 <M>{'\\mathrm{root}[i][j]'}</M>。等整张表填完，从<strong>整区间 <M>{'[1,n]'}</M> 出发递归</strong>就能把树还原——先<strong>输出根</strong>、再<strong>递归左子树</strong>、再<strong>递归右子树</strong>：
          </p>
          <MB>{'\\mathrm{pre}(i,j):\\ k=\\mathrm{root}[i][j];\\ \\text{emit }k;\\ \\mathrm{pre}(i,k-1);\\ \\mathrm{pre}(k+1,j)'}</MB>
          <p>
            先输出根 <M>{'k'}</M>、再递归左子树 <M>{'[i,k-1]'}</M>、再递归右子树 <M>{'[k+1,j]'}</M>——这正是<strong>前序遍历（根 → 左 → 右）</strong>的定义。空区间 <M>{'i>j'}</M> 直接返回、什么都不输出。
            这套<strong>「记录决策 + 回溯还原方案」</strong>和石子合并<strong>枚举分割点</strong>是同一路数：石子那里若要还原<strong>合并顺序</strong>，也照样存 <M>{'root[l][r]='}</M> 最优分割点、再递归左右段。区别仅在——加分树记的是<strong>根</strong>、还原出的是<strong>树结构</strong>；石子记的是<strong>分割点</strong>、还原出的是<strong>合并树</strong>。
          </p>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面把 <M>{'root[i][j]'}</M> 前序回溯出的<strong>最优树</strong>画出来。<strong>点任意节点</strong>，看它这棵子树<strong>对应中序上哪一段连续区间</strong>——「区间即子树」一目了然。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">建树演示：区间 ⇔ 子树</h2>
        <div className="demo">
          <div className="demo__body">
            <ScoreTreeBuildDemo />
          </div>
        </div>
        <InfoBox kind="warn" title="两个常见坑：空子树的 1，和相等时记哪个根">
          其一，<strong>空子树加分是 <M>{'1'}</M> 不是 <M>{'0'}</M></strong>——它进的是<strong>乘法</strong>，记 0 会把整棵子树的加分抹成 0。写代码时用「越界即取 1」处理端点根（<M>{'k=i'}</M> 或 <M>{'k=j'}</M>）。
          其二，本题<strong>前序遍历不唯一时要求字典序最小</strong>：枚举 <M>{'k'}</M> 从小到大、且转移用<strong>严格大于</strong> <M>{'>'}</M> 才更新，就能让相等时<strong>保留更小的根</strong>——更小的根当前序第一个，字典序自然更小。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1040" name="[NOIP2003 提高组] 加分二叉树" src="NOIP2003 提高组" diff="普及+/提高">
          <Field k="题意">
            <M>{'n'}</M> 个节点中序为 <M>{'1..n'}</M>，各带分数。子树加分 = 左子树加分 <M>{'\\times'}</M> 右子树加分 <M>{'+'}</M> 根分数，空树记 <M>{'1'}</M>。求整棵树<strong>最大加分</strong>，并输出<strong>最优树的前序遍历</strong>（多解取字典序最小）。
          </Field>
          <Field k="为什么选它（本类型黄金范例）">
            它是「枚举根区间 DP」最纯正的范本，且把<strong>方案回溯</strong>逼到台前：不仅要 <M>{'dp[1][n]'}</M>，还要<strong>还原整棵树</strong>——必须在转移时记 <M>{'root[i][j]'}</M>、事后前序递归。一题吃透<strong>「区间即子树 + 记录决策回溯」</strong>两件事。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[i][j]=\\max_k(dp[i][k-1]\\cdot dp[k+1][j])+\\mathrm{score}[k]'}</M>，空区间记 <M>{'1'}</M>；外层长度、内层左端点、最内根；时间 <M>{'O(n^3)'}</M>，<M>{'n\\le 30'}</M>。分数乘积可能很大，<strong>用 <M>{'\\texttt{long long}'}</M></strong>。
          </Field>
          <Field k="参考代码（含前序回溯 · ShanireZ 风）">
            <CodeBlock code={CODE_P1040} luogu="P1040" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1880" name="[NOI1995] 石子合并" src="NOI1995" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 堆石子摆成一<strong>环</strong>，每次合并相邻两堆、代价为两堆之和，直到并成一堆。分别求<strong>最小</strong>与<strong>最大</strong>总代价。
          </Field>
          <Field k="为什么放这里（同构对照）">
            拿它和加分二叉树<strong>并置</strong>，是为了看清两者是<strong>同一个区间 DP</strong>：石子<strong>枚举分割点 <M>{'k'}</M></strong>、把 <M>{'[l,r]'}</M> 拆成 <M>{'[l,k]'}</M> 与 <M>{'[k+1,r]'}</M> 两段<strong>相加</strong>再补区间和；加分树<strong>枚举根 <M>{'k'}</M></strong>、把 <M>{'[i,j]'}</M> 拆成 <M>{'[i,k-1]'}</M> 与 <M>{'[k+1,j]'}</M> 两棵子树<strong>相乘</strong>再补根分。<strong>枚举根 ↔ 枚举分割点</strong>，一层皮之隔。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f/g[l][r]=\\mathrm{opt}(f/g[l][k]+f/g[k+1][r])+\\mathrm{sum}(l,r)'}</M>；断环为链（复制一倍成 <M>{'2n'}</M>）后取所有长度 <M>{'n'}</M> 的窗口；时间 <M>{'O(n^3)'}</M>。详见 <Link to="/part/c/stone" style={{ color: 'var(--accent-2)' }}>石子合并（链形）</Link>一节。
          </Field>
          <Field k="参考代码（断环为链 · 双问并行）">
            <CodeBlock code={CODE_P1880} luogu="P1880" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1436"
          name="棋盘分割"
          hint="二维区间递归分割：把棋盘沿横或竖线切成两块，递归下去，求分割成 n 块后各块总分平方和的最小值。状态 dp[次数][x1][y1][x2][y2] 记子矩形，转移枚举每条横/竖切割线——是「枚举分割点」在二维矩形上的推广，记忆化搜索最省事。"
        />
        <Exercise
          pid="P1043"
          name="[NOIP2003 提高组] 数字游戏"
          hint="环形 + 区间划分 DP：数字排成环，切成 m 段求各段和取模再相乘的最大/最小。断环为链后，dp[l][r][k] 记「区间 [l,r] 分成 k 段」的最优，转移枚举最后一段的分割点。取模后可能为负，求最小值时别漏「负负得正」。与加分树同为『区间上枚举一个分界并合并』的区间 DP。"
        />
        <p className="prose" style={{ maxWidth: 'none', fontSize: '13px', color: 'var(--text-3)', marginTop: 'var(--sp-3)' }}>
          小字说明：洛谷上与「加分二叉树」<strong>完全同型</strong>（中序固定 + 枚举根 + 乘法加分 + 前序回溯）的原生题目较少，P1040 本身即该型的代表与压卷题。上面两题都是<strong>更广义的「区间上枚举分界」区间 DP</strong>——一个把分割推到二维矩形、一个叠加「分成 k 段」的维度，用来巩固「枚举分割/根 + 按区间递推」的通用手感，而非同题换皮。
        </p>
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        想亲手感受「同一批分数、换个根，总加分差多少」？到 <Link to="/part/c" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>C 部分页</Link>的互动里挑一棵树，再对照 DP 给出的最优。
      </div>

      <nav className="type-nav">
        <Link to="/part/c/palindrome">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 回文 / 括号
          </span>
        </Link>
        <Link to="/part/c/merge" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            合并 / 删除类 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
