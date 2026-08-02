import { Link } from 'react-router-dom'
import { MousePointerClick, Gamepad2 } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import KnapsackMultipleDemo from '../../components/demos/knapsack/KnapsackMultipleDemo'
import MultipleSplitDemo from '../../components/demos/knapsack/MultipleSplitDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { MultipleSetupFigure, BinarySplitFigure, NaiveVsBinaryFigure } from './KnapsackMultipleArt'

const CODE_P2347 = `
#include <iostream>
using namespace std;

int a[7];                    // 六种砝码的个数
int val[7] = {0, 1, 2, 3, 5, 10, 20};  // 对应面值
bool f[1005];                // f[j]：重量 j 能否被称出

int main()
{
    for (int i = 1; i <= 6; i++)
        cin >> a[i];

    int S = 0;                          // 可达重量的上界
    for (int i = 1; i <= 6; i++)
        S += a[i] * val[i];

    f[0] = true;                        // 重量 0 恒可达（不放砝码）
    for (int i = 1; i <= 6; i++)        // 逐种砝码
        for (int k = 1; k <= a[i]; k++) // ★朴素：这一种一件一件地放
            for (int j = S; j >= val[i]; j--)   // 每件都是一次 01 逆推
                if (f[j - val[i]])
                    f[j] = true;

    int cnt = 0;
    for (int j = 1; j <= S; j++)        // 统计非零可达重量的种数
        if (f[j]) cnt++;

    cout << cnt << endl;
    return 0;
}`

const CODE_P1776 = `
#include <iostream>
#include <algorithm>
using namespace std;

int f[40005];                // f[j]：容量不超过 j 的最大价值
int w2[100005], v2[100005];  // 二进制拆分后的「打包件」
int cnt;                     // 打包件总数

int main()
{
    int n, W;
    cin >> n >> W;
    for (int i = 1; i <= n; i++)
    {
        int v, w, m;                    // 价值、重量、件数上限
        cin >> v >> w >> m;

        int k = 1;                      // ★二进制拆分：1,2,4,… 各捆一包
        while (k < m)
        {
            cnt++;
            w2[cnt] = k * w;            // 一包含 k 件，等效重量 k*w
            v2[cnt] = k * v;            // 等效价值 k*v
            m -= k;
            k <<= 1;                    // k 翻倍
        }
        if (m > 0)                      // 余数单独成一包
        {
            cnt++;
            w2[cnt] = m * w;
            v2[cnt] = m * v;
        }
    }

    for (int i = 1; i <= cnt; i++)      // 每个打包件当一件做 01 背包
        for (int j = W; j >= w2[i]; j--)    // ★逆推：一包至多用一次
            f[j] = max(f[j], f[j - w2[i]] + v2[i]);

    cout << f[W] << endl;
    return 0;
}`

const CODE_MULTIPLE_MONOQUEUE = `
#include <deque>
#include <iostream>
#include <vector>
using namespace std;

int main()
{
    int n, W;
    cin >> n >> W;
    vector<long long> f(W + 1, 0);

    for (int i = 1; i <= n; i++)
    {
        int v, w, m;                         // 价值、重量、件数上限
        cin >> v >> w >> m;
        vector<long long> g = f;             // g：还没加入第 i 种物品的旧状态

        for (int r = 0; r < w && r <= W; r++) // 容量按 j mod w 分成 w 条链
        {
            deque<int> q;                    // 存链上的下标 x，不是容量 j
            auto score = [&](int x) {
                return g[r + x * w] - 1LL * x * v;
            };

            for (int k = 0, j = r; j <= W; k++, j += w)
            {
                while (!q.empty() && q.front() < k - m)
                    q.pop_front();           // 超过 m 件，窗口左端失效
                while (!q.empty() && score(q.back()) <= score(k))
                    q.pop_back();            // 保持候选分数单调递减
                q.push_back(k);              // x=k 表示这一种取 0 件

                int x = q.front();
                f[j] = g[r + x * w] + 1LL * (k - x) * v;
            }
        }
    }

    cout << f[W] << endl;
    return 0;
}`

