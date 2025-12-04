import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 스타일 객체 정의
const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: 'calc(100vh - 80px)', backgroundColor: '#f8f9fa',
  },
  box: {
    width: '450px', padding: '50px', backgroundColor: 'white',
    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', textAlign: 'center',
  },
  icon: { fontSize: '50px', marginBottom: '20px' },
  title: { marginBottom: '15px', color: '#333' },
  message: { color: '#666', marginBottom: '30px', lineHeight: '1.5' },
  button: {
    padding: '12px 30px', backgroundColor: '#007bff', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
  },
  buttonGrey: {
    padding: '12px 30px', backgroundColor: '#6c757d', color: 'white',
    border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
  }
};

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); 
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); 

  // ⭐ [핵심 1] 실행 여부를 기억하는 변수 (화면이 바뀌어도 기억함)
  const isRun = useRef(false);

  useEffect(() => {
    // ⭐ [핵심 2] 이미 실행된 적이 있으면 함수를 그냥 끝내버림 (두 번째 실행 방지)
    if (isRun.current) return;

    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      // ⭐ [핵심 3] "나 실행한다!" 라고 깃발 꽂기
      isRun.current = true;

      try {
        console.log("인증 요청 보냄:", token); // 콘솔에서 한 번만 찍히는지 확인해보세요
        const response = await axios.get(`/auth/verify?token=${token}`);
        
        if (response.status === 200) {
          setStatus('success');
        }
      } catch (error) {
        console.error("인증 실패:", error);
        
        // (안전장치) 혹시라도 두 번 실행되어 400이 떠도 성공으로 처리
        if (error.response && error.response.status === 400) {
             const msg = error.response.data;
             if (typeof msg === 'string' && (msg.includes('이미') || msg.includes('already'))) {
                 setStatus('success');
                 return;
             }
        }
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  // --- 화면 렌더링 ---
  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <div style={styles.icon}>⏳</div>
          <h2 style={styles.title}>인증 처리 중...</h2>
          <p style={styles.message}>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.box}>
          <div style={styles.icon}>🎉</div>
          <h2 style={styles.title}>이메일 인증 성공!</h2>
          <p style={styles.message}>
            모든 인증이 완료되었습니다.<br/>
            이제 로그인하여 서비스를 이용하실 수 있습니다.
          </p>
          <button onClick={() => navigate('/')} style={styles.button}>메인으로 이동</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.icon}>⚠️</div>
        <h2 style={styles.title}>인증 실패</h2>
        <p style={styles.message}>
          유효하지 않거나 만료된 링크입니다.<br/>
          다시 로그인하여 인증 메일을 재발송해주세요.
        </p>
        <button onClick={() => navigate('/')} style={styles.buttonGrey}>
          메인으로 이동
        </button>
      </div>
    </div>
  );
}

export default VerifyPage;