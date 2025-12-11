import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Card,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import adminApi from "../api/adminApi";

// Token 축약용 함수
function shortenToken(token) {
  if (!token) return "";
  return token.substring(0, 12) + "... (중략) ... " + token.slice(-10);
}

export default function Tokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadTokens = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTokens();

      const mapped = res.data.map((t) => ({
        email: t.EMAIL,
        refreshToken: t.REFRESH_TOKEN,
        refreshTokenShort: shortenToken(t.REFRESH_TOKEN),
        createdAt: t.CREATED_AT,
      }));

      setTokens(mapped);
    } catch (err) {
      console.error(err);
      alert("토큰 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const filtered = tokens.filter((t) =>
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  // =====================================
  // 🔥 개별 Refresh Token 삭제
  // =====================================
  const deleteToken = async (email) => {
    const message =
      `⚠ Refresh Token 삭제 안내\n\n` +
      `${email} 사용자의 Refresh Token을 삭제하면:\n` +
      `• 사용자는 즉시 로그아웃되지는 않습니다.\n` +
      `• Access Token 유효 시간 동안은 계속 요청이 가능합니다.\n` +
      `• Access Token이 만료되는 순간 자동 로그아웃됩니다.\n` +
      `• 다시 로그인해야 새로운 토큰이 발급됩니다.\n\n` +
      `삭제를 진행하시겠습니까?`;

    if (!window.confirm(message)) return;

    try {
      await adminApi.deleteUserToken(email);
      alert("Refresh Token이 삭제되었습니다. Access Token 만료 시 로그아웃됩니다.");
      loadTokens();
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================
  // 🔥 전체 Refresh Token 초기화
  // =====================================
  const clearAllTokens = async () => {
    const message =
      `⚠ 전체 Refresh Token 초기화 안내\n\n` +
      `• 모든 사용자는 즉시 로그아웃되지는 않습니다.\n` +
      `• Access Token 만료 시 자동 로그아웃됩니다.\n` +
      `• 다시 로그인해야 새로운 토큰이 발급됩니다.\n\n` +
      `정말 전체 토큰을 초기화하시겠습니까?`;

    if (!window.confirm(message)) return;

    try {
      await adminApi.clearAllTokens();
      alert("전체 Refresh Token이 삭제되었습니다.");
      loadTokens();
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================
  // DataGrid 컬럼 정의
  // =====================================
  const columns = [
    { field: "email", headerName: "Email", width: 250 },
    { field: "createdAt", headerName: "생성일", width: 200 },
    {
      field: "refreshTokenShort",
      headerName: "Refresh Token",
      width: 450,
    },
    {
      field: "actions",
      headerName: "관리",
      width: 120,
      renderCell: (p) => (
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => deleteToken(p.row.email)}
        >
          삭제
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, width: "100%", display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: "1200px", p: 3 }}>
        {/* 제목 */}
        <Typography variant="h5" fontWeight="bold" mb={2}>
          토큰 관리
        </Typography>

        {/* 검색 + 전체 삭제 버튼 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <TextField
            size="small"
            placeholder="이메일 검색"
            sx={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button variant="contained" color="error" onClick={clearAllTokens}>
            전체 토큰 초기화
          </Button>
        </Stack>

        {/* 테이블 */}
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.email}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </Box>
      </Card>
    </Box>
  );
}
