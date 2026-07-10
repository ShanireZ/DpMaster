import { MousePointerClick } from 'lucide-react'
import { M } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import RerootInOutDemo from '../../components/demos/reroot/RerootInOutDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { InOutFigure, TwoPassFigure } from './RerootArt'

const CODE_P3047 = `
#include <iostream>
#include <vector>
using namespace std;

const int N = 100005;
int n, k;
vector<int> g[N];
long long val[N];             // 点权
long long dp[N][21];          // dp[u][j]：只在 u 子树内，距 u 恰为 j 的点权和

// 第一遍：子树内的分层点权和（后序）
void dfs1(int u, int fa)
{
    dp[u][0] = val[u];
    for (int v : g[u])
    {
        if (v == fa) continue;
        dfs1(v, u);
        for (int j = 1; j <= k; j++)
            dp[u][j] += dp[v][j - 1];   // 子树 v 里距 v 为 j-1 的点，距 u 就是 j
    }
}

// 第二遍：换根，把『父方向』的分层点权补进来（前序）
void dfs2(int u, int fa)
{
    for (int v : g[u])
    {
        if (v == fa) continue;
        // ★先扣除重复：父 u 距 j-2 的层里，含了『经 v 又回来』的 dp[v][j-2]
        for (int j = k; j >= 2; j--)
            dp[u][j] -= dp[v][j - 2];   // 撤销自身子树对父这一层的贡献
        for (int j = 1; j <= k; j++)
            dp[v][j] += dp[u][j - 1];   // 再把父方向（此刻的 dp[u]）下推给 v
        // 复原 dp[u]，供 u 的其它孩子换根时仍是『完整的 u』
        for (int j = 2; j <= k; j++)
            dp[u][j] += dp[v][j - 2];
        dfs2(v, u);
    }
}

int main()
{
    cin >> n >> k;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    for (int i = 1; i <= n; i++) cin >> val[i];

    dfs1(1, 0);
    dfs2(1, 0);

    for (int i = 1; i <= n; i++)
    {
        long long s = 0;
        for (int j = 0; j <= k; j++) s += dp[i][j];   // 距 i 不超过 k 的点权和
        cout << s << endl;
    }
    return 0;
}`

