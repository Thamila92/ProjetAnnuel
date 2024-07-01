package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.Model.Evenement;
import com.example.companion.Request.EvenementRequest;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;

public class AddEvenementController {

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

    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
    }

    public void setEvenementController(EvenementController evenementController) {
        this.evenementController = evenementController;
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter ISO_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX");


    @FXML
    public void handleAddEvenement() {
        String type = typeField.getText();
        String location = locationField.getText();
        String description = descriptionField.getText();
        String starting = startingField.getText();
        String ending = endingField.getText();

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        try {
            Date startingDate = dateFormat.parse(starting);
            Date endingDate = dateFormat.parse(ending);

            EvenementRequest newEvenement = new EvenementRequest(type, location, description, startingDate, endingDate);


            Evenement createdEvenement = evenementClient.createEvenement(newEvenement);
            evenementController.addEvenementToList(createdEvenement);

            Stage stage = (Stage) typeField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd'T'HH:mm:ss.SSS'Z'' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to add event: " + e.getMessage());
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
