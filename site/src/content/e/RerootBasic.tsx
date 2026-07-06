import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import RerootTwoPassDemo from '../../components/demos/reroot/RerootTwoPassDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { BruteFigure, TwoPassFigure, CoefFigure } from './RerootArt'

const CODE_P3478 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 1000005;
int n;
vector<int> g[N];             // 邻接表
ll sz[N];                     // sz[u]：以 1 为根时 u 的子树节点数
ll f[N];                      // f[u]：以 u 为根时的深度和（距离和）
ll dep[N];                    // dep[u]：以 1 为根时 u 的深度

// 第一遍：后序求子树大小 sz[]，顺带累加 f[1] = Σ dep[i]
void dfs1(int u, int fa)
{
    sz[u] = 1;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dep[v] = dep[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];       // 子必先算好——所以后序
    }
}

// 第二遍：前序换根 f[v] = f[u] + (n - 2*sz[v])
void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        f[v] = f[u] + (n - 2 * sz[v]);   // ★O(1) 换根：子树内 sz 个近 1，其余远 1
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dep[1] = 0;
    dfs1(1, 0);
    for (int i = 1; i <= n; i++)
        f[1] += dep[i];        // 以 1 为根的深度和 = 起点

    dfs2(1, 0);

    int best = 1;
    for (int i = 1; i <= n; i++)
        if (f[i] > f[best]) best = i;   // 本题求深度和最大的点

    cout << best << endl;
    return 0;
}`

const CODE_P1395 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 50005;
int n;
vector<int> g[N];
ll sz[N], f[N], dep[N];

void dfs1(int u, int fa)
{
    sz[u] = 1;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dep[v] = dep[u] + 1;
        dfs1(v, u);
        sz[u] += sz[v];
    }
}

void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        f[v] = f[u] + (n - 2 * sz[v]);
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }

    dfs1(1, 0);
    for (int i = 1; i <= n; i++) f[1] += dep[i];
    dfs2(1, 0);

    int best = 1;
    for (int i = 1; i <= n; i++)
        if (f[i] < f[best]) best = i;   // 会议：求距离和最小的点
    cout << best << " " << f[best] << endl;
    return 0;
}`

