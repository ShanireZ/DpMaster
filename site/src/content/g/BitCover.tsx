import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import CoverDemo from '../../components/demos/bitmask/CoverDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { BitLattice, CoverMaskFigure } from './BitArt'

const CODE_P2831 = `
#include <iostream>
#include <cstring>
#include <cmath>
#include <algorithm>
using namespace std;

const double EPS = 1e-6;
int T, n, m;
double X[20], Y[20];
int line[20][20];               // line[i][j]：过点 i、j 的抛物线能打掉的猪 mask
int f[1 << 18];

int main()
{
    cin >> T;
    while (T--)
    {
        cin >> n >> m;
        for (int i = 0; i < n; i++) cin >> X[i] >> Y[i];
        memset(line, 0, sizeof line);

        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
            {
                if (fabs(X[i] - X[j]) < EPS) continue;      // 竖直，无法定抛物线
                // 由 (X[i],Y[i])、(X[j],Y[j]) 解 y=a x^2 + b x（过原点）
                double a = (Y[i] / X[i] - Y[j] / X[j]) / (X[i] - X[j]);
                double b = Y[i] / X[i] - a * X[i];
                if (a > -EPS) continue;                     // 开口必须朝下
                int s = 0;
                for (int k = 0; k < n; k++)                 // ★这条线覆盖哪些猪
                    if (fabs(a * X[k] * X[k] + b * X[k] - Y[k]) < EPS)
                        s |= (1 << k);
                line[i][j] = s;
            }

        memset(f, 0x3f, sizeof f);
        f[0] = 0;
        for (int S = 0; S < (1 << n); S++)
        {
            if (f[S] == 0x3f3f3f3f) continue;
            int p = 0;
            while (p < n && (S >> p & 1)) p++;              // 找第一只没打的猪 p
            if (p == n) continue;
            f[S | (1 << p)] = min(f[S | (1 << p)], f[S] + 1); // 单点一发
            for (int j = 0; j < n; j++)                     // 选一条过 p 的抛物线
                f[S | line[p][j]] = min(f[S | line[p][j]], f[S] + 1);
        }
        cout << f[(1 << n) - 1] << endl;
    }
    return 0;
}`

const CODE_P3959 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int n, m;
int road[15][15];               // 两点间道路长度（无边为 INF）
int cost[1 << 12][15];          // cost[S][j]：从集合 S 向外接一步到 j 的最小边权
int f[13][1 << 12];             // f[dep][S]：已连成集合 S、最大深度 dep 的最小代价

