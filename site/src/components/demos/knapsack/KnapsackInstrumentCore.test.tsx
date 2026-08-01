import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KnapsackInstrumentCore } from './KnapsackInstrumentCore.tsx'

describe('KnapsackInstrumentCore', () => {
  it('keeps algorithm data in the DOM while the generated sculpture stays decorative', () => {
    const { container } = render(
      <KnapsackInstrumentCore
        items={[
          { w: 2, v: 3 },
          { w: 3, v: 4 },
          { w: 4, v: 5 },
        ]}
        capacity={8}
        mode="2D"
        variant="01"
        playback={{
          step: 5,
          count: 29,
          itemIndex: 2,
          capacity: 3,
          decision: 'take',
          playing: false,
        }}
      />,
    )

    expect(screen.getByRole('figure', {
      name: '01 背包算法雕塑：3 件物品，容量 8，二维原型',
    })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: '容量状态 0 到 8' }).children).toHaveLength(9)
    expect(screen.getByRole('list', { name: '当前物品' }).children).toHaveLength(3)
    expect(screen.getByLabelText('容量 2，对应物品重量')).toBeInTheDocument()
    expect(screen.getByLabelText('容量 3，对应物品重量')).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText(/正在计算物品 2/)).toHaveTextContent('取入背包')
    expect(container.querySelector('.knapsack-instrument__objects')?.children).toHaveLength(3)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })
})
