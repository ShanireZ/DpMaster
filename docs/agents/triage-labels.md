---
type: convention
title: Agent skill triage labels
description: The five canonical engineering-skill triage roles map to no published label here; say the triage judgement in the issue instead.
tags: [agents, triage]
status: stable
---

# Triage Labels

技能用五个 canonical triage 角色说话。本文件回答的是：**技能说「打上那个标签」时，这里到底该做什么。**

## 映射：四个角色没有标签可打

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | **（不发布）**       | Maintainer needs to evaluate this issue  |
| `needs-info`               | **（不发布）**       | Waiting on reporter for more information |
| `ready-for-agent`          | **（不发布）**       | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | **（不发布）**       | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

★ `wontfix` 能用，是因为它本来就是 GitHub 的默认标签之一 —— **不是有人为 triage 建的**。

## 技能提到某个 triage 角色时怎么办

**把那个判断写成 issue 正文或评论里的一句话**，连同判断的依据。
读 issue 的人和下一个 agent 都读得到它，而一个没发布的标签他们读不到。

⛔ **不要临时 `gh label create` 一个再打上去。** 那样每个仓会长出各自拼法的一套词汇
（`ready-for-agent` / `ready_for_agent` / `agent-ready`），而**没有任何东西在对齐它们**。
要发布，走下面「某个项目真要用标签时」。

## 2026-09-09 的实测读数（⛔ 别重跑这趟调查）

| 量的东西 | 结果 |
|---|---|
| 18 个可达仓里这四个标签的数量 | **0**（`gh label list` 逐仓扫） |
| 各仓实际标签 | 9 个 GitHub 默认；`Plumbline` / `PubEnvCtl` / `RootPage` 另有 `accessibility` |
| 本文件的副本份数 | **19**（每个项目 `docs/agents/` 各一份） |
| 其中仍是模板原样的 | **18 份逐字节相同** |
| 唯一改过的那份 | `Plumbline`，**只改了末句**、映射一个字没动 |

★★★ **值得记的不是「没人建标签」，是这份模板 19/19 全没填过。**
它原来的末句是「Edit the right-hand column to match whatever vocabulary you actually use」——
一句从来没有人执行过的指令，读起来却完全像一条正常的约定。

⛔ **未采纳「把四个标签建到 19 个仓里让文档变真」**：找不到任何消费方。
那正是本工作区栽过两次的形状 —— **声明了却没有人接**
（BetaPass 的 prune 单测全绿只证明「调用它会删对行」，不证明「有人调用它」；betai 的 D133 同理）。

## 某个项目真要用标签时

1. `gh label create` 真的建出来，**建完当场 `gh label list` 复核**；
2. 改**那个项目自己的** `docs/agents/triage-labels.md` 右列；
3. 在那份副本里写下**为什么它与本默认不同** —— 下一个接手的人只读得到副本。

★ 本文件**有意不在副本一致性门里**（判据与理由见工作区根的
`Docs/baseline-copies.manifest.mjs`「共享的 agent 约定」段 —— ⛔ 这里**有意不写成相对链接**：
本文件会被复制进各项目 `docs/agents/`，那一层解不开这条路径）：
它是**各项目可以分化的默认值**，不是强制抄件。
⇒ 上面那张读数表描述的是 2026-09-09 那天的实况，**不是不变量**；⛔ 引用前现查。
