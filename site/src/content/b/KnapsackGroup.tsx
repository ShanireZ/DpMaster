import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackGroupDemo from '../../components/demos/knapsack/KnapsackGroupDemo'
import GroupOrderContrastDemo from '../../components/demos/knapsack/GroupOrderContrastDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { GroupSetupFigure, GroupTransitionFigure, GroupLoopOrderFigure } from './KnapsackGroupArt'

const CODE_P1757 = `
#include <iostream>
#include <algorithm>
using namespace std;

int w[3405], v[3405], g[3405]; // 重量、价值、所在组号
int f[3405];                   // f[j]：容量不超过 j 的最大价值
int idx[105][3405], cnt[105];  // 每组归集：idx[组][第几件] = 物品下标
int mx;                        // 出现过的最大组号

int main()
{
    int m, n;
    cin >> m >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> w[i] >> v[i] >> g[i];
        idx[g[i]][++cnt[g[i]]] = i;      // 把第 i 件挂到它所在的组
        mx = max(mx, g[i]);
    }

    for (int t = 1; t <= mx; t++)               // ★外层：逐组
        for (int j = m; j >= 0; j--)            // ★中层：容量倒序（在组内物品之外）
            for (int k = 1; k <= cnt[t]; k++)   // ★内层：枚举本组每一件
            {
                int i = idx[t][k];
                if (j >= w[i])
                    f[j] = max(f[j], f[j - w[i]] + v[i]);
            }

    cout << f[m] << endl;
    return 0;
}`

