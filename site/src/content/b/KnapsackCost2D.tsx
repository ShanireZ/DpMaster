import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackCost2DDemo from '../../components/demos/knapsack/KnapsackCost2DDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { Cost2DSetupFigure, Cost2DDimensionFigure, Cost2DDecisionFigure } from './KnapsackCost2DArt'

const CODE_P1855 = `
#include <iostream>
#include <algorithm>
using namespace std;

int m[205], t[205];          // 第 i 个愿望花的金钱 m、时间 t
int f[205][205];             // f[j][k]：花钱不超 j、花时间不超 k 时，最多实现的愿望数

int main()
{
    int n, M, T;
    cin >> n >> M >> T;
    for (int i = 1; i <= n; i++)
        cin >> m[i] >> t[i];

    for (int i = 1; i <= n; i++)            // 逐个愿望
        for (int j = M; j >= m[i]; j--)     // ★费用1（钱）倒序
            for (int k = T; k >= t[i]; k--) // ★费用2（时间）倒序
                f[j][k] = max(f[j][k], f[j - m[i]][k - t[i]] + 1); // 价值恒 1：数个数

    cout << f[M][T] << endl;
    return 0;
}`

const CODE_P1507 = `
#include <iostream>
#include <algorithm>
using namespace std;

int h[55], t[55], c[55];     // 第 i 份食物的体积 h、质量 t、卡路里 c
int f[405][405];             // f[j][k]：体积不超 j、质量不超 k 时的最大卡路里

int main()
{
    int H, T;
    cin >> H >> T;
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
        cin >> h[i] >> t[i] >> c[i];

    for (int i = 1; i <= n; i++)            // 逐份食物（普通的三属性 01 物品）
        for (int j = H; j >= h[i]; j--)     // ★体积维倒序
            for (int k = T; k >= t[i]; k--) // ★质量维倒序
                f[j][k] = max(f[j][k], f[j - h[i]][k - t[i]] + c[i]);

    cout << f[H][T] << endl;
    return 0;
}`

