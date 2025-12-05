package com.boot.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.boot.dto.SocialUserInfoDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    public SocialUserInfoDTO getUserInfo(String code) {

        // 1) Access Token 요청
        String tokenUrl = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<?> tokenRequest = new HttpEntity<>(params, headers);

        Map tokenResponse = restTemplate.postForObject(tokenUrl, tokenRequest, Map.class);
        String accessToken = (String) tokenResponse.get("access_token");

        // 2) 사용자 정보 요청
        HttpHeaders headers2 = new HttpHeaders();
        headers2.setBearerAuth(accessToken);

        HttpEntity<?> userInfoRequest = new HttpEntity<>(headers2);

        ResponseEntity<Map> userResponse = restTemplate.exchange(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                HttpMethod.GET,
                userInfoRequest,
                Map.class
        );

        Map<String, Object> result = userResponse.getBody();

        String email = (String) result.get("email");
        String name = (String) result.get("name");

        return new SocialUserInfoDTO(email, name, "GOOGLE");
    }
}
