import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import TreeKnapsackDemo from '../../components/demos/treedp/TreeKnapsackDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { TreeKnapDepFigure, PostorderFigure } from './TreeArt'

const CODE_P2015 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 105;
struct E { int to, w; };
vector<E> g[N];               // 邻接表带边权（苹果数）
int f[N][N];                  // f[u][j]：u 子树里保留 j 条边的最大苹果数
int sz[N];                    // sz[u]：u 子树内的边数（dp 第二维上界）
int Q;

void dfs(int u, int fa)
{
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        dfs(e.to, u);
        sz[u] += sz[e.to] + 1;          // 加上「连孩子的边」和孩子子树里的边
        for (int j = min(sz[u], Q); j >= 1; j--)      // ★分组背包：容量倒序
            for (int t = 1; t <= sz[e.to] + 1 && t <= j; t++) // 给这个孩子分 t 条边
                f[u][j] = max(f[u][j], f[u][j - t] + f[e.to][t - 1] + e.w);
    }
}

int main()
{
    int n;
    cin >> n >> Q;
    for (int i = 1; i < n; i++)
    {
        int a, b, w;
        cin >> a >> b >> w;
        g[a].push_back({b, w});
        g[b].push_back({a, w});         // 无向，dfs 里用 fa 挡回边
    }

    dfs(1, 0);
    cout << f[1][Q] << endl;
    return 0;
}`

const CODE_P2014 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 305;
vector<int> g[N];             // g[u]：以 u 为先修课的那些课
int s[N];                     // s[i]：第 i 门课的学分
int f[N][N];                  // f[u][j]：在 u 子树里选 j 门课的最大学分
int m;

void dfs(int u)
{
    f[u][1] = s[u];           // 选了 u 子树里的课，必先选 u 自己（占 1 门）
    for (int v : g[u])
    {
        dfs(v);
        for (int j = m + 1; j >= 2; j--)        // ★+1：0 号虚根也算一门，容量留够
            for (int k = 1; k <= j - 1; k++)    // 给孩子 v 这一组分 k 门
                f[u][j] = max(f[u][j], f[u][j - k] + f[v][k]);
    }
}

int main()
{
    int n;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
    {
        int fa;
        cin >> fa >> s[i];
        g[fa].push_back(i);   // fa == 0 表示无先修课，挂到虚根 0 下
    }

    dfs(0);                   // ★森林接一个虚根 0，问题化为一棵树
    cout << f[0][m + 1] << endl;   // 选 m 门真课 + 虚根 1 门 = m+1
    return 0;
}`