export default function KnapsackCost2D() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当一件东西，同时占两种资源</h2>
        <div className="prose">
          <p>
            先看一个具体场景：你有 <strong>2 件</strong>物品，但背包这次卡的<strong>不是一条约束，而是两条</strong>——
            物品 1 占「费用1 <M>{'a=1'}</M>、费用2 <M>{'b=2'}</M>」，价值 <M>{'v=3'}</M>；物品 2 占「<M>{'a=2,b=1'}</M>」，价值 <M>{'v=4'}</M>。
            背包要求：费用1 之和 <M>{'\\le A=4'}</M>，<strong>同时</strong>费用2 之和 <M>{'\\le B=4'}</M>。两条线都不能越界。
          </p>
        </div>
        <figure className="figure">
          <Cost2DSetupFigure />
          <figcaption className="figure__cap">
            每件物品挂两个费用标签 (a, b)；背包有两条互相独立的容量线（A 与 B），装入的物品要让两种费用之和都不超限。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            这类约束在现实里遍地都是：买东西受<strong>钱</strong>和<strong>时间</strong>双重限制；装货受<strong>体积</strong>和<strong>质量</strong>双重限制；组队受<strong>预算</strong>和<strong>人数</strong>双重限制。
            共同点是——<strong>每选一件，就要同时从两个「口袋」里各扣一笔</strong>，而且两个口袋<strong>互不相通</strong>：省下的时间换不来更多钱。
          </p>
          <p>
            能不能只盯着一种费用做普通 01 背包，事后再检查另一种够不够？<strong>不行</strong>。因为「费用1 最省」的方案，费用2 未必也最省——两种费用的取舍是<strong>耦合</strong>的，必须一起进 DP 的状态，才知道某个费用1 的档位下、费用2 还剩多少空间。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：给背包多开一维</h2>
        <div className="prose">
          <p>
            回忆 01 背包的一维状态 <M>{'f[j]'}</M>：花费不超过 <M>{'j'}</M> 时的最大价值。现在费用有两种，那就让状态<strong>同时记住两笔账</strong>：
            设 <M>{'dp[x][y]'}</M> 表示<strong>费用1 不超过 <M>{'x'}</M>、费用2 不超过 <M>{'y'}</M></strong> 时能取得的最大价值。约束从一条数轴变成一整片平面，下标也从一个变成一对。
          </p>
        </div>
        <figure className="figure">
          <Cost2DDimensionFigure />
          <figcaption className="figure__cap">
            一条费用 → 一个下标 j（数轴）；两条费用 → 一对下标 (x, y)（平面）。二维费用不过是给 dp 增开一维。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            转移和 01 背包<strong>一模一样的两条路</strong>，只是「扣费用」这一步要<strong>同时扣两种</strong>：
          </p>
          <p>
            <strong>不取第 <M>{'i'}</M> 件</strong>：它没参与，<M>{'dp[x][y]'}</M> 保持原值（还没装它时的最优）。
          </p>
          <p>
            <strong>取第 <M>{'i'}</M> 件</strong>（前提两种费用都够：<M>{'x\\ge a_i'}</M> 且 <M>{'y\\ge b_i'}</M>）：费用1 腾出 <M>{'a_i'}</M>、费用2 腾出 <M>{'b_i'}</M>，剩下的 <M>{'(x-a_i,\\ y-b_i)'}</M> 空间留给前面的物品去最优，再补上它的价值 <M>{'v_i'}</M>，即 <M>{'dp[x-a_i][y-b_i]+v_i'}</M>。
          </p>
        </div>
        <figure className="figure">
          <Cost2DDecisionFigure />
          <figcaption className="figure__cap">
            每格 dp[x][y] 仍是两条路取 max：不取则留原值；取则一次性扣掉两种费用 (x−a, y−b) 再补 v。
          </figcaption>
        </figure>
        <div className="prose">
          <p>两条路取较大者，就得到<strong>转移方程</strong>（写成一维滚动数组的形式）：</p>
          <MB>{'dp[x][y]=\\max\\big(\\,dp[x][y],\\ dp[x-a_i][y-b_i]+v_i\\,\\big)'}</MB>
          <p>
            边界：<M>{'dp[x][y]=0'}</M>（一件不装，价值为 0）。答案：<M>{'dp[A][B]'}</M>。对照 01 背包
            <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}>一维式</Link> <M>{'f[j]=\\max(f[j],\\ f[j-w_i]+v_i)'}</M>——
            二维费用只是把「一个下标 <M>{'j'}</M>、扣一种费用 <M>{'w'}</M>」换成「两个下标 <M>{'x,y'}</M>、同时扣两种费用 <M>{'a,b'}</M>」，方程骨架分毫未动。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          二维费用不是新算法，而是给每件物品<strong>挂了两个属性标签</strong>：约束从一条变两条，DP 的状态维度就随之 <strong>+1</strong>。凡是「若干种<strong>相互独立</strong>的资源同时受限」，都照此把状态加一维即可——三种资源就加两维（时空代价会陡增，故通常止于二维）。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用开头的例子（物品 <M>{'(a,b,v)=(1,2,3),\\ (2,1,4)'}</M>，上限 <M>{'A=B=4'}</M>）走几步，重点盯住<strong>每装一件，两种费用一起扣</strong>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>初始化整表。</b> 一件都不装时，任何 <M>{'(x,y)'}</M> 下价值都是 0：<M>{'dp[\\cdot][\\cdot]=0'}</M>。这是二维表格的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>装入物品 1</b>（<M>{'a=1,b=2,v=3'}</M>）。凡是 <M>{'x\\ge1'}</M> 且 <M>{'y\\ge2'}</M> 的格，都能装下它：<M>{'dp[x][y]=\\max(0,\\ dp[x-1][y-2]+3)=3'}</M>。于是表格「右下那一大片」（<M>{'x\\ge1,y\\ge2'}</M>）全变成 3，其余仍是 0。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>装入物品 2</b>（<M>{'a=2,b=1,v=4'}</M>）。看格 <M>{'(x{=}2,y{=}2)'}</M>：取 = <M>{'dp[0][1]+4=0+4=4'}</M>，胜过原值 3 → <M>{'dp[2][2]=4'}</M>（只装物品 2）。再看角落 <M>{'(x{=}4,y{=}4)'}</M>：取 = <M>{'dp[2][3]+4=3+4=7'}</M>，胜过原值 3 → <M>{'dp[4][4]=7'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>读答案。</b> <M>{'dp[4][4]=7'}</M>——它对应「<strong>两件都装</strong>」：费用1 <M>{'1+2=3\\le4'}</M>、费用2 <M>{'2+1=3\\le4'}</M>，价值 <M>{'3+4=7'}</M>。两条约束同时满足，正是二维费用下的最优。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把整张二维表<strong>逐件填出</strong>，高亮每件抬升了哪些格、来源在哪。改物品的 <M>{'a,b,v'}</M> 或两个上限，看表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一件一件铺满平面</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackCost2DDemo />
          </div>
        </div>
        <div className="prose">
          <p>
            注意演示里<strong>每处理一件，就把整张表刷一遍</strong>：能装下该件（<M>{'x\\ge a,\\ y\\ge b'}</M>）且更划算的格被抬高，其余不动。
            这正是一维滚动写法的样子——只保留「当前这张二维表」，逐件在它上面就地更新。
          </p>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          用演示下方的按钮切到 <strong>「价值恒 1 · 数个数」</strong>模式：每件价值统一当 1，转移的 <M>{'+v_i'}</M> 变成 <M>{'+1'}</M>，<M>{'dp[x][y]'}</M> 就从「最大价值」变成「<strong>最多件数</strong>」——同一台机器，答案 <M>{'dp[4][4]'}</M> 从 7（价值）变成 2（装得下两件）。这正是下面「变形一」讲的 P1855 那一路。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">两个常见变形：数个数，与两维都倒序</h2>
        <div className="prose">
          <p>
            <strong>变形一：价值恒 1，求「最多能选几件」。</strong> 很多题不问最大价值，而问「预算和时间都有限，最多能实现几个愿望 / 塞下几样东西」。
            这只需把每件的<strong>价值统一设成 1</strong>，转移里的 <M>{'+v_i'}</M> 变成 <M>{'+1'}</M>，<M>{'dp[x][y]'}</M> 的含义就从「最大价值」变成「<strong>最多件数</strong>」：
          </p>
          <MB>{'dp[x][y]=\\max\\big(\\,dp[x][y],\\ dp[x-a_i][y-b_i]+1\\,\\big)'}</MB>
          <p>
            「求个数」和「求价值」在背包里本是<strong>同一台机器</strong>——把价值当成 1 计，最大价值就是最多件数。下面例题 P1855 正是这一路。
          </p>
          <p>
            <strong>变形二：把「二维」看成「朴素三属性物品」。</strong> 二维费用听着抽象，落到代码里不过是每件物品多带一个属性、循环多套一层。
            像 P1507 那样「每份食物有体积、质量、卡路里」——体积和质量是两种费用，卡路里是价值，直接当普通 01 物品处理，只是背包状态是二维的 <M>{'dp[j][k]'}</M> 而已。
          </p>
          <p>
            至于循环方向：一维滚动写法里，<strong>两种费用维都要倒序</strong>（<M>{'x'}</M> 从 <M>{'A'}</M> 到 <M>{'a'}</M>、<M>{'y'}</M> 从 <M>{'B'}</M> 到 <M>{'b'}</M>）。道理和 01 背包
            <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}>「必须倒序」</Link>完全一致：倒序时 <M>{'dp[x-a][y-b]'}</M> 用的是<strong>本件尚未装入</strong>的旧值，才能保证每件至多取一次。三层循环的骨架是「逐件 → 费用1 倒序 → 费用2 倒序」：
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
{`for 每件物品 (a, v, b):
  for x = A downto a:        // ★费用1 维倒序
    for y = B downto b:      // ★费用2 维倒序
      dp[x][y] = max( dp[x][y], dp[x − a][y − b] + v )`}
          </pre>
        </div>
        <InfoBox kind="warn" title="记死：两维都倒序，缺一维就退化成完全背包">
          二维费用的 01 型，<strong>费用1 和费用2 两个循环都必须倒序</strong>。哪怕只把其中一维写成正序，该维度上就会像
          <Link to="/part/b/complete" style={{ color: 'var(--accent-2)' }}>完全背包</Link>那样「同一件被反复装入」，答案偏大。若题目本就允许每件取无限次（二维费用的<strong>完全型</strong>），才把两维都改成正序。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1855" name="榨取 kkksc03" src="洛谷原生" diff="普及-">
          <Field k="题意">
            有 <M>{'n'}</M> 个愿望，你有 <M>{'M'}</M> 元钱与 <M>{'T'}</M> 单位时间。实现第 <M>{'i'}</M> 个愿望要花 <M>{'m_i'}</M> 元、<M>{'t_i'}</M> 时间。求在钱和时间都不超限的前提下，<strong>最多能实现几个愿望</strong>。
          </Field>
          <Field k="对应关系">
            「钱」= 费用1 <M>{'a'}</M>（上限 <M>{'A=M'}</M>），「时间」= 费用2 <M>{'b'}</M>（上限 <M>{'B=T'}</M>），每个愿望<strong>价值恒 1</strong>。二维费用最干净的入门题。
          </Field>
          <Field k="换个视角（价值恒 1 = 数个数）">
            不问价值、只问个数——把每件价值设为 1，<M>{'dp[j][k]'}</M> 就是「花钱 <M>{'\\le j'}</M>、花时间 <M>{'\\le k'}</M> 时最多实现的愿望数」，转移的 <M>{'+v'}</M> 写成 <M>{'+1'}</M>。答案即 <M>{'dp[M][T]'}</M>。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[j][k]=\\max(dp[j][k],\\ dp[j-m_i][k-t_i]+1)'}</M>，两维都倒序；时间 <M>{'O(nMT)'}</M>。
          </Field>
          <Field k="参考代码（二维 01，两维倒序）">
            <CodeBlock code={CODE_P1855} luogu="P1855" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1507" name="NASA 的食物计划" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            飞船有<strong>体积</strong>上限 <M>{'H'}</M> 和<strong>质量</strong>上限 <M>{'T'}</M>。有 <M>{'n'}</M> 种食物，第 <M>{'i'}</M> 种占体积 <M>{'h_i'}</M>、质量 <M>{'t_i'}</M>，提供卡路里 <M>{'c_i'}</M>，每种最多带一份。求携带食物的<strong>最大卡路里</strong>。
          </Field>
          <Field k="对应关系">
            「体积」= 费用1、「质量」= 费用2、「卡路里」= 价值。每份食物就是一个带<strong>两种费用、一个价值</strong>的普通 01 物品。
          </Field>
          <Field k="换个视角（二维 = 三属性物品）">
            把「二维背包」想成「物品有三个数：两笔费用 + 一份价值」，代码结构和一维 01 背包<strong>只差一层循环</strong>——外层逐份食物，内层是费用1、费用2 两个倒序循环。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'dp[j][k]=\\max(dp[j][k],\\ dp[j-h_i][k-t_i]+c_i)'}</M>，两维都倒序；时间 <M>{'O(nHT)'}</M>。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P1507} luogu="P1507" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <p className="prose" style={{ maxWidth: 'none', fontSize: '13.5px', color: 'var(--text-3)', marginBottom: 'var(--sp-4)' }}>
          说明：纯二维费用的洛谷原生题目池并不宽。下面以 P1509 为主练一道「双费用 + 次关键字」的综合题；若想再练裸模板，上面的 <strong>P1855 / P1507</strong> 都可回炉自测（不看参考代码默写两维倒序的三层循环）。
        </p>
        <Exercise
          pid="P1509"
          name="找啊找啊找 GF"
          hint="钱 + 人品双约束的二维费用背包：dp[j][k] 记「花钱 ≤ j、花人品 ≤ k」时的最大幸福。难点在双关键字——先比幸福最大，幸福相同再比花钱最少，转移时对这两个关键字依次取优。"
        />
        <Exercise
          pid="P1855"
          name="榨取 kkksc03"
          hint="学完回来独立复现：钱、时间两种费用同时受限，价值恒 1 求最多愿望数。默写「逐件 → 钱倒序 → 时间倒序」的三层循环，答案取 dp[M][T]。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/b/mixed">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 混合背包
          </span>
        </Link>
        <Link to="/part/b/dep" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            有依赖的背包 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
