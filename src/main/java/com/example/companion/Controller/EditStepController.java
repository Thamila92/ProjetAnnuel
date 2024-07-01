package com.example.companion.Controller;


import com.example.companion.ApiClient.StepClient;
import com.example.companion.Model.Step;
import com.example.companion.Request.StepUpdateRequest;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class EditStepController {

    @FXML
    private TextField stateField;
    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;

    private Step step;
    private StepClient stepClient;
    private StepController stepController;

    public void setStepClient(StepClient stepClient) {
        this.stepClient = stepClient;
    }

    public void setStepController(StepController stepController) {
        this.stepController = stepController;
    }

    public void setStep(Step step) {
        this.step = step;
        loadStepDetails();
    }

    private void loadStepDetails() {
        stateField.setText(step.getState());
        descriptionField.setText(step.getDescription());

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        startingField.setText(dateFormat.format(step.getStarting()));
        endingField.setText(dateFormat.format(step.getEnding()));
    }

    @FXML
    public void handleSaveChanges() {
        String state = stateField.getText();
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

            StepUpdateRequest updateRequest = new StepUpdateRequest(state, description, outputFormat.parse(startingDateString), outputFormat.parse(endingDateString));

            Step updatedStep = stepClient.updateStep(step.getId(), updateRequest);
            stepController.updateStepInList(updatedStep);

            Stage stage = (Stage) descriptionField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to save step changes: " + e.getMessage());
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
