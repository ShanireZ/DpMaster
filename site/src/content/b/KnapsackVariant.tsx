import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackVariantDemo from '../../components/demos/knapsack/KnapsackVariantDemo'
import VariantUndoDemo from '../../components/demos/knapsack/VariantUndoDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { OperatorSwapFigure, CountBuildFigure, UndoFigure } from './KnapsackVariantArt'

const CODE_P1164 = `
#include <iostream>
using namespace std;

int a[105];
long long f[10005];          // f[j]：恰好花 j 元的方案数（方案数常爆 int，用 long long）

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> a[i];

    f[0] = 1;                           // ★地基：花 0 元有 1 种方案（什么都不点）
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= a[i]; j--) // 倒序：每道菜至多点一次（01）
            f[j] += f[j - a[i]];        // ★把 max 换成累加，就从「求最优」变「数方案」

    cout << f[m] << endl;
    return 0;
}`

const CODE_P4141 = `
#include <iostream>
using namespace std;

const int MOD = 10;
int w[2005];
int f[2005], g[2005];        // f：含全部物品的方案数；g：撤销某件后的临时方案数

int main()
{
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> w[i];

    f[0] = 1;                           // 全集方案数：标准计数背包
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= w[i]; j--) // 加它：倒序
            f[j] = (f[j] + f[j - w[i]]) % MOD;

    for (int i = 1; i <= n; i++)        // 逐个「消失」的物品 i
    {
        for (int j = 0; j <= m; j++)
            g[j] = f[j];                // 从全集出发

        for (int j = w[i]; j <= m; j++) // ★退它：正序，方向与加时相反
            g[j] = (g[j] - g[j - w[i]] + MOD) % MOD;   // 逆操作：把第 i 件的贡献减掉

        for (int j = 1; j <= m; j++)    // 缺第 i 件时，体积 j 的方案数
            cout << g[j];
        cout << endl;
    }
    return 0;
}`

