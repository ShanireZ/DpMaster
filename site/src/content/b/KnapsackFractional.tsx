import { Link } from 'react-router-dom'
import { ArrowLeft, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackFractionalDemo from '../../components/demos/knapsack/KnapsackFractionalDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { DivisibleFigure, GreedyFillFigure, ExchangeFigure } from './KnapsackFractionalArt'

const CODE_P1208 = `
#include <iostream>
#include <algorithm>
using namespace std;

struct Farmer          // 一个奶农：单价 p、存量 a
{
    int p, a;
};

Farmer g[5005];

bool cmp(const Farmer &x, const Farmer &y)
{
    return x.p < y.p;               // ★按单价升序：先买最便宜的
}

int main()
{
    int n, m;                       // n 需求量，m 奶农数
    cin >> n >> m;
    for (int i = 1; i <= m; i++)
        cin >> g[i].p >> g[i].a;

    sort(g + 1, g + m + 1, cmp);    // 贪心的核心：排序

    long long cost = 0;             // 总花费
    for (int i = 1; i <= m && n > 0; i++)   // 需求没凑够就继续买
    {
        int buy = min(n, g[i].a);   // ★可只买一部分：这家最多买 min(还差多少, 存量)
        cost += (long long)buy * g[i].p;
        n -= buy;
    }

    cout << cost << endl;
    return 0;
}`

export default function KnapsackFractional() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">先分清：这次能不能「取一部分」</h2>
        <div className="prose">
          <p>
            前面几种背包，物品都是<strong>整件取舍</strong>——一件要么整个拿走、要么留下，没有「拿半件」这回事。可现实里有另一类物品：
            金粉、牛奶、汽油、矿砂……它们<strong>可以只取一部分</strong>，装满剩余空间的一小段也行。这类问题叫<strong>分数背包</strong>（也叫部分背包）。
          </p>
        </div>
        <figure className="figure">
          <DivisibleFigure />
          <figcaption className="figure__cap">左：整件物品（01 背包），只能整块拿或留；右：可分割物品，一整袋金粉能只舀出 0.5 袋去填满缝隙。</figcaption>
        </figure>
        <div className="prose">
          <p>
            差别看着小，分量却很重。回想 <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}>01 背包的开头</Link>：那里我们试着用<strong>贪心</strong>（按性价比 <M>{'v/w'}</M> 从高到低装），结果<strong>输给了 DP</strong>——因为整件取舍时，塞不下的那件只能整个放弃，贪心会在「差一点点」的地方卡住。
            但只要物品<strong>可以切开</strong>，这个「差一点点」就消失了：装不下整件？那就切下正好填满的一段。于是——<strong>贪心重新变成最优，而且不再需要 DP</strong>。这一页专门点破这条分界。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">可切分时，贪心为什么就是最优</h2>
        <div className="prose">
          <p>
            策略只有一句话：<strong>按单位价值 <M>{'v/w'}</M> 从高到低装</strong>，能整件装就整件装，直到最后<strong>装不下整件的那一件，按剩余容量的比例切开</strong>，把背包填满为止。
          </p>
          <p>
            为什么这样一定最优？关键在「可切分」赋予的<strong>自由</strong>：背包最终一定会被<strong>恰好填满</strong>（除非所有物品都装进去还有空）。既然容量必被占满，那把每一单位容量都留给<strong>单位价值最高</strong>的物品，总价值自然最大。
            严格一点说，用<strong>交换论证</strong>：取任一「最优」方案，若其中某一单位空间给了 <M>{'v/w'}</M> 较低的物品，而更高性价比的物品还没装满——那就把这一单位<strong>切下来</strong>，换成高性价比那种同样一单位。空间占用不变（可切分保证换得进），而<strong>总价值只增不减</strong>（换进来的每单位价值更高）。既然任何「低 <M>{'v/w'}</M> 抢占了本可给高 <M>{'v/w'}</M> 的空间」的方案都能这样被改良，最优方案里就<strong>不可能</strong>存在这种错配：必被填满的每一单位，都归当前<strong>剩余里 <M>{'v/w'}</M> 最高</strong>的物品——这恰好就是「按 <M>{'v/w'}</M> 降序填」的贪心。
          </p>
        </div>
        <figure className="figure">
          <ExchangeFigure />
          <figcaption className="figure__cap">
            交换论证：换前那条容量条有一格错给了低性价比物品（v/w=1，虚线格），而高性价比物品（v/w=2）尚未填满；把这一格切换成高性价比的，占用不变、总价值从 9 升到 10。任何这样的错配都可被改良，故最优方案里不存在错配。
          </figcaption>
        </figure>
        <div className="prose">
          <p>用 01 背包开头的同一组数据体会一遍：物品 <M>{'(w,v)=(2,3),(3,4),(4,5)'}</M>，容量 <M>{'C=8'}</M>。</p>
        </div>
        <figure className="figure">
          <GreedyFillFigure />
          <figcaption className="figure__cap">
            按 v/w=1.5, 1.33, 1.25 降序：先装满 (2,3) 与 (3,4)（占 5 格、价值 7），容量还剩 3 格；最值钱但性价比最低的 (4,5) 装不下整件，切下 3/4（3 格）取价值 3.75。贪心总价值 = 10.75。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            对照一下：同样这组数据若<strong>只能整取</strong>（01 背包），最优是 <M>{'(3,4)+(4,5)=9'}</M>——因为 <M>{'(4,5)'}</M> 要么整件塞进去、要么彻底放弃，没法只填那 3 格的缝隙。
            可切分把这 <M>{'10.75-9=1.75'}</M> 的差额<strong>补了回来</strong>。
          </p>
          <MB>{'V_{\\text{greedy}}=\\sum_{k}v_k \\;+\\; v_{\\text{last}}\\cdot\\frac{C_{\\text{rest}}}{w_{\\text{last}}}'}</MB>
        </div>
        <InfoBox kind="key" title="本质 · 为什么这里贪心够用、轮不到 DP">
          分数背包的最优子结构被「可切分」<strong>抹平</strong>了：容量必被填满，每一单位空间独立地归给单位价值最高者即可，<strong>当前最优不再牵扯后面还剩多少整数空间</strong>。于是一次排序 + 一趟扫描（<M>{'O(n\\log n)'}</M>）就得最优，<strong>不需要背包 DP 那张表</strong>。DP 是用来对付「整件取舍」那种牵一发动全身的耦合的——这里没有那种耦合。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着装一遍</h2>
        <div className="prose">
          <p>
            把贪心用那组数据（物品 <M>{'(w,v)=(2,3),(3,4),(4,5)'}</M>，容量 <M>{'C=8'}</M>）从头装一遍，每一步只做一个动作：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>排序（按 <M>{'v/w'}</M> 降序）。</b> 三件的单位价值是 <M>{'3/2=1.5'}</M>、<M>{'4/3\\approx1.33'}</M>、<M>{'5/4=1.25'}</M>，已是降序，装填顺序就定为 <M>{'(2,3)\\to(3,4)\\to(4,5)'}</M>。背包空、累计价值 0、剩 8 格。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>整件装 <M>{'(2,3)'}</M>。</b> 剩 8 格 <M>{'\\ge'}</M> 它的 2 格，整件放入：占 <b>2</b> 格，累计价值 <M>{'0+3=3'}</M>，还剩 <M>{'8-2=6'}</M> 格。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>整件装 <M>{'(3,4)'}</M>。</b> 剩 6 格 <M>{'\\ge'}</M> 它的 3 格，整件放入：再占 <b>3</b> 格，累计价值 <M>{'3+4=7'}</M>，还剩 <M>{'6-3=3'}</M> 格。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>切最后一件 <M>{'(4,5)'}</M>。</b> 只剩 3 格 <M>{'<'}</M> 它的 4 格，装不下整件——按剩余比例切下 <M>{'3/4'}</M>，取得价值 <M>{'5\\times\\frac{3}{4}=3.75'}</M>。背包被<strong>恰好填满</strong>，总价值 <M>{'7+3.75=10.75'}</M>。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的对照演示会把这套「排序 → 整件装 → 切尾段」实时跑给你看，并和「若整取」的 01-DP 最优并排比较。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">改改看：贪心 vs 整取，两个数一起跳</h2>
        <div className="prose">
          <p>
            下面把两条路<strong>并排算给你看</strong>：左边是<strong>可分割 → 贪心</strong>（按 <M>{'v/w'}</M> 降序填、最后一件切开），右边是<strong>若整取 → 01-DP 最优</strong>（自写一个小背包）。
            改物品的 <M>{'w,v'}</M> 或容量 <M>{'C'}</M>——盯住那条容量条：整件段是实心、被切开的尾段是斜纹。多数情况下贪心的数<strong>更大</strong>（切开填满了整取留下的缝隙）；当数据恰好整取就能填满时，两者持平。<strong>贪心永远 <M>{'\\ge'}</M> 整取，绝不会更差。</strong>
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <KnapsackFractionalDemo />
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          试着把某件的 <M>{'v/w'}</M> 调得很高——看它被排到最前、优先整件装满；再把容量调到刚好卡在半件处，观察尾段如何被切开。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">一句话分界：可分割⇒贪心，不可分割⇒背包 DP</h2>
        <div className="prose">
          <p>
            把这一部分的整条脉络收束成一个判别动作——拿到一道「装东西求最值」的题，先问一句：<strong>物品能不能取一部分？</strong>
          </p>
          <p>
            <strong>能切分</strong>（金粉、牛奶、汽油、按重量卖的散货）→ 按 <M>{'v/w'}</M> 降序<strong>贪心</strong>，最后一件切开填满，<M>{'O(n\\log n)'}</M>，<strong>用不到 DP</strong>。
          </p>
          <p>
            <strong>整件取舍</strong>（一台机器、一本书、一件装备——只能整个拿或不拿）→ 贪心会在「差一点点」处失手，必须回到<strong>背包 DP</strong>：01 / 完全 / 多重…… 用一张表把指数级组合压成多项式。
          </p>
        </div>
        <InfoBox kind="warn" title="整取时贪心的经典反例（回扣 01 背包）">
          就是 <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}>01 背包开头</Link>那一幕：物品 <M>{'(2,3),(3,4),(4,5)'}</M>、容量 8，按 <M>{'v/w'}</M> 贪心先装 <M>{'(2,3)'}</M> 再装 <M>{'(3,4)'}</M>，剩 3 格塞不下 <M>{'(4,5)'}</M> 只得 <strong>7</strong>；最优却是 <M>{'(3,4)+(4,5)=9'}</M>。<strong>整取时贪心输 2</strong>——因为那 3 格的缝隙没法用「半件 <M>{'(4,5)'}</M>」去填。可一旦允许切分，这半件就能塞进去，反例当场消失，贪心反超到 <strong>10.75</strong>。<strong>能不能切开，就是贪心与 DP 的分水岭。</strong>
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1208" name="[USACO1.3] 混合牛奶 Mixing Milk" src="USACO 原生" diff="普及-">
          <Field k="题意">
            要收购 <M>{'n'}</M> 单位牛奶，有 <M>{'m'}</M> 个奶农，第 <M>{'i'}</M> 个单价 <M>{'p_i'}</M>、最多供应 <M>{'a_i'}</M> 单位。每个奶农的奶<strong>可以只买一部分</strong>。求凑够 <M>{'n'}</M> 单位的<strong>最小花费</strong>。
          </Field>
          <Field k="为什么选它（辨析对照）">
            这是<strong>可分割 → 贪心</strong>的教科书题，正好和 01 背包对照：物品能拆散买，于是不必做背包 DP——<strong>按单价升序，从最便宜的开始买，最后一家买够为止</strong>。它把「可切分 ⇒ 贪心」这条分界坐实成一道能提交的题。
          </Field>
          <Field k="思路 · 复杂度">
            按单价 <M>{'p_i'}</M> 升序排序，逐个奶农买「还差量」与存量的较小值 <M>{'\\min(r,\\ a_i)'}</M> 单位（<M>{'r'}</M> 为尚未凑够的量），累加花费直到凑满 <M>{'n'}</M>。排序 <M>{'O(m\\log m)'}</M>，扫描 <M>{'O(m)'}</M>——<strong>纯贪心，没有 DP 表</strong>。
          </Field>
          <Field k="参考代码（贪心 · 单价升序）">
            <CodeBlock code={CODE_P1208} luogu="P1208" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P1208"
          name="[USACO1.3] 混合牛奶 Mixing Milk"
          hint="学后自测：按单价升序，逐个奶农买 min(还差量, 存量)，累加到凑满 n。确认自己能一眼判定它「可分割 ⇒ 贪心、无需 DP」。"
        />
        <div className="prose" style={{ marginTop: 'var(--sp-4)' }}>
          <p>
            这是一节<strong>辨析课</strong>，配套的洛谷原生题只有 P1208 一道，就不用非原生题凑数了。真正要带走的是这条<strong>判别直觉</strong>：
          </p>
          <p>
            <strong>遇到「可取一部分 / 按重量按量买」，先想贪心（按 <M>{'v/w'}</M> 或单价排序）；遇到「整件取舍、只能整个拿或不拿」，再回背包 DP。</strong>
            前八节的背包 DP 是为后一种情形准备的重武器；这一节告诉你——不是所有「装背包」都要动用它。
          </p>
        </div>
      </section>

      <nav className="type-nav">
        <Link to="/part/b/variant">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 背包综合变形
          </span>
        </Link>
        <span />
      </nav>
    </>
  )
}