export default function KnapsackGroup() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当物品被「分了组」</h2>
        <div className="prose">
          <p>
            先看一个具体场景：有 <strong>2 组</strong>物品，一个容量 <M>{'m=6'}</M> 的背包。组 1 里放着两件
            <M>{'(w,v)=(2,3),(3,4)'}</M>，组 2 里放着两件 <M>{'(2,2),(4,5)'}</M>。规则多了一条硬约束——
            <strong>每一组里至多挑一件</strong>（也可以一件都不挑），组与组之间互不影响。目标仍是不超重的前提下让<strong>总价值最大</strong>。
          </p>
        </div>
        <figure className="figure">
          <GroupSetupFigure />
          <figcaption className="figure__cap">2 组物品，组内互斥：每组至多取一件——组 1 里 (2,3) 与 (3,4) 只能二选一或都不选。</figcaption>
        </figure>
        <div className="prose">
          <p>
            为什么不能把它当普通 01 背包，把 4 件一股脑丢进去做？因为 01 背包允许「组 1 的两件<strong>同时拿</strong>」——
            <M>{'(2,3)+(3,4)'}</M> 重 5、价值 7，它会毫不犹豫地收下。可分组规则里这是<strong>非法</strong>的：同一组内互斥。
            普通 01 背包<strong>压根不知道「组」的存在</strong>，自然管不住「一组只能出一件」。
          </p>
          <p>
            那把每组「挑哪一件、或不挑」的所有搭配枚举出来呢？<M>{'g'}</M> 组、每组约 <M>{'c'}</M> 种选择，就是 <M>{'c^g'}</M> 种组合，
            又回到指数爆炸。分组背包的思路，是把这层组内的互斥，<strong>直接焊进背包的转移里</strong>——让「组」成为 DP 的阶段。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：以「组」为阶段</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>设 <M>{'f[g][j]'}</M> 表示：<strong>只在前 <M>{'g'}</M> 组里挑选（每组至多一件）、总重量不超过 <M>{'j'}</M></strong> 时的最大价值。
            和 01 背包最大的不同在<strong>阶段的粒度</strong>：01 里一个阶段决断「第 <M>{'i'}</M> <strong>件</strong>取不取」，分组里一个阶段决断「第 <M>{'g'}</M> <strong>组</strong>——不选，还是选组内的哪一件」。
          </p>
        </div>
        <figure className="figure">
          <GroupTransitionFigure />
          <figcaption className="figure__cap">每格 f[g][j] 有两条路：不选本组，继承上一行；或在组内枚举第 k 件取 max。两条路都只回看上一行，本组至多出一件。</figcaption>
        </figure>
        <div className="prose">
          <p>
            <strong>不选第 <M>{'g'}</M> 组</strong>：本组一件都不拿，前 <M>{'g'}</M> 组的最优就等于前 <M>{'g-1'}</M> 组在同容量 <M>{'j'}</M> 下的最优，即 <M>{'f[g-1][j]'}</M>。
          </p>
          <p>
            <strong>选第 <M>{'g'}</M> 组里的某一件 <M>{'k'}</M></strong>（需装得下 <M>{'j\\ge w_k'}</M>）：腾出 <M>{'w_k'}</M>，剩下的 <M>{'j-w_k'}</M> 留给前 <M>{'g-1'}</M> 组去最优，再加上这件的价值 <M>{'v_k'}</M>，即 <M>{'f[g-1][j-w_k]+v_k'}</M>。
            究竟选组内哪一件？<strong>把每一件都试一遍，取最好的那件</strong>。
          </p>
          <p>合起来，就是<strong>转移方程</strong>——注意第二项里那个对组内物品的 <M>{'\\max'}</M>：</p>
          <MB>{'f[g][j]=\\max\\Big(\\,f[g-1][j],\\ \\max_{k\\,\\in\\,g,\\ w_k\\le j}\\big(f[g-1][j-w_k]+v_k\\big)\\Big)'}</MB>
          <p>
            边界：<M>{'f[0][j]=0'}</M>（一组都不考虑，价值为 0）。答案：<M>{'f[G][m]'}</M>。
            对比 01 背包 <M>{'f[i][j]=\\max(f[i-1][j],\\ f[i-1][j-w_i]+v_i)'}</M>——分组只是把「取这一件」换成了「<strong>在组内挑最好的一件</strong>」，多套了一层组内的 <M>{'\\max'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          分组背包是 01 背包的<strong>自然推广</strong>：把决策的粒度从「一件」抬升到「一组」。两项候选<strong>都从上一行 <M>{'f[g-1][\\cdot]'}</M> 取值</strong>——这一句就锁死了「每组至多一件」：因为一件都还没往本行写，组内不管试多少件，用的都是「本组尚未出手」的旧值。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            用开头的例子（组 1 = <M>{'(2,3),(3,4)'}</M>，组 2 = <M>{'(2,2),(4,5)'}</M>，容量 6）走几步，把方程「跑起来」，重点盯住<strong>每组只出一件</strong>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>初始化第 0 行。</b> 一组都不考虑，任何容量下价值都是 0：<M>{'f[0][0..6]=0'}</M>。整张表的地基。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>处理组 1</b>（含 <M>{'(2,3),(3,4)'}</M>）。看容量 5：不选本组 = <M>{'f[0][5]=0'}</M>；选 <M>{'(2,3)'}</M> = <M>{'f[0][3]+3=3'}</M>；选 <M>{'(3,4)'}</M> = <M>{'f[0][2]+4=4'}</M>。三者取最大 → <M>{'f[1][5]=4'}</M>。第 1 行整体为 <M>{'0,0,3,4,4,4,4'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>处理组 2</b>（含 <M>{'(2,2),(4,5)'}</M>），看容量 6：不选本组 = <M>{'f[1][6]=4'}</M>；选 <M>{'(2,2)'}</M> = <M>{'f[1][4]+2=4+2=6'}</M>；选 <M>{'(4,5)'}</M> = <M>{'f[1][2]+5=3+5=8'}</M>。取最大 → <M>{'f[2][6]=8'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>读答案。</b> <M>{'f[2][6]=8'}</M>——它来自「组 1 选 <M>{'(2,3)'}</M> + 组 2 选 <M>{'(4,5)'}</M>」，重 <M>{'2+4=6'}</M>、价值 <M>{'3+5=8'}</M>。<strong>每组恰好一件</strong>，正是分组规则下的最优。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示会把整张表<strong>逐格填满</strong>，高亮每格「跳过本组」与「选组内某件」两个来源。改改组、件或容量，看表实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它一格一格长出来</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackGroupDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">压成一维：三重循环，与那道循环顺序的坎</h2>
        <div className="prose">
          <p>
            和 01 背包一样，转移只用到<strong>上一行</strong> <M>{'f[g-1][\\cdot]'}</M>，于是可以卷成一维 <M>{'f[j]'}</M> 就地更新。
            但组内多了一层枚举，一维写法的循环<strong>套三层</strong>，顺序有讲究：
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
{`for 组 g = 1 … G:
  for j = m downto 0:        // ★容量倒序，在组内枚举之外
    for 组内每件 (w, v):
      f[j] = max( f[j], f[j − w] + v )`}
          </pre>
          <p>
            记住这个骨架的关键：<strong>容量循环 <M>{'j'}</M> 必须在「组内物品枚举」的外层</strong>，而且照旧<strong>倒序</strong>。
            这样一来，处理组 <M>{'g'}</M> 时，无论组内枚举到第几件，<M>{'f[j-w]'}</M> 用的都是<strong>本组还没动过的旧值</strong>（即上一行的值）——组内各件都在「本组尚未出手」的同一起点上竞争，自然只会有<strong>一件</strong>胜出被计入。
          </p>
        </div>
        <figure className="figure">
          <GroupLoopOrderFigure />
          <figcaption className="figure__cap">
            左：容量 j 在组内物品之外——组内各件都基于旧值，每组至多选 1 件（正确）。右：容量 j 被塞进组内物品里层——前一件已改 f[j]，同组下一件又叠上去，一组能选出多件，退化成「组内可重复取」（错误）。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">若把容量循环放进组内，会怎样</h2>
        <div className="prose">
          <p>
            把三重循环写反——让<strong>组内物品在外、容量 <M>{'j'}</M> 在里</strong>：
          </p>
          <pre
            className="mono"
            style={{
              margin: 'var(--sp-4) 0',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--r-2)',
              background: 'color-mix(in srgb, var(--viz-invalid) 6%, var(--surface-2))',
              border: '1px solid var(--viz-invalid)',
              fontSize: '13.5px',
              lineHeight: 1.7,
              color: 'var(--text-1)',
              overflowX: 'auto',
              whiteSpace: 'pre',
            }}
          >
{`for 组 g = 1 … G:
  for 组内每件 (w, v):        // ✗ 组内枚举跑到了外层
    for j = m downto 0:
      f[j] = max( f[j], f[j − w] + v )`}
          </pre>
          <p>
            这时组内每一件都<strong>各自独立地跑一遍完整的倒序背包</strong>。第一件更新完 <M>{'f[\\cdot]'}</M> 后，第二件是在<strong>「第一件已经装进去」的结果上</strong>继续做——于是同一组的两件<strong>可以被同时选中</strong>。
            这恰好退化成「把这一组当作若干件<strong>各自独立的 01 物品</strong>」，组内互斥的约束彻底失效。
          </p>
          <p>
            用开头组 1 <M>{'(2,3),(3,4)'}</M>、容量 5 验一下错法：先跑 <M>{'(2,3)'}</M> 得 <M>{'f[5]=3'}</M>；再跑 <M>{'(3,4)'}</M> 时 <M>{'f[5]=\\max(3,\\ f[2]+4)=\\max(3,3+4)=7'}</M>——
            <M>{'f[2]=3'}</M> 里<strong>已经含了 <M>{'(2,3)'}</M></strong>，于是 7 = 两件相加。可正确答案（组内至多一件）只该是 <M>{'4'}</M>。一层循环放错位置，答案就从 4 涨成了 7。
          </p>
        </div>
        <InfoBox kind="warn" title="记死：容量循环夹在「组」与「组内件」之间">
          三重循环的正序是 <strong>组 → 容量(倒序) → 组内件</strong>。容量循环<strong>既不能</strong>提到最外（那样组与组之间会串味），<strong>也不能</strong>沉到最里（那样组内会多选）。它必须<strong>正好夹在中间</strong>。这和 01 背包
          <Link to="/part/b/01" style={{ color: 'var(--accent-2)' }}>「必须倒序」</Link>是同一个「用干净旧值」的道理，只是把粒度从「每件一次」升到了「每组一次」。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">并排看：一层循环放错，答案就涨了</h2>
        <div className="prose">
          <p>
            道理讲完，不如让两种顺序<strong>同跑一遍并排对照</strong>。默认就是本节手算的那组：单独一组 <M>{'(2,3),(3,4)'}</M>、容量 5。
            左边把<strong>容量倒序放在组内件之外</strong>，组内两件都基于「本组未动过」的旧值竞争，只有一件胜出——<M>{'f[5]=4'}</M>；
            右边把<strong>容量倒序沉进组内件里层</strong>，第二件在「第一件已装进去」的结果上继续叠，两件被同时计入——<M>{'f[5]=7'}</M>。
            单步走到右侧 <M>{'j=5'}</M> 那一格，会看到来源列被标红：那正是「同组两件叠在一起」的瞬间。改改 w / v 或再加一组，看这 <M>{'4'}</M> 与 <M>{'7'}</M> 的差随之变化。
          </p>
        </div>
        <div className="demo">
          <div className="demo__body">
            <GroupOrderContrastDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1757" name="通天之分组背包" src="洛谷原生" diff="普及/提高-">
          <Field k="题意">
            背包容量 <M>{'m'}</M>，<M>{'n'}</M> 件物品，每件给出重量 <M>{'a_i'}</M>、价值 <M>{'b_i'}</M> 和<strong>所在组号</strong> <M>{'c_i'}</M>。同一组至多取一件，求最大价值。
          </Field>
          <Field k="为什么选它">
            分组背包最纯净的<strong>裸模板</strong>：读入后按组号归集，直接套三重循环骨架。没有任何抽象包装，是把「组 → 容量倒序 → 组内件」这个顺序<strong>肌肉记忆</strong>下来的最佳一题。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[j]=\\max(f[j],\\ f[j-a_i]+b_i)'}</M>，外层枚举组、中层 <M>{'j'}</M> 倒序、内层枚举组内件；时间 <M>{'O(nm)'}</M>。
          </Field>
          <Field k="参考代码（标准三重循环）">
            <CodeBlock code={CODE_P1757} luogu="P1757" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P5322" name="[BJOI2019] 排兵布阵" src="BJOI2019" diff="提高+">
          <Field k="题意">
            <M>{'S'}</M> 位对手、<M>{'n'}</M> 座城池、你有 <M>{'m'}</M> 名士兵，要把兵力分配到各城。在某城派出严格<strong>多于对手 2 倍</strong>的兵力即击败该对手，击败第 <M>{'i'}</M> 城的对手得 <M>{'i'}</M> 分（对每位对手分别结算）。求最高总分。
          </Field>
          <Field k="状态设计（把城池抽象成组）">
            <strong>每座城池 = 一组</strong>。把该城 <M>{'S'}</M> 位对手在此城的守军<strong>从小到大排序</strong>记为 <M>{'c_1\\le c_2\\le\\dots\\le c_S'}</M>，则「同时击败守军最少的前 <M>{'k'}</M> 名对手」构成组内第 <M>{'k'}</M> 件<strong>物品</strong>：击败一名需严格多于其守军 2 倍，同时击败前 <M>{'k'}</M> 名只需压过其中门槛最高的一位，故<strong>体积</strong> = <M>{'2c_k+1'}</M>（排序后 <M>{'c_k'}</M> 即前 <M>{'k'}</M> 名里的最大守军），<strong>价值</strong> = <M>{'k\\times i'}</M>（击败 <M>{'k'}</M> 名、城池编号 <M>{'i'}</M>）。一组内至多选一件，恰好对应「在这座城要么不争、要么争到前 <M>{'k'}</M> 名」。
          </Field>
          <Field k="为什么选它">
            较新的省选题，示范分组背包的<strong>建模功夫</strong>：真正的难点不是转移，而是<strong>看出「城池是组、击败前 k 名是组内物品」</strong>。转移仍是标准三重循环骨架（见 P1757），代码只需换掉组内物品的「体积/价值」定义。
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <p className="prose" style={{ maxWidth: 'none', fontSize: '13.5px', color: 'var(--text-3)', marginBottom: 'var(--sp-4)' }}>
          说明：纯分组背包的洛谷原生题目池较窄，更多「组内互斥」的进阶练习并入 <Link to="/part/b/dep" style={{ color: 'var(--accent-2)' }}>B7 有依赖的背包</Link> 与 <Link to="/part/f" style={{ color: 'var(--accent-2)' }}>F 树上背包</Link>。下面两题分别从「依赖归约」与「裸模板复现」两头夯实基础。
        </p>
        <Exercise
          pid="P1064"
          name="[NOIP2006 提高组] 金明的预算方案"
          hint="主件-附件的依赖可归约为分组背包：把「一个主件 + 它的若干附件」的所有合法组合（仅主 / 主+附1 / 主+附2 / 主+附1+2）打包成同一组的组内物品，组内至多选一件。也属 B7，做承接。"
        />
        <Exercise
          pid="P1757"
          name="通天之分组背包"
          hint="学完回来独立复现三重循环骨架：外层组、中层容量倒序、内层组内件。不看题解默写一遍，巩固「组内至多一件」为何要靠循环顺序保证。"
        />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        回到 <Link to="/part/b" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>B 部分页的「装包大师」</Link>再挑一挑——虽然它是 01 规则，但「在约束下凑最大价值」的直觉与分组背包相通。
      </div>

      <nav className="type-nav">
        <Link to="/part/b/multiple">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 多重背包
          </span>
        </Link>
        <Link to="/part/b/mixed" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            混合背包 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
