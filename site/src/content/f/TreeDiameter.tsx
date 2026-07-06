import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import DiameterDemo from '../../components/demos/treedp/DiameterDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { DiameterFigure, PostorderFigure, CentroidFigure } from './TreeArt'

const CODE_DIAM = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 100005;
struct E { int to, w; };
vector<E> g[N];
long long down[N];            // down[u]：从 u 向下、必含 u 的最长链长
long long ans;               // 全局直径

void dfs(int u, int fa)
{
    down[u] = 0;
    long long best1 = 0, best2 = 0;      // 两条最长的孩子向上链
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        dfs(e.to, u);
        long long chain = down[e.to] + e.w;   // 孩子链 + 连它的边
        if (chain > best1) { best2 = best1; best1 = chain; }
        else if (chain > best2) best2 = chain;
    }
    down[u] = best1;                     // 向下最长 = 最深的一条
    ans = max(ans, best1 + best2);       // ★过 u 的最长 = 两条最深拼接
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b, w;
        cin >> a >> b >> w;
        g[a].push_back({b, w});
        g[b].push_back({a, w});
    }

    dfs(1, 0);
    cout << ans << endl;                 // 一遍 DFS 即得直径
    return 0;
}`

const CODE_P1122 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 16005;
vector<int> g[N];
int w[N];                     // 点权（可正可负）
int f[N];                     // f[u]：含 u 的最大子树权和
int ans;

void dfs(int u, int fa)
{
    f[u] = w[u];              // 至少含它自己
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs(v, u);
        if (f[v] > 0) f[u] += f[v];      // ★孩子块为正才接上，否则截断
    }
    ans = max(ans, f[u]);
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> w[i];
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    ans = -0x3f3f3f3f;
    dfs(1, 0);
    cout << ans << endl;
    return 0;
}`