export default function RerootInOut() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">每个点的答案 = 子树内 + 子树外</h2>
        <div className="prose">
          <p>
            前两节的距离和，换根系数是一句 <M>{'n-2\\,\\mathrm{sz}'}</M> 就搞定的<strong>标量</strong>。但很多换根题的「答案」是一个更复杂的东西——
            比如 <strong>「距离不超过 <M>{'k'}</M> 的点权和」</strong>，它天然分成两截：
          </p>
          <p>
            固定一个根后，任一点 <M>{'u'}</M> 的答案 = <strong>子树内贡献 <M>{'\\mathrm{down}[u]'}</M></strong>（<M>{'u'}</M> 往下的部分）
            + <strong>子树外贡献 <M>{'\\mathrm{up}[u]'}</M></strong>（<M>{'u'}</M> 经父亲往「树的其余部分」的那截）。
            子树内的一截，第一遍后序就能直接算；难点全在<strong>子树外那一截怎么 <M>{'O(1)'}</M> 补上</strong>。
          </p>
        </div>
        <figure className="figure">
          <InOutFigure />
          <figcaption className="figure__cap">
            u 的答案分两块：向下的 down[u]（第一遍后序备好）+ 父方向的 up[u]（第二遍前序由父传子补上）。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">父贡献减去「自己那一份」：换根的核心操作</h2>
        <div className="prose">
          <p>
            换根到孩子 <M>{'v'}</M> 时，它的「子树外」<M>{'\\mathrm{up}[v]'}</M> 要从父亲 <M>{'u'}</M> 借。
            但不能直接把 <M>{'u'}</M> 的全部信息给 <M>{'v'}</M>——因为 <M>{'u'}</M> 的信息里，<strong>有一部分正是「朝着 <M>{'v'}</M> 这棵子树」的</strong>，
            对 <M>{'v'}</M> 来说那属于「子树内」，会重复计算。
          </p>
          <p>核心操作就一句话：</p>
          <p style={{ textAlign: 'center', fontWeight: 600, margin: 'var(--sp-3) 0', color: 'var(--text-1)' }}>
            父方向给 <M>{'v'}</M> 的贡献 = （父 <M>{'u'}</M> 的完整信息） − （朝 <M>{'v'}</M> 子树的那一份）
          </p>
          <p>
            以「距离分层点权和」<M>{'dp[u][j]'}</M>（子树内距 <M>{'u'}</M> 恰为 <M>{'j'}</M> 的点权和）为例，换根 <M>{'u\\to v'}</M> 分三步：
          </p>
        </div>
        <figure className="figure">
          <TwoPassFigure />
          <figcaption className="figure__cap">
            仍是两遍 DFS：第一遍后序把每层的子树内点权和堆好，第二遍前序换根时「先扣重复、再合并、后复原」。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>① 扣重复：</strong>父 <M>{'u'}</M> 距 <M>{'j'}</M> 的层里，混进了「从 <M>{'u'}</M> 走到 <M>{'v'}</M> 再拐回 <M>{'v'}</M> 子树、距 <M>{'j-2'}</M>」的点，即 <M>{'dp[v][j-2]'}</M>；先减掉。<br />
            <strong>② 合并下推：</strong>此刻的 <M>{'dp[u][\\cdot]'}</M> 已是「<M>{'v'}</M> 看出去的父方向」，把它的 <M>{'j-1'}</M> 层加到 <M>{'dp[v][j]'}</M>——父方向的点距 <M>{'v'}</M> 要多走一步。<br />
            <strong>③ 复原：</strong>把 ① 减掉的加回去，让 <M>{'dp[u]'}</M> 恢复成「完整的 <M>{'u'}</M>」，供 <M>{'u'}</M> 的<strong>其它孩子</strong>换根时继续用。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          子树内外合并型换根，把 <strong>「父的完整信息」减去「本孩子子树贡献」</strong> 得到父方向，再合并进孩子——
          这就是「<M>{'\\mathrm{up}[v]'}</M> 由 <M>{'u'}</M> 回推」的一般套路。第一遍备好<strong>子树内</strong>，第二遍用「减一份、加一层、复原」把<strong>子树外</strong>沿边传下去。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用<strong>距离和</strong>把「内 + 外」看清楚（它是分层点权和最简的一维版）。链 <M>{'1-2-3'}</M>，无权，固定根 1：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>第一遍 down（子树内距离和）。</b><M>{'\\mathrm{down}[3]=0'}</M>（叶）；<M>{'\\mathrm{down}[2]=\\mathrm{down}[3]+\\mathrm{sz}[3]=0+1=1'}</M>；
              <M>{'\\mathrm{down}[1]=(\\mathrm{down}[2]+\\mathrm{sz}[2])=1+2=3'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>根的 up = 0。</b>根没有子树外，<M>{'\\mathrm{up}[1]=0'}</M>，故 <M>{'\\mathrm{dist}[1]=\\mathrm{down}[1]+\\mathrm{up}[1]=3'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>换根 1→2，补 up[2]。</b>父 1 的「除去 2 子树」= 只剩点 1 自己。它距 2 为 1，且这条边外还有 <M>{'\\mathrm{sz}[1]-\\mathrm{sz}[2]=1'}</M> 个点。
              于是 <M>{'\\mathrm{up}[2]=\\mathrm{up}[1]+2=0+2=2'}</M>（式中 <M>{'+2'}</M> 即扣掉节点 2 子树后剩下的量），<M>{'\\mathrm{dist}[2]=\\mathrm{down}[2]+\\mathrm{up}[2]=1+2=3'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>换根 2→3。</b>同理 <M>{'\\mathrm{up}[3]'}</M> 把「除 3 子树的其余两点」补进来，<M>{'\\mathrm{dist}[3]=\\mathrm{down}[3]+\\mathrm{up}[3]=0+4=4'}</M>。
              与直接换根系数法算出的 <M>{'3,3,4'}</M> 完全一致——两种视角同解。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示固定根后，点任一点就把它的距离和<strong>拆成 down（子树内，青）+ up（子树外，父方向）</strong>两块，直观看「父方向 = 全局 − 自身子树」。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看「内 + 外」怎么拼出答案</h2>
        <div className="demo">
          <div className="demo__body">
            <RerootInOutDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">多一维状态：距离分层</h2>
        <div className="prose">
          <p>
            「距离 <M>{'\\le k'}</M> 的点权和」比标量距离和多一维：<M>{'dp[u][j]'}</M> 记录<strong>子树内距 <M>{'u'}</M> 恰为 <M>{'j'}</M></strong> 的点权和（<M>{'j'}</M> 从 <M>{'0'}</M> 到 <M>{'k'}</M>）。
            第一遍合并子树：<M>{'dp[u][j]\\mathrel{+}=dp[v][j-1]'}</M>（子树 <M>{'v'}</M> 里距 <M>{'v'}</M> 为 <M>{'j-1'}</M> 的点，距 <M>{'u'}</M> 就是 <M>{'j'}</M>）。
          </p>
          <p>
            换根时对<strong>每一层 <M>{'j'}</M></strong> 都做一次「减一份、加一层、复原」。最终点 <M>{'i'}</M> 的答案 = <M>{'\\sum_{j=0}^{k}dp[i][j]'}</M>。
            复杂度 <M>{'O(nk)'}</M>——每条边换根时扫 <M>{'O(k)'}</M> 层。
          </p>
        </div>
        <InfoBox kind="warn" title="易错点">
          换根三步的<strong>顺序与循环方向</strong>是关键：扣重复用 <M>{'dp[v][j-2]'}</M>，下推用 <M>{'dp[u][j-1]'}</M>，两处下标错位不同；
          且「合并下推」会改到 <M>{'dp[v]'}</M>，务必<strong>先扣父、再推子、最后复原父</strong>，否则同一个父的多个孩子会互相污染。
          分层数组第二维只需开到 <M>{'k+1'}</M>（本题 <M>{'k\\le20'}</M>）。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P3047" name="[USACO12FEB] Nearby Cows G" src="USACO 2012" diff="提高+/省选-">
          <Field k="题意">
            树上每点有点权，给定 <M>{'k'}</M>，对<strong>每个点</strong>求「距它不超过 <M>{'k'}</M> 的所有点的点权和」。
          </Field>
          <Field k="为什么选它">
            子树内外合并的<strong>标准训练题</strong>：状态 <M>{'dp[u][j]'}</M> 按距离分层，换根必须做「<strong>父贡献减去自身子树贡献</strong>」这一核心操作，
            把「内 + 外」讲得最透。<M>{'k\\le20'}</M> 让分层维很小，focus 在换根逻辑本身。
          </Field>
          <Field k="转移 · 复杂度">
            合并 <M>{'dp[u][j]\\mathrel{+}=dp[v][j-1]'}</M>；换根「减 <M>{'dp[v][j-2]'}</M>、加 <M>{'dp[u][j-1]'}</M>、复原」；答案 <M>{'\\sum_j dp[i][j]'}</M>；<M>{'O(nk)'}</M>。
          </Field>
          <Field k="参考代码（分层换根 · 减一份/加一层/复原）">
            <CodeBlock code={CODE_P3047} luogu="P3047" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1395" name="会议" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">树上选一点，使所有点到它的距离和最小。</Field>
          <Field k="换个视角">
            换个角度重看第一节的「会议」：把每点距离和写成 <M>{'\\mathrm{dist}[u]=\\mathrm{down}[u]+\\mathrm{up}[u]'}</M>，
            <M>{'\\mathrm{down}'}</M> 第一遍后序求，<M>{'\\mathrm{up}[v]'}</M> 由父回推——正是「子树外距离回推」的最简一维实例。
            它和「换根系数 <M>{'n-2\\,\\mathrm{sz}'}</M>」是同一件事的两种写法，互相印证。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'\\mathrm{down}[u]=\\sum(\\mathrm{down}[v]+\\mathrm{sz}[v])'}</M>；<M>{'\\mathrm{up}[v]=\\mathrm{up}[u]+(\\mathrm{down}[u]-(\\mathrm{down}[v]+\\mathrm{sz}[v]))+(n-\\mathrm{sz}[v])'}</M>；<M>{'O(n)'}</M>。
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P6419"
          name="[COCI2014-2015#1] Kamp"
          hint="拔高：每点作起点送客到所有关键点的最短耗时，内外两遍换根 + 『来回一条边只走单程』的直径式修正。"
        />
        <Exercise pid="P1395" name="会议" hint="用 down/up 分解重写一遍，和换根系数法对拍——两种视角结果必须一致。" />
        <Exercise pid="P3478" name="[POI2008] STA-Station" hint="深度和最大：同样可拆成 down + up，验证换根不止一种推法。" />
      </section>

    </>
  )
}
