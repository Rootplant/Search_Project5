package com.boot.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.dto.UserInfoDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface AdminDAO {

	//계정 조회
    List<UserInfoDTO> getUsers();

    //계정 정지
    void suspendUser(@Param("email") String email,
		             @Param("until") String until,
		             @Param("reason") String reason);
    //계정 정지 해제
    void unsuspendUser(String email);
    
    //권한 변경
    UserInfoDTO findUserByEmail(String email);

    void updateUserRole(@Param("email") String email,
                        @Param("role") String role);

    //로그인 시도 횟수 초기화
    int resetLoginFail(String email);
//
//    void forceLogout(String email);
//
//    List<Map<String,Object>> getTokens();
//
//    void clearTokens();
//
//    List<Map<String,Object>> getLoginLog();
//
//    List<Map<String,Object>> getAdminLog();
//
//    Map<String,Object> getDashboard();

    void insertAdminLog(@Param("adminEmail") String adminEmail,
			            @Param("targetEmail") String targetEmail,
			            @Param("action") String action,
			            @Param("detail") String detail);
}
