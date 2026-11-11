// baseline-copy: authority=Docs/baseline-copy-check.template.mts sha256=5035d28885c4603f03c20891bbe1ca476aaa804944834034d1e27c2e7b853abe

// （無 shebang：釘子必須是第 1 行，而 shebang 只在第 1 行才有效 —— 兩者不能共存。
//   各倉以 `node scripts/check-baseline-copy.mts` 直接執行；WenTian 先編譯，再執行產物。）
// 本儲存庫在工作區副本清單裡的那些檔案，必須與工作區權威逐位元組一致。
//
// ★ 本檔案是從 Docs/baseline-copy-check.template.mts 生成的副本，**不要就地改**——
//   工作區的 `node Docs/check-baseline-copies.mjs` 會逐位元組比對它，改了即紅。
//   要改邏輯就改範本，然後 `node Docs/check-baseline-copies.mjs --write`。
//
// ★ **判什麼由清單點名，不由本指令碼嗅探。** 清單與比對語義都在工作區的
//   `Docs/baseline-copies.manifest.mjs`，工作區級那條命令 import 的是同一個模組
//   ⇒ 單一儲存庫門與工作區門永遠判同一張表、同一套判據，不可能各自漂。
//
//   ⛔ 上一版不是這樣：它自己去 docs/ 裡嗅探「首行有釘子的檔案」當作副本。
//      faccb07 為讓 OKF frontmatter 回到第 1 行刪掉了 md 副本的釘子，於是 7 個倉的
//      本指令碼**同時**退化成恆定列印「本儲存庫沒有 baseline 副本，跳過」並退 0 ——
//      門還在、`pnpm baseline:check` 還綠，但它不判任何東西。
//      教訓：**能推斷出「沒什麼可判」的判據，就能悄悄退化成空轉。**
//      所以下面「本儲存庫不在清單裡」這一支是**紅**，不是跳過。
//
// ⚠ 跨儲存庫比對**必須同時看到兩邊**，而單一儲存庫 CI 只 clone 了這一個倉。
//   所以找不到工作區權威時它**顯式宣告跳過並退 0**，不是靜默通過：
//   - 開發機（工作區在）→ 真判，不一致即紅。
//   - 單一儲存庫 CI（工作區不在）→ 打一行大寫 SKIP。**唯一的執法點是工作區級那條命令**，
//     執法點是工作區級的 node Docs/check-baseline-copies.mjs。
//   這條取捨是 owner 2026-08-30 拍的：讓「沒判」看得見，比讓它假裝判過要好。
//
// ⚠ 本檔案是 TypeScript（2026-11-11 owner 決定由 .mjs 改來），有兩種執行方式，兩種都必須成立：
//   多數倉由 Node 直接執行、不經編譯；WenTian 不留任何直接執行的 TS，先編譯再執行產物。
//   - 直接執行時型別語法由 Node 剝除，所以**只能用可直接刪除的語法**：
//     不用 enum、namespace、建構子參數屬性，純型別匯入要寫 `import type`。
//   - 編譯後執行的是產物目錄裡的檔案，所以**不能拿本檔案自己的路徑去對清單**；
//     下面是用「執行位置落在哪個專案目錄裡」反查專案，再確認清單登記的那份原始碼副本還在。
//   - 副檔名是 `.mts`：它在每個倉都被當成 ES module，不看該倉 package.json 的 `type`。
//   - 它要同時通過 7 個倉各自的 lint 與型別檢查。BetAI 那道是
//     `oxlint --type-aware --deny-warnings`，所以用型別守衛收窄而不用型別斷言、
//     用 `import.meta.dirname`（本工作區各儲存庫 `engines.node` 均 ≥ 26）、
//     用 `replaceAll` 與顯式長度比較。**不要加 lint 豁免註解**。

import { existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

/** [專案, 副本相對路徑, 權威相對路徑] */
type CopyEntry = [string, string, string];
type CheckResult = { ok: string[]; fails: string[]; total: number };
type Manifest = {
  EXPECTED: CopyEntry[];
  runCheck: (o: { root: string; only?: string | null; write?: boolean }) => CheckResult;
};

const SELF = import.meta.filename;
const HERE = import.meta.dirname;
const MANIFEST = ['Docs', 'baseline-copies.manifest.mjs'];
/** 本範本在清單「權威」欄裡的寫法；用它在清單裡找出登記了本指令碼的專案。 */
const TEMPLATE = 'Docs/baseline-copy-check.template.mts';

/** 從本指令碼往上找工作區根：它同時有 AGENTS.md 與副本清單模組。 */
function findWorkspace(start: string): string | null {
  let d = resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(d, 'AGENTS.md')) && existsSync(join(d, ...MANIFEST))) return d;
    const up = dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

/** 清單模組的形狀守衛。 */
function isManifest(m: unknown): m is Manifest {
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

// 動態 import 的回傳值是 `any`。先落到 `unknown`，再用**類型守衛**收窄——
// 不用類型斷言：`typescript(no-unsafe-type-assertion)` 連 `unknown → T` 也判紅。
// ★ 順帶這是一條真的執行環境檢查：清單模組被改壞或改名時，這裡給一句能讀的紅，
//   而不是在下一行拋 TypeError。
const loaded: unknown = await import(pathToFileURL(join(ws, ...MANIFEST)).href);

if (!isManifest(loaded)) {
  console.error('baseline-copy-check: 工作区的副本清单模块没有导出 EXPECTED / runCheck。');
  console.error(`  期望位置：${MANIFEST.join('/')}`);
  process.exit(1);
}

const { EXPECTED, runCheck } = loaded;

// 本指令碼是清單裡登記的一項 ⇒ 用清單反查「我是哪個專案」：
// 執行位置必須落在某個登記了本範本的專案目錄裡，而且登記的那份副本真的存在。
// 不靠 docs/ 是否存在猜（Windows 大小寫不敏感，`Docs/` 會假陽），也不拿本檔案自己的完整路徑比對
// （先編譯再執行的專案，執行的是產物目錄裡的檔案）。
const hereRel = `${relative(ws, HERE).replaceAll('\\', '/').toLowerCase()}/`;
const entry = EXPECTED.find(
  ([proj, copyRel, authRel]) =>
    authRel === TEMPLATE && hereRel.startsWith(`${proj.toLowerCase()}/`) && existsSync(join(ws, proj, copyRel)),
);

if (entry === undefined) {
  console.error('baseline-copy-check: 本仓装了这道门，但本脚本不在工作区副本清单里。');
  console.error(`  本脚本在工作区中的位置：${relative(ws, SELF).replaceAll('\\', '/')}`);
  console.error('  ⇒ 要么清单漏登记了本仓，要么登记的那份副本被搬走了。两种都必须修，不能当作「没什么可判」。');
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
