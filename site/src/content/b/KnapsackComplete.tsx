import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackDemo from '../../components/demos/knapsack/KnapsackDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'

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

export default function KnapsackComplete() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">同一种物品，取之不尽</h2>
        <div className="prose">
          <p>
            完全背包与 01 背包只差一个字：每种物品有<strong>无限件</strong>，同一种想拿几件就拿几件。状态定义不变——
            <M>{'f[j]'}</M> 表示容量不超过 <M>{'j'}</M> 的最大价值，转移式子看上去也一样：
          </p>
          <MB>{'f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)'}</MB>
          <p>
            差别<strong>只在循环方向</strong>：01 背包逆推（保证每件至多取一次），完全背包<strong>正推</strong>（
            <M>{'j'}</M> 从 <M>{'w_i'}</M> 到 <M>{'m'}</M>）。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 为什么正推就对了">
          正推时算 <M>{'f[j]'}</M> 用的 <M>{'f[j-w_i]'}</M> 可能<strong>已经包含了第 <M>{'i'}</M> 件</strong>——于是第 <M>{'i'}</M> 件被自然地再取一次。01 背包里这是 bug，完全背包里这<strong>正是我们想要的</strong>：同一物品可被重复计入。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">演示 · 正推让物品重复计入</h2>
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
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P5020" name="[NOIP2018 提高组] 货币系统" hint="把完全背包当「可表示性判定」：一个面值若能被更小面值凑出，就多余。较新名题。" />
        <Exercise pid="P2918" name="[USACO08NOV] Buying Hay S" hint="完全背包求最小花费；注意可以「超采」，容量要开到 m + 最大单件重量。" />
        <Exercise pid="P1832" name="A+B Problem（再升级）" hint="完全背包求方案数：把 n 分解为若干质数之和，f[j] 累加。" />
      </section>

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
