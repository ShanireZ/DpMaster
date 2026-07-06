import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import MatrixPowerDemo from '../../components/demos/matrix/MatrixPowerDemo'
import MatrixBuildDemo from '../../components/demos/matrix/MatrixBuildDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { RecurExplodeFigure, VecMatFigure, FastPowFigure, BuildRowsFigure } from './MatrixPowerArt'

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

const CODE_P1962 = `
#include <iostream>
using namespace std;

typedef long long ll;
const ll MOD = 1000000007;

// 2×2 矩阵，封装乘法（每步取模，防溢出）。斐波那契转移 M = {{1,1},{1,0}}。
struct Mat
{
    ll a[2][2];
};

Mat mul(const Mat &x, const Mat &y)     // 矩阵乘法：C[i][j] = Σ x[i][k]·y[k][j]
{
    Mat c;
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
        {
            ll s = 0;
            for (int k = 0; k < 2; k++)
            {
                s = (s + x.a[i][k] * y.a[k][j]) % MOD; // ★显式 long long + 逐步取模
            }
            c.a[i][j] = s;
        }
    return c;
}

Mat power(Mat base, ll n)               // 矩阵快速幂：base^n
{
    Mat res = {{{1, 0}, {0, 1}}};       // 单位阵起步
    while (n > 0)
    {
        if (n & 1)                      // 当前二进制位为 1 → 累乘
        {
            res = mul(res, base);
        }
        base = mul(base, base);         // 平方倍增
        n >>= 1;
    }
    return res;
}

int main()
{
    ll n;
    cin >> n;
    Mat M = {{{1, 1}, {1, 0}}};
    Mat r = power(M, n - 1);            // F(n) = (M^{n-1})[0][0]，F(1)=F(2)=1
    cout << r.a[0][0] << endl;
    return 0;
}
// TAG: 矩阵DP 矩阵快速幂 斐波那契 取模`

const CODE_P3390 = `
#include <iostream>
using namespace std;

typedef long long ll;
const ll MOD = 1000000007;

int n;                                   // 矩阵阶数（n×n）

struct Mat
{
    ll a[105][105];
};

Mat mul(const Mat &x, const Mat &y)      // 通用 n×n 矩阵乘法，O(n³)
{
    Mat c;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
        {
            ll s = 0;
            for (int k = 1; k <= n; k++)
            {
                s = (s + x.a[i][k] * y.a[k][j]) % MOD;
            }
            c.a[i][j] = s;
        }
    return c;
}

int main()
{
    ll k;
    cin >> n >> k;

    Mat A, res;
    for (int i = 1; i <= n; i++)         // 读入待幂的矩阵
        for (int j = 1; j <= n; j++)
        {
            cin >> A.a[i][j];
        }
    for (int i = 1; i <= n; i++)         // res 初始化为单位阵
        for (int j = 1; j <= n; j++)
        {
            res.a[i][j] = (i == j) ? 1 : 0;
        }

    while (k > 0)                        // 快速幂：A^k
    {
        if (k & 1)
        {
            res = mul(res, A);
        }
        A = mul(A, A);
        k >>= 1;
    }

    for (int i = 1; i <= n; i++)         // 输出结果矩阵
    {
        for (int j = 1; j <= n; j++)
        {
            cout << res.a[i][j] << " \\n"[j == n];
        }
    }
    return 0;
}
// TAG: 矩阵DP 矩阵快速幂 模板`