export default function TreeKnapsack() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当「选子必先选父」遇上容量限制</h2>
        <div className="prose">
          <p>
            上一类的 <M>{'f[u][0/1]'}</M> 只问「选不选」。但很多问题还带一个<strong>预算</strong>：一棵长满苹果的树，
            只能<strong>保留 <M>{'Q'}</M> 条树枝</strong>，且——<strong>要留一条枝，它上面那截主干必须先留住</strong>（否则这条枝就从树上掉了）。
            在预算 <M>{'Q'}</M> 下让保留的苹果最多，这是<strong>树上背包</strong>。
          </p>
          <p>
            「容量受限的取舍」正是背包的本行，但这里多了一层<strong>依赖</strong>：孩子想被选中，得先为「连接它的那条边」付出一份容量。
            于是每个点的状态要带上<strong>容量维</strong>：
          </p>
          <MB>{'f[u][j]:\\ u\\ \\text{;}\\ j\\ '}</MB>
          <p>
            读作 <M>{'f[u][j]'}</M> = 在 u 的子树里<strong>恰好保留 j 条边</strong>时的最大苹果数。答案在 <M>{'f[root][Q]'}</M>。
          </p>
        </div>
        <figure className="figure">
          <PostorderFigure />
          <figcaption className="figure__cap">
            仍是后序：先把每个孩子子树的 <M>{'f[c][\\cdot]'}</M> 整张小表算好，父亲再把孩子们「分组背包」式地并进来。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">把孩子当成一「组」物品</h2>
        <div className="prose">
          <p>
            怎么合并？关键一步：<strong>把每个孩子子树看成分组背包里的一「组」</strong>。给孩子 <M>{'c'}</M> 分配 <M>{'t'}</M> 条边（<M>{'t\\ge1'}</M>），
            意味着——先用掉 <strong>1 条</strong>去接通「u 到 c 的边」（拿到它的边权），再把剩下 <M>{'t-1'}</M> 条留给 c 的子树内部去最优，即 <M>{'f[c][t-1]'}</M>。
          </p>
        </div>
        <figure className="figure">
          <TreeKnapDepFigure />
          <figcaption className="figure__cap">
            选孩子 c，先花 1 条容量接通「连 c 的边」；这条边的存在，正是「有依赖背包」的依赖。
          </figcaption>
        </figure>
        <div className="prose">
          <p>于是父亲对每个孩子做一次分组背包合并（<M>{'j'}</M> 倒序，避免一组被算两次）：</p>
          <MB>{'f[u][j]=\\max_{1\\le t\\le j}\\Big(f[u][j-t]+\\big(w_{u,c}+f[c][t-1]\\big)\\Big)'}</MB>
          <p>
            这里 <M>{'w_{u,c}'}</M> 是 u 到孩子 c 的边权。注意 <M>{'t'}</M> 从 1 起步——<strong>要碰孩子子树里任何一条边，就必须先付这条连边</strong>，这就是依赖被自然编码进转移的方式。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          树上背包 = <strong>子树维背包 + 依赖</strong>。「选子必选连父的边」不是额外判断，而是把 <M>{'t'}</M> 的下界设成 1、并把边权算进那一步——依赖就<strong>免费</strong>融进了分组背包的转移里。复杂度是每个点 <M>{'O(sz_u^2)'}</M>，全树合起来 <M>{'O(n^2)'}</M>（经典的「树上背包是平方」结论）。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            小树：根 <M>{'1'}</M>，两个孩子 <M>{'2'}</M>（连边苹果 2）、<M>{'3'}</M>（连边苹果 5）；<M>{'2'}</M> 再带两片叶 <M>{'4'}</M>（连边 3）、<M>{'5'}</M>（连边 4）。保留 <M>{'Q=3'}</M> 条边：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>叶子 4、5、3</b> 子树内没有边：<M>{'f[\\cdot][0]=0'}</M>，更高列不存在（<M>{'sz=0'}</M>）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>节点 2</b>（孩子 4、5，连边 3、4）。并入 4：<M>{'f[2][1]=w_{2,4}+f[4][0]=3'}</M>。再并入 5：<M>{'f[2][1]=\\max(3,\\,4)=4'}</M>，<M>{'f[2][2]=w_{2,4}+w_{2,5}=3+4=7'}</M>。得 <M>{'f[2]=[0,4,7]'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>根 1</b>（孩子 2、3，连边 2、5）。并入 2：给它 <M>{'t'}</M> 条 → <M>{'w_{1,2}+f[2][t-1]'}</M>，得 <M>{'f[1][1..3]=[2,6,9]'}</M>。再并入 3（<M>{'sz=0'}</M>，只能给 1 条 <M>{'w_{1,3}=5'}</M>）：<M>{'f[1][3]=\\max(9,\\ f[1][2]+5)=\\max(9,6+5)=11'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>答案</b> <M>{'f[1][3]=11'}</M>——留「1-3」这条边（5）＋「1-2」「2-5」两条（2+4），共 3 条边、苹果 11。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示画出这棵苹果树，点任意节点看它的<strong>小背包表 <M>{'f[u][j]'}</M></strong>；改边权或保留数 <M>{'Q'}</M>，所有表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">每个节点一张小背包表</h2>
        <div className="demo">
          <div className="demo__body">
            <TreeKnapsackDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">依赖成森林：接一个虚根</h2>
        <div className="prose">
          <p>
            再看「选课」：<M>{'n'}</M> 门课，有的课要<strong>先修另一门</strong>才能选；没有先修课的课可以直接选。选 <M>{'m'}</M> 门，最大化学分。
            「先修」关系画出来是一片<strong>森林</strong>（多棵依赖树），不是单棵树——DFS 从哪开始？
          </p>
          <p>
            技巧极简：<strong>造一个虚根 <M>{'0'}</M></strong>，把每棵树的树根都挂到它下面。森林瞬间变成一棵以 <M>{'0'}</M> 为根的树，前面那套树上背包直接套用。
            只是要记得——选 <M>{'m'}</M> 门真课，等价于在含虚根的树里<strong>选 <M>{'m+1'}</M> 个点</strong>（虚根白占一个名额），最后读 <M>{'f[0][m+1]'}</M>。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱：虚根的「+1」不能漏">
          接虚根后，容量要留给虚根那一门。转移时 <M>{'j'}</M> 上界写 <M>{'m+1'}</M>、每个点的 <M>{'f[u][1]'}</M> 先塞自己（占 1 门），答案读 <M>{'f[0][m+1]'}</M>。漏掉这个 +1，会把真课数当成点数，答案系统性偏小一门。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2015" name="二叉苹果树" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            一棵带边权（苹果数）的<strong>二叉</strong>苹果树，共 <M>{'n'}</M> 个节点。只保留 <M>{'Q'}</M> 条树枝（保留的枝必须与根连通），求最多保留多少苹果。
          </Field>
          <Field k="对应关系">
            <M>{'f[u][j]'}</M> = u 子树保留 j 条边的最大苹果数。二叉限制让每个点至多两个孩子，转移最清爽，是树上背包最佳入门。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u][j]=\\max_t(f[u][j-t]+w_{u,c}+f[c][t-1])'}</M>；一遍 DFS，<M>{'O(nQ)'}</M> 级。
          </Field>
          <Field k="参考代码（边权分组背包）">
            <CodeBlock code={CODE_P2015} luogu="P2015" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2014" name="[CTSC1997] 选课" src="CTSC 1997" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 门课，每门有先修课（0 表示无）与学分。选 <M>{'m'}</M> 门使学分最大，且选一门必须先选它的先修课。
          </Field>
          <Field k="为什么选它">
            有依赖背包的<strong>标准母题</strong>：先修关系成森林，用<strong>虚根 0</strong> 合成一棵树后，就是「点数背包」。它把「依赖 → 树上背包」的转承讲得最透。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u][j]=\\max_k(f[u][j-k]+f[c][k])'}</M>，选 <M>{'m+1'}</M> 个点（含虚根）；<M>{'O(nm)'}</M> 级。
          </Field>
          <Field k="参考代码（虚根 + 点数背包）">
            <CodeBlock code={CODE_P2014} luogu="P2014" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P1273" name="有线电视网" hint="叶子是用户（带收视费），内部点转发有成本。f[u][j] = u 子树覆盖 j 个用户的最大净收益；边权取负成本，用户数当容量。" />
        <Exercise pid="P3177" name="[HAOI2015] 树上染色" hint="拔高：把 k 个点染黑，f[u][j] = u 子树染 j 个黑点。转移时每条边的贡献 = 边权 × (两侧黑点对数)，边贡献型树上背包。" />
        <Exercise pid="P1064" name="[NOIP2006] 金明的预算方案" hint="主件带 ≤2 附件的依赖背包：把「主件 + 其附件的子集」枚举成一组物品做分组背包。是树上背包退化到「深度 1」的特例。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/f/select" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">选点 / 最大独立集</span>
        </Link>
        <Link to="/part/f/diameter" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            直径 / 重心 DP <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
