package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.Model.Evenement;
import com.example.companion.Request.EvenementRequest;
import com.example.companion.Request.ProjetUpdateRequest;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class EditEvenementController {

    @FXML
    private TextField typeField;
    @FXML
    private TextField locationField;
    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;

     private EvenementClient evenementClient;
    private EvenementController evenementController;
private Evenement evenement;
    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
    }

    public void setEvenementController(EvenementController evenementController) {
        this.evenementController = evenementController;
    }

    public void setEvenement(Evenement evenement) {
        this.evenement = evenement;
        populateFields();
    }

    private void populateFields() {
        typeField.setText(evenement.getType());
        locationField.setText(evenement.getLocation());
        descriptionField.setText(evenement.getDescription());
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        startingField.setText(dateFormat.format(evenement.getStarting()));
        endingField.setText(dateFormat.format(evenement.getEnding()));
    }

    @FXML
    public void handleUpdateEvenement() {
        String type = typeField.getText();
        String location = locationField.getText();
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

            EvenementRequest evenementRequest = new EvenementRequest(type,location,description, outputFormat.parse(startingDateString), outputFormat.parse(endingDateString));

            evenementClient.updateEvenement(evenement.getId(), evenementRequest);

            // Update the event in the table view
            evenementController.loadEvenements();

            Stage stage = (Stage) typeField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd HH:mm' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to update event: " + e.getMessage());
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