export default function TreeDiameter() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">树里最长的那条路，怎么一遍找出来</h2>
        <div className="prose">
          <p>
            树的<strong>直径</strong>：任意两点间最长的那条路径。它是许多问题的地基——树网的核、时态同步、乃至距离统计，都要先抓住这条最长路。
          </p>
          <p>
            最长路可能<strong>不经过根</strong>，也可能在树的任意角落拐弯。枚举所有点对求最短路再取最大？<M>{'O(n^2)'}</M> 起步，<M>{'n=10^5'}</M> 扛不住。
            但换个视角就豁然开朗：<strong>任何一条路径，都必有一个「最高点」（深度最浅的那个点）</strong>。
          </p>
          <p>
            于是只要<strong>枚举这个最高点 <M>{'u'}</M></strong>，问题就变成：以 u 为「屋脊」，向它的<strong>两个不同孩子方向</strong>各挂一条最长的向下链，拼起来就是「过 u 的最长路径」。全局直径 = 所有点的「过点最长」取最大。
          </p>
        </div>
        <figure className="figure">
          <DiameterFigure />
          <figcaption className="figure__cap">
            过点 u 的最长路径 = u 的<strong>最深孩子链 + 次深孩子链</strong>；每个点只在自己当「屋脊」时贡献一次。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态：向下最长链 down[u]</h2>
        <div className="prose">
          <p>
            只需<strong>一个</strong>状态：<M>{'down[u]'}</M> = 从 u 出发、一路向下（进入子树）、<strong>必含 u</strong> 的最长链的长度。它由孩子递推：
          </p>
          <MB>{'down[u]=\\max_{c\\in son(u)}\\big(down[c]+w_{u,c}\\big)\\quad(\\text{;}0)'}</MB>
          <p>
            取所有孩子里「孩子链 + 连边」最大的那一条。<strong>叶子</strong>没有孩子，<M>{'down[\\text{leaf}]=0'}</M>。
          </p>
          <p>
            而「过 u 的最长路径」要拿<strong>两条</strong>：在遍历孩子时顺手维护<strong>最大 <M>{'best_1'}</M> 与次大 <M>{'best_2'}</M></strong> 两条向下链，则
          </p>
          <MB>{'\\text{through}(u)=best_1+best_2,\\qquad \\text{diam}=\\max_u \\text{through}(u)'}</MB>
          <p>
            两条链必须来自<strong>不同孩子</strong>（否则会走回头路），所以取「最大 + 次大」而非「最大 + 最大」。
          </p>
        </div>
        <figure className="figure">
          <PostorderFigure />
          <figcaption className="figure__cap">
            后序遍历：<M>{'down[c]'}</M> 先算好，父亲才能在合并孩子时同步更新 <M>{'best_1,best_2'}</M> 与全局答案。
          </figcaption>
        </figure>
        <InfoBox kind="key" title="本质">
          直径不需要「两遍 BFS」也不需要换根——<strong>一遍后序 DFS</strong> 就够：每个点在合并孩子的<strong>那一瞬间</strong>，用「最深 + 次深」结算过它的最长路径。把「枚举最高点」这个观察落实成状态，<M>{'O(n^2)'}</M> 塌成 <M>{'O(n)'}</M>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            小树（点权当作到父亲的边权简化演示）：根 <M>{'1'}</M> 带 <M>{'2,3'}</M>；<M>{'2'}</M> 带 <M>{'4,5'}</M>；<M>{'3'}</M> 带 <M>{'6'}</M>。设各点权 <M>{'w=[2,3,4,5,1,6]'}</M>，把「过点链」当作点权和：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>叶子 4、5、6。</b> <M>{'down[4]=4,\\ down[5]=1,\\ down[6]=6'}</M>（叶子的向下链就是自己的权）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>节点 2</b>（权 3，孩子 4、5）。孩子链 <M>{'4,1'}</M>，最大 4、次大 1。<M>{'down[2]=3+4=7'}</M>；过 2 的链 <M>{'=3+4+1=8'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>节点 3</b>（权 1，孩子 6）：<M>{'down[3]=1+6=7'}</M>，过 3 只有一条孩子链，<M>{'through=1+6=7'}</M>。 <b>根 1</b>（权 2，孩子 2、3）：孩子链 <M>{'down[2]=7,down[3]=7'}</M>，<M>{'through(1)=2+7+7=16'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>直径</b> <M>{'\\max(8,7,16,\\dots)=16'}</M>——峰顶在根 1，链是「4→2→1→3→6」。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示逐点点亮 <M>{'down[u]'}</M>，末帧把「拐点 + 两条最深链」高亮成绿色；改点权看直径与峰顶如何移动。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看直径在哪拐弯</h2>
        <div className="demo">
          <div className="demo__body">
            <DiameterDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">同一套合并：最大子树和</h2>
        <div className="prose">
          <p>
            把「链」换成「块」，同一套自底向上合并就解另一类题：树上点权有正有负，求<strong>一个连通块</strong>使权和最大。
            状态 <M>{'f[u]'}</M> = <strong>含 u 的最大子树权和</strong>：
          </p>
          <MB>{'f[u]=w_u+\\sum_{c\\in son(u)}\\max\\big(0,\\ f[c]\\big)'}</MB>
          <p>
            盯住那个 <M>{'\\max(0,f[c])'}</M>：孩子这块若<strong>净收益为正</strong>就接上，为负就<strong>剪断</strong>（宁可不要）。答案 = <M>{'\\max_u f[u]'}</M>。
            这和直径的「孩子链为正才接」是<strong>同一个直觉</strong>——只不过直径挑「最深两条」，子树和是「所有正的都要」。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱：负权不能一律截断到 0">
          <M>{'f[u]'}</M> 起手要塞 <M>{'w_u'}</M>（即使它是负数），只有<strong>孩子的块</strong>才用 <M>{'\\max(0,\\cdot)'}</M> 决定接不接。若把 <M>{'f[u]'}</M> 也钳到非负，全负的树会错报 0。答案初值也要设成 <M>{'-\\infty'}</M> 而非 0，防止「必须选至少一个点」时被 0 顶掉。
        </InfoBox>
        <div className="prose">
          <p>
            <strong>换个视角看直径。</strong>本页从「固定根、一遍 DFS」求出直径与过点最长链；若要对<strong>每个点</strong>都问「以它为端点的最远距离（偏心距）」，则需要<strong>换根 DP</strong> 把父方向的信息也回推——那条路线见{' '}
            <Link to="/part/e/center" style={{ color: 'var(--accent-2)' }}>E 部分 · 中心 / 偏心距</Link>。两条路互补：这里主讲直径本身的推导，换根篇主讲逐点偏心距。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1099" name="[NOIP2007] 树网的核" src="NOIP 2007 提高组" diff="提高+/省选-">
          <Field k="题意">
            带权树上找一条长度 <M>{'\\le s'}</M> 的路径（「核」），使全树到这条路径的<strong>最大距离（偏心距）最小</strong>。
          </Field>
          <Field k="对应关系">
            先求<strong>直径</strong>（本类核心）：最优核一定落在某条直径上。沿直径滑动长度 <M>{'\\le s'}</M> 的窗口，配合每点「向直径外伸出的最长链」，取偏心距最小。
          </Field>
          <Field k="为什么选它">
            直径 + 核 + 最小偏心距<strong>三件套集大成</strong>的 NOIP 真题。一次把「一遍 DFS 求直径」用到实处，是本类当之无愧的主讲位。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'down[u]=\\max(down[c]+w)'}</M> 求直径；再沿直径双指针，<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（一遍 DFS 求直径，核部分见题解）">
            <CodeBlock code={CODE_DIAM} luogu="P1099" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1122" name="最大子树和" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            树上每点有一个「美丽值」（可负）。删去若干点后要剩下一个<strong>连通块</strong>，求块内美丽值之和的最大值。
          </Field>
          <Field k="为什么选它">
            <M>{'f[u]'}</M> = 含 u 的最大子树和，链式合并、<strong>无背包维度</strong>，是「过点最优」最轻量的载体。与直径共享「孩子为正才接」的剪枝直觉，正好巩固。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u]=w_u+\\sum\\max(0,f[c])'}</M>，答案 <M>{'\\max_u f[u]'}</M>；<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1122} luogu="P1122" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P1131" name="[ZJOI2007] 时态同步" hint="让所有叶子到根的路径等长，只能增加边权。f[u] = u 子树内最长链；每条子边补齐到最长，累计增量。是「直径式合并」的变体。" />
        <Exercise pid="P1364" name="医院设置" hint="带点权的重心：找一个点使 Σ(点权 × 到它的距离) 最小。n≤100 可先暴力，再用子树大小判重心对照，纯重心练习。" />
        <Exercise pid="P1122" name="最大子树和（自测）" hint="独立写一遍：注意 f[u] 起手含 w[u]（可负），孩子块 max(0, f[c]) 才接，答案初值 -∞。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/f/knapsack" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">树上背包</span>
        </Link>
        <Link to="/part/f/cover" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            覆盖 / 支配 / 染色 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
