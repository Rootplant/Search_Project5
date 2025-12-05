import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- 스타일 컴포넌트 ---
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px; right: 15px;
  background: none; border: none; font-size: 20px;
  cursor: pointer; color: #666;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const Input = styled.input`
  width: 100%; padding: 12px; margin-bottom: 15px;
  border: 1px solid #ddd; border-radius: 4px;
  box-sizing: border-box;
`;

const Button = styled.button`
  width: 100%; padding: 12px;
  background-color: var(--primary-blue, #007bff);
  color: white; border: none; border-radius: 4px;
  cursor: pointer; font-weight: bold; font-size: 16px;
  &:hover { background-color: #0056b3; }
`;

const Divider = styled.div`
  margin: 25px 0;
  position: relative;
  border-top: 1px solid #eee;
  
  span {
    position: absolute;
    top: -10px; left: 50%; transform: translateX(-50%);
    background-color: white; padding: 0 10px;
    color: #999; font-size: 12px;
  }
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &.kakao { background-color: #FEE500; color: #000; }
  &.naver { background-color: #03C75A; color: #fff; }
  &.google { background-color: #fff; color: #000; border: 1px solid #ddd; }
  
  &:hover { opacity: 0.9; }
`;

const Footer = styled.div`
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterRow = styled.div`
  font-size: 13px;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const LinkText = styled.span`
  color: #007bff; cursor: pointer; font-weight: bold;
`;


function LoginModal({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 일반 로그인 로직
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });
      if (response.status === 200) {
        const { accessToken, refreshToken, token } = response.data;
        const user = response.data.user || response.data.userInfo;
        
        localStorage.setItem('accessToken', accessToken || token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        
        const userInfo = user || { email: formData.email, fullName: '회원' };
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        alert("로그인 성공!");
        onClose();
        window.location.reload(); 
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data;
        
        if (status === 403 && typeof msg === 'string' && msg.includes('이메일 인증')) {
            if (window.confirm(`${msg}\n\n지금 인증 코드를 입력하시겠습니까?`)) {
                onClose();
                navigate(`/verify-email?email=${formData.email}`);
            }
            return;
        }
        if (status === 401) {
            alert("아이디 또는 비밀번호가 일치하지 않습니다.");
            return;
        }
        alert(typeof msg === 'string' ? msg : "로그인에 실패했습니다.");
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    }
  };

  // ⭐ [수정됨] 환경 변수에서 키값 가져오기
  const handleSocialLogin = (provider) => {
    
    // .env 파일에서 VITE_로 시작하는 변수 불러오기
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // 프론트엔드 콜백 주소 (App.jsx 설정과 일치해야 함)
    const REDIRECT_URI_ROOT = "http://localhost:5173/oauth/callback";

    let url = "";

    if (provider === 'kakao') {
      const redirectUri = `${REDIRECT_URI_ROOT}/kakao`;
      url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
    }
    
    if (provider === 'naver') {
      const redirectUri = `${REDIRECT_URI_ROOT}/naver`;
      const state = Math.random().toString(36).substring(7); 
      url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}`;
    }
    
    if (provider === 'google') {
      const redirectUri = `${REDIRECT_URI_ROOT}/google`;
      url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
    }

    if (url) window.location.href = url;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onClose}>X</CloseButton>
        <Title>로그인</Title>
        
        <form onSubmit={handleSubmit}>
          <Input 
            type="email" name="email" placeholder="이메일"
            value={formData.email} onChange={handleChange}
          />
          <Input 
            type="password" name="password" placeholder="비밀번호"
            value={formData.password} onChange={handleChange}
          />
          <Button type="submit">로그인</Button>
        </form>

        <Divider><span>또는</span></Divider>
        
        <SocialButton className="kakao" onClick={() => handleSocialLogin('kakao')}>
           카카오로 시작하기
        </SocialButton>
        <SocialButton className="naver" onClick={() => handleSocialLogin('naver')}>
           네이버로 시작하기
        </SocialButton>
        <SocialButton className="google" onClick={() => handleSocialLogin('google')}>
           구글로 시작하기
        </SocialButton>

        <Footer>
            <FooterRow>
                <span>계정이 없으신가요?</span>
                <LinkText onClick={() => { onClose(); navigate('/signup'); }}>
                  회원가입
                </LinkText>
            </FooterRow>
            <FooterRow>
                <span>비밀번호를 잊으셨나요?</span>
                <LinkText onClick={() => { onClose(); navigate('/find-pw'); }}>
                  비밀번호 찾기
                </LinkText>
            </FooterRow>
        </Footer>

      </ModalContent>
    </ModalOverlay>
  );
}

export default LoginModal;