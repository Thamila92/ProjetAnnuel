package com.example.companion.Controller;

import com.example.companion.ApiClient.*;
import com.example.companion.Model.Admin;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;

import java.io.IOException;

public class LoginController {

    @FXML
    private TextField emailField;
    @FXML
    private PasswordField passwordField;

    private final AdminClient adminClient;
    private ProjetClient projetClient;
    private EvenementClient evenementClient;
    private StepClient stepClient;
    private MissionClient setMission;
    private NoteClient noteClient;
    private SkillClient skillClient;
    public LoginController() {
        this.adminClient = new AdminClient();
    }

    @FXML
    public void handleLogin() {
        String email = emailField.getText();
        String password = passwordField.getText();

        try {
            boolean authenticated = adminClient.authenticate(email, password);
            if (authenticated) {
                String authToken = adminClient.getAuthToken();
                Admin loggedInUser = adminClient.getLoggedInUser();
                System.out.println("Authentication successful. Token: " + authToken);

                FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/example/companion/main.fxml"));
                Parent root = loader.load();

                MainController mainController = loader.getController();
                projetClient = new ProjetClient(authToken);
                evenementClient = new EvenementClient(authToken);
                stepClient = new StepClient(authToken);
                setMission = new MissionClient(authToken);
                noteClient =  new NoteClient(authToken);
                skillClient = new SkillClient(authToken);
                 mainController.setProjetClient(projetClient);
                mainController.setEvenementClient(evenementClient);
                mainController.setSkillClient(skillClient);
                mainController.setLoggedInUser(loggedInUser);
                mainController.setStepClient(stepClient);
                mainController.setMissionClient(setMission);
                mainController.setNoteClient(noteClient);
                Stage stage = (Stage) emailField.getScene().getWindow();
                stage.setScene(new Scene(root));
                stage.show();
            } else {
                showAlert("Authentication failed", "Invalid email or password.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "An error occurred while trying to authenticate.");
        }
    }

    @FXML
    public void handleLogout() {
        // Clear the auth token or perform any necessary cleanup
        projetClient = null;
        evenementClient = null;
        showAlert("Logged Out", "You have been successfully logged out.");

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/example/companion/login.fxml"));
            Parent root = loader.load();
            Stage stage = (Stage) emailField.getScene().getWindow();
            stage.setScene(new Scene(root));
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Error", "An error occurred while trying to load the login page.");
        }
    }

    @FXML
    public void loadSignUp() {
        try {
            Stage stage = (Stage) emailField.getScene().getWindow();
            Parent root = FXMLLoader.load(getClass().getResource("/com/example/companion/test.fxml"));
            Scene scene = new Scene(root);
            stage.setScene(scene);
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "An error occurred while trying to load the sign-up page.");
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
