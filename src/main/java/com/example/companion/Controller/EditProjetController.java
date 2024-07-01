package com.example.companion.Controller;

import com.example.companion.ApiClient.ProjetClient;
import com.example.companion.Model.Projet;
import com.example.companion.Request.ProjetUpdateRequest;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class EditProjetController {

    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;

    private Projet projet;
    private ProjetClient projetClient;
    private ProjetController projetController;

    public void setProjetClient(ProjetClient projetClient) {
        this.projetClient = projetClient;
    }

    public void setProjetController(ProjetController projetController) {
        this.projetController = projetController;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
        loadProjectDetails();
    }

    private void loadProjectDetails() {
        descriptionField.setText(projet.getDescription());

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        startingField.setText(dateFormat.format(projet.getStarting()));
        endingField.setText(dateFormat.format(projet.getEnding()));
    }

    @FXML
    public void handleSaveChanges() {
        String description = descriptionField.getText();
        String starting = startingField.getText();
        String ending = endingField.getText();

        SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        try {
            Date startingDate = inputFormat.parse(starting);
            Date endingDate = inputFormat.parse(ending);

            String startingDateString = outputFormat.format(startingDate);
            String endingDateString = outputFormat.format(endingDate);

            ProjetUpdateRequest updateRequest = new ProjetUpdateRequest(description, outputFormat.parse(startingDateString), outputFormat.parse(endingDateString));

            Projet updatedProjet = projetClient.updateProject(projet.getId(), updateRequest);
            projetController.updateProjetInList(updatedProjet);

            Stage stage = (Stage) descriptionField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to save project changes: " + e.getMessage());
            e.printStackTrace();
        }
    }
    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
