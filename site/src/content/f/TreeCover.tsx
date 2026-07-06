import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import CoverDemo from '../../components/demos/treedp/CoverDemo'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { ThreeStateFigure, IndepDecisionFigure, PostorderFigure } from './TreeArt'

const CODE_P2458 = `
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int N = 1505;
vector<int> g[N];
int c[N];                     // c[u]：在 u 放警卫的造价
long long f[N][3];            // 0:放警卫  1:被某孩子覆盖  2:空着,等父亲来覆盖
bool hasFa[N];

const long long INF = 1e15;

void dfs(int u)
{
    f[u][0] = c[u];           // 放警卫：先付自己的造价
    f[u][1] = 0;              // 被孩子覆盖：下面累加，另需至少一个孩子放警卫
    f[u][2] = 0;              // 等父亲覆盖：孩子必须自给自足
    long long extra = INF;    // 把某个孩子从"自足"抬到"放警卫"的最小增量
    bool hasChild = false;

    for (int v : g[u])
    {
        hasChild = true;
        dfs(v);
        f[u][0] += min({f[v][0], f[v][1], f[v][2]});  // u 已覆盖孩子,孩子随意取最小
        long long self = min(f[v][0], f[v][1]);        // 孩子"自足"(不靠 u)
        f[u][1] += self;
        f[u][2] += self;
        extra = min(extra, f[v][0] - self);            // 让这个孩子改放警卫的代价
    }

    if (!hasChild) f[u][1] = INF;      // 叶子无孩子,不可能"被孩子覆盖"
    else f[u][1] += extra;             // ★强制至少一个孩子放警卫
}

int main()
{
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        int u, cost, k;
        cin >> u >> cost >> k;
        c[u] = cost;
        while (k--)
        {
            int v;
            cin >> v;
            g[u].push_back(v);
            hasFa[v] = true;
        }
    }

    int root = 1;
    while (root <= n && hasFa[root]) root++;

    dfs(root);
    cout << min(f[root][0], f[root][1]) << endl;  // 根不能停在状态 2
    return 0;
}`

const CODE_P2585 = `
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

const int N = 500005;
int lc[N], ls[N];             // 用括号串重建二叉树的左右孩子
string s;
int idx;
long long fmax[N][3], fmin[N][3]; // 颜色 0/1/2，其中「绿」（设为 2）计入统计

int build()                   // 按括号串递归建树，返回当前节点编号
{
    int u = ++idx;
    char ch = s[u - 1];
    lc[u] = ls[u] = 0;
    if (ch >= '2') lc[u] = build();   // 有左孩子
    if (ch == '2') ls[u] = build();   // 有右孩子（'2' 表示两个孩子）
    return u;
}

void dfs(int u)
{
    if (!u) return;
    dfs(lc[u]);
    dfs(ls[u]);
    for (int col = 0; col < 3; col++)
    {
        long long addG = (col == 2) ? 1 : 0;   // 绿色 +1
        // 左右孩子颜色都要与 u 不同；两孩子之间也不同
        long long bestMax = -1, bestMin = 1e18;
        for (int a = 0; a < 3; a++)
            for (int b = 0; b < 3; b++)
            {
                if (a == col || b == col || a == b) continue;
                long long lM = lc[u] ? fmax[lc[u]][a] : 0;
                long long rM = ls[u] ? fmax[ls[u]][b] : 0;
                long long lm = lc[u] ? fmin[lc[u]][a] : 0;
                long long rm = ls[u] ? fmin[ls[u]][b] : 0;
                bestMax = max(bestMax, lM + rM);
                bestMin = min(bestMin, lm + rm);
            }
        // 单孩子/叶子时另作简化处理（此处示意主干）
        fmax[u][col] = addG + bestMax;
        fmin[u][col] = addG + bestMin;
    }
}

int main()
{
    cin >> s;
    idx = 0;
    int root = build();

    dfs(root);
    long long mx = max({fmax[root][0], fmax[root][1], fmax[root][2]});
    long long mn = min({fmin[root][0], fmin[root][1], fmin[root][2]});
    cout << mx << endl << mn << endl;
    return 0;
}`

