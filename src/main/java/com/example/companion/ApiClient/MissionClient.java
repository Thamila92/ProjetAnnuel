package com.example.companion.ApiClient;

import com.example.companion.Model.Mission;
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
    private static final String BASE_URL = Urlapi.BASE_URL.getUrl();
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public MissionClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    private HttpResponseWrapper sendGetRequest(String endpoint) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = parseJson(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }

    public List<Mission> getMissions() throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/missions");
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), new TypeReference<List<Mission>>() {});
        }
        return null;
    }

    public Mission getMission(int id) throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/missions/" + id);
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), Mission.class);
        }
        return null;
    }

    public Mission createMission(Mission mission) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(mission);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readValue(response.body(), Mission.class);
    }

    public Mission updateMission(int id, Mission mission) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(mission);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readValue(response.body(), Mission.class);
    }

    public void deleteMission(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode parseJson(String responseBody) {
        try {
            return new ObjectMapper().readTree(responseBody);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
