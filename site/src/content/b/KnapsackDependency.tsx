import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick, Network } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackDependencyDemo from '../../components/demos/knapsack/KnapsackDependencyDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { DepSetupFigure, DepReduceFigure, DepTransitionFigure } from './KnapsackDependencyArt'

const CODE_P1064 = `
#include <iostream>
#include <algorithm>
using namespace std;

int mw[65], mv[65];             // 主件的费用、价值(=价格×重要度)
int aw[65][3], av[65][3];       // 每个主件的附件(至多 2 个)：费用、价值
int cnt[65];                    // 每个主件挂了几个附件
long long f[32005];             // f[j]：花费不超过 j 时的最大 价格×重要度 之和

int main()
{
    int n, m;
    cin >> n >> m;              // n=总钱数，m=物品数
    for (int i = 1; i <= m; i++)
    {
        int v, p, q;
        cin >> v >> p >> q;     // v=价格, p=重要度(1~5), q=0 主件 / 否则=所属主件编号
        if (q == 0)             // 是主件
        {
            mw[i] = v;
            mv[i] = v * p;
        }
        else                    // 是附件，挂到主件 q 上
        {
            aw[q][cnt[q]] = v;
            av[q][cnt[q]] = v * p;
            cnt[q]++;
        }
    }

    for (int i = 1; i <= m; i++)    // 逐个主件，当作「一组」
    {
        if (mw[i] == 0) continue;   // i 不是主件(是附件或不存在)，跳过
        for (int j = n; j >= mw[i]; j--)    // ★倒序：组内至多选一个组合
        {
            // 枚举本主件的合法组合(含主件)，对附件的每个子集取一遍
            for (int s = 0; s < (1 << cnt[i]); s++)
            {
                int w = mw[i], val = mv[i];         // 组合恒含主件
                for (int k = 0; k < cnt[i]; k++)
                    if (s >> k & 1)                 // 该附件入选
                    {
                        w += aw[i][k];
                        val += av[i][k];
                    }
                if (j >= w)
                    f[j] = max(f[j], f[j - w] + val);
            }
        }
    }

    cout << f[n] << endl;
    return 0;
}`

