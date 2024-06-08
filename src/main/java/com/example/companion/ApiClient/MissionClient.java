package org.example.ApiClient;



import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.example.Model.Mission;

import java.lang.reflect.Type;
import java.util.List;

public class MissionClient {
    private static final String BASE_URL = Urlapi.BASE_URL.getUrl();
    private final HttpClient httpClient;
    private final Gson gson;

    public MissionClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public List<Mission> getMissions() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions"))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        Type missionListType = new TypeToken<List<Mission>>() {}.getType();
        return gson.fromJson(response.body(), missionListType);
    }

    public Mission getMission(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + id))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Mission.class);
    }

    public Mission createMission(Mission mission) throws IOException, InterruptedException {
        String json = gson.toJson(mission);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Mission.class);
    }

    public Mission updateMission(int id, Mission mission) throws IOException, InterruptedException {
        String json = gson.toJson(mission);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Mission.class);
    }

    public void deleteMission(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/missions/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}

