package com.example.companion.ApiClient;

import com.example.companion.Model.Skill;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class SkillClient {
    private static final String BASE_URL = "http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String authToken;

    public SkillClient(String authToken) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.authToken = authToken;
    }

    public List<Skill> getAllSkills() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/skills"))
                .header("Authorization", "Bearer " + authToken)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), new TypeReference<List<Skill>>() {});
        } else {
            throw new IOException("Failed to fetch skills: " + response.body());
        }
    }
}
