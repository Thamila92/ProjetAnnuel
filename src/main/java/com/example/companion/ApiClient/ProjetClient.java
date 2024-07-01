package com.example.companion.ApiClient;

import com.example.companion.Model.Projet;
import com.example.companion.Request.ProjetCreateRequest;
import com.example.companion.Request.ProjetUpdateRequest;
import com.example.companion.Response.ProjetResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
 import  com.example.companion.Request.StepRequest;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class ProjetClient {
    private static final String BASE_URL = "http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String authToken;

    public ProjetClient(String authToken) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.authToken = authToken;
    }
    public ProjetClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.authToken = null;
    }
    public String getToken() {
        return authToken;
    }

    private HttpResponseWrapper sendGetRequest(String endpoint) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = parseJson(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }
    private HttpResponseWrapper sendPostRequest(String endpoint, String json) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = parseJson(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }

    public List<Projet> getProjects() throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/projets");
        if (responseWrapper.getStatusCode() == 200) {
            ProjetResponse projetResponse = objectMapper.readValue(responseWrapper.getBody().toString(), ProjetResponse.class);
            return projetResponse.getProjets();
        }
        return null;
    }

    public Projet getProject(int id) throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/projets/" + id);
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), Projet.class);
        }
        return null;
    }

    public Projet createProjet(ProjetCreateRequest projetRequest) throws IOException, InterruptedException {

        String json = objectMapper.writeValueAsString(projetRequest);
        System.out.println("Serialized JSON: " + json);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 201) {
            return objectMapper.readValue(response.body(), Projet.class);
        } else {
            JsonNode errorNode = objectMapper.readTree(response.body());
            throw new IOException("Failed to create project: " + errorNode.toString());
        }
    }


    public Projet updateProject(int id, ProjetUpdateRequest projetUpdateRequest) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(projetUpdateRequest);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), Projet.class);
        } else {
            throw new IOException("Failed to update project: " + response.body());
        }
    }

    public void deleteProject(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .header("Authorization", "Bearer " + authToken)
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    public void addStepToProject(StepRequest stepRequest) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(stepRequest);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 201) {
            throw new IOException("Failed to add step: " + response.body());
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
