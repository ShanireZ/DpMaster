import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import RerootDistDemo from '../../components/demos/reroot/RerootDistDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { DistSetupFigure, CoefFigure, BruteFigure } from './RerootArt'

const CODE_P2986 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 100005;
int n;
struct E { int to; ll w; };
vector<E> g[N];
ll c[N];                      // c[u]：点 u 的牛数（点权）
ll sz[N];                     // sz[u]：子树内牛数之和（不是节点数！）
ll W;                         // 总牛数
ll f[N];                      // f[u]：把 u 当集合点时的带权距离和

// 第一遍：sz[u] = 子树牛数和；f[1] 顺带累加（子树 c 走 w 到 1）
void dfs1(int u, int fa, ll dep)
{
    sz[u] = c[u];
    f[1] += c[u] * dep;       // 以 1 为根：u 的牛各走 dep 到 1
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        dfs1(e.to, u, dep + e.w);
        sz[u] += sz[e.to];
    }
}

// 第二遍：换根 f[v] = f[u] + w*(W - 2*sz[v])
void dfs2(int u, int fa)
{
    for (E e : g[u])
    {
        if (e.to == fa) continue;
        // 子树 v 的 sz[v] 头牛各近 w，其余 W - sz[v] 头牛各远 w
        f[e.to] = f[u] + e.w * (W - 2 * sz[e.to]);
        dfs2(e.to, u);
    }
}

int main()
{
    cin >> n;
    W = 0;
    for (int i = 1; i <= n; i++) { cin >> c[i]; W += c[i]; }
    for (int i = 1; i < n; i++)
    {
        int a, b; ll w;
        cin >> a >> b >> w;
        g[a].push_back({b, w});
        g[b].push_back({a, w});
    }

    dfs1(1, 0, 0);
    dfs2(1, 0);

    ll ans = f[1];
    for (int i = 2; i <= n; i++) ans = min(ans, f[i]);
    cout << ans << endl;
    return 0;
}`

const CODE_P1364 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 105;
int n;
ll c[N];                      // 该点居民数
vector<int> g[N];
ll sz[N], f[N], W;

void dfs1(int u, int fa, ll dep)
{
    sz[u] = c[u];
    f[1] += c[u] * dep;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs1(v, u, dep + 1);   // 医院设置边权=1
        sz[u] += sz[v];
    }
}

void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        f[v] = f[u] + (W - 2 * sz[v]);   // 无边权，系数即 W - 2*sz[v]
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int l, r;
        cin >> c[i] >> l >> r;   // 居民数、左儿子、右儿子（0 表示无）
        W += c[i];
        if (l) { g[i].push_back(l); g[l].push_back(i); }
        if (r) { g[i].push_back(r); g[r].push_back(i); }
    }

    dfs1(1, 0, 0);
    dfs2(1, 0);

    ll ans = f[1];
    for (int i = 2; i <= n; i++) ans = min(ans, f[i]);
    cout << ans << endl;
    return 0;
}`