export default function KnapsackMultiple() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">介于「一件」与「无限件」之间</h2>
        <div className="prose">
          <p>
            前两类背包卡在两个极端：<Link to="/part/a/01" style={{ color: 'var(--accent-2)' }}>01 背包</Link>每种<strong>至多一件</strong>，
            <Link to="/part/a/complete" style={{ color: 'var(--accent-2)' }}>完全背包</Link>每种<strong>无限件</strong>。现实往往在中间，第 <M>{'i'}</M> 种物品<strong>恰好有 <M>{'m_i'}</M> 件</strong>，
            多了没有，这就是<strong>多重背包</strong>。
          </p>
        </div>
        <figure className="figure">
          <MultipleSetupFigure />
          <figcaption className="figure__cap">每种物品带 ×m 徽标：物品 1（w=2,v=3）只有 3 件，物品 2（w=3,v=5）只有 2 件，不能像完全背包那样无限取。</figcaption>
        </figure>
        <div className="prose">
          <p>
            最直接的想法：既然第 <M>{'i'}</M> 种有 <M>{'m_i'}</M> 件，那就当成 <M>{'m_i'}</M> 件<strong>各不相同的 01 物品</strong>摊开，全丢进 01 背包。
            正确，但慢，若每种都有上万件，物品总数 <M>{'\\sum m_i'}</M> 会爆炸，<M>{'O(V\\cdot\\sum m_i)'}</M> 直接超时。
          </p>
          <p>
            也别想着「一件一件试着放」：对同一种枚举「取 0 件、1 件、…、<M>{'m_i'}</M> 件」，本质还是把 <M>{'m_i'}</M> 件逐个塞进去，复杂度一样是 <M>{'O(V\\cdot\\sum m_i)'}</M>。
            问题的关键是：<strong>能不能用远少于 <M>{'m_i'}</M> 个「物品」，就表达出「取 0…<M>{'m_i'}</M> 件」的全部可能？</strong>这一节的主角，<strong>二进制拆分</strong>，正是干这个的。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">朴素解：把每种拆成 m 件 01 物品</h2>
        <div className="prose">
          <p>
            先把最朴素的解法写清楚，它是后面所有优化的地基。<strong>状态照搬 01 背包</strong>：<M>{'f[j]'}</M> 表示容量不超过 <M>{'j'}</M> 时的最大价值。
            对第 <M>{'i'}</M> 种物品，把它当作 <M>{'m_i'}</M> 件相同的 01 物品，一件一件地做逆推：
          </p>
          <MB>{'\\text{for } k=1\\dots m_i:\\quad f[j]=\\max\\big(f[j],\\ f[j-w_i]+v_i\\big)\\ \\ (j:\\,W\\to w_i)'}</MB>
          <p>
            内层<strong>必须逆推</strong>，道理和 01 背包完全一样：每「件」至多取一次，逆推让 <M>{'f[j-w_i]'}</M> 停在「这件还没放进来」的旧值上。
            循环层次是「物品种 <M>{'\\times'}</M> 件数 <M>{'\\times'}</M> 容量」，复杂度 <M>{'O(V\\cdot\\sum m_i)'}</M>。
          </p>
        </div>
        <InfoBox kind="key" title="本质 · 多重背包 = 带件数上限的 01 背包">
          多重背包并没有新机制：它就是 01 背包，只不过同一种物品被允许取<strong>不超过 <M>{'m_i'}</M> 次</strong>。
          朴素解把「<M>{'m_i'}</M> 次」老老实实摊成 <M>{'m_i'}</M> 件，正确但冗余。后面要做的，全是<strong>如何更省地表达这 <M>{'m_i'}</M> 次</strong>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">二进制拆分：用 log 个「打包件」代替 m 件</h2>
        <div className="prose">
          <p>
            朴素解的浪费在于：取 5 件，它非要一件一件加五次。可如果我手上有「1 件装」「2 件装」「4 件装」这样的<strong>打包件</strong>，
            想凑 5 件，只需拿「1 件装 + 4 件装」，两次就够。这正是<strong>二进制拆分</strong>的思想：把 <M>{'m_i'}</M> 件拆成 <M>{'1,\\ 2,\\ 4,\\ \\dots,\\ 2^{k-1}'}</M> 这些 2 的幂，再加上一个<strong>余数包</strong>
          </p>
          <MB>{'r=m_i-(2^{k}-1)\\ \\ (\\text{where } 2^{k}-1\\le m_i)'}</MB>
          <p>
            每个「打包件」含 <M>{'c'}</M> 件原物，就等效成<strong>一件</strong>重量 <M>{'c\\,w_i'}</M>、价值 <M>{'c\\,v_i'}</M> 的新物品，扔进 01 背包（逆推，每包至多用一次）。
          </p>
        </div>
        <figure className="figure">
          <BinarySplitFigure />
          <figcaption className="figure__cap">m=13 拆成 1、2、4、余6 四个打包件，用约 ⌈log⌉ 个包，就表达出「取 0…13 件」的每一种可能。</figcaption>
        </figure>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          把上面的静态图变可玩：拖动<strong>件数上限 <M>{'m'}</M></strong>，实时看它拆成哪几个打包件（段宽 ∝ 该包件数），下方 <M>{'0\\dots m'}</M> 覆盖带示意「任选若干包相加恰好凑出每一个件数」，读数条对比<strong>朴素 <M>{'m'}</M> 个 vs 二进制 ⌈log⌉ 个</strong>。试试 <M>{'m=7'}</M>（3 包）、<M>{'m=13'}</M>（4 包）。
        </div>
        <div className="demo">
          <div className="demo__body">
            <MultipleSplitDemo />
          </div>
        </div>
        <div className="prose">
          <p>
            <strong>为什么这几个包能凑出 0…<M>{'m_i'}</M> 的任意件数？</strong>先只看 <M>{'1,2,4,\\dots,2^{k-1}'}</M> 这几个 2 的幂，这正是<strong>二进制</strong>：
            任何 <M>{'0'}</M> 到 <M>{'2^{k}-1'}</M> 之间的整数，都能唯一地写成它们的子集和（比如 <M>{'5=1+4'}</M>、<M>{'6=2+4'}</M>）。
            于是这部分覆盖了 <M>{'0\\dots 2^{k}-1'}</M> 件。再补上<strong>余数 <M>{'r'}</M></strong> 这一包：把它加进来，相当于让可凑范围整体<strong>平移 <M>{'r'}</M></strong>，
            正好把上界从 <M>{'2^{k}-1'}</M> 顶到 <M>{'2^{k}-1+r=m_i'}</M>，中间不留缝。既不重复、也不遗漏，恰好 <M>{'0\\dots m_i'}</M>。
          </p>
          <p>
            拆完后，打包件总数从 <M>{'m_i'}</M> 降到 <M>{'\\lceil\\log_2(m_i+1)\\rceil'}</M>，复杂度随之从 <M>{'O(V\\cdot\\sum m_i)'}</M> 压到
            <strong> <M>{'O\\!\\big(V\\cdot\\sum\\log m_i\\big)'}</M></strong>。这是多重背包的<strong>主力解法</strong>。
          </p>
        </div>
        <figure className="figure">
          <NaiveVsBinaryFigure />
          <figcaption className="figure__cap">件数上限 7 与 15 两种物品：朴素要做 22 次 01 转移，二进制拆分只需 7 次，m 越大，差距越悬殊。</figcaption>
        </figure>
        <InfoBox kind="key" title="本质 · 拆完就是 01 背包">
          二进制拆分把多重背包<strong>彻底还原成 01 背包</strong>：每个打包件就是一件普通 01 物品，逆推、取或不取，规则分毫不差。
          所以它天然是 <Link to="/part/a/mixed" style={{ color: 'var(--accent-2)' }}>混合背包</Link>的一块拼图，01、完全、多重三种物品能同题混装，正因为它们最终都落在同一套一维转移上。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍：把 3 件拆成两包</h2>
        <div className="prose">
          <p>
            用一种物品 <M>{'(w,v,m)=(2,3,3)'}</M>、容量 6 走一遍。先拆件数 <M>{'m=3'}</M>：取 1（剩 2），再取 2（剩 0），得两个包，<strong>×1 包</strong>（<M>{'w{=}2,v{=}3'}</M>）与 <strong>×2 包</strong>（<M>{'w{=}4,v{=}6'}</M>）。
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>初始化。</b> 空背包，<M>{'f[0..6]=0'}</M>。地基和 01 背包一样。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>放 ×1 包</b>（<M>{'w=2,v=3'}</M>），逆推 <M>{'j:6\\to 2'}</M>。每格 <M>{'f[j]=\\max(f[j],f[j-2]+3)'}</M>，因来源都是旧值 0，第 1 行变成 <M>{'0,0,3,3,3,3,3'}</M>。这一包只代表「取 1 件」。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>放 ×2 包</b>（<M>{'w=4,v=6'}</M>），逆推 <M>{'j:6\\to 4'}</M>。看 <M>{'f[6]=\\max(3,\\ f[2]+6)=\\max(3,9)=9'}</M>，<M>{'f[2]=3'}</M> 是「×1 包」留下的，加上「×2 包」的 6，正好是 <strong>1+2=3 件</strong>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>读答案。</b> <M>{'f[6]=9'}</M>，容量 6、每件重 2，最多装 3 件，价值 <M>{'3\\times3=9'}</M>。两个包组合出的最大件数正好卡在上限 3，没有超过。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把每个<strong>打包件</strong>逐格做 01 逆推，读数条实时显示「朴素 Σm vs 二进制 Σlog」的打包数差距。改物品的 <M>{'w,v,m'}</M> 或容量试试。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看它把每个打包件逐格放进去</h2>
        <div className="demo">
          <div className="demo__body">
            <KnapsackMultipleDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">再进一步：单调队列 O(V·n)（选讲）</h2>
        <div className="prose">
          <p>
            二进制拆分已经够快，应付绝大多数题目。但还有一层<strong>理论最优</strong>：<M>{'O(V\\cdot n)'}</M> 的<strong>单调队列优化</strong>，连那个 <M>{'\\log'}</M> 都抹掉。
          </p>
          <p>
            思路是：把容量 <M>{'j'}</M> 按<strong>对 <M>{'w_i'}</M> 取模</strong>的余数分组，同余的那些 <M>{'j'}</M>（即 <M>{'r, r{+}w_i, r{+}2w_i,\\dots'}</M>）恰好构成一条「取第 <M>{'i'}</M> 种若干件」的链。
            在每条链上，「取不超过 <M>{'m_i'}</M> 件」就变成了一个<strong>定长滑动窗口求最大值</strong>的问题，用单调队列可 <M>{'O(1)'}</M> 均摊维护，于是第 <M>{'i'}</M> 种物品整体只花 <M>{'O(V)'}</M>。
          </p>
          <p>
            设 <M>{'g'}</M> 是加入当前物品前的旧数组。固定余数 <M>{'r'}</M>，令容量 <M>{'j=r+kw_i'}</M>，再用 <M>{'x'}</M> 表示「从旧状态出发的位置」，便有
          </p>
          <MB>{'f[r+kw_i]=k v_i+\\max_{k-m_i\\le x\\le k}\\big(g[r+xw_i]-xv_i\\big)'}</MB>
          <p>
            对每个 <M>{'k'}</M>，变化的只是长度为 <M>{'m_i+1'}</M> 的窗口 <M>{'[k-m_i,k]'}</M>；候选分数 <M>{'g[r+xw_i]-xv_i'}</M> 只依赖 <M>{'x'}</M>。队首保存窗口内分数最大的 <M>{'x'}</M>，每个下标最多进队、出队一次，于是整条链是线性的。
          </p>
        </div>

        <h3 className="section-title">跟着算一遍：按余数链维护滑动窗口</h3>
        <div className="prose">
          <p>
            处理物品 <M>{'(w,v,m)=(2,3,2)'}</M>，容量上限 8。只看偶数余数链 <M>{'r=0'}</M>；旧数组在容量 <M>{'0,2,4,6,8'}</M> 上的值依次是 <M>{'0,4,5,7,8'}</M>。
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">0</span>
            <div className="step__b">
              <b>先减去线性项。</b> 对链下标 <M>{'x=0,1,2,3,4'}</M>，候选分数 <M>{'g[r+xw]-xv'}</M> 依次为 <M>{'0,1,-1,-2,-4'}</M>。单调队列只需要维护这串分数的窗口最大值。
            </div>
          </div>
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>算容量 6。</b> 此时 <M>{'k=3'}</M>，最多取 2 件，所以窗口是 <M>{'x\\in[1,3]'}</M>。最大分数是 <M>{'x=1'}</M> 的 1，故 <M>{'f[6]=3\\times3+1=10'}</M>；也就是从旧状态 <M>{'g[2]=4'}</M> 出发，再取 2 件当前物品，得到 <M>{'4+2\\times3=10'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>窗口右移到容量 8。</b> <M>{'k=4'}</M> 时合法窗口变成 <M>{'x\\in[2,4]'}</M>，<M>{'x=1'}</M> 因为会取 3 件而从队首过期。新的最大分数是 <M>{'x=2'}</M> 的 −1，于是 <M>{'f[8]=4\\times3-1=11'}</M>，正好对应 <M>{'g[4]+2\\times3=11'}</M>。
            </div>
          </div>
        </div>
        <InfoBox kind="key" title="队列里到底存什么">
          队列存的是链下标 <M>{'x'}</M>：队首过期条件是 <M>{'x<k-m_i'}</M>，队尾则按 <M>{'g[r+xw_i]-xv_i'}</M> 从大到小淘汰。每次把当前 <M>{'x=k'}</M> 也入队，表示「当前物品取 0 件」，因此不会漏掉沿用旧状态的选择。
        </InfoBox>
        <div className="prose">
          <p>
            下面是与 P1776 输入格式一致的完整写法。代码比二进制拆分繁琐，竞赛里通常仍首选二进制；当容量与物品种数允许、但件数上限很大时，再考虑这套 <M>{'O(Vn)'}</M> 优化。
          </p>
        </div>
        <CodeBlock code={CODE_MULTIPLE_MONOQUEUE} luogu="P1776" />
        <InfoBox kind="warn" title="常见陷阱 · 别把三法记混">
          三法的分界很清晰：<strong>朴素 <M>{'O(V\\sum m_i)'}</M></strong> 是把 <M>{'m_i'}</M> 件摊开；<strong>二进制 <M>{'O(V\\sum\\log m_i)'}</M></strong> 是把 <M>{'m_i'}</M> 打包（主力）；
          <strong>单调队列 <M>{'O(Vn)'}</M></strong> 是按同余滑窗（选讲）。三者拿的都是<strong>同一个 <M>{'f[W]'}</M></strong>，只是把「取不超过 <M>{'m_i'}</M> 件」表达得越来越省。切莫把二进制的「打包件」当成真的多买了物品，打包只是转移的<strong>组织方式</strong>，取用件数始终不超过 <M>{'m_i'}</M>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2347" name="[NOIP1996 提高组] 砝码称重" src="NOIP1996 提高" diff="普及/提高-">
          <Field k="题意">
            有 6 种面值（<M>{'1,2,3,5,10,20'}</M>）的砝码，各给定数量，问用它们能称出多少种<strong>不同的重量</strong>（重量 <M>{'>0'}</M>）。
          </Field>
          <Field k="对应关系">
            每种砝码有限个 → <strong>多重背包</strong>；不求最值而求<strong>可行性</strong>：<M>{'f[j]'}</M> 表示「重量 <M>{'j'}</M> 能否被称出」，转移用逻辑或代替 <M>{'\\max'}</M>。
          </Field>
          <Field k="为什么选它">
            数据极小（总重量上界才几百），正好拿来<strong>把朴素多重解法写透</strong>：三重循环「种 <M>{'\\times'}</M> 件 <M>{'\\times'}</M> 容量」，一件一件放。是理解「多重 = 带上限的 01」最干净的一题。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[j]\\ |=\\ f[j-w_i]'}</M>（对每种的每件逆推）；时间 <M>{'O(S\\cdot\\sum m_i)'}</M>，<M>{'S'}</M> 为总重量上界。
          </Field>
          <Field k="参考代码（朴素多重 + 布尔可达）">
            <CodeBlock code={CODE_P2347} luogu="P2347" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P1776" name="宝物筛选" src="NOI导刊2010" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 种宝物，第 <M>{'i'}</M> 种价值 <M>{'v_i'}</M>、重量 <M>{'w_i'}</M>、数量 <M>{'m_i'}</M>，背包承重 <M>{'W'}</M>，求最大总价值。
          </Field>
          <Field k="为什么选它">
            <M>{'\\sum m_i'}</M> 可达十万级、<M>{'W'}</M> 到四万，朴素摊开必然超时，<strong>逼你上二进制拆分</strong>。是多重背包二进制模板的标准练手题（<M>{'\\sum m_i'}</M> 规模也容得下单调队列，想进一步优化可以试）。
          </Field>
          <Field k="转移 · 复杂度">
            二进制拆分成打包件后逐件 01 逆推 <M>{'f[j]=\\max(f[j],f[j-w\']+v\')'}</M>；时间 <M>{'O\\!\\big(W\\cdot\\sum\\log m_i\\big)'}</M>。
          </Field>
          <Field k="参考代码（二进制拆分）">
            <CodeBlock code={CODE_P1776} luogu="P1776" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P6771" name="[USACO05DEC] Space Elevator 太空电梯" hint="多重背包 + 可达性：每种方块有限块且有高度上限，先按高度上限从小到大排序，再逐种做「不超过 m 件」的可达 DP。" />
        <Exercise pid="P1077" name="[NOIP2012 普及组] 摆花" hint="有限件求方案数：f[j] 表示用前几种花恰好摆 j 盆的方案数，每种不超过 a_i 盆；那一维可用前缀和把枚举件数优化掉。" />
        <Exercise pid="P1833" name="樱花" hint="题内含「无限 / 有限 / 恰一」多种分支，本质是混合背包；先把每种有限的樱花当多重物品做二进制拆分，无限的按完全背包正推。" />
      </section>

      <div className="pointer-cue">
        <Gamepad2 size={18} />
        到 <Link to="/part/a" style={{ color: 'var(--accent-1)', fontWeight: 600 }}>A 部分页的「装包大师」</Link>时，把某件宝物想成「库存只有有限件、拿完就没」，这份「有限件」的斤斤计较，正是多重背包要拆包处理的核心。
      </div>

    </>
  )
}
