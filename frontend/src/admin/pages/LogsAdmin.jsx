// src/pages/AdminActionLogs.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  Drawer,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import adminApi from "../api/adminApi";
import Tooltip from "@mui/material/Tooltip";

function getActionMeta(action = "") {
  switch (action) {
    case "CLEAR_TOKENS":
      return { label: "전체 토큰 초기화", color: "warning", icon: "🧹", category: "TOKEN" };
    case "TOKEN_DELETE":
      return { label: "개별 토큰 삭제", color: "warning", icon: "🎟️", category: "TOKEN" };
    case "RESET_FAIL":
      return { label: "로그인 실패 초기화", color: "info", icon: "♻️", category: "LOGIN_FAIL" };
    case "SUSPEND":
      return { label: "계정 정지", color: "error", icon: "⛔", category: "SUSPEND" };
    case "UNSUSPEND":
      return { label: "정지 해제", color: "success", icon: "✅", category: "SUSPEND" };
    case "ROLE_CHANGE":
      return { label: "권한 변경", color: "primary", icon: "🛡️", category: "ROLE" };
    case "FORCE_LOGOUT":
      return { label: "강제 로그아웃", color: "secondary", icon: "🚪", category: "LOGOUT" };
    default:
      return { label: action || "기타", color: "default", icon: "📄", category: "ETC" };
  }
}

function matchCategory(action, filterCategory) {
  if (filterCategory === "ALL") return true;
  return getActionMeta(action).category === filterCategory;
}

export default function AdminActionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // 🔥 관리자 작업 로그 로드
  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAdminLog();

      const mapped = res.data.map((l) => ({
        id: l.LOG_ID,
        action: l.ACTION,
        createdAt: l.CREATED_AT,
        targetEmail: l.TARGET_EMAIL,
        adminEmail: l.ADMIN_EMAIL,
        detail: l.DETAIL,
      }));

      setLogs(mapped);
    } catch (err) {
      console.error(err);
      alert("관리자 작업 로그를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // 🔍 필터
  const filtered = logs.filter((log) => {
    const kw = search.toLowerCase();

    const matchSearch =
      (log.adminEmail || "").toLowerCase().includes(kw) ||
      (log.targetEmail || "").toLowerCase().includes(kw) ||
      (log.action || "").toLowerCase().includes(kw) ||
      (log.detail || "").toLowerCase().includes(kw);

    const matchCat = matchCategory(log.action, categoryFilter);

    const date = (log.createdAt || "").substring(0, 10);
    const matchStart = startDate ? date >= startDate : true;
    const matchEnd = endDate ? date <= endDate : true;

    return matchSearch && matchCat && matchStart && matchEnd;
  });

  // ✨ CSV 다운로드 함수 (로그인 로그와 동일 스타일)
  function downloadCSV() {
    if (filtered.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const headers = ["로그ID", "시간", "관리자", "대상사용자", "작업", "상세내용"];
    const rows = filtered.map((log) => [
      log.id,
      log.createdAt,
      log.adminEmail,
      log.targetEmail || "",
      getActionMeta(log.action).label,
      log.detail.replace(/\n/g, " "),
    ]);

    const csv =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `관리자_작업로그_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // DataGrid 컬럼
  const columns = [
    { field: "createdAt", headerName: "시간", width: 180 },
    {
      field: "action",
      headerName: "작업",
      width: 180,
      renderCell: (p) => {
        const meta = getActionMeta(p.value);
        return (
          <Chip
            size="small"
            color={meta.color}
            icon={<span style={{ fontSize: 16 }}>{meta.icon}</span>}
            label={meta.label}
          />
        );
      },
    },
    { field: "adminEmail", headerName: "관리자", width: 220 },
    { field: "targetEmail", headerName: "대상 사용자", width: 220 },
    {
      field: "detail",
      headerName: "상세 내용",
      width: 400,
      renderCell: (p) => (
        <Tooltip title={p.value || ""}>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p.value}
          </Typography>
        </Tooltip>
      ),
    },
  ];

  const catBtnProps = (code) => ({
    variant: categoryFilter === code ? "contained" : "outlined",
    size: "small",
    onClick: () => setCategoryFilter(code),
  });

  return (
    <Box sx={{ p: 3, width: "100%", display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: "100%", p: 3 }}>

        {/* 제목 + CSV 버튼 (로그인 로그와 동일) */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            관리자 작업 로그
          </Typography>

          {/* ✨ CSV 버튼 색상·위치 통일 */}
          <Button variant="contained" color="primary" onClick={downloadCSV}>
            CSV 다운로드
          </Button>
        </Stack>

        {/* 필터 영역 */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          {/* 왼쪽 검색 + 카테고리 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="관리자 / 대상 이메일 / 작업 / 내용 검색"
              size="small"
              sx={{ width: 320 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Stack direction="row" spacing={1}>
              <Button {...catBtnProps("ALL")}>전체</Button>
              <Button {...catBtnProps("TOKEN")}>토큰 작업</Button>
              <Button {...catBtnProps("LOGIN_FAIL")}>로그인 실패 초기화</Button>
              <Button {...catBtnProps("SUSPEND")}>정지 / 해제</Button>
              <Button {...catBtnProps("ROLE")}>권한 변경</Button>
              <Button {...catBtnProps("LOGOUT")}>강제 로그아웃</Button>
            </Stack>
          </Stack>

          {/* 오른쪽 날짜 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="date"
              label="시작일"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="종료일"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>

        {/* DataGrid */}
        <Box sx={{ height: 650 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            pageSizeOptions={[25, 50, 100]}
            onRowClick={(p) => {
              setSelectedLog(p.row);
              setDetailOpen(true);
            }}
          />
        </Box>
      </Card>

      {/* Drawer (상세보기) */}
      <Drawer anchor="right" open={detailOpen} onClose={() => setDetailOpen(false)}>
        {selectedLog && (
          <Box sx={{ width: 380, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
              관리자 작업 상세
            </Typography>

            <Typography>로그 ID: {selectedLog.id}</Typography>
            <Typography>시간: {selectedLog.createdAt}</Typography>
            <Typography>관리자: {selectedLog.adminEmail}</Typography>
            <Typography>대상 사용자: {selectedLog.targetEmail || "-"}</Typography>

            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                size="small"
                color={getActionMeta(selectedLog.action).color}
                icon={<span style={{ fontSize: 16 }}>{getActionMeta(selectedLog.action).icon}</span>}
                label={getActionMeta(selectedLog.action).label}
              />
            </Stack>

            <Typography sx={{ mt: 2 }} variant="body2">
              상세 내용
            </Typography>
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                p: 1,
                mt: 1,
                fontSize: 13,
                background: "#fafafa",
                minHeight: 60,
                whiteSpace: "pre-line",
              }}
            >
              {selectedLog.detail}
            </Box>

            <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setDetailOpen(false)}>
              닫기
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
