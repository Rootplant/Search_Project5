import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ⭐ [추가] 방금 만든 axios 설정 파일을 여기서 불러옵니다.
// 이렇게 하면 앱 내의 모든 axios 요청에 인터셉터가 적용됩니다.
import './api/axiosConfig'; 

createRoot(document.getElementById('root')).render(
  // <sTrictMode></sTrictMode> 이건 함수를 두 번 실행하는 것인데 귀찮으면 주석처리 해도 됨
  <StrictMode>
    <App />
  </StrictMode>,
)
