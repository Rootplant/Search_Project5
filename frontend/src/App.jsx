// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// 🔴 경로: src 폴더 내의 layouts 폴더
import MainLayout from './layouts/MainLayout'; 
//관리자 레이아웃
import AdminLayout from './layouts/AdminLayout';
import FavoritesPage from './pages/FavoritesPage';
// 🔴 경로: src 폴더 내의 pages 폴더
import HomePage from './pages/HomePage';
import SearchResultPage from './pages/SearchResultPage';
import StockDetailPage from './pages/StockDetailPage';
import DashboardPage from './pages/DashboardPage';
import KeywordTrendPage from './pages/KeywordTrendPage';
// 🔴 경로: src 폴더 내의 styles 폴더
import GlobalStyles from './styles/GlobalStyles';
import MarketCapPage from './pages/MarketCapPage'; // ⬅️ 임포트 추가
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/Login';
import Signup from './pages/Signup';
import FindPw from './pages/find_pw';
import VerifyPage from './pages/VerifyPage';
//관리자 페이지
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserListPage from './pages/admin/AdminUserListPage';
import AdminRolePage from './pages/admin/AdminRolePage';
import AdminRefreshPage from './pages/admin/AdminRefreshPage';
import AdminLogPage from './pages/admin/AdminLogPage';

import TestStockDetailPage from './pages/TestStockDetailPage';

import FindPasswordPage from './pages/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import SocialLoginCallback from './pages/SocialLoginCallback';
import MyPage from './pages/MyPage';
import MobileApprovePage from './pages/MobileApprovePage';

//관리자 권한 판단
import AdminRoute from './routes/AdminRoute';

import StockRealtime from './pages/StockRealtime';

function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <AuthProvider>
      <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search/:keyword" element={<SearchResultPage />} />
            <Route path="stock/:stockCode" element={<StockDetailPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="trend" element={<KeywordTrendPage />} />
            <Route path="marketcap" element={<MarketCapPage />} />
            <Route path="favorites" element={<FavoritesPage />} /> {/* ⬅️ FavoritesPage 라우트 */}
            <Route path="mypage" element={<MyPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<Signup />} />
            <Route path="findpw" element={<FindPw />} />
            <Route path="search" element={<SearchResultPage />} />
            <Route path="verify" element={<VerifyPage />} />
            <Route path="/chart/:code" element={<TestStockDetailPage />} />
            <Route path="find-pw" element={<FindPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="oauth/callback/kakao" element={<SocialLoginCallback provider="kakao" />} />
            <Route path="oauth/callback/naver" element={<SocialLoginCallback provider="naver" />} />
            <Route path="oauth/callback/google" element={<SocialLoginCallback provider="google" />} />
            <Route path="mobile-approve" element={<MobileApprovePage />} />
            <Route path="/stock/test/:stockCode" element={<StockRealtime />} />
          </Route>

          {/*관리자 페이지*/}
          <Route 
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUserListPage />} />
            <Route path="roles" element={<AdminRolePage />} />
            <Route path="refresh" element={<AdminRefreshPage />} />
            <Route path="logs" element={<AdminLogPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;