export default function KnapsackDependency() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当「选它」得先「选它的主件」</h2>
        <div className="prose">
          <p>
            先看一个具体场景：有一件<strong>主件</strong> <M>{'(w,v)=(2,3)'}</M>，还有它的两件<strong>附件</strong>——
            附件 1 <M>{'(2,4)'}</M>、附件 2 <M>{'(3,5)'}</M>，一个容量 <M>{'W=7'}</M> 的背包。规则多了一条硬约束：
            <strong>附件必须依附主件而选</strong>——想装附件 1，就<strong>必须先把主件也装上</strong>；主件不装，两个附件都是<strong>非法</strong>的。目标仍是不超重下让<strong>总价值最大</strong>。
          </p>
        </div>
        <figure className="figure">
          <DepSetupFigure />
          <figcaption className="figure__cap">1 个主件 + 2 个附件：虚线是「依赖」——附件指向主件，选附件的前提是先选主件。</figcaption>
        </figure>
        <div className="prose">
          <p>
            很自然会想：把主件、附件 1、附件 2 当成<strong>三件独立的 01 物品</strong>丢进背包不就行了？<strong>不行。</strong>
            普通 01 背包会毫不客气地<strong>只挑附件 1、不挑主件</strong>（附件 1 性价比高），可这在依赖规则里是非法的——它<strong>压根不知道「附件得先有主件」这回事</strong>。
            反过来，也没法用「先强制装主件再随便挑附件」蒙混：主件到底装不装、装了之后还剩多少钱给附件，本身就是要一起权衡的决策。
          </p>
          <p>
            那把「主件带哪些附件」的所有情形枚举出来呢？主件要么不装；一旦装，它的两个附件各可带可不带——<strong>仅主 / 主+附1 / 主+附2 / 主+附1+2</strong>，加上「整个不装」，就把这一族物品的<strong>合法方案全数罗列</strong>了。这份枚举，正是打开依赖背包的钥匙。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">归约：把「主 + 附件子集」打包成组</h2>
        <div className="prose">
          <p>
            盯住上面那句枚举。一个主件带上它附件的<strong>某个子集</strong>，就构成一个<strong>合法组合</strong>；每个组合的<strong>费用</strong> = 主件费用 + 所选附件费用之和，<strong>价值</strong> = 各自价值之和。
            本例主件 <M>{'(2,3)'}</M> 配两个附件，附件子集有 <M>{'2^2=4'}</M> 种，于是得到 4 个组合：
          </p>
        </div>
        <figure className="figure">
          <DepReduceFigure />
          <figcaption className="figure__cap">
            主件 + 附件子集枚举成 4 个组合：仅主(2,3)、主+附1(4,7)、主+附2(5,8)、主+附1+2(7,12)。它们归为同一组，组内至多选一个。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            关键的一跃在这里：这 4 个组合<strong>互斥</strong>——你不可能同时「只带附件 1」又「两个附件都带」，一个主件<strong>最终只能落实成其中一种方案</strong>（或整个不选）。这正是
            <Link to="/part/b/group" style={{ color: 'var(--accent-2)' }}>分组背包</Link>的定义：<strong>把这些组合归为同一组，组内至多选一个</strong>。
          </p>
          <p>
            于是<strong>有依赖的背包，被归约成了分组背包</strong>——一个主件（连同它的附件）= 一组，组内物品 = 该主件的各个合法组合。为什么必须走这条「枚举组合」的路、而不能把附件当独立物品？因为独立物品会漏掉
            <strong>「选附件必先选主件」</strong>这条约束；而<strong>把主件焊进每个组合里</strong>，就让「带附件」永远伴随「带主件」，约束天然成立。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：落到分组背包</h2>
        <div className="prose">
          <p>
            既然归约成了分组背包，转移就直接<strong>套分组背包那一套</strong>。设 <M>{'f[j]'}</M> 为花费不超过 <M>{'j'}</M> 时的最大价值，逐个主件（每个当一组）更新。
            处理某个主件这一组时，一格 <M>{'f[j]'}</M> 有两条来路：
          </p>
        </div>
        <figure className="figure">
          <DepTransitionFigure />
          <figcaption className="figure__cap">每格 f[j] 两条路：不选本组(这个主件一带都不要)，或在组内枚举某个组合 c 取 max。两条路都基于本组处理前的旧值。</figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>不选本组</strong>：这个主件连同附件一概不要，价值就是处理本组<strong>之前</strong>的 <M>{'f[j]'}</M>。
          </p>
          <p>
            <strong>选组内某个组合 <M>{'c'}</M></strong>（费用 <M>{'w_c'}</M>、价值 <M>{'v_c'}</M>，需 <M>{'j\\ge w_c'}</M>）：腾出 <M>{'w_c'}</M>，剩下的 <M>{'j-w_c'}</M> 交给之前的最优，再加上 <M>{'v_c'}</M>。究竟选哪个组合？<strong>把每个组合都试一遍取最好</strong>。合起来就是分组背包的转移：
          </p>
          <MB>{'f[j]=\\max\\Big(f[j],\\ \\max_{c\\,\\in\\,G,\\ w_c\\le j}\\big(f[j-w_c]+v_c\\big)\\Big)'}</MB>
          <p>
            一维写法照分组背包：<strong>外层枚举主件（组）、中层容量 <M>{'j'}</M> 倒序、内层枚举本组的各个组合</strong>。容量倒序保证组内各组合都基于「本组尚未出手」的旧值——<strong>一组至多落实一个组合</strong>，正好对应「一个主件最终只有一种方案」。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          有依赖的背包 = 分组背包的一个<strong>实例</strong>。诀窍全在<strong>建组</strong>：把「一个主件 + 它附件的任一子集」枚举成组内物品，用<strong>「组合恒含主件」</strong>把「选附件必先选主件」这条依赖，化进了物品的定义里。归约完成后，转移与循环顺序<strong>一字不差地照搬</strong>
          <Link to="/part/b/group" style={{ color: 'var(--accent-2)' }}>分组背包</Link>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用本例（主件 <M>{'(2,3)'}</M>、附件 <M>{'(2,4)'}</M> 与 <M>{'(3,5)'}</M>，容量 7）走一遍，重点盯住<strong>枚举组合 → 组内取一个</strong>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>枚举组合。</b> 主件配两个附件，得 4 个组合：仅主 <M>{'(2,3)'}</M>、主+附1 <M>{'(4,7)'}</M>、主+附2 <M>{'(5,8)'}</M>、主+附1+2 <M>{'(7,12)'}</M>。四者归为同一组，至多选一个。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>地基。</b> 处理这一组之前，任何容量下 <M>{'f[j]=0'}</M>（什么都还没装）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>看容量 4。</b> 装得下的组合有「仅主」<M>{'(2,3)'}</M> 与「主+附1」<M>{'(4,7)'}</M>：分别 = <M>{'f[4-2]+3=3'}</M>、<M>{'f[4-4]+7=7'}</M>。取较大 → <M>{'f[4]=7'}</M>（主+附1）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>看容量 7（读答案）。</b> 四个组合都装得下，其中「主+附1+2」<M>{'(7,12)'}</M> 给出 <M>{'f[7-7]+12=12'}</M>，压过其余。<M>{'f[7]=12'}</M>——正是主件带上两个附件全装，价值 <M>{'3+4+5=12'}</M>，恰好占满容量 7。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会先亮出 4 个组合的（费用, 价值），再把这一组的分组转移<strong>逐格跑一遍</strong>。改主件或附件的 <M>{'w,v'}</M>、改容量，看组合与表格实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它把依赖枚成组、再逐格转移</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackDependencyDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化：附件多了、依赖连成了树</h2>
        <div className="prose">
          <p>
            本例每个主件只挂 2 个附件，枚举 <M>{'2^2=4'}</M> 个组合毫无压力。<strong>P1064</strong> 正是这种「主件 + 至多 2 附件」的教科书原型——每个主件最多 4 个组合，直接枚举即可。
            但依赖可以更深：如果<strong>附件本身又能挂自己的附件</strong>，依赖关系就从「主-附两层」长成了一棵<strong>树</strong>（甚至一片森林）。
          </p>
          <p>
            <strong>P2014 选课</strong>就是这样：一门课可能有<strong>先修课</strong>，要选它必先选先修——先修关系把课程连成<strong>树</strong>。这时「枚举一个节点的所有后代子集」会指数爆炸，不能再照搬本页的暴力枚举，而要在树上做 DP：
            <M>{'f[u][j]'}</M> 表示<strong>以 <M>{'u'}</M> 为根的子树、选课数（或容量）为 <M>{'j'}</M></strong> 时的最优，把子树当分组、在各子树间做背包合并。
          </p>
        </div>
        <InfoBox kind="key" title="承接：依赖成树 → 树上背包">
          「主件-附件」是依赖背包最浅的两层形态，归约成分组背包即可解。当依赖<strong>连成树/森林</strong>（如 P2014 选课的先修关系），它一般化为<strong>树上背包（树形 DP）</strong>——那是
          <Link to="/part/f" style={{ color: 'var(--accent-2)' }}>F 部分</Link>的主题。本页只点到「依赖成树」这一形态，树形转移的细节留到那里展开。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1064" name="[NOIP2006 提高组] 金明的预算方案" src="NOIP2006 提高组" diff="提高+/省选-">
          <Field k="题意">
            总钱数 <M>{'n'}</M>，<M>{'m'}</M> 件物品，每件给出价格 <M>{'v'}</M>、重要度 <M>{'p(1\\sim5)'}</M>、以及归属 <M>{'q'}</M>（<M>{'q=0'}</M> 为主件，否则表示它是第 <M>{'q'}</M> 号主件的附件）。每个主件<strong>至多 2 个附件</strong>，选附件必先选其主件。求 <M>{'\\sum v\\times p'}</M> 的最大值。
          </Field>
          <Field k="对应关系">
            「价格」= 费用 <M>{'w'}</M>，「<M>{'v\\times p'}</M>」= 价值，「总钱数 <M>{'n'}</M>」= 容量。<strong>每个主件 = 一组</strong>，枚举 <strong>仅主 / 主+附1 / 主+附2 / 主+附1+2</strong> 四种组合作为组内物品——依赖背包归约成分组背包的教科书原型。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[j]=\\max(f[j],\\ f[j-w_c]+v_c)'}</M>，外层枚举主件、中层 <M>{'j'}</M> 倒序、内层枚举本主件的组合（至多 4 个）；时间 <M>{'O(nm)'}</M> 级。
          </Field>
          <Field k="参考代码（枚举组合的分组背包）">
            <CodeBlock code={CODE_P1064} luogu="P1064" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2014" name="[CTSC1997] 选课" src="CTSC1997（洛谷原生 P）" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 门课，每门有学分，部分课有<strong>唯一先修课</strong>（选它必先选先修）。先修关系把课程连成<strong>森林</strong>。选 <M>{'m'}</M> 门课，求最大学分和。
          </Field>
          <Field k="为什么选它（依赖的一般化）">
            它把依赖从「主件-附件两层」推广到<strong>树/森林</strong>：附件还能有自己的附件。此时不能再暴力枚举子集，而要在树上做 DP——<strong>每棵子树当一组，在子树间做背包合并</strong>。是从「依赖背包」跨到「树上背包」的桥梁题。
          </Field>
          <Field k="思路（只点到「依赖成树」）">
            建虚根 <M>{'0'}</M> 把森林并成一棵树，选课总数 <M>{'m'}</M> 相应 <M>{'+1'}</M>。树形背包 <M>{'f[u][j]'}</M> = 子树 <M>{'u'}</M> 选 <M>{'j'}</M> 门的最大学分，逐棵子树做分组合并。<strong>本页不展开树形转移细节</strong>，完整做法见 <Link to="/part/f" style={{ color: 'var(--accent-2)' }}>F 部分 · 树上背包</Link>。
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <p className="prose" style={{ maxWidth: 'none', fontSize: '13.5px', color: 'var(--text-3)', marginBottom: 'var(--sp-4)' }}>
          说明：有依赖的背包<strong>原生题池很窄</strong>，几乎以 <strong>P1064</strong>（主件-附件两层）与 <strong>P2014</strong>（依赖成树）为双核。下面给两层依赖的 P1064 夯实归约；更一般的<strong>树上依赖</strong>（如 P2014 选课）在 <Link to="/part/f" style={{ color: 'var(--accent-2)' }}>F 部分树上背包</Link>展开，不在此重复。
        </p>
        <Exercise
          pid="P1064"
          name="[NOIP2006 提高组] 金明的预算方案"
          hint="把每个主件枚举成 仅主 / 主+附1 / 主+附2 / 主+附1+2 四种组合，当作同一组的组内物品，做分组背包（外层主件、中层容量倒序、内层枚举组合）。价值用 价格×重要度。"
        />
        <Exercise
          pid="P2014"
          name="[CTSC1997] 选课"
          hint="进阶：依赖连成森林。建虚根并成一棵树、m+1，做树上背包 f[u][j]（子树间分组合并）。属 F 部分树上背包，本页仅作承接，可先了解「依赖成树」的形态。"
        />
      </section>

      <div className="pointer-cue">
        <Network size={18} />
        依赖背包是<Link to="/part/b/group" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>分组背包</Link>的应用；当依赖长成树，它通向
        <Link to="/part/f" style={{ color: 'var(--accent-1)', fontWeight: 600 }}> F 部分的树上背包</Link>。两条线都从这页的「枚举组合」出发。
      </div>

      <nav className="type-nav">
        <Link to="/part/b/cost2d">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 二维费用背包
          </span>
        </Link>
        <Link to="/part/b/variant" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            背包综合变形 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
