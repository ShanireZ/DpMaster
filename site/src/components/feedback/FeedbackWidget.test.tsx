import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeedbackWidget from './FeedbackWidget.tsx'
import { platformLabel } from './platform.ts'

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
      fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/api/feedback'))

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

describe('platformLabel', () => {
  // 映射表出处：learn.microsoft.com/microsoft-edge/web-platform/how-to-detect-win11
  // （2026-06 版）—— Windows 的 platformVersion 是 UniversalApiContract 版本，
  // 不是营销版本号，所以 Windows 11 会报「15.0」这种数字。
  it('把 Windows 的 UniversalApiContract 版本翻成营销版本名', () => {
    expect(platformLabel('Windows', '15.0.0')).toBe('Windows 11')
    expect(platformLabel('Windows', '13.0.0')).toBe('Windows 11')
    expect(platformLabel('Windows', '10.0.0')).toBe('Windows 10')
    expect(platformLabel('Windows', '1.0.0')).toBe('Windows 10')
    expect(platformLabel('Windows', '0.0.0')).toBe('Windows 7/8/8.1')
  })

  it('详表未列出的 11 / 12 跟随官方示例归入 Windows 10', () => {
    // 微软的示例代码是 >=13 → Win11，>0 → Win10；详表里 11、12 没列，
    // 但不能因此自创第三种判法。
    expect(platformLabel('Windows', '11.0.0')).toBe('Windows 10')
    expect(platformLabel('Windows', '12.0.0')).toBe('Windows 10')
  })

  it('非 Windows 平台的 platformVersion 本身就是真实系统版本，原样展示', () => {
    expect(platformLabel('macOS', '14.5.0')).toBe('macOS 14.5.0')
    expect(platformLabel('Android', '15.0.0')).toBe('Android 15.0.0')
    expect(platformLabel('Linux', '')).toBe('Linux')
  })

  it('缺失或不可解析的输入不产生垃圾文本', () => {
    expect(platformLabel('', '15.0.0')).toBe('')
    expect(platformLabel('Windows', '')).toBe('Windows')
    expect(platformLabel('Windows', 'unknown')).toBe('Windows')
  })
})
