import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeedbackWidget from './FeedbackWidget.tsx'

function renderWidget(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FeedbackWidget />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('<FeedbackWidget>', () => {
  it('opens the dialog from the FAB', () => {
    renderWidget()
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))
    expect(screen.getByRole('dialog', { name: /报告问题/ })).toBeInTheDocument()
  })

  it('toggles the feedback kind and reflects it via aria-pressed', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))
    const initial = screen.getByRole('button', { name: '内容有误' })
    const other = screen.getByRole('button', { name: '显示异常' })

    expect(initial).toHaveAttribute('aria-pressed', 'true')
    expect(other).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(other)
    expect(other).toHaveAttribute('aria-pressed', 'true')
    expect(initial).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps submit disabled until the description is at least 4 chars', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))
    const submit = screen.getByRole('button', { name: /提交/ })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/具体问题/), { target: { value: 'f[3] 应为 6' } })
    expect(submit).toBeEnabled()
  })

  it('shows the success state after a successful submit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    )
    renderWidget('/part/a/knapsack01')
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))
    fireEvent.change(screen.getByLabelText(/具体问题/), { target: { value: '第 2 步算错了' } })
    fireEvent.click(screen.getByRole('button', { name: /提交/ }))

    await waitFor(() => {
      expect(screen.getByText('已收到，谢谢你！')).toBeInTheDocument()
    })
  })
})
