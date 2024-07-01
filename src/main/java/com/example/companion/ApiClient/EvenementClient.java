package com.example.companion.ApiClient;

import com.example.companion.Model.Evenement;
import com.example.companion.Model.Projet;
import com.example.companion.Request.EvenementRequest;
import com.example.companion.Request.MissionRequest;
import com.example.companion.Response.EvenementResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;

public class EvenementClient {
    private static final String BASE_URL = "http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String authToken;

    public EvenementClient(String authToken) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();

        this.authToken = authToken;
    }

    public List<Evenement> getEvenements() throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/evenements");
        if (responseWrapper.getStatusCode() == 200) {
            EvenementResponse evenementResponse = objectMapper.readValue(responseWrapper.getBody().toString(), EvenementResponse.class);
            return evenementResponse.getEvenements();
        }
        return null;
    }

    private HttpResponseWrapper sendGetRequest(String endpoint) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Authorization", "Bearer " + authToken)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = objectMapper.readTree(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }
    public Evenement getEvenement(int id) throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/evenements/" + id);
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), Evenement.class);
        }
        return null;
    }

    public List<Evenement> getEventsForDate(LocalDate date) throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/evenements?date=" + date.toString());
        if (responseWrapper.getStatusCode() == 200) {
            EvenementResponse evenementResponse = objectMapper.readValue(responseWrapper.getBody().toString(), EvenementResponse.class);
            return evenementResponse.getEvenements();
        }
        return null;
    }

    public Evenement createEvenement(EvenementRequest evenement) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(evenement);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements"))
                .header("Authorization", "Bearer " + authToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 201) {
            return objectMapper.readValue(response.body(), Evenement.class);
        } else {
            JsonNode errorNode = objectMapper.readTree(response.body());
            throw new IOException("Failed to create project: " + errorNode.toString());
        }
    }

    public Evenement updateEvenement(int id, EvenementRequest evenement) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(evenement);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements/" + id))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readValue(response.body(), Evenement.class);
    }

    public void deleteEvenement(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
    public void addMissionToEvent(MissionRequest missionRequest) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(missionRequest);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 201) {
            throw new IOException("Failed to add mission: " + response.body());
        }
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
