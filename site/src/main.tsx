import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// 自托管字体
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
// 公式样式
import 'katex/dist/katex.min.css'
// 设计令牌与全局
import './styles/tokens.css'
import './styles/global.css'

import App from './app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