export default function RerootDistSum() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从「无权」到「带权」的距离和</h2>
        <div className="prose">
          <p>
            上一节的「距离和」默认每条边长 1、每个点算 1。真实题目常常带<strong>两种权</strong>：
            <strong>点权</strong>（每个村庄住着不同人数 / 每个牧场有不同头数的牛）与<strong>边权</strong>（路的长短不一）。
            目标变成：选一个<strong>集合点</strong>，使<strong>所有人赶来的总路程最小</strong>——
            也就是 <M>{'\\sum_v c_v\\cdot \\mathrm{dis}(u,v)'}</M> 最小，其中 <M>{'c_v'}</M> 是点 <M>{'v'}</M> 的人数、<M>{'\\mathrm{dis}'}</M> 是带边权的树上距离。
          </p>
        </div>
        <figure className="figure">
          <DistSetupFigure />
          <figcaption className="figure__cap">
            带点权的树：每个点标 ×w 表示人数/牛数。集合点要让「人数 × 距离」的加权总和最小。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            朴素解还是「枚举每个点当集合点，各跑一遍带权 BFS/最短路累加」——<M>{'O(n^2)'}</M>。
            换根 DP 的思路完全不变，只是<strong>把「点数」换成「点权和」、把「1 步」换成「边权 <M>{'w'}</M> 步」</strong>。
          </p>
        </div>
        <figure className="figure">
          <BruteFigure />
          <figcaption className="figure__cap">同样地，暴力对每个集合点各算一遍加权总距离——n 遍，O(n²)，大树上不可行。</figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">换根系数：把「点数」升级成「点权和」</h2>
        <div className="prose">
          <p>
            重新定义两个量：<M>{'W=\\sum_v c_v'}</M> 是<strong>总点权</strong>；
            <M>{'\\mathrm{sz}[u]'}</M> 改成 <strong>子树内点权之和</strong>（不再是节点数）。
            第一遍后序：<M>{'\\mathrm{sz}[u]=c_u+\\sum_{c\\in son}\\mathrm{sz}[c]'}</M>，并累加固定根的加权距离和 <M>{'f[1]'}</M>。
          </p>
        </div>
        <figure className="figure">
          <CoefFigure />
          <figcaption className="figure__cap">
            根 u→v 走一条长 w 的边：v 子树内的点权 sz[v] 各近 w，其余 W−sz[v] 各远 w。系数乘上边权 w。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            根从 <M>{'u'}</M> 挪到孩子 <M>{'v'}</M>（这条边长 <M>{'w'}</M>）时：
            <M>{'v'}</M> 子树内那 <M>{'\\mathrm{sz}[v]'}</M> 的点权，每单位都<strong>近了 <M>{'w'}</M></strong>；
            其余 <M>{'W-\\mathrm{sz}[v]'}</M> 的点权，每单位都<strong>远了 <M>{'w'}</M></strong>。于是带权换根方程：
          </p>
          <MB>{'f[v]=f[u]+w\\cdot\\big(\\,(W-\\mathrm{sz}[v])-\\mathrm{sz}[v]\\,\\big)=f[u]+w\\cdot\\big(W-2\\,\\mathrm{sz}[v]\\big)'}</MB>
          <p>
            无权是它的特例：<M>{'c_v\\equiv1'}</M> 时 <M>{'W=n'}</M>、<M>{'w\\equiv1'}</M>，方程退回 <M>{'f[v]=f[u]+(n-2\\,\\mathrm{sz}[v])'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          距离和换根的通式是 <M>{'f[v]=f[u]+w\\cdot(W-2\\,\\mathrm{sz}[v])'}</M>：<strong><M>{'W'}</M> 是「有多少东西要移动」</strong>（点权和），
          <strong><M>{'\\mathrm{sz}[v]'}</M> 是「往 <M>{'v'}</M> 那边挪时有多少东西变近」</strong>，<strong><M>{'w'}</M> 是「每样东西挪动的步长」</strong>。
          把这三者填对，无权 / 点权 / 边权就是同一份代码。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            小例子：一条链 <M>{'1-2-3'}</M>，点权 <M>{'c=[1,1,4]'}</M>（点 3 上住了 4 个人），边权都为 1。总点权 <M>{'W=6'}</M>。固定根 1：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第一遍 sz（点权和）。</b><M>{'\\mathrm{sz}[3]=4,\\ \\mathrm{sz}[2]=4+1=5,\\ \\mathrm{sz}[1]=6=W'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>起点 f[1]。</b>点 1、2、3 到根 1 的距离是 <M>{'0,1,2'}</M>，加权和 <M>{'f[1]=1\\cdot0+1\\cdot1+4\\cdot2=9'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>换根 1→2。</b>系数 <M>{'W-2\\,\\mathrm{sz}[2]=6-2\\times5=-4'}</M>。<M>{'f[2]=9+(-4)=5'}</M>。
              （2 那侧点权 5 各近 1，只有点 1 的权 1 远 1，净 <M>{'-4'}</M>。）
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>换根 2→3。</b>系数 <M>{'6-2\\times4=-2'}</M>。<M>{'f[3]=5+(-2)=3'}</M>。
              最小在<strong>点 3</strong>——人最多的地方，把会开在那儿最省，符合直觉。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面切换「无权 / 点权」两种模式，点节点当集合点看加权距离和，并盯住每个孩子的<strong>换根系数正负</strong>——负号指向更优的方向。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">点节点，看距离和实时变</h2>
        <div className="demo">
          <div className="demo__body">
            <RerootDistDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">n 小时：拿暴力给换根「对拍」</h2>
        <div className="prose">
          <p>
            像「医院设置」这种 <M>{'n\\le 100'}</M> 的题，暴力 <M>{'O(n^2)'}</M>（对每个点 BFS 累加）<strong>也能过</strong>。
            这反而是好事：你可以先写暴力拿到分，再写换根 <M>{'O(n)'}</M>，两者<strong>输出必须完全一致</strong>——
            这是验证换根系数没写错的最省心办法。等题目把 <M>{'n'}</M> 放大到 <M>{'10^5,10^6'}</M>，暴力挂了，你手里的换根已经拍过、可靠。
          </p>
          <p>
            「医院设置」输入按<strong>二叉树的左右儿子</strong>给出，但换根不关心二叉不二叉——照样建无向邻接表，当一般树跑两遍 DFS 即可。
          </p>
        </div>
        <InfoBox kind="warn" title="易错点">
          带权时 <M>{'\\mathrm{sz}[u]'}</M> 是<strong>子树点权和</strong>而非节点数——初值要写 <M>{'\\mathrm{sz}[u]=c_u'}</M>，不是 <M>{'1'}</M>。
          换根系数别忘了<strong>乘边权 <M>{'w'}</M></strong>。加权距离和更容易爆 <M>{'int'}</M>，全程 <M>{'\\text{long long}'}</M>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2986" name="[USACO10MAR] Great Cow Gathering G" src="USACO 2010" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 个牧场连成树，牧场 <M>{'i'}</M> 有 <M>{'c_i'}</M> 头牛，边有长度。选一个牧场聚会，使<strong>所有牛走的总路程最小</strong>。
          </Field>
          <Field k="为什么选它">
            距离和换根的<strong>完整形态</strong>：点权（牛数）与边权（路长）<strong>同时</strong>进入系数{' '}
            <M>{'w\\cdot(W-2\\,\\mathrm{sz}[v])'}</M>。把它吃透，无权 / 只带点权 / 只带边权都是它的简化。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'\\mathrm{sz}[u]=c_u+\\sum \\mathrm{sz}[son]'}</M>，<M>{'f[v]=f[u]+w(W-2\\,\\mathrm{sz}[v])'}</M>；两遍 DFS，<M>{'O(n)'}</M>，必开 <M>{'\\text{long long}'}</M>。
          </Field>
          <Field k="参考代码（点权 + 边权换根）">
            <CodeBlock code={CODE_P2986} luogu="P2986" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1364" name="医院设置" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            带居民数的二叉树，选一点设医院，使<strong>所有居民到医院的距离 × 人数</strong>之和最小。
          </Field>
          <Field k="换个视角">
            <M>{'n\\le100'}</M>，是<strong>「暴力 ↔ 换根」对照</strong>的最佳载体：既能 <M>{'O(n^2)'}</M> 每点 BFS，也能 <M>{'O(n)'}</M> 换根，
            两法对拍验证。输入是左右儿子，但建成无向邻接表后当一般带点权树处理即可（边权恒 1）。
          </Field>
          <Field k="参考代码（换根 · 边权 1）">
            <CodeBlock code={CODE_P1364} luogu="P1364" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P1395" name="会议" hint="无权距离和求最小——本节通式里令 c≡1、w≡1 的最简特例，先拿它热身。" />
        <Exercise pid="P3478" name="[POI2008] STA-Station" hint="深度和求最大：同一 f[]，把 min 换成 max。n≤10⁶ 提醒你 long long 与两遍 DFS 的常数。" />
        <Exercise pid="P2986" name="[USACO10MAR] Great Cow Gathering G" hint="自测变形：试着把边权全设为 1 再跑，验证结果与『只带点权』的手算一致。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/e/basic" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">换根基础模型</span>
        </Link>
        <Link to="/part/e/inout" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            子树内外合并 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
