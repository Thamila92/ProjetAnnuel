package com.example.companion.ApiClient;

import com.example.companion.Model.Admin;
import com.example.companion.Request.LoginRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class AdminClient {
    private static final String BASE_URL ="http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private Admin authenticatedAdmin;

    public AdminClient() {
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

    private HttpResponseWrapper sendPostRequest(String endpoint, String json) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = parseJson(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }

    public boolean authenticate(String email, String password) throws IOException, InterruptedException {
        LoginRequest loginRequest = new LoginRequest(email, password);
        String json = objectMapper.writeValueAsString(loginRequest);
        HttpResponseWrapper responseWrapper = sendPostRequest("/admin/login", json);
        if (responseWrapper.getStatusCode() == 200) {
            JsonNode responseBody = responseWrapper.getBody();
            String token = responseBody.get("token").asText();
            Admin admin = new Admin(email, password);
            admin.setToken(token);
            this.authenticatedAdmin = admin;
            return true;
        } else {
            System.err.println("Error during authentication: " + responseWrapper.getBody().toString());
            return false;
        }
    }


    public String getAuthToken() {
        return authenticatedAdmin != null ? authenticatedAdmin.getToken() : null;
    }

    public boolean createAdmin(String email, String password, String name, String key) throws IOException, InterruptedException {
        Admin admin = new Admin(email, password, name, key);
        String json = objectMapper.writeValueAsString(admin);
        HttpResponseWrapper responseWrapper = sendPostRequest("/admin/signup", json);
        if (responseWrapper.getStatusCode() == 201) {
            return true;
        } else {
            System.err.println("Error during admin creation: " + responseWrapper.getBody().toString());
            return false;
        }
    }

    public Admin updateAdmin(int id, Admin admin) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(admin);
        HttpResponseWrapper responseWrapper = sendPutRequest("/admins/" + id, json);
        return objectMapper.readValue(responseWrapper.getBody().toString(), Admin.class);
    }

    public void deleteAdmin(int id, String actualPassword) throws IOException, InterruptedException {
        String json = "{\"actual_password\":\"" + actualPassword + "\"}";
        sendDeleteRequest("/admins/" + id, json);
    }

    public List<Admin> getAdmins() throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/users");
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), new TypeReference<List<Admin>>() {});
        }
        return null;
    }

    public Admin getAdmin(int id) throws IOException, InterruptedException {
        HttpResponseWrapper responseWrapper = sendGetRequest("/users/" + id);
        if (responseWrapper.getStatusCode() == 200) {
            return objectMapper.readValue(responseWrapper.getBody().toString(), Admin.class);
        }
        return null;
    }

    private JsonNode parseJson(String responseBody) {
        try {
            if (responseBody.startsWith("<")) {
                // Handle HTML response
                System.err.println("Received an HTML response: " + responseBody);
                return null;
            }
            return new ObjectMapper().readTree(responseBody);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private HttpResponseWrapper sendPutRequest(String endpoint, String json) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = parseJson(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }

    private HttpResponseWrapper sendDeleteRequest(String endpoint, String json) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .method("DELETE", HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int statusCode = response.statusCode();
        JsonNode jsonNode = parseJson(response.body());

        return new HttpResponseWrapper(jsonNode, statusCode);
    }
}
