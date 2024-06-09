package com.example.companion.Controller;

import com.example.companion.ApiClient.AdminClient;
import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.ApiClient.ProjetClient;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Stage;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;

public class LoginController {

    @FXML
    private TextField emailField;
    @FXML
    private PasswordField passwordField;

    private final AdminClient adminClient;
    private ProjetClient projetClient;

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
                System.out.println("Authentication successful. Token: " + authToken);

                FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/example/companion/main.fxml"));
                Parent root = loader.load();

                MainController mainController = loader.getController();
                ProjetClient projetClient = new ProjetClient(authToken);
                EvenementClient eventClient = new EvenementClient(authToken);
                mainController.setProjetClient(projetClient);
                mainController.setEvenementClient(eventClient);
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
    private void loadHomePage() {
        try {
            Stage stage = (Stage) emailField.getScene().getWindow();
            Parent root = FXMLLoader.load(getClass().getResource("/com/example/companion/main.fxml"));
            Scene scene = new Scene(root);
            stage.setScene(scene);
        } catch (Exception e) {
            e.printStackTrace();
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
