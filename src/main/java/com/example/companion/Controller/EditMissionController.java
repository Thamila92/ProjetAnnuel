package com.example.companion.Controller;

import com.example.companion.ApiClient.MissionClient;
import com.example.companion.Model.Mission;
import com.example.companion.Request.MissionUpdateRequest;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.TextField;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class EditMissionController {

    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;

    private Mission mission;
    private MissionClient missionClient;
    private MissionController missionController;

    public void setMissionClient(MissionClient missionClient) {
        this.missionClient = missionClient;
    }

    public void setMissionController(MissionController missionController) {
        this.missionController = missionController;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
        loadMissionDetails();
    }

    private void loadMissionDetails() {
        descriptionField.setText(mission.getDescription());

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        startingField.setText(dateFormat.format(mission.getStarting()));
        endingField.setText(dateFormat.format(mission.getEnding()));
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

            MissionUpdateRequest updateRequest = new MissionUpdateRequest(description, outputFormat.parse(startingDateString), outputFormat.parse(endingDateString));

            Mission updatedMission = missionClient.updateMission(mission.getId(), updateRequest);
            missionController.updateMissionInList(updatedMission);

            Stage stage = (Stage) descriptionField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the format 'yyyy-MM-dd' for the dates.");
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to save mission changes: " + e.getMessage());
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
