---
type: convention
title: Agent skill triage labels
description: The five canonical engineering-skill triage roles map to no published label here; say the triage judgement in the issue instead.
tags: [agents, triage]
status: stable
---

# Triage Labels

技能用五個 canonical triage 角色說話。本檔案回答的是：**技能說「打上那個標籤」時，這裡到底該做什麼。**

## 映射：四個角色沒有標籤可打

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | **（不發佈）**       | Maintainer needs to evaluate this issue  |
| `needs-info`               | **（不發佈）**       | Waiting on reporter for more information |
| `ready-for-agent`          | **（不發佈）**       | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | **（不發佈）**       | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

★ `wontfix` 能用，是因為它本來就是 GitHub 的預設標籤之一 —— **不是有人為 triage 建的**。

## 技能提到某個 triage 角色時怎麼辦

**把那個判斷寫成 issue 正文或評論裡的一句話**，連同判斷的依據。
讀 issue 的人和下一個 agent 都讀得到它，而一個沒發佈的標籤他們讀不到。

⛔ **不要臨時 `gh label create` 一個再打上去。** 那樣每個倉會長出各自拼法的一套詞彙
（`ready-for-agent` / `ready_for_agent` / `agent-ready`），而**沒有任何東西在對齊它們**。
要發佈，走下面「某個專案真要用標籤時」。

## 2026-09-09 的實測讀數（⛔ 別重跑這趟調查）

| 量的東西 | 結果 |
|---|---|
| 18 個可達倉裡這四個標籤的數量 | **0**（`gh label list` 逐倉掃） |
| 各儲存庫實際標籤 | 9 個 GitHub 預設；`Plumbline` / `RootPage` 另有 `accessibility` |
| 本檔案的副本份數 | **19**（每個專案 `docs/agents/` 各一份） |
| 其中仍是範本原樣的 | **18 份逐位元組相同** |
| 唯一改過的那份 | `Plumbline`，**只改了末句**、映射一個字沒動 |

★★★ **值得記的不是「沒人建標籤」，是這份範本 19/19 全沒填過。**
它原來的末句是「Edit the right-hand column to match whatever vocabulary you actually use」——
一句從來沒有人執行過的指令，讀起來卻完全像一條正常的約定。

⛔ **未採納「把四個標籤建到 19 個倉裡讓文件變真」**：找不到任何消費方。
那正是本工作區栽過兩次的形狀 —— **宣告了卻沒有人接**
（BetaPass 的 prune 單測全綠只證明「呼叫它會刪對行」，不證明「有人呼叫它」；betai 的 D133 同理）。

## 某個專案真要用標籤時

1. `gh label create` 真的建出來，**建完當場 `gh label list` 複核**；
2. 改**那個專案自己的** `docs/agents/triage-labels.md` 右列；
3. 在那份副本裡寫下**為什麼它與本預設不同** —— 下一個接手的人只看得到副本。

★ 本檔案**有意不在副本一致性門裡**（判據與理由見工作區根的
`Docs/baseline-copies.manifest.mjs`「共享的 agent 約定」段 —— ⛔ 這裡**有意不寫成相對連結**：
本檔案會被複製進各專案 `docs/agents/`，那一層解不開這條路徑）：
它是**各專案可以分化的預設值**，不是強制抄件。
⇒ 上面那張讀數表描述的是 2026-09-09 那天的實況，**不是不變數**；⛔ 引用前現查。
