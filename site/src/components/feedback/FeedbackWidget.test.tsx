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
    expect(screen.getByRole('dialog', { name: '问题反馈' })).toBeInTheDocument()
  })

  it('toggles the feedback kind and reflects it via aria-pressed', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))
    const initial = screen.getByRole('button', { name: '内容错漏' })
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

  it('submits the hidden route and automatic diagnostics before showing success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        status: 'delivered',
        requestId: 'feedback-test-receipt',
      }),
    })
    vi.stubGlobal(
      'fetch',
      fetchMock,
    )
    renderWidget('/part/a/01')
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))
    fireEvent.change(screen.getByLabelText(/具体问题/), { target: { value: '第 2 步算错了' } })
    fireEvent.click(screen.getByRole('button', { name: /提交/ }))

    const feedbackCalls = () =>
      fetchMock.mock.calls.filter(([url]) => url === '/api/feedback')

    await waitFor(() => {
      expect(feedbackCalls()).toHaveLength(1)
      expect(screen.getByText('已收到，谢谢你！')).toBeInTheDocument()
      expect(screen.getByText('feedback-test-receipt')).toBeInTheDocument()
    })

    const request = feedbackCalls()[0][1] as RequestInit
    const submitted = JSON.parse(String(request.body))
    expect(submitted).toMatchObject({
      kind: '内容错漏',
      page: 'A 背包 DP · 01 背包',
      path: '/part/a/01',
      description: '第 2 步算错了',
    })
    expect(submitted.url).toEqual(expect.any(String))
    expect(submitted.ua).toEqual(expect.any(String))
    expect(submitted.browser).toEqual(expect.any(String))
    expect(submitted.device).toEqual(expect.any(String))
    expect(submitted.viewport).toMatch(/×/)
    expect(submitted.screen).toMatch(/×/)
    expect(submitted).not.toHaveProperty('steps')
    expect(submitted).not.toHaveProperty('ip')
  })

  it('shows only the three requested kinds and hides automatic context fields', () => {
    renderWidget()
    fireEvent.click(screen.getByRole('button', { name: '反馈问题或建议' }))

    expect(screen.getByRole('group', { name: '反馈类型' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '内容错漏' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '显示异常' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '其他建议' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '功能问题' })).toBeNull()
    expect(screen.queryByRole('button', { name: '其他' })).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByText(/当前页面/)).toBeNull()
    expect(screen.queryByText(/复现步骤/)).toBeNull()
  })
})