export default function KnapsackVariant() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从「求最值」到「换一个聚合算子」</h2>
        <div className="prose">
          <p>
            到这里，背包的<strong>容量骨架</strong>已经很熟：枚举物品、逐容量转移、一维 <M>{'f[j]'}</M> 由 <M>{'f[j-w]'}</M> 推来。
            前面几类都在问同一件事——<strong>价值最大是多少</strong>，所以转移里坐着一个 <M>{'\\max'}</M>。可现实里的问题未必都求最优：
            「恰好花光 <M>{'m'}</M> 元有<strong>多少种</strong>点法？」「这堆砝码<strong>能不能</strong>称出重量 <M>{'j'}</M>？」
          </p>
        </div>
        <figure className="figure">
          <OperatorSwapFigure />
          <figcaption className="figure__cap">容量骨架原封不动，只换掉中间的聚合算子：max 得最优、+ 得方案数、|| 得可行性——同一套表，三种问题。</figcaption>
        </figure>
        <div className="prose">
          <p>
            关键洞察是：<strong>背包的骨架和「求什么」是解耦的</strong>。把转移中的 <M>{'\\max'}</M> 换成<strong>加法 <M>{'+'}</M></strong>，
            <M>{'f[j]'}</M> 的含义就从「最大价值」变成「凑出 <M>{'j'}</M> 的方案数」；换成<strong>逻辑或 <M>{'\\lor'}</M></strong>，就变成「<M>{'j'}</M> 能否被凑出」的布尔判定。
            物品怎么取、循环怎么转，一个字都不用改。这一节就把最常考的一支——<strong>方案数背包</strong>——讲透，再看它的一个漂亮延伸：<strong>撤销</strong>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">方案数：把 max 换成加法，f[0] 换成 1</h2>
        <div className="prose">
          <p>
            设 <M>{'f[j]'}</M> 表示<strong>恰好装满容量 <M>{'j'}</M> 的方案数</strong>。对第 <M>{'i'}</M> 件物品（重量 <M>{'w_i'}</M>），
            凑出 <M>{'j'}</M> 的方案分两类：<strong>不含它</strong>——数目已记在旧的 <M>{'f[j]'}</M> 里；<strong>含它</strong>——先把它占的 <M>{'w_i'}</M> 抠掉，
            剩下的 <M>{'j-w_i'}</M> 由前面的物品去凑，方案数正是 <M>{'f[j-w_i]'}</M>。两类<strong>不重不漏</strong>，加起来就是新的 <M>{'f[j]'}</M>：
          </p>
          <MB>{'f[j] \\mathrel{+}= f[j-w_i]\\qquad (j:\\,m\\to w_i)'}</MB>
          <p>
            和 01 背包一样<strong>倒序</strong>——每件至多计入一次，倒序让 <M>{'f[j-w_i]'}</M> 停在「这件还没参与」的旧值上。真正的分水岭在<strong>初值</strong>：
          </p>
          <MB>{'f[0]=1,\\qquad f[j]=0\\ (j>0)'}</MB>
          <p>
            为什么 <M>{'f[0]=1'}</M>？因为「凑出容量 0」有且只有<strong>一种</strong>办法——<strong>什么都不装</strong>（空方案）。这个 1 是所有计数的<strong>种子</strong>：
            它顺着 <M>{'\\mathrel{+}='}</M> 一路传播，每落到一个能被凑出的容量，就点亮一种新组合。若把它写成 0，整张表会永远是 0，一种方案也数不出来。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 算子决定问题，骨架不动">
          背包框架回答的是「用这些物品凑容量」这件事本身；<strong>把结果如何聚合，是另一个正交的维度</strong>。
          <M>{'\\max'}</M>（最优）、<M>{'+'}</M>（计数）、<M>{'\\lor'}</M>（可行）只是同一骨架上换插头。
          计数型的两处硬改动就记死：<strong><M>{'\\max\\to +'}</M></strong>、<strong><M>{'f[0]=1'}</M></strong>。
        </InfoBox>
        <div className="prose">
          <p>
            还有一个常混的点：<strong>「恰好装满」</strong>还是<strong>「不超过」</strong>？看你把种子撒在哪、答案读哪格。
            要「恰好装满 <M>{'m'}</M>」，就只让 <M>{'f[0]=1'}</M>（唯一合法的空起点），答案读 <M>{'f[m]'}</M>；
            若问「总重不超过 <M>{'m'}</M> 的方案数」，则把 <M>{'f[0..m]'}</M> 全设成 1（任何容量都允许「空着」），或最后对 <M>{'f[0..m]'}</M> 求和。本页例题走的都是「恰好」这一支。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍：两条组合各贡献 1</h2>
        <div className="prose">
          <p>
            用三件物品 <M>{'w=(2,3,5)'}</M>、目标容量 <M>{'5'}</M> 走一遍。手上先想清答案：恰好凑出 5 的子集只有 <M>{'\\{2,3\\}'}</M> 和 <M>{'\\{5\\}'}</M> 两个，所以 <M>{'f[5]'}</M> 该等于 <strong>2</strong>。看表怎么把这 2 数出来：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>撒种子。</b> <M>{'f[0]=1'}</M>，其余 <M>{'f[1..5]=0'}</M>。此刻只有「空方案」这一种被记下。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>放物品 1</b>（<M>{'w=2'}</M>），倒序 <M>{'j:5\\to 2'}</M>。只有 <M>{'f[2]\\mathrel{+}=f[0]=1'}</M> 有效，其余来源都是 0。表变成 <M>{'1,0,1,0,0,0'}</M>——凑出 2 有 1 种（就 <M>{'\\{2\\}'}</M>）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>放物品 2</b>（<M>{'w=3'}</M>），倒序 <M>{'j:5\\to 3'}</M>。<M>{'f[5]\\mathrel{+}=f[2]=1'}</M>（这就是 <M>{'\\{2,3\\}'}</M>！）、<M>{'f[3]\\mathrel{+}=f[0]=1'}</M>。表变成 <M>{'1,0,1,1,0,1'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>放物品 3</b>（<M>{'w=5'}</M>），倒序 <M>{'j:5'}</M>。<M>{'f[5]\\mathrel{+}=f[0]=1'}</M>（这是 <M>{'\\{5\\}'}</M>）。<M>{'f[5]'}</M> 从 1 加到 <strong>2</strong>——两条组合各贡献 1，和手数吻合。
            </div>
          </div>
        </div>
        <figure className="figure">
          <CountBuildFigure />
          <figcaption className="figure__cap">三件全部做完后 f[0..5]=1,0,1,1,0,2：容量 5 由 {'{2,3}'} 与 {'{5}'} 两条路各累加 1，最终方案数 2。</figcaption>
        </figure>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'f[j]'}</M> <strong>逐格累加</strong>给你看，高亮每一步是从哪个 <M>{'f[j-w]'}</M> 加过来的。改物品重量或目标容量，看方案数实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看方案数一格一格叠出来</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackVariantDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化 · 撤销：正难则反，把某件「退」出去</h2>
        <div className="prose">
          <p>
            方案数背包有一个极漂亮的延伸。设想这样的问题（洛谷 P4141「消失之物」）：<M>{'n'}</M> 个物品，
            对<strong>每一个</strong>物品 <M>{'k'}</M>，都要回答「假如第 <M>{'k'}</M> 件<strong>消失</strong>了，凑出体积 <M>{'j'}</M> 的方案数是多少」。
            最笨的办法是抠掉一件、重算一遍整张表，<M>{'n'}</M> 件就是 <M>{'n'}</M> 遍，<M>{'O(n^2 m)'}</M>——太慢。
          </p>
          <p>
            <strong>正难则反</strong>：与其一件件「不放进去」，不如先把<strong>全部物品都放进去</strong>算出全集方案数 <M>{'f[j]'}</M>，
            再针对要消失的那件做一次<strong>逆操作</strong>，把它对 <M>{'f'}</M> 的贡献「<strong>退</strong>」掉。当初加它是 <M>{'f[j]\\mathrel{+}=f[j-w_k]'}</M>，
            那么退它就是它的逆：
          </p>
          <MB>{'g[j] \\mathrel{-}= g[j-w_k]\\qquad (j:\\,w_k\\to m)'}</MB>
        </div>
        <figure className="figure">
          <UndoFigure />
          <figcaption className="figure__cap">先算含全部物品的 g[j]，再对第 k 件逆操作 g[j] −= g[j−w]，得到「缺这件」的方案数。加它倒序、退它正序，方向恰好相反。</figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>方向是这里唯一的陷阱。</strong>回想计数为什么倒序：为了让 <M>{'f[j-w]'}</M> 保持「本件还没加入」的干净旧值。撤销要的恰恰相反——
            算 <M>{'g[j]'}</M> 时，我需要 <M>{'g[j-w_k]'}</M> 已经是<strong>「本件退干净」</strong>的值，这样减出来的 <M>{'g[j]'}</M> 才不含第 <M>{'k'}</M> 件。
            而 <M>{'j-w_k < j'}</M>，所以必须让小下标<strong>先</strong>被退——也就是 <M>{'j'}</M> 从 <M>{'w_k'}</M> <strong>正序</strong>涨到 <M>{'m'}</M>。
            把方向记反，退出来的就是一堆错数。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱 · 撤销的方向与加时相反">
          加一件物品用<strong>倒序</strong>（<M>{'j:m\\to w'}</M>），撤一件物品用<strong>正序</strong>（<M>{'j:w\\to m'}</M>）——这不是可选项，是逆操作的内在要求：
          撤销时 <M>{'g[j]'}</M> 依赖<strong>已经退干净</strong>的 <M>{'g[j-w]'}</M>，故小下标必须先处理。此外别在原数组上直接减（会污染下一件的撤销），
          每次<strong>从全集 <M>{'f'}</M> 拷一份 <M>{'g'}</M> 再退</strong>；带模数时减法记得 <M>{'+\\text{MOD}'}</M> 再取模，避免出现负数。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它把一件「退」出去</h2>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          先看<strong>第一幕</strong>把全部物品倒序累加成全集 <M>{'f[j]'}</M>；再挑「让第几件消失」，<strong>第二幕</strong>会拷一份 <M>{'g\\gets f'}</M>，
          对那件<strong>正序</strong>逐格做 <M>{'g[j]\\mathrel{-}=g[j-w_k]'}</M>——注意方向和加时（倒序）相反。末帧上下两行并排：全集 <M>{'f[j]'}</M> vs 缺那件的 <M>{'g[j]'}</M>。
          留意默认这组：<M>{'w=(2,3,5)'}</M>、<M>{'W=5'}</M> 时全集 <M>{'f[5]=2'}</M>，让 <M>{'w=5'}</M> 那件消失后 <M>{'g[5]'}</M> 退成 <strong>1</strong>（只剩 <M>{'\\{2,3\\}'}</M>）——方案数从 2 降到 1，退掉的正是用到它的那条。
        </div>
        <div className="demo">
          <div className="demo__body">
            <VariantUndoDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1164" name="小 A 点菜" src="洛谷原生" diff="普及-">
          <Field k="题意">
            <M>{'n'}</M> 道菜价格已知，手上恰好 <M>{'m'}</M> 元，求<strong>恰好花完</strong>这 <M>{'m'}</M> 元的点菜方案数。
          </Field>
          <Field k="对应关系">
            「价格」= 重量 <M>{'w'}</M>，「手上的钱 <M>{'m'}</M>」= 目标容量。每道菜至多点一次 → 计数型 <strong>01 背包</strong>。
          </Field>
          <Field k="为什么选它">
            从「最优 DP」跨到「计数 DP」<strong>最平滑</strong>的一题：转移里的 <M>{'\\max'}</M> 原样换成 <M>{'+'}</M>、初值置 <M>{'f[0]=1'}</M>，其余骨架分毫不动。是理解「换算子」的入门标杆。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[j]\\mathrel{+}=f[j-a_i]'}</M>，一维倒序、<M>{'f[0]=1'}</M>；答案 <M>{'f[m]'}</M>，时间 <M>{'O(nm)'}</M>。方案数可能较大，<strong>用 <M>{'\\texttt{long long}'}</M></strong>。
          </Field>
          <Field k="参考代码（01 计数）">
            <CodeBlock code={CODE_P1164} luogu="P1164" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P4141" name="消失之物" src="洛谷原生" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 个物品各有体积 <M>{'w_i'}</M>。对每个 <M>{'i'}</M>，求「第 <M>{'i'}</M> 件消失后，用其余物品恰好凑出体积 <M>{'j'}</M>（<M>{'1\\le j\\le m'}</M>）」的方案数。
          </Field>
          <Field k="为什么选它">
            「对每件都要缺它一次的方案数」，直接重算是 <M>{'O(n^2m)'}</M>。此题逼你用<strong>撤销（正难则反）</strong>：先算全集 <M>{'f'}</M>，再对每件做逆操作退掉贡献——把 <M>{'n'}</M> 遍重算压到 <M>{'O(nm)'}</M>。是「计数 DP 可逆」这一思想最经典的载体。
          </Field>
          <Field k="换个视角">
            背包转移在计数意义下是<strong>可逆</strong>的：加它 <M>{'f[j]\\mathrel{+}=f[j-w]'}</M> 的逆就是退它 <M>{'g[j]\\mathrel{-}=g[j-w]'}</M>。唯一要翻转的是<strong>循环方向</strong>——加倒序、退正序。
          </Field>
          <Field k="转移 · 复杂度">
            全集 <M>{'f[j]\\mathrel{+}=f[j-w_i]'}</M>（倒序）；对每件拷 <M>{'g\\gets f'}</M> 后 <M>{'g[j]\\mathrel{-}=g[j-w_i]'}</M>（<strong>正序</strong>）。时间 <M>{'O(nm)'}</M>，按题意对结果取模。
          </Field>
          <Field k="参考代码（全集 + 撤销）">
            <CodeBlock code={CODE_P4141} luogu="P4141" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2347"
          name="[NOIP1996 提高组] 砝码称重"
          hint="布尔可行变形：f[j] 表示「重量 j 能否被称出」，把 max 换成逻辑或 f[j] |= f[j-w]，f[0]=true；每种砝码有限个，按多重背包逐件处理，最后数一遍有多少个 j 为真。"
        />
        <Exercise
          pid="P2563"
          name="[AHOI2001] 质数和分解"
          hint="完全背包求方案数：先筛出不超过 n 的质数当「无限件物品」，f[j] += f[j-p] 正序（每种质数可重复用），f[0]=1；f[n] 即把 n 写成若干质数之和的无序分解数。"
        />
        <Exercise
          pid="P1077"
          name="[NOIP2012 普及组] 摆花"
          hint="有限件求方案数：f[j] 表示恰好摆 j 盆的方案数，第 i 种花取 0..a_i 盆；朴素枚举件数是 O(n·m·a)，可对「枚举本种取几盆」那一维用前缀和优化掉一维。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/b/dep">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 有依赖的背包
          </span>
        </Link>
        <Link to="/part/b/fractional" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            辨析：分数背包=贪心 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
