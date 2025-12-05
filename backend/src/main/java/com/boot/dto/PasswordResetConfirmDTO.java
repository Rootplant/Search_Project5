package com.boot.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetConfirmDTO {
	@NotBlank(message = "토큰이 필요합니다.")
    private String token;

    @NotBlank(message = "새 비밀번호를 입력해주세요.")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$",
        message = "비밀번호는 8자 이상이며, 영문 + 숫자 + 특수문자를 포함해야 합니다."
    )
    private String newPassword;
}
