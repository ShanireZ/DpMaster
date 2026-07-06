import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import IndepSetDemo from '../../components/demos/treedp/IndepSetDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { PostorderFigure, IndepDecisionFigure, CoverContrastFigure } from './TreeArt'

const CODE_P1352 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 6005;
vector<int> g[N];             // 邻接表：g[u] 存 u 的直接下属
int r[N];                     // 每个人的欢乐值
int f[N][2];                  // f[u][0/1]：u 不选/选时，u 子树的最大欢乐值
int fa[N];                    // 记录父亲，用来找根
bool hasFa[N];

void dfs(int u)               // 固定根，一遍后序 DFS
{
    f[u][0] = 0;              // 不选 u：先清零
    f[u][1] = r[u];           // 选 u：先加上自己的欢乐值
    for (int v : g[u])        // 逐个孩子合并
    {
        dfs(v);               // ★先把孩子子树算完（后序）
        f[u][0] += max(f[v][0], f[v][1]); // u 不选：孩子随意，各取较大
        f[u][1] += f[v][0];   // u 选了：孩子必须都不选
    }
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> r[i];

    for (int i = 1; i < n; i++)
    {
        int l, k;
        cin >> l >> k;        // l 的上司是 k
        g[k].push_back(l);
        hasFa[l] = true;
    }

    int root = 1;
    while (root <= n && hasFa[root]) root++;  // 没有上司的那个人就是根

    dfs(root);
    cout << max(f[root][0], f[root][1]) << endl;
    return 0;
}`

const CODE_P2016 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 1505;
vector<int> g[N];
int f[N][2];                  // f[u][0]：u 不放兵；f[u][1]：u 放兵
bool hasFa[N];

void dfs(int u)
{
    f[u][0] = 0;              // u 不放兵：它的每条边要靠孩子那端守
    f[u][1] = 1;              // u 放兵：+1 个士兵
    for (int v : g[u])
    {
        dfs(v);
        f[u][0] += f[v][1];   // ★u 不放 → 孩子必须放（否则边 u-v 没人看守）
        f[u][1] += min(f[v][0], f[v][1]); // u 放了 → 孩子放不放都行，取较小
    }
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int u, cnt;
        cin >> u >> cnt;      // 洛谷本题为 0-based，读入时 +1 归一到 1-based
        u++;
        while (cnt--)
        {
            int v;
            cin >> v;
            v++;
            g[u].push_back(v);
            hasFa[v] = true;
        }
    }

    int root = 1;
    while (root <= n && hasFa[root]) root++;

    dfs(root);
    cout << min(f[root][0], f[root][1]) << endl;
    return 0;
}`

