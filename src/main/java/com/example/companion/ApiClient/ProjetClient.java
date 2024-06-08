package com.example.companion.ApiClient;

import com.example.companion.Model.Projet;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class ProjetClient {
    private static final String BASE_URL ="http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ProjetClient() {
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

    public List<Projet> getProjects() throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/projets");
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), new TypeReference<List<Projet>>() {});
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

    public Projet createProject(Projet projet) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(projet);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readValue(response.body(), Projet.class);
    }

    public Projet updateProject(int id, Projet projet) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(projet);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readValue(response.body(), Projet.class);
    }

    public void deleteProject(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
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