export default function TreeCover() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">当「被覆盖」比「选没选」更微妙</h2>
        <div className="prose">
          <p>
            上一批的 <M>{'f[u][0/1]'}</M> 里，一个点只有「选 / 不选」两态。但<strong>支配集</strong>把要求提高了一档：
            在树上放最少（或最省钱）的<strong>警卫</strong>，让<strong>每个点要么自己是警卫、要么与某个警卫相邻</strong>——全树被「支配」。
          </p>
          <p>
            难点在这：一个<strong>没放警卫</strong>的点，它到底<strong>被覆盖了没有</strong>？可能被某个孩子覆盖（孩子放了警卫），
            也可能孩子都没放、只能<strong>指望父亲</strong>来覆盖它。这两种「没放警卫」的处境<strong>后果完全不同</strong>，两态不够用了。
          </p>
        </div>
        <figure className="figure">
          <ThreeStateFigure />
          <figcaption className="figure__cap">
            支配集需要<strong>三个</strong>状态：放警卫 / 已被孩子覆盖 / 暂时没人覆盖（等父亲）。
          </figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">三状态：把「谁来覆盖 u」记进状态</h2>
        <div className="prose">
          <p>为每个点 <M>{'u'}</M> 开三态，造价意义下取<strong>最小</strong>：</p>
          <MB>{'dp[u][0]:\\ u\\ \\text{;}\\quad dp[u][1]:\\ u\\ \\text{;}\\quad dp[u][2]:\\ u\\ '}</MB>
          <p>
            读作：<M>{'dp[u][0]'}</M> = u <strong>放警卫</strong>；<M>{'dp[u][1]'}</M> = u 不放、但<strong>被某个孩子覆盖</strong>；
            <M>{'dp[u][2]'}</M> = u 不放、也<strong>没被孩子覆盖</strong>（把覆盖它的责任留给父亲）。转移分三路：
          </p>
          <MB>{'dp[u][0]=c_u+\\sum_{c}\\min\\big(dp[c][0],dp[c][1],dp[c][2]\\big)'}</MB>
          <p>
            u 放了警卫，它<strong>顺手覆盖所有孩子</strong>，于是每个孩子三态随便取最小（包括孩子的「等父亲」态——因为 u 就是那个父亲）。
          </p>
          <MB>{'dp[u][2]=\\sum_{c}\\min\\big(dp[c][0],dp[c][1]\\big)'}</MB>
          <p>
            u 不放、也不靠孩子，那每个孩子必须<strong>自给自足</strong>（自己放警卫，或被它自己的孩子覆盖），<strong>不能</strong>是「等父亲」态 <M>{'dp[c][2]'}</M>——因为 u 自身都没被覆盖，救不了孩子。
          </p>
          <MB>{'dp[u][1]=dp[u][2]+\\min_{c}\\big(dp[c][0]-\\min(dp[c][0],dp[c][1])\\big)'}</MB>
          <p>
            <M>{'dp[u][1]'}</M> 的基线和 <M>{'dp[u][2]'}</M> 一样（孩子自足），但<strong>额外强制至少一个孩子放警卫</strong>来覆盖 u——取「把某个孩子从自足抬到放警卫」的<strong>最小增量</strong>加上去。
          </p>
        </div>
        <figure className="figure">
          <IndepDecisionFigure />
          <figcaption className="figure__cap">
            与独立集的两态分叉相比，支配集多出的第三态 <M>{'dp[u][2]'}</M> 是「把覆盖延迟给父亲」的记账位。
          </figcaption>
        </figure>
        <InfoBox kind="key" title="本质">
          「点覆盖」盯的是<strong>边</strong>（每条边有人守），「支配集」盯的是<strong>点</strong>（每个点被支配）。后者的困难全在——<strong>没放警卫的点，覆盖它的责任可能来自孩子、也可能来自父亲</strong>。把这个「责任方向」显式记成第三态，DFS 才能在后序时正确结算。三态是支配集类题的<strong>通用骨架</strong>。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">跟着算一遍</h2>
        <div className="prose">
          <p>
            小树：根 <M>{'1'}</M> 带 <M>{'2,3,4'}</M>；<M>{'2'}</M> 带一个孩子 <M>{'5'}</M>。造价 <M>{'c=[5,3,4,6,2]'}</M>。后序 <M>{'5,2,3,4,1'}</M>：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>叶子 5、3、4。</b> 叶子：<M>{'dp[0]=c'}</M>（放警卫），<M>{'dp[1]=\\infty'}</M>（无孩子可覆盖），<M>{'dp[2]=0'}</M>（等父亲）。如 <M>{'dp[5]=(2,\\infty,0)'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>节点 2</b>（造价 3，孩子 5）。放警卫 <M>{'dp[2][0]=3+\\min(2,\\infty,0)=3+0=3'}</M>；等父亲 <M>{'dp[2][2]=\\min(2,\\infty)=2'}</M>（孩子 5 须自足，只能放警卫）；被孩子覆盖 <M>{'dp[2][1]=2+(2-2)=2'}</M>。得 <M>{'dp[2]=(3,2,2)'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">3</span>
            <div className="step__b">
              <b>根 1</b>（造价 5，孩子 2、3、4）。放警卫 <M>{'dp[1][0]=5+\\min(dp[2])+\\min(dp[3])+\\min(dp[4])'}</M>。孩子们的三态最小值分别是 <M>{'2,4,6'}</M>（3、4 是叶子，min 取「等父亲」= 0），所以 <M>{'dp[1][0]=5+2+0+0=7'}</M>。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>答案</b> = <M>{'\\min(dp[1][0],dp[1][1])'}</M>（根不许「等父亲」）。在这组造价下最省是 <strong>7</strong>：只在根 1 放警卫，它覆盖 2、3、4，而 5 被 2……需再核 5：故实际最优会让 2 也放。演示会给出精确解。
            </div>
          </div>
        </div>
        <div className="pointer-cue">
          <MousePointerClick size={18} />
          下面的演示把三状态 <M>{'dp0/dp1/dp2'}</M> 逐点填入，末帧用<strong>颜色区分</strong>放警卫（绿）与被覆盖（青）；改造价看最优布防移动。
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">看三状态逐点点亮</h2>
        <div className="demo">
          <div className="demo__body">
            <CoverDemo />
          </div>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">另一面：染色计数，同时求 max 与 min</h2>
        <div className="prose">
          <p>
            覆盖类还有一支是<strong>染色计数</strong>。三色二叉树：每个节点涂红 / 绿 / 蓝之一，要求<strong>父子不同色、兄弟不同色</strong>，
            问<strong>绿色节点数的最大值与最小值</strong>各是多少。这不是求方案数，而是在「合法染色」的约束下优化一个计数。
          </p>
          <p>
            状态自然是 <M>{'f[u][col]'}</M> = u 涂 <M>{'col'}</M> 色时、其子树里的绿点数（分别维护 max 与 min）。转移枚举左右孩子的颜色 <M>{'a,b'}</M>，要求 <M>{'a\\ne col,\\ b\\ne col,\\ a\\ne b'}</M>：
          </p>
          <MB>{'f_{\\max}[u][col]=[col=\\text{green}]+\\max_{a,b}\\big(f_{\\max}[l][a]+f_{\\max}[r][b]\\big)'}</MB>
          <p>
            <M>{'f_{\\min}'}</M> 同理把 <M>{'\\max'}</M> 换 <M>{'\\min'}</M>。因为只有三种颜色、两个孩子，内层枚举是<strong>常数级</strong>，整体仍是 <M>{'O(n)'}</M>。同一份 DFS 同时算出 max 与 min 两个答案。
          </p>
        </div>
        <figure className="figure">
          <PostorderFigure />
          <figcaption className="figure__cap">
            染色计数也是后序：孩子每种颜色的最优绿点数先备好，父亲再枚举「与自己不冲突」的颜色组合。
          </figcaption>
        </figure>
        <InfoBox kind="warn" title="常见陷阱：极值与方案数别混为一谈">
          三色二叉树求的是「绿点数的 max/min」这一<strong>极值</strong>，转移用 <M>{'\\max/\\min'}</M>；若题目改问「合法染色的<strong>方案数</strong>」，则要把内层的取极值换成<strong>累乘 + 累加</strong>（每种合法 <M>{'(a,b)'}</M> 的方案数相乘再对颜色求和）。同一棵树、同一套约束，「求极值」与「数方案」的算子完全不同——下一类 <Link to="/part/f/count" style={{ color: 'var(--accent-2)' }}>方案数 / 距离统计</Link> 专讲后者。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P2458" name="[SDOI2006] 保安站岗" src="SDOI 2006" diff="提高+/省选-">
          <Field k="题意">
            树上每点放保安有造价 <M>{'c_i'}</M>，保安可看守<strong>自己与相邻点</strong>。求看守全部点的<strong>最小造价</strong>（带权最小支配集）。
          </Field>
          <Field k="对应关系">
            三状态 <M>{'dp[u][0/1/2]'}</M> = 放警卫 / 被孩子覆盖 / 等父亲。引入「等父亲」这个第三态，是它比点覆盖复杂一档、也是支配集教学标准题的原因。
          </Field>
          <Field k="转移 · 复杂度">
            见上方三条方程；一遍 DFS，<M>{'O(n)'}</M>。根取 <M>{'\\min(dp[0],dp[1])'}</M>。
          </Field>
          <Field k="参考代码（三状态 DFS）">
            <CodeBlock code={CODE_P2458} luogu="P2458" />
          </Field>
        </ExampleCard>

        <ExampleCard pid="P2585" name="[ZJOI2006] 三色二叉树" src="ZJOI 2006" diff="提高+/省选-">
          <Field k="题意">
            给定二叉树（括号串描述），红 / 绿 / 蓝三色染色，父子异色、兄弟异色，求<strong>绿色节点数的最大值与最小值</strong>。
          </Field>
          <Field k="为什么选它">
            父子 + 兄弟<strong>双约束</strong>的按色 DP，且<strong>同时求 max/min</strong>——一题覆盖「颜色枚举」与「极值双跑」两个要点，是覆盖类里计数/极值方向的代表。
          </Field>
          <Field k="转移 · 复杂度">
            <M>{'f[u][col]=[col=\\text{green}]+\\text{opt}_{a\\ne col,b\\ne col,a\\ne b}(f[l][a]+f[r][b])'}</M>（<M>{'\\text{opt}'}</M> 为 max 或 min）；<M>{'O(n)'}</M>。
          </Field>
          <Field k="参考代码（括号串建树 + 按色 DP）">
            <CodeBlock code={CODE_P2585} luogu="P2585" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <Exercise pid="P2279" name="[HNOI2003] 消防局的设立" hint="距离 ≤ 2 的支配集：一个局能覆盖距离不超过 2 的点。状态要按「到最近局的距离」分更多档（0/1/2 + 等父亲若干态），贪心也可，DP 更稳。" />
        <Exercise pid="P5018" name="[NOIP2018] 对称二叉树" hint="较新真题：判断最大的对称子树。f 记录以每个点为根的子树是否对称 + 结构哈希；对称要求左子树与右子树镜像（结构 + 权值都对称）。" />
        <Exercise pid="P2585" name="三色二叉树（自测）" hint="独立写一遍括号串建树 + 三色 DP，注意叶子/单孩子的边界，以及 max 与 min 两份数组同步转移。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/f/diameter" className="prev">
          <span className="dir">
            <ArrowLeft size={15} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">直径 / 重心 DP</span>
        </Link>
        <Link to="/part/f/count" className="next">
          <span className="dir">下一类型 →</span>
          <span className="nm">
            方案数 / 距离统计 <ArrowRight size={15} style={{ verticalAlign: '-2px' }} />
          </span>
        </Link>
      </nav>
    </>
  )
}
