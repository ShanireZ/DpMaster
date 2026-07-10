import { MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import SubsetEnumDemo from '../../components/demos/bitmask/SubsetEnumDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { BitLattice, SubsetEnumFigure, CountVariantFigure } from './BitArt'

const CODE_SUBSET = `
// 枚举集合 S 的所有非空子集 T：经典写法，复杂度对单个 S 是 O(2^popcount(S))
for (int T = S; T; T = (T - 1) & S)
{
    // 这里 T 恰好取遍 S 的每个非空子集
    int rest = S ^ T;           // rest 是 T 在 S 内的补集（另一半）
    // ... 用 (T, rest) 做转移，例如把 S 劈成两块
}

// 对全部 S 求和：Σ 2^popcount(S) = 3^n —— 所以「枚举子集」整体是 O(3^n)`

const CODE_P4163 = `
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

int T;
long long f[1 << 10][1010];      // f[mask][r]：用了数字集合 mask、当前数 mod d = r 的方案数

int main()
{
    cin >> T;
    while (T--)
    {
        char s[15];
        int d;
        cin >> s >> d;
        int n = strlen(s);
        int digit[15];
        for (int i = 0; i < n; i++) digit[i] = s[i] - '0';

        memset(f, 0, sizeof f);
        f[0][0] = 1;                        // 空排列，余数 0

        for (int mask = 0; mask < (1 << n); mask++)
            for (int r = 0; r < d; r++)
            {
                if (f[mask][r] == 0) continue;
                for (int i = 0; i < n; i++)
                {
                    if (mask >> i & 1) continue;        // 第 i 位已用
                    // ★去重：同一层里相同数字只在「首次出现的那位」用一次
                    if (i > 0 && digit[i] == digit[i - 1] && !(mask >> (i - 1) & 1))
                        continue;
                    int nr = (r * 10 + digit[i]) % d;   // 追加一位后的新余数
                    f[mask | (1 << i)][nr] += f[mask][r];
                }
            }

        cout << f[(1 << n) - 1][0] << endl; // 用完所有位、且整除 d
    }
    return 0;
}`

export default function BitSubset() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当转移要「把集合劈成两半」</h2>
        <div className="prose">
          <p>
            前三类里，转移都是往集合里<strong>加一个元素或一批元素</strong>。但有一类问题，转移需要把当前集合 <M>{'S'}</M> <strong>拆成两部分</strong>：一部分交给这一步处理、另一部分留给子问题。比如「把 <M>{'n'}</M> 个任务分给若干天、每天做一个子集」，就要枚举「今天做哪个子集」，剩下的递归。
          </p>
          <p>
            朴素地想：对每个 <M>{'S'}</M> 枚举它的所有子集，再对子集枚举它的子集……听上去是 <M>{'4^n'}</M> 甚至更糟。但有一个漂亮的事实：<strong>「枚举所有集合的所有子集」总共只有 <M>{'3^n'}</M> 对</strong>。因为每个元素对一个 <M>{'(S,T)'}</M> 对只有三种归属——在 <M>{'T'}</M> 里、在 <M>{'S\\setminus T'}</M> 里、或不在 <M>{'S'}</M> 里，共 <M>{'3^n'}</M>。
          </p>
        </div>
        <figure className="figure">
          <SubsetEnumFigure />
          <figcaption className="figure__cap">母集 S=1011 的全部非空子集，由 T=(T−1)&S 依次生成——只在 S 的 1 位上取值，自动跳过 S 之外的元素。</figcaption>
        </figure>
        <div className="prose">
          <p>
            怎么<strong>不重不漏</strong>地枚举 <M>{'S'}</M> 的所有非空子集？这就是本类的招牌代码——一行 <code>for</code>：
          </p>
          <MB>{'\\texttt{for(int T=S; T; T=(T-1)\\&S)}'}</MB>
          <p>
            它从 <M>{'T=S'}</M> 开始，每次令 <M>{'T\\leftarrow(T-1)\\ \\&\\ S'}</M>。<M>{'T-1'}</M> 把最低的 <M>{'1'}</M> 位借位变 <M>{'0'}</M>、其下方全变 <M>{'1'}</M>，再 <M>{'\\&\\,S'}</M> 只保留 <M>{'S'}</M> 里有的位——于是 <M>{'T'}</M> 严格递减、且始终是 <M>{'S'}</M> 的子集，直到 <M>{'0'}</M> 停止。恰好把 <M>{'S'}</M> 的每个非空子集访问一次。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">读懂 (T−1)&S：为什么不重不漏</h2>
        <div className="prose">
          <p>盯住 <M>{'S=1011'}</M> 看一轮。子集要在 <M>{'S'}</M> 的三个 <M>{'1'}</M> 位（第 0、1、3 位）里取值，第 2 位恒为 <M>{'0'}</M>：</p>
        </div>
        <figure className="figure">
          <BitLattice bits={[1, 1, 0, 1]} highlight={[0, 1, 3]} showBinary={false} />
          <figcaption className="figure__cap">母集 S=1011：可自由取值的是第 0、1、3 位（描边）；第 2 位不在 S 里，任何子集该位都是 0。</figcaption>
        </figure>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>从 T=S 起步。</b> <M>{'T=1011'}</M> 是最大的子集（即 <M>{'S'}</M> 自己）。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>一步 (T−1)&S。</b> <M>{'1011-1=1010'}</M>，<M>{'1010\\ \\&\\ 1011=1010'}</M>。跳过了 <M>{'1010'}</M> 与 <M>{'1011'}</M> 之间那些「含第 2 位」的值，直接落到下一个合法子集。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>继续。</b> 依次得到 <M>{'1001,1000,0011,0010,0001'}</M>，到 <M>{'0'}</M> 停。<M>{'S'}</M> 有 3 个 <M>{'1'}</M>，非空子集恰 <M>{'2^3-1=7'}</M> 个，全部命中，无一重复。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示让你<strong>自己拼母集 <M>{'S'}</M></strong>，再单步跑 <code>T=(T−1)&S</code>——看它每一步落在哪个子集、如何绕开 <M>{'S'}</M> 之外的位。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">亲手跑一遍子集枚举</h2>
        <div className="demo">
          <div className="demo__body">
            <SubsetEnumDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">另一副面孔：位掩码 + 附加维做计数</h2>
        <div className="prose">
          <p>
            状压的第二类「综合技巧」，是给位掩码<strong>再挂一维附加状态</strong>，把「求最优」变成「求方案数」。最典型的是<strong>排列计数</strong>：逐位决定「这一位放哪个数字」，用 mask 记「哪些数字已用」，同时挂一维记录某种<strong>附加量</strong>——比如「当前拼出的数 <M>{'\\bmod d'}</M> 的余数」。
          </p>
        </div>
        <figure className="figure">
          <CountVariantFigure />
          <figcaption className="figure__cap">状态 dp[mask][r]：主维 mask 记已用数字集合，附加维 r 记当前数模 d 的余数——位掩码承载「用了谁」，附加维承载「算到哪」。</figcaption>
        </figure>
        <div className="prose">
          <p>
            以「排列」（P4163）为例：给一串数字，求它的<strong>全排列中能被 <M>{'d'}</M> 整除</strong>的有多少个（数字可能重复）。状态 <M>{'dp[mask][r]'}</M> = 已用数字集合为 <M>{'mask'}</M>、当前拼出的数 <M>{'\\bmod d=r'}</M> 的方案数。转移是在末尾追加一个未用的数字 <M>{'digit_i'}</M>：
          </p>
          <MB>{'dp[\\,mask\\,|\\,(1{<}{<}i)\\,]\\big[(r\\cdot 10+digit_i)\\bmod d\\big]\\mathrel{+}=dp[mask][r]'}</MB>
          <p>
            答案是 <M>{'dp[(1{<}{<}n)-1][0]'}</M>——所有位都用上、且余数为 <M>{'0'}</M>（整除）。这里的转移是「加一位」而非「枚举子集」，但同样属于状压综合技巧：<strong>mask 之外挂一维，把最优 DP 改写成计数 DP</strong>。
          </p>
        </div>
        <InfoBox kind="key" title="本质">
          「枚举子集」<M>{'\\big(O(3^n)\\big)'}</M> 与「位掩码 + 附加维计数」是状压的两把<strong>通用扳手</strong>：前者应对「把集合劈成两块」的划分型转移；后者把 <M>{'dp[mask]'}</M> 升成 <M>{'dp[mask][k]'}</M>（<M>{'k'}</M> 为附加量，如余数），让状压能数方案、能带取模、能挂任意可累加的辅助信息。它们不是新模型，而是嫁接在前几类骨架上的技巧。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">回看「宝藏」：层内枚举子集扩展</h2>
        <div className="prose">
          <p>
            上一类里「宝藏」（P3959）是从「集合覆盖」的角度看的；换到「枚举子集」的视角，它其实正是本类技巧的实战——转移时对<strong>已连通集合 <M>{'S'}</M> 的补集</strong>枚举一个子集 <M>{'sub'}</M>，作为「这一层新接入的点」。
          </p>
          <p>
            代码里那句 <code>for(int sub=rest; sub; sub=(sub-1)&rest)</code> 就是子集枚举——<M>{'rest'}</M> 是 <M>{'S'}</M> 的补集，枚举它的每个非空子集当作新增的一层。这也解释了为什么状压 DP 常被说成「<M>{'O(3^n)'}</M> 级别」：一旦转移需要<strong>枚举子集</strong>，复杂度就从 <M>{'2^n'}</M> 抬到 <M>{'3^n'}</M>。
          </p>
        </div>
        <InfoBox kind="warn" title="常见陷阱：计数去重、子集别把空集也算进去">
          <strong>排列计数</strong>里数字可能<strong>重复</strong>，若不去重会把「相同数字换位」的等价排列重复计数。稳妥做法：同一层里，相同数字只允许在<strong>首次出现的那一位</strong>被选（见代码里 <M>{'digit_i=digit_{i-1}'}</M> 且前一位未用则跳过）。另外 <code>for(T=S;T;...)</code> 只枚举<strong>非空</strong>子集——若你的转移需要「空子集」（这一层不接任何点），要<strong>另行单独处理</strong>，别指望这行循环覆盖它。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P4163" name="[SCOI2007] 排列" src="SCOI2007" diff="普及+/提高">
          <Field k="题意">
            给一个数字串和整数 <M>{'d'}</M>，求这些数字的全排列中<strong>能被 <M>{'d'}</M> 整除</strong>的个数（数字可重复，去重后计数），多组数据。
          </Field>
          <Field k="为什么选它">
            <strong>位掩码 + 取模计数</strong>的样板：<M>{'dp[mask][r]'}</M> 主维记已用数字、附加维记 <M>{'\\bmod d'}</M> 的余数，还必须处理<strong>重复数字去重</strong>。把「状压计数变形」的三个要点（掩码、附加维、去重）一次讲全。
          </Field>
          <Field k="状态 · 转移 · 复杂度">
            <M>{'dp[mask|(1{<}{<}i)][(r\\cdot10+d_i)\\bmod d]\\mathrel{+}=dp[mask][r]'}</M>；答案 <M>{'dp[full][0]'}</M>；<M>{'O(2^n\\cdot d\\cdot n)'}</M>。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_P4163} luogu="P4163" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P3959" name="[NOIP2017 提高组] 宝藏" src="NOIP2017" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 个点、<M>{'m'}</M> 条带权边（<M>{'n\\le 12'}</M>），选根建生成树，边代价 = 边权 × 到根层数，求最小总代价。
          </Field>
          <Field k="换个视角">
            与上一类「覆盖」相比，这里换个角度看它的<strong>转移</strong>：对已连通集合 <M>{'S'}</M> 的补集<strong>枚举子集</strong> <M>{'sub'}</M> 作为新一层。正是 <code>sub=(sub-1)&rest</code> 这行子集枚举，把复杂度抬到 <M>{'O(3^n)'}</M>——本类技巧的实战范例。
          </Field>
          <Field k="参考代码">
            <CodeBlock code={CODE_SUBSET} luogu="P3959" title="子集枚举骨架（配合上一类的宝藏完整代码）" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2831" name="[NOIP2016 提高组] 愤怒的小鸟" hint="复用上一类的覆盖 mask：转移也可写成「对未打的猪集合枚举一条线覆盖」。试着把它和补集/子集枚举结合，体会覆盖与子集两种视角的统一。" />
        <Exercise pid="P2915" name="[USACO08NOV] Mixed Up Cows G" hint="位掩码 + 附加维计数的另一例：f[S][i]=用完集合 S、末位是 i 的合法排列数，附加维就是「末位是谁」。转移追加一头与末位编号差 > K 的牛。" />
        <Exercise pid="P3959" name="[NOIP2017 提高组] 宝藏" hint="亲手把「层内枚举子集扩展」写一遍：rest=full ^ S，for(sub=rest; sub; sub=(sub-1)&rest) 枚举新接入的一层，注意深度乘子与边权预处理。" />
      </section>

    </>
  )
}
