import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import JointWeightDemo from '../../components/demos/treedp/JointWeightDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { JointWeightFigure, PostorderFigure, BracketTreeFigure } from './TreeArt'

const CODE_P1351 = `
#include <iostream>
#include <vector>
using namespace std;

const int N = 200005;
const long long MOD = 10007;
vector<int> g[N];
long long w[N];
long long sumAns, maxAns;

void dfs(int u, int fa)
{
    long long s1 = 0, s2 = 0;         // 邻居权和、平方和
    long long mx1 = 0, mx2 = 0;       // 最大、次大邻居权

    for (int v : g[u])                // ★邻居 = 所有相连点（父 + 孩子）
    {
        s1 = (s1 + w[v]) % MOD;
        s2 = (s2 + w[v] * w[v]) % MOD;
        if (w[v] > mx1) { mx2 = mx1; mx1 = w[v]; }
        else if (w[v] > mx2) mx2 = w[v];
    }

    // 以 u 为中间点的所有距离 2 有序点对：乘积和 = (Σw)² − Σw²
    sumAns = (sumAns + (s1 * s1 - s2) % MOD + MOD) % MOD;
    maxAns = max(maxAns, mx1 * mx2);  // 最大乘积 = 最大 × 次大

    for (int v : g[u])
        if (v != fa) dfs(v, u);
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i < n; i++)
    {
        int a, b;
        cin >> a >> b;
        g[a].push_back(b);
        g[b].push_back(a);
    }
    for (int i = 1; i <= n; i++)
        cin >> w[i];

    dfs(1, 0);
    cout << maxAns << " " << sumAns << endl;
    return 0;
}`

const CODE_P5658 = `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

const int N = 500005;
vector<int> g[N];
string s;                     // 每个点上是 '(' 或 ')'
long long f[N];               // f[u]：以 u 结尾、向上到根方向的合法括号子串数
long long ans;
int stk[N], top;              // 用栈匹配括号（栈存节点编号）
int match[N];                 // match[u]：与 u 配对的那个 '(' 的父亲上一位

void dfs(int u, int fa)
{
    int saved = -1;           // 记录本层对栈的修改，回溯时撤销
    if (s[u - 1] == '(')      // '(' 入栈
    {
        stk[++top] = u;
        // f[u] 继承父亲：新的 '(' 自身不能结尾合法串
        f[u] = f[fa];
    }
    else                      // ')' 尝试与栈顶配对
    {
        if (top > 0)
        {
            int p = stk[top--]; // 弹出配对的 '('
            saved = p;
            // p 的父亲那条链上的 f + 本次新增的 1 个（p..u 这一对）
            f[u] = f[/*p 的父亲*/ fa] + 1;   // 示意：真实实现用 match 链递推
        }
        else
            f[u] = 0;
    }

    ans += f[u];              // ★累加：每个点贡献「以它结尾的合法子串数」

    for (int v : g[u])
        if (v != fa) dfs(v, u);

    if (s[u - 1] == '(') top--;          // 撤销入栈
    else if (saved != -1) stk[++top] = saved;  // 撤销出栈
}

int main()
{
    int n;
    cin >> n >> s;
    for (int i = 2; i <= n; i++)
    {
        int fa;
        cin >> fa;
        g[fa].push_back(i);
    }

    top = 0;
    dfs(1, 0);
    cout << ans << endl;
    return 0;
}`

