package com.example.companion.Controller;

import com.example.companion.ApiClient.ProjetClient;
import com.example.companion.Model.Projet;
import com.example.companion.Request.ProjetCreateRequest;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class AddProjetController {

    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;

    private ProjetClient projetClient;
    private ProjetController projetController;

    public void setProjetClient(ProjetClient projetClient) {
        this.projetClient = projetClient;
    }

    public void setProjetController(ProjetController projetController) {
        this.projetController = projetController;
    }
    @FXML
    public void handleAddProjet() {
        String description = descriptionField.getText();
        String starting = startingField.getText();
        String ending = endingField.getText();

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try {
            Date startingDate = dateFormat.parse(starting);
            Date endingDate = dateFormat.parse(ending);
            ProjetCreateRequest newProject = new ProjetCreateRequest(description, startingDate, endingDate);

            System.out.println("Creating project with description: " + description);
            System.out.println("Starting date: " + startingDate);
            System.out.println("Ending date: " + endingDate);

            Projet createdProject = projetClient.createProjet(newProject);
            projetController.addProjetToList(createdProject);

            Stage stage = (Stage) descriptionField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd HH:mm:ss' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to add project: " + e.getMessage());
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
