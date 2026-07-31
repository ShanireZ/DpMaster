import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import PlugContourDemo from './PlugContourDemo.tsx'

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
})

describe('PlugContourDemo', () => {
  it('advances the contour state and exposes all standard detail layers', async () => {
    const user = userEvent.setup()
    render(<PlugContourDemo />)

    expect(screen.getByRole('heading', { name: '轮廓线连通性扫描仪' })).toBeInTheDocument()
    expect(screen.getByText('1 / 6')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '状态' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '表格' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '轨迹' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '下一步' }))

    expect(screen.getByText('2 / 6')).toBeInTheDocument()
    expect(screen.getAllByText('右移并保持配对').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('tab', { name: '表格' }))
    expect(screen.getByRole('region', { name: '插头 DP 轮廓状态转移表' })).toBeInTheDocument()
  })
})
