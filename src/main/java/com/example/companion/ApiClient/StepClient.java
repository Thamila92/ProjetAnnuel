package org.example.ApiClient;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.example.Model.Step;

import java.lang.reflect.Type;
import java.util.List;

public class StepClient {
    private static final String BASE_URL = Urlapi.BASE_URL.getUrl();
    private final HttpClient httpClient;
    private final Gson gson;

    public StepClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public List<Step> getSteps() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps"))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        Type stepListType = new TypeToken<List<Step>>() {}.getType();
        return gson.fromJson(response.body(), stepListType);
    }

    public Step getStep(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps/" + id))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Step.class);
    }

    public Step createStep(Step step) throws IOException, InterruptedException {
        String json = gson.toJson(step);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Step.class);
    }

    public Step updateStep(int id, Step step) throws IOException, InterruptedException {
        String json = gson.toJson(step);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps/" + id))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return gson.fromJson(response.body(), Step.class);
    }

    public void deleteStep(int id) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/steps/" + id))
                .DELETE()
                .build();

        httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
