import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackMixedDemo from '../../components/demos/knapsack/KnapsackMixedDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { MixedSetupFigure, DispatchFigure, MixedTraceFigure } from './KnapsackMixedArt'

const preMono: CSSProperties = {
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
}

const CODE_P1833 = `
#include <iostream>
#include <algorithm>
using namespace std;

int f[1005];                 // f[j]：用时不超过 j 的最大美观度
int w2[100005], v2[100005];  // 拆分后的「打包件」（有限件走这里）
int cnt;                     // 打包件总数

int main()
{
    int sh, sm, eh, em, n;              // 起止时刻 h:m 与樱花种数
    scanf("%d:%d %d:%d %d", &sh, &sm, &eh, &em, &n);
    int T = (eh - sh) * 60 + (em - sm); // 总时长（分钟）= 背包容量

    for (int i = 1; i <= n; i++)
    {
        int w, v, p;                    // 花时间、美观度、件数上限 P
        cin >> w >> v >> p;

        if (p == 0)                     // ★P=0：无限件 → 完全背包，正序
        {
            for (int j = w; j <= T; j++)
                f[j] = max(f[j], f[j - w] + v);
        }
        else                            // ★P>0：有限 P 件 → 多重，二进制拆分成打包件
        {
            int k = 1;                  // 1,2,4,… 各捆一包，余数单独成包
            while (k < p)
            {
                cnt++;
                w2[cnt] = k * w;
                v2[cnt] = k * v;
                p -= k;
                k <<= 1;
            }
            if (p > 0)
            {
                cnt++;
                w2[cnt] = p * w;
                v2[cnt] = p * v;
            }
        }
    }

    for (int i = 1; i <= cnt; i++)      // 有限件的打包件统一当 01 物品，逆序
        for (int j = T; j >= w2[i]; j--)
            f[j] = max(f[j], f[j - w2[i]] + v2[i]);

    cout << f[T] << endl;
    return 0;
}`

const CODE_P2851 = `
#include <iostream>
#include <algorithm>
using namespace std;

const int INF = 1e9;
int val[105], c[105];        // 第 i 种硬币面值、付款端持有数量
int fpay[100005];            // 付款端：凑「≥ 目标」的最少枚数（多重）
int fchg[100005];            // 找零端：凑「恰好」的最少枚数（完全）

int main()
{
    int n, T;                           // 硬币种数、商品价格
    cin >> n >> T;
    int mx = 0;                         // 最大单面值（决定超付上界）
    for (int i = 1; i <= n; i++) { cin >> val[i]; mx = max(mx, val[i]); }
    for (int i = 1; i <= n; i++)   cin >> c[i];

    int LIM = T + mx * mx;              // 付款可枚举到的上界（经典界）
    for (int j = 1; j <= LIM; j++) fpay[j] = fchg[j] = INF;

    // 付款端：硬币有限 → 多重背包，二进制拆分后逆序，求最少枚数
    for (int i = 1; i <= n; i++)
    {
        int rest = c[i], k = 1;
        while (rest > 0)
        {
            int t = min(k, rest);       // 一包 t 枚
            for (int j = LIM; j >= t * val[i]; j--)
                if (fpay[j - t * val[i]] != INF)
                    fpay[j] = min(fpay[j], fpay[j - t * val[i]] + t);
            rest -= t;
            k <<= 1;
        }
    }

    // 找零端：店家硬币无限 → 完全背包，正序，求最少枚数
    for (int i = 1; i <= n; i++)
        for (int j = val[i]; j <= LIM; j++)
            if (fchg[j - val[i]] != INF)
                fchg[j] = min(fchg[j], fchg[j - val[i]] + 1);

    int ans = INF;                      // 枚举「实付 j 元、找零 j−T 元」
    for (int j = T; j <= LIM; j++)
        if (fpay[j] != INF && fchg[j - T] != INF)
            ans = min(ans, fpay[j] + fchg[j - T]);

    cout << (ans == INF ? -1 : ans) << endl;
    return 0;
}`

