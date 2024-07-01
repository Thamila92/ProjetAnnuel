package com.example.companion.Controller;

import com.example.companion.ApiClient.EvenementClient;
import com.example.companion.ApiClient.AdminClient;
import com.example.companion.ApiClient.SkillClient;
import com.example.companion.ApiClient.StepClient;
import com.example.companion.Model.Evenement;
import com.example.companion.Model.Skill;
import com.example.companion.Model.Step;
import com.example.companion.Request.MissionRequest;
import com.example.companion.Request.SkillRequest;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.stage.Stage;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class AddMissionController {

    @FXML
    private TextField descriptionField;
    @FXML
    private TextField startingField;
    @FXML
    private TextField endingField;
    @FXML
    private ListView<CheckBox> skillsListView;

    private EvenementClient evenementClient;
    private AdminClient adminClient;
    private SkillClient skillClient;
    private Evenement evenement;
    private StepClient stepClient;
    private Step step;
    public void setEvenement(Evenement evenement) {
        this.evenement = evenement;
    }
    public void setStep(Step step) {
        this.step = step;
    }

    public void setStepClient(StepClient stepClient) {
        this.stepClient = stepClient;
    }
    public void setEvenementClient(EvenementClient evenementClient) {
        this.evenementClient = evenementClient;
    }

    public void setAdminClient(AdminClient adminClient) {
        this.adminClient = adminClient;
    }

    public void setSkillClient(SkillClient skillClient) {
        this.skillClient = skillClient;
        loadSkills();
    }

    @FXML
    public void initialize() {
        // Initialize if needed
    }

    private void loadSkills() {
        try {
            List<Skill> availableSkills = skillClient.getAllSkills();
            System.out.println("Available skills: " + availableSkills); // Log available skills
            skillsListView.getItems().clear();
            for (Skill skill : availableSkills) {
                CheckBox checkBox = new CheckBox(skill.getName());
                skillsListView.getItems().add(checkBox);
                System.out.println("Added skill: " + skill.getName()); // Log each added skill
            }
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Failed to load skills: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for more details
        }
    }

    @FXML
    public void handleAddMission() {
        String description = descriptionField.getText();
        String starting = startingField.getText();
        String ending = endingField.getText();

        List<SkillRequest> selectedSkills = new ArrayList<>();
        for (CheckBox checkBox : skillsListView.getItems()) {
            if (checkBox.isSelected()) {
                selectedSkills.add(new SkillRequest(checkBox.getText()));
            }
        }

        SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd");
        SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        try {
            Date startingDate = inputFormat.parse(starting);
            Date endingDate = inputFormat.parse(ending);
            String startingDateString = outputFormat.format(startingDate);
            String endingDateString = outputFormat.format(endingDate);

            // Créez une missionRequest pouvant être utilisée avec un événement ou une étape
            MissionRequest missionRequest = new MissionRequest(
                    outputFormat.parse(startingDateString), outputFormat.parse(endingDateString),
                    description, (evenement != null ? evenement.getId() : null),
                    (step != null ? step.getId() : null), selectedSkills
            );

            if (evenement != null) {
                evenementClient.addMissionToEvent(missionRequest);
            } else if (step != null) {
                evenementClient.addMissionToEvent(missionRequest);
            }

            Stage stage = (Stage) descriptionField.getScene().getWindow();
            stage.close();
        } catch (ParseException e) {
            showAlert("Invalid Date Format", "Please use the correct date format 'yyyy-MM-dd'.");
            e.printStackTrace();
        } catch (IOException | InterruptedException e) {
            showAlert("Error", "Unable to add mission: " + e.getMessage());
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
