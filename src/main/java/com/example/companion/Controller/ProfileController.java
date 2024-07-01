package com.example.companion.Controller;

import javafx.fxml.FXML;
import javafx.scene.control.Label;

public class ProfileController {

    @FXML
    private Label nameLabel;
    @FXML
    private Label emailLabel;

    public void setUserData(String name, String email) {
        nameLabel.setText("Name: " + name);
        emailLabel.setText("Email: " + email);
    }
}
