package com.example.companion.View;

import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.util.Pair;

public class VueConnexion extends Dialog<Pair<String, String>> {

    private TextField loginField;
    private PasswordField passwordField;

    public VueConnexion() {
        this.setTitle("Authentification");
        this.setHeaderText("Saisir vos données de connexion");

        loginField = new TextField();
        passwordField = new PasswordField();

        VBox vbSaisies = new VBox();
        vbSaisies.getChildren().add(new Label("Login :"));
        vbSaisies.getChildren().add(loginField);

        vbSaisies.getChildren().add(new Label("Mot de passe :"));
        vbSaisies.getChildren().add(passwordField);

        this.getDialogPane().setContent(vbSaisies);

        ButtonType connectButtonType = new ButtonType("Se connecter", ButtonBar.ButtonData.OK_DONE);
        ButtonType cancelButtonType = new ButtonType("Annuler", ButtonBar.ButtonData.CANCEL_CLOSE);
        this.getDialogPane().getButtonTypes().addAll(connectButtonType, cancelButtonType);

        this.setResultConverter(dialogButton -> {
            if (dialogButton == connectButtonType) {
                return new Pair<>(loginField.getText(), passwordField.getText());
            }
            return null;
        });

        // Gérer le clic sur le bouton "Se connecter"
        Button connectButton = (Button) this.getDialogPane().lookupButton(connectButtonType);
        connectButton.setOnAction(e -> handleLogin());
    }

    private void handleLogin() {
        String login = loginField.getText();
        String password = passwordField.getText();

        // Code pour envoyer une requête au serveur pour authentifier l'utilisateur
        System.out.println("Login: " + login + ", Password: " + password);
    }
}
