import { Link } from 'react-router-dom'
import { MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import RerootEccDemo from '../../components/demos/reroot/RerootEccDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { EccentricityFigure, InOutFigure } from './RerootArt'

const CODE_ECC = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 100005;
int n;
vector<int> g[N];
int down1[N], down2[N], best[N], up[N];   // 向下最长/次长链、贡献最长的孩子、向上最长链
int ecc[N];                                // 偏心距 = max(down1, up)

// 第一遍：后序求每点向下最长/次长链
void dfs1(int u, int fa)
{
    down1[u] = down2[u] = 0;
    best[u] = -1;
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs1(v, u);
        int cand = down1[v] + 1;      // 经孩子 v 向下最长
        if (cand > down1[u])
        {
            down2[u] = down1[u];
            down1[u] = cand;
            best[u] = v;
        }
        else if (cand > down2[u])
            down2[u] = cand;
    }
}

// 第二遍：前序求向上最长链 up[]，合成偏心距
void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        // v 往上：父的 up 或父『避开 v 这支』的最长向下链，取大 + 1
        int uDown = (best[u] == v) ? down2[u] : down1[u];
        up[v] = max(up[u], uDown) + 1;
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
    up[1] = 0;
    dfs2(1, 0);

    int center = 1;
    for (int i = 1; i <= n; i++)
    {
        ecc[i] = max(down1[i], up[i]);        // 每点到最远点的距离
        if (ecc[i] < ecc[center]) center = i; // 偏心距最小 = 树的中心
    }

    cout << center << " " << ecc[center] << endl;  // 中心及其偏心距（半径）
    return 0;
}`

const CODE_P1364 = `
#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

const int N = 105;
int n;
ll c[N];
vector<int> g[N];
ll sz[N], f[N], W;

void dfs1(int u, int fa, ll dep)
{
    sz[u] = c[u];
    f[1] += c[u] * dep;
    for (int v : g[u]) if (v != fa) { dfs1(v, u, dep + 1); sz[u] += sz[v]; }
}

void dfs2(int u, int fa)
{
    for (int v : g[u]) if (v != fa)
    {
        f[v] = f[u] + (W - 2 * sz[v]);   // 逐点距离和：换根一次性求全
        dfs2(v, u);
    }
}

