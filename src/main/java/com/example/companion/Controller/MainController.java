package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.ApiClient.ProjetClient;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.layout.BorderPane;

import java.io.IOException;
import java.net.URL;
public class MainController {

    @FXML
    private BorderPane rootPane;

    private ProjetClient projetClient;
    private EvenementClient evenementClient;

    public void setProjetClient(ProjetClient projetClient) {
        this.projetClient = projetClient;
    }

    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
    }

    @FXML
    public void handleHome() {
        loadPage("home.fxml");
    }

    @FXML
    public void handleProjects() {
        loadPage("projet.fxml");
    }

    @FXML
    public void handleEvents() {
        loadPage("evenement.fxml");
    }

    @FXML
    public void handleTasks() {
        loadPage("task.fxml");
    }

    @FXML
    public void handleSettings() {
        loadPage("SettingsView.fxml");
    }

    @FXML
    public void handleLogin() {
        loadPage("login.fxml");
    }

    @FXML
    public void handleSignUp() {
        loadPage("test.fxml");
    }

    public void loadPage(String page) {
        try {
            URL url = getClass().getResource("/com/example/companion/" + page);
            if (url == null) {
                throw new IOException("Cannot load resource: " + page);
            }

            FXMLLoader loader = new FXMLLoader(url);
            Parent root = loader.load();
            rootPane.setCenter(root);

            if ("projet.fxml".equals(page)) {
                ProjetController projetController = loader.getController();
                projetController.setProjetClient(projetClient);
            } else if ("evenement.fxml".equals(page)) {
                EvenementController evenementController = loader.getController();
                evenementController.setEvenementClient(evenementClient);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
