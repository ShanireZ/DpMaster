import { Link } from 'react-router-dom'
import { ArrowLeft, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackDemo from '../../components/demos/knapsack/KnapsackDemo'
import CompleteContrastDemo from '../../components/demos/knapsack/CompleteContrastDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { CompleteSetupFigure, CompleteOptFigure } from './KnapsackArt'

const CODE_P1616 = `
#include <iostream>
#include <algorithm>
using namespace std;

int t[10005], v[10005];
int f[10005];

int main()
{
    int T, M;
    cin >> T >> M;
    for (int i = 1; i <= M; i++)
        cin >> t[i] >> v[i];

    for (int i = 1; i <= M; i++)
        for (int j = t[i]; j <= T; j++)     // ★正推：允许同一物品被重复取
            f[j] = max(f[j], f[j - t[i]] + v[i]);

    cout << f[T] << endl;
    return 0;
}`

const CODE_P5662 = `
#include <iostream>
#include <algorithm>
using namespace std;

int p[105][105];             // p[d][j]：第 d 天第 j 种纪念品价格
int f[100005];

int main()
{
    int T, n, m;
    cin >> T >> n >> m;
    for (int d = 1; d <= T; d++)
        for (int j = 1; j <= n; j++)
            cin >> p[d][j];

    for (int d = 1; d < T; d++)             // 枚举每一天，用当天买、次日卖
    {
        for (int j = 0; j <= m; j++) f[j] = 0;      // 每天现金独立，重置
        for (int j = 1; j <= n; j++)                // 每种纪念品可买多份 → 完全背包
            for (int c = p[d][j]; c <= m; c++)      // ★正推
                f[c] = max(f[c], f[c - p[d][j]] + p[d + 1][j] - p[d][j]);
        m += f[m];                           // 当天最优收益并入本金
    }

    cout << m << endl;
    return 0;
}`

const CODE_P5020 = `
#include <iostream>
#include <algorithm>
using namespace std;

int a[105];
bool f[25005];               // f[j]：用已保留的面值能否凑出金额 j

int main()
{
    int T;
    cin >> T;
    while (T--)
    {
        int n;
        cin >> n;
        for (int i = 1; i <= n; i++)
            cin >> a[i];
        sort(a + 1, a + n + 1);              // 从小到大处理

        int m = a[n];                        // 最大面值即可达范围上界
        for (int j = 0; j <= m; j++) f[j] = false;
        f[0] = true;

        int cnt = 0;
        for (int i = 1; i <= n; i++)
            if (!f[a[i]])                    // 这个面值凑不出来 → 必须保留
            {
                cnt++;
                for (int j = a[i]; j <= m; j++)     // 完全背包正推标记可达
                    f[j] = f[j] || f[j - a[i]];
            }

        cout << cnt << endl;
    }
    return 0;
}`

export default function KnapsackComplete() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">同一种物品，取之不尽</h2>
        <div className="prose">
          <p>
            完全背包与 01 背包只差一个字：01 里每件<strong>要么取要么留</strong>，完全里每种物品有<strong>无限件</strong>，同一种想拿几件就拿几件。
            目标不变——在不超过容量的前提下，让装入的<strong>总价值最大</strong>。
          </p>
        </div>
        <figure className="figure">
          <CompleteSetupFigure />
          <figcaption className="figure__cap">每种物品都带 ×∞：容量 m=9 时，物品 1（w=2,v=3）可拿到 4 件价值 12，物品 2（w=3,v=5）可拿 3 件价值 15——同一种可反复取用。</figcaption>
        </figure>
        <div className="prose">
          <p>
            状态定义也不用改：<M>{'f[j]'}</M> 仍表示容量不超过 <M>{'j'}</M> 时的最大价值。变的只有一件事——
            「考虑第 <M>{'i'}</M> 种物品」这个动作，现在可以对同一种<strong>反复施加</strong>，而不是只做一次决断。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">与 01 只差一个方向：正推即「允许重复」</h2>
        <div className="prose">
          <p>转移方程写出来，和 01 背包的一维式子<strong>一模一样</strong>：</p>
          <MB>{'f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)'}</MB>
          <p>
            差别<strong>只在循环方向</strong>：01 背包逆推（<M>{'j'}</M> 从 <M>{'m'}</M> 到 <M>{'w_i'}</M>，保证每件至多取一次），
            完全背包<strong>正推</strong>（<M>{'j'}</M> 从 <M>{'w_i'}</M> 到 <M>{'m'}</M>）。就这一处方向之差，决定了「每种一件」还是「每种无限件」。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 为什么正推就对了">
          正推时算 <M>{'f[j]'}</M> 用到的 <M>{'f[j-w_i]'}</M>，可能<strong>已经包含了第 <M>{'i'}</M> 种</strong>——于是这一种被自然地再取一次。
          这正是 <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}>01 背包「不能正推」那一节</Link>里的同一个机制：在 01 里它是要极力避开的 bug，在完全背包里它<strong>恰恰是我们想要的特性</strong>。同一段转移，方向决定物种。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">为什么还是 O(nm)：从枚举件数到一次转移</h2>
        <div className="prose">
          <p>
            「无限件」听起来更复杂，最朴素的想法是<strong>枚举第 <M>{'i'}</M> 种取几件</strong>：取 <M>{'0,1,2,\\dots'}</M> 件各算一遍再取最大——
          </p>
          <MB>{'f[i][j]=\\max_{k\\ge 0}\\ \\big(f[i-1][j-k\\,w_i]+k\\,v_i\\big)'}</MB>
          <p>
            这比 01 多了一层「枚举件数」，复杂度升到 <M>{'O\\!\\big(nm\\cdot m/w\\big)'}</M>。但盯住 <M>{'f[i][j-w_i]'}</M> 看：它本身已经是「前 <M>{'i'}</M> 种、容量 <M>{'j-w_i'}</M>」把所有件数都枚举过的最优——<strong>已经包含了「再多取一件第 <M>{'i'}</M> 种」的全部可能</strong>。于是那一整层枚举可以折叠成<strong>一步</strong>：
          </p>
          <MB>{'f[i][j]=\\max\\big(f[i-1][j],\\ f[i][j-w_i]+v_i\\big)'}</MB>
        </div>
        <figure className="figure">
          <CompleteOptFigure />
          <figcaption className="figure__cap">
            唯一的差别在「取」这条转移的来源：01 背包指向<strong>上一行</strong> f[i−1][j−w]（这一种只能用一次）；完全背包指向<strong>本行</strong> f[i][j−w]（这一种刚刚可能已经取过，于是能再取）。正是「同一行回看」把复杂度压回 O(nm)。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            降到一维后，<M>{'f[i][\\cdot]'}</M> 与 <M>{'f[i-1][\\cdot]'}</M> 共用同一个数组，「本行的 <M>{'f[j-w_i]'}</M>」正是<strong>正推</strong>时那个已被本种更新过的值——上一节循环方向的由来，到这里就完全说通了。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍：看它把一件反复拿</h2>
        <div className="prose">
          <p>拿一件物品 <M>{'(w,v)=(2,3)'}</M>、容量 6，把正推 <M>{'j:2\\to 4\\to 6'}</M> 走一遍：</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>初始化。</b> 空背包，任何容量下价值都是 0：<M>{'f[0..6]=0'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>正推到 <M>{'j=2'}</M>。</b> <M>{'f[2]=\\max(f[2],f[0]+3)=3'}</M>——放进第 <b>1</b> 件。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>正推到 <M>{'j=4'}</M>。</b> 此刻 <M>{'f[2]=3'}</M> <b>已经含这件了</b>，<M>{'f[4]=f[2]+3=6'}</M>——同一种又拿了 1 件，共 <b>2</b> 件。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>正推到 <M>{'j=6'}</M>。</b> <M>{'f[6]=f[4]+3=9'}</M>——第 <b>3</b> 件。容量 6、每件重 2，最多 3 件，总价值 <b>9</b>。这就是完全背包要的答案。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把 <M>{'f[j]'}</M> 沿正方向<strong>逐格累积</strong>填满，高亮同一件物品被反复计入的来源。改物品或容量，看表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它累积起来</h2>
        <div className="prose">
          <p>
            改物品与容量，观察 <M>{'f[j]'}</M> 如何沿正方向累积——同一件物品在一条链上被反复加进来。这与 01 背包的
            <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}> 「顺推 bug」</Link>是同一个机制，只是这里它是<strong>特性</strong>而非缺陷。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <KnapsackDemo variant="complete" />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">01 还是完全？并排看差别</h2>
        <div className="prose">
          <p>
            同一组物品、同一容量，左边按 01（每种至多 1 件）、右边按完全（每种无限件）各算一遍——改改 <M>{'w,v'}</M> 和容量，
            看完全背包如何靠<strong>反复取用同一种</strong>，拿到不低于 01 的价值。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <CompleteContrastDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1616" name="疯狂的采药" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            与 P1048 采药同型，但每株草药可采<strong>无限次</strong>。求 <M>{'T'}</M> 时间内最大价值。
          </Field>
          <Field k="为什么选它">
            和 01 背包的 P1048 构成「逆推 ↔ 正推」黄金对照——代码<strong>只差内层循环方向</strong>，一眼看清两类背包的分界。
          </Field>
          <Field k="参考代码（一维正推）">
            <CodeBlock code={CODE_P1616} luogu="P1616" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P5662" name="[CSP-J2019] 纪念品" src="CSP-J 2019" diff="普及/提高-">
          <Field k="题意">
            <M>{'T'}</M> 天、<M>{'n'}</M> 种纪念品，每天可无限量买卖。用初始金币 <M>{'m'}</M>，问 <M>{'T'}</M> 天后最多有多少金币。
          </Field>
          <Field k="为什么选它">
            较新的 CSP-J 真题：把「当天买、次日卖」的收益当价值，<strong>每天做一次完全背包</strong>，收益并入本金滚动。是「完全背包 + 贪心持币」的贴近真题的代表。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P5662} luogu="P5662" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P5020" name="[NOIP2018 提高组] 货币系统" src="NOIP2018 提高" diff="提高+">
          <Field k="题意">
            给定 <M>{'n'}</M> 种面值的货币系统，求一个<strong>面值种数最少</strong>的等价系统（能表示的金额集合完全相同）。
          </Field>
          <Field k="换个视角看完全背包">
            把完全背包当「<strong>可表示性判定</strong>」工具：面值从小到大处理，若当前面值<strong>已能被更小的保留面值凑出</strong>（<M>{'f[a_i]'}</M> 为真），它就是多余的；否则必须保留，并作为一件完全背包物品去标记新的可达金额。答案即保留的面值数。
          </Field>
          <Field k="转移 · 复杂度">
            可达性递推 <M>{'f[j]\\ |=\\ f[j-a_i]'}</M>（正推）；时间 <M>{'O(n\\cdot a_{\\max})'}</M>。是「完全背包 ≠ 只会求最值」的最佳一课。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P5020} luogu="P5020" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2918" name="[USACO08NOV] Buying Hay S" hint="完全背包求最小花费；注意可以「超采」，容量要开到 m + 最大单件重量，再在 ≥ m 的区间取最小。" />
        <Exercise pid="P2725" name="[USACO3.1] 邮票 Stamps" hint="可达性完全背包：f[j] 表示凑出面值 j 最少用几张邮票，求从 1 起最长连续可凑区间。" />
        <Exercise pid="P1832" name="A+B Problem（再升级）" hint="完全背包求方案数：把 n 分解为若干质数之和，先筛质数当物品，f[j] 累加（注意开 long long）。" />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        回到 <Link to="/part/b" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>B 部分页的「装包大师」</Link>，切到不同难度再挑一挑——虽然它是 01 规则，但「凑最大价值」的直觉两类背包相通。
      </div>

      <nav className="type-nav">
        <Link to="/part/b/01">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 01 背包
          </span>
        </Link>
        <span />
      </nav>
    </>
  )
}
