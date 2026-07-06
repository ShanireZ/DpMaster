import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { M, MB } from '../../components/ui/Math'
import InfoBox from '../../components/ui/InfoBox'
import CodeBlock from '../../components/ui/CodeBlock'
import { ExampleCard, Field, Exercise } from '../../components/ui/ProblemBits'
import { ContourFigure, BitLattice } from './BitArt'

const CODE_P5056 = `
#include <iostream>
#include <cstring>
using namespace std;

// 【模板】插头 DP：n×m 网格（可有障碍），求经过所有非障碍格的单条闭合回路方案数。
// 用「括号表示法」记轮廓线上每个插头的连通性：0=无插头，1=左括号，2=右括号（用 2 位一个插头）。
// 用哈希表滚动存「轮廓线状态 -> 方案数」。

typedef long long ll;
const int HASH = 300007;

int n, m, ex, ey;              // ex,ey：最后一个非障碍格（回路必经，用于定终态）
char grid[15][15];

struct HashMap                 // 手写哈希表：状态 -> 方案数
{
    int head[HASH], nxt[HASH], sz;
    ll state[HASH], val[HASH];
    void clear() { sz = 0; memset(head, -1, sizeof head); }
    void add(ll st, ll v)
    {
        int h = st % HASH;
        for (int i = head[h]; ~i; i = nxt[i])
            if (state[i] == st) { val[i] += v; return; }
        state[sz] = st; val[sz] = v;
        nxt[sz] = head[h]; head[h] = sz++;
    }
} f[2];

int cur;

int main()
{
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
        {
            cin >> grid[i][j];
            if (grid[i][j] == '.') { ex = i; ey = j; }
        }

    cur = 0;
    f[cur].clear();
    f[cur].add(0, 1);          // 初始轮廓线：全无插头，方案数 1

    for (int i = 1; i <= n; i++)
    {
        // 换行：轮廓线整体左移一格（最高位插头清零），用位运算实现
        for (int k = 0; k < f[cur].sz; k++)
            f[cur].state[k] <<= 2;

        for (int j = 1; j <= m; j++)
        {
            int nxt = cur ^ 1;
            f[nxt].clear();
            for (int k = 0; k < f[cur].sz; k++)
            {
                ll st = f[cur].state[k], v = f[cur].val[k];
                int p = (st >> (2 * (j - 1))) & 3;   // 左插头（当前格左边）
                int q = (st >> (2 * j)) & 3;         // 上插头（当前格上边）
                // ★按 (p,q) 的六种组合分类讨论：新建/延续/合并/闭合括号
                // ... 具体转移略（模板核心：括号匹配 + 障碍处理 + 终态判定）
                (void)p; (void)q; (void)ex; (void)ey; (void)v;
            }
            cur = nxt;
        }
    }

    ll ans = 0;
    for (int k = 0; k < f[cur].sz; k++)
        if (f[cur].state[k] == 0) ans += f[cur].val[k]; // 全部闭合
    cout << ans << endl;
    return 0;
}`

