import { beforeAll, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useStepPlayer } from '../../dp-engine/playback/useStepPlayer.ts'
import {
  DemoDetailSwitch,
  DemoTableViewport,
  DemoWorkbench,
  InstrumentRail,
  VizStateKey,
} from './index.ts'

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
})

function RailFixture() {
  const player = useStepPlayer(4)
  return (
    <InstrumentRail
      player={player}
      secondary={<label><input type="checkbox" />显示依赖</label>}
    />
  )
}

test('DemoWorkbench exposes one continuous accessible instrument shell', () => {
  render(
    <DemoWorkbench
      family="c"
      title="区间合并"
      visual={<div>主视觉</div>}
      rail={<div>工具轨</div>}
      status="正在计算"
      details={<div>细节层</div>}
    />,
  )
  const workbench = screen.getByRole('region', { name: '区间合并' })
  expect(workbench).toHaveAttribute('data-family', 'c')
  expect(workbench).toHaveAttribute('data-active-role', 'current')
  expect(screen.getByText('主视觉')).toBeVisible()
  expect(screen.getByText('工具轨')).toBeVisible()
  expect(screen.getByText('细节层')).toBeVisible()
})

test('InstrumentRail keeps transport order and expands secondary controls in place', async () => {
  const user = userEvent.setup()
  render(<RailFixture />)
  const buttons = screen.getAllByRole('button')
  expect(buttons.slice(0, 4).map((button) => button.getAttribute('aria-label'))).toEqual([
    '重置',
    '上一步',
    '播放',
    '下一步',
  ])
  expect(screen.getByLabelText('进度')).toBeVisible()
  const secondaryToggle = screen.getByRole('button', { name: '参数与模式' })
  expect(secondaryToggle).toHaveAttribute('aria-expanded', 'false')
  await user.click(secondaryToggle)
  expect(secondaryToggle).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('checkbox', { name: '显示依赖' })).toBeVisible()
})

test('VizStateKey gives every color role a stable symbol and data role', () => {
  render(<VizStateKey />)
  const key = screen.getByRole('list', { name: '可视状态图例' })
  expect(key.querySelectorAll('[data-viz-role]')).toHaveLength(5)
  expect(key.textContent).toContain('◇')
  expect(key.textContent).toContain('◆')
  expect(key.textContent).toContain('✓')
  expect(key.textContent).toContain('·')
  expect(key.textContent).toContain('×')
})

test('DemoDetailSwitch replaces details in place without removing the algorithm shell', async () => {
  const user = userEvent.setup()
  render(
    <DemoDetailSwitch
      items={[
        { id: 'table', label: '表格', content: <p>状态表</p> },
        { id: 'trace', label: '轨迹', content: <p>转移轨迹</p> },
      ]}
    />,
  )
  expect(screen.getByRole('tabpanel')).toHaveTextContent('状态表')
  await user.click(screen.getByRole('tab', { name: '轨迹' }))
  expect(screen.getByRole('tabpanel')).toHaveTextContent('转移轨迹')
})

test('DemoTableViewport owns local scrolling and position overview semantics', () => {
  render(
    <DemoTableViewport label="二维状态表">
      <table><tbody><tr><td>0</td></tr></tbody></table>
    </DemoTableViewport>,
  )
  expect(screen.getByRole('region', { name: '二维状态表' })).toHaveAttribute('tabindex', '0')
  expect(screen.getByLabelText('表格横向位置')).toBeVisible()
})
