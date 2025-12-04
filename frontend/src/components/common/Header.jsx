import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

// 경로 확인 필수
import LoginModal from '../auth/LoginModal'; 

const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-blue);
  text-decoration: none;
  margin-right: 30px;
`;

const NavMenu = styled.nav`
  display: flex;
  gap: 25px;
  margin-right: auto;
  a {
    color: var(--text-dark);
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { 
      color: var(--primary-blue); 
    }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px 15px;
  background-color: #f9f9f9;
`;

const SearchInput = styled.input`
  border: none;
  background: none;
  outline: none;
  padding: 5px;
  font-size: 14px;
  width: 150px;
`;

const SearchBtn = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  &:hover { color: var(--primary-blue); }
`;

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LoginButton = styled.button`
  padding: 8px 20px;
  background-color: var(--primary-blue);
  color: #ffffff;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

const LogoutButton = styled(LoginButton)`
  background-color: #6c757d; 
`;

function Header() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  // 로그인한 유저 정보를 담을 그릇
  const [user, setUser] = useState(null);

  // 화면이 켜질 때 저장소(localStorage) 검사
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 로그아웃 기능
  const handleLogout = () => {
    localStorage.removeItem('user');
    // 토큰 2개 모두 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    alert('로그아웃 되었습니다.');
    navigate('/');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSearch = () => {
    if (keyword.trim()) {
      // 리액트 검색 페이지로 이동
      navigate(`/search?keyword=${keyword.trim()}`);
    } else {
      alert("검색어를 입력해주세요.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
      <StyledHeader>
        <Logo to="/">K-Stock Insight</Logo>
        
        <NavMenu>
          <Link to="/">홈</Link>
          <Link to="/dashboard">감성 대시보드</Link>
          <Link to="/trend">키워드 트렌드</Link>
          <Link to="/marketcap">시총 순위</Link>
        </NavMenu>

        <AuthContainer>
          <SearchContainer>
            <SearchInput 
              type="text" 
              placeholder="종목 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <SearchBtn onClick={handleSearch}>🔍</SearchBtn>
          </SearchContainer>

          {/* 로그인 여부에 따라 버튼 변경 */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {user.fullName || user.email}님
              </span>
              <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
            </div>
          ) : (
            <LoginButton onClick={openModal}>로그인</LoginButton>
          )}

        </AuthContainer>
      </StyledHeader>

      {isModalOpen && <LoginModal onClose={closeModal} />}
    </>
  );
}

export default Header;