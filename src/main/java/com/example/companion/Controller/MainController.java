package com.example.companion.Controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.layout.BorderPane;

import java.io.IOException;
import java.net.URL;

public class MainController {

    @FXML
    private BorderPane rootPane;

    @FXML
    public void handleHome() {
        loadPage("home.fxml");
    }

    @FXML
    public void handleProjects() {
        loadPage("projet.fxml");
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

    private void loadPage(String page) {
        try {
            URL url = getClass().getResource("/com/example/companion/" + page);
            if (url == null) {
                throw new IOException("Cannot load resource: " + page);
            }
            Parent root = FXMLLoader.load(url);
            rootPane.setCenter(root);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
