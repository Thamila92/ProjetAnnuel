package com.example.companion.ApiClient;

import com.example.companion.Model.Admin;
import com.example.companion.Model.Mission;
import com.example.companion.Request.MissionUpdateRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class MissionClient {
    private static final String BASE_URL = "http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String authToken;

    public MissionClient(HttpClient httpClient, ObjectMapper objectMapper, String authToken) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.authToken = authToken;
    }
    public MissionClient(String authToken) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.authToken = authToken;
    }

    public List<Mission> getMissions() throws IOException, InterruptedException {
        String endpoint = BASE_URL + "/missions";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode jsonNode = objectMapper.readTree(response.body());
            return objectMapper.convertValue(jsonNode.get("missions"), objectMapper.getTypeFactory().constructCollectionType(List.class, Mission.class));
        } else {
            throw new IOException("Failed to load missions: " + response.body());
        }
    }

    public void deleteMission(int id) throws IOException, InterruptedException {
        String endpoint = BASE_URL + "/missions/" + id;
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", "Bearer " + authToken)
                .DELETE()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 204) {
            throw new IOException("Failed to delete mission: " + response.body());
        }
    }

    public Mission updateMission(int id, MissionUpdateRequest missionUpdateRequest) throws IOException, InterruptedException {
        String endpoint = BASE_URL + "/missions/" + id;
        String json = objectMapper.writeValueAsString(missionUpdateRequest);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), Mission.class);
        } else {
            throw new IOException("Failed to update mission: " + response.body());
        }
    }
    public List<Admin> getUsersByMissionSkills(int missionId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + missionId + "/users-by-skills"))
                .header("Authorization", "Bearer " + authToken)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), new TypeReference<List<Admin>>() {});
        } else {
            throw new IOException("Failed to fetch users: " + response.body());
        }
    }
    public List<Admin> getCompatibleUsers(int missionId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + missionId + "/users-by-skills"))
                .header("Authorization", "Bearer " + authToken)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), new TypeReference<List<Admin>>() {});
        } else {
            throw new IOException("Failed to fetch compatible users: " + response.body());
        }
    }

}
