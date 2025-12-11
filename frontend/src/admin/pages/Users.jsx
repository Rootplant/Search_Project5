import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Drawer,
  Modal,
  Select,
  MenuItem,
  Typography,
  Stack,
  TextField,
  Avatar,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { Person, AdminPanelSettings } from "@mui/icons-material";
import adminApi from "../api/adminApi";

// ================= 공통 유틸 =================
const STATUS_LABEL = {
  ACTIVE: "정상",
  WAITING_VERIFY: "이메일 미인증",
  SUSPENDED: "정지됨",
};

const PROVIDER_LABEL = {
  LOCAL: "LOCAL",
  KAKAO: "KAKAO",
  GOOGLE: "GOOGLE",
};

function formatDate(value) {
  if (!value) return "-";
  return String(value).replace("T", " ").substring(0, 19);
}

// ================= 정지 모달 =================
function SuspendModal({ open, onClose, user, onSubmit }) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [days, setDays] = useState(7);

  const reasonList = ["욕설 / 비방", "스팸 / 광고", "부적절한 행동", "기타"];

  useEffect(() => {
    if (open) {
      setReason("");
      setCustomReason("");
      setDays(7);
    }
  }, [open]);

  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380,
          bgcolor: "#fff",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          계정 정지
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          대상: <b>{user.email}</b>
        </Typography>

        <Typography sx={{ mt: 2, mb: 1 }}>정지 사유</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {reasonList.map((r) => (
            <Chip
              key={r}
              label={r}
              clickable
              color={reason === r ? "primary" : "default"}
              onClick={() => setReason(r)}
            />
          ))}
        </Stack>

        {reason === "기타" && (
          <TextField
            fullWidth
            size="small"
            label="직접 입력"
            sx={{ mt: 2 }}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}

        <Typography sx={{ mt: 3 }}>정지 기간</Typography>
        <Select
          fullWidth
          size="small"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <MenuItem value={1}>1일</MenuItem>
          <MenuItem value={3}>3일</MenuItem>
          <MenuItem value={7}>7일</MenuItem>
          <MenuItem value={30}>30일</MenuItem>
        </Select>

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          <Button onClick={onClose}>취소</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              onSubmit(user.email, reason === "기타" ? customReason : reason, days)
            }
          >
            정지하기
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// ================= 권한 변경 모달 =================
function RoleModal({ open, onClose, user, onSubmit }) {
  const [role, setRole] = useState("USER");

  useEffect(() => {
    if (open && user) setRole(user.role);
  }, [open, user]);

  if (!user) return null;

  const isBlocked =
    user.accountStatus !== "ACTIVE" || user.isSuspended === "Y";

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 360,
          bgcolor: "#fff",
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          권한 변경
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          대상: {user.email}
        </Typography>

        <Select
          fullWidth
          size="small"
          sx={{ mt: 2 }}
          value={role}
          disabled={isBlocked}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="USER">USER</MenuItem>
          <MenuItem value="ADMIN">ADMIN</MenuItem>
        </Select>

        {isBlocked && (
          <Typography color="error" variant="caption">
            이메일 미인증 또는 정지 계정은 변경 불가
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          <Button onClick={onClose}>취소</Button>
          <Button
            variant="contained"
            disabled={isBlocked}
            onClick={() => onSubmit(user.email, role)}
          >
            변경하기
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

// ==================== 상세 Drawer ====================
function UserDetailDrawer({ open, onClose, user }) {
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 3 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 90,
              height: 90,
              mx: "auto",
              bgcolor: isAdmin ? "primary.main" : "grey.500",
            }}
          >
            {isAdmin ? (
              <AdminPanelSettings fontSize="large" />
            ) : (
              <Person fontSize="large" />
            )}
          </Avatar>

          <Typography variant="h6" mt={2} fontWeight="bold">
            {user.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>

          <Chip
            label={isAdmin ? "관리자" : "사용자"}
            color={isAdmin ? "primary" : "default"}
            sx={{ mt: 1 }}
          />
        </Box>

        <DetailItem label="계정 상태" value={STATUS_LABEL[user.accountStatus]} />
        <DetailItem label="정지 여부" value={user.isSuspended === "Y" ? "정지됨" : "정상"} />
        <DetailItem label="정지 종료일" value={formatDate(user.suspendUntil)} />
        <DetailItem label="정지 사유" value={user.suspendReason || "-"} />
        <DetailItem label="로그인 실패 횟수" value={user.loginFailCount} />
        <DetailItem label="가입 경로" value={PROVIDER_LABEL[user.provider]} />
        <DetailItem label="가입일" value={formatDate(user.createdAt)} />

        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={onClose}>
          닫기
        </Button>
      </Box>
    </Drawer>
  );
}

function DetailItem({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography fontWeight={600}>{label}</Typography>
      <Typography variant="body2">{value}</Typography>
      <Box sx={{ borderBottom: "1px solid #eee", mt: 1 }} />
    </Box>
  );
}

// ================= 메인 페이지 =================
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // 데이터 로드
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      alert("데이터 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 🔥 필터 적용 (개선된 정지/정상 조건)
  const filtered = users.filter((u) => {
    const matchSearch = u.email.toLowerCase().includes(search.toLowerCase());

    let matchStatus = false;
    if (filterStatus === "ALL") matchStatus = true;
    else if (filterStatus === "ACTIVE") {
      matchStatus = u.accountStatus === "ACTIVE" && u.isSuspended === "N";
    } else if (filterStatus === "WAITING_VERIFY") {
      matchStatus = u.accountStatus === "WAITING_VERIFY";
    } else if (filterStatus === "SUSPENDED") {
      matchStatus =
        u.isSuspended === "Y" || u.accountStatus === "SUSPENDED";
    }

    const matchRole =
      filterRole === "ALL" || u.role === filterRole;

    return matchSearch && matchStatus && matchRole;
  });

  const handleResetFail = async (email) => {
    if (!window.confirm(`${email} 사용자의 로그인 실패 횟수를 초기화하시겠습니까?`)) return;

    try {
      await adminApi.resetLoginFail(email);
      alert("로그인 실패 횟수 초기화 완료");
      loadUsers();
    } catch (err) {
      alert("초기화 실패");
    }
  };

  const columns = [
    { field: "email", headerName: "Email", width: 240 },
    { field: "fullName", headerName: "이름", width: 140 },

    {
      field: "role",
      headerName: "권한",
      width: 120,
      renderCell: (p) => (
        <Chip
          label={p.value}
          color={p.value === "ADMIN" ? "primary" : "default"}
        />
      ),
    },

    {
      field: "accountStatus",
      headerName: "상태",
      width: 140,
      renderCell: (p) => (
        <Chip
          label={STATUS_LABEL[p.value]}
          color={
            p.value === "ACTIVE"
              ? "success"
              : p.value === "WAITING_VERIFY"
              ? "warning"
              : "error"
          }
        />
      ),
    },

    {
      field: "isSuspended",
      headerName: "정지 여부",
      width: 120,
      renderCell: (p) =>
        p.value === "Y" ? (
          <Chip label="정지됨" color="error" />
        ) : (
          <Chip label="정상" variant="outlined" color="success" />
        ),
    },

    {
      field: "provider",
      headerName: "가입 경로",
      width: 120,
      renderCell: (p) => <Chip label={p.value} variant="outlined" />,
    },

    {
      field: "createdAt",
      headerName: "가입일",
      width: 180,
      renderCell: (p) => formatDate(p.value),
    },

    {
      field: "actions",
      headerName: "관리",
      width: 420,
      renderCell: (p) => {
        const u = p.row;
        const suspended = u.isSuspended === "Y";

        return (
          <Stack direction="row" spacing={1}>
            {suspended ? (
              <Button
                color="success"
                variant="contained"
                size="small"
                onClick={() =>
                  adminApi.unsuspendUser(u.email).then(() => loadUsers())
                }
              >
                해제
              </Button>
            ) : (
              <Button
                color="error"
                variant="contained"
                size="small"
                onClick={() => {
                  setSelectedUser(u);
                  setSuspendOpen(true);
                }}
              >
                정지
              </Button>
            )}

            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setSelectedUser(u);
                setRoleOpen(true);
              }}
            >
              권한 변경
            </Button>

            <Button
              variant="contained"
              color="info"
              size="small"
              onClick={() => {
                setSelectedUser(u);
                setDetailOpen(true);
              }}
            >
              상세보기
            </Button>

            <Button
              size="small"
              variant="outlined"
              color="warning"
              disabled={u.accountStatus !== "ACTIVE" || suspended}
              onClick={() => handleResetFail(u.email)}
            >
              로그인 실패 초기화
            </Button>
          </Stack>
        );
      },
    },
  ];

  const filterBtn = (active) => ({
    variant: active ? "contained" : "outlined",
    size: "small",
  });

  return (
    <Box sx={{ p: 2, width: "100%" }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        사용자 관리
      </Typography>

      {/* 검색 + 필터 한 줄 */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <TextField
          placeholder="이메일 검색"
          size="small"
          sx={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 상태 필터 */}
        <Stack direction="row" spacing={1}>
          <Button {...filterBtn(filterStatus === "ALL")} onClick={() => setFilterStatus("ALL")}>전체</Button>
          <Button {...filterBtn(filterStatus === "ACTIVE")} onClick={() => setFilterStatus("ACTIVE")}>정상</Button>
          <Button {...filterBtn(filterStatus === "WAITING_VERIFY")} onClick={() => setFilterStatus("WAITING_VERIFY")}>이메일 미인증</Button>
          <Button {...filterBtn(filterStatus === "SUSPENDED")} onClick={() => setFilterStatus("SUSPENDED")}>정지됨</Button>
        </Stack>

        <Box sx={{ width: "1px", height: 30, background: "#ddd" }} />
        
        {/* 권한 필터 */}
        <Stack direction="row" spacing={1}>
          <Button {...filterBtn(filterRole === "ALL")} onClick={() => setFilterRole("ALL")}>전체 권한</Button>
          <Button {...filterBtn(filterRole === "USER")} onClick={() => setFilterRole("USER")}>USER</Button>
          <Button {...filterBtn(filterRole === "ADMIN")} onClick={() => setFilterRole("ADMIN")}>ADMIN</Button>
        </Stack>
      </Stack>

      {/* DataGrid */}
      <Box sx={{ height: 700 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={(r) => r.email}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
        />
      </Box>

      {/* 모달 */}
      <SuspendModal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        user={selectedUser}
        onSubmit={(email, reason, days) =>
          adminApi.suspendUser({ email, reason, days }).then(() => {
            alert("정지 완료");
            setSuspendOpen(false);
            loadUsers();
          })
        }
      />

      <RoleModal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        user={selectedUser}
        onSubmit={(email, newRole) =>
          adminApi.changeUserRole({ email, newRole }).then(() => {
            alert("권한 변경 완료");
            setRoleOpen(false);
            loadUsers();
          })
        }
      />

      <UserDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        user={selectedUser}
      />
    </Box>
  );
}
