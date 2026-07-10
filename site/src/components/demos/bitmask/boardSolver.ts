import {
  areCompatibleKingRows,
  countBits,
  isLegalKingRow,
  legalKingRows,
} from '../../../algorithms/bitmask-board/index.ts'
import { recordKingsBoard } from '../../../algorithms/bitmask-board/internal.ts'

export function rowValid(mask: number): boolean {
  return isLegalKingRow(mask)
}

export function betweenValid(mask: number, previous: number): boolean {
  return areCompatibleKingRows(mask, previous)
}

export function popcount(value: number): number {
  return countBits(value)
}

export function legalRowMasks(size: number): number[] {
  return legalKingRows(size)
}

export function countKings(size: number, kings: number): number {
  return recordKingsBoard(size, kings).result.total
}

export interface BoardFrame {
  rows: number[]
  activeRow: number
  conflictCols: number[]
  placed: number
  caption: string
}

export function findOneLayout(size: number, kings: number): number[] | null {
  return recordKingsBoard(size, kings).result.layout
}

export function layoutFrames(size: number, kings: number, layout: number[]): BoardFrame[] {
  const frames: BoardFrame[] = [{
    rows: [],
    activeRow: 0,
    conflictCols: [],
    placed: 0,
    caption: `目标：在 ${size}×${size} 棋盘放 <b>${kings}</b> 个互不攻击的王。逐行确定每行摆法。`,
  }]
  let placed = 0
  for (let row = 0; row < size; row++) {
    const mask = layout[row]
    placed += countBits(mask)
    const columns = Array.from({ length: size }, (_, column) => column).filter((column) => ((mask >> column) & 1) === 1)
    frames.push({
      rows: layout.slice(0, row + 1),
      activeRow: row,
      conflictCols: [],
      placed,
      caption: mask === 0
        ? `第 <b>${row + 1}</b> 行为空（mask=0）。`
        : `第 <b>${row + 1}</b> 行在第 ${columns.map((column) => column + 1).join('、')} 列放王；行内与相邻行均不冲突。已放 <b>${placed}</b> 个。`,
    })
  }
  frames.push({
    rows: layout.slice(),
    activeRow: -1,
    conflictCols: [],
    placed,
    caption: `完成：放满 <b>${kings}</b> 个互不攻击的王，这是其中一种合法布局。`,
  })
  return frames
}