const CODE_P1939 = `
#include <iostream>
#include <cstring>
using namespace std;

typedef long long ll;
const ll MOD = 1000000000;               // 本题模 1e9

// a[x] = a[x-1] + a[x-3]，a[1]=a[2]=a[3]=1。
// 状态向量 (a[x-1], a[x-2], a[x-3]) → 转移矩阵 {{1,0,1},{1,0,0},{0,1,0}}。
struct Mat
{
    ll a[3][3];
};

Mat mul(const Mat &x, const Mat &y)
{
    Mat c;
    memset(c.a, 0, sizeof(c.a));
    for (int i = 0; i < 3; i++)
        for (int k = 0; k < 3; k++)
        {
            if (x.a[i][k] == 0) continue;   // 稀疏小优化，可省
            for (int j = 0; j < 3; j++)
            {
                c.a[i][j] = (c.a[i][j] + x.a[i][k] * y.a[k][j]) % MOD;
            }
        }
    return c;
}

Mat power(Mat base, ll n)
{
    Mat res;
    memset(res.a, 0, sizeof(res.a));
    for (int i = 0; i < 3; i++) res.a[i][i] = 1;  // 单位阵
    while (n > 0)
    {
        if (n & 1) res = mul(res, base);
        base = mul(base, base);
        n >>= 1;
    }
    return res;
}

int main()
{
    int T;
    cin >> T;
    Mat M = {{{1, 0, 1}, {1, 0, 0}, {0, 1, 0}}};
    while (T--)
    {
        ll n;
        cin >> n;
        if (n <= 3)                       // 前三项直接答 1
        {
            cout << 1 << endl;
            continue;
        }
        Mat r = power(M, n - 3);          // 从 (a3,a2,a1) 推到第 n 项
        // 结果向量第 0 分量 = a[n] = r 作用在初始向量 (1,1,1) 上的首行之和
        ll ans = (r.a[0][0] + r.a[0][1] + r.a[0][2]) % MOD;
        cout << ans << endl;
    }
    return 0;
}
// TAG: 矩阵DP 矩阵加速 自构转移矩阵 取模`

