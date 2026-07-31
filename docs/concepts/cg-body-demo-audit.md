---
type: Design Audit
title: C–G Body Visualization and Demo Audit
description: Current C–G lesson-body visualization and Demo consistency findings pending the A–G standardization task.
tags: [design, visualization, demos, audit]
status: draft
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# C–G 正文图解与 Demo 一致性审计

> 本轮范围：只审计，不进行全课程正文视觉重做。
> 下一阶段目标：在三槽位稳定后，统一正文科学图版、Demo 工具条、表格滚动和状态叙事。

## 已确认基线

- C–G 正文已经拥有独立算法图解，不存在以通用占位图替代全部课程的情况。
- Demo 大多使用共享 `demo-workbench.css`，状态计算继续由现有 solver 或可复核 fixture 驱动。
- 矩阵、树、换根、状压中的大表均已具备局部滚动或小屏堆叠基础。
- 本轮不得修改 solver、输入合同、播放状态或家族小游戏逻辑。

## 下一阶段清单

| 家族 | 现状 | 下一阶段重点 |
|---|---|---|
| C 区间 | 五课拥有独立正文图解；部分课程在 JSX 内声明局部横向滚动 | 把区间表格滚动、端点标签和分割点强调收敛为公共图版规则 |
| D 矩阵 | 网格与快速幂各有独立图解和 Demo | 统一矩阵单元尺寸、乘法层级、双面板在容器断点下的堆叠顺序 |
| E 换根 | 共用 `RerootArt`，Demo 已区分两次扫描 | 强化父侧/子树侧状态色的跨图一致性，并统一轨道箭头 |
| F 树形 | `TreeArt` 覆盖固定根、直径、覆盖、背包和计数 | 把“选/不选、覆盖三态、容量卷积”建立为可复用树状态原语 |
| G 状压 | `BitArt` 覆盖棋盘、TSP、覆盖、子集与轮廓线 | 控制移动端信息密度，统一 mask/合法边/当前状态，补足插头 DP 可操作演示 |

## 进入下一阶段的门槛

- C–G 三槽位全部完成浏览器验证；
- 37 门课程页头均不再回退；
- 家族艺术资源预算稳定；
- 正文重做拥有单独评审和回归范围，不与本轮提交混合。
