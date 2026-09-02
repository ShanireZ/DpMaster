// baseline-copy: authority=Docs/baseline-copy-check.template.mjs sha256=b23597f68cad13fda8d970f8c2058ba7e521e7ed72d10ace4db4c7d7916ea9ea

// （无 shebang：钉子必须是第 1 行，而 shebang 只在第 1 行才有效 —— 两者不能共存。
//   本脚本一律以 `node scripts/check-baseline-copy.mjs` 调用。）
// 本仓在工作区副本清单里的那些文件，必须与工作区权威逐字节一致。
//
// ★ 本文件是从 Docs/baseline-copy-check.template.mjs 生成的副本，**不要就地改**——
//   工作区的 `node Docs/check-baseline-copies.mjs` 会逐字节比对它，改了即红。
//   要改逻辑就改模板，然后 `node Docs/check-baseline-copies.mjs --write`。
//
// ★ **判什么由清单点名，不由本脚本嗅探。** 清单与比对语义都在工作区的
//   `Docs/baseline-copies.manifest.mjs`，工作区级那条命令 import 的是同一个模块
//   ⇒ 单仓门与工作区门永远判同一张表、同一套判据，不可能各自漂。
//
//   ⛔ 上一版不是这样：它自己去 docs/ 里嗅探「首行有钉子的文件」当作副本。
//      faccb07 为让 OKF frontmatter 回到第 1 行删掉了 md 副本的钉子，于是 7 个仓的
//      本脚本**同时**退化成恒定打印「本仓没有 baseline 副本，跳过」并退 0 ——
//      门还在、`pnpm baseline:check` 还绿，但它不判任何东西。
//      教训：**能推断出「没什么可判」的判据，就能悄悄退化成空转。**
//      所以下面「本仓不在清单里」这一支是**红**，不是跳过。
//
// ⚠ 跨仓比对**必须同时看到两边**，而单仓 CI 只 clone 了这一个仓。
//   所以找不到工作区权威时它**显式宣告跳过并退 0**，不是静默通过：
//   - 开发机（工作区在）→ 真判，不一致即红。
//   - 单仓 CI（工作区不在）→ 打一行大写 SKIP。**唯一的执法点是工作区级那条命令**，
//     执法点是工作区级的 node Docs/check-baseline-copies.mjs。
//   这条取舍是 owner 2026-08-30 拍的：让「没判」看得见，比让它假装判过要好。
//
// ⚠ 本文件要同时通过 7 个仓各自的 lint。BetAI 那道是 `oxlint --type-aware --deny-warnings`，
//   所以这里显式写 JSDoc 类型、用 `import.meta.dirname`（Node ≥ 21.2，本工作区各仓
//   `engines.node` 均 ≥ 26）、用 `replaceAll` 与显式长度比较。**不要加 lint 豁免注释**。

import { existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {[string, string, string]} CopyEntry  [项目, 副本相对路径, 权威相对路径]
 * @typedef {{ ok: string[], fails: string[], total: number }} CheckResult
 * @typedef {{
 *   EXPECTED: CopyEntry[],
 *   runCheck: (o: { root: string, only?: string | null, write?: boolean }) => CheckResult,
 * }} Manifest
 */

const SELF = import.meta.filename;
const HERE = import.meta.dirname;
const MANIFEST = ['Docs', 'baseline-copies.manifest.mjs'];

/**
 * 从本脚本往上找工作区根：它同时有 AGENTS.md 与副本清单模块。
 * @param {string} start
 * @returns {string | null}
 */
function findWorkspace(start) {
  let d = resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(d, 'AGENTS.md')) && existsSync(join(d, ...MANIFEST))) return d;
    const up = dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

/**
 * 清单模块的形状守卫。
 * @param {unknown} m
 * @returns {m is Manifest}
 */
function isManifest(m) {
  return (
    typeof m === 'object' &&
    m !== null &&
    'EXPECTED' in m &&
    Array.isArray(m.EXPECTED) &&
    'runCheck' in m &&
    typeof m.runCheck === 'function'
  );
}

const ws = findWorkspace(HERE);

if (ws === null) {
  console.log('==================================================================');
  console.log('BASELINE-COPY-CHECK SKIPPED — 找不到工作区权威，本次没有校验任何东西。');
  console.log('  本仓的 baseline / 契约 / agent 约定副本与工作区权威是否一致 **本次未判**。');
  console.log('  唯一执法点：在工作区根跑 node Docs/check-baseline-copies.mjs');
  console.log('==================================================================');
  process.exit(0);
}

// 动态 import 的返回值是 `any`。先落到 `unknown`，再用**类型守卫**收窄——
// 不用类型断言：`typescript(no-unsafe-type-assertion)` 连 `unknown → T` 也判红。
// ★ 顺带这是一条真的运行时检查：清单模块被改坏或改名时，这里给一句能读的红，
//   而不是在下一行抛 TypeError。
/** @type {unknown} */
const loaded = await import(pathToFileURL(join(ws, ...MANIFEST)).href);

if (!isManifest(loaded)) {
  console.error('baseline-copy-check: 工作区的副本清单模块没有导出 EXPECTED / runCheck。');
  console.error(`  期望位置：${MANIFEST.join('/')}`);
  process.exit(1);
}

const { EXPECTED, runCheck } = loaded;

// 本脚本自己就是清单里的一项 ⇒ 用它在清单里的位置反查「我是哪个项目」，
// 不靠目录名猜、也不靠 docs/ 是否存在猜（Windows 大小写不敏感，`Docs/` 会假阳）。
const selfRel = relative(ws, SELF).replaceAll('\\', '/').toLowerCase();
const entry = EXPECTED.find(([proj, copyRel]) => `${proj}/${copyRel}`.toLowerCase() === selfRel);

if (entry === undefined) {
  console.error('baseline-copy-check: 本仓装了这道门，但本脚本不在工作区副本清单里。');
  console.error(`  本脚本在工作区中的位置：${relative(ws, SELF).replaceAll('\\', '/')}`);
  console.error('  ⇒ 要么清单漏登记了本仓，要么本脚本被搬过位置。两种都必须修，不能当作「没什么可判」。');
  console.error('  清单：Docs/baseline-copies.manifest.mjs 的 EXPECTED');
  process.exit(1);
}

const proj = entry[0];
const { ok, fails, total } = runCheck({ root: ws, only: proj });

for (const s of ok) console.log(`  ok    ${s}`);
for (const s of fails) console.error(`  FAIL  ${s}`);

if (fails.length > 0) {
  console.error(`\nbaseline-copy-check: ${proj} 有 ${fails.length} 份副本与工作区权威不一致。`);
  console.error('同步：在工作区根跑 node Docs/check-baseline-copies.mjs --write');
  process.exit(1);
}
console.log(`baseline-copy-check: ${proj} 的 ${total} 份副本全部与工作区权威一致。`);
process.exit(0);
