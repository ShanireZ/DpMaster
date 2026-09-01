// baseline-copy: authority=Docs/baseline-copy-check.template.mjs sha256=9f8899702d7a673e96af9c7e1db6f61c1737a97fe92f67b1c493ad322b82d092

// （无 shebang：钉子必须是第 1 行，而 shebang 只在第 1 行才有效 —— 两者不能共存。
//   本脚本一律以 `node scripts/check-baseline-copy.mjs` 调用。）
// 本仓 docs/ 下的 baseline 副本必须与工作区权威逐字节一致。
//
// ★ 本文件是从 Docs/baseline-copy-check.template.mjs 生成的副本，**不要就地改**——
//   工作区的 `node Docs/check-baseline-copies.mjs` 会逐字节比对它，改了即红。
//   要改逻辑就改模板，然后 `node Docs/check-baseline-copies.mjs --write`。
//
// ⚠ 跨仓比对**必须同时看到两边**，而单仓 CI 只 clone 了这一个仓。
//   所以找不到工作区权威时它**显式宣告跳过并退 0**，不是静默通过：
//   - 开发机（工作区在）→ 真判，不一致即红。
//   - 单仓 CI（工作区不在）→ 打一行大写 SKIP。**唯一的执法点是工作区级那条命令**，
//     执法点是工作区级的 node Docs/check-baseline-copies.mjs。
//   这条取舍是 owner 2026-08-30 拍的：让「没判」看得见，比让它假装判过要好。

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIN = /^<!-- baseline-copy: authority=(\S+) sha256=([0-9a-f]{64}) -->\r?\n\r?\n/;

/** 从本脚本往上找工作区根：它同时有 AGENTS.md 与 Docs/check-baseline-copies.mjs。 */
function findWorkspace(start) {
  let d = resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(d, 'AGENTS.md')) && existsSync(join(d, 'Docs', 'check-baseline-copies.mjs'))) return d;
    const up = dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

/** 本仓根：从本脚本往上找到含 docs/ 的那一层（scripts/ 的父目录）。 */
function findRepo(start) {
  let d = resolve(start);
  for (let i = 0; i < 4; i++) {
    if (existsSync(join(d, 'docs'))) return d;
    const up = dirname(d);
    if (up === d) break;
    d = up;
  }
  return null;
}

const ws = findWorkspace(HERE);
const repo = findRepo(HERE);

if (!repo) {
  console.error('baseline-copy-check: 找不到本仓的 docs/ 目录');
  process.exit(1);
}

const copies = readdirSync(join(repo, 'docs'), { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.md'))
  .map((e) => join(repo, 'docs', e.name))
  .filter((p) => PIN.test(readFileSync(p, 'utf8')));

if (copies.length === 0) {
  console.log('baseline-copy-check: 本仓没有 baseline 副本，跳过。');
  process.exit(0);
}

if (!ws) {
  console.log('==================================================================');
  console.log('BASELINE-COPY-CHECK SKIPPED — 找不到工作区权威，本次没有校验任何东西。');
  console.log(`  本仓有 ${copies.length} 份 baseline 副本，它们与工作区权威是否一致 **本次未判**。`);
  console.log('  唯一执法点：在工作区根跑 node Docs/check-baseline-copies.mjs');
  console.log('==================================================================');
  process.exit(0);
}

let bad = 0;
for (const p of copies) {
  const text = readFileSync(p, 'utf8');
  const m = text.match(PIN);
  const [, authRel, pinned] = m;
  const authPath = join(ws, ...authRel.split('/'));
  const name = p.slice(repo.length + 1).replace(/\\/g, '/');
  if (!existsSync(authPath)) {
    console.error(`  FAIL  ${name}: 权威 ${authRel} 在工作区里不存在`);
    bad++;
    continue;
  }
  const auth = readFileSync(authPath);
  const authHash = createHash('sha256').update(auth).digest('hex');
  if (pinned !== authHash) {
    const at = [...pinned].findIndex((c, i) => c !== authHash[i]);
    console.error(`  FAIL  ${name}: 钉的 sha256 与权威不符（第 ${at} 位起）—— 权威改过而副本没跟`);
    bad++;
    continue;
  }
  if (Buffer.compare(Buffer.from(text.slice(m[0].length), 'utf8'), auth) !== 0) {
    console.error(`  FAIL  ${name}: 正文与权威不逐字节相同 —— 副本被就地改过`);
    bad++;
    continue;
  }
  console.log(`  ok    ${name}: 与 ${authRel} 一致`);
}

if (bad) {
  console.error(`\nbaseline-copy-check: ${bad} 份副本与工作区权威不一致。`);
  console.error('同步：在工作区根跑 node Docs/check-baseline-copies.mjs --write');
  process.exit(1);
}
console.log(`baseline-copy-check: ${copies.length} 份副本全部与工作区权威一致。`);
process.exit(0);
