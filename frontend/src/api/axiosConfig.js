import axios from 'axios';

// 1. 요청 인터셉터 (나갈 때): 헤더에 토큰 자동 끼워넣기
axios.interceptors.request.use(
  (config) => {
    // 저장된 Access Token을 꺼내옵니다.
    const accessToken = localStorage.getItem('accessToken');
    
    // 토큰이 있다면 헤더에 'Bearer {토큰}' 형식으로 추가
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. 응답 인터셉터 (들어올 때): 401 에러(만료) 시 토큰 재발급 시도
axios.interceptors.response.use(
  (response) => response, // 성공하면 그냥 통과
  
  async (error) => {
    const originalRequest = error.config;

    // 401 에러(인증 실패)가 났고, 아직 재시도를 안 했다면?
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // "재시도 했음" 표시 (무한루프 방지)

      try {
        // Refresh Token 꺼내오기
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            // 리프레시 토큰도 없으면 진짜 로그아웃
            throw new Error("No refresh token");
        }

        // 백엔드에 "새 토큰 주세요" 요청 (/auth/refresh)
        const res = await axios.post('/auth/refresh', { refreshToken });
        
        // 새로 받은 Access Token 저장
        const newAccessToken = res.data.accessToken; 
        localStorage.setItem('accessToken', newAccessToken);

        // (선택) 만약 Refresh Token도 새로 준다면 같이 갱신
        if (res.data.refreshToken) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
        }

        // 실패했던 원래 요청의 헤더를 새 토큰으로 교체
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // 원래 요청 다시 쏘기!
        return axios(originalRequest);

      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
        // 갱신 실패하면 깔끔하게 로그아웃 처리
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = '/'; // 메인으로 튕겨내기
      }
    }

    return Promise.reject(error);
  }
);

export default axios;