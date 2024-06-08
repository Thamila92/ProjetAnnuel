package com.example.companion.Controller;

import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.stage.Stage;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;

public class SignUpController {




        @FXML
        private TextField nameField;

        @FXML
        private TextField emailField;

        @FXML
        private PasswordField passwordField;

        @FXML
        public void handleSignUp() {
            String name = nameField.getText();
            String email = emailField.getText();
            String password = passwordField.getText();

            // Code pour gérer l'inscription
            // Si inscription réussie, rediriger vers la page principale ou la page de connexion
            System.out.println("Name: " + name + ", Email: " + email + ", Password: " + password);
        }

        @FXML
        public void showLogin() {
            try {
                Stage stage = (Stage) nameField.getScene().getWindow();
                Parent root = FXMLLoader.load(getClass().getResource("/com/example/companion/login.fxml"));
                Scene scene = new Scene(root);
                stage.setScene(scene);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

}