int main()
{
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int l, r;
        cin >> c[i] >> l >> r;
        W += c[i];
        if (l) { g[i].push_back(l); g[l].push_back(i); }
        if (r) { g[i].push_back(r); g[r].push_back(i); }
    }
    dfs1(1, 0, 0);
    dfs2(1, 0);

    ll ans = f[1];
    for (int i = 2; i <= n; i++) ans = min(ans, f[i]);   // 逐点统计后取最优
    cout << ans << endl;
    return 0;
}`

export default function RerootCenter() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">给每个点算「到最远点有多远」</h2>
        <div className="prose">
          <p>
            换根的第三类目标是<strong>偏心量</strong>：对每个点 <M>{'u'}</M>，求它的<strong>偏心距</strong>{' '}
            <M>{'\\mathrm{ecc}[u]'}</M> = 「<M>{'u'}</M> 到树上最远点的距离」。偏心距最小的点就是<strong>树的中心</strong>，最小值叫<strong>半径</strong>；
            所有偏心距里的最大值 = <strong>树的直径</strong>（最长链长度）。
          </p>
          <p>
            又是「对每个点都要一个答案」的形状。朴素做法照旧 <M>{'O(n^2)'}</M>（每点各 BFS 求最远）。
            换根 DP 把它压到 <M>{'O(n)'}</M>：每个点的最远点，要么在<strong>它的子树里（向下）</strong>，要么在<strong>子树外（经父亲向上）</strong>——两支取较大。
          </p>
        </div>
        <figure className="figure">
          <EccentricityFigure />
          <figcaption className="figure__cap">
            每点标 e = 偏心距（到最远点的边数）。绿圈是偏心距最小的中心；虚线是直径（最长链 1↔5，长 4）。
          </figcaption>
        </figure>
        <InfoBox kind="key" title="与 F 部分·直径/重心 DP 的分工">
          「树的直径」本身有一套<strong>固定根一遍 DFS</strong> 的经典求法（子树最深链 + 次深链拼出过点最长路径），
          那是 <Link to="/part/f/diameter" style={{ color: 'var(--accent-2)' }}>F 部分·直径 / 重心 DP</Link> 的主场，含完整推导。
          <strong>本页站在换根视角</strong>：不止求「一条直径」，而是<strong>给每个点都算出偏心距</strong>（二次扫描逐点求最远），两页互补——先在 F 学会「一条最长链」，再来这里学「每点的最远」。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">两遍扫描：向下最长链 + 向上最长链</h2>
        <div className="prose">
          <p>
            <strong>第一遍 · 后序，求「向下最长链」。</strong>对每个点 <M>{'u'}</M>，记它子树内向下的<strong>最长链 <M>{'\\mathrm{down1}[u]'}</M></strong> 和<strong>次长链 <M>{'\\mathrm{down2}[u]'}</M></strong>
            （次长必须来自与最长<strong>不同的孩子</strong>）。为什么要次长？换根时可能要「避开某个孩子」，届时就得退而求其次。
          </p>
          <p>
            <strong>第二遍 · 前序，求「向上最长链」。</strong>孩子 <M>{'v'}</M> 经父 <M>{'u'}</M> 往上能走多远？
            两条候选：走 <M>{'u'}</M> 自己的向上链 <M>{'\\mathrm{up}[u]'}</M>，或走 <M>{'u'}</M> 的<strong>「避开 <M>{'v'}</M> 那支」的向下最长链</strong>——
            若 <M>{'v'}</M> 恰是贡献 <M>{'\\mathrm{down1}[u]'}</M> 的那个孩子，就只能用 <M>{'\\mathrm{down2}[u]'}</M>，否则用 <M>{'\\mathrm{down1}[u]'}</M>。取较大再加这条边：
          </p>
          <MB>{'\\mathrm{up}[v]=\\max\\big(\\mathrm{up}[u],\\ \\mathrm{down\\text{-}except}_v[u]\\big)+w(u,v)'}</MB>
          <p>合成偏心距：</p>
          <MB>{'\\mathrm{ecc}[u]=\\max\\big(\\mathrm{down1}[u],\\ \\mathrm{up}[u]\\big)'}</MB>
        </div>
        <figure className="figure">
          <InOutFigure />
          <figcaption className="figure__cap">
            和内外合并同构：down（子树内向下）第一遍备好，up（父方向向上）第二遍由父传子。偏心距取两者较大。
          </figcaption>
        </figure>
        <InfoBox kind="key" title="本质">
          「每点偏心距」就是「每点的最远」这个换根问题。第一遍备好<strong>向下最长/次长两条链</strong>，
          第二遍把<strong>向上最长链</strong>沿边传下去；「避开自己那支」正是换根一贯的<strong>「父贡献减去本孩子子树」</strong>——
          只不过这里的聚合是取 <M>{'\\max'}</M> 而非求和。有了每点偏心距，中心 / 半径 / 直径一并落袋。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            主链 <M>{'1-2-3-4-5'}</M> 加一个分支 <M>{'3-6'}</M>（无权）。固定根 1，逐步：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第一遍 down1。</b>叶子 5、6 的 <M>{'\\mathrm{down1}=0'}</M>；<M>{'\\mathrm{down1}[4]=1,\\ \\mathrm{down1}[3]=\\max(1{+}1,\\,0{+}1)=2'}</M>（走 4 那支）；
              <M>{'\\mathrm{down1}[2]=3,\\ \\mathrm{down1}[1]=4'}</M>。点 3 的 <M>{'\\mathrm{down2}[3]=1'}</M>（来自分支 6）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>根 up = 0。</b><M>{'\\mathrm{up}[1]=0'}</M>，<M>{'\\mathrm{ecc}[1]=\\max(4,0)=4'}</M>（最远到点 5）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>换根往下传 up。</b><M>{'\\mathrm{up}[2]=\\max(\\mathrm{up}[1],\\,0)+1=\\max(0,0)+1=1'}</M>（式中第二项 <M>{'0'}</M> = 节点 1 避开 2 那支的向下最长链）；
              <M>{'\\mathrm{up}[3]=\\max(\\mathrm{up}[2],0)+1=2'}</M>；<M>{'\\mathrm{ecc}[3]=\\max(\\mathrm{down1}[3],\\mathrm{up}[3])=\\max(2,2)=2'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>找中心。</b>算完全部：偏心距为 <M>{'\\mathrm{ecc}=[4,3,2,3,4,3]'}</M>，最小在<strong>点 3</strong>（<M>{'\\mathrm{ecc}=2'}</M>）——
              树的中心，半径 2；最大偏心距 4 = 直径长度。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面点任一节点，看它的偏心距如何由<strong>向下 down 与向上 up 两支较量</strong>决出，绿圈标出全树中心。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看每点偏心距与中心</h2>
        <div className="demo">
          <div className="demo__body">
            <RerootEccDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">逐点统计是换根的通用形</h2>
        <div className="prose">
          <p>
            回头看：距离和、距离分层点权和、偏心距——它们表面差别很大，但换根的<strong>骨架完全一样</strong>：
            第一遍后序把「子树内的某个聚合」备好，第二遍前序用「<strong>父的信息减去本孩子那份，再沿边合并</strong>」把「子树外」补齐，
            每点答案 = 内 + 外。变的只是<strong>聚合方式</strong>：求和（距离和 / 点权和）还是取 <M>{'\\max'}</M>（偏心距）。
          </p>
          <p>
            像「医院设置」（<M>{'n\\le100'}</M>）这类，本质就是<strong>逐点距离和统计</strong>：换根一遍求出每个点作医院的总代价，再取最优。
            换根让你把「对每个候选点各评估一次」的 <M>{'O(n^2)'}</M> 收成 <M>{'O(n)'}</M>——这正是换根 DP 最通用的用途。
          </p>
        </div>
        <InfoBox kind="warn" title="易错点">
          求偏心距务必维护<strong>次长链 <M>{'\\mathrm{down2}'}</M></strong> 与「贡献最长链的孩子编号」：换根到那个孩子时必须<strong>避开它自己</strong>、改用次长，否则会把「自己走出去又走回来」的假链算进最远。
          「避开自己那支」是所有 <M>{'\\max'}</M> 型换根的通病，格外小心。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1099" name="[NOIP2007 提高组] 树网的核" src="NOIP 2007" diff="提高+/省选-">
          <Field k="题意">
            在树的某条<strong>直径</strong>上取一段长度不超过 <M>{'s'}</M> 的路径（「核」），使<strong>全树到这段核的最大距离（偏心距）最小</strong>。
          </Field>
          <Field k="换个视角（本页站换根/逐点偏心距）">
            本题集<strong>直径 + 中心 + 最小偏心距</strong>于一身。<strong>直径三件套的完整推导在{' '}
            <Link to="/part/f/diameter" style={{ color: 'var(--accent-2)' }}>F 部分·直径 / 重心 DP</Link></strong>；
            这里我们用换根的眼光看它的另一半——<strong>二次扫描求「每个点到最远点的距离」</strong>（偏心距），
            为「核」的偏心量评估提供逐点数据。两页互补：F 讲怎么求出那条最长链，本页讲怎么对每个点都得到偏心距。
          </Field>
          <Field k="转移 · 复杂度">
            两遍 DFS 求 <M>{'\\mathrm{down1}/\\mathrm{down2}/\\mathrm{up}'}</M> → 每点 <M>{'\\mathrm{ecc}[u]=\\max(\\mathrm{down1}[u],\\mathrm{up}[u])'}</M>；
            结合直径上滑动取核，整体 <M>{'O(n)'}</M>～<M>{'O(n\\log n)'}</M>。
          </Field>
          <Field k="参考代码（换根求每点偏心距 · 中心与半径）">
            <CodeBlock code={CODE_ECC} luogu="P1099" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1364" name="医院设置" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">带居民数的树，选一点设医院使加权距离和最小。</Field>
          <Field k="为什么再选它">
            换根「<strong>逐点统计</strong>」用途的最小样例：一遍换根算出<strong>每个点</strong>作医院的距离和，再逐点取最优。
            <M>{'n\\le100'}</M>，还能与 <M>{'O(n^2)'}</M> 暴力对拍，收束整个 E 部分「每点一个答案」的主线。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[v]=f[u]+(W-2\\,\\mathrm{sz}[v])'}</M> 逐点求距离和；两遍 DFS，<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（换根逐点距离和）">
            <CodeBlock code={CODE_P1364} luogu="P1364" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P3574"
          name="[POI2014] FAR-FarmCraft"
          hint="拔高：遍历顺序 + 换根最小化『最晚装好』的瓶颈。子树内先算最优遍历代价，换根定每点作起点的答案。"
        />
        <Exercise pid="P1364" name="医院设置" hint="先写 O(n²) 暴力拿分，再换根 O(n) 对拍——亲手确认逐点统计的两法一致。" />
        <Exercise pid="P1099" name="[NOIP2007 提高组] 树网的核" hint="自测：先按 F 部分求出直径与每点偏心距，再在直径上滑动窗口取长度≤s 的核。" />
      </section>

    </>
  )
}