export default function TreeSelect() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从一场不能同席的舞会说起</h2>
        <div className="prose">
          <p>
            公司是一棵<strong>树</strong>：董事长在根，每个人往下带若干直接下属。现在办舞会，每个人来了会带来一份<strong>欢乐值</strong>。
            只有一条规矩——<strong>任何人都不愿与自己的直接上司同场</strong>。要让到场的总欢乐值最大，该请谁？
          </p>
          <p>
            用图论的话说：在树上选一个<strong>点集</strong>，使得<strong>没有任何一条边的两端同时被选</strong>（这样的点集叫「独立集」），
            并让选中点的权和最大。这就是<strong>最大权独立集</strong>。
          </p>
        </div>
        <div className="prose">
          <p>
            先想想能不能<strong>贪心</strong>：按欢乐值从大到小挑，能选就选？会翻车。设董事长欢乐值 <M>{'10'}</M>，他有两个下属各 <M>{'6'}</M>，
            两个下属又各带一个孙辈 <M>{'6'}</M>。贪心先抢董事长（10），于是两个下属都不能选；孙辈可选，得 <M>{'10+6+6=22'}</M>。
            但只要<strong>放弃董事长</strong>、改选两个下属加两个孙辈，就是 <M>{'6\\times4=24'}</M>——贪心又输了。
          </p>
          <p>
            那枚举每个点「选 / 不选」的所有组合呢？<M>{'2^n'}</M> 种，<M>{'n=6000'}</M> 直接爆炸。
            问题的结构是<strong>树</strong>，而树天生适合<strong>把子树的答案往上合并</strong>——这正是树形 DP 的舞台。
          </p>
        </div>
        <figure className="figure">
          <PostorderFigure />
          <figcaption className="figure__cap">
            树形 DP 的处理次序是<strong>后序遍历</strong>：先把每棵子树算透，父亲才拿孩子的结果做决策。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：这个点，选还是不选</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>对每个点 <M>{'u'}</M> 开<strong>两个</strong>状态，把「u 自己选没选」记进状态里：
          </p>
          <MB>{'f[u][0]:\\ u\\ \\text{;}\\quad f[u][1]:\\ u'}</MB>
          <p>
            读作：<M>{'f[u][0]'}</M> = <strong>u 不选</strong>时，以 u 为根的整棵子树能取到的最大权；<M>{'f[u][1]'}</M> = <strong>u 选</strong>时子树的最大权。
            把状态开成两份，是为了让父亲知道「孩子到底选没选」——因为父子不能同时选，这个信息必须显式带上。
          </p>
        </div>
        <figure className="figure">
          <IndepDecisionFigure />
          <figcaption className="figure__cap">
            u 不选，孩子自由（各取 <M>{'\\max'}</M>）；u 选，孩子被禁（只能取孩子的「不选」态）。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>u 不选</strong>：它没占位，每个孩子 <M>{'c'}</M> 选不选都行，各自取更优的那个：
          </p>
          <MB>{'f[u][0]=\\sum_{c\\in son(u)}\\max\\big(f[c][0],\\,f[c][1]\\big)'}</MB>
          <p>
            <strong>u 选</strong>：它占了位，所有孩子都<strong>不许选</strong>，只能取孩子的「不选」态，再加上 u 自己的权 <M>{'w_u'}</M>：
          </p>
          <MB>{'f[u][1]=w_u+\\sum_{c\\in son(u)}f[c][0]'}</MB>
          <p>
            边界：<strong>叶子</strong>没有孩子，<M>{'f[\\text{leaf}][0]=0'}</M>、<M>{'f[\\text{leaf}][1]=w_{\\text{leaf}}'}</M>。
            答案在根：<M>{'\\max(f[root][0],\\,f[root][1])'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          把「u 选没选」压进状态，父子那条<strong>唯一的约束</strong>就变成了两条干净的求和公式；<M>{'2^n'}</M> 的组合塌缩成每个点 <M>{'O(1)'}</M> 的合并，总复杂度 <M>{'O(n)'}</M>。这套 <M>{'f[u][0/1]'}</M> 是所有树形 DP 的第一块积木。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用一棵小树：根 <M>{'1'}</M>（权 3）带两个孩子 <M>{'2'}</M>（权 6）、<M>{'3'}</M>（权 2）；<M>{'2'}</M> 再带两个叶子 <M>{'4'}</M>（权 4）、<M>{'5'}</M>（权 7）。后序次序 <M>{'4,5,2,3,1'}</M>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>叶子 4、5、3。</b> 没有孩子：<M>{'f[4]=(0,4)'}</M>、<M>{'f[5]=(0,7)'}</M>、<M>{'f[3]=(0,2)'}</M>（左不选、右选）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>节点 2</b>（权 6，孩子 4、5）。不选 2：<M>{'\\max(0,4)+\\max(0,7)=4+7=11'}</M>。选 2：<M>{'6+f[4][0]+f[5][0]=6+0+0=6'}</M>。得 <M>{'f[2]=(11,6)'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>根 1</b>（权 3，孩子 2、3）。不选 1：<M>{'\\max(11,6)+\\max(0,2)=11+2=13'}</M>。选 1：<M>{'3+f[2][0]+f[3][0]=3+11+0=14'}</M>。得 <M>{'f[1]=(13,14)'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>答案</b> <M>{'\\max(13,14)=14'}</M>。最优取法：选 <strong>1、4、5</strong>（欢乐 3+4+7=14），没有任何一对直接上下级同时到场。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把这棵树的后序过程<strong>逐点点亮</strong>：改任意员工的欢乐值，看 <M>{'f[u][0/1]'}</M> 自底向上重新填入，根节点吐出答案。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看 dp 自底向上长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <IndepSetDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">翻个面：最小点覆盖，转移方向正好相反</h2>
        <div className="prose">
          <p>
            换一个问题：树上<strong>放最少的士兵看守所有边</strong>——每条边至少有一端站着士兵（这叫<strong>最小点覆盖</strong>）。
            状态还是 <M>{'f[u][0/1]'}</M>（u 不放 / 放），但转移和独立集<strong>恰好对称</strong>：
          </p>
          <MB>{'f[u][0]=\\sum_{c}f[c][1]\\qquad f[u][1]=1+\\sum_{c}\\min\\big(f[c][0],f[c][1]\\big)'}</MB>
          <p>
            盯住 <M>{'f[u][0]'}</M>：u <strong>不放</strong>兵，那每条 <M>{'u\\text{-}c'}</M> 的边就只能靠 <strong>c 那端</strong>守，于是孩子<strong>必须放</strong>（取 <M>{'f[c][1]'}</M>）。
            这与独立集「u 不选、孩子自由取 <M>{'\\max'}</M>」正好反过来——独立集要「避免相邻」，点覆盖要「盯住每条边」。
          </p>
        </div>
        <figure className="figure">
          <CoverContrastFigure />
          <figcaption className="figure__cap">
            同一棵树：最大独立集与最小点覆盖的选中集<strong>互为补集</strong>（König 定理在树上的直观体现）。
          </figcaption>
        </figure>
        <InfoBox kind="warn" title="常见陷阱：别把「孩子自由」照抄过来">
          写点覆盖时最容易犯的错，是把独立集的 <M>{'f[u][0]=\\sum\\max(\\dots)'}</M> 直接搬来。<strong>u 不放兵，孩子就没有「自由」</strong>——边必须有人守，孩子被强制取 <M>{'f[c][1]'}</M>。看清「约束落在点上还是边上」，转移方向就不会写反。更复杂的「支配集」还要引入第三个状态，见 <Link to="/part/f/cover" style={{ color: 'var(--accent-2)' }}>覆盖 / 支配 / 染色</Link>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1352" name="没有上司的舞会" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            <M>{'n'}</M> 名职员构成一棵树，每人有快乐值 <M>{'r_i'}</M>。若某人来了，他的<strong>直接上司</strong>就不来。求到场者快乐值之和的最大值。
          </Field>
          <Field k="对应关系">
            标准最大权独立集。<M>{'f[u][0]'}</M> = u 不来时子树最大快乐，<M>{'f[u][1]'}</M> = u 来时子树最大快乐；答案取根的两态较大。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u][0]=\\sum\\max(f[c][0],f[c][1])'}</M>，<M>{'f[u][1]=r_u+\\sum f[c][0]'}</M>；一遍 DFS，<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（邻接表 + 后序 DFS）">
            <CodeBlock code={CODE_P1352} luogu="P1352" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2016" name="战略游戏" src="SEERC 2000" diff="普及/提高-">
          <Field k="题意">
            在树的节点上放士兵，每个士兵能看守<strong>与它相连的所有边</strong>。求看守全部边所需的<strong>最少士兵数</strong>。
          </Field>
          <Field k="为什么选它">
            它是最小点覆盖，与独立集<strong>同为 <M>{'f[u][0/1]'}</M> 却转移方向相反</strong>。放在独立集之后学，最能看清「约束在点还是在边」如何决定转移——一次吃透两类模型。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u][0]=\\sum f[c][1]'}</M>，<M>{'f[u][1]=1+\\sum\\min(f[c][0],f[c][1])'}</M>；<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P2016} luogu="P2016" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2458" name="[SDOI2006] 保安站岗" hint="最小支配集：不止「选/不选」，还要区分「被孩子覆盖」与「等父亲覆盖」，共三状态。是本部分 cover 类的核心。" />
        <Exercise pid="P1122" name="最大子树和" hint="f[u] = 含 u 的最大子树权和；孩子贡献为正才接上（max(0, f[c])）。链式合并、无第二维，是选点思想的轻量版。" />
        <Exercise pid="P1352" name="没有上司的舞会（自测）" hint="把例题不看代码独立写一遍：邻接表建树、找根、后序 DFS 填 f[u][0/1]。手熟这套骨架，后面所有树形 DP 都顺。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/e/center" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">中心 / 偏心距</span>
        </Link>
        <Link to="/part/f/knapsack" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            树上背包 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
