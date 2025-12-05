import React, { useEffect, useRef } from 'react'; // useRef 추가
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SocialLoginCallback({ provider }) {
  const navigate = useNavigate();

  // ⭐ [핵심] 이미 요청했는지 체크하는 변수 (화면이 다시 그려져도 초기화 안 됨)
  const isRun = useRef(false);

  useEffect(() => {
    const login = async () => {
      // 1. URL에서 코드 추출
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code) {
        alert("잘못된 접근입니다.");
        navigate('/');
        return;
      }

      // ⭐ [핵심] 이미 실행된 적이 있다면 함수 종료! (두 번째 실행 차단)
      if (isRun.current) return;
      
      // "나 이제 실행한다!" 표시
      isRun.current = true;

      try {
        // 2. 주소 결정
        let url = '';
        if (provider === 'kakao') url = `/auth/kakao/callback?code=${code}`;
        if (provider === 'google') url = `/auth/google/callback?code=${code}`;
        if (provider === 'naver') url = `/auth/naver/callback?code=${code}&state=${state}`;

        console.log(`${provider} 로그인 요청 보냄...`);

        // 3. 백엔드 전송
        const response = await axios.get(url);

        if (response.status === 200) {
          console.log("소셜 로그인 성공:", response.data);
          
          const { accessToken, refreshToken } = response.data;
          const user = response.data.user || response.data.userInfo;

          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));

          alert(`${user.fullName || user.email || '회원'}님 환영합니다!`);
          
          navigate('/'); 
          window.location.reload(); 
        }

      } catch (error) {
        console.error("소셜 로그인 에러:", error);
        // 이미 성공했는데 두 번째 요청에서 에러난 거라면 무시해야 하지만,
        // useRef를 썼으니 여기로 들어올 일은 거의 없습니다.
        alert("소셜 로그인에 실패했습니다.");
        navigate('/');
      }
    };

    login();
  }, [provider, navigate]);

  return (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#555'
    }}>
      {provider} 로그인 처리 중입니다... ⏳
    </div>
  );
}

export default SocialLoginCallback;