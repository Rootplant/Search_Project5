package com.boot.dto;

import lombok.Data;

import javax.validation.constraints.*;


@Data
public class RegisterRequestDTO {

    @NotBlank(message = "이메일은 필수 입력입니다.")
    @Email(message = "이메일 형식이 유효하지 않습니다.")
    private String email;

    @NotBlank(message = "이름(성)은 필수 입력입니다.")
    private String lastName;

    @NotBlank(message = "이름(이름)은 필수 입력입니다.")
    private String firstName;

    @NotBlank(message = "비밀번호는 필수 입력입니다.")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$",
        message = "비밀번호는 8자 이상이며, 영문 + 숫자 + 특수문자를 포함해야 합니다."
    )
    private String password;
}
