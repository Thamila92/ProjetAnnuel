package org.example.ApiClient;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.example.Model.Projet;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class ProjetClient {


    private static final String BASE_URL = Urlapi.BASE_URL.getUrl();
    private final HttpClient httpClient;
    private final Gson gson;



    public ProjetClient(Gson gson) {
        this.httpClient = HttpClient.newHttpClient();

        this.gson = gson;
    }

    public List<Projet> getProjects() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets"))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        Type evenementListType = new TypeToken<List<Projet>>() {}.getType();
        return gson.fromJson(response.body(), evenementListType);
    }

    public Projet getProject(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Projet.class);
    }

    public Projet createProject(Projet projet) throws IOException, InterruptedException {
        String json = gson.toJson(projet);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Projet.class);
    }

    public Projet updateProject(int id, Projet projet) throws IOException, InterruptedException {
        String json = gson.toJson(projet);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Projet.class);
    }

    public void deleteProject(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/projets/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

}