int main()
{
    memset(road, 0x3f, sizeof road);
    cin >> n >> m;
    for (int i = 0; i < m; i++)
    {
        int a, b, c; cin >> a >> b >> c;
        a--; b--;
        road[a][b] = road[b][a] = min(road[a][b], c);
    }

    // 预处理：集合 S 之外的点 j，到 S 的最短单边
    for (int S = 0; S < (1 << n); S++)
        for (int j = 0; j < n; j++)
        {
            if (S >> j & 1) continue;
            int mn = 0x3f3f3f3f;
            for (int i = 0; i < n; i++)
                if ((S >> i & 1) && road[i][j] < mn) mn = road[i][j];
            cost[S][j] = mn;
        }

    memset(f, 0x3f, sizeof f);
    for (int i = 0; i < n; i++) f[1][1 << i] = 0;   // 任一点单独作根，深度 1

    for (int dep = 2; dep <= n; dep++)
        for (int S = 1; S < (1 << n); S++)
        {
            if (f[dep - 1][S] == 0x3f3f3f3f) continue;
            int rest = ((1 << n) - 1) ^ S;              // S 外的点
            // ★枚举 rest 的非空子集 sub，作为这一层新接入的点
            for (int sub = rest; sub; sub = (sub - 1) & rest)
            {
                int w = 0; bool ok = true;
                for (int j = 0; j < n; j++)
                    if (sub >> j & 1)
                    {
                        if (cost[S][j] == 0x3f3f3f3f) { ok = false; break; }
                        w += cost[S][j];                // 每个新点边权 × 当前深度
                    }
                if (!ok) continue;
                f[dep][S | sub] = min(f[dep][S | sub],
                                      f[dep - 1][S] + w * (dep - 1));
            }
        }

    int ans = 0x3f3f3f3f;
    for (int dep = 1; dep <= n; dep++)
        ans = min(ans, f[dep][(1 << n) - 1]);
    cout << ans << endl;
    return 0;
}`

export default function BitCover() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当「一步」能盖住一批元素</h2>
        <div className="prose">
          <p>
            TSP 里，走一步只到达<strong>一个</strong>新点。但很多问题里，一次「选择」能一口气<strong>覆盖一批元素</strong>：一条抛物线砸下去打掉好几只猪、按一个开关翻转好几盏灯、修一条路连通好几个城市。目标不再是「排好顺序」，而是「<strong>用最小代价把全部元素覆盖掉</strong>」。
          </p>
          <p>
            先看一个抽象的小例子：全集有 5 个元素 <M>{'\\{0,1,2,3,4\\}'}</M>，有若干「选择」，每个选择覆盖其中一部分、各有代价。要选出一组选择，让它们的覆盖<strong>并起来等于全集</strong>，总代价最小。这就是<strong>集合覆盖</strong>——它是 NP 难的，但当元素个数 <M>{'n\\le 20'}</M> 时，状压给出可行解。
          </p>
        </div>
        <figure className="figure">
          <CoverMaskFigure />
          <figcaption className="figure__cap">每个选择覆盖的元素压成一个 mask；若干 mask 按位或起来，填满全集 (1&lt;&lt;5)−1 就算覆盖完成。</figcaption>
        </figure>
        <div className="prose">
          <p>
            关键的预处理：把每个选择「<strong>覆盖了哪些元素</strong>」压成一个 mask。于是「加入一个选择」就是把当前已覆盖集合 <M>{'S'}</M> 和这个选择的 mask 做<strong>按位或</strong>——<M>{'S'}</M> 只会变大或不变，永远单调朝全集靠拢。「覆盖满」就是 <M>{'S=(1{<}{<}n)-1'}</M>。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状态与转移：dp[S] = 覆盖 S 的最小代价</h2>
        <div className="prose">
          <p>
            <strong>定状态。</strong>这里的集合 <M>{'S'}</M> 含义变了——不再是 TSP 的「已访问点」，而是「<strong>已被覆盖的元素</strong>」。设 <M>{'dp[S]'}</M> = 让 <M>{'S'}</M> 里所有元素都被覆盖所需的<strong>最小代价</strong>。注意状态只有<strong>一维</strong>，没有「当前点」——因为覆盖问题不关心顺序。
          </p>
          <p>
            <strong>转移。</strong>从 <M>{'dp[S]'}</M> 出发，选第 <M>{'k'}</M> 个选择（覆盖 mask 记 <M>{'c_k'}</M>、代价 <M>{'w_k'}</M>），新覆盖集合是 <M>{'S\\ |\\ c_k'}</M>：
          </p>
          <MB>{'dp[\\,S\\ |\\ c_k\\,]=\\min\\big(dp[S\\ |\\ c_k],\\ dp[S]+w_k\\big)'}</MB>
          <p>
            边界：<M>{'dp[0]=0'}</M>（什么都没覆盖，代价 0），其余 <M>{'+\\infty'}</M>。答案：<M>{'dp[(1{<}{<}n)-1]'}</M>。按 <M>{'S'}</M> 从小到大枚举即可，因为 <M>{'S\\,|\\,c_k\\ge S'}</M>，依赖的子状态先算好。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          状压把「覆盖进度」编码成一个整数：<strong>「还差哪些没盖」一目了然，「加一个选择」就是一次按位或</strong>。TSP 的 <M>{'dp[S][i]'}</M> 关心「停在哪」，覆盖的 <M>{'dp[S]'}</M> 只关心「盖到哪」——同样是 <M>{'2^n'}</M> 个集合状态，少一维。预处理每个选择的覆盖 mask，是这类题的<strong>题眼</strong>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>用 4 个元素的小例子：选择 A 覆盖 <M>{'\\{0,1\\}'}</M> 代价 2、B 覆盖 <M>{'\\{2,3\\}'}</M> 代价 2、C 覆盖全部 <M>{'\\{0,1,2,3\\}'}</M> 代价 5。看 <M>{'dp'}</M> 怎么填：</p>
        </div>
        <figure className="figure">
          <BitLattice bits={[1, 1, 0, 0]} labels={['0', '1', '2', '3']} showBinary={false} />
          <figcaption className="figure__cap">选择 A 的覆盖 mask = 0011（元素 0、1）；顶端为元素编号。</figcaption>
        </figure>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>起点。</b> <M>{'dp[0000]=0'}</M>，其余全设 <M>{'+\\infty'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>从空集用 A。</b> <M>{'0000\\ |\\ 0011=0011'}</M>：<M>{'dp[0011]=\\min(\\infty,0+2)=2'}</M>。同理用 B 得 <M>{'dp[1100]=2'}</M>，用 C 得 <M>{'dp[1111]=5'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>在 A 的基础上用 B。</b> <M>{'S=0011'}</M> 时再选 B：<M>{'0011\\ |\\ 1100=1111'}</M>，<M>{'dp[1111]=\\min(5,\\ dp[0011]+2)=\\min(5,4)=4'}</M>。<strong>A+B 组合（代价 4）比单用 C（代价 5）更省</strong>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>读答案。</b> <M>{'dp[1111]=4'}</M>——覆盖全集的最小代价。状压自动比较了「一步全覆盖」和「拼图式组合」两条路。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'dp[S]'}</M> 按集合从小到大排成一排。改选择的覆盖范围和代价，看每一步按位或如何把覆盖推向全集，终态取到最小代价。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看覆盖一步步填满全集</h2>
        <div className="demo">
          <div className="demo__body">
            <CoverDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">状压不止 TSP：从覆盖到「逐层生成树」</h2>
        <div className="prose">
          <p>
            集合覆盖让我们看清：状压的 <M>{'S'}</M> 可以是<strong>任何「一批东西的选取状态」</strong>，转移的核心是<strong>用按位或把 <M>{'S'}</M> 变大</strong>。顺着这条路，「宝藏」（P3959）把状压推得更远——它求的是一棵<strong>生成树</strong>的最小代价，边权 = 深度 × 长度。
          </p>
          <p>
            它的状态是 <M>{'f[dep][S]'}</M>：已经连成的点集为 <M>{'S'}</M>、当前生成树最大深度为 <M>{'dep'}</M> 的最小代价。转移时，从已连通的 <M>{'S'}</M> 向外「长一层」——枚举 <M>{'S'}</M> <strong>补集的一个子集</strong>作为新接入的点，每个新点用「它到 <M>{'S'}</M> 的最短边 × 当前深度」计费。这里既用到<strong>覆盖式的按位或扩展</strong>，又要<strong>枚举子集</strong>（下一类的核心技巧）。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱：覆盖 mask 的预处理别算错、别漏">
          <strong>愤怒的小鸟</strong>里，两点定一条抛物线要求横坐标不同、开口朝下（<M>{'a<0'}</M>），还要用<strong>浮点误差 <M>{'\\varepsilon'}</M></strong> 判点是否落在线上——漏判或精度不当会让某条线的覆盖 mask 出错，答案随之全错。稳妥的骨架是：先固定「第一只还没打的猪」 <M>{'p'}</M>，再枚举过 <M>{'p'}</M> 的所有抛物线去覆盖，避免重复与遗漏。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2831" name="[NOIP2016 提高组] 愤怒的小鸟" src="NOIP2016" diff="提高+/省选-">
          <Field k="题意">
            平面上 <M>{'n'}</M> 只猪（<M>{'n\\le 18'}</M>），每发小鸟沿一条过原点、开口朝下的抛物线飞行，砸掉线上所有猪，求打光所有猪的最少发数。
          </Field>
          <Field k="为什么选它">
            集合覆盖的<strong>标杆题</strong>：教学点「<strong>两点定抛物线 → 预处理这条线覆盖哪些猪（压成 mask）</strong>」极其清晰。<M>{'dp[S]'}</M>=打掉集合 <M>{'S'}</M> 的最少发数，转移选一条线做按位或。
          </Field>
          <Field k="状态 · 转移 · 复杂度">
            <M>{'dp[S\\,|\\,line]=\\min(\\cdot,dp[S]+1)'}</M>；固定第一只未打的猪减少枚举。<M>{'O(2^n\\cdot n)'}</M>（外加 <M>{'O(n^2)'}</M> 预处理）。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P2831} luogu="P2831" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P3959" name="[NOIP2017 提高组] 宝藏" src="NOIP2017" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 个点、<M>{'m'}</M> 条带权边（<M>{'n\\le 12'}</M>），选一点为根建生成树，一条边的开采代价 = 边权 × 它到根的<strong>层数</strong>，求最小总代价。
          </Field>
          <Field k="换个视角">
            展示「<strong>状压不止 TSP</strong>」：状态 <M>{'f[dep][S]'}</M> 记「已连通点集 + 当前深度」，转移<strong>逐层</strong>把补集的子集接进来。它同时用到「按位或扩展」和「枚举子集」，是承上启下的一题。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P3959} luogu="P3959" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2622" name="关灯问题 II" hint="灯的开关态压成 mask，每个按钮=对若干位做一次翻转（异或）——按一个按钮就是 S ⊕ 按钮mask。求从初始态到全灭的最少按压，状压 + BFS 最短步。" />
        <Exercise pid="P3694" name="邦邦的大合唱站队" hint="把「已经排成连续块的乐队集合」压成 mask，dp[S]=让 S 中乐队各自连续所需最少移出人数，枚举下一个整块接入的乐队——覆盖式扩展 + 前缀计数。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/g/tsp" className="prev">
          <span className="dir">
            <ArrowLeft size={13} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">集合状压 / TSP</span>
        </Link>
        <Link to="/part/g/subset" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            综合技巧：枚举子集 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