export default function MatrixPower() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当递推项数大到没法一格一格填</h2>
        <div className="prose">
          <p>
            回到最朴素的斐波那契：<M>{'f[i]=f[i-1]+f[i-2]'}</M>，从 <M>{'f[1]=f[2]=1'}</M> 起逐项往上加。
            只要 <M>{'n'}</M> 不大，一个 <M>{'O(n)'}</M> 的循环就够——这正是 <Link to="/part/b/count" style={{ color: 'var(--accent-2)' }}>B 部分计数 DP</Link> 里数楼梯那一套。
            可一旦题目把 <M>{'n'}</M> 抬到 <M>{'n<2^{63}'}</M>（例题 P1962 就是），逐项递推要走近 <strong>九百亿亿</strong> 步，任何机器都算不完。
          </p>
        </div>
        <figure className="figure">
          <RecurExplodeFigure />
          <figcaption className="figure__cap">
            逐项递推每次只前进一格，要走 n 步才到 f[n]；n 达 2⁶³ 时 O(n) 彻底超时，逐格填表的思路在这里失效。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            瓶颈很清楚：递推<strong>一步只跨一项</strong>，代价被死死锁在 <M>{'O(n)'}</M>。要提速，就得想办法<strong>一次跨过很多项</strong>。
            突破口在于——斐波那契这类递推是<strong>线性</strong>的（新项是旧几项的线性组合，没有平方、没有取最值）。
            <strong>线性变换恰好可以写成矩阵乘法</strong>，而「重复施加同一个线性变换 <M>{'n'}</M> 次」就是求矩阵的 <M>{'n'}</M> 次幂——
            幂运算有<strong>快速幂</strong>（二进制倍增），能把 <M>{'n'}</M> 次压成 <M>{'\\log n'}</M> 次。这一节就把这条「递推 → 矩阵 → 快速幂」的加速链讲透。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">把递推写成矩阵乘法</h2>
        <div className="prose">
          <p>
            关键一步：<strong>把「当前需要记住的几项」打包成一个状态向量</strong>。斐波那契的新项只用到前两项，于是取行向量 <M>{'[\\,F(n-1),\\ F(n-2)\\,]'}</M> 作状态。
            我们要找一个<strong>固定的</strong>矩阵 <M>{'M'}</M>，让它右乘这个向量后，正好<strong>整体前移一步</strong>，得到 <M>{'[\\,F(n),\\ F(n-1)\\,]'}</M>：
          </p>
          <MB>{'[\\,F(n),\\ F(n-1)\\,]=[\\,F(n-1),\\ F(n-2)\\,]\\cdot M'}</MB>
        </div>
        <figure className="figure">
          <VecMatFigure />
          <figcaption className="figure__cap">
            状态向量右乘转移矩阵 M=[[1,1],[1,0]]：结果第一列算出 F(n-1)+F(n-2)=F(n)，第二列把 F(n-1) 原样移下——一次乘法 = 递推走一步。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            怎么定出 <M>{'M'}</M> 的每个数？逐个输出分量看它由旧分量<strong>怎样线性组合</strong>：新向量第一个分量要等于 <M>{'F(n)=F(n-1)+F(n-2)'}</M>，
            即旧的两个分量<strong>各取一份</strong>相加 → 对应 <M>{'M'}</M> 的第一列是 <M>{'\\binom{1}{1}'}</M>；新向量第二个分量要等于 <M>{'F(n-1)'}</M>，
            即只取旧的第一个分量 → 第二列是 <M>{'\\binom{1}{0}'}</M>。合起来：
          </p>
          <MB>{'M=\\begin{bmatrix}1 & 1\\\\ 1 & 0\\end{bmatrix}'}</MB>
          <p>
            于是从初始向量 <M>{'[\\,F(2),F(1)\\,]=[\\,1,1\\,]'}</M> 出发，<strong>右乘一次 <M>{'M'}</M> 前进一项</strong>，乘 <M>{'k'}</M> 次就前进 <M>{'k'}</M> 项。
            把 <M>{'k'}</M> 次乘法凑成一个整体，就是 <strong><M>{'M^{k}'}</M></strong>——「跨过一大段递推」被压缩成「求一个矩阵的高次幂」。可以验证 <M>{'M^{n-1}'}</M> 的左上角恰是 <M>{'F(n)'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 递推 ↔ 矩阵，一次乘法 = 一步递推">
          <strong>线性递推</strong>与<strong>矩阵乘法</strong>是同一件事的两种写法：把「本步要用到的历史项」摆成状态向量，转移的每个系数就落进矩阵的一列；
          <strong>右乘一次 <M>{'M'}</M> = 递推推进一步</strong>，<strong>右乘 <M>{'M^{n}'}</M> = 一口气推进 <M>{'n'}</M> 步</strong>。
          原本 <M>{'O(n)'}</M> 的逐项递推，就此转化为「求矩阵幂 <M>{'M^{n}'}</M>」这个能被快速幂加速的问题。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">快速幂：把 Mⁿ 的 n 次拆成 log n 层</h2>
        <div className="prose">
          <p>
            剩下的问题是<strong>怎样快速求 <M>{'M^{n}'}</M></strong>。若老老实实 <M>{'M\\cdot M\\cdot M\\cdots'}</M> 连乘，还是 <M>{'n-1'}</M> 次矩阵乘法，白忙一场。
            <strong>快速幂</strong>（二进制倍增）的思路：把指数 <M>{'n'}</M> 写成<strong>二进制</strong>，例如 <M>{'13=1101_2=8+4+1'}</M>，于是
          </p>
          <MB>{'M^{13}=M^{8}\\cdot M^{4}\\cdot M^{1}'}</MB>
          <p>
            而 <M>{'M^{1},M^{2},M^{4},M^{8},\\dots'}</M> 这串<strong>倍增幂</strong>，每个都是前一个<strong>平方</strong>得来（<M>{'M^{2k}=(M^{k})^{2}'}</M>），只需 <M>{'\\log n'}</M> 次平方就能全部算出。
            再按 <M>{'n'}</M> 的二进制里<strong>哪几位是 1</strong>，把对应的倍增幂<strong>累乘</strong>进结果即可。
          </p>
        </div>
        <figure className="figure">
          <FastPowFigure />
          <figcaption className="figure__cap">
            n=13=1101₂：上排 M,M²,M⁴,M⁸ 靠平方逐个倍增；n 的二进制里为 1 的位（第 0、2、3 位）对应的幂被挑出，相乘得到 M¹³。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            总代价：<M>{'\\log n'}</M> 次平方 + 至多 <M>{'\\log n'}</M> 次累乘，共约 <M>{'2\\log n'}</M> 次<strong>矩阵乘法</strong>；每次矩阵乘法是 <M>{'O(k^{3})'}</M>（<M>{'k'}</M> 为矩阵阶数）。
            合起来 <strong><M>{'O(k^{3}\\log n)'}</M></strong>。斐波那契 <M>{'k=2'}</M>、<M>{'n=2^{63}'}</M> 时也不过约 <M>{'63'}</M> 层倍增、百余次 <M>{'2\\times2'}</M> 乘法，瞬间出解。把这套骨架写成中文伪代码：</p>
          <pre className="mono" style={preMono}>
{`# 矩阵快速幂：求 base^n（base 是 k×k 矩阵）
res = 单位阵 I                 # 任何矩阵乘 I 不变，作累乘的起点
while n > 0:
    if n & 1 == 1:            # 当前二进制最低位为 1
        res = res × base      # ★把这一位对应的倍增幂累乘进结果
    base = base × base        # 平方 → 得到下一个倍增幂 M^(2^k)
    n >>= 1                   # 右移一位，看下一位
return res                    # 循环 ⌊log₂ n⌋+1 次，每次一到两回矩阵乘法`}
          </pre>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把 <M>{'n'}</M> 写成二进制，<strong>逐位</strong>展示 <M>{'M,M^2,M^4,\\dots'}</M> 的平方倍增，并把「位为 1」的幂累乘成 <M>{'M^{n}'}</M>。改指数 <M>{'n'}</M>，看矩阵数值、当前操作与步数对比实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看 Mⁿ 在倍增里累乘出来</h2>
        <div className="demo">
          <div className="demo__body">
            <MatrixPowerDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">深化 · 非标准递推：怎么构造转移矩阵</h2>
        <div className="prose">
          <p>
            斐波那契的 <M>{'M'}</M> 太经典，容易让人以为矩阵是「背下来」的。真正的功夫在于<strong>面对一个陌生递推，自己把矩阵拼出来</strong>。
            来看一个非标准递推（正是例题 P1939 的模型）：<M>{'a[x]=a[x-1]+a[x-3]'}</M>——新项跳过了 <M>{'a[x-2]'}</M>，只由 <M>{'a[x-1]'}</M> 和 <M>{'a[x-3]'}</M> 决定。
          </p>
          <p>
            <strong>第一步，定状态向量。</strong>新项用到往前<strong>三项</strong>（最远到 <M>{'a[x-3]'}</M>），所以状态要装下最近三项：<M>{'[\\,a[x-1],\\ a[x-2],\\ a[x-3]\\,]'}</M>，是 <strong>3 维</strong>向量，矩阵就是 <M>{'3\\times3'}</M>。
            推进一步后，新状态应当是 <M>{'[\\,a[x],\\ a[x-1],\\ a[x-2]\\,]'}</M>。
          </p>
          <p>
            <strong>第二步，逐行确定系数——盯住新状态的每个分量由旧分量怎样组合：</strong>
          </p>
          <MB>{'M=\\begin{bmatrix}1 & 0 & 1\\\\ 1 & 0 & 0\\\\ 0 & 1 & 0\\end{bmatrix}'}</MB>
        </div>
        <figure className="figure">
          <BuildRowsFigure />
          <figcaption className="figure__cap">
            a[x]=a[x-1]+a[x-3] 的 3×3 转移矩阵：首行是递推系数 [1,0,1]（真正做加法的一行）；其余两行是「位移行」，把旧的 a[x-1]、a[x-2] 原样搬下来，各只有一个 1。
          </figcaption>
        </figure>
        <div className="prose">
          <p>
            读这三行——<strong>第一行（算 <M>{'a[x]'}</M>）</strong>：<M>{'a[x]=1\\cdot a[x-1]+0\\cdot a[x-2]+1\\cdot a[x-3]'}</M>，系数就是递推式里的系数，写成 <M>{'[\\,1,0,1\\,]'}</M>——<strong>这是唯一「真正做递推加法」的一行</strong>。
            <strong>第二行（算 <M>{'a[x-1]'}</M>）</strong>：新状态里的 <M>{'a[x-1]'}</M> 不过是旧状态里现成的 <M>{'a[x-1]'}</M>，原样搬过来 → <M>{'[\\,1,0,0\\,]'}</M>。
            <strong>第三行（算 <M>{'a[x-2]'}</M>）</strong>：同理搬旧的 <M>{'a[x-2]'}</M> → <M>{'[\\,0,1,0\\,]'}</M>。
            后两行统称<strong>位移行</strong>，作用只是把向量整体「下移一格」，好腾出位置给新项——它们对任何这类递推都长得差不多，套路固定。
          </p>
        </div>
        <InfoBox kind="key" title="构造要诀 · 一行递推系数，其余全是位移">
          面对形如 <M>{'a[x]=\\sum_{t\\ge1} c_t\\,a[x-t]'}</M> 的<strong>常系数线性递推</strong>：状态向量取<strong>最近的若干项</strong>（维数 = 递推用到的最远回溯步数）；
          转移矩阵<strong>第一行</strong>直接填递推系数 <M>{'[\\,c_1,c_2,\\dots\\,]'}</M>，<strong>其余每一行</strong>是把旧分量原样下移的<strong>位移行</strong>（一个 1，其余 0）。
          矩阵一旦搭好，求第 <M>{'x'}</M> 项就是算 <M>{'M^{x}'}</M> 乘初始向量，复杂度 <M>{'O(k^{3}\\log x)'}</M>——<strong>递推越是「奇形怪状」，这套矩阵化越显威力</strong>。
        </InfoBox>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示给你两个递推预设，把状态向量、转移矩阵、输出向量<strong>并排</strong>摆好；点矩阵任意一行，它会点亮对应的输出分量并讲清<strong>这一行系数从哪来</strong>。切换预设，看维数与矩阵一起变。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看转移矩阵怎么从递推拼出来</h2>
        <div className="demo">
          <div className="demo__body">
            <MatrixBuildDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1962" name="斐波那契数列" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            求斐波那契数列第 <M>{'n'}</M> 项对 <M>{'10^9+7'}</M> 取模的值，<M>{'F(1)=F(2)=1'}</M>，<strong><M>{'n<2^{63}'}</M></strong>。
          </Field>
          <Field k="为什么选它">
            <M>{'n'}</M> 大到 <M>{'2^{63}'}</M>，逐项递推的 <M>{'O(n)'}</M> 无论如何都超时——<strong>逼你把递推矩阵化再快速幂</strong>。是「递推 → 矩阵快速幂」这条加速链最干净的入门题，一切从这个 <M>{'2\\times2'}</M> 的 <M>{'M'}</M> 开始。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'M=[[1,1],[1,0]]'}</M>，答案取 <M>{'(M^{n-1})[0][0]'}</M>；每次矩阵乘法 <M>{'O(2^{3})'}</M>，快速幂 <M>{'O(\\log n)'}</M> 层，总 <M>{'O(8\\log n)'}</M>。
          </Field>
          <Field k="参考代码（2×2 矩阵快速幂）">
            <CodeBlock code={CODE_P1962} luogu="P1962" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P3390" name="【模板】矩阵快速幂" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            给定 <M>{'n\\times n'}</M> 矩阵 <M>{'A'}</M> 与指数 <M>{'k'}</M>，求 <M>{'A^{k}'}</M> 的每个元素对 <M>{'10^9+7'}</M> 取模。
          </Field>
          <Field k="为什么选它">
            把「<strong>矩阵乘法 + 快速幂</strong>」这副骨架单独拎出来夯实——没有递推包装，纯粹练 <M>{'O(n^3)'}</M> 通用矩阵乘法和二进制倍增的写法。写熟了它，所有矩阵加速题的底座就通了。
          </Field>
          <Field k="转移 · 复杂度">
            单位阵起步，<M>{'k'}</M> 按二进制逐位：为 1 则累乘、每步平方；矩阵乘法 <M>{'O(n^3)'}</M>，共 <M>{'O(n^{3}\\log k)'}</M>。
          </Field>
          <Field k="参考代码（通用 n×n 快速幂）">
            <CodeBlock code={CODE_P3390} luogu="P3390" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1939" name="【模板】矩阵加速（数列）" src="洛谷原生" diff="普及+/提高">
          <Field k="题意">
            数列 <M>{'a[1]=a[2]=a[3]=1'}</M>，<M>{'a[x]=a[x-1]+a[x-3]'}</M>（<M>{'x\\ge4'}</M>），<M>{'T'}</M> 组询问，每组求 <M>{'a[n]\\bmod 10^9'}</M>，<M>{'n\\le 2\\times10^{9}'}</M>。
          </Field>
          <Field k="为什么选它">
            典型的<strong>非标准递推自构转移矩阵</strong>：跳项的 <M>{'a[x]=a[x-1]+a[x-3]'}</M> 逼你亲手推出 <M>{'3\\times3'}</M> 的 <M>{'M=[[1,0,1],[1,0,0],[0,1,0]]'}</M>（一行系数 + 两行位移），正是本页深化演示所讲。
          </Field>
          <Field k="转移 · 复杂度">
            状态 <M>{'[a[x-1],a[x-2],a[x-3]]'}</M>，求 <M>{'M^{n-3}'}</M> 作用于初始向量；单组 <M>{'O(3^{3}\\log n)'}</M>，多组累加。
          </Field>
          <Field k="参考代码（3×3 自构矩阵）">
            <CodeBlock code={CODE_P1939} luogu="P1939" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise
          pid="P2233"
          name="[HNOI2002] 公交车路线"
          hint="8 个站点排成环 = 邻接矩阵 A（相邻两站连边）。定长路径计数：A^k 的第 (i,j) 项 = 从 i 走恰好 k 步到 j 的方案数。用矩阵快速幂求 A^n，读出起点到终点的方案数（注意不能提前到终点，需按题意处理）。"
        />
        <Exercise
          pid="P4159"
          name="[SCOI2009] 迷路"
          hint="带边权（1~9）的定长路径计数。把每条权为 w 的边拆成 w 段、中间加虚拟点，化为 0/1 邻接矩阵（规模 9n×9n），再对邻接矩阵做矩阵快速幂求 T 时刻从起点到终点的方案数 mod 2009。拆点是关键技巧。"
        />
        <Exercise
          pid="P1707"
          name="刷题比赛"
          hint="多条数列相互耦合的递推。把所有相关量塞进一个大状态向量，按题目给的耦合关系写出一个大转移矩阵，矩阵快速幂一并推进。核心是「多个序列 → 合并成一个高维状态 → 一个矩阵统一转移」。"
        />
      </section>

      <nav className="type-nav">
        <Link to="/part/d/grid">
          <span className="dir">← 上一类型</span>
          <span className="nm">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 网格 / 矩阵上的 DP
          </span>
        </Link>
        <span />
      </nav>
    </>
  )
}