export default function KnapsackMixed() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">同一道题里，三种「件数」并存</h2>
        <div className="prose">
          <p>
            前三类背包各自只管一种「件数」：<Link to="/part/a/01" style={{ color: 'var(--accent-2)' }}>01 背包</Link>每种<strong>恰一件</strong>、
            <Link to="/part/a/complete" style={{ color: 'var(--accent-2)' }}>完全背包</Link>每种<strong>无限件</strong>、
            <Link to="/part/a/multiple" style={{ color: 'var(--accent-2)' }}>多重背包</Link>每种<strong>有限 <M>{'m'}</M> 件</strong>。
            可现实里的一道题，常常<strong>三种物品混在一起</strong>：有的只有一件、有的管够、有的限量。这就是<strong>混合背包</strong>。
          </p>
        </div>
        <figure className="figure">
          <MixedSetupFigure />
          <figcaption className="figure__cap">同一个背包，三件物品件数属性不同：物品 1 只有一件（×1）、物品 2 无限（×∞）、物品 3 限 m 件（×m）——要在一次 DP 里全部装下。</figcaption>
        </figure>
        <div className="prose">
          <p>
            先看个小例子体会一下「为什么要分派」。容量 <M>{'m=9'}</M>，物品 1 是 <strong>01 件</strong> <M>{'(w,v)=(2,3)'}</M>，物品 2 是<strong>完全件</strong> <M>{'(3,4)'}</M>。
            物品 1 至多拿一次，物品 2 却能反复拿。如果对它俩用<strong>同一套循环方向</strong>，必然有一个出错——
            要么把只有一件的物品 1 反复塞（当成了完全），要么把管够的物品 2 也锁死成一件（当成了 01）。
          </p>
          <p>
            难点不在「想出新方程」——混合背包<strong>没有新方程</strong>。难点在于：不同物品的<strong>件数属性不同</strong>，
            必须<strong>逐件判断它属于哪一类，再套用那一类的转移方式</strong>。这份「看属性、选方式」的对照，就是这一节的主角——<strong>分派表</strong>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态不变，靠「循环方向」分派</h2>
        <div className="prose">
          <p>
            <strong>状态照旧。</strong>还是那条一维滚动数组：<M>{'f[j]'}</M> 表示容量不超过 <M>{'j'}</M> 时能取得的最大价值。
            转移也照旧，就是那句熟得不能再熟的：
          </p>
          <MB>{'f[j]=\\max\\big(f[j],\\ f[j-w]+v\\big)'}</MB>
          <p>
            三类物品<strong>共用这一格 <M>{'f[j]'}</M>、共用这一句转移</strong>。它们唯一的差别，是<strong>怎么遍历容量 <M>{'j'}</M></strong>——回想前几节反复强调的那件事：
          </p>
        </div>
        <figure className="figure">
          <DispatchFigure />
          <figcaption className="figure__cap">分派表：看这件的件数属性，就用对应的转移方式——01 倒序、完全正序、多重先二进制拆包再逐包倒序。三条路最终都写同一格 f[j]。</figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>为什么方向就能决定物种？</strong>算 <M>{'f[j]'}</M> 要用到 <M>{'f[j-w]'}</M>：
          </p>
          <p>
            <strong>01（恰一件）→ 倒序</strong>（<M>{'j:m\\to w'}</M>）：此刻 <M>{'f[j-w]'}</M> 还没被<strong>本件</strong>动过，是「这件还没进来」的干净旧值，于是本件至多被计入一次。
          </p>
          <p>
            <strong>完全（无限件）→ 正序</strong>（<M>{'j:w\\to m'}</M>）：此刻 <M>{'f[j-w]'}</M> <strong>可能已经含了本件</strong>，于是同一件能被<strong>反复叠加</strong>，正好表达「无限次」。
          </p>
          <p>
            <strong>多重（有限件）→ 先拆再倒序</strong>：把 <M>{'m'}</M> 件<strong>二进制拆</strong>成 <M>{'1,2,4,\\dots'}</M> 与余数几个「打包件」，每个打包件当一件普通 01 物品<strong>倒序</strong>处理。
            拆分保证「取 0…<M>{'m'}</M> 件」的每种可能都能凑出，倒序保证每个包至多用一次——合起来就是「不超过 <M>{'m'}</M> 件」。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 三类物品能同题混装，因为它们落在同一维 f[j] 上">
          混合背包不是一个新算法，而是前三节的<strong>拼装</strong>。既然 01、完全、多重<strong>最终都归结为同一句 <M>{'f[j]=\\max(f[j],f[j-w]+v)'}</M></strong>，
          就完全可以在<strong>同一个 <M>{'f[j]'}</M></strong> 上，对每件物品<strong>按其件数属性选择遍历方向 / 是否拆包</strong>，一件件叠加处理。谁先谁后都不影响结果——因为每件都只依赖「它进来之前」的 <M>{'f'}</M>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">分派的骨架长这样</h2>
        <div className="prose">
          <p>把分派表落成代码，主循环就是「逐件物品，看属性走对应分支」：</p>
          <pre className="mono" style={preMono}>
{`for 每件物品 (kind, w, v, m):
    if kind == 01:                 // 恰一件
        for j = W downto w:        //   倒序
            f[j] = max(f[j], f[j−w] + v)
    elif kind == 完全:              // 无限件
        for j = w to W:            //   正序
            f[j] = max(f[j], f[j−w] + v)
    else kind == 多重:              // 有限 m 件
        把 m 二进制拆成若干「打包件」(cnt·w, cnt·v)
        for 每个打包件 (w', v'):
            for j = W downto w':   //   逐包倒序（当 01 物品）
                f[j] = max(f[j], f[j−w'] + v')`}
          </pre>
          <p>
            三条分支的循环体<strong>一字不差</strong>，区别只在 <M>{'j'}</M> 的方向与多重那一步的<strong>拆包</strong>。
            把它们串在一个大循环里，一维 <M>{'f[j]'}</M> 就地累积——处理完全部物品，<M>{'f[W]'}</M> 就是答案。这正是混合背包的定义式。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍：一件 01 + 一件完全</h2>
        <div className="prose">
          <p>
            用开头的例子——物品 1 是 <strong>01 件</strong> <M>{'(2,3)'}</M>、物品 2 是<strong>完全件</strong> <M>{'(3,4)'}</M>，容量 8。把两件<strong>先后</strong>落到同一维 <M>{'f'}</M> 上：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>初始化。</b> 空背包，<M>{'f[0..8]=0'}</M>。三类物品共用这同一条一维数组。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>处理物品 1（01 件）</b>，<strong>倒序</strong> <M>{'j:8\\to 2'}</M>：每格 <M>{'f[j]=\\max(f[j],f[j-2]+3)'}</M>，来源都是旧值 0。这一行变成 <M>{'0,0,3,3,3,3,3,3,3'}</M>——因为倒序，这件<strong>只被计入一次</strong>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>处理物品 2（完全件）</b>，<strong>正序</strong> <M>{'j:3\\to 8'}</M>。到 <M>{'f[6]=\\max(3,\\ f[3]+4)'}</M>，而 <M>{'f[3]'}</M> 此刻<strong>已被本件更新为 4</strong>，故 <M>{'f[6]=4+4=8'}</M>——同一件完全物品<strong>被叠了两次</strong>（装了 2 个），正是「无限件」想要的。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>读答案。</b> 继续到 <M>{'f[8]=\\max(3,\\ f[5]+4)'}</M>，<M>{'f[5]=7'}</M>（= 01 件 3 + 一个完全件 4），故 <M>{'f[8]=7+4=11'}</M>。对应「01 件一个 + 完全件两个」：重 <M>{'2+3+3=8'}</M>、价值 <M>{'3+4+4=11'}</M>。<strong>01 只出一次、完全反复出</strong>，两种约束在同一维里各得其所。
            </div>
          </div>
        </div>
        <figure className="figure">
          <MixedTraceFigure />
          <figcaption className="figure__cap">同一条 f 数组的两次快照：上行是 01 件倒序处理后（每格至多含一件），下行再被完全件正序处理，高亮格为被完全件抬升的位置——f[8] 一路涨到 11。</figcaption>
        </figure>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示可以给每件物品<strong>切换件数属性</strong>（01 / 完全 / 多重），看它们在同一维 <M>{'f[j]'}</M> 上逐格填、每步标注「本件按哪种处理」。改改类型、<M>{'w,v,m'}</M> 或容量试试。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看三类物品落进同一维 f</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackMixedDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">一个统一写法：把 01 并进多重</h2>
        <div className="prose">
          <p>
            实战里，「01」其实是「多重」的<strong>特例</strong>——恰一件，就是件数上限 <M>{'m=1'}</M> 的多重物品（二进制拆分后只有<strong>一个 <M>{'\\times1'}</M> 包</strong>，逆序一遍，与 01 分毫不差）。
            于是分派只需<strong>两条分支</strong>就够：
          </p>
          <pre className="mono" style={preMono}>
{`for 每件物品 (w, v, p):        // p = 件数：0 表示无限
    if p == 0:                 // 无限 → 完全，正序
        for j = w to W: f[j] = max(f[j], f[j−w] + v)
    else:                      // p ≥ 1（含 p==1 的“恰一件”）
        把 p 二进制拆包，各包当 01 物品逆序处理`}
          </pre>
          <p>
            这正是例题 <strong>P1833 樱花</strong> 的标准写法：题面用 <M>{'P_i'}</M> 编码件数——<M>{'P_i=1'}</M> 是 01、<M>{'0<P_i<\\infty'}</M> 是多重、<M>{'P_i=0'}</M> 是完全。
            按 <M>{'P_i'}</M> 一分派，三类樱花就在同一维 <M>{'f'}</M> 上算完了。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱 · 别把方向记反 / 别忘拆多重">
          混合背包最容易翻车的两处：其一，<strong>把完全件写成倒序</strong>（它就退化成 01，无限件变一件），或<strong>把 01 件写成正序</strong>（它就被反复取，答案虚高）——方向必须随件数属性走。
          其二，<strong>多重件忘了二进制拆分</strong>，直接当完全（正序）会超取、直接当 01（一个包倒序）会漏取。拿不准时回看 <Link to="/part/a/01" style={{ color: 'var(--accent-2)' }}>01</Link> / <Link to="/part/a/complete" style={{ color: 'var(--accent-2)' }}>完全</Link> / <Link to="/part/a/multiple" style={{ color: 'var(--accent-2)' }}>多重</Link> 三页的方向依据。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1833" name="樱花" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            给定赏花起止时刻（得总时长 <M>{'T'}</M> 作容量），<M>{'n'}</M> 种樱花各有观赏耗时 <M>{'w_i'}</M>、美观度 <M>{'v_i'}</M> 和株数 <M>{'P_i'}</M>。求 <M>{'T'}</M> 时间内最大美观度。
          </Field>
          <Field k="对应关系（一题三类俱全）">
            件数由 <M>{'P_i'}</M> 编码：<M>{'P_i=1'}</M> → <strong>01</strong>（恰一株）、<M>{'0<P_i<\\infty'}</M> → <strong>多重</strong>（有限株）、<M>{'P_i=0'}</M> → <strong>完全</strong>（无限株）。三类落在同一维 <M>{'f'}</M> 上，是混合背包<strong>定义式</strong>最标准的一题。
          </Field>
          <Field k="为什么选它">
            它把「按件数属性分派」摆到明面上——读入时看一眼 <M>{'P_i'}</M> 就知道走哪条分支。用<strong>「01 并进多重」的两分支统一写法</strong>最省心：<M>{'P_i=0'}</M> 走完全正序，其余一律二进制拆包逆序。
          </Field>
          <Field k="转移 · 复杂度">
            完全支 <M>{'f[j]=\\max(f[j],f[j-w_i]+v_i)'}</M> 正序；有限支拆包后逐包逆序。时间 <M>{'O\\!\\big(T\\cdot(n_\\infty+\\sum\\log P_i)\\big)'}</M>。
          </Field>
          <Field k="参考代码（按 P 分派 · 两分支统一写法）">
            <CodeBlock code={CODE_P1833} luogu="P1833" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2851" name="[USACO2006 Dec] The Fewest Coins S" src="USACO 2006" diff="提高+/省选-">
          <Field k="题意">
            商品价格 <M>{'T'}</M>。你手上第 <M>{'i'}</M> 种硬币有<strong>有限枚</strong>；店家找零的硬币<strong>无限枚</strong>。你付出若干、店家找回若干，求这笔交易<strong>经手硬币总数最少</strong>。
          </Field>
          <Field k="对应关系（两个背包合成）">
            <strong>付款端</strong>：自己的硬币有限 → <strong>多重背包</strong>，求「凑出金额 <M>{'j\\ge T'}</M> 的最少枚数」<M>{'fpay[j]'}</M>（二进制拆分，逆序，<M>{'\\min'}</M> 计数）。
            <strong>找零端</strong>：店家硬币无限 → <strong>完全背包</strong>，求「凑出金额 <M>{'j'}</M> 的最少枚数」<M>{'fchg[j]'}</M>（正序，<M>{'\\min'}</M>）。答案 <M>{'\\min_{j\\ge T}\\big(fpay[j]+fchg[j-T]\\big)'}</M>。
          </Field>
          <Field k="为什么选它">
            混合背包的另一副面孔：不是一个背包里混三类物品，而是<strong>多重与完全两个背包各算一半再拼</strong>。练的是「识别哪端有限、哪端无限，各上对应背包」的分派眼力。超付上界取 <M>{'T+\\max(val)^2'}</M> 是经典结论。
          </Field>
          <Field k="转移 · 复杂度">
            付款 <M>{'fpay[j]=\\min(fpay[j],fpay[j-c\\,val]+c)'}</M>；找零 <M>{'fchg[j]=\\min(fchg[j],fchg[j-val]+1)'}</M>。时间约 <M>{'O\\!\\big((T+\\max val^2)\\cdot(n+\\sum\\log c_i)\\big)'}</M>。
          </Field>
          <Field k="参考代码（付款多重 + 找零完全）">
            <CodeBlock code={CODE_P2851} luogu="P2851" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <p className="prose" style={{ maxWidth: 'none', fontSize: '13.5px', color: 'var(--text-3)', marginBottom: 'var(--sp-4)' }}>
          说明：纯「三类物品同题混装」的洛谷原生题目池很窄——真正综合的题多半把混合骨架藏进更大的模型里。因此这里用<strong>各分支的代表题</strong>组合覆盖：先用一道纯完全、一道纯有限件，把混合骨架的两条支路分别练熟，再回头做上面的 P1833 就水到渠成。
        </p>
        <Exercise
          pid="P1616"
          name="疯狂的采药"
          hint="混合骨架的『完全』分支：草药可无限次采，先把它当纯完全背包正推练手——f[j]=max(f[j],f[j−w]+v)，j 从 w 到 T 正序。注意 f 与答案可能超 int，开 long long。"
        />
        <Exercise
          pid="P1077"
          name="[NOIP2012 普及组] 摆花"
          hint="混合骨架的『有限件（多重）』分支，且是计数版：f[j] 表示前几种花恰好摆 j 盆的方案数，每种不超过 a_i 盆；把 max 换成累加，那一维件数可用前缀和优化掉。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        回 <Link to="/part/a" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>A 部分页的「装包大师」</Link>时，试着给每件宝物先贴个标签：这件只有一件、那件成箱、另一件管够——混合背包做的就是这道「逐件分派」的分诊，再把三条支路各自转移。
      </div>

      <nav className="type-nav">
        <Link to="/part/a/group">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 分组背包
          </span>
        </Link>
        <Link to="/part/a/cost2d" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            二维费用背包 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
