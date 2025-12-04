import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- 스타일 컴포넌트 ---
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 80px);
  background-color: #f8f9fa;
`;

const SignupBox = styled.div`
  width: 480px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 30px;
  color: #333;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  text-align: left;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
    color: #666;
  }
`;

const EmailRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box; 
  &:focus { border-color: var(--primary-blue, #007bff); }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-blue, #007bff);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  &:hover { background-color: #0056b3; }
  &:disabled { background-color: #ccc; cursor: not-allowed; }
`;

const CheckButton = styled.button`
  width: 100px;
  padding: 0;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  &:hover { background-color: #5a6268; }
`;

function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '' 
  });

  const [isEmailChecked, setIsEmailChecked] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 이메일을 수정하면 중복 확인을 다시 해야 함
    if (name === 'email') {
      setIsEmailChecked(false);
    }
  };

  // 🔎 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!formData.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    
    try {
      // 파라미터 방식 전송 (?email=...)
      const response = await axios.post('/auth/check-email', null, {
        params: { email: formData.email }
      });

      if (response.data === true) {
        // alert("✅ 사용 가능한 이메일입니다.");
        setIsEmailChecked(true); 
      } else {
        // alert("❌ 이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      }

    } catch (error) {
      console.error("중복 체크 에러:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setIsEmailChecked(false);
    }
  };

  // 회원가입 요청
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailChecked) {
      alert("이메일 중복 확인을 해주세요!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다!');
      return;
    }

    // 이름 쪼개기 (홍길동 -> 성:홍, 이름:길동)
    const name = formData.name.trim();
    const lastName = name.substring(0, 1);
    const firstName = name.substring(1);

    try {
      await axios.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName,
        provider: 'LOCAL'
      });
      
      // ⭐ [수정됨] 성공 시 알림 후 메인 페이지로 이동
      alert('회원가입이 완료되었습니다!\n가입하신 이메일로 인증 링크가 발송되었습니다.\n메일함에서 인증을 완료한 후 로그인해주세요.');
      
      navigate('/'); // 메인으로 이동

    } catch (error) {
      console.error('가입 에러:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <Container>
      <SignupBox>
        <Title>회원가입</Title>
        <form onSubmit={handleSubmit}>
          
          <InputGroup>
            <label>이메일</label>
            <EmailRow>
              <Input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="example@email.com" 
              />
              <CheckButton type="button" onClick={handleCheckEmail}>중복 확인</CheckButton>
            </EmailRow>
            {isEmailChecked && <span style={{color: 'green', fontSize: '12px', marginTop: '5px', display: 'block'}}>✅ 사용 가능합니다.</span>}
          </InputGroup>

          <InputGroup>
            <label>비밀번호</label>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호" />
          </InputGroup>

          <InputGroup>
            <label>비밀번호 확인</label>
            <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="비밀번호 확인" />
          </InputGroup>

          <InputGroup>
            <label>이름</label>
            <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="실명 입력" />
          </InputGroup>

          <Button type="submit" disabled={!isEmailChecked}>가입하기</Button>
        </form>
      </SignupBox>
    </Container>
  );
}
export default Signup;