export default function RerootBasic() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">同一个量，要对「每个点」都算一遍</h2>
        <div className="prose">
          <p>
            换根 DP 解决这样一类问题：给一棵<strong>无根树</strong>，要对<strong>每一个点</strong>，都算出「把它当根时的某个量」——
            比如「它到所有其它点的距离之和」「它的子树深度和」。注意关键词是<strong>每一个点</strong>：不是求一个全局最优，而是要 <M>{'n'}</M> 个答案。
          </p>
          <p>
            先看最朴素的想法：<strong>枚举每个点当根，各自跑一遍遍历</strong>。以某点为根做一次 BFS/DFS，就能得到它到全树的距离和，<M>{'O(n)'}</M>。
            但要对 <M>{'n'}</M> 个点都这么做，总共就是 <M>{'O(n^2)'}</M>。
          </p>
        </div>
        <figure className="figure">
          <BruteFigure />
          <figcaption className="figure__cap">
            暴力：把每个点轮流当根，各自从头遍历一遍——同样的树被反复走了 n 遍，总计 O(n²)。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <M>{'n\\le 10^6'}</M> 时 <M>{'O(n^2)'}</M> 直接爆炸。可这 <M>{'n'}</M> 遍遍历里藏着<strong>大量重复</strong>：
            相邻两个点当根，绝大多数点到它们的距离只差了「一步」。换根 DP 正是要抓住这个「只差一步」，
            让相邻根之间 <M>{'O(1)'}</M> 递推，把 <M>{'O(n^2)'}</M> 压回 <M>{'O(n)'}</M>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">两遍 DFS：先立地基，再顺边换根</h2>
        <div className="prose">
          <p>
            换根 DP 的骨架是<strong>两遍 DFS</strong>，以「深度和 / 距离和」为例（每条边长 1、每个点算 1）：
          </p>
        </div>
        <figure className="figure">
          <TwoPassFigure />
          <figcaption className="figure__cap">
            第一遍后序（叶→根）求子树大小 sz[]，第二遍前序（根→叶）顺着边把根一路换下去——两遍合计 O(n)。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>第一遍 · 后序，固定一个根（记作 1）。</strong>求出每个点的子树大小{' '}
            <M>{'\\mathrm{sz}[u]'}</M>（= 它自己 + 各孩子子树大小之和）。因为父要用到子的结果，必须<strong>子先于父</strong>，所以是后序。
            顺手把固定根的距离和 <M>{'f[1]=\\sum_i \\mathrm{dep}(1,i)'}</M> 也累加出来——这是唯一一个「老实一层层加」得到的答案，作为<strong>换根的起点</strong>。
          </p>
          <p>
            <strong>第二遍 · 前序，从根出发把根「挪」给每个孩子。</strong>关键是想清楚：根从 <M>{'u'}</M> 挪到相邻的孩子 <M>{'v'}</M> 时，距离和怎么变？
          </p>
        </div>
        <figure className="figure">
          <CoefFigure />
          <figcaption className="figure__cap">
            根 u→v：v 的子树里 sz[v] 个点各近 1 步（−sz），其余 n−sz[v] 个点各远 1 步（+）。净变化 = n − 2·sz[v]。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            把根从 <M>{'u'}</M> 移到孩子 <M>{'v'}</M>，相当于所有点相对根「整体挪了一条边」：
            <strong>落在 <M>{'v'}</M> 子树里的 <M>{'\\mathrm{sz}[v]'}</M> 个点，离新根近了 1</strong>；
            <strong>其余 <M>{'n-\\mathrm{sz}[v]'}</M> 个点，离新根远了 1</strong>。于是
          </p>
          <MB>{'f[v]=f[u]+\\big(n-\\mathrm{sz}[v]\\big)-\\mathrm{sz}[v]=f[u]+\\big(n-2\\,\\mathrm{sz}[v]\\big)'}</MB>
          <p>
            一次加法就把 <M>{'f[v]'}</M> 算出来了。沿树前序递归，每条边做一次这样的 <M>{'O(1)'}</M> 更新，走完就得到<strong>所有点</strong>的答案。
            边界：起点 <M>{'f[1]'}</M> 由第一遍给出。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          换根 DP = 「固定根的一份答案」+「相邻根之间的 <M>{'O(1)'}</M> 增量」。第一遍 DFS 花 <M>{'O(n)'}</M> 立好地基（<M>{'\\mathrm{sz}[]'}</M> 与起点 <M>{'f[\\text{root}]'}</M>），
          第二遍 DFS 用 <M>{'f[v]=f[u]+\\Delta'}</M> 把答案沿边「传染」出去。把 <M>{'n'}</M> 次独立遍历，换成一次遍历里 <M>{'n'}</M> 个相互推导的增量。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用一条 <strong>5 个点的链</strong> <M>{'1-2-3-4-5'}</M> 手推（无权，求每点距离和）。固定根取 1：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第一遍求 sz。</b>从叶子 5 往上：<M>{'\\mathrm{sz}[5]=1,\\ \\mathrm{sz}[4]=2,\\ \\mathrm{sz}[3]=3,\\ \\mathrm{sz}[2]=4,\\ \\mathrm{sz}[1]=5'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>起点 f[1]。</b>以 1 为根，深度为 <M>{'0,1,2,3,4'}</M>，距离和 <M>{'f[1]=0+1+2+3+4=10'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>换根 1→2。</b><M>{'n=5,\\ \\mathrm{sz}[2]=4'}</M>，系数 <M>{'5-2\\times4=-3'}</M>。<M>{'f[2]=f[1]+(-3)=10-3=7'}</M>。
              （2 那侧 4 个点各近 1，只有点 1 远 1，净 <M>{'-3'}</M>，合理。）
            </div>
          </div>
          <div className="step">
            <span className="step__n">4</span>
            <div className="step__b">
              <b>继续换到底。</b><M>{'f[3]=f[2]+(5-2\\times3)=7-1=6'}</M>；<M>{'f[4]=f[3]+(5-2\\times2)=6+1=7'}</M>；<M>{'f[5]=f[4]+(5-2\\times1)=7+3=10'}</M>。
              最小在<strong>中点 3</strong>（<M>{'f[3]=6'}</M>）——正是链的重心，符合直觉。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把这<strong>两遍扫描逐帧放给你看</strong>：先看 sz[] 自底向上点亮，再看根顺着边一步步换、每步只做一次加法。换棵树试试。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看两遍扫描跑起来</h2>
        <div className="demo">
          <div className="demo__body">
            <RerootTwoPassDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">写法要点：无根树、任取一根、别回头</h2>
        <div className="prose">
          <p>
            换根题的输入几乎都是<strong>无根树</strong>（只给 <M>{'n-1'}</M> 条无向边）。实现时统一套路：
            用 <M>{'\\text{vector<int> g[N]}'}</M> 存<strong>双向</strong>邻接表，DFS 时传一个 <M>{'\\text{fa}'}</M>（父亲）参数，
            遇到 <M>{'v==\\text{fa}'}</M> 就跳过——这样就把无向图当有根树遍历，不会走回头路。
          </p>
          <p>
            两遍 DFS 都从固定根 1 出发：<M>{'\\text{dfs1}'}</M> 后序累加 <M>{'\\mathrm{sz}'}</M>（递归返回后再 <M>{'+='}</M> 子树），
            <M>{'\\text{dfs2}'}</M> 前序换根（先算 <M>{'f[v]'}</M> 再递归进 <M>{'v'}</M>，保证父答案已就绪）。
            <M>{'n\\le 10^6'}</M> 时递归可能栈深较大——洛谷默认栈够用，实在担心可手写栈迭代。
          </p>
        </div>
        <InfoBox kind="warn" title="易错点">
          换根的增量必须用<strong>「相对固定根 1」算出的 <M>{'\\mathrm{sz}[v]'}</M></strong>（第一遍那套），
          而不是「相对当前根」。第二遍前序时每个 <M>{'\\mathrm{sz}[v]'}</M> 都是固定值，别在换根途中去改它。
          另外距离和常常爆 <M>{'int'}</M>（<M>{'n=10^6'}</M> 时和可达 <M>{'10^{12}'}</M>），<strong>全程开 <M>{'\\text{long long}'}</M></strong>。
        </InfoBox>
        <div className="pointer-cue">
          <Gamepad2 size={18} />
          想直接上手？到 <Link to="/part/e" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>E 部分页的「换根巡礼」</Link>点节点当根，实时看距离和，再点「看 DP 最优」一次算出全部点、找出重心。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P3478" name="[POI2008] STA-Station" src="POI 2008" diff="提高+/省选-">
          <Field k="题意">
            给一棵 <M>{'n'}</M> 个点的树，找一个点作根，使<strong>所有点的深度之和最大</strong>，输出这个点。
          </Field>
          <Field k="为什么选它">
            换根 DP 的<strong>官方模板题</strong>：深度和 = 距离和，转移就是最干净的{' '}
            <M>{'f[v]=f[u]+(n-2\\,\\mathrm{sz}[v])'}</M>。本题求<strong>最大</strong>（越浅的点当根、越多点被拉深），
            正好和「会议」求最小对照——同一个 <M>{'f[]'}</M>，一个取 max、一个取 min。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[1]=\\sum \\mathrm{dep}(1,i)'}</M> 起步，<M>{'f[v]=f[u]+(n-2\\,\\mathrm{sz}[v])'}</M> 换根；两遍 DFS，<M>{'O(n)'}</M>。
            <M>{'n\\le 10^6'}</M> 必开 <M>{'\\text{long long}'}</M>。
          </Field>
          <Field k="参考代码（两遍 DFS · 求最大）">
            <CodeBlock code={CODE_P3478} luogu="P3478" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1395" name="会议" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            树上 <M>{'n'}</M> 个点，选一个点开会，使<strong>所有点到它的距离和最小</strong>，输出该点与最小距离和。
          </Field>
          <Field k="对应关系">
            无权距离和 = 深度和，与 P3478 是<strong>同一个 <M>{'f[]'}</M></strong>，只是这里取 <M>{'\\min'}</M>。
            <M>{'n\\le 5\\times10^4'}</M>——足以卡掉 <M>{'O(n^2)'}</M> 的每点重算，是「从暴力过渡到换根」最好的一题。
          </Field>
          <Field k="参考代码（换 max 为 min）">
            <CodeBlock code={CODE_P1395} luogu="P1395" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2986"
          name="[USACO10MAR] Great Cow Gathering G"
          hint="带权 + 带边权距离和：换根系数升级为 w·(W − 2·sz)，sz 改成子树『牛数』之和。见下一类型精讲。"
        />
        <Exercise
          pid="P3047"
          name="[USACO12FEB] Nearby Cows G"
          hint="距离 ≤ k 的点权和：状态多一维 dp[u][j]，换根要『父贡献减去自身子树贡献』。见『子树内外合并』。"
        />
        <Exercise
          pid="P1364"
          name="医院设置"
          hint="n≤100，可先写 O(n²) 暴力对拍，再用换根 O(n) 验证——最适合亲手体会两种复杂度的落差。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/d/matpow" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">矩阵快速幂加速</span>
        </Link>
        <Link to="/part/e/distsum" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            距离和换根 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
