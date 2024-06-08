package org.example.ApiClient;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.example.Model.Evenement;

import java.lang.reflect.Type;
import java.util.List;

public class EvenementClient {
    private static final String BASE_URL = Urlapi.BASE_URL.getUrl();
    private final HttpClient httpClient;
    private final Gson gson;

    public EvenementClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public List<Evenement> getEvenements() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements"))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        Type evenementListType = new TypeToken<List<Evenement>>() {}.getType();
        return gson.fromJson(response.body(), evenementListType);
    }

    public Evenement getEvenement(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements/" + id))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Evenement.class);
    }

    public Evenement createEvenement(Evenement evenement) throws IOException, InterruptedException {
        String json = gson.toJson(evenement);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Evenement.class);
    }

    public Evenement updateEvenement(int id, Evenement evenement) throws IOException, InterruptedException {
        String json = gson.toJson(evenement);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Evenement.class);
    }

    public void deleteEvenement(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/evenements/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

}
