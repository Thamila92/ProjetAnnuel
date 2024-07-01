package com.example.companion.ApiClient;

import com.example.companion.Model.Note;
import com.example.companion.Request.NoteRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class NoteClient {
    private static final String BASE_URL = "http://localhost:3000";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String authToken;

    public NoteClient(String authToken) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
        this.authToken = authToken;
    }

    public List<Note> getNotes() throws IOException, InterruptedException {
        HttpResponse<String> response = sendGetRequest("/notes");
        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), new TypeReference<List<Note>>() {});
        }
        return null;
    }

    public Note createNote(NoteRequest noteRequest) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(noteRequest);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/notes"))
                .header("Authorization", "Bearer " + authToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 201) {
            return objectMapper.readValue(response.body(), Note.class);
        } else {
            throw new IOException("Failed to create note: " + response.body());
        }
    }

    public void deleteNote(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/notes/" + id))
                .header("Authorization", "Bearer " + authToken)
                .DELETE()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 204) {
            throw new IOException("Failed to delete note: " + response.body());
        }
    }

    // Nouvelle méthode pour mettre à jour une note
    public Note updateNote(int id, Note note) throws IOException, InterruptedException {
        String json = objectMapper.writeValueAsString(note);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/notes/" + id))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + authToken)
                .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), Note.class);
        } else {
            throw new IOException("Failed to update note: " + response.body());
        }
    }

    private HttpResponse<String> sendGetRequest(String endpoint) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Authorization", "Bearer " + authToken)
                .header("Content-Type", "application/json")
                .GET()
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
