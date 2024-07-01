package com.example.companion.ApiClient;

import com.example.companion.Model.Step;
import com.example.companion.Request.StepUpdateRequest;
import com.example.companion.Response.StepResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class StepClient {
    private static final String BASE_URL =  "http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private final String authToken;

    public StepClient(HttpClient httpClient, ObjectMapper objectMapper, String authToken) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.authToken = authToken;
    }
    public StepClient(String authToken) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.authToken = authToken;
    }

public String getToken() {
    return authToken;
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

    public List<Step> getSteps() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode jsonNode = objectMapper.readTree(response.body());
            StepResponse stepResponse = objectMapper.treeToValue(jsonNode, StepResponse.class);
            return stepResponse.getSteps();
        } else {
            throw new IOException("Failed to load steps: " + response.body());
        }
    }

    public void deleteStep(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps/" + id))
                .header("Authorization", "Bearer " + authToken)
                .DELETE()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 204) {
            throw new IOException("Failed to delete step: " + response.body());
        }
    }

    public Step getStep(int id) throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/steps/" + id);
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), Step.class);
        }
        return null;
    }

    public Step createStep(Step step) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(step);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readValue(response.body(), Step.class);
    }
    public Step updateStep(int id, StepUpdateRequest stepUpdateRequest) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(stepUpdateRequest);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps/" + id))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), Step.class);
        } else {
            throw new IOException("Failed to update step: " + response.body());
        }
    }


    private JsonNode parseJson(String responseBody) {
        try {
            return objectMapper.readTree(responseBody);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