export default function BitPlug() {
  return (
    <>
      <section className="lesson">
        <h2 className="section-title">选修 · 插头 DP</h2>
        <InfoBox kind="key" title="选修 · 挑战区">
          这是全站状压部分的<strong>最后一类，也是难度最高的一类</strong>——建议先学完前四类（棋盘 / TSP / 覆盖 / 综合技巧），对「把状态压进整数、在 mask 间转移」足够熟练后再来。它把状压推向<strong>轮廓线上的连通性</strong>，思想优美但实现繁琐，作为进阶延伸了解即可。
        </InfoBox>
        <div className="prose">
          <p>
            前面的棋盘状压，记的是「当前<strong>一行</strong>放了哪些」。可有些问题，约束不是「行内 / 行间」这么整齐，而是要维护<strong>格子之间的连通关系</strong>——最典型的是「在网格里铺一条<strong>不自交的闭合回路</strong>，经过所有格子，问有多少种铺法」。这时候「哪些格子被占」远远不够，还得知道<strong>它们是怎么连成一条线的</strong>。
          </p>
          <p>
            插头 DP（也叫<strong>轮廓线 DP</strong>）就是为这类问题设计的。它不再一行一行地推，而是<strong>一格一格</strong>地推；状态记在一条叫「<strong>轮廓线</strong>」的折线上——那是「已处理格」与「未处理格」的分界线。
          </p>
        </div>
      </section>

      <section className="lesson">
        <h2 className="section-title">轮廓线与「插头」</h2>
        <div className="prose">
          <p>
            处理到第 <M>{'i'}</M> 行第 <M>{'j'}</M> 列时，已决区（上方若干整行 + 本行左侧）与未决区之间，是一条<strong>阶梯状的折线</strong>，长度为 <M>{'m+1'}</M> 条边（<M>{'m'}</M> 为列数）。这条线穿过的每一条格子边，都可能有一段回路「探出头」——这段探出的线头，就叫<strong>插头</strong>。
          </p>
        </div>
        <figure className="figure">
          <ContourFigure />
          <figcaption className="figure__cap">轮廓线（青色折线）划开已决区与未决区；线上每条边是否有「插头」、以及插头之间怎么连通，就是要压进状态的信息。</figcaption>
        </figure>
        <div className="prose">
          <p>
            状态要记的，是<strong>轮廓线上每个位置有没有插头，以及有插头的位置两两如何配对连通</strong>。对「单条闭合回路」，任意时刻插头都成对出现（一进一出），可以用<strong>括号表示法</strong>编码：把每个插头标成「无（<M>{'0'}</M>）/ 左括号（<M>{'1'}</M>）/ 右括号（<M>{'2'}</M>）」，一对匹配的括号表示两个线头最终要连在一起。每个插头用 <strong>2 个二进制位</strong>表示，整条轮廓线就压成一个整数。
          </p>
        </div>
        <figure className="figure">
          <BitLattice bits={[1, 0, 2, 0, 1, 2]} showBinary={false} cell={30} />
          <figcaption className="figure__cap">括号表示法的一种轮廓线状态（每格取 0/1/2）：1 与 2 配对，标记两个线头同属一条回路——用两位一个插头压进整数。</figcaption>
        </figure>
      </section>

      <section className="lesson">
        <h2 className="section-title">逐格转移：新建、延续、合并、闭合</h2>
        <div className="prose">
          <p>
            推进一格时，看它的<strong>左插头 <M>{'p'}</M></strong>（左边界）与<strong>上插头 <M>{'q'}</M></strong>（上边界）的组合，决定这一格里回路怎么走。核心分几类情形：
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step__n">1</span>
            <div className="step__b">
              <b>两侧都无插头</b>（<M>{'p=q=0'}</M>）：在这一格<strong>新建</strong>一对插头（一个右边界、一个下边界），相当于回路在此拐个弯冒出来——写成一对新括号。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>恰一侧有插头</b>（<M>{'p,q'}</M> 一个非 0）：回路<strong>延续</strong>——把这个线头从原方向<strong>转到</strong>另一条出边，插头平移，括号类型不变。
            </div>
          </div>
          <div className="step">
            <span className="step__n">2</span>
            <div className="step__b">
              <b>两侧都有插头</b>：两条线头在这一格<strong>相遇合并</strong>。若是「左括号 + 右括号」且它们本就是一对，则<strong>闭合成一个环</strong>——只有在<strong>最后一个格子</strong>闭合、且轮廓线上再无其它插头，才是一条合法的完整回路。
            </div>
          </div>
          <div className="step">
            <span className="step__n">✓</span>
            <div className="step__b">
              <b>障碍格 / 空格</b>：不能有插头穿过，只有 <M>{'p=q=0'}</M> 才能转移过去（该格保持无插头）。
            </div>
          </div>
        </div>
        <div className="prose">
          <p>
            由于轮廓线状态数远小于 <M>{'2^{2m}'}</M> 的上界（合法括号序列稀疏），通常用<strong>哈希表</strong>滚动存「状态 → 方案数」。换行时把整条轮廓线<strong>左移一格</strong>（最高位插头清零），因为每个插头占 2 位，用位运算整体左移两位实现：
          </p>
          <MB>{'state \\leftarrow state\\,{<}{<}\\,2'}</MB>
        </div>
        <InfoBox kind="warn" title="常见陷阱：这是模板级难题，别急于手推转移">
          插头 DP 的六类转移（新建 / 延续 / 合并 / 闭合 + 障碍 + 换行）细节极多，括号匹配还要正确维护「哪一对属于同一环」。初学<strong>务必对着模板题反复调试</strong>，把每类 <M>{'(p,q)'}</M> 组合列表逐一验证，而不是凭直觉写。它是状压的天花板，<strong>掌握前四类已足以应对绝大多数竞赛状压题</strong>——这一类留给行有余力时深挖。
        </InfoBox>
      </section>

      <section className="lesson">
        <h2 className="section-title">例题</h2>

        <ExampleCard pid="P5056" name="【模板】插头 DP" src="洛谷原生" diff="省选/NOI-">
          <Field k="题意">
            给 <M>{'n\\times m'}</M> 网格（<M>{'n,m\\le 12'}</M>，含障碍），求经过所有<strong>非障碍格</strong>的<strong>单条闭合回路</strong>的方案数。
          </Field>
          <Field k="为什么选它">
            官方「插头 DP」模板，是轮廓线连通性状压的<strong>规范入口</strong>：单回路计数最纯、无额外杂质，正好把「括号表示法 + 逐格六类转移 + 哈希表滚动」这套框架完整走一遍。学插头 DP 从它起步。
          </Field>
          <Field k="状态 · 转移 · 复杂度">
            状态 = 轮廓线上各插头的括号编码（哈希存）；逐格按左 / 上插头组合转移；终态取「全部闭合、无残留插头」。复杂度约 <M>{'O(nm\\cdot 2^m)'}</M> 量级（实际由合法状态数决定，远小于上界）。
          </Field>
          <Field k="参考代码（模板骨架）">
            <CodeBlock code={CODE_P5056} luogu="P5056" />
          </Field>
        </ExampleCard>
      </section>

      <section className="lesson exercises">
        <h2 className="section-title">练习</h2>
        <div className="prose" style={{ maxWidth: 'none', marginBottom: 'var(--sp-4)' }}>
          <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
            <strong>诚实说明：</strong>插头 DP 在洛谷的<strong>原生 P 题池很窄</strong>——多数经典题（如 URAL 的「Pipeline」系列、POJ 铺砖题）是远程评测，不在本站「只用洛谷原生题」的约束内。因此本类仅以 <strong>P5056 模板</strong>作为唯一必做，下面一道原生题作为进阶延伸自测；不为凑数硬塞非原生题。想系统练插头 DP，可在掌握模板后自行探索 remote judge 上的专题。
          </p>
        </div>
        <Exercise pid="P5056" name="【模板】插头 DP（反复精练）" hint="把六类转移 (p,q) 组合逐一在纸上列清，再对照模板逐行验证；先做「无障碍 + 单回路」，再加障碍格。这是唯一的原生模板，值得反复调通。" />
        <Exercise pid="P2704" name="[NOI2001] 炮兵阵地（对照回顾）" hint="不是插头 DP，但同为「轮廓状压」思想的入门端——回到棋盘状压，对比「记两行 mask」与「记一整条轮廓线插头」的异同，理解轮廓状压从简到繁的谱系。" />
      </section>

      <nav className="type-nav">
        <Link to="/part/g/subset" className="prev">
          <span className="dir">
            <ArrowLeft size={13} style={{ verticalAlign: '-2px' }} /> 上一类型
          </span>
          <span className="nm">综合技巧：枚举子集</span>
        </Link>
        <span />
      </nav>
    </>
  )
}