export default function TreeCount() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">从「求最优」转向「数东西」</h2>
        <div className="prose">
          <p>
            前几类都在求<strong>极值</strong>（最大权、最小造价、最长链）。这一类换一副眼镜：<strong>统计</strong>——
            数满足某种条件的<strong>点对 / 路径 / 子串</strong>有多少、或它们的某个量之和是多少。转移里 <M>{'\\max'}</M> 常换成<strong>求和 <M>{'+'}</M></strong> 或<strong>乘法</strong>。
          </p>
          <p>
            先看一类清爽的：<strong>距离恰为 2 的点对</strong>统计。给树上每点一个权，要求<strong>所有距离为 2 的点对，其权乘积之和</strong>（以及最大乘积）。
            直接两两枚举点对是 <M>{'O(n^2)'}</M>，<M>{'n=2\\times10^5'}</M> 不可行。关键观察一句话解决：
          </p>
          <p>
            <strong>两点距离为 2，当且仅当它们有一个公共邻居</strong>（那个邻居是路径的中间点）。于是不枚举点对，改<strong>枚举中间点</strong> <M>{'m'}</M>——m 的任意两个邻居就构成一个距离 2 点对。
          </p>
        </div>
        <figure className="figure">
          <JointWeightFigure />
          <figcaption className="figure__cap">
            距离 2 的点对 <M>{'(a,b)'}</M> 必经一个中间点 <M>{'m'}</M>；枚举 m，它的邻居两两配对即所有此类点对。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">O(度) 一次算完一个中间点</h2>
        <div className="prose">
          <p>
            固定中间点 <M>{'m'}</M>，设它的邻居权为 <M>{'x_1,x_2,\\dots,x_k'}</M>。所有<strong>有序</strong>点对的乘积之和是：
          </p>
          <MB>{'\\sum_{i\\ne j} x_i x_j=\\Big(\\sum_i x_i\\Big)^2-\\sum_i x_i^2'}</MB>
          <p>
            这是一个恒等式：<strong>「和的平方」减去「平方和」</strong>，恰好去掉了 <M>{'i=j'}</M> 的对角项，剩下的正是所有 <M>{'i\\ne j'}</M> 的交叉乘积。
            只需扫一遍 m 的邻居累加 <M>{'\\sum x'}</M> 与 <M>{'\\sum x^2'}</M>，<M>{'O(\\deg m)'}</M> 就得到以 m 为中点的乘积和；
            所有中间点加起来，总和是 <M>{'\\sum_m \\deg m=O(n)'}</M>。
          </p>
          <p>
            最大乘积同理：维护 m 邻居里的<strong>最大与次大</strong>两个权，<M>{'x_{(1)}\\cdot x_{(2)}'}</M> 即以 m 为中点的最大乘积；全局取最大。
          </p>
        </div>
        <figure className="figure">
          <PostorderFigure />
          <figcaption className="figure__cap">
            在树上，m 的邻居 = <strong>父亲 + 所有孩子</strong>；一遍 DFS 到每个点时就地统计，无需额外遍历。
          </figcaption>
        </figure>
        <InfoBox kind="key" title="本质">
          距离统计的通用招数是<strong>换枚举对象</strong>：不枚举「点对」而枚举「中间点 / 路径拐点」，把 <M>{'O(n^2)'}</M> 的两两配对，压成每个点 <M>{'O(\\deg)'}</M> 的局部统计。配合<strong>「和的平方 − 平方和」</strong>这类恒等式，一次算完一个中心的全部贡献。这是树上「数点对」的核心思维。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            小树：根 <M>{'1'}</M> 带 <M>{'2,3,4'}</M>；<M>{'1'}</M> 的孩子 <M>{'2'}</M> 又带 <M>{'5,6'}</M>。权 <M>{'w=[5,3,2,4,6,1]'}</M>。逐个中间点统计：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>中间点 1</b>（邻居 2、3、4，权 3、2、4）。<M>{'\\sum x=9,\\ \\sum x^2=9+4+16=29'}</M>。乘积和 <M>{'=9^2-29=81-29=52'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>中间点 2</b>（邻居 1、5、6，权 5、6、1）。<M>{'\\sum x=12,\\ \\sum x^2=25+36+1=62'}</M>。乘积和 <M>{'=144-62=82'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>中间点 3、4、5、6</b> 都是叶子，只有 1 个邻居，凑不出点对，贡献 0。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>总乘积和</b> <M>{'52+82=134'}</M>；<b>最大乘积</b>出现在中间点 2 的「5×6=30」。全程一遍 DFS。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示让你<strong>点选中间点</strong>，高亮它的邻居并列出所有距离 2 点对与乘积和；改点权实时重算。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">点选中间点，看点对怎么冒出来</h2>
        <div className="demo">
          <div className="demo__body">
            <JointWeightDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">沿根链递推：括号树的 O(1) 计数</h2>
        <div className="prose">
          <p>
            另一支是<strong>沿「根到点」的链递推方案计数</strong>。括号树：每个节点写着一个 <M>{'('}</M> 或 <M>{')'}</M>，
            从根到某点的路径拼成一个括号串。要数出<strong>所有节点</strong>对应的根链里，<strong>合法括号子串</strong>的总数。
          </p>
          <p>
            暴力对每个点重扫根链是 <M>{'O(n^2)'}</M>。妙处在于：设 <M>{'f[u]'}</M> = 「<strong>以 u 这个字符结尾</strong>的合法括号子串数」，
            它能从<strong>父亲 O(1) 递推</strong>——若 <M>{'u'}</M> 是 <M>{')'}</M> 且能与链上某个 <M>{'('}</M> 配对（设那个 <M>{'('}</M> 的前一位是 <M>{'p'}</M>），则
          </p>
          <MB>{'f[u]=f[p]+1'}</MB>
          <p>
            读作：以 u 结尾的合法子串 = 「以 p 结尾的合法子串」全部各自向右接上这对括号，<strong>再加</strong>「刚配好的这一对」本身。
            用一个<strong>栈</strong>沿 DFS 维护未匹配的 <M>{'('}</M>，进入子树时压栈 / 匹配，<strong>回溯时撤销</strong>。答案 = <M>{'\\sum_u f[u]'}</M>。
          </p>
        </div>
        <figure className="figure">
          <BracketTreeFigure />
          <figcaption className="figure__cap">
            根链「(())」：每位的 <M>{'f'}</M> 由父亲 <M>{'O(1)'}</M> 递推，末位结尾有 2 个合法子串（<M>{'()'}</M> 与 <M>{'(())'}</M>）。
          </figcaption>
        </figure>
        <InfoBox kind="warn" title="常见陷阱：DFS 上的栈必须回溯撤销">
          括号树是在<strong>树</strong>上而非一条链上递推——从一个子树退回父亲、再进入<strong>另一个</strong>子树时，前一支压入栈的 <M>{'('}</M> 必须<strong>弹出还原</strong>，否则会串味。标准写法是「进入时记下本层对栈的修改，<strong>递归返回后原样撤销</strong>」（可回滚栈）。另外 <M>{'f[u]'}</M> 与答案都可能超 int，用 <M>{'\\texttt{long long}'}</M>。
        </InfoBox>
        <div className="prose">
          <p>
            这两支——<strong>枚举中间点做距离统计</strong>与<strong>沿根链 O(1) 递推计数</strong>——覆盖了树上「数东西」的两大范式：
            前者靠「换枚举对象 + 恒等式」摊平代价，后者靠「父到子的增量递推」避免重扫。它们和 <Link to="/part/f/cover" style={{ color: 'var(--accent-2)' }}>覆盖 / 染色</Link> 里的方案计数一脉相承，只是把极值算子换成了求和 / 乘法。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P1351" name="[NOIP2014] 联合权值" src="NOIP 2014 提高组" diff="普及+/提高">
          <Field k="题意">
            无根树每点有权 <M>{'w_i'}</M>。距离恰为 2 的<strong>有序</strong>点对 <M>{'(u,v)'}</M> 的「联合权值」= <M>{'w_u\\cdot w_v'}</M>。求所有联合权值的<strong>最大值</strong>与<strong>之和</strong>（对 10007 取模）。
          </Field>
          <Field k="对应关系">
            距离 2 ⇔ 有公共中间点。枚举中间点 m，其邻居两两配对；乘积和用 <M>{'(\\sum w)^2-\\sum w^2'}</M>，最大乘积用「最大 × 次大」。
          </Field>
          <Field k="为什么选它">
            用<strong>最小的状态</strong>把「距离统计」讲透的 NOIP 真题——不需要复杂 DP 数组，只需一个恒等式 + 一遍 DFS，是距离统计入门的最佳载体。
          </Field>
          <Field k="转移 · 复杂度">
            每个中间点 <M>{'O(\\deg)'}</M>，总 <M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（枚举中间点）">
            <CodeBlock code={CODE_P1351} luogu="P1351" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P5658" name="[CSP-S2019] 括号树" src="CSP-S 2019" diff="提高+/省选-">
          <Field k="题意">
            <M>{'n'}</M> 个节点的树，每点标 <M>{'('}</M> 或 <M>{')'}</M>。对每个点 <M>{'u'}</M>，数根到 u 的字符串里<strong>合法括号子串</strong>的个数 <M>{'k_u'}</M>，输出所有 <M>{'k_u'}</M>（题目要求异或和形式）。
          </Field>
          <Field k="为什么选它">
            「父到子 <M>{'O(1)'}</M> 递推方案计数」的<strong>漂亮范例</strong>，CSP 真题热度高。<M>{'f[u]=f[p]+1'}</M> 的递推 + DFS 上可回滚栈，把 <M>{'O(n^2)'}</M> 降到 <M>{'O(n)'}</M>。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u]=f[p]+1'}</M>（u 为 <M>{')'}</M> 且成功匹配时，<M>{'p'}</M> 是与之配对的 <M>{'('}</M> 的前驱），累加得答案；<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（DFS + 可回滚栈，主干示意）">
            <CodeBlock code={CODE_P5658} luogu="P5658" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2585" name="[ZJOI2006] 三色二叉树（计数向）" hint="把「求绿点极值」改成「数合法染色方案」：内层枚举 (a,b) 合法颜色对时，方案数相乘、对颜色求和。同树同约束，算子从 max 换成累乘累加。" />
        <Exercise pid="P1131" name="[ZJOI2007] 时态同步" hint="统计/合并型：f[u] = u 子树内到叶子的最长链，每条子边补齐到最长的增量累加。是「沿子树统计路径长度」的练习。" />
        <Exercise pid="P1352" name="没有上司的舞会（回顾）" hint="回到选点：把它当计数思维的对照——同样一遍 DFS 合并子树，只是聚合的是「最大权」而非「计数」。对比体会算子之别。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/f/cover" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">覆盖 / 支配 / 染色</span>
        </Link>
        <Link to="/part/g/board" className="next">
          <span className="dir">下一部分 →</span>
          <span className="nm">
            棋盘 / 轮廓状压 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
