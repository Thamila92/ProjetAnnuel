package com.example.companion.Controller;
import com.example.companion.ApiClient.AdminClient;

import javafx.fxml.FXML;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.Alert;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;

public class SignUpController {

    @FXML
    private TextField emailField;
    @FXML
    private TextField nameField;
    @FXML
    private TextField keyField;
    @FXML
    private PasswordField passwordField;

    private final AdminClient adminClient;

    public SignUpController() {
        this.adminClient = new AdminClient();
    }

    @FXML
    public void handleSignUp() {
        String email = emailField.getText();
        String password = passwordField.getText();
        String name = nameField.getText();
        String key = keyField.getText();

        try {
            boolean adminCreated = adminClient.createAdmin(email, password, name, key);
            if (adminCreated) {
                showAlert("Success", "Admin created successfully.");
                loadLoginPage();
            } else {
                showAlert("Creation failed", "Failed to create admin.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "An error occurred while trying to create admin.");
        }
    }

    @FXML
    public void goToLogin() {
        try {
            Stage stage = (Stage) emailField.getScene().getWindow();
            Parent root = FXMLLoader.load(getClass().getResource("/com/example/companion/login.fxml"));
            Scene scene = new Scene(root);
            stage.setScene(scene);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadLoginPage() {
        try {
            Stage stage = (Stage) emailField.getScene().getWindow();
            Parent root = FXMLLoader.load(getClass().getResource("/com/example/companion/login.fxml"));
            Scene scene = new Scene(root);
            stage.setScene(scene);
        } catch (Exception e) {
            e.printStackTrace();
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
