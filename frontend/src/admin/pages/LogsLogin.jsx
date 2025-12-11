import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Chip,
  Card,
  Stack,
  Button,
  Tooltip,
  Drawer,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import adminApi from "../api/adminApi";

function parseUserAgent(ua = "") {
  ua = ua.toLowerCase();
  if (ua.includes("postman")) return { icon: "🔧", label: "Postman" };
  if (ua.includes("iphone") || ua.includes("ios"))
    return { icon: "📱", label: "iPhone Safari" };
  if (ua.includes("android")) return { icon: "🤖", label: "Android Chrome" };
  if (ua.includes("mac") && ua.includes("safari"))
    return { icon: "🍎", label: "Mac Safari" };
  if (ua.includes("edg")) return { icon: "🖥️", label: "Edge" };
  if (ua.includes("chrome")) return { icon: "🖥️", label: "Chrome" };
  if (ua.includes("windows")) return { icon: "🖥️", label: "Windows" };
  return { icon: "🌐", label: "Unknown" };
}

function InfoItem({ label, value }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: 13, color: "#6b7280" }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

export default function LogLogin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getLoginLog();
      const mapped = res.data.map((l) => ({
        id: l.LOG_ID,
        email: l.EMAIL,
        status: l.STATUS,
        time: l.CREATED_AT,
        ip: l.IP_ADDRESS,
        agent: l.USER_AGENT,
      }));
      setLogs(mapped);
    } catch (err) {
      console.error(err);
      alert("로그인 로그 조회 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const keyword = search.toLowerCase();
    const hit =
      l.email.toLowerCase().includes(keyword) ||
      l.ip.toLowerCase().includes(keyword) ||
      l.agent.toLowerCase().includes(keyword);

    const statusMatch = statusFilter === "ALL" ? true : statusFilter === l.status;

    const date = l.time.substring(0, 10);
    const matchStart = startDate ? date >= startDate : true;
    const matchEnd = endDate ? date <= endDate : true;

    return hit && statusMatch && matchStart && matchEnd;
  });

  // =====================================================
  // 📌 CSV 다운로드 기능
  // =====================================================
  const downloadCSV = () => {
    const header = ["Email", "로그인시간", "결과", "IP", "User-Agent"];

    const rows = filtered.map((log) => [
      log.email,
      log.time,
      log.status,
      log.ip,
      log.agent.replace(/,/g, ";"),
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `login_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const columns = [
    { field: "email", headerName: "Email", width: 230 },
    { field: "time", headerName: "로그인 시간", width: 200 },
    {
      field: "status",
      headerName: "결과",
      width: 120,
      renderCell: (p) =>
        p.value === "SUCCESS" ? (
          <Chip label="성공" color="success" size="small" />
        ) : (
          <Chip label="실패" color="error" size="small" />
        ),
    },
    { field: "ip", headerName: "IP", width: 140 },
    {
      field: "agent",
      headerName: "접속 환경",
      width: 380,
      renderCell: (p) => {
        const info = parseUserAgent(p.value);
        return (
          <Tooltip title={p.value}>
            <Stack direction="row" spacing={1} alignItems="center">
              <span style={{ fontSize: 20 }}>{info.icon}</span>
              <Typography
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {info.label}
              </Typography>
            </Stack>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3, width: "100%", display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: "1200px", p: 3 }}>
        <Stack direction="row" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            로그인 로그
          </Typography>

          {/* CSV 버튼 */}
          <Button variant="contained" color="primary" onClick={downloadCSV}>
            CSV 다운로드
          </Button>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          {/* 왼쪽 검색 + 상태 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="이메일 / IP / User-Agent 검색"
              size="small"
              sx={{ width: 260 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant={statusFilter === "ALL" ? "contained" : "outlined"}
                onClick={() => setStatusFilter("ALL")}
              >
                전체
              </Button>
              <Button
                variant={statusFilter === "SUCCESS" ? "contained" : "outlined"}
                color="success"
                onClick={() => setStatusFilter("SUCCESS")}
              >
                성공
              </Button>
              <Button
                variant={statusFilter === "FAIL" ? "contained" : "outlined"}
                color="error"
                onClick={() => setStatusFilter("FAIL")}
              >
                실패
              </Button>
            </Stack>
          </Stack>

          {/* 오른쪽 날짜 필터 */}
          <Stack direction="row" spacing={2}>
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

        <Box sx={{ height: 650 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            onRowClick={(p) => {
              setSelectedLog(p.row);
              setDetailOpen(true);
            }}
            pageSizeOptions={[25, 50, 100]}
          />
        </Box>
      </Card>

      <Drawer anchor="right" open={detailOpen} onClose={() => setDetailOpen(false)}>
        {selectedLog && (
          <Box sx={{ width: 420, p: 3, bgcolor: "#f9fafb", height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              로그인 상세 정보
            </Typography>

            <Box
              sx={{
                bgcolor: "white",
                p: 2,
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                mb: 3,
              }}
            >
              <InfoItem label="Email" value={selectedLog.email} />
              <InfoItem label="IP" value={selectedLog.ip} />
              <InfoItem label="로그인 시간" value={selectedLog.time} />
            </Box>

            <Typography variant="subtitle1" fontWeight="bold">
              User-Agent 전체 정보
            </Typography>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                bgcolor: "#fff",
                p: 1.5,
                mt: 1,
                fontSize: 13,
                maxHeight: 120,
                overflowY: "auto",
                wordBreak: "break-all",
                lineHeight: 1.4,
              }}
            >
              {selectedLog.agent}
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                분석 결과
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                <span style={{ fontSize: 22 }}>
                  {parseUserAgent(selectedLog.agent).icon}
                </span>
                <Typography fontSize={15}>
                  {parseUserAgent(selectedLog.agent).label}
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 4, py: 1.2, fontWeight: "bold", borderRadius: 2 }}
              onClick={() => setDetailOpen(false)}
            >
              닫기
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
