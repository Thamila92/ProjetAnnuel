package com.example.companion.Controller;

import com.example.companion.ApiClient.ProjetClient;
import com.example.companion.Request.StepRequest;
import com.example.companion.Model.Projet;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class AddStepController {

    @FXML
    private TextField stateField;
    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;
 // New field for missionId

    private Projet projet;
    private ProjetClient projetClient;

    public void setProjetClient(ProjetClient projetClient) {
        this.projetClient = projetClient;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    @FXML
    public void handleAddStep() {
        String state = stateField.getText();
        String description = descriptionField.getText();
        String starting = startingField.getText();
        String ending = endingField.getText();

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try {
            Date startingDate = dateFormat.parse(starting);
            Date endingDate = dateFormat.parse(ending);

            StepRequest stepRequest = new StepRequest(state, description, startingDate, endingDate, projet.getId());
            projetClient.addStepToProject(stepRequest);

            Stage stage = (Stage) descriptionField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd HH:mm:ss' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to add step: " + e.getMessage());
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
